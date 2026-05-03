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
  THEME_PRESET_OPTIONS,
  buildCustomThemePalette,
  normalizeThemeCustomSeedHex,
  resolveThemeMode,
} from "../../shared/theme";
import { PROGRESS_DISPLAY_STYLE_OPTIONS } from "../../shared/progress-display";
import {
  POPUP_CORNER_STYLE_OPTIONS,
  POPUP_SHADOW_STYLE_OPTIONS,
  POPUP_SIZE_PRESET_OPTIONS,
} from "../../shared/popup-appearance";
import {
  SYNC_INTERVAL_MAX_MINUTES,
  SYNC_INTERVAL_MIN_MINUTES,
  SYNC_INTERVAL_PRESETS,
  WARNING_THRESHOLD_MAX_PERCENT,
  WARNING_THRESHOLD_MIN_PERCENT,
  WARNING_THRESHOLD_PRESETS,
} from "../../shared/settings-preferences";
import {
  buildActionBadgeSelectOptions,
  normalizeActionBadgeSelection,
} from "../../shared/action-badge-preferences";

import { EditableNumberCombobox } from "../components/EditableNumberCombobox";
import { MaterialSelect } from "../components/MaterialSelect";
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
import { useSettingsSectionNavigation } from "../use-settings-section-navigation";
import { SettingsSourceSection } from "../components/SettingsSourceSection";

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

  const [credentialInputs, setCredentialInputs] = useState<
    Record<ApiKeyProviderId, string>
  >({
    cursor: "",
    "claude-code": "",
  });
  const credentialProviders: CredentialProviderSection[] = [];
  const cursorProvider = findCredentialProvider("cursor");
  const claudeProvider = findCredentialProvider("claude-code");
  const codexProvider =
    providers.find(
      (provider): provider is ProviderSetting & { id: "codex" } =>
        provider.id === "codex",
    ) ?? null;
  const [codexAnalyticsApiKeyInput, setCodexAnalyticsApiKeyInput] = useState("");
  const [codexWorkspaceIdInput, setCodexWorkspaceIdInput] = useState("");
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
  const customThemePreviewPalette = normalizedThemeCustomSeedDraft
    ? buildCustomThemePalette(normalizedThemeCustomSeedDraft, resolvedThemeMode)
    : null;

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
  const themePresetOptionLabels: Record<ThemePreset, string> = {
    default: i18n.t("settings.preferences.theme_preset.default"),
    meadow: i18n.t("settings.preferences.theme_preset.meadow"),
    sunset: i18n.t("settings.preferences.theme_preset.sunset"),
    custom: i18n.t("settings.preferences.theme_preset.custom"),
  };
  const progressDisplayStyleOptionLabels: Record<ProgressDisplayStyle, string> = {
    line: i18n.t("settings.preferences.progress_style.line"),
    circle: i18n.t("settings.preferences.progress_style.circle"),
  };
  const popupSizePresetOptionLabels: Record<PopupSizePreset, string> = {
    compact: i18n.t("settings.preferences.popup_size.compact"),
    balanced: i18n.t("settings.preferences.popup_size.balanced"),
    wide: i18n.t("settings.preferences.popup_size.wide"),
  };
  const popupCornerStyleOptionLabels: Record<PopupCornerStyle, string> = {
    square: i18n.t("settings.preferences.popup_corner.square"),
    soft: i18n.t("settings.preferences.popup_corner.soft"),
    rounded: i18n.t("settings.preferences.popup_corner.rounded"),
  };
  const popupShadowStyleOptionLabels: Record<PopupShadowStyle, string> = {
    none: i18n.t("settings.preferences.popup_shadow.none"),
    soft: i18n.t("settings.preferences.popup_shadow.soft"),
    elevated: i18n.t("settings.preferences.popup_shadow.elevated"),
  };
  const localeOptions: Array<{ value: AppLocalePreference; label: string }> = [
    { value: "system", label: i18n.t("settings.preferences.locale.system") },
    { value: "en", label: i18n.t("settings.preferences.locale.en") },
    { value: "zh-CN", label: i18n.t("settings.preferences.locale.zh_cn") },
  ];
  const themeModeOptions: Array<{ value: ThemeMode; label: string }> = [
    { value: "system", label: i18n.t("settings.preferences.theme_mode.system") },
    { value: "light", label: i18n.t("settings.preferences.theme_mode.light") },
    { value: "dark", label: i18n.t("settings.preferences.theme_mode.dark") },
  ];
  const themePresetOptions = THEME_PRESET_OPTIONS.map((preset) => ({
    value: preset.value,
    label: themePresetOptionLabels[preset.value],
  }));
  const progressDisplayStyleOptions = PROGRESS_DISPLAY_STYLE_OPTIONS.map(
    (option) => ({
      value: option.value,
      label: progressDisplayStyleOptionLabels[option.value],
    }),
  );
  const popupSizePresetOptions = POPUP_SIZE_PRESET_OPTIONS.map((option) => ({
    value: option.value,
    label: popupSizePresetOptionLabels[option.value],
  }));
  const popupCornerStyleOptions = POPUP_CORNER_STYLE_OPTIONS.map((option) => ({
    value: option.value,
    label: popupCornerStyleOptionLabels[option.value],
  }));
  const popupShadowStyleOptions = POPUP_SHADOW_STYLE_OPTIONS.map((option) => ({
    value: option.value,
    label: popupShadowStyleOptionLabels[option.value],
  }));
  const actionBadgeState = {
    providers: snapshots,
    providerSettings: providers,
    settings,
  };
  const actionBadgeOptions = buildActionBadgeSelectOptions(
    actionBadgeState,
    i18n,
  );
  const normalizedActionBadgeSelection = normalizeActionBadgeSelection(
    settings.actionBadgeSelection,
  );
  const syncIntervalUnitLabel = i18n.t("settings.preferences.minutes");
  const syncIntervalOptions = SYNC_INTERVAL_PRESETS.map((preset) => ({
    value: preset,
    label: `${i18n.formatNumber(preset)} ${syncIntervalUnitLabel}`,
  }));
  const warningThresholdOptions = WARNING_THRESHOLD_PRESETS.map((preset) => ({
    value: preset,
    label: i18n.formatPercentValue(preset),
  }));
  const syncIntervalErrorText =
    i18n.resolvedLocale === "zh-CN"
      ? `请输入 ${i18n.formatNumber(SYNC_INTERVAL_MIN_MINUTES)}-${i18n.formatNumber(SYNC_INTERVAL_MAX_MINUTES)} ${syncIntervalUnitLabel}。`
      : `Enter ${i18n.formatNumber(SYNC_INTERVAL_MIN_MINUTES)}-${i18n.formatNumber(SYNC_INTERVAL_MAX_MINUTES)} ${syncIntervalUnitLabel}.`;
  const warningThresholdErrorText =
    i18n.resolvedLocale === "zh-CN"
      ? `请输入 ${i18n.formatNumber(WARNING_THRESHOLD_MIN_PERCENT)}-${i18n.formatNumber(WARNING_THRESHOLD_MAX_PERCENT)}%。`
      : `Enter ${i18n.formatNumber(WARNING_THRESHOLD_MIN_PERCENT)}-${i18n.formatNumber(WARNING_THRESHOLD_MAX_PERCENT)}%.`;
  const syncIntervalMenuButtonLabel =
    i18n.resolvedLocale === "zh-CN"
      ? "展开默认同步间隔预设"
      : "Show default sync interval presets";
  const warningThresholdMenuButtonLabel =
    i18n.resolvedLocale === "zh-CN"
      ? "展开告警阈值预设"
      : "Show warning threshold presets";
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

  function handleSaveProviderApiKey(
    providerId: ApiKeyProviderId,
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    const apiKey = credentialInputs[providerId].trim();

    if (!apiKey) {
      return;
    }

    onSaveProviderAdminApiKey(providerId, apiKey);
    setCredentialInputs((current) => ({
      ...current,
      [providerId]: "",
    }));
  }

  function handleClearProviderApiKey(providerId: ApiKeyProviderId) {
    setCredentialInputs((current) => ({
      ...current,
      [providerId]: "",
    }));
    onClearProviderAdminApiKey(providerId);
  }

  function handleSaveCodexConfig(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const analyticsApiKey = codexAnalyticsApiKeyInput.trim();
    const workspaceId = codexWorkspaceIdInput.trim();

    if (!analyticsApiKey || !workspaceId) {
      return;
    }

    onSaveCodexWorkspaceConfig(analyticsApiKey, workspaceId);
    setCodexAnalyticsApiKeyInput("");
    setCodexWorkspaceIdInput("");
  }

  function handleClearCodexConfig() {
    setCodexAnalyticsApiKeyInput("");
    setCodexWorkspaceIdInput("");
    onClearCodexWorkspaceConfig();
  }

  function handleProviderApiKeyInputChange(
    providerId: ApiKeyProviderId,
    value: string,
  ) {
    setCredentialInputs((current) => ({
      ...current,
      [providerId]: value,
    }));
  }

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
      <section
        className="status-card settings-section-anchor"
        id={SETTINGS_SECTION_IDS.preferences}
      >
        <p className="section-label">{i18n.t("settings.preferences.eyebrow")}</p>
        <div className="settings-grid">
          <EditableNumberCombobox
            label={i18n.t("settings.preferences.sync_interval_label")}
            value={settings.syncIntervalMinutes}
            minimum={SYNC_INTERVAL_MIN_MINUTES}
            maximum={SYNC_INTERVAL_MAX_MINUTES}
            unitLabel={syncIntervalUnitLabel}
            errorText={syncIntervalErrorText}
            menuButtonLabel={syncIntervalMenuButtonLabel}
            fieldIdPrefix="sync-interval"
            options={syncIntervalOptions}
            onChange={onSyncIntervalChange}
          />

          <EditableNumberCombobox
            label={i18n.t("settings.preferences.warning_threshold_label")}
            value={settings.warningThresholdPercent}
            minimum={WARNING_THRESHOLD_MIN_PERCENT}
            maximum={WARNING_THRESHOLD_MAX_PERCENT}
            unitLabel="%"
            errorText={warningThresholdErrorText}
            menuButtonLabel={warningThresholdMenuButtonLabel}
            fieldIdPrefix="warning-threshold"
            options={warningThresholdOptions}
            onChange={onWarningThresholdChange}
          />

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

          <MaterialSelect
            label={i18n.t("settings.preferences.accent_preset_label")}
            value={settings.themePreset}
            fieldIdPrefix="theme-preset"
            options={themePresetOptions}
            onChange={onThemePresetChange}
          />

          <MaterialSelect
            label={i18n.t("settings.preferences.popup_progress_style_label")}
            value={settings.popupProgressStyle}
            fieldIdPrefix="popup-progress-style"
            options={progressDisplayStyleOptions}
            onChange={onPopupProgressStyleChange}
          />

          <MaterialSelect
            label={i18n.t("settings.preferences.sidebar_progress_style_label")}
            value={settings.sidebarProgressStyle}
            fieldIdPrefix="sidebar-progress-style"
            options={progressDisplayStyleOptions}
            onChange={onSidebarProgressStyleChange}
          />

          <MaterialSelect
            label={i18n.t("settings.preferences.full_page_progress_style_label")}
            value={settings.fullPageProgressStyle}
            fieldIdPrefix="full-page-progress-style"
            options={progressDisplayStyleOptions}
            onChange={onFullPageProgressStyleChange}
          />

          <MaterialSelect
            label={i18n.t("settings.preferences.popup_size_label")}
            value={settings.popupSizePreset}
            fieldIdPrefix="popup-size-preset"
            options={popupSizePresetOptions}
            onChange={onPopupSizePresetChange}
          />

          <MaterialSelect
            label={i18n.t("settings.preferences.popup_corner_label")}
            value={settings.popupCornerStyle}
            fieldIdPrefix="popup-corner-style"
            options={popupCornerStyleOptions}
            onChange={onPopupCornerStyleChange}
          />

          <MaterialSelect
            label={i18n.t("settings.preferences.popup_shadow_label")}
            value={settings.popupShadowStyle}
            fieldIdPrefix="popup-shadow-style"
            options={popupShadowStyleOptions}
            onChange={onPopupShadowStyleChange}
          />

          <MaterialSelect
            label={i18n.t("settings.preferences.action_badge_label")}
            value={normalizedActionBadgeSelection}
            fieldIdPrefix="action-badge-selection"
            options={actionBadgeOptions}
            onChange={onActionBadgeSelectionChange}
          />
        </div>

        <div
          className="popup-appearance-preview-card"
          data-popup-size-preset={settings.popupSizePreset}
          data-popup-corner-style={settings.popupCornerStyle}
          data-popup-shadow-style={settings.popupShadowStyle}
        >
          <div className="dashboard-section__header">
            <div>
              <p className="section-label">
                {i18n.t("settings.popup_appearance_preview.eyebrow")}
              </p>
              <h2 className="section-title">
                {i18n.t("settings.popup_appearance_preview.title")}
              </h2>
            </div>
            <p className="supporting-copy">
              {i18n.t("settings.popup_appearance_preview.detail")}
            </p>
          </div>

          <div
            className="popup-appearance-preview-frame"
            aria-label={i18n.t("settings.popup_appearance_preview.title")}
          >
            <div className="popup-appearance-preview-surface">
              <div className="popup-appearance-preview-header">
                <div>
                  <p className="section-label">
                    {i18n.t("popup.header.eyebrow")}
                  </p>
                  <h3 className="section-title">
                    {i18n.t("popup.header.title")}
                  </h3>
                </div>
                <div className="popup-appearance-preview-actions">
                  <span>{i18n.t("settings.popup_appearance_preview.sample_refresh")}</span>
                  <span>{i18n.t("settings.popup_appearance_preview.sample_tab")}</span>
                </div>
              </div>

              <div className="popup-appearance-preview-provider">
                <div>
                  <p className="popup-appearance-preview-provider__title">
                    {i18n.t("settings.popup_appearance_preview.sample_provider")}
                  </p>
                  <p className="supporting-copy">
                    {i18n.t("settings.popup_appearance_preview.sample_quota")}
                  </p>
                </div>
                <div className="popup-appearance-preview-progress">
                  <span />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="theme-customization-card"
          data-theme-stability-surface="settings-theme-customization-card"
        >
          <div className="dashboard-section__header">
            <div>
              <p className="section-label">{i18n.t("settings.theme_customization.eyebrow")}</p>
              <h2 className="section-title">{i18n.t("settings.theme_customization.title")}</h2>
            </div>
            <p className="supporting-copy">{i18n.t("settings.theme_customization.detail")}</p>
          </div>

          <form
            className="theme-customization-form"
            onSubmit={handleApplyThemeCustomSeed}
          >
            <label className="form-field">
              <span className="form-field__label">{i18n.t("settings.theme_customization.seed_label")}</span>
              <input
                className="form-field__control"
                type="text"
                inputMode="text"
                autoComplete="off"
                spellCheck={false}
                value={themeCustomSeedDraft}
                placeholder="#4F46E5"
                onChange={(event) => setThemeCustomSeedDraft(event.target.value)}
              />
            </label>

            <div className="credential-actions">
              <button
                className="text-button"
                type="submit"
                disabled={!normalizedThemeCustomSeedDraft}
              >
                {i18n.t("settings.theme_customization.apply")}
              </button>
              <button
                className="text-button"
                type="button"
                disabled={settings.themeCustomSeedHex === null}
                onClick={handleResetThemeCustomSeed}
              >
                {i18n.t("settings.theme_customization.reset")}
              </button>
            </div>
          </form>

          <p className="supporting-copy">
            {normalizedThemeCustomSeedDraft
              ? settingsCopy.themeCustomization.previewingSeed(
                  normalizedThemeCustomSeedDraft,
                  resolvedThemeMode,
                )
              : settings.themePreset === "custom"
                ? settingsCopy.themeCustomization.customSeedMissing
                : settingsCopy.themeCustomization.enterValidSeed}
          </p>

          {customThemePreviewPalette ? (
            <div className="theme-preview-grid" aria-label={i18n.t("settings.theme_customization.preview.aria")}>
              <div className="theme-preview-swatch">
                <span
                  className="theme-preview-swatch__color"
                  style={{
                    backgroundColor: customThemePreviewPalette.primary,
                    color: customThemePreviewPalette.onPrimary,
                  }}
                >
                  Aa
                </span>
                <div>
                  <p className="theme-preview-swatch__label">{i18n.t("settings.theme_customization.preview.primary")}</p>
                  <p className="supporting-copy">
                    {customThemePreviewPalette.primary}
                  </p>
                </div>
              </div>

              <div className="theme-preview-swatch">
                <span
                  className="theme-preview-swatch__color"
                  style={{
                    backgroundColor: customThemePreviewPalette.secondaryContainer,
                    color: customThemePreviewPalette.onSecondaryContainer,
                  }}
                >
                  Aa
                </span>
                <div>
                  <p className="theme-preview-swatch__label">
                    {i18n.t("settings.theme_customization.preview.secondary_container")}
                  </p>
                  <p className="supporting-copy">
                    {customThemePreviewPalette.secondaryContainer}
                  </p>
                </div>
              </div>

              <div className="theme-preview-swatch">
                <span
                  className="theme-preview-swatch__color"
                  style={{
                    backgroundColor: customThemePreviewPalette.tertiary,
                    color: customThemePreviewPalette.onTertiary,
                  }}
                >
                  Aa
                </span>
                <div>
                  <p className="theme-preview-swatch__label">{i18n.t("settings.theme_customization.preview.tertiary")}</p>
                  <p className="supporting-copy">
                    {customThemePreviewPalette.tertiary}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

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
