// Me → Goals: daily water goal (gym and swim days add to it) and daily step goal.
import React from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GOAL_LABEL } from "../logic/profile";
import { STEP_GOALS } from "../logic/activity";
import { DAY_EXTRA_ML, GOAL_CHOICES, litres } from "../logic/water";
import { useStore } from "../store";
import { useColors } from "../theme";
import { Btn, OptionPicker, T } from "../components/ui";

export function GoalsScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { prefs, setPrefs, setWater, profile } = useStore();
  const card = { backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 14, padding: 14, gap: 10 };
  const base = prefs.water.baseGoalMl;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32, paddingHorizontal: Math.max(16, insets.left), gap: 14 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <T variant="display" style={{ fontSize: 30 }}>Goals</T>
        <Btn title="Done" onPress={() => router.back()} />
      </View>
      <T variant="muted">Main goal: {GOAL_LABEL[profile.goal]} (change it in Me → Edit profile).</T>

      <View style={card}>
        <T variant="title">💧 Water</T>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <T variant="bold">Daily goal</T>
          <OptionPicker label="Daily water goal" value={base} options={GOAL_CHOICES} format={(ml) => `${litres(ml)} L`} onChange={(ml) => setWater({ baseGoalMl: ml })} />
        </View>
        <T variant="muted">
          Rest day {litres(base)} L · gym day {litres(base + DAY_EXTRA_ML)} L · gym + swim day {litres(base + 2 * DAY_EXTRA_ML)} L.
        </T>
      </View>

      <View style={card}>
        <T variant="title">👣 Steps</T>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <T variant="bold">Daily goal</T>
          <OptionPicker label="Daily step goal" value={prefs.stepGoal} options={STEP_GOALS} format={(n) => `${n.toLocaleString("en-IN")} steps`} onChange={(n) => setPrefs({ stepGoal: n })} />
        </View>
        <T variant="muted">Low under {(prefs.stepGoal / 2).toLocaleString("en-IN")}, Good up to the goal, Excellent at the goal.</T>
      </View>
    </ScrollView>
  );
}
