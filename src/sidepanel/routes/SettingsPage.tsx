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
import { createRuntimeI18n } from "../../shared/i18n";
import { buildSettingsLocalizedCopy } from "../../shared/localized-copy";
import { resolveThemeMode } from "../../shared/theme";

import {
  SettingsBackToTopButton,
  SettingsSectionNavigation,
} from "../components/SettingsNavigation";
import {
  SettingsCredentialsSection,
  SettingsOverviewSection,
  SettingsPermissionsSection,
  SettingsVisibilitySection,
} from "../components/SettingsSections";
import { SETTINGS_SECTION_IDS } from "../settings-section-ids";
import { Toast } from "../components/Toast";
import { TopBar } from "../components/TopBar";
import { buildSettingsPageViewModels } from "../settings-page-view-models";
import { useSettingsCredentialDrafts } from "../use-settings-credential-drafts";
import { useSettingsSectionNavigation } from "../use-settings-section-navigation";
import { useSettingsThemeCustomSeedDraft } from "../use-settings-theme-custom-seed-draft";
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
  const {
    activeSettingsSection,
    scrollToSection,
    scrollToSettingsTop,
  } = useSettingsSectionNavigation();
  const {
    handleApplyThemeCustomSeed,
    handleResetThemeCustomSeed,
    setThemeCustomSeedDraft,
    themeCustomSeedDraft,
  } = useSettingsThemeCustomSeedDraft({
    themeCustomSeedHex: settings.themeCustomSeedHex,
    onSaveThemeCustomSeed,
    onResetThemeCustomSeed,
  });
  const resolvedThemeMode = resolveThemeMode(
    settings.themeMode,
    typeof window !== "undefined" ? window : undefined,
  );
  const i18n = createRuntimeI18n(
    settings.locale,
    typeof window !== "undefined" ? window : undefined,
  );
  const settingsCopy = buildSettingsLocalizedCopy(i18n);
  const {
    codexProvider,
    credentialProviders,
    settingsSectionNavItems,
    settingsSummaryItems,
  } = buildSettingsPageViewModels({
    i18n,
    providers,
    settingsCopy,
    snapshots,
  });

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
