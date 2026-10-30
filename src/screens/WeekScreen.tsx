// Me → My week: gym/swim days, times and which workout is on which day. Changes save straight away.
import React from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStore } from "../store";
import { useColors } from "../theme";
import { WeekPicker } from "../components/Form";
import { WeekTimes, WorkoutOrder } from "../components/WeekEditor";
import { Btn, T } from "../components/ui";

export function WeekScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { week, plan, setWeek } = useStore();
  const card = { backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 14, padding: 14, gap: 12 };
  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32, paddingHorizontal: Math.max(16, insets.left), gap: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <T variant="display" style={{ fontSize: 30 }}>My week</T>
        <Btn title="Done" onPress={() => router.back()} />
      </View>
      <View style={card}>
        <T variant="title">Days</T>
        <WeekPicker days={week.days} onChange={(days) => setWeek({ days })} />
      </View>
      <View style={card}>
        <T variant="title">Times</T>
        <WeekTimes week={week} onChange={setWeek} />
      </View>
      <View style={card}>
        <T variant="title">Workout order</T>
        <WorkoutOrder week={week} plan={plan} onChange={setWeek} />
      </View>
      <T variant="muted" style={{ fontSize: 12 }}>Your sets and reps stay with each workout when it moves to another day. Daily reminders follow these days.</T>
    </ScrollView>
  );
}
