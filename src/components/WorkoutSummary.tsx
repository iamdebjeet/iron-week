// "Workout done" sheet: time, sets, total volume, PRs, muscles worked and a calorie estimate.
import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import type { PlanDay } from "../data/types";
import { fmt, musclesOf, shownName } from "../logic";
import { kgLabel, isBodyweight, volume } from "../logic/lifts";
import { useProgress } from "../progress";
import { useStore } from "../store";
import { useTimer } from "../timer";
import { fonts, useColors } from "../theme";
import { Btn, T } from "./ui";

/** MET for weight training; kcal ≈ MET × kg × hours */
const LIFT_MET = 5.0;

export function WorkoutSummary({ visible, onClose, day, doneSets, totalSets }: { visible: boolean; onClose: () => void; day: PlanDay; doneSets: number; totalSets: number }) {
  const c = useColors();
  const { swaps, profile } = useStore();
  const { todaySessions, prs, today } = useProgress();
  const timer = useTimer();
  const names = day.exercises.map((e, i) => shownName(e, swaps[day.key + i]));
  const sessions = Object.fromEntries(Object.entries(todaySessions).filter(([n]) => names.includes(n)));
  const dayPrs = prs.filter((p) => p.date === today && names.includes(p.exercise));
  const muscles = [...new Set(Object.keys(sessions).flatMap((n) => musclesOf(n)?.main ?? []))];
  const elapsed = 3600 - timer.session.left;
  const hours = elapsed > 60 ? elapsed / 3600 : 1;
  const kcal = Math.round(LIFT_MET * (profile.weightKg ?? 70) * hours);
  const vol = Math.round(volume(sessions));
  const stat = (label: string, value: string) => (
    <View style={{ flex: 1, minWidth: 120, backgroundColor: c.bg, borderRadius: 10, padding: 10 }}>
      <T variant="label">{label}</T>
      <Text style={{ fontFamily: fonts.display, fontSize: 26, color: c.ink }}>{value}</Text>
    </View>
  );
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: c.scrim, justifyContent: "center", padding: 20 }} onPress={onClose}>
        <Pressable onPress={() => {}} style={{ backgroundColor: c.surface, borderRadius: 16, maxHeight: "85%" }}>
          <ScrollView contentContainerStyle={{ padding: 18, gap: 12 }}>
            <T variant="display" style={{ fontSize: 28 }}>Workout done 💪</T>
            <T variant="muted">{day.title}</T>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {stat("Time", elapsed > 60 ? fmt(elapsed) : "–")}
              {stat("Sets", `${doneSets} / ${totalSets}`)}
              {stat("Volume", vol ? `${vol.toLocaleString("en-IN")} kg` : "–")}
              {stat("≈ kcal", `${kcal}`)}
            </View>
            {dayPrs.length ? (
              <View style={{ gap: 4 }}>
                <T variant="label">🏆 New PRs</T>
                {dayPrs.map((p) => (
                  <T key={p.exercise}>{p.exercise}: <Text style={{ fontFamily: fonts.bodyBold }}>{kgLabel(p.kg, isBodyweight(p.exercise))} × {p.reps}</Text></T>
                ))}
              </View>
            ) : null}
            {muscles.length ? <T variant="muted">Worked: {muscles.join(", ")}</T> : null}
            <T variant="muted" style={{ fontSize: 12 }}>
              Calories are a rough estimate (weight training ≈ {LIFT_MET} MET × your weight × {elapsed > 60 ? "session time" : "1 hour"}). Volume counts sets with a weight entered.
            </T>
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}><Btn kind="primary" title="Done" onPress={onClose} /></View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
