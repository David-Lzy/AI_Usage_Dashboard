import { useCallback, useEffect, useRef } from "react";

import type {
  ActionBadgeSelections,
  ActionBadgeSelectionMode,
  ApiGatewayMeteringDisplayPreferences,
  ApiKeyProviderId,
  CredentialProviderId,
  AppLocalePreference,
  AppSettings,
  PopupCornerStyle,
  PopupProviderBrowsingMode,
  PopupCircularProgressItemsPerRow,
  PopupShadowStyle,
  PopupSizePreset,
  ProgressColorAppearance,
  ProgressColorBand,
  ProgressDisplayStyle,
  ProgressItemsBySurface,
  ProviderId,
  ProviderAccountId,
  ProviderAccountsByProvider,
  ProviderOrderBySurface,
  ProviderSourcePreference,
  ProviderSetting,
  ProviderSnapshot,
  ThemeMode,
  ThemePreset,
  ToolbarIconMode,
  UiFontFamily,
  UsageHistoryModulesBySurface,
  ProviderServiceStatusVisibilityBySurface,
} from "../../providers/types";
import type { Sub2ApiDeploymentDraft } from "../../shared/sub2api-deployments";
import type {
  CustomSourceSetting,
  CustomSourceSyncState,
} from "../../shared/custom-sources";
import { getPreferredScrollBehavior } from "../motion";
import {
  SettingsBackToTopButton,
  SettingsSectionNavigation,
} from "../components/SettingsNavigation";
import {
  SettingsCredentialsSection,
  SettingsOverviewSection,
} from "../components/SettingsSections";
import { AdaptiveControlGrid } from "../components/AdaptiveControlGrid";
import { MaterialSelect } from "../components/MaterialSelect";
import { SettingsQuickSetupSection } from "../components/SettingsQuickSetupSection";
import { SETTINGS_SECTION_IDS } from "../settings-section-ids";
import { Toast } from "../components/Toast";
import { TopBar } from "../components/TopBar";
import {
  settingsRouteFocusRequiresAdvanced,
  type SettingsRouteFocus,
} from "../route-state";
import {
  getSettingsRouteFocusElement,
  getSettingsRouteFocusKey,
} from "../settings-route-focus";
import { SettingsSourceSection } from "../components/SettingsSourceSection";
import { SettingsPreferencesSection } from "../components/SettingsPreferencesSection";
import { SettingsProviderDisplaySection } from "../components/SettingsProviderDisplaySection";
import { CustomSourceSettingsSection } from "../components/CustomSourceSettingsSection";
import { CodexBarDashboardBridgeSettings } from "../components/CodexBarDashboardBridgeSettings";
import { MaterialInfoTooltip } from "../components/MaterialInfoTooltip";
import { BUILD_INFO } from "../../shared/build-info";
import { useSettingsPage } from "../use-settings-page";
import type { MaterialActionIconName } from "../../shared/components/MaterialActionIcon";

type SettingsToast = {
  tone: "success" | "error";
  title: string;
  message: string;
};

