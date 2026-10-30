// Today's water numbers for the screens (useWater), and WaterSync: keeps the one pending water
// reminder up to date and handles the "+250 ml / +500 ml / Snooze" notification buttons.
import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { DAY_ORDER } from "./logic";
import { goalFor, nextReminder, reminderText, speedWarning, statusOf, total, trainingWindows } from "./logic/water";
import { WATER_ACTIONS, scheduleWater } from "./notifications";
import { useNow } from "./hooks/useNow";
import { useStore } from "./store";

const SNOOZE_MIN = 30;

export function useWater() {
  const { plan, prefs, week, water, waterSnooze } = useStore();
  const now = useNow();
  const today = plan.find((d) => d.key === DAY_ORDER[now.getDay()])!;
  const goalMl = goalFor(today, prefs.water.baseGoalMl);
  const ml = total(water);
  const status = statusOf(ml, goalMl);
  const warning = speedWarning(water, now.getTime());
  let next: Date | null = null;
  if (prefs.waterReminders) {
    next = waterSnooze && waterSnooze > now.getTime() ? new Date(waterSnooze) : nextReminder({
      now, lastDrinkAt: water.length ? water[water.length - 1].at : null, status, settings: prefs.water,
      windows: trainingWindows(today, week.gymStart, week.swimStart), quiet: prefs,
    });
  }
  return { today, goalMl, ml, status, warning, next, now };
}

export function WaterSync() {
  const { prefs, plan, addWater, snoozeWater } = useStore();
  const { next, ml, goalMl, now } = useWater();
  const nextAt = next?.getTime() ?? null;
  const todayNum = now.getDate();

  // Reschedule whenever the planned time or the text changes. A reminder for tomorrow morning
  // is written for tomorrow (0 L so far, tomorrow's goal), not with today's total.
  useEffect(() => {
    if (!prefs.onboarded) return;
    if (nextAt === null) { scheduleWater(null, "", "").catch(() => {}); return; }
    const when = new Date(nextAt);
    const sameDay = when.getDate() === todayNum;
    const day = plan.find((d) => d.key === DAY_ORDER[when.getDay()])!;
    const text = sameDay ? reminderText(ml, goalMl) : reminderText(0, goalFor(day, prefs.water.baseGoalMl));
    scheduleWater(when, text.title, text.body).catch(() => {});
  }, [prefs.onboarded, nextAt, todayNum, ml, goalMl, plan, prefs.water.baseGoalMl]);

  // Notification buttons. useLastNotificationResponse also covers a tap that started the app.
  const response = Notifications.useLastNotificationResponse();
  const handled = useRef<string | null>(null);
  useEffect(() => {
    if (!response || response.notification.request.content.data?.kind !== "water") return;
    const id = `${response.notification.request.identifier}:${response.actionIdentifier}`;
    if (handled.current === id) return;
    handled.current = id;
    if (response.actionIdentifier === WATER_ACTIONS.add250) addWater(250);
    else if (response.actionIdentifier === WATER_ACTIONS.add500) addWater(500);
    else if (response.actionIdentifier === WATER_ACTIONS.snooze) snoozeWater(SNOOZE_MIN);
    else router.push("/water");
    Notifications.clearLastNotificationResponse();
  }, [response, addWater, snoozeWater]);

  return null;
}
