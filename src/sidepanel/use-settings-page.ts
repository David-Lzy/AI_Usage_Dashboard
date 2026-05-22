import { useEffect, useState } from "react";

import type {
  ApiKeyProviderId,
  AppSettings,
  ProviderId,
  ProviderSetting,
  ProviderSnapshot,
} from "../providers/types";
import { createRuntimeI18n } from "../shared/i18n";
import { buildSettingsLocalizedCopy } from "../shared/settings-localized-copy";
import { buildProviderSourceDisplayLocalizedCopy } from "../shared/provider-source-display-localized-copy";
import { buildSettingsPreferenceOptions } from "./settings-preference-options";
import { buildSettingsPageViewModels } from "./settings-page-view-models";
import {
  settingsRouteFocusRequiresAdvanced,
  type SettingsRouteFocus,
} from "./route-state";
import { useSettingsCredentialDrafts } from "./use-settings-credential-drafts";
import { useSettingsSectionNavigation } from "./use-settings-section-navigation";
import { getSettingsUserLevelVisibility } from "./settings-user-level-visibility";

type UseSettingsPageInput = {
  settings: AppSettings;
  providers: ProviderSetting[];
  snapshots: ProviderSnapshot[];
  routeFocus?: SettingsRouteFocus;
  onSaveProviderAdminApiKey: (providerId: ApiKeyProviderId, apiKey: string) => void;
  onClearProviderAdminApiKey: (providerId: ApiKeyProviderId) => void;
  onSaveCodexWorkspaceConfig: (analyticsApiKey: string, workspaceId: string) => void;
  onClearCodexWorkspaceConfig: () => void;
};

export function useSettingsPage({
  settings,
  providers,
  snapshots,
  routeFocus,
  onSaveProviderAdminApiKey,
  onClearProviderAdminApiKey,
  onSaveCodexWorkspaceConfig,
  onClearCodexWorkspaceConfig,
}: UseSettingsPageInput) {
  const credentialDrafts = useSettingsCredentialDrafts({
    onSaveProviderAdminApiKey,
    onClearProviderAdminApiKey,
    onSaveCodexWorkspaceConfig,
    onClearCodexWorkspaceConfig,
  });
  const sectionNavigation = useSettingsSectionNavigation(settings.motionMode);
  const i18n = createRuntimeI18n(
    settings.locale,
    typeof window !== "undefined" ? window : undefined,
  );
  const settingsCopy = buildSettingsLocalizedCopy(i18n);
  const providerSourceDisplayCopy = buildProviderSourceDisplayLocalizedCopy(i18n);
  const { localeOptions, motionModeOptions, themeModeOptions } =
    buildSettingsPreferenceOptions({
      i18n,
      providers,
      settings,
      snapshots,
    });
  const userLevelVisibility = getSettingsUserLevelVisibility(settings.userLevel);
  const routeFocusRequiresAdvanced = settingsRouteFocusRequiresAdvanced(routeFocus);
  const showAdvancedContainer =
    userLevelVisibility.showAdvancedContainer || routeFocusRequiresAdvanced;
  const {
    codexProvider,
    credentialProviders,
    settingsSectionNavItems,
    settingsSummaryItems,
  } = buildSettingsPageViewModels({
    providers,
    showAdvancedSection: showAdvancedContainer,
    settings,
    settingsCopy,
    snapshots,
  });
  const [advancedOpen, setAdvancedOpen] = useState(
    userLevelVisibility.advancedInitiallyOpen || routeFocusRequiresAdvanced,
  );
  const advancedGroupCount =
    (credentialProviders.length > 0 || codexProvider ? 1 : 0) + 1;
  const quickSetupFocusedProviderId =
    routeFocus?.kind === "quick-setup-provider" ? routeFocus.providerId : null;
  const credentialFocusedProviderId =
    routeFocus?.kind === "credential-provider" ? routeFocus.providerId : null;
  const sourceFocusedProviderId =
    routeFocus?.kind === "source-provider" ? routeFocus.providerId : null;

  useEffect(() => {
    setAdvancedOpen(
      userLevelVisibility.advancedInitiallyOpen || routeFocusRequiresAdvanced,
    );
  }, [routeFocusRequiresAdvanced, userLevelVisibility.advancedInitiallyOpen]);

  return {
    ...credentialDrafts,
    ...sectionNavigation,
    i18n,
    settingsCopy,
    providerSourceDisplayCopy,
    localeOptions,
    motionModeOptions,
    themeModeOptions,
    userLevelVisibility,
    showAdvancedContainer,
    codexProvider,
    credentialProviders,
    settingsSectionNavItems,
    settingsSummaryItems,
    advancedOpen,
    setAdvancedOpen,
    advancedGroupCount,
    quickSetupFocusedProviderId,
    credentialFocusedProviderId,
    sourceFocusedProviderId,
  };
}
