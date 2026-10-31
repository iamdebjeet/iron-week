import { activeMinutes, addToHistory, summarizeDay } from "../history";
import { DEFAULT_WEEK, buildDays } from "../plan";

const plan = buildDays(DEFAULT_WEEK);
const fri = plan.find((d) => d.key === "fri")!; // Legs B + swim
const mon = plan.find((d) => d.key === "mon")!; // recovery swim
const summary = (ticks: Record<string, boolean>, day = fri) =>
  summarizeDay({ date: "2026-11-06", day, ticks, water: [], setups: {}, stretchSetups: {}, baseWaterMl: 3000 });

describe("minutes behind the calorie estimate", () => {
  test("workout: the share of sets done × 60 min when the session timer wasn't used", () => {
    const s = summary({ "fri0-0": true, "fri0-1": true });
    const m = activeMinutes({ day: fri, summary: s, ticks: { "fri0-0": true, "fri0-1": true }, stretchSetups: {} });
    expect(m.gymMin).toBeCloseTo((60 * 2) / s.workout!.total, 5);
  });

  test("workout: the session timer wins when it was used", () => {
    const s = summary({ "fri0-0": true });
    expect(activeMinutes({ day: fri, summary: s, ticks: { "fri0-0": true }, stretchSetups: {}, sessionSec: 45 * 60 }).gymMin).toBe(45);
  });

  test("no sets ticked, no workout minutes (even with the timer)", () => {
    expect(activeMinutes({ day: fri, summary: summary({}), ticks: {}, stretchSetups: {}, sessionSec: 600 }).gymMin).toBe(0);
  });

  test("swim: minutes of the ticked blocks; Monday is a recovery swim", () => {
    const ticks = { friW0: true, friW2: true }; // warm-up 5 + main 20
    expect(activeMinutes({ day: fri, summary: summary(ticks), ticks, stretchSetups: {} }).swimMin).toBe(25);
    expect(activeMinutes({ day: mon, summary: summary({}, mon), ticks: {}, stretchSetups: {} }).recoverySwim).toBe(true);
  });

  test("history keeps 400 days", () => {
    let h = {};
    for (let i = 0; i < 405; i++) h = addToHistory(h, { ...summary({}), date: `d${String(i).padStart(3, "0")}` });
    expect(Object.keys(h)).toHaveLength(400);
  });
});
