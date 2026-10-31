import { FOODS } from "../../data/foods";
import { gramsOf, parseQuick, resolveItem, restingKcal, scale, searchFoods, targetsFor } from "../diet";
import { DEFAULT_PROFILE, type Profile } from "../profile";

const me: Profile = { ...DEFAULT_PROFILE, gender: "male", age: 26, heightCm: 172, weightKg: 70, goal: "muscle" };
const training = { rest: false, swim: false };
const rest = { rest: true, swim: false };

describe("Mifflin–St Jeor and targets", () => {
  test("resting calories: men +5, women −161, prefer not to say −78", () => {
    expect(restingKcal(70, 172, 26, "male")).toBe(1650);
    expect(restingKcal(70, 172, 26, "female")).toBe(1484);
    expect(restingKcal(70, 172, 26, "unspecified")).toBe(1567);
  });

  test("training ×1.55 / rest ×1.375, +250 to build muscle", () => {
    expect(targetsFor(me, training).kcal).toBe(Math.round(1650 * 1.55 + 250));
    expect(targetsFor(me, rest).kcal).toBe(Math.round(1650 * 1.375 + 250));
  });

  test("a swim-only day counts as a training day", () => {
    expect(targetsFor(me, { rest: true, swim: true }).kcal).toBe(targetsFor(me, training).kcal);
  });

  test("never below resting calories", () => {
    const tiny: Profile = { ...me, gender: "female", weightKg: 40, heightCm: 145, age: 60, goal: "fat" };
    const t = targetsFor(tiny, rest);
    expect(t.kcal).toBeGreaterThanOrEqual(t.resting);
  });

  test("protein 1.6 g/kg (1.2 for general fitness), fat 25%, carbs the rest", () => {
    const t = targetsFor(me, training);
    expect(t.protein).toBe(112);
    expect(targetsFor({ ...me, goal: "fitness" }, training).protein).toBe(84);
    expect(t.fat).toBe(Math.round((t.kcal * 0.25) / 9));
    expect(t.carbs).toBe(Math.round((t.kcal - t.protein * 4 - t.fat * 9) / 4));
    expect(t.fibre).toBe(30);
    expect(targetsFor({ ...me, gender: "female" }, training).fibre).toBe(25);
    expect(t.sodium).toBe(2000);
  });

  test("missing body stats fall back to 70 kg / 170 cm / 25 y and say so", () => {
    expect(targetsFor(DEFAULT_PROFILE, training).estimated).toBe(true);
    expect(targetsFor(me, training).estimated).toBe(false);
  });
});

describe("food search", () => {
  const first = (q: string) => searchFoods(q, FOODS)[0]?.id;
  test("names, Hindi aliases, typos and plurals", () => {
    expect(first("roti")).toBe("roti");
    expect(first("chapathi")).toBe("roti");
    expect(first("dahi")).toBe("curd");
    expect(first("panir")).toBe("paneer");
    expect(first("eggs")).toBe("egg-boiled");
    expect(first("idlis")).toBe("idli");
  });
});

describe("quick type", () => {
  const items = (text: string) =>
    parseQuick(text, FOODS).map((p) => { const f = p.matches[0]; const r = resolveItem(p, f); return [f.id, r.qty, r.unit]; });

  test("splits on commas and 'and', reads leading numbers", () => {
    expect(items("2 roti, dal, paneer bhurji")).toEqual([["roti", 2, "piece"], ["dal-toor", 1, "katori"], ["paneer-bhurji", 1, "katori"]]);
    expect(items("1 katori rice and 2 eggs")).toEqual([["rice", 1, "katori"], ["egg-boiled", 2, "piece"]]);
  });

  test("grams, 'half' and units", () => {
    expect(items("200g paneer + half katori curd")).toEqual([["paneer", 2, "g100"], ["curd", 0.5, "katori"]]);
    expect(items("2 slices brown bread")).toEqual([["bread-brown", 2, "slice"]]);
  });

  test("portion maths", () => {
    const roti = FOODS.find((f) => f.id === "roti")!;
    const g = gramsOf(roti, "piece", 2);
    expect(g).toBe(80);
    expect(Math.round(scale(roti.per100, g).kcal)).toBe(211);
  });
});
