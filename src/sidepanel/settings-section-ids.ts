export const SETTINGS_SECTION_IDS = {
  preferences: "settings-preferences",
  visibility: "settings-visibility",
  credentials: "settings-credentials",
  sources: "settings-sources",
  permissions: "settings-permissions",
} as const;

export type SettingsSectionId =
  (typeof SETTINGS_SECTION_IDS)[keyof typeof SETTINGS_SECTION_IDS];

export const SETTINGS_SECTION_ID_VALUES = Object.values(
  SETTINGS_SECTION_IDS,
) as SettingsSectionId[];
