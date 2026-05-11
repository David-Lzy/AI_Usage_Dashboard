import type {
  ApiKeyProviderId,
  AppSettings,
  ProviderSetting,
  ProviderSnapshot,
} from "../providers/types";
import type { buildSettingsLocalizedCopy } from "../shared/localized-copy";
import {
  SETTINGS_SECTION_IDS,
  type SettingsSectionId,
} from "./settings-section-ids";
import type { CredentialProviderSection } from "./components/SettingsSections";
import { buildSettingsSummaryItems } from "./settings-view-models";

type BuildSettingsPageViewModelsOptions = {
  providers: ProviderSetting[];
  showAdvancedSection?: boolean;
  settings: AppSettings;
  settingsCopy: ReturnType<typeof buildSettingsLocalizedCopy>;
  snapshots: ProviderSnapshot[];
};

export function buildSettingsPageViewModels({
  providers,
  showAdvancedSection,
  settings,
  settingsCopy,
  snapshots,
}: BuildSettingsPageViewModelsOptions) {
  const resolvedShowAdvancedSection =
    showAdvancedSection ?? settings.userLevel !== "basic";
  const credentialProviders: CredentialProviderSection[] = [];
  const cursorProvider = findCredentialProvider(providers, "cursor");
  const claudeProvider = findCredentialProvider(providers, "claude-code");
  const codexProvider =
    providers.find(
      (provider): provider is ProviderSetting & { id: "codex" } =>
        provider.id === "codex",
    ) ?? null;

  if (cursorProvider) {
    credentialProviders.push({
      provider: cursorProvider,
      title: settingsCopy.credentials.cursorTitle,
      inputLabel: settingsCopy.credentials.adminApiKeyLabel,
      helpText: settingsCopy.credentials.cursorHelpText,
      footerText: settingsCopy.credentials.cursorFooterText,
      placeholderMissing: settingsCopy.credentials.cursorPlaceholderMissing,
      placeholderConfigured: settingsCopy.credentials.cursorPlaceholderConfigured,
    });
  }

  if (claudeProvider) {
    credentialProviders.push({
      provider: claudeProvider,
      title: settingsCopy.credentials.claudeTitle,
      inputLabel: settingsCopy.credentials.adminApiKeyLabel,
      helpText: settingsCopy.credentials.claudeHelpText,
      footerText: settingsCopy.credentials.claudeFooterText,
      placeholderMissing: settingsCopy.credentials.claudePlaceholderMissing,
      placeholderConfigured: settingsCopy.credentials.claudePlaceholderConfigured,
    });
  }

  return {
    codexProvider,
    credentialProviders,
    settingsSectionNavItems: buildSettingsSectionNavItems(
      resolvedShowAdvancedSection,
      settingsCopy,
    ),
    settingsSummaryItems: buildSettingsSummaryItems(
      providers,
      snapshots,
      settings.userLevel,
      settingsCopy.layout.summary,
    ),
  };
}

function findCredentialProvider(
  providers: ProviderSetting[],
  providerId: ApiKeyProviderId,
): (ProviderSetting & { id: ApiKeyProviderId }) | null {
  return (
    providers.find(
      (provider): provider is ProviderSetting & { id: ApiKeyProviderId } =>
        provider.id === providerId,
    ) ?? null
  );
}

function buildSettingsSectionNavItems(
  showAdvancedSection: boolean,
  settingsCopy: ReturnType<typeof buildSettingsLocalizedCopy>,
): Array<{
  id: SettingsSectionId;
  label: string;
}> {
  const items: Array<{
    id: SettingsSectionId;
    label: string;
  }> = [
    {
      id: SETTINGS_SECTION_IDS.overview,
      label: settingsCopy.layout.sections.overview,
    },
    {
      id: SETTINGS_SECTION_IDS.quickSetup,
      label: settingsCopy.layout.sections.quickSetup,
    },
    {
      id: SETTINGS_SECTION_IDS.appearance,
      label: settingsCopy.layout.sections.appearance,
    },
  ];

  if (showAdvancedSection) {
    items.push({
      id: SETTINGS_SECTION_IDS.advanced,
      label: settingsCopy.layout.sections.advanced,
    });
  }

  return items;
}
