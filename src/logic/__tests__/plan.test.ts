import { DEFAULT_WEEK, assignWorkouts, autoOrder, buildDays, nextKind, shoulderSwimTip } from "../plan";

describe("plan builder", () => {
  test("the default week matches the plan table", () => {
    const days = buildDays(DEFAULT_WEEK);
    const summary = Object.fromEntries(days.map((d) => [d.key, `${d.workout ?? (d.swim ? "recovery-swim" : "rest")}${d.swim && d.workout ? "+swim" : ""}`]));
    expect(summary).toEqual({
      mon: "recovery-swim", tue: "pushA", wed: "legsA+swim", thu: "pullA", fri: "legsB+swim", sat: "pushB", sun: "pullB",
    });
  });

  test("legs land on gym days that also have a swim", () => {
    const order = autoOrder({ mon: "both", tue: "gym", wed: "gym", thu: "both", fri: "gym", sat: "rest", sun: "rest" });
    expect(order.mon).toBe("legsA");
    expect(order.thu).toBe("legsB");
    expect([order.tue, order.wed, order.fri]).toEqual(["pushA", "pullA", "pushB"]);
  });

  test("more than 6 gym days repeat the order", () => {
    const all = autoOrder({ mon: "gym", tue: "gym", wed: "gym", thu: "gym", fri: "gym", sat: "gym", sun: "gym" });
    expect(Object.values(all)).toEqual(["pushA", "pullA", "legsA", "pushB", "pullB", "legsB", "pushA"]);
  });

  test("manual picks win; picks on non-gym days are ignored", () => {
    const w = assignWorkouts({ ...DEFAULT_WEEK, order: { tue: "legsB", mon: "pushA" } });
    expect(w.tue).toBe("legsB");
    expect(w.mon).toBeUndefined();
  });

  test("sets follow the workout: a moved workout keeps its source key", () => {
    const days = buildDays({ ...DEFAULT_WEEK, order: { sat: "pushA", tue: "pushB" } });
    expect(days.find((d) => d.key === "sat")?.plan).toBe("tue");
    expect(days.find((d) => d.key === "tue")?.plan).toBe("sat");
  });

  test("shoulder day + swim gets the easy-swim tip", () => {
    const days = buildDays({ ...DEFAULT_WEEK, order: { wed: "pushA" } });
    expect(shoulderSwimTip(days.find((d) => d.key === "wed")!)).toMatch(/keep the swim easy/);
    expect(shoulderSwimTip(days.find((d) => d.key === "fri")!)).toBeNull();
  });

  test("tapping a day cycles Gym → Swim → Gym+Swim → Rest", () => {
    expect([nextKind("gym"), nextKind("swim"), nextKind("both"), nextKind("rest")]).toEqual(["swim", "both", "rest", "gym"]);
  });
});
