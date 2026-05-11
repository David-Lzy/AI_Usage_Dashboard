export const SETTINGS_SECTION_IDS = {
  overview: "settings-overview",
  quickSetup: "settings-quick-setup",
  appearance: "settings-appearance",
  advanced: "settings-advanced",
} as const;

export type SettingsSectionId =
  (typeof SETTINGS_SECTION_IDS)[keyof typeof SETTINGS_SECTION_IDS];

export const SETTINGS_SECTION_ID_VALUES = Object.values(
  SETTINGS_SECTION_IDS,
) as SettingsSectionId[];