type SettingsPageProps = {
  onBack: () => void;
  onOpenCredentialSettings?: (providerId: CredentialProviderId) => void;
  routeFocus?: SettingsRouteFocus;
  themeActionLabel?: string;
  themeActionTitle?: string;
  themeActionIconName?: MaterialActionIconName;
  onToggleThemeMode?: () => void;
  onOpenFullPage?: () => void;
  surfaceActionLabel?: string;
  surfaceActionTitle?: string;
  surfaceActionIconName?: MaterialActionIconName;
  settings: AppSettings;
  providers: ProviderSetting[];
  customSources?: CustomSourceSetting[];
  customSourceStates?: CustomSourceSyncState[];
  snapshots: ProviderSnapshot[];
  providerAccounts?: ProviderAccountsByProvider;
  toast: SettingsToast | null;
  onDismissToast: () => void;
  onSavePreferences: () => void;
  onSyncIntervalChange: (minutes: number) => void;
  onLocalePreferenceChange: (locale: AppLocalePreference) => void;
  onUserLevelChange: (userLevel: AppSettings["userLevel"]) => void;
  onWarningThresholdChange: (percent: number) => void;
  onThemeModeChange: (themeMode: ThemeMode) => void;
  onMotionModeChange: (motionMode: AppSettings["motionMode"]) => void;
  onThemePresetChange: (themePreset: ThemePreset) => void;
  onUiFontFamilyChange: (uiFontFamily: UiFontFamily) => void;
  onResetTimeDisplayModeChange?: (
    resetTimeDisplayMode: AppSettings["resetTimeDisplayMode"],
  ) => void;
  onQuotaPaceForecastEnabledChange?: (enabled: boolean) => void;
  onPopupProgressStyleChange: (progressStyle: ProgressDisplayStyle) => void;
  onSidebarProgressStyleChange: (progressStyle: ProgressDisplayStyle) => void;
  onFullPageProgressStyleChange: (progressStyle: ProgressDisplayStyle) => void;
  onPopupSizePresetChange: (sizePreset: PopupSizePreset) => void;
  onPopupProviderBrowsingModeChange: (
    browsingMode: PopupProviderBrowsingMode,
  ) => void;
  onPopupCornerStyleChange: (cornerStyle: PopupCornerStyle) => void;
  onPopupCircularProgressItemsPerRowChange: (
    itemsPerRow: PopupCircularProgressItemsPerRow,
  ) => void;
  onPopupShadowStyleChange: (shadowStyle: PopupShadowStyle) => void;
  onProviderOrderBySurfaceChange: (
    providerOrderBySurface: ProviderOrderBySurface,
  ) => void;
  onProgressItemsBySurfaceChange: (
    progressItemsBySurface: ProgressItemsBySurface,
  ) => void;
  onUsageHistoryModulesBySurfaceChange?: (
    usageHistoryModulesBySurface: UsageHistoryModulesBySurface,
  ) => void;
  onProviderServiceStatusVisibilityBySurfaceChange?: (
    value: ProviderServiceStatusVisibilityBySurface,
  ) => void;
  onCustomSourcesChange: (customSources: CustomSourceSetting[]) => void;
  onProgressThicknessPxChange: (progressThicknessPx: number) => void;
  onProgressColorAppearanceChange: (
    colorAppearance: ProgressColorAppearance,
  ) => void;
  onProgressColorBandsChange: (progressColorBands: ProgressColorBand[]) => void;
  onActionBadgeSelectionsChange: (
    actionBadgeSelections: ActionBadgeSelections,
  ) => void;
  onActionBadgeSelectionModeChange: (
    actionBadgeSelectionMode: ActionBadgeSelectionMode,
  ) => void;
  onActionBadgeRotationIntervalSecondsChange: (seconds: number) => void;
  onExportConfiguration: () => void;
  onImportConfigurationJson: (rawJson: string) => void;
  onSaveConfigurationToChromeSync: () => void;
  onRestoreConfigurationFromChromeSync: () => void;
  onResetConfigurationToInitial: () => void;
  onToolbarIconModeChange: (toolbarIconMode: ToolbarIconMode) => void;
  onToolbarIconProviderIdChange: (
    toolbarIconProviderId: AppSettings["toolbarIconProviderId"],
  ) => void;
  onToolbarIconCustomImageDataUrlChange: (
    toolbarIconCustomImageDataUrl: string | null,
  ) => void;
  onSaveThemeCustomSeed: (themeCustomSeedHex: string) => void;
  onToggleProvider: (providerId: ProviderId) => void;
  onSelectProviderAccount?: (
    providerId: ProviderId,
    accountId: ProviderAccountId,
  ) => void;
  onSaveSub2ApiDeployment?: (
    draft: Sub2ApiDeploymentDraft,
    testConnection: boolean,
  ) => void;
  onTestSub2ApiDeployment?: () => void;
  onDisconnectSub2ApiDeployment?: (
    accountId: ProviderAccountId,
    retainCachedSummary: boolean,
  ) => void;
  onRemoveSub2ApiDeployment?: (accountId: ProviderAccountId) => void;
  onSub2ApiMeteringDisplayPreferencesChange?: (
    accountId: ProviderAccountId,
    preferences: ApiGatewayMeteringDisplayPreferences,
  ) => void;
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
  onTestProviderConnection?: (providerId: ApiKeyProviderId) => void;
  onSaveCodexWorkspaceConfig: (
    analyticsApiKey: string,
    workspaceId: string,
  ) => void;
  onClearCodexWorkspaceConfig: () => void;
  onSaveCodexSessionToken: (accessToken: string) => void;
  onClearCodexSessionToken: () => void;
  onClearPageBinding: (providerId: ProviderId) => void;
  onOpenSessionPage: (providerId: ProviderId) => void;
  onAttachActiveSessionPage: (providerId: ProviderId) => void;
  sessionPageNavigationAvailable: boolean;
  activeSessionPageAttachAvailable: boolean;
};

