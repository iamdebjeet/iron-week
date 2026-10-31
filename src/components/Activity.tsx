// Steps and calories UI: Today chips, Track cards and the Health Connect notice.
import React from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { openHealthConnectInStore, openHealthSettings } from "../health";
import { MET, STEP_LABEL, kFmt, walkMinutes } from "../logic/activity";
import { previousDates, weekdayOf } from "../logic/history";
import { useStore } from "../store";
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

const SHORT: Record<string, string> = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };
const mins = (m: number) => `${Math.round(m)} min`;

/** Calories burned today, per activity (minutes, what was done, MET, kcal), plus the last 7 days */
export function BurnedCard() {
  const c = useColors();
  const a = useActivity();
  const { history, today, profile } = useStore();
  const m = a.minutes;
  const walkMin = a.walks.reduce((x, w) => x + walkMinutes(w), 0);
  const brisk = a.walks.some((w) => w.brisk);
  const rows = [
    { icon: "🏋️", name: "Workout", kcal: a.burned.gym, met: MET.lifting, color: c.accent,
      detail: m.gymMin ? `${mins(m.gymMin)} · ${a.workout?.done ?? 0}/${a.workout?.total ?? 0} sets` : "Tick a set to count it" },
    { icon: "🏊", name: m.recoverySwim ? "Recovery swim" : "Swimming", kcal: a.burned.swim, met: m.recoverySwim ? MET.recoverySwim : MET.swim, color: c.pool,
      detail: m.swimMin ? `${mins(m.swimMin)} of swim blocks` : "Tick swim blocks to count them" },
    { icon: "🚶", name: "Walking", kcal: a.burned.walk, met: brisk ? MET.briskWalk : MET.walk, color: c.done,
      detail: walkMin ? `${mins(walkMin)} · ${a.walks.length} walk${a.walks.length === 1 ? "" : "s"}${brisk ? " · brisk" : ""}` : "Start a walk to count it" },
    { icon: "🧘", name: "Stretching", kcal: a.burned.stretch, met: MET.stretch, color: c.good,
      detail: m.stretchMin ? `${mins(m.stretchMin)} · ${a.stretch.done}/${a.stretch.total} rounds` : "Tick stretches to count them" },
  ];
  const max = Math.max(1, ...rows.map((r) => r.kcal));
  const week = [...previousDates(today, 6), today].map((d) => ({
    d, label: d === today ? "Today" : SHORT[weekdayOf(d)], kcal: d === today ? a.kcal : history[d]?.kcal ?? 0,
  }));
  const weekMax = Math.max(1, ...week.map((x) => x.kcal));

  return (
    <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 14, padding: 14, gap: 10 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <T variant="label">🔥 Burned today</T>
        <T variant="muted" style={{ fontSize: 12 }}>{a.kcalSource === "watch" ? "from your watch" : "≈ estimate"}</T>
      </View>
      <Text style={{ fontFamily: fonts.display, fontSize: 34, color: c.ink }}>
        {a.kcal} <Text style={{ fontFamily: fonts.body, fontSize: 14, color: c.muted }}>kcal{a.kcalSource === "watch" ? ` · plan estimate ≈ ${a.burned.total}` : ""}</Text>
      </Text>

      {rows.map((r) => (
        <View key={r.name} style={{ gap: 4 }} accessible accessibilityLabel={`${r.name}: about ${r.kcal} kilocalories. ${r.detail}`}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ fontSize: 16, width: 22 }}>{r.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.bodyBold, color: c.ink, fontSize: 14 }}>{r.name}</Text>
              <Text style={{ fontFamily: fonts.body, color: c.muted, fontSize: 12 }}>{r.detail} · MET {r.met}</Text>
            </View>
            <Text style={{ fontFamily: fonts.display, color: r.kcal ? c.ink : c.muted, fontSize: 18 }}>{r.kcal}</Text>
          </View>
          <View style={{ height: 6, marginLeft: 30, borderRadius: 3, backgroundColor: c.line, overflow: "hidden" }}>
            <View style={{ width: `${(r.kcal / max) * 100}%`, height: "100%", borderRadius: 3, backgroundColor: r.color }} />
          </View>
        </View>
      ))}

      <View style={{ borderTopWidth: 1, borderTopColor: c.line, paddingTop: 10, gap: 6 }}>
        <T variant="label">Last 7 days</T>
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6, height: 70 }}>
          {week.map((x) => (
            <View key={x.d} style={{ flex: 1, alignItems: "center", justifyContent: "flex-end", height: "100%" }}
              accessible accessibilityLabel={`${x.label}: ${x.kcal} kilocalories`}>
              <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 9, color: c.muted }}>{x.kcal || ""}</Text>
              <View style={{ width: "70%", height: Math.max(x.kcal ? 4 : 0, (x.kcal / weekMax) * 48), borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: x.label === "Today" ? c.accent : c.warn }} />
            </View>
          ))}
        </View>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {week.map((x) => <Text key={x.d} style={{ flex: 1, textAlign: "center", fontFamily: x.label === "Today" ? fonts.bodyBold : fonts.body, fontSize: 10, color: x.label === "Today" ? c.ink : c.muted }}>{x.label}</Text>)}
        </View>
      </View>

      <T variant="muted" style={{ fontSize: 12 }}>
        Estimate: MET × your weight ({profile.weightKg ?? 70} kg{profile.weightKg ? "" : ", add yours in Me"}) × time. Workout time comes from the session timer, or 60 min × the share of sets done.
        {a.kcalSource === "watch" ? " The total uses your watch's active calories from Health Connect." : ""}
      </T>
    </View>
  );
}
