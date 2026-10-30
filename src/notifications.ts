// Local notifications: timer alerts that fire even when the phone is locked, and daily gym/swim reminders.
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import type { PlanDay } from "./data/types";

const TIMER_CHANNEL = "timers";
const REMINDER_CHANNEL = "reminders";

// While the app is open the timer screen already shows the alert, so play only the sound.
Notifications.setNotificationHandler({
  handleNotification: async (n) => {
    const kind = (n.request.content.data as { kind?: string } | undefined)?.kind;
    const inApp = kind === "timer" || kind === "session";
    return { shouldShowBanner: !inApp, shouldShowList: !inApp, shouldPlaySound: true, shouldSetBadge: false };
  },
});

export async function setupChannels() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(TIMER_CHANNEL, {
    name: "Workout timers",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 400, 200, 400],
    sound: "default",
  });
  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL, {
    name: "Daily reminders",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

/** Schedule one alert per timer step end. Returns ids so they can be cancelled. */
export async function scheduleStepAlerts(steps: { label: string; endsAt: number }[], kind: "timer" | "session" = "timer") {
  const ids: string[] = [];
  const now = Date.now();
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    const seconds = Math.round((s.endsAt - now) / 1000);
    if (seconds < 1) continue;
    const next = steps[i + 1];
    ids.push(
      await Notifications.scheduleNotificationAsync({
        content: {
          title: kind === "session" ? s.label : next ? `Next: ${next.label}` : "Time's up",
          body: kind === "session" ? "" : next ? `${s.label} done.` : `${s.label} done. Go!`,
          sound: "default",
          data: { kind },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, channelId: TIMER_CHANNEL },
      }),
    );
  }
  return ids;
}

export async function cancelIds(ids: string[]) {
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {})));
}

const WEEKDAY: Record<string, number> = { sun: 1, mon: 2, tue: 3, wed: 4, thu: 5, fri: 6, sat: 7 };

/** Replace all daily reminders. Pass enabled=false to just remove them. */
export async function scheduleReminders(enabled: boolean, hour: number, minute: number, days: PlanDay[]) {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter((n) => (n.content.data as { kind?: string } | undefined)?.kind === "reminder")
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
  if (!enabled) return;
  for (const d of days) {
    const title = d.rest ? (d.swim ? "Today: Recovery swim" : "Today: Rest day") : `Today: ${d.title}${d.swim ? " + Swim" : ""}`;
    const body = d.rest
      ? d.swim ? "No gym today. Easy swim, then the recovery stretches." : "No gym or swim today. Rest well; the recovery stretches are there if you want them."
      : d.exercises.slice(0, 3).map((e) => e.name).join(", ") + "… Open Iron Week to start.";
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data: { kind: "reminder" } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: WEEKDAY[d.key], hour, minute, channelId: REMINDER_CHANNEL },
    });
  }
}

/** Monthly nudge to back up: 30 days after the last backup (or from now if there's none), at 10 AM. */
export async function scheduleBackupReminder(enabled: boolean, lastBackup: string | null) {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all.filter((n) => (n.content.data as { kind?: string } | undefined)?.kind === "backup")
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
  if (!enabled) return;
  const when = lastBackup ? new Date(lastBackup) : new Date();
  when.setDate(when.getDate() + 30);
  when.setHours(10, 0, 0, 0);
  if (when.getTime() <= Date.now()) { when.setTime(Date.now()); when.setDate(when.getDate() + 1); when.setHours(10, 0, 0, 0); }
  await Notifications.scheduleNotificationAsync({
    content: { title: "Back up your Iron Week data", body: "It takes a few seconds: Me → Backup / restore → Export.", data: { kind: "backup" } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when, channelId: REMINDER_CHANNEL },
  });
}
