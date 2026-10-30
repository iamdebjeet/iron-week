// Export / restore everything on the phone as one JSON file. The format and checks live in logic/backup.ts.
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as Sharing from "expo-sharing";
import Constants from "expo-constants";
import { File, Paths } from "expo-file-system";
import { type Backup, type BackupFile, backupFileName, buildBackup, checkBackup, remapPasses } from "./logic/backup";
import { scheduleBackupReminder } from "./notifications";
import { type PassKind, type Passes, passDir, scheduleExpiry } from "./passes";
import { DATA_KEYS, KEYS, SCHEMA_VERSION, loadMany, migrate } from "./storage";

/** Build the backup file in the cache folder and open the share sheet. Returns the backup time. */
export async function exportBackup(): Promise<string> {
  if (!(await Sharing.isAvailableAsync())) throw new Error("Sharing isn't available on this phone.");
  const keys = await loadMany(DATA_KEYS);
  const files: BackupFile[] = [];
  const passes = (keys[KEYS.passes] ?? {}) as Passes;
  for (const p of Object.values(passes)) {
    for (const uri of [p?.image, p?.pdf]) {
      if (!uri) continue;
      const f = new File(uri);
      if (f.exists) files.push({ name: f.name, base64: await f.base64() });
    }
  }
  const now = new Date();
  const backup = buildBackup({ schemaVersion: SCHEMA_VERSION, appVersion: Constants.expoConfig?.version ?? "", keys, files, now });
  const out = new File(Paths.cache, backupFileName(now));
  if (out.exists) out.delete();
  out.create();
  await out.write(JSON.stringify(backup));
  await Sharing.shareAsync(out.uri, { mimeType: "application/json", dialogTitle: "Save your Iron Week backup", UTI: "public.json" });
  return backup.createdAt;
}

export type PickResult = { ok: true; backup: Backup } | { ok: false; error: string } | { ok: false; canceled: true };

/** Let the user pick a backup file and check it. Nothing is changed yet. */
export async function pickBackup(): Promise<PickResult> {
  // expo-file-system's picker returns a File the app may read (a DocumentPicker URI is rejected in Expo Go).
  // Any type is allowed: Drive and WhatsApp often hand JSON over as a generic file.
  const res = await File.pickFileAsync({ mimeTypes: ["application/json", "text/plain", "*/*"] });
  if (res.canceled) return { ok: false, canceled: true };
  let parsed: unknown;
  try { parsed = JSON.parse(await res.result.text()); } catch { return { ok: false, error: "This file can't be read. Pick the .json file Iron Week exported." }; }
  return checkBackup(parsed, { schemaVersion: SCHEMA_VERSION, knownKeys: DATA_KEYS });
}

/** Replace everything on the phone with the backup, then reschedule notifications. */
export async function restoreBackup(b: Backup): Promise<void> {
  // 1. Old reminders point at old data: clear them all. Daily reminders come back when the app reloads.
  await Notifications.cancelAllScheduledNotificationsAsync();
  // 2. Pass files: remove the current ones, write the backed-up ones.
  const dir = passDir();
  for (const item of dir.list()) if (item instanceof File) item.delete();
  for (const f of b.files) {
    const file = new File(dir, f.name);
    file.create();
    await file.write(f.base64, { encoding: "base64" });
  }
  // 3. Keys: drop everything, then write the backup's keys with pass paths pointed at the new files.
  const keys = { ...b.keys };
  const passes = remapPasses(keys[KEYS.passes], (name) => new File(dir, name).uri);
  if (passes) keys[KEYS.passes] = passes; else delete keys[KEYS.passes];
  const prefs: Record<string, unknown> = { ...((keys[KEYS.prefs] as Record<string, unknown> | undefined) ?? {}), lastBackup: b.createdAt };
  keys[KEYS.prefs] = prefs;
  await AsyncStorage.multiRemove(DATA_KEYS);
  await AsyncStorage.multiSet(Object.entries(keys).map(([k, v]) => [k, JSON.stringify(v)]));
  await AsyncStorage.setItem(KEYS.schemaVersion, String(b.schemaVersion));
  await migrate();
  // 4. Pass expiry and backup reminders.
  if (passes) {
    for (const kind of Object.keys(passes) as PassKind[]) {
      const p = passes[kind] as { validTill?: string };
      if (p.validTill) (passes[kind] as { reminderId?: string }).reminderId = await scheduleExpiry(kind, p.validTill).catch(() => undefined);
    }
    await AsyncStorage.setItem(KEYS.passes, JSON.stringify(passes));
  }
  await scheduleBackupReminder(prefs.backupReminder === true, b.createdAt).catch(() => {});
}
