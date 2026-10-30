// Water reminders: on/off, how often, active hours and the daily goal. Saved on the phone.
import React, { useState } from "react";
import { ScrollView, Switch, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GYM_MINUTES, HALF_HOURS, rangeLabel, timeLabel } from "../logic/plan";
import { DAY_EXTRA_ML, GOAL_CHOICES, INTERVALS, litres } from "../logic/water";
import { ensurePermission } from "../notifications";
import { useStore } from "../store";
import { useWater } from "../water";
import { useColors } from "../theme";
import { Btn, OptionPicker, T } from "../components/ui";

const every = (m: number) => (m === 60 ? "1 hour" : m === 90 ? "1½ hours" : `${m / 60} hours`);

export function WaterRemindersScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { prefs, setPrefs, setWater, week } = useStore();
  const { today, goalMl } = useWater();
  const [msg, setMsg] = useState("");
  const w = prefs.water;
  const card = { backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 14, padding: 14, gap: 12 };
  const line = (label: string, control: React.ReactNode) => (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
      <T variant="bold">{label}</T>{control}
    </View>
  );
  const toggle = async (on: boolean) => {
    if (on && !(await ensurePermission())) { setMsg("Notifications are blocked. Allow them for Iron Week in your phone's settings."); return; }
    setMsg(""); setPrefs({ waterReminders: on });
  };
  const extra = (today.rest ? 0 : DAY_EXTRA_ML) + (today.swim ? DAY_EXTRA_ML : 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32, paddingHorizontal: Math.max(16, insets.left), gap: 14 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <T variant="display" style={{ fontSize: 28 }}>Water reminders</T>
        <Btn title="Done" onPress={() => router.back()} />
      </View>
      {msg ? <T variant="muted" style={{ color: c.warn }}>{msg}</T> : null}

      <View style={card}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <T variant="bold">Remind me</T>
            <T variant="muted">Only when you forget: the timer restarts every time you log a drink.</T>
          </View>
          <Switch value={prefs.waterReminders} onValueChange={toggle} accessibilityLabel="Water reminders" trackColor={{ true: c.done, false: c.line }} />
        </View>
        {line("Every", <OptionPicker label="Remind every" value={w.intervalMin} options={INTERVALS} format={every} onChange={(m) => setWater({ intervalMin: m })} />)}
        {line("From", <OptionPicker label="Reminders from" value={w.activeStart} options={HALF_HOURS} format={timeLabel} onChange={(m) => setWater({ activeStart: m })} />)}
        {line("Until", <OptionPicker label="Reminders until" value={w.activeEnd} options={HALF_HOURS} format={timeLabel} onChange={(m) => setWater({ activeEnd: m })} />)}
        <T variant="muted">
          Paused during the gym ({rangeLabel(week.gymStart, GYM_MINUTES)}) and swim; the big timer shows “💧 Sip water” every 15 min instead. Quiet hours ({timeLabel(prefs.quietStart)}–{timeLabel(prefs.quietEnd)}) apply too.
        </T>
      </View>

      <View style={card}>
        {line("Daily goal", <OptionPicker label="Daily water goal" value={w.baseGoalMl} options={GOAL_CHOICES} format={(ml) => `${litres(ml)} L`} onChange={(ml) => setWater({ baseGoalMl: ml })} />)}
        <T variant="muted">Gym days add {litres(DAY_EXTRA_ML)} L and swim days add {litres(DAY_EXTRA_ML)} L. Today{extra ? ` (+${litres(extra)} L)` : ""}: goal {litres(goalMl)} L.</T>
      </View>

      <View style={card}>
        {line("Speed warning", <T variant="muted">over 1 L / hour</T>)}
        <T variant="muted">Your kidneys clear about 0.8–1 L an hour, so the app warns you if you drink faster than that.</T>
      </View>
    </ScrollView>
  );
}
