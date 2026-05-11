import type { SettingsUserLevel } from "../providers/types";

export const SETTINGS_USER_LEVELS = [
  "basic",
  "advanced",
  "developer",
  "debug",
] as const satisfies readonly SettingsUserLevel[];

export const DEFAULT_SETTINGS_USER_LEVEL: SettingsUserLevel = "basic";

export function normalizeSettingsUserLevel(value: unknown): SettingsUserLevel {
  return SETTINGS_USER_LEVELS.includes(value as SettingsUserLevel)
    ? (value as SettingsUserLevel)
    : DEFAULT_SETTINGS_USER_LEVEL;
}
