// The user's profile from the welcome setup, and values worked out from it.
export type Gender = "male" | "female" | "unspecified";
export type Goal = "muscle" | "fat" | "fitness";
export type Experience = "beginner" | "some";

export interface Profile {
  name: string;
  gender: Gender;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  goal: Goal;
  experience: Experience;
}

export const DEFAULT_PROFILE: Profile = { name: "", gender: "unspecified", age: null, heightCm: null, weightKg: null, goal: "muscle", experience: "beginner" };

export const GENDER_LABEL: Record<Gender, string> = { male: "Male", female: "Female", unspecified: "Prefer not to say" };
export const GOAL_LABEL: Record<Goal, string> = { muscle: "Build muscle", fat: "Lose fat", fitness: "General fitness" };
export const EXPERIENCE_LABEL: Record<Experience, string> = { beginner: "Beginner", some: "Some experience" };

/** BMI, one decimal; null until height and weight are known. Info only. */
export function bmi(p: Pick<Profile, "heightCm" | "weightKg">): number | null {
  if (!p.heightCm || !p.weightKg) return null;
  const m = p.heightCm / 100;
  return Math.round((p.weightKg / (m * m)) * 10) / 10;
}

/** Parse a number typed into a field; empty or out of range gives null */
export function parseNum(s: string, min: number, max: number): number | null {
  const n = Number(s.replace(",", ".").trim());
  return s.trim() && Number.isFinite(n) && n >= min && n <= max ? n : null;
}

/** Starting goals shown in the welcome setup (editable later in Goals) */
export const BASE_WATER_L = 3;
export const STEP_GOAL = 8000;

export type BmiCategory = "under" | "healthy" | "over" | "obese1" | "obese2" | "obese3";
export const BMI_LABEL: Record<BmiCategory, string> = {
  under: "Underweight", healthy: "Healthy", over: "Overweight", obese1: "Obesity I", obese2: "Obesity II", obese3: "Obesity III",
};
/** WHO adult bands: < 18.5 · 18.5–24.9 · 25.0–29.9 · 30.0–34.9 · 35.0–39.9 · ≥ 40 (on the one-decimal BMI shown) */
export function bmiCategory(b: number): BmiCategory {
  return b < 18.5 ? "under" : b < 25 ? "healthy" : b < 30 ? "over" : b < 35 ? "obese1" : b < 40 ? "obese2" : "obese3";
}
