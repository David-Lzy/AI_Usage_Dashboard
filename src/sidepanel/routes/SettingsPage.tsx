import { useEffect, useState } from "react";

import type {
  ActionBadgeSelection,
  ApiKeyProviderId,
  AppLocalePreference,
  AppSettings,
  PopupCornerStyle,
  PopupCircularProgressItemsPerRow,
  PopupShadowStyle,
  PopupSizePreset,
  ProgressColorBand,
  ProgressDisplayStyle,
  ProgressItemsBySurface,
  ProviderId,
  ProviderOrderBySurface,
  ProviderSourcePreference,
  ProviderSetting,
  ProviderSnapshot,
  ThemeMode,
  ThemePreset,
  ToolbarIconMode,
  UiFontFamily,
} from "../../providers/types";
import { createRuntimeI18n } from "../../shared/i18n";
import { buildSettingsLocalizedCopy } from "../../shared/localized-copy";
import { getPreferredScrollBehavior } from "../motion";

import {
  SettingsBackToTopButton,
  SettingsSectionNavigation,
} from "../components/SettingsNavigation";
import {
  SettingsCredentialsSection,
  SettingsOverviewSection,
} from "../components/SettingsSections";
import { MaterialSelect } from "../components/MaterialSelect";
import { SettingsQuickSetupSection } from "../components/SettingsQuickSetupSection";
import { SETTINGS_SECTION_IDS } from "../settings-section-ids";
import { getSettingsUserLevelVisibility } from "../settings-user-level-visibility";
import { Toast } from "../components/Toast";
import { TopBar } from "../components/TopBar";
import { buildSettingsPreferenceOptions } from "../settings-preference-options";
import { buildSettingsPageViewModels } from "../settings-page-view-models";
import {
  settingsRouteFocusRequiresAdvanced,
  type SettingsRouteFocus,
} from "../route-state";
import { useSettingsCredentialDrafts } from "../use-settings-credential-drafts";
import { useSettingsSectionNavigation } from "../use-settings-section-navigation";
import { SettingsSourceSection } from "../components/SettingsSourceSection";
import { SettingsPreferencesSection } from "../components/SettingsPreferencesSection";
import { MaterialInfoTooltip } from "../components/MaterialInfoTooltip";

type SettingsToast = {
  tone: "success" | "error";
  title: string;
  message: string;
};

export function getSettingsRouteFocusElement(
  routeFocus: SettingsRouteFocus,
  documentRef: Document,
): HTMLElement | null {
  switch (routeFocus.kind) {
    case "section":
      return documentRef.getElementById(routeFocus.sectionId);
    case "quick-setup-provider":
      return (
        documentRef.querySelector<HTMLElement>(
          `[data-quick-setup-provider-id="${routeFocus.providerId}"]`,
        ) ?? documentRef.getElementById(SETTINGS_SECTION_IDS.quickSetup)
      );
    case "credential-provider":
      return documentRef.querySelector<HTMLElement>(
        `[data-credential-provider-id="${routeFocus.providerId}"]`,
      );
    case "source-provider":
      return documentRef.querySelector<HTMLElement>(
        `.source-card[data-provider-id="${routeFocus.providerId}"]`,
      );
  }
}

