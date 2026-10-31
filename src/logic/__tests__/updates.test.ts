import { newerApk, parseLatest, updateMessage } from "../updates";

const good = { versionCode: 3, version: "2.1.0", notes: "Charts for lifts", apkUrl: "https://example.com/iron-week-2.1.0.apk" };

describe("latest.json", () => {
  test("reads a valid file", () => expect(parseLatest(good)).toEqual(good));
  test.each([
    ["not an object", "hello"],
    ["no version code", { ...good, versionCode: undefined }],
    ["version code not a whole number", { ...good, versionCode: 2.5 }],
    ["plain http link", { ...good, apkUrl: "http://example.com/a.apk" }],
    ["missing link", { ...good, apkUrl: undefined }],
  ])("ignores %s", (_, x) => expect(parseLatest(x)).toBeNull());
  test("notes are optional", () => expect(parseLatest({ ...good, notes: undefined })?.notes).toBe(""));

  test("offers the APK only when it's newer than the installed build", () => {
    const latest = parseLatest(good);
    expect(newerApk(latest, "2")).toEqual(good);
    expect(newerApk(latest, "3")).toBeNull();
    expect(newerApk(latest, "4")).toBeNull();
    expect(newerApk(latest, null)).toBeNull();
  });
});

describe("update message", () => {
  test("taken from the update's app config (extra.updateMessage)", () => {
    expect(updateMessage({ extra: { expoClient: { extra: { updateMessage: "  Water chart fix  " } } } })).toBe("Water chart fix");
  });
  test("falls back to the publish date, then to a generic line", () => {
    expect(updateMessage({}, new Date(2026, 10, 2))).toBe("Published 2 Nov 2026");
    expect(updateMessage(null)).toBe("Fixes and improvements");
  });
});
