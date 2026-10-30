export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type Muscle =
  | "Neck" | "Chest" | "Shoulders" | "Triceps" | "Back" | "Biceps" | "Forearms" | "Traps"
  | "Abs & core" | "Lower back" | "Hips" | "Quads" | "Hamstrings" | "Glutes" | "Calves";

export interface Exercise {
  name: string;
  sets: number;
  /** As written in the plan, e.g. "8–10", "10 each side", "max" */
  reps: string;
  /** Rest between sets, in seconds */
  rest: number;
  cues: string[];
}

export interface Day {
  key: string;
  short: string;
  title: string;
  rest?: boolean;
  finisher?: string;
  exercises: Exercise[];
}

export type WorkoutId = "pushA" | "pullA" | "legsA" | "pushB" | "pullB" | "legsB";

/** A calendar day of the user's week, built from their schedule (see logic/plan.ts) */
export interface PlanDay extends Day {
  /** Calendar day: ticks, swaps and labels use this */
  key: DayKey;
  /** Key of the source data in plan.ts / stretches.ts: saved sets, stretch plan and finisher follow the workout */
  plan: string;
  workout?: WorkoutId;
  swim: boolean;
}

export interface Stretch {
  name: string;
  /** hold = seconds held, reps = dynamic reps, time = seconds non-stop */
  type: "hold" | "reps" | "time";
  value: number;
  sides: number;
  /** Seconds per rep, used to time "reps" moves */
  pace: number;
  cues: string[];
  area: string;
  muscles: string[];
}

export interface MuscleUse {
  main: string[];
  helps: string[];
}

export interface SwimBlock {
  name: string;
  minutes: number;
  text: string;
}

/** A rep value: a number, or "max" for as many as you can */
export type Rep = number | "max";

export interface ExerciseSetup {
  sets: number;
  reps: Rep[];
}

export interface StretchSetup {
  rounds: number;
  value: number;
}

/** One step of the timer: a rest, a stretch hold, a swim block... */
export interface TimerStep {
  label: string;
  seconds: number;
  /** Tick id to mark done when this step finishes */
  tick?: string;
}
