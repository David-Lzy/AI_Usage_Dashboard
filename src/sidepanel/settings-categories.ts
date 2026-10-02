import type { SettingsRouteFocus } from "./route-state";
import {
  SETTINGS_SECTION_IDS,
  type SettingsSectionId,
} from "./settings-section-ids";
import type { MaterialActionIconName } from "../shared/components/MaterialActionIcon";

export const SETTINGS_CATEGORIES = [
  "connections",
  "usage",
  "appearance",
  "general",
  "data",
] as const;
export type SettingsCategory = (typeof SETTINGS_CATEGORIES)[number];

export const SETTINGS_CATEGORY_SECTIONS: Record<
  SettingsCategory,
  SettingsSectionId
> = {
  connections: SETTINGS_SECTION_IDS.quickSetup,
  usage: SETTINGS_SECTION_IDS.usageNotifications,
  appearance: SETTINGS_SECTION_IDS.appearance,
  general: SETTINGS_SECTION_IDS.overview,
  data: SETTINGS_SECTION_IDS.data,
};

export const SETTINGS_CATEGORY_ICONS: Record<
  SettingsCategory,
  MaterialActionIconName
> = {
  connections: "devices",
  usage: "refresh",
  appearance: "brightness-auto",
  general: "settings",
  data: "save",
};

export function getSettingsCategoryForSection(
  section: string | null | undefined,
): SettingsCategory {
  if (section === SETTINGS_SECTION_IDS.overview) return "general";
  if (section === SETTINGS_SECTION_IDS.usageNotifications) return "usage";
  if (
    section === SETTINGS_SECTION_IDS.appearance ||
    section === SETTINGS_SECTION_IDS.providerDisplay
  )
    return "appearance";
  if (section === SETTINGS_SECTION_IDS.data) return "data";
  return "connections";
}

export function getSettingsCategoryForFocus(
  focus?: SettingsRouteFocus,
): SettingsCategory {
  return focus?.kind === "section"
    ? getSettingsCategoryForSection(focus.sectionId)
    : "connections";
}
