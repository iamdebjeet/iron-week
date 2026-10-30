// Steps and calories UI: Today chips, Track cards and the Health Connect notice.
import React from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { openHealthConnectInStore, openHealthSettings } from "../health";
import { STEP_LABEL, kFmt } from "../logic/activity";
import { useActivity } from "../activity";
import { fonts, useColors } from "../theme";
import { Btn, T } from "./ui";

/** What's needed before steps show up, if anything */
export function HealthNotice() {
  const c = useColors();
  const a = useActivity();
  const box = (text: string, action?: React.ReactNode) => (
    <View style={{ borderWidth: 1, borderStyle: "dashed", borderColor: c.line, borderRadius: 10, padding: 10, gap: 8 }}>
      <T variant="muted">{text}</T>{action}
    </View>
  );
  if (a.status === null) return null;
  if (a.status === "expo-go") return box("Steps need the installed Iron Week app (a development build); Expo Go can't read Health Connect. Walks still count with the phone's step sensor.");
  if (a.status === "unsupported") return box("Daily steps come from Health Connect on Android. Walks still count with the phone's step sensor.");
  if (a.status === "not-installed") return box("Steps come from Health Connect. On Android 13 and older it's a free app from the Play Store.", <Btn small kind="primary" title="Get Health Connect" onPress={openHealthConnectInStore} />);
  if (a.status === "update-required") return box("Health Connect needs an update before Iron Week can read steps.", <Btn small kind="primary" title="Update Health Connect" onPress={openHealthConnectInStore} />);
  if (!a.stepsAllowed) {
    return box(
      "Iron Week can read your steps (and active calories, if a watch writes them) from Health Connect. It only reads; nothing leaves your phone.",
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        <Btn small kind="primary" title="Connect Health Connect" onPress={a.connect} />
        <Btn small title="Health Connect settings" onPress={openHealthSettings} />
      </View>,
    );
  }
  return null;
}

function Chip({ label, value, sub, color, onPress, a11y }: { label: string; value: string; sub: string; color: string; onPress: () => void; a11y: string }) {
  const c = useColors();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={a11y}
      style={({ pressed }) => ({ flex: 1, backgroundColor: c.surface, borderWidth: 1.5, borderColor: color, borderRadius: 12, padding: 10, gap: 3, opacity: pressed ? 0.8 : 1 })}>
      <T variant="label" numberOfLines={1}>{label}</T>
      <Text style={{ fontFamily: fonts.display, fontSize: 22, color: c.ink }} numberOfLines={1}>{value}</Text>
      <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 11, color: c.muted }} numberOfLines={1}>{sub}</Text>
    </Pressable>
  );
}

export function StepsChip() {
  const c = useColors();
  const a = useActivity();
  const has = a.steps !== null;
  return (
    <Chip label="👣 Steps" value={has ? kFmt(a.steps!) : "–"} sub={has ? `/ ${kFmt(a.goal)} · ${STEP_LABEL[a.stepStatus]}` : "Connect on Track"}
      color={has ? c[a.stepStatus] : c.line} onPress={() => router.navigate("/track")}
      a11y={has ? `Steps ${a.steps} of ${a.goal}, ${STEP_LABEL[a.stepStatus]}` : "Steps not connected. Open Track"} />
  );
}

export function BurnedChip() {
  const c = useColors();
  const a = useActivity();
  return (
    <Chip label="🔥 Burned" value={`${a.kcal}`} sub={a.kcalSource === "watch" ? "kcal · from your watch" : "kcal · ≈ estimate"} color={c.line}
      onPress={() => router.navigate("/track")} a11y={`About ${a.kcal} kilocalories burned today, ${a.kcalSource === "watch" ? "from your watch" : "estimate"}`} />
  );
}

export function StepsCard() {
  const c = useColors();
  const a = useActivity();
  const has = a.steps !== null;
  const col = has ? c[a.stepStatus] : c.line;
  return (
    <View style={{ backgroundColor: c.surface, borderWidth: 1.5, borderColor: col, borderRadius: 14, padding: 14, gap: 10 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <T variant="label">👣 Steps</T>
        {has ? (
          <View style={{ borderWidth: 1, borderColor: col, borderRadius: 7, paddingHorizontal: 7, paddingVertical: 2 }}>
            <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11, color: c.ink, textTransform: "uppercase" }}>● {STEP_LABEL[a.stepStatus]}</Text>
          </View>
        ) : null}
      </View>
      <Text style={{ fontFamily: fonts.display, fontSize: 34, color: c.ink }}>
        {has ? a.steps!.toLocaleString("en-IN") : "–"} <Text style={{ fontFamily: fonts.body, fontSize: 14, color: c.muted }}>/ {a.goal.toLocaleString("en-IN")} · {a.km.toFixed(1)} km</Text>
      </Text>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: c.line, overflow: "hidden" }}>
        <View style={{ width: `${Math.min(100, ((a.steps ?? 0) / a.goal) * 100)}%`, height: "100%", borderRadius: 4, backgroundColor: col }} />
      </View>
      <HealthNotice />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Btn kind="primary" color={c.done} title="▶ Start a walk" onPress={() => router.push("/walk")} />
        {has ? <T variant="muted" style={{ fontSize: 12 }}>from Health Connect</T> : null}
      </View>
    </View>
  );
}

export function BurnedCard() {
  const c = useColors();
  const a = useActivity();
  const rows: [string, number][] = [["🏋️ Gym", a.burned.gym], ["🏊 Swim", a.burned.swim], ["🚶 Walk", a.burned.walk], ["🧘 Stretch", a.burned.stretch]];
  return (
    <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 14, padding: 14, gap: 8 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <T variant="label">🔥 Burned today</T>
        <T variant="muted" style={{ fontSize: 12 }}>{a.kcalSource === "watch" ? "from your watch" : "≈ estimate"}</T>
      </View>
      <Text style={{ fontFamily: fonts.display, fontSize: 34, color: c.ink }}>{a.kcal} <Text style={{ fontFamily: fonts.body, fontSize: 14, color: c.muted }}>kcal</Text></Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {rows.map(([l, v]) => <T key={l} variant="muted" style={{ color: c.ink }}>{l} {v}</T>)}
      </View>
      <T variant="muted" style={{ fontSize: 12 }}>
        {a.kcalSource === "watch"
          ? `Your watch's active calories. The estimate from your plan would be ≈ ${a.burned.total} kcal.`
          : "Estimate: activity MET × your weight × time (gym 5.0, swim 7.0, recovery swim 6.0, brisk walk 4.3, walk 3.5, stretching 2.3)."}
      </T>
    </View>
  );
}
