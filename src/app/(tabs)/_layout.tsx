// Bottom tabs: Today · Track · Diet · Progress · Me. Labels and icons are set in TabBar.
import React from "react";
import { Redirect } from "expo-router";
import { Tabs } from "expo-router/js-tabs";
import { useStore } from "../../store";
import { useColors } from "../../theme";
import { TabBar } from "../../components/TabBar";

export default function TabsLayout() {
  const c = useColors();
  const { prefs } = useStore();
  // First launch: the welcome setup (it can be skipped; it marks onboarded either way).
  if (!prefs.onboarded) return <Redirect href="/welcome" />;
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.bg } }}>
      <Tabs.Screen name="index" options={{ title: "Today" }} />
      <Tabs.Screen name="track" options={{ title: "Track" }} />
      <Tabs.Screen name="diet" options={{ title: "Diet" }} />
      <Tabs.Screen name="progress" options={{ title: "Progress" }} />
      <Tabs.Screen name="me" options={{ title: "Me" }} />
    </Tabs>
  );
}
