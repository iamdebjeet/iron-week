// Me → Backup / restore: export everything to one file, or restore from one (after a 2-tap confirm).
import React, { useEffect, useRef, useState } from "react";
import { ScrollView, Switch, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { exportBackup, pickBackup, restoreBackup } from "../backup";
import { type Backup, summarize } from "../logic/backup";
import { ensurePermission, scheduleBackupReminder } from "../notifications";
import { useReload } from "../reload";
import { useStore } from "../store";
import { useColors } from "../theme";
import { Btn, T } from "../components/ui";

const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

export function BackupScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { prefs, setPrefs } = useStore();
  const reload = useReload();
  const [busy, setBusy] = useState<"export" | "pick" | "restore" | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [picked, setPicked] = useState<Backup | null>(null);
  const [armed, setArmed] = useState(false);
  const disarm = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (disarm.current) clearTimeout(disarm.current); }, []);
  const card = { backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 14, padding: 14, gap: 10 };

  const onExport = async () => {
    setBusy("export"); setMsg(null);
    try {
      const at = await exportBackup();
      setPrefs({ lastBackup: at });
      await scheduleBackupReminder(prefs.backupReminder, at).catch(() => {});
      setMsg({ text: "Backup ready. Keep the file somewhere safe, like Google Drive.", ok: true });
    } catch (e) {
      setMsg({ text: `Couldn't make the backup. ${(e as Error).message ?? ""}`.trim(), ok: false });
    }
    setBusy(null);
  };

  const onPick = async () => {
    setBusy("pick"); setMsg(null); setPicked(null); setArmed(false);
    const r = await pickBackup().catch((e: Error) => ({ ok: false as const, error: `Couldn't open the file. ${e.message ?? ""}`.trim() }));
    setBusy(null);
    if (r.ok) setPicked(r.backup);
    else if (!("canceled" in r)) setMsg({ text: r.error, ok: false });
  };

  const onRestore = async () => {
    if (!picked) return;
    if (disarm.current) clearTimeout(disarm.current);
    if (!armed) { setArmed(true); disarm.current = setTimeout(() => setArmed(false), 5000); return; }
    setBusy("restore"); setArmed(false);
    try {
      await restoreBackup(picked);
      // Every provider re-reads storage; daily reminders are rescheduled as the app comes back.
      reload();
      router.replace("/");
    } catch (e) {
      setBusy(null);
      setMsg({ text: `Restore didn't finish: ${(e as Error).message ?? "unknown error"}. Try the same file again.`, ok: false });
    }
  };

  const toggleReminder = async (on: boolean) => {
    if (on && !(await ensurePermission())) { setMsg({ text: "Notifications are blocked. Allow them for Iron Week in your phone's settings.", ok: false }); return; }
    setPrefs({ backupReminder: on });
    await scheduleBackupReminder(on, prefs.lastBackup).catch(() => {});
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32, paddingHorizontal: Math.max(16, insets.left), gap: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <T variant="display" style={{ fontSize: 30 }}>Backup</T>
        <Btn title="Done" onPress={() => router.back()} />
      </View>
      <T variant="muted">Everything lives only on this phone. A backup puts it all in one file (your plan, sets, profile, passes and settings) that you can keep on Drive or WhatsApp and restore on a new phone.</T>

      <View style={card}>
        <T variant="title">Export</T>
        <T variant="muted">Last backup: {prefs.lastBackup ? when(prefs.lastBackup) : "never"}</T>
        <View style={{ flexDirection: "row" }}>
          <Btn kind="primary" title={busy === "export" ? "Preparing…" : "💾 Export backup"} onPress={() => { if (!busy) onExport(); }} />
        </View>
      </View>

      <View style={card}>
        <T variant="title">Restore</T>
        <T variant="muted">Pick a backup file you exported before. You’ll see what’s in it before anything changes.</T>
        <View style={{ flexDirection: "row" }}>
          <Btn title={busy === "pick" ? "Opening…" : "📂 Choose backup file"} onPress={() => { if (!busy) onPick(); }} />
        </View>
        {picked ? (
          <View style={{ borderWidth: 1.5, borderColor: c.warn, borderRadius: 12, padding: 12, gap: 6 }}>
            <T variant="bold">Backup from {when(picked.createdAt)}</T>
            {summarize(picked).map((l) => <T key={l} variant="muted" style={{ color: c.ink }}>•  {l}</T>)}
            <T variant="muted" style={{ color: c.warn, marginTop: 4 }}>Restoring replaces everything on this phone now: your plan, sets, profile, passes, today’s ticks and settings.</T>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
              <Btn kind={armed ? "danger" : "plain"} title={busy === "restore" ? "Restoring…" : armed ? "Tap again to replace everything" : "Restore this backup"}
                onPress={() => { if (busy !== "restore") onRestore(); }} />
              <Btn title="Cancel" onPress={() => { setPicked(null); setArmed(false); }} />
            </View>
          </View>
        ) : null}
      </View>

      {msg ? <T variant="muted" style={{ color: msg.ok ? c.done : c.warn }}>{msg.text}</T> : null}

      <View style={[card, { flexDirection: "row", alignItems: "center", gap: 12 }]}>
        <View style={{ flex: 1 }}>
          <T variant="bold">Monthly reminder</T>
          <T variant="muted">“Back up your Iron Week data”, 30 days after your last backup.</T>
        </View>
        <Switch value={prefs.backupReminder} onValueChange={toggleReminder} accessibilityLabel="Monthly backup reminder" trackColor={{ true: c.done, false: c.line }} />
      </View>
    </ScrollView>
  );
}
