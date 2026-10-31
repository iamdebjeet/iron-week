// Me → Updates: what's installed, "Check for updates", update banners and the auto-install switch.
import React from "react";
import { ScrollView, Switch, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { buildInfo, otaSupported, useAppUpdates } from "../updates";
import { useStore } from "../store";
import { useColors } from "../theme";
import { InfoRow } from "../components/Form";
import { UpdateBanner } from "../components/UpdateBanner";
import { Btn, T } from "../components/ui";

const when = (d: Date) => d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export function UpdatesScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { prefs, setPrefs } = useStore();
  const u = useAppUpdates();
  const b = buildInfo();
  const card = { backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 14, padding: 14, gap: 8 };
  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32, paddingHorizontal: Math.max(16, insets.left), gap: 14 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <T variant="display" style={{ fontSize: 30 }}>Updates</T>
        <Btn title="Done" onPress={() => router.back()} />
      </View>

      <View style={card}>
        <InfoRow label="Version" value={`${b.version} (build ${b.versionCode})`} />
        <InfoRow label="Running" value={b.embedded || !b.createdAt ? "As installed" : `Update from ${when(b.createdAt)}`} />
        {b.channel ? <InfoRow label="Channel" value={b.channel} /> : null}
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Btn kind="primary" title={u.checking ? "Checking…" : "Check for updates"} onPress={() => { if (!u.checking) u.check(); }} />
        {u.lastChecked ? <T variant="muted">Checked {when(u.lastChecked)}</T> : null}
      </View>
      {u.note ? <T variant="muted" style={{ color: c.ink }}>{u.note}</T> : null}
      <UpdateBanner dismissible={false} />

      <View style={[card, { flexDirection: "row", alignItems: "center", gap: 12 }]}>
        <View style={{ flex: 1 }}>
          <T variant="bold">Install updates automatically</T>
          <T variant="muted">Downloads quick updates in the background and applies them when you leave the app, never during a timer.</T>
        </View>
        <Switch value={prefs.autoUpdate} onValueChange={(v) => setPrefs({ autoUpdate: v })} disabled={!otaSupported}
          accessibilityLabel="Install updates automatically" trackColor={{ true: c.done, false: c.line }} />
      </View>

      <T variant="muted" style={{ fontSize: 12 }}>
        Quick updates change the app’s screens and logic without a new install. Bigger changes come as a new APK: you’ll see
        “New version available” here and on Today. Updating never touches your saved data.
        {otaSupported ? "" : " Quick updates only work in the installed app, not in Expo Go or a development build."}
      </T>
    </ScrollView>
  );
}
