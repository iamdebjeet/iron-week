// Bottom tab bar, with the green mini timer bar on top while a timer runs and the big timer is minimized.
import React from "react";
import { Pressable, Text, View } from "react-native";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { fmt } from "../logic";
import { useTimer } from "../timer";
import { fonts, useColors } from "../theme";
import { Icon, type IconName } from "./icons";

const TABS: Record<string, { label: string; icon: IconName }> = {
  index: { label: "Today", icon: "dumbbell" },
  track: { label: "Track", icon: "drop" },
  diet: { label: "Diet", icon: "fork-knife" },
  progress: { label: "Progress", icon: "chart" },
  me: { label: "Me", icon: "person" },
};

function MiniTimer() {
  const c = useColors();
  const t = useTimer();
  if (t.status === "idle" || t.bigVisible) return null;
  const done = t.status === "done";
  const color = done ? c.accent : c.done;
  const pill = { borderWidth: 1, borderColor: color, borderRadius: 8, paddingHorizontal: 10, minHeight: 36, justifyContent: "center" as const };
  return (
    <Pressable onPress={t.showBig} accessibilityRole="button" accessibilityLabel={`${t.label}, ${done ? "done" : fmt(t.left) + " left"}. Open big timer`}
      style={{ flexDirection: "row", alignItems: "center", gap: 12, marginHorizontal: 10, marginBottom: 8, paddingVertical: 8, paddingHorizontal: 12,
        borderRadius: 12, borderWidth: 1.5, borderColor: color, backgroundColor: done ? c.surface : c.doneSoft }}>
      <Text style={{ fontFamily: fonts.display, fontSize: 28, color: done ? c.accentText : c.done, fontVariant: ["tabular-nums"] }}>{done ? "GO!" : fmt(t.left)}</Text>
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={{ fontFamily: fonts.bodyBold, color: c.ink, fontSize: 13 }}>{t.label}</Text>
        {t.next && !done ? <Text numberOfLines={1} style={{ fontFamily: fonts.body, color: c.muted, fontSize: 12 }}>{t.next}</Text> : null}
      </View>
      {done ? (
        <Pressable onPress={t.stop} hitSlop={6} accessibilityRole="button" accessibilityLabel="Dismiss timer" style={pill}>
          <Text style={{ fontFamily: fonts.bodyBold, color: c.ink }}>Dismiss</Text>
        </Pressable>
      ) : (
        <Pressable onPress={() => t.addTime(15)} hitSlop={6} accessibilityRole="button" accessibilityLabel="Add 15 seconds" style={pill}>
          <Text style={{ fontFamily: fonts.bodyBold, color: c.ink }}>+15s</Text>
        </Pressable>
      )}
      <View style={[pill, { paddingHorizontal: 8 }]} accessibilityElementsHidden importantForAccessibility="no">
        <Text style={{ fontFamily: fonts.bodyBold, color: c.ink, fontSize: 16 }}>⤢</Text>
      </View>
    </Pressable>
  );
}

export function TabBar({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const c = useColors();
  return (
    <View style={{ backgroundColor: c.bg }}>
      <MiniTimer />
      <View style={{ flexDirection: "row", backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.line, paddingBottom: insets.bottom, paddingHorizontal: insets.left }}>
        {state.routes.map((route, i) => {
          const focused = i === state.index;
          const tab = TABS[route.name] ?? { label: descriptors[route.key].options.title ?? route.name, icon: "dumbbell" };
          const color = focused ? c.accentText : c.muted;
          const onPress = () => {
            const e = emitter.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!focused && !e.defaultPrevented) navigateToTab(route.key);
          };
          return (
            <Pressable key={route.key} onPress={onPress} accessibilityRole="tab" accessibilityState={{ selected: focused }} accessibilityLabel={tab.label}
              style={({ pressed }) => ({ flex: 1, alignItems: "center", paddingTop: 8, paddingBottom: 6, minHeight: 56, gap: 2, opacity: pressed ? 0.7 : 1 })}>
              <Icon name={tab.icon} color={color} />
              <Text style={{ fontFamily: focused ? fonts.bodyBold : fonts.bodyMedium, fontSize: 11.5, color }}>{tab.label}</Text>
              <View style={{ width: 18, height: 2.5, borderRadius: 2, backgroundColor: focused ? c.accent : "transparent", marginTop: 1 }} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
