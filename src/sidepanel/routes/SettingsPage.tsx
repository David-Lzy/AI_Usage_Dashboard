import { ControlVisibilityBoundary } from "../../shared/control-visibility";
import { SettingsSaveFeedback } from "../components/SettingsSaveFeedback";
import type { SettingsSaveStatus } from "../settings-save-feedback";
import { useEffect, useRef } from "react";

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
  PopupProviderAccountPresentationMode,
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
import { SettingsBackToTopButton } from "../components/SettingsNavigation";
import {
  SettingsCredentialsSection,
  SettingsOverviewSection,
} from "../components/SettingsSections";
import { AdaptiveControlGrid } from "../components/AdaptiveControlGrid";
import { FusionSelect as MaterialSelect } from "../components/material-ui/FusionControls";
import { useFusionTheme } from "../components/material-ui/fusion-theme";
import { SettingsQuickSetupSection } from "../components/SettingsQuickSetupSection";
import { SETTINGS_SECTION_IDS } from "../settings-section-ids";
import { Toast } from "../components/Toast";
import { TopBar } from "../components/TopBar";
import { type SettingsRouteFocus } from "../route-state";
import { getSettingsRouteFocusKey } from "../settings-route-focus";
import { SettingsSourceSection } from "../components/SettingsSourceSection";
import { SettingsPreferencesSection } from "../components/SettingsPreferencesSection";
import { SettingsProviderDisplaySection } from "../components/SettingsProviderDisplaySection";
import { CustomSourceSettingsSection } from "../components/CustomSourceSettingsSection";
import { CodexBarDashboardBridgeSettings } from "../components/CodexBarDashboardBridgeSettings";
import { LocalCompanionBridgeSettings } from "../components/LocalCompanionBridgeSettings";
import { MaterialInfoTooltip } from "../components/MaterialInfoTooltip";
import { BUILD_INFO } from "../../shared/build-info";
import { useSettingsPage } from "../use-settings-page";
import type { MaterialActionIconName } from "../../shared/components/MaterialActionIcon";
import { SettingsCategoryNavigation } from "../components/SettingsCategoryNavigation";
import { SettingsProviderConnectionControls } from "../components/SettingsProviderConnectionControls";
import { DiagnosticsExportControl } from "../components/DiagnosticsExportControl";
import { getSettingsCategoryCopy } from "../../shared/settings-category-localized-copy";
import "./settings-fusion.css";
import { useMotionInteractions } from "../../shared/use-motion-effects";

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
  saveStatus?: SettingsSaveStatus;
  onRetrySettingsSave?: () => void;
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
  onPopupProviderAccountPresentationModeChange?: (
    providerId: ProviderId,
    mode: PopupProviderAccountPresentationMode,
  ) => void;
  onSaveSub2ApiDeployment?: (
    draft: Sub2ApiDeploymentDraft,
    testConnection: boolean,
  ) => void;
  onTestSub2ApiDeployment?: () => Promise<boolean>;
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
  saveStatus = "idle",
  onRetrySettingsSave = () => undefined,
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
  onPopupProviderAccountPresentationModeChange = () => undefined,
  onSaveSub2ApiDeployment = () => undefined,
  onTestSub2ApiDeployment = async () => false,
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
  const settingsShellRef = useRef<HTMLElement>(null);
  useFusionTheme(settingsShellRef);
  useMotionInteractions(settingsShellRef);
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
    activeCategory,
    isCategoryRestoring,
    selectCategory,
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
    settingsSummaryItems,
    settingsSurfaceSession,
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

  const previousCategory = useRef(activeCategory);
  useEffect(() => {
    if (previousCategory.current === activeCategory) return;
    previousCategory.current = activeCategory;
    settingsSurfaceSession.preferences.setActivePopover(null);
    settingsSurfaceSession.preferences.setToolbarPopupPreviewOpen(false);
  }, [activeCategory]);

  useEffect(() => {
    const shell = settingsShellRef.current;
    const bar = shell?.querySelector<HTMLElement>(".top-app-bar");
    const mobileNavigation = shell?.querySelector<HTMLElement>(
      ".settings-category-mobile",
    );

    if (!shell || !bar) {
      return;
    }

    const updateAnchorOffset = () => {
      const headerOffset = Math.ceil(bar.getBoundingClientRect().height + 24);
      shell.style.setProperty("--settings-header-offset", `${headerOffset}px`);
      const navigationHeight =
        mobileNavigation?.getBoundingClientRect().height ?? 0;
      shell.style.setProperty(
        "--settings-anchor-offset",
        `${Math.ceil(headerOffset + navigationHeight + 16)}px`,
      );
    };
    updateAnchorOffset();

    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(updateAnchorOffset);
    observer?.observe(bar);
    if (mobileNavigation) observer?.observe(mobileNavigation);
    window.addEventListener("resize", updateAnchorOffset);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateAnchorOffset);
    };
  }, []);

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
    userLevelOptions.find((option) => option.value === settings.userLevel)
      ?.label,
    localeOptions.find((option) => option.value === settings.locale)?.label,
  ].filter((label): label is string => Boolean(label));

  const categoryCopy = getSettingsCategoryCopy(i18n.resolvedLocale);
  const focusedProviderId =
    routeFocus && "providerId" in routeFocus ? routeFocus.providerId : null;
  const renderConnectionConfiguration = (provider: ProviderSetting) => (
    <>
      <SettingsProviderConnectionControls
        provider={provider}
        snapshot={
          snapshots.find((snapshot) => snapshot.providerId === provider.id) ??
          null
        }
        locale={i18n.resolvedLocale}
        settings={settings}
        providerAccounts={providerAccounts}
        onSelectAccount={onSelectProviderAccount}
        onOpenPresentationSettings={() => selectCategory("appearance")}
        onPopupAccountPresentationModeChange={
          onPopupProviderAccountPresentationModeChange
        }
        onSave={onSaveSub2ApiDeployment}
        onTest={onTestSub2ApiDeployment}
        onDisconnect={onDisconnectSub2ApiDeployment}
        onRemove={onRemoveSub2ApiDeployment}
      />
      {showAdvancedContainer ? (
        <>
          <SettingsCredentialsSection
            embedded
            providerFilter={provider.id}
            i18n={i18n}
            eyebrow={i18n.t("settings.credentials.eyebrow")}
            title={i18n.t("settings.credentials.title")}
            detail={i18n.t("settings.credentials.detail")}
            credentialProviders={credentialProviders}
            codexProvider={codexProvider}
            credentialInputs={credentialInputs}
            codexAnalyticsApiKeyInput={codexAnalyticsApiKeyInput}
            codexWorkspaceIdInput={codexWorkspaceIdInput}
            codexSessionTokenInput={codexSessionTokenInput}
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
            embedded
            eyebrow={i18n.t("settings.sources.eyebrow")}
            title={i18n.t("settings.sources.title")}
            detail={i18n.t("settings.sources.detail")}
            providers={[provider]}
            providerAccounts={providerAccounts}
            snapshots={snapshots}
            i18n={i18n}
            settingsCopy={settingsCopy}
            userLevelVisibility={userLevelVisibility}
            activePopover={settingsSurfaceSession.preferences.activePopover}
            onActivePopoverChange={
              settingsSurfaceSession.preferences.setActivePopover
            }
            sessionPageNavigationAvailable={sessionPageNavigationAvailable}
            activeSessionPageAttachAvailable={activeSessionPageAttachAvailable}
            onSetSourcePreference={onSetSourcePreference}
            onOpenSessionPage={onOpenSessionPage}
            onAttachActiveSessionPage={onAttachActiveSessionPage}
            onClearPageBinding={onClearPageBinding}
          />
        </>
      ) : null}
    </>
  );

  return (
    <main
      className="app-shell settings-shell fusion-theme settings-fusion"
      ref={settingsShellRef}
    >
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
        primaryActionContent={
          <SettingsSaveFeedback
            status={saveStatus}
            locale={i18n.resolvedLocale}
            onRetry={onRetrySettingsSave}
          />
        }
        sticky
        onThemeAction={onToggleThemeMode}
        onExpandAction={onOpenFullPage}
        onSecondaryAction={onBack}
      />

      <div
        className="settings-category-layout"
        data-category-restoring={isCategoryRestoring}
        aria-busy={isCategoryRestoring}
        aria-hidden={isCategoryRestoring || undefined}
        inert={isCategoryRestoring}
      >
        <SettingsCategoryNavigation
          locale={i18n.resolvedLocale}
          label={settingsCopy.layout.sectionsAria}
          value={activeCategory}
          onChange={selectCategory}
        />
        <div className="settings-category-content">
          <h2
            className="settings-category-heading"
            tabIndex={-1}
            aria-live="polite"
            aria-atomic="true"
          >
            {categoryCopy[activeCategory]}
          </h2>
          <ControlVisibilityBoundary
            data-settings-category-panel="connections"
            hidden={activeCategory !== "connections"}
          >
            {showAdvancedContainer ? (
              <div
                id={SETTINGS_SECTION_IDS.advanced}
                className="settings-section-anchor"
              />
            ) : null}
            <SettingsQuickSetupSection
              focusedProviderId={focusedProviderId}
              routeFocusKey={routeFocusKey}
              renderConfiguration={renderConnectionConfiguration}
              i18n={i18n}
              sectionId={SETTINGS_SECTION_IDS.quickSetup}
              providers={providers}
              providerSourceDisplayCopy={providerSourceDisplayCopy}
              snapshots={snapshots}
              settingsCopy={settingsCopy}
              userLevel={settings.userLevel}
              sessionPageNavigationAvailable={sessionPageNavigationAvailable}
              activeSessionPageAttachAvailable={
                activeSessionPageAttachAvailable
              }
              onToggleProvider={onToggleProvider}
              onTogglePermission={onTogglePermission}
              onOpenSessionPage={onOpenSessionPage}
              onAttachActiveSessionPage={onAttachActiveSessionPage}
              onClearPageBinding={onClearPageBinding}
              onOpenCredentialSettings={onOpenCredentialSettings}
            />

            <CustomSourceSettingsSection
              customSources={customSources}
              customSourceStates={customSourceStates}
              locale={i18n.resolvedLocale}
              onChange={onCustomSourcesChange}
            />

            {userLevelVisibility.showExperimentalLocalIntegrations ? (
              <>
                <CodexBarDashboardBridgeSettings
                  customSources={customSources}
                  customSourceStates={customSourceStates}
                  locale={i18n.resolvedLocale}
                />
                <LocalCompanionBridgeSettings
                  customSources={customSources}
                  customSourceStates={customSourceStates}
                  locale={i18n.resolvedLocale}
                />
              </>
            ) : null}
            {userLevelVisibility.showDebugDiagnostics ? (
              <DiagnosticsExportControl
                i18n={i18n}
                state={{
                  providers: snapshots,
                  providerSettings: providers,
                  providerAccounts,
                }}
              />
            ) : null}
          </ControlVisibilityBoundary>
          <ControlVisibilityBoundary
            data-settings-category-panel="general"
            hidden={activeCategory !== "general"}
          >
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
                    activePopover={
                      settingsSurfaceSession.preferences.activePopover
                    }
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
                  activePopover={
                    settingsSurfaceSession.preferences.activePopover
                  }
                  onActivePopoverChange={
                    settingsSurfaceSession.preferences.setActivePopover
                  }
                  options={localeOptions}
                  onChange={onLocalePreferenceChange}
                />
              </AdaptiveControlGrid>
            </SettingsOverviewSection>
          </ControlVisibilityBoundary>

          <SettingsPreferencesSection
            activeCategory={activeCategory}
            onPopupProviderAccountPresentationModeChange={
              onPopupProviderAccountPresentationModeChange
            }
            displayControls={(surface) => (
              <SettingsProviderDisplaySection
                surface={surface}
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
                onSub2ApiMeteringDisplayPreferencesChange={
                  onSub2ApiMeteringDisplayPreferencesChange
                }
              />
            )}
            themeControl={
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
            }
            sectionId={SETTINGS_SECTION_IDS.appearance}
            usageSectionId={SETTINGS_SECTION_IDS.usageNotifications}
            settings={settings}
            providers={providers}
            snapshots={snapshots}
            providerAccounts={providerAccounts}
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
            onPopupProviderBrowsingModeChange={
              onPopupProviderBrowsingModeChange
            }
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
            onRestoreConfigurationFromChromeSync={
              onRestoreConfigurationFromChromeSync
            }
            onResetConfigurationToInitial={onResetConfigurationToInitial}
            onToolbarIconModeChange={onToolbarIconModeChange}
            onToolbarIconProviderIdChange={onToolbarIconProviderIdChange}
            onToolbarIconCustomImageDataUrlChange={
              onToolbarIconCustomImageDataUrlChange
            }
            onThemeCustomSeedChange={onSaveThemeCustomSeed}
          />
        </div>
      </div>

      {toast ? (
        <Toast
          i18n={i18n}
          tone={toast.tone}
          title={toast.title}
          message={toast.message}
          onDismiss={onDismissToast}
        />
      ) : null}

      <section className="settings-about" hidden={activeCategory !== "general"}>
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
        inline
        label={i18n.t("settings.actions.back_to_top")}
        shortLabel={i18n.t("settings.actions.back_to_top_short")}
        onClick={scrollToSettingsTop}
      />
    </main>
  );
}
