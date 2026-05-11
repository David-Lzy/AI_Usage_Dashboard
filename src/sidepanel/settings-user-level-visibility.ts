import type { SettingsUserLevel } from "../providers/types";

export type SettingsUserLevelVisibility = {
  advancedInitiallyOpen: boolean;
  showActionBadgeSelection: boolean;
  showAdvancedContainer: boolean;
  showCredentials: boolean;
  showDeveloperAppearanceControls: boolean;
  showDeveloperSourceContext: boolean;
  showDebugDiagnostics: boolean;
  showPopupAppearancePreview: boolean;
  showSourcePreference: boolean;
  showWarningThreshold: boolean;
};

export function getSettingsUserLevelVisibility(
  userLevel: SettingsUserLevel,
): SettingsUserLevelVisibility {
  const isBasic = userLevel === "basic";
  const isAdvanced = userLevel === "advanced";
  const isDeveloper = userLevel === "developer";
  const isDebug = userLevel === "debug";

  return {
    advancedInitiallyOpen: isDeveloper || isDebug,
    showActionBadgeSelection: !isBasic,
    showAdvancedContainer: !isBasic,
    showCredentials: !isBasic,
    showDeveloperAppearanceControls: isDeveloper || isDebug,
    showDeveloperSourceContext: isDeveloper || isDebug,
    showDebugDiagnostics: isDebug,
    showPopupAppearancePreview: isDeveloper || isDebug,
    showSourcePreference: !isBasic,
    showWarningThreshold: !isBasic,
  };
}
