// Progress tab: streak, month calendar (gym / swim / both), personal records and this week's muscle summary.
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MUSCLES } from "../data/muscles";
import { type WeeklyRating, weeklyRating } from "../logic";
import { isBodyweight, kgLabel } from "../logic/lifts";
import { type CalStatus, calendarStatus, monthGrid } from "../logic/streak";
import { useProgress } from "../progress";
import { useStore } from "../store";
import { fonts, useColors } from "../theme";
import { WeeklyOverview, useMuscles } from "../components/Panels";
import { Btn, T } from "../components/ui";

const MONTH = (y: number, m: number) => new Date(y, m, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
const shortDate = (d: string) => { const [y, m, dd] = d.split("-").map(Number); return new Date(y, m - 1, dd).toLocaleDateString("en-IN", { day: "numeric", month: "short" }); };
const STATUS_WORDS: Record<CalStatus, string> = { gym: "gym", swim: "swim", both: "gym and swim", rest: "rest", none: "nothing logged" };

export function ProgressScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { history, plan } = useStore();
  const p = useProgress();
  const [y0, m0] = p.today.split("-").map(Number);
  const [ym, setYm] = useState({ y: y0, m: m0 - 1 });
  const [allPrs, setAllPrs] = useState(false);
  const [weekly, setWeekly] = useState(false);
  const M = useMuscles(plan);
  const card = { backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 14, padding: 14, gap: 10 };

  const summaryOf = (d: string) => (d === p.today ? p.todaySummary : history[d]);
  const fill: Record<CalStatus, string> = { gym: c.accent + "55", swim: c.pool + "55", both: c.accent + "55", rest: "transparent", none: "transparent" };
  const grid = monthGrid(ym.y, ym.m);
  const monthDates = grid.flat().filter((d): d is string => !!d);
  const count = (s: CalStatus[]) => monthDates.filter((d) => s.includes(calendarStatus(summaryOf(d)))).length;
  const shift = (n: number) => setYm(({ y, m }) => { const d = new Date(y, m + n, 1); return { y: d.getFullYear(), m: d.getMonth() }; });

  const ratings: Record<"good" | "ok" | "low", string[]> = { good: [], ok: [], low: [] };
  MUSCLES.forEach((m) => { const r: WeeklyRating = weeklyRating(m, M[m].direct); if (r === "good" || r === "ok" || r === "low") ratings[r].push(m); });
  const prs = allPrs ? p.prs : p.prs.slice(0, 5);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32, paddingHorizontal: Math.max(16, insets.left), gap: 14 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <T variant="display" style={{ fontSize: 34 }}>Progress</T>
          <View style={{ borderWidth: 1.5, borderColor: c.accent, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 }} accessible accessibilityLabel={`${p.streak} day streak`}>
            <Text style={{ fontFamily: fonts.bodyBold, color: c.ink, fontSize: 14 }}>🔥 {p.streak}-day streak</Text>
          </View>
        </View>

        {/* Month calendar */}
        <View style={card}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Pressable onPress={() => shift(-1)} accessibilityRole="button" accessibilityLabel="Previous month" style={{ minWidth: 44, minHeight: 44, justifyContent: "center" }}>
              <Text style={{ color: c.ink, fontSize: 20 }}>‹</Text>
            </Pressable>
            <T variant="title">{MONTH(ym.y, ym.m)}</T>
            <Pressable onPress={() => shift(1)} accessibilityRole="button" accessibilityLabel="Next month" style={{ minWidth: 44, minHeight: 44, justifyContent: "center", alignItems: "flex-end" }}>
              <Text style={{ color: c.ink, fontSize: 20 }}>›</Text>
            </Pressable>
          </View>
          <View style={{ flexDirection: "row" }}>
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <Text key={i} maxFontSizeMultiplier={1.4} style={{ flex: 1, textAlign: "center", fontFamily: fonts.bodyBold, fontSize: 11, color: c.muted }}>{d}</Text>)}
          </View>
          {grid.map((week, wi) => (
            <View key={wi} style={{ flexDirection: "row", gap: 4 }}>
              {week.map((d, i) => {
                if (!d) return <View key={i} style={{ flex: 1, aspectRatio: 1 }} />;
                const s = calendarStatus(summaryOf(d));
                const isToday = d === p.today, future = d > p.today;
                return (
                  <View key={d} accessible accessibilityLabel={`${shortDate(d)}: ${future ? "upcoming" : STATUS_WORDS[s]}`}
                    style={{ flex: 1, aspectRatio: 1, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: fill[s],
                      borderWidth: isToday ? 2 : 0, borderColor: c.ink, borderBottomWidth: s === "both" ? 4 : isToday ? 2 : 0, borderBottomColor: s === "both" ? c.pool : c.ink }}>
                    <Text maxFontSizeMultiplier={1.4} style={{ fontFamily: isToday ? fonts.bodyBold : fonts.bodyMedium, fontSize: 13, color: future ? c.muted : c.ink }}>{Number(d.slice(8))}</Text>
                  </View>
                );
              })}
            </View>
          ))}
          <View style={{ flexDirection: "row", gap: 14, flexWrap: "wrap" }}>
            {([["Gym", c.accent, count(["gym", "both"])], ["Swim", c.pool, count(["swim", "both"])]] as const).map(([l, col, n]) => (
              <View key={l} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: col }} />
                <T variant="muted" style={{ fontSize: 12 }}>{l} · {n} days</T>
              </View>
            ))}
            <T variant="muted" style={{ fontSize: 12 }}>Both: yellow with a blue edge</T>
          </View>
        </View>

        {/* Personal records */}
        <View style={card}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <T variant="title">Personal records</T>
            {p.prs.length > 5 ? <Btn small title={allPrs ? "Show less" : `See all ${p.prs.length}`} onPress={() => setAllPrs(!allPrs)} /> : null}
          </View>
          {prs.length ? prs.map((r) => {
            const bw = isBodyweight(r.exercise);
            const prev = r.kind === "reps" ? `${r.prev.reps} reps` : `${kgLabel(r.prev.kg, bw)}`;
            return (
              <View key={r.exercise + r.date} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Text style={{ fontSize: 18 }}>🏆</Text>
                <View style={{ flex: 1 }}>
                  <T variant="bold">{r.exercise}</T>
                  <T variant="muted">{shortDate(r.date)} · before: {prev}</T>
                </View>
                <Text style={{ fontFamily: fonts.display, fontSize: 20, color: c.ink }}>{kgLabel(r.kg, bw)} × {r.reps}</Text>
              </View>
            );
          }) : <T variant="muted">Enter the kg for your sets. When you beat your best weight or estimated max, it shows up here.</T>}
        </View>

        {/* Muscles this week (the planned week, with your sets) */}
        <View style={card}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <T variant="title">Muscles this week</T>
            <Btn small title="Overview ›" onPress={() => setWeekly(true)} />
          </View>
          {([["good", "Good", c.done], ["ok", "OK", c.accentText], ["low", "Low", c.warn]] as const).map(([k, label, col]) => (
            <View key={k} style={{ flexDirection: "row", gap: 10 }}>
              <Text style={{ width: 70, fontFamily: fonts.bodyBold, color: col, fontSize: 14 }}>● {label} · {ratings[k].length}</Text>
              <T variant="muted" style={{ flex: 1 }}>{ratings[k].length ? ratings[k].join(", ").toLowerCase() : "none"}</T>
            </View>
          ))}
        </View>
      </ScrollView>
      <WeeklyOverview visible={weekly} onClose={() => setWeekly(false)} />
    </View>
  );
}
