// Diet numbers for the screens (useDiet) and the meal being built (DraftProvider), shared by
// Add food, Scan barcode and Custom food so a scanned or typed-in food lands in the same meal.
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { FOODS, type Food, type Unit } from "./data/foods";
import { DAY_ORDER } from "./logic";
import { type DietEntry, type Meal, MEALS, defaultUnit, dietTips, gramsOf, scale, sum, targetsFor } from "./logic/diet";
import { useNow } from "./hooks/useNow";
import { useStore } from "./store";

export function useFoods() {
  const { foodLib } = useStore();
  return useMemo(() => {
    const all = [...foodLib.custom, ...FOODS];
    return { all, byId: Object.fromEntries(all.map((f) => [f.id, f])) as Record<string, Food | undefined> };
  }, [foodLib.custom]);
}

export function useDiet() {
  const { plan, profile, diet, week } = useStore();
  const { byId } = useFoods();
  const now = useNow(60_000);
  const day = plan.find((d) => d.key === DAY_ORDER[now.getDay()])!;
  const t = targetsFor(profile, day);
  const eaten = sum(diet.map((e) => e.n));
  const byMeal = Object.fromEntries(MEALS.map((m) => [m, diet.filter((e) => e.meal === m)])) as Record<Meal, DietEntry[]>;
  const tips = dietTips({ eaten, t, entries: diet, hour: now.getHours(), gymDay: !day.rest, gymStartHour: Math.floor(week.gymStart / 60), foodsById: byId });
  return { day, t, eaten, byMeal, tips, now };
}

/* ---------- the meal being built ---------- */

export interface DraftItem { key: string; food: Food; qty: number; unit: Unit }

interface Draft {
  items: DraftItem[];
  add: (food: Food, qty?: number, unit?: Unit) => void;
  update: (key: string, p: Partial<Pick<DraftItem, "qty" | "unit" | "food">>) => void;
  remove: (key: string) => void;
  clear: () => void;
}
const Ctx = createContext<Draft | null>(null);

export function DraftProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<DraftItem[]>([]);
  const add = useCallback((food: Food, qty = 1, unit?: Unit) => setItems((xs) => [...xs, { key: `${Date.now()}-${xs.length}`, food, qty, unit: unit ?? defaultUnit(food) }]), []);
  const update = useCallback((key: string, p: Partial<Pick<DraftItem, "qty" | "unit" | "food">>) =>
    setItems((xs) => xs.map((x) => {
      if (x.key !== key) return x;
      const next = { ...x, ...p };
      // A new food may not have the old unit
      if (p.food && !p.unit && next.unit !== "g100" && !p.food.units[next.unit]) next.unit = defaultUnit(p.food);
      return next;
    })), []);
  const remove = useCallback((key: string) => setItems((xs) => xs.filter((x) => x.key !== key)), []);
  const clear = useCallback(() => setItems([]), []);
  const value = useMemo(() => ({ items, add, update, remove, clear }), [items, add, update, remove, clear]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDraft() {
  const d = useContext(Ctx);
  if (!d) throw new Error("useDraft must be used inside DraftProvider");
  return d;
}

/** Nutrients of a draft item as eaten */
export const itemNutrients = (x: DraftItem) => scale(x.food.per100, gramsOf(x.food, x.unit, x.qty));
