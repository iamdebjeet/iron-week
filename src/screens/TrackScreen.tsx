// Track tab: water now; steps, calories and body weight join in later phases.
import React from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DAY_ORDER, FULL_DAY } from "../logic";
import { useNow } from "../hooks/useNow";
import { useStore } from "../store";
import { useColors } from "../theme";
import { WaterCard } from "../components/Water";
import { T } from "../components/ui";

function Soon({ icon, title, text }: { icon: string; title: string; text: string }) {
  const c = useColors();
  return (
    <View style={{ borderWidth: 1, borderStyle: "dashed", borderColor: c.line, borderRadius: 14, padding: 14, gap: 4 }}>
      <T variant="label">{icon} {title}</T>
      <T variant="muted">{text}</T>
    </View>
  );
}

export function TrackScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { plan } = useStore();
  const now = useNow();
  const today = plan.find((d) => d.key === DAY_ORDER[now.getDay()])!;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32, paddingHorizontal: Math.max(16, insets.left), gap: 14 }}>
      <View>
        <T variant="display" style={{ fontSize: 34 }}>Track</T>
        <T variant="muted">{FULL_DAY[today.key]} · {today.rest ? (today.swim ? "swim day" : "rest day") : `training day${today.swim ? " + swim" : ""}`}</T>
      </View>
      <WaterCard />
      <Soon icon="👣" title="Steps" text="Today's steps and a walking zone, coming soon." />
      <Soon icon="🔥" title="Burned today" text="A calorie estimate from your gym, swim and walks, coming soon." />
      <Soon icon="⚖️" title="Body weight" text="Log your weight and see the trend, coming soon." />
    </ScrollView>
  );
}
