import type { SettingsUserLevel } from "../providers/types";

export type SettingsUserLevelVisibility = {
  advancedInitiallyOpen: boolean;
  showActionBadgeSelection: boolean;
  showAdvancedContainer: boolean;
  showCredentials: boolean;
  showDeveloperAppearanceControls: boolean;
  showDeveloperSourceContext: boolean;
  showDebugDiagnostics: boolean;
  showExperimentalLocalIntegrations: boolean;
  showSourcePreference: boolean;
  showWarningThreshold: boolean;
};

export function getSettingsUserLevelVisibility(
  userLevel: SettingsUserLevel,
): SettingsUserLevelVisibility {
  const isBasic = userLevel === "basic";
  const isDeveloper = userLevel === "developer";
  const isDebug = userLevel === "debug";
  const isDeveloperOrDebug = isDeveloper || isDebug;

  return {
    advancedInitiallyOpen: isDeveloperOrDebug,
    showActionBadgeSelection: !isBasic,
    showAdvancedContainer: !isBasic,
    showCredentials: !isBasic,
    showDeveloperAppearanceControls: isDeveloperOrDebug,
    showDeveloperSourceContext: isDeveloperOrDebug,
    showDebugDiagnostics: isDebug,
    showExperimentalLocalIntegrations: isDeveloperOrDebug,
    showSourcePreference: !isBasic,
    showWarningThreshold: !isBasic,
  };
}