export function SettingsPage({
  onBack,
  onOpenCredentialSettings = () => undefined,
  routeFocus,
  themeActionLabel,
  themeActionTitle,
  themeActionIconName,
  onToggleThemeMode,
  onOpenFullPage,
  surfaceActionLabel,
  surfaceActionTitle,
  surfaceActionIconName,
  settings,
  providers,
  customSources = [],
  customSourceStates = [],
  snapshots,
  providerAccounts,
  toast,
  onDismissToast,
  onSavePreferences,
  onSyncIntervalChange,
  onLocalePreferenceChange,
  onUserLevelChange,
  onWarningThresholdChange,
  onThemeModeChange,
  onMotionModeChange,
  onThemePresetChange,
  onUiFontFamilyChange,
  onResetTimeDisplayModeChange = () => undefined,
  onQuotaPaceForecastEnabledChange = () => undefined,
  onPopupProgressStyleChange,
  onSidebarProgressStyleChange,
  onFullPageProgressStyleChange,
  onPopupSizePresetChange,
  onPopupProviderBrowsingModeChange,
  onPopupCornerStyleChange,
  onPopupCircularProgressItemsPerRowChange,
  onPopupShadowStyleChange,
  onProviderOrderBySurfaceChange,
  onProgressItemsBySurfaceChange,
  onUsageHistoryModulesBySurfaceChange = () => undefined,
  onProviderServiceStatusVisibilityBySurfaceChange = () => undefined,
  onCustomSourcesChange,
  onProgressThicknessPxChange,
  onProgressColorAppearanceChange,
  onProgressColorBandsChange,
  onActionBadgeSelectionsChange,
  onActionBadgeSelectionModeChange,
  onActionBadgeRotationIntervalSecondsChange,
  onExportConfiguration,
  onImportConfigurationJson,
  onSaveConfigurationToChromeSync,
  onRestoreConfigurationFromChromeSync,
  onResetConfigurationToInitial,
  onToolbarIconModeChange,
  onToolbarIconProviderIdChange,
  onToolbarIconCustomImageDataUrlChange,
  onSaveThemeCustomSeed,
  onToggleProvider,
  onSelectProviderAccount = () => undefined,
  onSaveSub2ApiDeployment = () => undefined,
  onTestSub2ApiDeployment = () => undefined,
  onDisconnectSub2ApiDeployment = () => undefined,
  onRemoveSub2ApiDeployment = () => undefined,
  onSub2ApiMeteringDisplayPreferencesChange = () => undefined,
  onTogglePermission,
  onSetSourcePreference,
  onSaveProviderAdminApiKey,
  onClearProviderAdminApiKey,
  onTestProviderConnection = () => undefined,
  onSaveCodexWorkspaceConfig,
  onClearCodexWorkspaceConfig,
  onSaveCodexSessionToken,
  onClearCodexSessionToken,
  onClearPageBinding,
  onOpenSessionPage,
  onAttachActiveSessionPage,
  sessionPageNavigationAvailable,
  activeSessionPageAttachAvailable,
}: SettingsPageProps) {
  const routeFocusKey = getSettingsRouteFocusKey(routeFocus);
  const lastScrolledRouteFocusKeyRef = useRef<string | null>(null);
  const {
    codexAnalyticsApiKeyInput,
    codexWorkspaceIdInput,
    codexSessionTokenInput,
    credentialInputs,
    handleClearCodexConfig,
    handleClearCodexSessionToken,
    handleClearProviderApiKey,
    handleProviderApiKeyInputChange,
    handleSaveCodexConfig,
    handleSaveCodexSessionToken,
    handleSaveProviderApiKey,
    setCodexAnalyticsApiKeyInput,
    setCodexSessionTokenInput,
    setCodexWorkspaceIdInput,
    activeSettingsSection,
    scrollToSection,
    scrollToSettingsTop,
    i18n,
    settingsCopy,
    providerSourceDisplayCopy,
    localeOptions,
    themeModeOptions,
    userLevelVisibility,
    showAdvancedContainer,
    codexProvider,
    credentialProviders,
    settingsSectionNavItems,
    settingsSummaryItems,
    advancedOpen,
    setAdvancedOpen,
    settingsSurfaceSession,
    advancedGroupCount,
    quickSetupFocusedProviderId,
    credentialFocusedProviderId,
    sourceFocusedProviderId,
  } = useSettingsPage({
    settings,
    providers,
    snapshots,
    routeFocus,
    onSaveProviderAdminApiKey,
    onClearProviderAdminApiKey,
    onSaveCodexWorkspaceConfig,
    onClearCodexWorkspaceConfig,
    onSaveCodexSessionToken,
    onClearCodexSessionToken,
  });

  useEffect(() => {
    if (
      !routeFocus ||
      !routeFocusKey ||
      !settingsSurfaceSession.hasRestored ||
      typeof document === "undefined" ||
      typeof window === "undefined"
    ) {
      if (!routeFocusKey) {
        lastScrolledRouteFocusKeyRef.current = null;
      }

      return undefined;
    }

    if (lastScrolledRouteFocusKeyRef.current === routeFocusKey) {
      return undefined;
    }

    if (settingsRouteFocusRequiresAdvanced(routeFocus) && !advancedOpen) {
      return undefined;
    }

    const targetElement = getSettingsRouteFocusElement(routeFocus, document);

    if (!targetElement) {
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      targetElement.scrollIntoView({
        block: "start",
        behavior: getPreferredScrollBehavior(window, settings.motionMode),
      });
      lastScrolledRouteFocusKeyRef.current = routeFocusKey;
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [advancedOpen, routeFocusKey, settingsSurfaceSession.hasRestored]);

  const handleSettingsCarouselIndexChange = useCallback(
    (carouselId: string, index: number) => {
      settingsSurfaceSession.setCarouselIndexById((current) =>
        current[carouselId] === index
          ? current
          : {
              ...current,
              [carouselId]: index,
            },
      );
    },
    [settingsSurfaceSession.setCarouselIndexById],
  );
  const handleQuickSetupCarouselIndexChange = useCallback(
    (index: number) => handleSettingsCarouselIndexChange("quickSetup", index),
    [handleSettingsCarouselIndexChange],
  );
  const handleCredentialsCarouselIndexChange = useCallback(
    (index: number) => handleSettingsCarouselIndexChange("credentials", index),
    [handleSettingsCarouselIndexChange],
  );
  const handleSourcesCarouselIndexChange = useCallback(
    (index: number) => handleSettingsCarouselIndexChange("sources", index),
    [handleSettingsCarouselIndexChange],
  );
  const userLevelOptions: Array<{
    value: AppSettings["userLevel"];
    label: string;
  }> = [
    {
      value: "basic",
      label: settingsCopy.layout.userLevel.options.basic,
    },
    {
      value: "advanced",
      label: settingsCopy.layout.userLevel.options.advanced,
    },
    {
      value: "developer",
      label: settingsCopy.layout.userLevel.options.developer,
    },
    {
      value: "debug",
      label: settingsCopy.layout.userLevel.options.debug,
    },
  ];
  const overviewControlMeasurementLabels = [
    userLevelOptions.find((option) => option.value === settings.userLevel)?.label,
    localeOptions.find((option) => option.value === settings.locale)?.label,
    themeModeOptions.find((option) => option.value === settings.themeMode)?.label,
  ].filter((label): label is string => Boolean(label));

  return (
    <main className="app-shell settings-shell">
      <TopBar
        title={i18n.t("settings.topbar.title")}
        subtitle={i18n.t("settings.topbar.subtitle")}
        themeActionLabel={themeActionLabel}
        themeActionTitle={themeActionTitle}
        themeActionIconName={themeActionIconName}
        expandActionLabel={surfaceActionLabel ?? i18n.t("common.actions.tab")}
        expandActionTitle={
          surfaceActionTitle ?? i18n.t("common.actions.open_settings_tab")
        }
        expandActionIconName={surfaceActionIconName}
        secondaryActionLabel={i18n.t("common.actions.back")}
        secondaryActionIconName="keyboard-backspace"
        primaryActionLabel={i18n.t("common.actions.save")}
        primaryActionIconName="save"
        sticky
        bottomContent={
          <SettingsSectionNavigation
            ariaLabel={settingsCopy.layout.sectionsAria}
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
        sectionId={SETTINGS_SECTION_IDS.overview}
        ariaLabel={settingsCopy.layout.overview.aria}
        detail={settingsCopy.layout.overview.detail}
        eyebrow={settingsCopy.layout.overview.eyebrow}
        items={settingsSummaryItems}
        title={settingsCopy.layout.overview.title}
      >
        <AdaptiveControlGrid
          className="settings-overview__controls"
          measurementLabels={overviewControlMeasurementLabels}
        >
          <div className="settings-overview__level-control">
            <MaterialSelect
              label={settingsCopy.layout.userLevel.label}
              labelAccessory={
                <MaterialInfoTooltip>
                  {settingsCopy.layout.userLevel.helpText}
                </MaterialInfoTooltip>
              }
              value={settings.userLevel}
              fieldIdPrefix="settings-user-level"
              sessionPopoverId="settings-user-level"
              activePopover={settingsSurfaceSession.preferences.activePopover}
              onActivePopoverChange={
                settingsSurfaceSession.preferences.setActivePopover
              }
              options={userLevelOptions}
              onChange={onUserLevelChange}
            />
          </div>
          <MaterialSelect
            label={i18n.t("settings.preferences.locale_label")}
            value={settings.locale}
            fieldIdPrefix="locale-preference"
            sessionPopoverId="locale-preference"
            activePopover={settingsSurfaceSession.preferences.activePopover}
            onActivePopoverChange={
              settingsSurfaceSession.preferences.setActivePopover
            }
            options={localeOptions}
            onChange={onLocalePreferenceChange}
          />
          <MaterialSelect
            label={i18n.t("settings.preferences.theme_mode_label")}
            labelAccessory={
              <MaterialInfoTooltip>
                {i18n.t("settings.preferences.theme_mode_helper")}
              </MaterialInfoTooltip>
            }
            value={settings.themeMode}
            fieldIdPrefix="theme-mode"
            sessionPopoverId="theme-mode"
            activePopover={settingsSurfaceSession.preferences.activePopover}
            onActivePopoverChange={
              settingsSurfaceSession.preferences.setActivePopover
            }
            options={themeModeOptions}
            onChange={onThemeModeChange}
          />
        </AdaptiveControlGrid>
      </SettingsOverviewSection>

      <SettingsPreferencesSection
        sectionId={SETTINGS_SECTION_IDS.appearance}
        settings={settings}
        providers={providers}
        snapshots={snapshots}
        i18n={i18n}
        settingsCopy={settingsCopy}
        surfaceSessionState={settingsSurfaceSession.preferences}
        userLevelVisibility={userLevelVisibility}
        onSyncIntervalChange={onSyncIntervalChange}
        onWarningThresholdChange={onWarningThresholdChange}
        onMotionModeChange={onMotionModeChange}
        onThemePresetChange={onThemePresetChange}
        onUiFontFamilyChange={onUiFontFamilyChange}
        onResetTimeDisplayModeChange={onResetTimeDisplayModeChange}
        onQuotaPaceForecastEnabledChange={onQuotaPaceForecastEnabledChange}
        onPopupProgressStyleChange={onPopupProgressStyleChange}
        onSidebarProgressStyleChange={onSidebarProgressStyleChange}
        onFullPageProgressStyleChange={onFullPageProgressStyleChange}
        onPopupSizePresetChange={onPopupSizePresetChange}
        onPopupProviderBrowsingModeChange={onPopupProviderBrowsingModeChange}
        onPopupCornerStyleChange={onPopupCornerStyleChange}
        onPopupCircularProgressItemsPerRowChange={
          onPopupCircularProgressItemsPerRowChange
        }
        onPopupShadowStyleChange={onPopupShadowStyleChange}
        onProgressThicknessPxChange={onProgressThicknessPxChange}
        onProgressColorAppearanceChange={onProgressColorAppearanceChange}
        onProgressColorBandsChange={onProgressColorBandsChange}
        onActionBadgeSelectionsChange={onActionBadgeSelectionsChange}
        onActionBadgeSelectionModeChange={onActionBadgeSelectionModeChange}
        onActionBadgeRotationIntervalSecondsChange={
          onActionBadgeRotationIntervalSecondsChange
        }
        onExportConfiguration={onExportConfiguration}
        onImportConfigurationJson={onImportConfigurationJson}
        onSaveConfigurationToChromeSync={onSaveConfigurationToChromeSync}
        onRestoreConfigurationFromChromeSync={onRestoreConfigurationFromChromeSync}
        onResetConfigurationToInitial={onResetConfigurationToInitial}
        onToolbarIconModeChange={onToolbarIconModeChange}
        onToolbarIconProviderIdChange={onToolbarIconProviderIdChange}
        onToolbarIconCustomImageDataUrlChange={
          onToolbarIconCustomImageDataUrlChange
        }
        onThemeCustomSeedChange={onSaveThemeCustomSeed}
      />

      <SettingsQuickSetupSection
        focusedProviderId={quickSetupFocusedProviderId}
        sectionId={SETTINGS_SECTION_IDS.quickSetup}
        providers={providers}
        providerSourceDisplayCopy={providerSourceDisplayCopy}
        snapshots={snapshots}
        settingsCopy={settingsCopy}
        textDirection={i18n.resolvedTextDirection}
        userLevel={settings.userLevel}
        carouselIndex={settingsSurfaceSession.carouselIndexById.quickSetup}
        sessionPageNavigationAvailable={sessionPageNavigationAvailable}
        activeSessionPageAttachAvailable={activeSessionPageAttachAvailable}
        onCarouselIndexChange={handleQuickSetupCarouselIndexChange}
        onToggleProvider={onToggleProvider}
        onTogglePermission={onTogglePermission}
        onOpenSessionPage={onOpenSessionPage}
        onAttachActiveSessionPage={onAttachActiveSessionPage}
        onClearPageBinding={onClearPageBinding}
        onOpenCredentialSettings={onOpenCredentialSettings}
      />

      <SettingsProviderDisplaySection
        sectionId={SETTINGS_SECTION_IDS.providerDisplay}
        settings={settings}
        providers={providers}
        providerSourceDisplayCopy={providerSourceDisplayCopy}
        snapshots={snapshots}
        providerAccounts={providerAccounts}
        locale={i18n.resolvedLocale}
        customSources={customSources}
        customSourceStates={customSourceStates}
        settingsCopy={settingsCopy}
        providerProgressDetailsOpen={
          settingsSurfaceSession.providerProgressDetailsOpen
        }
        onProviderOrderBySurfaceChange={onProviderOrderBySurfaceChange}
        onProgressItemsBySurfaceChange={onProgressItemsBySurfaceChange}
        onUsageHistoryModulesBySurfaceChange={
          onUsageHistoryModulesBySurfaceChange
        }
        onProviderServiceStatusVisibilityBySurfaceChange={
          onProviderServiceStatusVisibilityBySurfaceChange
        }
        onProviderProgressDetailsOpenChange={
          settingsSurfaceSession.setProviderProgressDetailsOpen
        }
        onSelectProviderAccount={onSelectProviderAccount}
        onSaveSub2ApiDeployment={onSaveSub2ApiDeployment}
        onTestSub2ApiDeployment={onTestSub2ApiDeployment}
        onDisconnectSub2ApiDeployment={onDisconnectSub2ApiDeployment}
        onRemoveSub2ApiDeployment={onRemoveSub2ApiDeployment}
        onSub2ApiMeteringDisplayPreferencesChange={
          onSub2ApiMeteringDisplayPreferencesChange
        }
      />

      <CustomSourceSettingsSection
        customSources={customSources}
        customSourceStates={customSourceStates}
        locale={i18n.resolvedLocale}
        onChange={onCustomSourcesChange}
      />

      <CodexBarDashboardBridgeSettings
        customSources={customSources}
        customSourceStates={customSourceStates}
        locale={i18n.resolvedLocale}
      />

      {showAdvancedContainer ? (
        <section
          className="status-card settings-section-anchor settings-advanced"
          id={SETTINGS_SECTION_IDS.advanced}
        >
          <div className="dashboard-section__header">
            <div>
              <p className="section-label">{settingsCopy.layout.advanced.eyebrow}</p>
              <div className="section-title-with-info">
                <h2 className="section-title">
                  {settingsCopy.layout.advanced.title}
                </h2>
                <MaterialInfoTooltip>
                  {settingsCopy.layout.advanced.detail}
                </MaterialInfoTooltip>
              </div>
            </div>
          </div>

          <details
            className="source-card__details settings-advanced__details"
            open={advancedOpen}
            onToggle={(event) =>
              setAdvancedOpen((event.currentTarget as HTMLDetailsElement).open)
            }
          >
            <summary className="source-card__details-toggle">
              <span>
                {advancedOpen
                  ? settingsCopy.layout.advanced.hide
                  : settingsCopy.layout.advanced.show}
              </span>
              <span className="meta-chip">
                {settingsCopy.layout.advanced.itemCount(advancedGroupCount)}
              </span>
            </summary>

            <div className="source-card__details-body settings-advanced__body">
              <SettingsCredentialsSection
                focusedProviderId={credentialFocusedProviderId}
                sectionId="settings-advanced-credentials"
                eyebrow={i18n.t("settings.credentials.eyebrow")}
                title={i18n.t("settings.credentials.title")}
                detail={i18n.t("settings.credentials.detail")}
                credentialProviders={credentialProviders}
                codexProvider={codexProvider}
                credentialInputs={credentialInputs}
                codexAnalyticsApiKeyInput={codexAnalyticsApiKeyInput}
                codexWorkspaceIdInput={codexWorkspaceIdInput}
                codexSessionTokenInput={codexSessionTokenInput}
                carouselIndex={settingsSurfaceSession.carouselIndexById.credentials}
                labels={settingsCopy.credentials}
                locale={i18n.resolvedLocale}
                codexSessionLabels={{
                  title: i18n.t("settings.credentials.codex_session_title"),
                  state: i18n.t("settings.credentials.codex_session_state"),
                  help: i18n.t("settings.credentials.codex_session_help"),
                  input: i18n.t("settings.credentials.codex_session_input"),
                  placeholder: i18n.t(
                    "settings.credentials.codex_session_placeholder",
                  ),
                  save: i18n.t("settings.credentials.codex_session_save"),
                  clear: i18n.t("settings.credentials.codex_session_clear"),
                  footer: i18n.t("settings.credentials.codex_session_footer"),
                }}
                textDirection={i18n.resolvedTextDirection}
                onCarouselIndexChange={handleCredentialsCarouselIndexChange}
                onSaveProviderApiKey={handleSaveProviderApiKey}
                onClearProviderApiKey={handleClearProviderApiKey}
                onTestProviderConnection={onTestProviderConnection}
                onProviderApiKeyInputChange={handleProviderApiKeyInputChange}
                onSaveCodexConfig={handleSaveCodexConfig}
                onClearCodexConfig={handleClearCodexConfig}
                onSaveCodexSessionToken={handleSaveCodexSessionToken}
                onClearCodexSessionToken={handleClearCodexSessionToken}
                onCodexAnalyticsApiKeyInputChange={setCodexAnalyticsApiKeyInput}
                onCodexSessionTokenInputChange={setCodexSessionTokenInput}
                onCodexWorkspaceIdInputChange={setCodexWorkspaceIdInput}
              />

              <SettingsSourceSection
                focusedProviderId={sourceFocusedProviderId}
                sectionId="settings-advanced-sources"
                eyebrow={i18n.t("settings.sources.eyebrow")}
                title={i18n.t("settings.sources.title")}
                detail={i18n.t("settings.sources.detail")}
                providers={providers}
                snapshots={snapshots}
                i18n={i18n}
                settingsCopy={settingsCopy}
                carouselIndex={settingsSurfaceSession.carouselIndexById.sources}
                userLevelVisibility={userLevelVisibility}
                activePopover={settingsSurfaceSession.preferences.activePopover}
                onActivePopoverChange={
                  settingsSurfaceSession.preferences.setActivePopover
                }
                sessionPageNavigationAvailable={sessionPageNavigationAvailable}
                activeSessionPageAttachAvailable={activeSessionPageAttachAvailable}
                onCarouselIndexChange={handleSourcesCarouselIndexChange}
                onSetSourcePreference={onSetSourcePreference}
                onOpenSessionPage={onOpenSessionPage}
                onAttachActiveSessionPage={onAttachActiveSessionPage}
                onClearPageBinding={onClearPageBinding}
              />
            </div>
          </details>
        </section>
      ) : null}

      {toast ? (
        <Toast
          tone={toast.tone}
          title={toast.title}
          message={toast.message}
          onDismiss={onDismissToast}
        />
      ) : null}

      <section className="settings-about">
        <div className="settings-about__title">
          AI Usage Dashboard {BUILD_INFO.version}
        </div>
        <div>
          {"© 2026 "}
          <a
            href={BUILD_INFO.sourceOrigin}
            target="_blank"
            rel="noopener noreferrer"
          >
            David-Lzy
          </a>
          {" · "}
          <a
            href={`${BUILD_INFO.sourceOrigin}/blob/main/LICENSE`}
            target="_blank"
            rel="noopener noreferrer"
            className="settings-about__link--primary"
          >
            AGPL-3.0
          </a>
          {" · "}
          <a
            href={BUILD_INFO.sourceOrigin}
            target="_blank"
            rel="noopener noreferrer"
            className="settings-about__link--primary"
          >
            GitHub
          </a>
        </div>
        <div className="settings-about__meta">
          {BUILD_INFO.gitCommit} · {BUILD_INFO.buildTimestamp.slice(0, 10)}
        </div>
      </section>

      <SettingsBackToTopButton
        label={i18n.t("settings.actions.back_to_top")}
        shortLabel={i18n.t("settings.actions.back_to_top_short")}
        onClick={scrollToSettingsTop}
      />
    </main>
  );
}
