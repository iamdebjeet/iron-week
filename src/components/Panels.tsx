// Muscles-worked section, weekly overview, music buttons and reminder settings.
import React, { useState } from "react";
import { Modal, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DAYS } from "../data/plan";
import { HELPER_ONLY, MUSCLES, STRETCH_ONLY } from "../data/muscles";
import type { Day } from "../data/types";
import { FULL_DAY, MuscleStat, collectMuscles, normalizeSetup, shownName } from "../logic";
import { ensurePermission, scheduleReminders } from "../notifications";
import { useStore } from "../store";
import { fonts, useColors } from "../theme";
import { BodyDiagram } from "./BodyDiagram";
import { Btn, OptionPicker, T, openLink } from "./ui";

function useMuscles(days: Day[]) {
  const { setups, swaps, stretchSetups } = useStore();
  return collectMuscles(
    days,
    (d, i, e) => normalizeSetup(setups[d.key + i], e),
    (d, i, e) => shownName(e, swaps[d.key + i]),
    stretchSetups,
  );
}

function MuscleCard({ name, x, weekly }: { name: string; x: MuscleStat; weekly: boolean }) {
  const c = useColors();
  const [open, setOpen] = useState(false);
  let chip: [string, string];
  if (weekly) {
    if ((STRETCH_ONLY as string[]).includes(name)) chip = ["Stretch focus", c.muted];
    else if ((HELPER_ONLY as string[]).includes(name)) chip = ["Trained by other lifts", c.muted];
    else {
      const lo = name === "Abs & core" ? 5 : 6, hi = name === "Abs & core" ? 8 : 10;
      chip = x.direct >= hi ? ["Good", c.done] : x.direct >= lo ? ["OK", c.accentText] : ["Low", c.warn];
    }
  } else chip = x.direct ? ["Main target", c.done] : x.help ? ["Helper", c.accentText] : ["Stretch only", c.muted];
  const stat = (n: number, l: string) => (
    <Text style={{ color: c.ink }}><Text style={{ fontFamily: fonts.display, fontSize: 24 }}>{n}</Text><Text style={{ color: c.muted, fontFamily: fonts.bodyBold, fontSize: 12 }}> {l}{n === 1 ? "" : l === "stretch" ? "es" : "s"}</Text></Text>
  );
  return (
    <Pressable onPress={() => setOpen(!open)} accessibilityRole="button" accessibilityState={{ expanded: open }}
      style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 12, padding: 12 }}>
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <BodyDiagram main={[name]} width={84} />
        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
            <Text style={{ fontFamily: fonts.displayBold, fontSize: 19, color: c.ink, textTransform: "uppercase", flexShrink: 1 }}>{name}</Text>
            <Text style={{ fontSize: 10, fontFamily: fonts.bodyBold, color: chip[1], borderWidth: 1, borderColor: chip[1], borderRadius: 999, paddingHorizontal: 7, paddingVertical: 1, textTransform: "uppercase" }}>{chip[0]}</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 16 }}>{stat(x.exercises.size, "exercise")}{stat(x.stretches.size, "stretch")}</View>
          <T variant="muted" style={{ fontSize: 12 }}>
            {x.exercises.size ? `${x.direct} direct · ${x.help} helper sets` : "No weight exercises"}{x.stretches.size ? ` · ${x.rounds} stretch rounds` : ""}
          </T>
          <T variant="muted" style={{ fontSize: 12 }}>{open ? "Hide list ▴" : "Show list ▾"}</T>
        </View>
      </View>
      {open ? (
        <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: c.line, gap: 6 }}>
          {x.items.map((it, i) => (
            <View key={i} style={{ flexDirection: "row", gap: 8 }}>
              <Text style={{ width: 36, fontFamily: fonts.displayBold, color: it.kind === 2 ? c.accentText : c.ink }}>{weekly ? it.day.toUpperCase() : it.kind === 2 ? "STR" : "EX"}</Text>
              <Text style={{ flex: 1, color: c.ink, fontFamily: fonts.body, fontSize: 13 }}>{it.name}</Text>
              <Text style={{ color: c.muted, fontSize: 11 }}>{it.info}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Pressable>
  );
}

export function MusclesWorked({ day, onWeekly }: { day: Day; onWeekly: () => void }) {
  const c = useColors();
  const [open, setOpen] = useState(false);
  const M = useMuscles([day]);
  const list = MUSCLES.filter((m) => M[m].exercises.size || M[m].stretches.size)
    .sort((a, b) => M[b].direct - M[a].direct || M[b].help - M[a].help || M[b].stretches.size - M[a].stretches.size);
  return (
    <View style={{ marginTop: 30, paddingTop: 16, borderTopWidth: 2, borderTopColor: c.ink, gap: 12 }}>
      <Pressable onPress={() => setOpen(!open)} accessibilityRole="button" accessibilityState={{ expanded: open }}
        style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.surface, borderWidth: 1.5, borderStyle: open ? "solid" : "dashed", borderColor: c.accent, borderRadius: 12, padding: 14 }}>
        <View style={{ flex: 1 }}>
          <T variant="display" style={{ fontSize: 24 }}>Muscles worked · {FULL_DAY[day.key]}</T>
          <T variant="muted">{list.length} body parts worked today</T>
        </View>
        <View style={{ backgroundColor: c.accent, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}>
          <Text style={{ color: c.accentInk, fontFamily: fonts.bodyBold }}>{open ? "Hide ▴" : "Show ▾"}</Text>
        </View>
      </Pressable>
      <View style={{ flexDirection: "row" }}><Btn title="▦ Weekly overview" onPress={onWeekly} /></View>
      {open ? (
        <View style={{ gap: 10 }}>
          <T variant="muted">{day.rest ? "Recovery stretch" : day.title}. Based on this day’s workout and stretching, with the sets and rounds you chose.</T>
          {list.map((m) => <MuscleCard key={m} name={m} x={M[m]} weekly={false} />)}
          <T variant="muted" style={{ fontSize: 12 }}>Main target: the muscle does most of the work. Helper: it assists in another lift. Stretch only: stretched today but not lifted.</T>
        </View>
      ) : null}
    </View>
  );
}

