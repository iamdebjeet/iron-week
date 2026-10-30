// The user's week: which days are gym / swim / both / rest, and which workout lands on each gym day.
// Pure functions, so they can be unit-tested.
import { DAYS } from "../data/plan";
import type { Day, DayKey, PlanDay, WorkoutId } from "../data/types";

export type DayKind = "gym" | "swim" | "both" | "rest";

export interface WeekSetup {
  days: Record<DayKey, DayKind>;
  /** Minutes after midnight */
  gymStart: number;
  swimStart: number;
  /** Workouts the user picked by hand in My week; days missing here use the automatic order */
  order: Partial<Record<DayKey, WorkoutId>>;
}

export const WEEK: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
export const GYM_MINUTES = 60;
export const SWIM_MINUTES = 40;

export const WORKOUT_ORDER: WorkoutId[] = ["pushA", "pullA", "legsA", "pushB", "pullB", "legsB"];
const LEGS: WorkoutId[] = ["legsA", "legsB"];
/** Each workout's data still lives under the day it was first written for */
export const WORKOUT_SRC: Record<WorkoutId, DayKey> = { pushA: "tue", legsA: "wed", pullA: "thu", legsB: "fri", pushB: "sat", pullB: "sun" };
const REST_SRC: DayKey = "mon";

export const DEFAULT_WEEK: WeekSetup = {
  days: { mon: "swim", tue: "gym", wed: "both", thu: "gym", fri: "both", sat: "gym", sun: "gym" },
  gymStart: 20 * 60,
  swimStart: 20 * 60 + 55,
  order: {},
};

export const hasGym = (k: DayKind) => k === "gym" || k === "both";
export const hasSwim = (k: DayKind) => k === "swim" || k === "both";
/** Tapping a day in the week picker cycles Gym → Swim → Gym+Swim → Rest */
export const nextKind = (k: DayKind): DayKind => (({ gym: "swim", swim: "both", both: "rest", rest: "gym" }) as const)[k];

const srcDay = (key: DayKey): Day => DAYS.find((d) => d.key === key)!;
export const workoutTitle = (w: WorkoutId) => srcDay(WORKOUT_SRC[w]).title;
export const workoutShort = (w: WorkoutId) => workoutTitle(w).split(" · ")[0];
export const isLegs = (w: WorkoutId | undefined) => !!w && LEGS.includes(w);

/**
 * Automatic order: legs go on gym days that also have a swim (to spare the shoulders),
 * then the rest of Push A, Pull A, Legs A, Push B, Pull B, Legs B fill the other gym days in week order.
 * More than 6 gym days repeat the order.
 */
export function autoOrder(days: Record<DayKey, DayKind>): Partial<Record<DayKey, WorkoutId>> {
  const out: Partial<Record<DayKey, WorkoutId>> = {};
  const gymDays = WEEK.filter((d) => hasGym(days[d]));
  const legsLeft = [...LEGS];
  gymDays.filter((d) => days[d] === "both").forEach((d) => { const w = legsLeft.shift(); if (w) out[d] = w; });
  const queue = WORKOUT_ORDER.filter((w) => !Object.values(out).includes(w));
  let i = 0;
  gymDays.filter((d) => !out[d]).forEach((d) => {
    out[d] = i < queue.length ? queue[i] : WORKOUT_ORDER[(i - queue.length) % WORKOUT_ORDER.length];
    i++;
  });
  return out;
}

/** Workout per gym day: the user's manual picks first, then the automatic order */
export function assignWorkouts(week: WeekSetup): Partial<Record<DayKey, WorkoutId>> {
  const auto = autoOrder(week.days);
  const out: Partial<Record<DayKey, WorkoutId>> = {};
  WEEK.forEach((d) => { if (hasGym(week.days[d])) out[d] = week.order[d] ?? auto[d]; });
  return out;
}

export function buildDays(week: WeekSetup): PlanDay[] {
  const assigned = assignWorkouts(week);
  return WEEK.map((key) => {
    const kind = week.days[key];
    const w = assigned[key];
    const short = srcDay(key).short;
    const swim = hasSwim(kind);
    if (!w) {
      const rest = srcDay(REST_SRC);
      return { ...rest, key, short, plan: REST_SRC, swim, rest: true, title: swim ? "Recovery swim" : "Rest day" };
    }
    const src = srcDay(WORKOUT_SRC[w]);
    return { ...src, key, short, plan: src.key, workout: w, swim, rest: undefined };
  });
}

/** Push or pull day that also has a swim: both load the shoulders */
export const shoulderSwimTip = (d: PlanDay) =>
  d.swim && !d.rest && d.workout && !isLegs(d.workout) ? "Shoulder day + swim: keep the swim easy, focus on legs and kick." : null;

export function timeLabel(m: number) {
  const h = Math.floor(m / 60) % 24, mm = m % 60, h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(mm).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}
/** Daily reminder choices: 4:00–9:00 PM every 15 min */
export const REMINDER_TIMES = Array.from({ length: 21 }, (_, i) => 16 * 60 + i * 15);
/** Gym / swim start choices: 5:00 AM–10:55 PM every 5 min */
export const START_TIMES = Array.from({ length: 216 }, (_, i) => 5 * 60 + i * 5);
/** Every 30 min round the clock (quiet hours, water active hours) */
export const HALF_HOURS = Array.from({ length: 48 }, (_, i) => i * 30);
export const rangeLabel = (start: number, minutes: number) => `${timeLabel(start)} – ${timeLabel(start + minutes)}`;