type SettingsPageProps = {
  onBack: () => void;
  routeFocus?: SettingsRouteFocus;
  themeActionLabel?: string;
  themeActionTitle?: string;
  onToggleThemeMode?: () => void;
  onOpenFullPage?: () => void;
  surfaceActionLabel?: string;
  surfaceActionTitle?: string;
  settings: AppSettings;
  providers: ProviderSetting[];
  snapshots: ProviderSnapshot[];
  toast: SettingsToast | null;
  onDismissToast: () => void;
  onSavePreferences: () => void;
  onSyncIntervalChange: (minutes: number) => void;
  onLocalePreferenceChange: (locale: AppLocalePreference) => void;
  onUserLevelChange: (userLevel: AppSettings["userLevel"]) => void;
  onWarningThresholdChange: (percent: number) => void;
  onThemeModeChange: (themeMode: ThemeMode) => void;
  onThemePresetChange: (themePreset: ThemePreset) => void;
  onUiFontFamilyChange: (uiFontFamily: UiFontFamily) => void;
  onPopupProgressStyleChange: (progressStyle: ProgressDisplayStyle) => void;
  onSidebarProgressStyleChange: (progressStyle: ProgressDisplayStyle) => void;
  onFullPageProgressStyleChange: (progressStyle: ProgressDisplayStyle) => void;
  onPopupSizePresetChange: (sizePreset: PopupSizePreset) => void;
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
  onProgressThicknessPxChange: (progressThicknessPx: number) => void;
  onProgressColorBandsChange: (progressColorBands: ProgressColorBand[]) => void;
  onActionBadgeSelectionChange: (
    actionBadgeSelection: ActionBadgeSelection,
  ) => void;
  onToolbarIconModeChange: (toolbarIconMode: ToolbarIconMode) => void;
  onToolbarIconProviderIdChange: (
    toolbarIconProviderId: AppSettings["toolbarIconProviderId"],
  ) => void;
  onToolbarIconCustomImageDataUrlChange: (
    toolbarIconCustomImageDataUrl: string | null,
  ) => void;
  onSaveThemeCustomSeed: (themeCustomSeedHex: string) => void;
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
  routeFocus,
  themeActionLabel,
  themeActionTitle,
  onToggleThemeMode,
  onOpenFullPage,
  surfaceActionLabel,
  surfaceActionTitle,
  settings,
  providers,
  snapshots,
  toast,
  onDismissToast,
  onSavePreferences,
  onSyncIntervalChange,
  onLocalePreferenceChange,
  onUserLevelChange,
  onWarningThresholdChange,
  onThemeModeChange,
  onThemePresetChange,
  onUiFontFamilyChange,
  onPopupProgressStyleChange,
  onSidebarProgressStyleChange,
  onFullPageProgressStyleChange,
  onPopupSizePresetChange,
  onPopupCornerStyleChange,
  onPopupCircularProgressItemsPerRowChange,
  onPopupShadowStyleChange,
  onProviderOrderBySurfaceChange,
  onProgressItemsBySurfaceChange,
  onProgressThicknessPxChange,
  onProgressColorBandsChange,
  onActionBadgeSelectionChange,
  onToolbarIconModeChange,
  onToolbarIconProviderIdChange,
  onToolbarIconCustomImageDataUrlChange,
  onSaveThemeCustomSeed,
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
  const i18n = createRuntimeI18n(
    settings.locale,
    typeof window !== "undefined" ? window : undefined,
  );
  const settingsCopy = buildSettingsLocalizedCopy(i18n);
  const { localeOptions, themeModeOptions } = buildSettingsPreferenceOptions({
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

  useEffect(() => {
    if (
      !routeFocus ||
      typeof document === "undefined" ||
      typeof window === "undefined"
    ) {
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
        behavior: getPreferredScrollBehavior(window),
      });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [advancedOpen, routeFocus]);

  return (
    <main className="app-shell settings-shell">
      <TopBar
        title={i18n.t("settings.topbar.title")}
        subtitle={i18n.t("settings.topbar.subtitle")}
        themeActionLabel={themeActionLabel}
        themeActionTitle={themeActionTitle}
        expandActionLabel={surfaceActionLabel ?? i18n.t("common.actions.tab")}
        expandActionTitle={
          surfaceActionTitle ?? i18n.t("common.actions.open_settings_tab")
        }
        secondaryActionLabel={i18n.t("common.actions.back")}
        primaryActionLabel={i18n.t("common.actions.save")}
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
        <div className="settings-overview__controls">
          <div className="settings-overview__level-control">
            <MaterialSelect
              label={settingsCopy.layout.userLevel.label}
              value={settings.userLevel}
              fieldIdPrefix="settings-user-level"
              options={[
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
              ]}
              onChange={onUserLevelChange}
            />
            <MaterialInfoTooltip className="settings-overview__user-level-help">
              {settingsCopy.layout.userLevel.helpText}
            </MaterialInfoTooltip>
          </div>
          <MaterialSelect
            label={i18n.t("settings.preferences.locale_label")}
            value={settings.locale}
            fieldIdPrefix="locale-preference"
            options={localeOptions}
            onChange={onLocalePreferenceChange}
          />
          <MaterialSelect
            label={i18n.t("settings.preferences.theme_mode_label")}
            value={settings.themeMode}
            fieldIdPrefix="theme-mode"
            options={themeModeOptions}
            onChange={onThemeModeChange}
          />
        </div>
      </SettingsOverviewSection>

      <SettingsQuickSetupSection
        focusedProviderId={quickSetupFocusedProviderId}
        sectionId={SETTINGS_SECTION_IDS.quickSetup}
        providers={providers}
        snapshots={snapshots}
        settingsCopy={settingsCopy}
        textDirection={i18n.resolvedTextDirection}
        userLevel={settings.userLevel}
        sessionPageNavigationAvailable={sessionPageNavigationAvailable}
        activeSessionPageAttachAvailable={activeSessionPageAttachAvailable}
        onToggleProvider={onToggleProvider}
        onTogglePermission={onTogglePermission}
        onOpenSessionPage={onOpenSessionPage}
        onAttachActiveSessionPage={onAttachActiveSessionPage}
        onClearPageBinding={onClearPageBinding}
      />

      <SettingsPreferencesSection
        sectionId={SETTINGS_SECTION_IDS.appearance}
        settings={settings}
        providers={providers}
        snapshots={snapshots}
        i18n={i18n}
        settingsCopy={settingsCopy}
        userLevelVisibility={userLevelVisibility}
        onSyncIntervalChange={onSyncIntervalChange}
        onWarningThresholdChange={onWarningThresholdChange}
        onThemePresetChange={onThemePresetChange}
        onUiFontFamilyChange={onUiFontFamilyChange}
        onPopupProgressStyleChange={onPopupProgressStyleChange}
        onSidebarProgressStyleChange={onSidebarProgressStyleChange}
        onFullPageProgressStyleChange={onFullPageProgressStyleChange}
        onPopupSizePresetChange={onPopupSizePresetChange}
        onPopupCornerStyleChange={onPopupCornerStyleChange}
        onPopupCircularProgressItemsPerRowChange={
          onPopupCircularProgressItemsPerRowChange
        }
        onPopupShadowStyleChange={onPopupShadowStyleChange}
        onProviderOrderBySurfaceChange={onProviderOrderBySurfaceChange}
        onProgressItemsBySurfaceChange={onProgressItemsBySurfaceChange}
        onProgressThicknessPxChange={onProgressThicknessPxChange}
        onProgressColorBandsChange={onProgressColorBandsChange}
        onActionBadgeSelectionChange={onActionBadgeSelectionChange}
        onToolbarIconModeChange={onToolbarIconModeChange}
        onToolbarIconProviderIdChange={onToolbarIconProviderIdChange}
        onToolbarIconCustomImageDataUrlChange={
          onToolbarIconCustomImageDataUrlChange
        }
        onThemeCustomSeedChange={onSaveThemeCustomSeed}
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
                labels={settingsCopy.credentials}
                textDirection={i18n.resolvedTextDirection}
                onSaveProviderApiKey={handleSaveProviderApiKey}
                onClearProviderApiKey={handleClearProviderApiKey}
                onProviderApiKeyInputChange={handleProviderApiKeyInputChange}
                onSaveCodexConfig={handleSaveCodexConfig}
                onClearCodexConfig={handleClearCodexConfig}
                onCodexAnalyticsApiKeyInputChange={setCodexAnalyticsApiKeyInput}
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
                userLevelVisibility={userLevelVisibility}
                sessionPageNavigationAvailable={sessionPageNavigationAvailable}
                activeSessionPageAttachAvailable={activeSessionPageAttachAvailable}
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

      <SettingsBackToTopButton
        label={i18n.t("settings.actions.back_to_top")}
        shortLabel={i18n.t("settings.actions.back_to_top_short")}
        onClick={scrollToSettingsTop}
      />
    </main>
  );
}
