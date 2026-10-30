// Water details: progress ring, the bands (yours highlighted), today's log and the last 7 days.
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { localDate } from "../logic";
import { previousDates, weekdayOf } from "../logic/history";
import { timeLabel } from "../logic/plan";
import { minutesOf } from "../logic/time";
import { STATUSES, STATUS_LABEL, bandRange } from "../logic/water";
import { useStore } from "../store";
import { useWater } from "../water";
import { fonts, useColors } from "../theme";
import { AddRow, type ChartDay, WaterRing, WaterWeekChart, statusColor } from "../components/Water";
import { Btn, T } from "../components/ui";

const SHORT: Record<string, string> = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };

export function WaterScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { water, history } = useStore();
  const { ml, goalMl, status, warning, now } = useWater();
  const [all, setAll] = useState(false);
  const card = { backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 14, padding: 14, gap: 8 };
  const log = [...water].reverse();
  const today = localDate(now);
  const days: ChartDay[] = [
    ...previousDates(today, 6).map((d) => ({ date: d, label: SHORT[weekdayOf(d)], ml: history[d]?.waterMl ?? 0, goalMl: history[d]?.waterGoalMl ?? goalMl, today: false })),
    { date: today, label: "Today", ml, goalMl, today: true },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32, paddingHorizontal: Math.max(16, insets.left), gap: 14 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <T variant="display" style={{ fontSize: 30 }}>Water</T>
        <Btn title="Close ✕" onPress={() => router.back()} />
      </View>

      <View style={{ alignItems: "center", gap: 10 }}>
        <WaterRing ml={ml} goalMl={goalMl} />
        {warning ? <T variant="bold" style={{ textAlign: "center" }}>⚠ {warning}</T> : null}
      </View>
      <AddRow />

      <View style={card}>
        {STATUSES.map((s) => {
          const me = s === status;
          return (
            <View key={s} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6, paddingHorizontal: 8, borderRadius: 8, backgroundColor: me ? c.bg : "transparent" }}>
              <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: statusColor(c, s) }} />
              <Text style={{ width: 84, fontFamily: me ? fonts.bodyBold : fonts.bodyMedium, color: c.ink, fontSize: 14 }}>{STATUS_LABEL[s]}</Text>
              <Text style={{ flex: 1, fontFamily: fonts.body, color: c.muted, fontSize: 13 }}>{bandRange(s, goalMl)}{me ? "  ← you" : ""}</Text>
            </View>
          );
        })}
      </View>

      <View style={card}>
        <T variant="label">Today</T>
        {log.length ? (all ? log : log.slice(0, 3)).map((e, i) => (
          <View key={e.at + ":" + i} style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <T variant="muted" style={{ fontSize: 14, color: c.ink }}>{timeLabel(minutesOf(new Date(e.at)))}</T>
            <T variant="bold">+ {e.ml} ml</T>
          </View>
        )) : <T variant="muted">Nothing logged yet today.</T>}
        {log.length > 3 ? (
          <Pressable onPress={() => setAll(!all)} accessibilityRole="button" style={{ minHeight: 36, justifyContent: "center" }}>
            <T variant="muted">{all ? "Show less ▴" : `+ ${log.length - 3} more · Show all ▾`}</T>
          </Pressable>
        ) : null}
      </View>

      <View style={card}>
        <T variant="label">Last 7 days</T>
        <WaterWeekChart days={days} />
      </View>

      <View style={{ flexDirection: "row" }}>
        <Btn title="⏰ Reminder settings" onPress={() => router.push("/water-reminders")} />
      </View>
    </ScrollView>
  );
}