export function WeeklyOverview({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const M = useMuscles(DAYS);
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: 16 + (insets.top || 0) / 2 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 8 }}>
          <T variant="display" style={{ fontSize: 24 }}>Weekly Muscle Overview</T>
          <Btn title="Close ✕" onPress={onClose} />
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 + insets.bottom, gap: 10 }}>
          <T variant="muted">All 7 days together: every exercise and stretch, with the sets and rounds you chose. For most muscles, 10–20 direct sets a week is a good range for growth.</T>
          {MUSCLES.map((m) => <MuscleCard key={m} name={m} x={M[m]} weekly />)}
        </ScrollView>
      </View>
    </Modal>
  );
}

export function MusicButtons() {
  const c = useColors();
  // https links open the installed Spotify / YouTube Music app on Android (verified app links), else the website.
  const b = (label: string, url: string, border: string, text: string) => (
    <Pressable accessibilityRole="link" onPress={() => openLink(url)}
      style={({ pressed }) => ({ borderWidth: 1.5, borderColor: border, borderRadius: 9, paddingVertical: 6, paddingHorizontal: 11, opacity: pressed ? 0.7 : 1 })}>
      <Text style={{ color: text, fontFamily: fonts.bodyBold }}>{label}</Text>
    </Pressable>
  );
  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      {b("♫ Spotify", "https://open.spotify.com/", c.spotify, c.spotifyText)}
      {b("▶ YouTube Music", "https://music.youtube.com/", c.ytm, c.ytmText)}
    </View>
  );
}

const TIMES: number[] = [];
for (let m = 16 * 60; m <= 21 * 60; m += 15) TIMES.push(m);
const timeLabel = (m: number) => {
  const h = Math.floor(m / 60), mm = m % 60, h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(mm).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

export function SettingsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const c = useColors();
  const { prefs, setPrefs } = useStore();
  const [msg, setMsg] = useState("");
  const apply = async (enabled: boolean, minutes: number) => {
    if (enabled && !(await ensurePermission())) {
      setMsg("Notifications are blocked. Allow them for Iron Week in your phone's Settings › Apps › Notifications.");
      setPrefs({ reminders: false });
      return;
    }
    setMsg("");
    setPrefs({ reminders: enabled, hour: Math.floor(minutes / 60), minute: minutes % 60 });
    await scheduleReminders(enabled, Math.floor(minutes / 60), minutes % 60);
    if (enabled) setMsg(`Reminders set for ${timeLabel(minutes)} every day.`);
  };
  const cur = prefs.hour * 60 + prefs.minute;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: c.scrim, justifyContent: "center", padding: 24 }} onPress={onClose}>
        <Pressable style={{ backgroundColor: c.surface, borderRadius: 16, padding: 18, gap: 14 }} onPress={() => {}}>
          <T variant="display" style={{ fontSize: 24 }}>Reminders</T>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <T variant="bold">Daily reminder</T>
              <T variant="muted">Tells you today’s workout and swim, even when the app is closed.</T>
            </View>
            <Switch value={prefs.reminders} onValueChange={(v) => apply(v, cur)} trackColor={{ true: c.done, false: c.line }} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <T variant="label">Time</T>
            <OptionPicker label="Reminder time" value={cur} options={TIMES} format={timeLabel} onChange={(m) => apply(prefs.reminders, m)} />
          </View>
          {msg ? <T variant="muted" style={{ color: c.accentText }}>{msg}</T> : null}
          <T variant="muted" style={{ fontSize: 12 }}>Timers also alert you when the phone is locked: each rest, stretch and swim step ends with a notification.</T>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}><Btn kind="primary" title="Done" onPress={onClose} /></View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
