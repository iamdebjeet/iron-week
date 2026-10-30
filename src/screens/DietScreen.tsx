// Diet tab: today's kcal and macros vs targets, friendly tips and the meal list. Guidance only.
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FULL_DAY } from "../logic";
import { type BarStatus, type DietEntry, type Meal, MEALS, MEAL_LABEL, barStatus, sum } from "../logic/diet";
import { timeLabel } from "../logic/plan";
import { minutesOf } from "../logic/time";
import { UNIT_LABEL } from "../data/foods";
import { useDiet } from "../diet";
import { useStore } from "../store";
import { fonts, useColors } from "../theme";
import { T } from "../components/ui";

const BAR_LABEL: Record<BarStatus, string> = { low: "Low", good: "Good", excellent: "On target", veryHigh: "High", tooMuch: "Well over" };
const fmtQty = (q: number) => (Number.isInteger(q) ? String(q) : q.toFixed(1).replace(/\.0$/, ""));

function Bar({ label, eaten, target, kind, unit = "g" }: { label: string; eaten: number; target: number; kind: "protein" | "carbs" | "fat" | "fibre"; unit?: string }) {
  const c = useColors();
  const s = barStatus(kind, eaten, target);
  const col = c[s];
  return (
    <View style={{ gap: 4 }} accessible accessibilityLabel={`${label}: ${Math.round(eaten)} of ${target} ${unit}, ${BAR_LABEL[s]}`}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontFamily: fonts.bodyBold, color: c.ink, fontSize: 14 }}>{label}</Text>
        <Text style={{ fontFamily: fonts.bodyMedium, color: c.ink, fontSize: 13 }}>{Math.round(eaten)} / {target} {unit} <Text style={{ color: c.muted }}>· {BAR_LABEL[s]}</Text></Text>
      </View>
      <View style={{ height: 7, borderRadius: 4, backgroundColor: c.line, overflow: "hidden" }}>
        <View style={{ width: `${Math.min(100, target ? (eaten / target) * 100 : 0)}%`, height: "100%", borderRadius: 4, backgroundColor: col }} />
      </View>
    </View>
  );
}

function MealCard({ meal, entries, hint }: { meal: Meal; entries: DietEntry[]; hint?: string }) {
  const c = useColors();
  const { removeDiet } = useStore();
  const [armed, setArmed] = useState<string | null>(null);
  const total = sum(entries.map((e) => e.n));
  const first = entries[0];
  return (
    <View style={{ backgroundColor: c.surface, borderWidth: entries.length ? 1 : 1.5, borderStyle: entries.length ? "solid" : "dashed", borderColor: entries.length ? c.line : meal === "snack" ? c.accent : c.line, borderRadius: 12, padding: 12, gap: 6 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{ width: 22, height: 22, borderRadius: 5, borderWidth: 1.5, borderColor: entries.length ? c.done : c.muted, backgroundColor: entries.length ? c.done : "transparent", alignItems: "center", justifyContent: "center" }}>
          {entries.length ? <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>✓</Text> : null}
        </View>
        <View style={{ flex: 1 }}>
          <T variant="bold">{MEAL_LABEL[meal]}{first ? ` · ${timeLabel(minutesOf(new Date(first.at)))}` : ""}</T>
          {hint && !entries.length ? <T variant="muted">{hint}</T> : null}
        </View>
        {entries.length ? <Text style={{ fontFamily: fonts.display, fontSize: 18, color: c.ink }}>{Math.round(total.kcal)}</Text> : null}
        <Pressable onPress={() => router.push({ pathname: "/add-food", params: { meal } })} accessibilityRole="button" accessibilityLabel={`Add food to ${MEAL_LABEL[meal]}`}
          style={({ pressed }) => ({ borderWidth: 1, borderColor: c.line, borderRadius: 8, paddingHorizontal: 10, minHeight: 36, justifyContent: "center", opacity: pressed ? 0.7 : 1 })}>
          <Text style={{ fontFamily: fonts.bodyBold, color: c.ink }}>+ add</Text>
        </Pressable>
      </View>
      {entries.map((e) => (
        <Pressable key={e.id} onPress={() => setArmed(armed === e.id ? null : e.id)} accessibilityRole="button" accessibilityHint="Tap to remove"
          style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingLeft: 32, minHeight: 30 }}>
          <Text style={{ flex: 1, fontFamily: fonts.body, color: c.muted, fontSize: 13 }} numberOfLines={1}>
            {e.name} · {fmtQty(e.qty)} {UNIT_LABEL[e.unit]} · {Math.round(e.n.protein)} g protein
          </Text>
          {armed === e.id ? (
            <Pressable onPress={() => removeDiet(e.id)} accessibilityRole="button" accessibilityLabel={`Remove ${e.name}`}
              style={{ backgroundColor: c.warn, borderRadius: 7, paddingHorizontal: 8, minHeight: 28, justifyContent: "center" }}>
              <Text style={{ color: "#fff", fontFamily: fonts.bodyBold, fontSize: 12 }}>Remove</Text>
            </Pressable>
          ) : <Text style={{ fontFamily: fonts.bodyMedium, color: c.ink, fontSize: 13 }}>{Math.round(e.n.kcal)}</Text>}
        </Pressable>
      ))}
    </View>
  );
}

