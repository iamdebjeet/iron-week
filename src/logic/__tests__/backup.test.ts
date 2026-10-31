import { backupFileName, buildBackup, checkBackup, remapPasses, summarize } from "../backup";

const known = ["setups", "stretchSetups", "daily", "prefs", "passes", "profile", "week", "history"];
const keys = {
  profile: { name: "Debjeet" },
  week: { days: { mon: "swim", tue: "gym", wed: "both", thu: "gym", fri: "both", sat: "gym", sun: "gym" } },
  setups: { tue0: { sets: 4, reps: [8, 8, 8, 8] } },
  passes: { gym: { image: "file:///old/passes/gym-1.png", pdf: "file:///old/passes/gym-1.pdf", validTill: "2026-11-30", reminderId: "abc" } },
  history: { "2026-11-01": { date: "2026-11-01" } },
  junk: { x: 1 },
};
const backup = buildBackup({ schemaVersion: 2, appVersion: "1.0.0", keys, files: [{ name: "gym-1.png", base64: "AAAA" }], now: new Date("2026-11-01T10:00:00Z") });

describe("backup round trip", () => {
  test("build → JSON → check keeps everything known, drops the rest", () => {
    const r = checkBackup(JSON.parse(JSON.stringify(backup)), { schemaVersion: 2, knownKeys: known });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.backup.keys).toEqual({ profile: keys.profile, week: keys.week, setups: keys.setups, passes: keys.passes, history: keys.history });
    expect(r.backup.files).toEqual([{ name: "gym-1.png", base64: "AAAA" }]);
    expect(summarize(r.backup)).toEqual([
      "Profile: Debjeet", "Your week: 6 gym days, 3 swim days", "Sets and reps for 1 exercise", "Entry passes: gym", "History: 1 day",
    ]);
  });

  test("pass paths point at the restored files; old reminder ids are dropped", () => {
    expect(remapPasses(keys.passes, (n) => `file:///new/passes/${n}`)).toEqual({
      gym: { image: "file:///new/passes/gym-1.png", pdf: "file:///new/passes/gym-1.pdf", validTill: "2026-11-30" },
    });
  });

  test("file name carries the date", () => expect(backupFileName(new Date(2026, 10, 1))).toBe("iron-week-backup-2026-11-01.json"));
});

describe("backup checks", () => {
  const check = (x: unknown) => checkBackup(x, { schemaVersion: 2, knownKeys: known });
  test.each([
    ["not a backup", 42],
    ["wrong format", { format: "something-else" }],
    ["newer data", { ...backup, schemaVersion: 3 }],
    ["newer file layout", { ...backup, version: 2 }],
    ["unsafe file name", { ...backup, files: [{ name: "../evil", base64: "" }] }],
    ["keys missing", { ...backup, keys: null }],
    ["bad date", { ...backup, createdAt: "yesterday" }],
  ])("rejects %s", (_, x) => expect(check(x).ok).toBe(false));
});
