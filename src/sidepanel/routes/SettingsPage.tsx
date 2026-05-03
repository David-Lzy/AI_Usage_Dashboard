import { type FormEvent, useEffect, useState } from "react";

import type {
  ActionBadgeSelection,
  ApiKeyProviderId,
  AppLocalePreference,
  AppSettings,
  PopupCornerStyle,
  PopupShadowStyle,
  PopupSizePreset,
  ProgressDisplayStyle,
  ProviderId,
  ProviderSourcePreference,
  ProviderSetting,
  ProviderSnapshot,
  ThemeMode,
  ThemePreset,
} from "../../providers/types";
import {
  buildSettingsSummaryLabels,
  createRuntimeI18n,
} from "../../shared/i18n";
import {
  buildSettingsLocalizedCopy,
} from "../../shared/localized-copy";
import {
  normalizeThemeCustomSeedHex,
  resolveThemeMode,
} from "../../shared/theme";

import {
  SettingsBackToTopButton,
  SettingsSectionNavigation,
} from "../components/SettingsNavigation";
import {
  SettingsCredentialsSection,
  SettingsOverviewSection,
  SettingsPermissionsSection,
  SettingsVisibilitySection,
  type CredentialProviderSection,
} from "../components/SettingsSections";
import {
  SETTINGS_SECTION_IDS,
  type SettingsSectionId,
} from "../settings-section-ids";
import { buildSettingsSummaryItems } from "../settings-view-models";
import { Toast } from "../components/Toast";
import { TopBar } from "../components/TopBar";
import { useSettingsCredentialDrafts } from "../use-settings-credential-drafts";
import { useSettingsSectionNavigation } from "../use-settings-section-navigation";
import { SettingsSourceSection } from "../components/SettingsSourceSection";
import { SettingsPreferencesSection } from "../components/SettingsPreferencesSection";

type SettingsToast = {
  tone: "success" | "error";
  title: string;
  message: string;
};

type SettingsPageProps = {
  onBack: () => void;
  themeActionLabel?: string;
  themeActionTitle?: string;
  onToggleThemeMode?: () => void;
  onOpenFullPage?: () => void;
  settings: AppSettings;
  providers: ProviderSetting[];
  snapshots: ProviderSnapshot[];
  toast: SettingsToast | null;
  onDismissToast: () => void;
  onSavePreferences: () => void;
  onSyncIntervalChange: (minutes: number) => void;
  onLocalePreferenceChange: (locale: AppLocalePreference) => void;
  onWarningThresholdChange: (percent: number) => void;
  onThemeModeChange: (themeMode: ThemeMode) => void;
  onThemePresetChange: (themePreset: ThemePreset) => void;
  onPopupProgressStyleChange: (progressStyle: ProgressDisplayStyle) => void;
  onSidebarProgressStyleChange: (progressStyle: ProgressDisplayStyle) => void;
  onFullPageProgressStyleChange: (progressStyle: ProgressDisplayStyle) => void;
  onPopupSizePresetChange: (sizePreset: PopupSizePreset) => void;
  onPopupCornerStyleChange: (cornerStyle: PopupCornerStyle) => void;
  onPopupShadowStyleChange: (shadowStyle: PopupShadowStyle) => void;
  onActionBadgeSelectionChange: (
    actionBadgeSelection: ActionBadgeSelection,
  ) => void;
  onSaveThemeCustomSeed: (themeCustomSeedHex: string) => void;
  onResetThemeCustomSeed: () => void;
  onToggleProvider: (providerId: ProviderId) => void;
  onTogglePermission: (providerId: ProviderId) => void;
  onSetSourcePreference: (
    providerId: ProviderId,
    sourcePreference: ProviderSourcePreference,
  ) => void;
  onSaveProviderAdminApiKey: (
    providerId: ApiKeyProviderId,
    apiKey: string,
  ) => void;
  onClearProviderAdminApiKey: (providerId: ApiKeyProviderId) => void;
  onSaveCodexWorkspaceConfig: (
    analyticsApiKey: string,
    workspaceId: string,
  ) => void;
  onClearCodexWorkspaceConfig: () => void;
  onClearPageBinding: (providerId: ProviderId) => void;
  onOpenSessionPage: (providerId: ProviderId) => void;
  onAttachActiveSessionPage: (providerId: ProviderId) => void;
  sessionPageNavigationAvailable: boolean;
  activeSessionPageAttachAvailable: boolean;
};

