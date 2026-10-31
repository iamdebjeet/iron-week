// App updates: the public latest.json (new APKs) and the message carried by an over-the-air update. Pure functions.

export interface LatestApk { versionCode: number; version: string; notes: string; apkUrl: string }

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x);

/** Read latest.json; anything malformed (or a non-https link) is ignored */
export function parseLatest(x: unknown): LatestApk | null {
  if (!isObj(x)) return null;
  const versionCode = Number(x.versionCode);
  if (!Number.isInteger(versionCode) || versionCode < 1) return null;
  if (typeof x.version !== "string" || typeof x.apkUrl !== "string" || !/^https:\/\//.test(x.apkUrl)) return null;
  return { versionCode, version: x.version, notes: typeof x.notes === "string" ? x.notes : "", apkUrl: x.apkUrl };
}

/** Only offer a download when the published build is newer than the installed one */
export function newerApk(latest: LatestApk | null, installedVersionCode: string | number | null): LatestApk | null {
  // Unknown installed build (null / empty): don't guess, Number(null) would be 0 and everything looks newer
  if (!latest || installedVersionCode === null || installedVersionCode === "") return null;
  const installed = Number(installedVersionCode);
  if (!Number.isFinite(installed)) return null;
  return latest.versionCode > installed ? latest : null;
}

/**
 * EAS Update doesn't send the `--message` text to the app, but every update carries the app config,
 * so the message is read from `extra.updateMessage` (set it in app.json before `eas update`).
 */
export function updateMessage(manifest: unknown, createdAt?: Date): string {
  const extra = isObj(manifest) && isObj(manifest.extra) && isObj(manifest.extra.expoClient) && isObj(manifest.extra.expoClient.extra) ? manifest.extra.expoClient.extra : null;
  if (extra && typeof extra.updateMessage === "string" && extra.updateMessage.trim()) return extra.updateMessage.trim();
  return createdAt ? `Published ${createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : "Fixes and improvements";
}
