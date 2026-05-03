import type {
  ApiKeyProviderId,
  ProviderSetting,
  ProviderSnapshot,
} from "../providers/types";
import { buildSettingsSummaryLabels } from "../shared/i18n";
import type { RuntimeI18n } from "../shared/i18n";
import type { buildSettingsLocalizedCopy } from "../shared/localized-copy";
import {
  SETTINGS_SECTION_IDS,
  type SettingsSectionId,
} from "./settings-section-ids";
import type { CredentialProviderSection } from "./components/SettingsSections";
import { buildSettingsSummaryItems } from "./settings-view-models";

type BuildSettingsPageViewModelsOptions = {
  i18n: RuntimeI18n;
  providers: ProviderSetting[];
  settingsCopy: ReturnType<typeof buildSettingsLocalizedCopy>;
  snapshots: ProviderSnapshot[];
};

export function buildSettingsPageViewModels({
  i18n,
  providers,
  settingsCopy,
  snapshots,
}: BuildSettingsPageViewModelsOptions) {
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
    settingsSectionNavItems: buildSettingsSectionNavItems(i18n),
    settingsSummaryItems: buildSettingsSummaryItems(
      providers,
      snapshots,
      buildSettingsSummaryLabels(i18n),
      i18n.formatNumber,
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
  i18n: RuntimeI18n,
): Array<{
  id: SettingsSectionId;
  label: string;
}> {
  return [
    {
      id: SETTINGS_SECTION_IDS.preferences,
      label: i18n.t("settings.sections.preferences"),
    },
    {
      id: SETTINGS_SECTION_IDS.visibility,
      label: i18n.t("settings.sections.visibility"),
    },
    {
      id: SETTINGS_SECTION_IDS.credentials,
      label: i18n.t("settings.sections.credentials"),
    },
    {
      id: SETTINGS_SECTION_IDS.sources,
      label: i18n.t("settings.sections.sources"),
    },
    {
      id: SETTINGS_SECTION_IDS.permissions,
      label: i18n.t("settings.sections.permissions"),
    },
  ];
}
