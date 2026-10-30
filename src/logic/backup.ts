// Backup file format: one JSON file with every saved key and the pass files as base64.
// Pure functions (build, check, summarise), so they can be unit-tested; file and storage work is in src/backup.ts.
export const BACKUP_FORMAT = "iron-week-backup";
/** Version of the backup file layout (not the storage schema) */
export const BACKUP_VERSION = 1;

export interface BackupFile { name: string; base64: string }
export interface Backup {
  format: typeof BACKUP_FORMAT;
  version: number;
  /** storage schemaVersion of the data inside, so an older backup can be migrated on restore */
  schemaVersion: number;
  createdAt: string;
  appVersion: string;
  keys: Record<string, unknown>;
  files: BackupFile[];
}

export function buildBackup(args: { schemaVersion: number; appVersion: string; keys: Record<string, unknown>; files: BackupFile[]; now?: Date }): Backup {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    schemaVersion: args.schemaVersion,
    createdAt: (args.now ?? new Date()).toISOString(),
    appVersion: args.appVersion,
    keys: args.keys,
    files: args.files,
  };
}

const SAFE_NAME = /^[\w.-]{1,120}$/;
const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x);

export type CheckResult = { ok: true; backup: Backup } | { ok: false; error: string };

/** Check a parsed file before anything is replaced. Only known keys are kept. */
export function checkBackup(x: unknown, opts: { schemaVersion: number; knownKeys: readonly string[] }): CheckResult {
  if (!isObj(x) || x.format !== BACKUP_FORMAT) return { ok: false, error: "This isn't an Iron Week backup file." };
  if (typeof x.version !== "number" || typeof x.schemaVersion !== "number" || typeof x.createdAt !== "string" || !isObj(x.keys) || !Array.isArray(x.files))
    return { ok: false, error: "This backup file is damaged or incomplete." };
  if (x.version > BACKUP_VERSION || x.schemaVersion > opts.schemaVersion)
    return { ok: false, error: "This backup was made by a newer version of Iron Week. Update the app, then try again." };
  if (Number.isNaN(Date.parse(x.createdAt))) return { ok: false, error: "This backup file is damaged or incomplete." };
  const files: BackupFile[] = [];
  for (const f of x.files) {
    if (!isObj(f) || typeof f.name !== "string" || !SAFE_NAME.test(f.name) || typeof f.base64 !== "string")
      return { ok: false, error: "This backup file is damaged or incomplete." };
    files.push({ name: f.name, base64: f.base64 });
  }
  const keys: Record<string, unknown> = {};
  for (const k of opts.knownKeys) if (k in x.keys) keys[k] = x.keys[k];
  return {
    ok: true,
    backup: { format: BACKUP_FORMAT, version: x.version, schemaVersion: x.schemaVersion, createdAt: x.createdAt, appVersion: String(x.appVersion ?? ""), keys, files },
  };
}

const count = (x: unknown) => (isObj(x) ? Object.keys(x).length : 0);
const plural = (n: number, one: string, many = one + "s") => `${n} ${n === 1 ? one : many}`;
const size = (x: unknown) => (Array.isArray(x) ? x.length : count(x));

/** Plain lines saying what's inside, shown before the user confirms a restore */
export function summarize(b: Backup): string[] {
  const k = b.keys, out: string[] = [];
  const profile = isObj(k.profile) ? k.profile : null;
  if (profile) out.push(`Profile${typeof profile.name === "string" && profile.name ? `: ${profile.name}` : ""}`);
  if (isObj(k.week) && isObj(k.week.days)) {
    const days = Object.values(k.week.days);
    out.push(`Your week: ${plural(days.filter((d) => d === "gym" || d === "both").length, "gym day")}, ${plural(days.filter((d) => d === "swim" || d === "both").length, "swim day")}`);
  }
  if (count(k.setups)) out.push(`Sets and reps for ${plural(count(k.setups), "exercise")}`);
  if (count(k.stretchSetups)) out.push(`Settings for ${plural(count(k.stretchSetups), "stretch", "stretches")}`);
  const passes = isObj(k.passes) ? Object.keys(k.passes) : [];
  if (passes.length) out.push(`Entry passes: ${passes.join(", ")}`);
  if (size(k.history)) out.push(`History: ${plural(size(k.history), "day")}`);
  if (isObj(k.prefs)) out.push("Reminder, timer and theme settings");
  return out.length ? out : ["Nothing saved yet"];
}

/** Pass entries keep full file paths; point them at the restored files (by file name) and drop old reminder ids */
export function remapPasses(passes: unknown, uriFor: (name: string) => string): Record<string, unknown> | null {
  if (!isObj(passes)) return null;
  const out: Record<string, unknown> = {};
  for (const [kind, p] of Object.entries(passes)) {
    if (!isObj(p) || typeof p.image !== "string") continue;
    const name = (u: string) => u.split("/").pop() ?? u;
    const { reminderId: _old, ...rest } = p;
    out[kind] = { ...rest, image: uriFor(name(p.image)), ...(typeof p.pdf === "string" ? { pdf: uriFor(name(p.pdf)) } : {}) };
  }
  return out;
}

export const backupFileName = (d: Date) =>
  `iron-week-backup-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}.json`;
