// Muscles-worked section, weekly overview and music buttons.
import React, { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MUSCLES } from "../data/muscles";
import type { PlanDay } from "../data/types";
import { FULL_DAY, MuscleStat, collectMuscles, normalizeSetup, shownName, weeklyRating } from "../logic";
import { useStore } from "../store";
import { weekdayOf } from "../logic/history";
import { fonts, useColors } from "../theme";
import { BodyDiagram } from "./BodyDiagram";
import { Btn, T, openLink } from "./ui";

export function useMuscles(days: PlanDay[]) {
  const { setups, swaps, stretchSetups } = useStore();
  return collectMuscles(
    days,
    (d, i, e) => normalizeSetup(setups[d.plan + i], e),
    (d, i, e) => shownName(e, swaps[d.key + i]),
    stretchSetups,
  );
}

function MuscleCard({ name, x, weekly }: { name: string; x: MuscleStat; weekly: boolean }) {
  const c = useColors();
  const [open, setOpen] = useState(false);
  let chip: [string, string];
  if (weekly) {
    const r = weeklyRating(name, x.direct);
    chip = ({ stretch: ["Stretch focus", c.muted], helper: ["Trained by other lifts", c.muted], good: ["Good", c.done], ok: ["OK", c.accentText], low: ["Low", c.warn] } as const)[r] as [string, string];
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

export function MusclesWorked({ day, onWeekly }: { day: PlanDay; onWeekly: () => void }) {
  const c = useColors();
  const [open, setOpen] = useState(false);
  const M = useMuscles([day]);
  const { walks, today } = useStore();
  const walkedToday = walks.length > 0 && weekdayOf(today) === day.key;
  const list = MUSCLES.filter((m) => M[m].exercises.size || M[m].stretches.size)
    .sort((a, b) => M[b].direct - M[a].direct || M[b].help - M[a].help || M[b].stretches.size - M[a].stretches.size);
  return (
    <View style={{ marginTop: 30, paddingTop: 16, borderTopWidth: 2, borderTopColor: c.ink, gap: 12 }}>
      <Pressable onPress={() => setOpen(!open)} accessibilityRole="button" accessibilityState={{ expanded: open }}
        style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.surface, borderWidth: 1.5, borderStyle: open ? "solid" : "dashed", borderColor: c.accent, borderRadius: 12, padding: 14 }}>
        <View style={{ flex: 1 }}>
          <T variant="display" style={{ fontSize: 24 }}>Muscles worked · {FULL_DAY[day.key]}</T>
          <T variant="muted">{list.length} body parts worked today{walkedToday ? " · 🚶 walk: calves, glutes, hamstrings" : ""}</T>
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
  const { plan } = useStore();
  const M = useMuscles(plan);
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
