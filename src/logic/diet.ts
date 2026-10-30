// Diet: portions, search, the quick-type parser, daily targets and friendly tips. Pure functions.
import type { Food, Nutrients, Unit } from "../data/foods";
import type { PlanDay } from "../data/types";
import type { Profile } from "./profile";

export type Meal = "breakfast" | "lunch" | "snack" | "dinner" | "other";
export const MEALS: Meal[] = ["breakfast", "lunch", "snack", "dinner", "other"];
export const MEAL_LABEL: Record<Meal, string> = { breakfast: "Breakfast", lunch: "Lunch", snack: "Pre-gym snack", dinner: "Dinner", other: "Other" };

/** One logged portion. Nutrients are stored as eaten, so later edits to a custom food don't change past days. */
export interface DietEntry { id: string; meal: Meal; foodId: string; name: string; qty: number; unit: Unit; grams: number; at: number; n: Nutrients }
export interface SavedMeal { id: string; name: string; items: { foodId: string; qty: number; unit: Unit }[] }

export const ZERO: Nutrients = { kcal: 0, protein: 0, carbs: 0, fat: 0, fibre: 0, sodium: 0, iron: 0, calcium: 0 };
const KEYS = ["kcal", "protein", "carbs", "fat", "fibre", "sodium", "iron", "calcium"] as const;

export const gramsOf = (f: Food, unit: Unit, qty: number) => (unit === "g100" ? 100 : f.units[unit] ?? 100) * qty;
export const defaultUnit = (f: Food) => Object.keys(f.units)[0] as Unit;

export function scale(per100: Nutrients, grams: number): Nutrients {
  const out = { ...ZERO };
  for (const k of KEYS) out[k] = ((per100[k] ?? 0) * grams) / 100;
  return out;
}
export function sum(list: Nutrients[]): Nutrients {
  const out = { ...ZERO };
  for (const x of list) for (const k of KEYS) out[k] = (out[k] ?? 0) + (x[k] ?? 0);
  return out;
}

/* ---------- search ---------- */

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

/** Edit distance, stopping early once it's above `max` (for typos like "panir", "chapathi") */
function closeEnough(a: string, b: string, max: number) {
  if (Math.abs(a.length - b.length) > max) return false;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      best = Math.min(best, cur[j]);
    }
    if (best > max) return false;
    prev = cur;
  }
  return prev[b.length] <= max;
}

function scoreName(q: string, name: string): number {
  const n = norm(name);
  if (n === q) return 100;
  if (n.startsWith(q)) return 85;
  const words = n.split(" ");
  const qs = q.split(" ");
  if (qs.every((w) => words.some((x) => x.startsWith(w)))) return 70;
  if (n.includes(q)) return 55;
  // Typos: 1 for 4-letter words, 2 for longer ones, against the whole word or its start ("panir" → paneer)
  const typo = (w: string, x: string) => {
    if (w.length < 4) return false;
    const max = w.length >= 5 ? 2 : 1;
    return closeEnough(w, x, max) || closeEnough(w, x.slice(0, w.length), max - 1);
  };
  if (qs.every((w) => words.some((x) => typo(w, x)))) return 40;
  return 0;
}

