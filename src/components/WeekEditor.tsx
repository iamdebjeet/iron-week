// Gym / swim times and the per-day workout order, used by the welcome setup and My week.
import React from "react";
import { View } from "react-native";
import type { PlanDay, WorkoutId } from "../data/types";
import { FULL_DAY } from "../logic";
import {
  GYM_MINUTES, START_TIMES, SWIM_MINUTES, WORKOUT_ORDER, type WeekSetup, hasGym, hasSwim, rangeLabel, shoulderSwimTip, timeLabel, workoutTitle,
} from "../logic/plan";
import { useColors } from "../theme";
import { Btn, OptionPicker, T } from "./ui";

export function WeekTimes({ week, onChange }: { week: WeekSetup; onChange: (w: Partial<WeekSetup>) => void }) {
  const kinds = Object.values(week.days);
  const row = (label: string, start: number, minutes: number, set: (m: number) => void) => (
    <View style={{ gap: 6 }}>
      <T variant="label">{label} · {rangeLabel(start, minutes)}</T>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <T variant="muted">Starts at</T>
        <OptionPicker label={`${label} start`} value={start} options={START_TIMES} format={timeLabel} onChange={set} />
        <T variant="muted">· {minutes} min</T>
      </View>
    </View>
  );
  return (
    <View style={{ gap: 14 }}>
      {kinds.some(hasGym) ? row("Gym time", week.gymStart, GYM_MINUTES, (m) => onChange({ gymStart: m })) : null}
      {kinds.some(hasSwim) ? row("Swim time", week.swimStart, SWIM_MINUTES, (m) => onChange({ swimStart: m })) : null}
    </View>
  );
}

/** Which workout is on which gym day. Days not changed by hand follow the automatic order. */
export function WorkoutOrder({ week, plan, onChange }: { week: WeekSetup; plan: PlanDay[]; onChange: (w: Partial<WeekSetup>) => void }) {
  const c = useColors();
  const gymDays = plan.filter((d) => !d.rest && d.workout);
  const manual = Object.keys(week.order).some((d) => hasGym(week.days[d as keyof WeekSetup["days"]]));
  if (!gymDays.length) return <T variant="muted">No gym days this week.</T>;
  return (
    <View style={{ gap: 10 }}>
      {gymDays.map((d) => {
        const tip = shoulderSwimTip(d);
        return (
          <View key={d.key} style={{ gap: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <T variant="bold" style={{ width: 44 }}>{FULL_DAY[d.key].slice(0, 3)}</T>
              <OptionPicker<WorkoutId> label={`Workout on ${FULL_DAY[d.key]}`} value={d.workout!} options={WORKOUT_ORDER} format={workoutTitle}
                onChange={(w) => {
                  // Picking a workout that's already on another day swaps the two, so nothing repeats by accident.
                  const other = gymDays.find((x) => x.key !== d.key && x.workout === w);
                  onChange({ order: { ...week.order, [d.key]: w, ...(other ? { [other.key]: d.workout } : {}) } });
                }} />
              {d.swim ? <T variant="muted" style={{ color: c.pool }}>+ Swim</T> : null}
            </View>
            {tip ? <T variant="muted" style={{ color: c.pool, marginLeft: 54 }}>💡 {tip}</T> : null}
          </View>
        );
      })}
      {manual ? (
        <View style={{ flexDirection: "row" }}>
          <Btn small title="↺ Back to automatic order" onPress={() => onChange({ order: {} })} />
        </View>
      ) : (
        <T variant="muted" style={{ fontSize: 12 }}>Automatic: legs go on your swim days to spare the shoulders. Tap a workout to change it.</T>
      )}
    </View>
  );
}
