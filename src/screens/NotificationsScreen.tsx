// Me → Notifications: on/off for each kind of notification, the daily reminder time and quiet hours.
import React, { useState } from "react";
import { ScrollView, Switch, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { REMINDER_TIMES, timeLabel } from "../logic/plan";
import { isQuiet } from "../logic/time";
import { ensurePermission, scheduleBackupReminder } from "../notifications";
import { type Prefs, useStore } from "../store";
import { useColors } from "../theme";
import { Btn, OptionPicker, T } from "../components/ui";

type Toggle = "timerAlerts" | "reminders" | "waterReminders" | "passAlerts" | "snackReminder" | "backupReminder";
/** Quiet-hours choices: every 30 min round the clock */
const HALF_HOURS = Array.from({ length: 48 }, (_, i) => i * 30);

export function NotificationsScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { prefs, setPrefs, week } = useStore();
  const [msg, setMsg] = useState("");
  const remindAt = prefs.hour * 60 + prefs.minute;
  const snackAt = week.gymStart - 90;

  const toggle = async (key: Toggle, on: boolean) => {
    if (on && !(await ensurePermission())) {
      setMsg("Notifications are blocked. Allow them for Iron Week in your phone's Settings › Apps › Notifications.");
      return;
    }
    setMsg("");
    setPrefs({ [key]: on } as Partial<Prefs>);
    // The others are rescheduled by the providers that own them (root layout, passes, timer).
    if (key === "backupReminder") scheduleBackupReminder(on, prefs.lastBackup).catch(() => {});
  };

  const row = (key: Toggle, title: string, text: string, extra?: React.ReactNode) => (
    <View key={key} style={{ borderTopWidth: 1, borderTopColor: c.line, paddingHorizontal: 14, paddingVertical: 12, gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <T variant="bold">{title}</T>
          <T variant="muted">{text}</T>
        </View>
        <Switch value={prefs[key]} onValueChange={(v) => toggle(key, v)} accessibilityLabel={title} trackColor={{ true: c.done, false: c.line }} />
      </View>
      {prefs[key] && extra ? extra : null}
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32, paddingHorizontal: Math.max(16, insets.left), gap: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <T variant="display" style={{ fontSize: 30 }}>Notifications</T>
        <Btn title="Done" onPress={() => router.back()} />
      </View>
      {msg ? <T variant="muted" style={{ color: c.warn }}>{msg}</T> : null}

      <View style={{ backgroundColor: c.surface, borderRadius: 14, borderWidth: 1, borderColor: c.line, overflow: "hidden" }}>
        <View style={{ marginTop: -1 }}>
          {row("timerAlerts", "Workout timers", "An alert when each rest, stretch or swim step ends, even with the phone locked.")}
          {row("reminders", "Daily reminder", "Today's workout, swim and quote.", (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <T variant="label">Time</T>
              <OptionPicker label="Reminder time" value={remindAt} options={REMINDER_TIMES} format={timeLabel}
                onChange={(m) => setPrefs({ hour: Math.floor(m / 60), minute: m % 60 })} />
              {isQuiet(remindAt, prefs) ? <T variant="muted" style={{ color: c.warn }}>In quiet hours</T> : null}
            </View>
          ))}
          {row("waterReminders", "Water reminders", "Nudges to drink, paused during gym and swim. They start when the water tracker arrives.")}
          {row("passAlerts", "Pass expiry", "2 days before your gym or swim pass runs out, at 10 AM.")}
          {row("snackReminder", "Pre-gym snack", `${timeLabel(Math.max(0, snackAt))} on gym days, 90 min before the gym.${isQuiet(snackAt, prefs) ? " (Skipped: in quiet hours.)" : ""}`)}
          {row("backupReminder", "Backup reminder", "Once a month: back up your Iron Week data.")}
        </View>
      </View>

      <View style={{ backgroundColor: c.surface, borderRadius: 14, borderWidth: 1, borderColor: c.line, padding: 14, gap: 10 }}>
        <T variant="title">Quiet hours</T>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <T variant="muted">From</T>
          <OptionPicker label="Quiet from" value={prefs.quietStart} options={HALF_HOURS} format={timeLabel} onChange={(m) => setPrefs({ quietStart: m })} />
          <T variant="muted">to</T>
          <OptionPicker label="Quiet until" value={prefs.quietEnd} options={HALF_HOURS} format={timeLabel} onChange={(m) => setPrefs({ quietEnd: m })} />
        </View>
        <T variant="muted">No reminders in this time. Workout timers still alert while a session is running.</T>
      </View>
    </ScrollView>
  );
}
