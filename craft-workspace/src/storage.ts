import type { ActivityEntry, AuditStatus, Theme, WorkspaceProject } from "./types";

const PREFIX = "craft-workspace:";

export function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLocal<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // The UI remains usable when browser storage is disabled or full.
  }
}

export const loadProjects = (): WorkspaceProject[] => readLocal("projects", []);
export const loadActivity = (): ActivityEntry[] => readLocal("activity", []);
export const loadTheme = (): Theme => readLocal("theme", "dark");
export const loadAuditStatuses = (): Record<string, AuditStatus> => readLocal("repoStatuses", {});

export function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return String(Date.now()) + "-" + Math.random().toString(36).slice(2, 10);
}