/** Foods matching a search, best first: names and aliases, prefixes, and small typos */
export function searchFoods(query: string, foods: Food[], limit = 8): Food[] {
  const q = norm(query);
  if (!q) return [];
  // Also try the singular ("eggs" → "egg", "idlis" → "idli")
  const single = q.split(" ").map((w) => (w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w)).join(" ");
  const score = (name: string) => Math.max(scoreName(q, name), single !== q ? scoreName(single, name) : 0);
  return foods
    .map((f) => ({ f, s: Math.max(score(f.name), ...f.aliases.map((a) => score(a) - 2)) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.f.name.length - b.f.name.length)
    .slice(0, limit)
    .map((x) => x.f);
}

/* ---------- quick type: "2 roti, dal, paneer bhurji" ---------- */

const NUMBER_WORDS: Record<string, number> = { half: 0.5, "½": 0.5, one: 1, two: 2, three: 3, four: 4, five: 5, a: 1, an: 1 };
const UNIT_WORDS: Record<string, Unit> = {
  piece: "piece", pieces: "piece", pc: "piece", pcs: "piece", nos: "piece",
  katori: "katori", katoris: "katori", bowl: "katori", bowls: "katori",
  cup: "cup", cups: "cup", glass: "glass", glasses: "glass", plate: "plate", plates: "plate",
  slice: "slice", slices: "slice", tbsp: "tbsp", spoon: "tbsp", spoons: "tbsp", tsp: "tsp",
  scoop: "scoop", scoops: "scoop", handful: "handful", handfuls: "handful", serving: "serving",
};

export interface ParsedItem { text: string; qty: number; unit: Unit | null; grams: number | null; matches: Food[] }

/** Split on commas, "and", "&", "+", new lines; read a leading number and unit; match the rest locally */
export function parseQuick(text: string, foods: Food[]): ParsedItem[] {
  return text
    .split(/,|\n|\+|&|\band\b/i)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((part) => {
      let rest = part.toLowerCase();
      let qty = 1, unit: Unit | null = null, grams: number | null = null;
      const g = rest.match(/^(\d+(?:\.\d+)?)\s*(g|gm|gms|gram|grams)\b\s*/);
      if (g) { grams = Number(g[1]); rest = rest.slice(g[0].length); }
      else {
        const m = rest.match(/^(\d+(?:\.\d+)?|½|half|one|two|three|four|five|an?)\s+/);
        if (m) { qty = NUMBER_WORDS[m[1]] ?? Number(m[1]); rest = rest.slice(m[0].length); }
        const u = rest.match(/^([a-z]+)\s+(?:of\s+)?/);
        if (u && UNIT_WORDS[u[1]]) { unit = UNIT_WORDS[u[1]]; rest = rest.slice(u[0].length); }
      }
      return { text: part, qty, unit, grams, matches: searchFoods(rest, foods, 4) };
    });
}

/** Turn a parsed line + the chosen food into qty/unit that food supports */
export function resolveItem(p: ParsedItem, f: Food): { qty: number; unit: Unit } {
  if (p.grams !== null) return { qty: p.grams / 100, unit: "g100" };
  if (p.unit && (p.unit === "g100" || f.units[p.unit])) return { qty: p.qty, unit: p.unit };
  return { qty: p.qty, unit: defaultUnit(f) };
}

/* ---------- targets ---------- */

export interface Targets { resting: number; kcal: number; protein: number; carbs: number; fat: number; fibre: number; sodium: number; estimated: boolean }

/** Resting calories (Mifflin–St Jeor): men 10w + 6.25h − 5a + 5, women … − 161, prefer not to say … − 78 */
export function restingKcal(w: number, h: number, a: number, gender: Profile["gender"]) {
  return 10 * w + 6.25 * h - 5 * a + (gender === "male" ? 5 : gender === "female" ? -161 : -78);
}

/** A training day has a gym session or a swim */
export const isTrainingDay = (d: Pick<PlanDay, "rest" | "swim">) => !d.rest || d.swim;

/**
 * Today's targets (guidance): resting × 1.55 on training days / 1.375 on rest days, then +250 (build muscle) /
 * −300 (lose fat) / 0, never below resting. Protein 1.6 g/kg (1.2 for general fitness), fat ≈ 25% of kcal,
 * carbs the rest, fibre 30 g (men) / 25 g, sodium under 2,000 mg. Missing body stats use 70 kg / 170 cm / 25 y.
 */
export function targetsFor(p: Profile, day: Pick<PlanDay, "rest" | "swim">): Targets {
  const w = p.weightKg ?? 70, h = p.heightCm ?? 170, a = p.age ?? 25;
  const resting = restingKcal(w, h, a, p.gender);
  const adjust = p.goal === "muscle" ? 250 : p.goal === "fat" ? -300 : 0;
  const kcal = Math.round(Math.max(resting, resting * (isTrainingDay(day) ? 1.55 : 1.375) + adjust));
  const protein = Math.round(w * (p.goal === "fitness" ? 1.2 : 1.6));
  const fat = Math.round((kcal * 0.25) / 9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return {
    resting: Math.round(resting), kcal, protein, carbs, fat,
    fibre: p.gender === "male" ? 30 : 25, sodium: 2000, estimated: !p.weightKg || !p.heightCm || !p.age,
  };
}

export type BarStatus = "low" | "good" | "excellent" | "veryHigh" | "tooMuch";
/** Protein and fibre: more is fine. Carbs and fat: on target is best. */
export function barStatus(kind: "protein" | "fibre" | "carbs" | "fat" | "kcal", eaten: number, target: number): BarStatus {
  const r = target ? eaten / target : 0;
  if (kind === "protein" || kind === "fibre") return r < 0.5 ? "low" : r < 0.9 ? "good" : "excellent";
  return r < 0.5 ? "low" : r < 0.85 ? "good" : r <= 1.1 ? "excellent" : r <= 1.3 ? "veryHigh" : "tooMuch";
}

/* ---------- tips ---------- */

const PROTEIN_IDEAS = "100 g paneer, 2 eggs or a bowl of chana adds ~15–20 g";

/** Up to 3 short, positive tips: what to add, never what's "bad" */
export function dietTips(args: { eaten: Nutrients; t: Targets; entries: DietEntry[]; hour: number; gymDay: boolean; gymStartHour: number; foodsById: Record<string, Food | undefined> }): string[] {
  const { eaten: e, t, entries, hour } = args;
  const tips: string[] = [];
  const nextMeal = hour < 11 ? "breakfast" : hour < 16 ? "lunch" : "dinner";
  if (e.protein >= t.protein * 0.9) tips.push("Protein target reached today 👍");
  else if (hour >= 11 || entries.length) tips.push(`Add protein at ${nextMeal}: ${PROTEIN_IDEAS}.`);
  if (e.fibre >= t.fibre) tips.push("Fibre is good 👍");
  else if (hour >= 14 && e.fibre < t.fibre * 0.5) tips.push("Add some fibre: a bowl of salad, sprouts or a fruit.");
  if (e.sodium > t.sodium) {
    const salty = [...new Set(entries.filter((x) => x.n.sodium >= 300).map((x) => x.name.split(" (")[0].toLowerCase()))].slice(0, 2);
    tips.push(`Sodium a bit high${salty.length ? ` (${salty.join(", ")})` : ""}: drink extra water today.`);
  }
  if (args.gymDay && hour < args.gymStartHour && hour >= args.gymStartHour - 3 && !entries.some((x) => x.meal === "snack"))
    tips.push("Pre-gym snack about 90 min before: a banana, curd or peanut-butter toast.");
  if (hour >= 19 && e.kcal < t.kcal * 0.6 && args.gymDay) tips.push("You trained today: a proper dinner with carbs and protein helps recovery.");
  return tips.slice(0, 3);
}

/** Open Food Facts product → a Food (per 100 g). Returns null if there's no usable energy value. */
export function foodFromOff(code: string, p: Record<string, unknown>): Food | null {
  const nm = (p.nutriments ?? {}) as Record<string, number | undefined>;
  const kcal = nm["energy-kcal_100g"] ?? (nm["energy_100g"] !== undefined ? (nm["energy_100g"] as number) / 4.184 : undefined);
  if (kcal === undefined || !Number.isFinite(kcal)) return null;
  const name = [p.product_name, p.brands].filter((x) => typeof x === "string" && x).join(" · ") || `Product ${code}`;
  const serving = typeof p.serving_quantity === "number" && p.serving_quantity > 0 ? p.serving_quantity : typeof p.serving_quantity === "string" ? Number(p.serving_quantity) : 0;
  return {
    id: `scan-${code}`, name: String(name).slice(0, 60), aliases: [], source: "scan", barcode: code,
    per100: {
      kcal: Math.round(kcal), protein: nm.proteins_100g ?? 0, carbs: nm.carbohydrates_100g ?? 0, fat: nm.fat_100g ?? 0,
      fibre: nm.fiber_100g ?? 0, sodium: Math.round((nm.sodium_100g ?? (nm.salt_100g ?? 0) / 2.5) * 1000),
    },
    units: serving > 0 ? { serving, g100: 100 } : { g100: 100 },
  };
}
