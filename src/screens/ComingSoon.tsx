// Track / Diet / Progress tabs until their phases land: a designed empty state each.
import React from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "../theme";
import { Icon, type IconName } from "../components/icons";
import { T } from "../components/ui";

function EmptyState({ title, icon, line, items }: { title: string; icon: IconName; line: string; items: string[] }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32, paddingHorizontal: Math.max(16, insets.left), gap: 18 }}>
      <T variant="display" style={{ fontSize: 34 }}>{title}</T>
      <View style={{ borderWidth: 1, borderStyle: "dashed", borderColor: c.line, borderRadius: 14, padding: 22, alignItems: "center", gap: 10 }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 1.5, borderColor: c.accent, alignItems: "center", justifyContent: "center" }}>
          <Icon name={icon} color={c.accentText} size={30} />
        </View>
        <T variant="title" style={{ textAlign: "center" }}>Coming soon</T>
        <T variant="muted" style={{ textAlign: "center" }}>{line}</T>
        <View style={{ alignSelf: "stretch", gap: 6, marginTop: 6 }}>
          {items.map((x) => <T key={x} variant="muted">•  {x}</T>)}
        </View>
      </View>
    </ScrollView>
  );
}

export const TrackScreen = () => (
  <EmptyState title="Track" icon="drop" line="Water, steps, walks, calories and body weight, all in one tab."
    items={["Water strip with smart reminders", "Steps and a walking zone", "Calories burned (estimate)", "Body weight log"]} />
);

export const DietScreen = () => (
  <EmptyState title="Know your diet" icon="fork-knife" line="Log meals from a list of common Indian foods, free and offline."
    items={["Quick type: “2 roti, dal, paneer bhurji”", "Protein, carbs, fat and fibre vs your targets", "Saved meals, recents and barcode scan", "Friendly tips for what to add"]} />
);

export const ProgressScreen = () => (
  <EmptyState title="Progress" icon="chart" line="See your streak, calendar and personal records grow."
    items={["Month calendar: gym, swim or both", "Streak counter", "Personal records with weights", "Weekly muscle summary"]} />
);