export function SettingsPage({
  onBack,
  themeActionLabel,
  themeActionTitle,
  onToggleThemeMode,
  onOpenFullPage,
  settings,
  providers,
  snapshots,
  toast,
  onDismissToast,
  onSavePreferences,
  onSyncIntervalChange,
  onLocalePreferenceChange,
  onWarningThresholdChange,
  onThemeModeChange,
  onThemePresetChange,
  onPopupProgressStyleChange,
  onSidebarProgressStyleChange,
  onFullPageProgressStyleChange,
  onPopupSizePresetChange,
  onPopupCornerStyleChange,
  onPopupShadowStyleChange,
  onActionBadgeSelectionChange,
  onSaveThemeCustomSeed,
  onResetThemeCustomSeed,
  onToggleProvider,
  onTogglePermission,
  onSetSourcePreference,
  onSaveProviderAdminApiKey,
  onClearProviderAdminApiKey,
  onSaveCodexWorkspaceConfig,
  onClearCodexWorkspaceConfig,
  onClearPageBinding,
  onOpenSessionPage,
  onAttachActiveSessionPage,
  sessionPageNavigationAvailable,
  activeSessionPageAttachAvailable,
}: SettingsPageProps) {
  function findCredentialProvider(
    providerId: ApiKeyProviderId,
  ): (ProviderSetting & { id: ApiKeyProviderId }) | null {
    return (
      providers.find(
        (provider): provider is ProviderSetting & { id: ApiKeyProviderId } =>
          provider.id === providerId,
      ) ?? null
    );
  }

  const credentialProviders: CredentialProviderSection[] = [];
  const cursorProvider = findCredentialProvider("cursor");
  const claudeProvider = findCredentialProvider("claude-code");
  const codexProvider =
    providers.find(
      (provider): provider is ProviderSetting & { id: "codex" } =>
        provider.id === "codex",
    ) ?? null;
  const {
    codexAnalyticsApiKeyInput,
    codexWorkspaceIdInput,
    credentialInputs,
    handleClearCodexConfig,
    handleClearProviderApiKey,
    handleProviderApiKeyInputChange,
    handleSaveCodexConfig,
    handleSaveProviderApiKey,
    setCodexAnalyticsApiKeyInput,
    setCodexWorkspaceIdInput,
  } = useSettingsCredentialDrafts({
    onSaveProviderAdminApiKey,
    onClearProviderAdminApiKey,
    onSaveCodexWorkspaceConfig,
    onClearCodexWorkspaceConfig,
  });
  const [themeCustomSeedDraft, setThemeCustomSeedDraft] = useState(
    settings.themeCustomSeedHex ?? "",
  );
  const {
    activeSettingsSection,
    scrollToSection,
    scrollToSettingsTop,
  } = useSettingsSectionNavigation();
  const normalizedThemeCustomSeedDraft =
    normalizeThemeCustomSeedHex(themeCustomSeedDraft);
  const resolvedThemeMode = resolveThemeMode(
    settings.themeMode,
    typeof window !== "undefined" ? window : undefined,
  );
  const i18n = createRuntimeI18n(
    settings.locale,
    typeof window !== "undefined" ? window : undefined,
  );
  const settingsCopy = buildSettingsLocalizedCopy(i18n);

  useEffect(() => {
    setThemeCustomSeedDraft(settings.themeCustomSeedHex ?? "");
  }, [settings.themeCustomSeedHex]);

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

  const settingsSummaryItems = buildSettingsSummaryItems(
    providers,
    snapshots,
    buildSettingsSummaryLabels(i18n),
    i18n.formatNumber,
  );
  const settingsSectionNavItems: Array<{
    id: SettingsSectionId;
    label: string;
  }> = [
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

  function handleApplyThemeCustomSeed(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!normalizedThemeCustomSeedDraft) {
      return;
    }

    onSaveThemeCustomSeed(normalizedThemeCustomSeedDraft);
    setThemeCustomSeedDraft(normalizedThemeCustomSeedDraft);
  }

  function handleResetThemeCustomSeed() {
    setThemeCustomSeedDraft("");
    onResetThemeCustomSeed();
  }

  return (
    <main className="app-shell settings-shell">
      <TopBar
        title={i18n.t("settings.topbar.title")}
        subtitle={i18n.t("settings.topbar.subtitle")}
        themeActionLabel={themeActionLabel}
        themeActionTitle={themeActionTitle}
        expandActionLabel={i18n.t("common.actions.tab")}
        expandActionTitle={i18n.t("common.actions.open_settings_tab")}
        secondaryActionLabel={i18n.t("common.actions.back")}
        primaryActionLabel={i18n.t("common.actions.save")}
        sticky
        bottomContent={
          <SettingsSectionNavigation
            ariaLabel={i18n.t("settings.sections.aria")}
            activeSectionId={activeSettingsSection}
            items={settingsSectionNavItems}
            onSelectSection={scrollToSection}
          />
        }
        onThemeAction={onToggleThemeMode}
        onExpandAction={onOpenFullPage}
        onSecondaryAction={onBack}
        onPrimaryAction={onSavePreferences}
      />

      <SettingsOverviewSection
        ariaLabel={i18n.t("settings.overview.aria")}
        detail={i18n.t("settings.overview.detail")}
        eyebrow={i18n.t("settings.overview.eyebrow")}
        items={settingsSummaryItems}
        title={i18n.t("settings.overview.title")}
      />
      <SettingsPreferencesSection
        sectionId={SETTINGS_SECTION_IDS.preferences}
        settings={settings}
        providers={providers}
        snapshots={snapshots}
        i18n={i18n}
        settingsCopy={settingsCopy}
        resolvedThemeMode={resolvedThemeMode}
        themeCustomSeedDraft={themeCustomSeedDraft}
        onSyncIntervalChange={onSyncIntervalChange}
        onWarningThresholdChange={onWarningThresholdChange}
        onLocalePreferenceChange={onLocalePreferenceChange}
        onThemeModeChange={onThemeModeChange}
        onThemePresetChange={onThemePresetChange}
        onPopupProgressStyleChange={onPopupProgressStyleChange}
        onSidebarProgressStyleChange={onSidebarProgressStyleChange}
        onFullPageProgressStyleChange={onFullPageProgressStyleChange}
        onPopupSizePresetChange={onPopupSizePresetChange}
        onPopupCornerStyleChange={onPopupCornerStyleChange}
        onPopupShadowStyleChange={onPopupShadowStyleChange}
        onActionBadgeSelectionChange={onActionBadgeSelectionChange}
        onThemeCustomSeedDraftChange={setThemeCustomSeedDraft}
        onApplyThemeCustomSeed={handleApplyThemeCustomSeed}
        onResetThemeCustomSeed={handleResetThemeCustomSeed}
      />

      <SettingsVisibilitySection
        sectionId={SETTINGS_SECTION_IDS.visibility}
        eyebrow={i18n.t("settings.visibility.eyebrow")}
        providers={providers}
        enabledDetail={i18n.t("settings.visibility.enabled_detail")}
        disabledDetail={i18n.t("settings.visibility.disabled_detail")}
        onToggleProvider={onToggleProvider}
      />

      <SettingsCredentialsSection
        sectionId={SETTINGS_SECTION_IDS.credentials}
        eyebrow={i18n.t("settings.credentials.eyebrow")}
        title={i18n.t("settings.credentials.title")}
        detail={i18n.t("settings.credentials.detail")}
        credentialProviders={credentialProviders}
        codexProvider={codexProvider}
        credentialInputs={credentialInputs}
        codexAnalyticsApiKeyInput={codexAnalyticsApiKeyInput}
        codexWorkspaceIdInput={codexWorkspaceIdInput}
        labels={settingsCopy.credentials}
        onSaveProviderApiKey={handleSaveProviderApiKey}
        onClearProviderApiKey={handleClearProviderApiKey}
        onProviderApiKeyInputChange={handleProviderApiKeyInputChange}
        onSaveCodexConfig={handleSaveCodexConfig}
        onClearCodexConfig={handleClearCodexConfig}
        onCodexAnalyticsApiKeyInputChange={setCodexAnalyticsApiKeyInput}
        onCodexWorkspaceIdInputChange={setCodexWorkspaceIdInput}
      />

      <SettingsSourceSection
        sectionId={SETTINGS_SECTION_IDS.sources}
        eyebrow={i18n.t("settings.sources.eyebrow")}
        title={i18n.t("settings.sources.title")}
        detail={i18n.t("settings.sources.detail")}
        providers={providers}
        snapshots={snapshots}
        i18n={i18n}
        settingsCopy={settingsCopy}
        sessionPageNavigationAvailable={sessionPageNavigationAvailable}
        activeSessionPageAttachAvailable={activeSessionPageAttachAvailable}
        onSetSourcePreference={onSetSourcePreference}
        onOpenSessionPage={onOpenSessionPage}
        onAttachActiveSessionPage={onAttachActiveSessionPage}
        onClearPageBinding={onClearPageBinding}
      />

      <SettingsPermissionsSection
        sectionId={SETTINGS_SECTION_IDS.permissions}
        eyebrow={i18n.t("settings.permissions.eyebrow")}
        title={i18n.t("settings.permissions.title")}
        detail={i18n.t("settings.permissions.detail")}
        providers={providers}
        labels={settingsCopy.permissions}
        onTogglePermission={onTogglePermission}
      />

      {toast ? (
        <Toast
          tone={toast.tone}
          title={toast.title}
          message={toast.message}
          onDismiss={onDismissToast}
        />
      ) : null}

      <SettingsBackToTopButton
        label={i18n.t("settings.actions.back_to_top")}
        shortLabel={i18n.t("settings.actions.back_to_top_short")}
        onClick={scrollToSettingsTop}
      />
    </main>
  );
}