export function DietScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { week } = useStore();
  const { day, t, eaten, byMeal, tips } = useDiet();
  const training = !day.rest || day.swim;
  const snackAt = timeLabel(Math.max(0, week.gymStart - 90));
  const kcalStatus = barStatus("kcal", eaten.kcal, t.kcal);
  const proteinLow = barStatus("protein", eaten.protein, t.protein) !== "excellent";

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32, paddingHorizontal: Math.max(16, insets.left), gap: 14 }}>
      <View>
        <T variant="muted">{FULL_DAY[day.key]} · {training ? "training day" : "rest day"}</T>
        <T variant="display" style={{ fontSize: 34 }}>Know your diet</T>
      </View>

      <View style={{ backgroundColor: c.surface, borderWidth: 1.5, borderColor: c[kcalStatus], borderRadius: 14, padding: 14, gap: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <T variant="label">Today so far</T>
          {proteinLow && eaten.kcal > 0 ? (
            <View style={{ borderWidth: 1, borderColor: c.low, borderRadius: 7, paddingHorizontal: 7, paddingVertical: 2 }}>
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11, color: c.ink }}>● PROTEIN LOW</Text>
            </View>
          ) : null}
        </View>
        <Text style={{ fontFamily: fonts.display, fontSize: 34, color: c.ink }}>
          {Math.round(eaten.kcal).toLocaleString("en-IN")} <Text style={{ fontFamily: fonts.body, fontSize: 14, color: c.muted }}>kcal · ~{t.kcal.toLocaleString("en-IN")} on {training ? "training" : "rest"} days</Text>
        </Text>
        <Bar label="Protein" eaten={eaten.protein} target={t.protein} kind="protein" />
        <Bar label="Carbs" eaten={eaten.carbs} target={t.carbs} kind="carbs" />
        <Bar label="Fat" eaten={eaten.fat} target={t.fat} kind="fat" />
        <Bar label="Fibre" eaten={eaten.fibre} target={t.fibre} kind="fibre" />
        <T variant="muted" style={{ fontSize: 12 }}>
          Sodium {Math.round(eaten.sodium).toLocaleString("en-IN")} / under {t.sodium.toLocaleString("en-IN")} mg
          {t.estimated ? " · Targets use 70 kg / 170 cm / 25 y until you add yours in Me → Edit." : ""}
        </T>
      </View>

      {tips.length ? (
        <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 14, padding: 14, gap: 8 }}>
          <T variant="label">💬 Today’s tips</T>
          {tips.map((tip) => <T key={tip} style={{ fontSize: 14 }}>{tip}</T>)}
        </View>
      ) : null}

      {MEALS.filter((m) => m !== "snack" || !day.rest || byMeal.snack.length).map((m) => (
        <MealCard key={m} meal={m} entries={byMeal[m]} hint={m === "snack" ? `~${snackAt} · banana, curd or peanut-butter toast` : undefined} />
      ))}

      <T variant="muted" style={{ fontSize: 12, textAlign: "center", marginTop: 6 }}>
        Guidance only, not medical advice. Follow your doctor if you have a health condition. Food values are approximate.
      </T>
    </ScrollView>
  );
}
