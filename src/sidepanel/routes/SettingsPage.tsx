import { type FormEvent, useEffect, useState } from "react";

import type {
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
  buildProviderSourceDisplay,
} from "../../shared/provider-sources";
import {
  buildSettingsSummaryLabels,
  createRuntimeI18n,
} from "../../shared/i18n";
import {
  buildSettingsLocalizedCopy,
  buildProviderSourceDisplayLocalizedCopy,
  getProviderDiagnosticPresentation,
  getSettingsSourcePreferenceLabel,
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

import { EditableNumberCombobox } from "../components/EditableNumberCombobox";
import { PermissionPrompt } from "../components/PermissionPrompt";
import { SummaryStrip } from "../components/SummaryStrip";
import { getPreferredScrollBehavior } from "../motion";
import {
  buildSettingsSourceCardModel,
  buildSettingsSummaryItems,
} from "../settings-view-models";
import { Toast } from "../components/Toast";
import { TopBar } from "../components/TopBar";

type SettingsToast = {
  tone: "success" | "error";
  title: string;
  message: string;
};

type CredentialProviderSection = {
  provider: ProviderSetting & { id: ApiKeyProviderId };
  title: string;
  inputLabel: string;
  helpText: string;
  footerText: string;
  placeholderMissing: string;
  placeholderConfigured: string;
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
  const SETTINGS_SECTION_IDS = {
    preferences: "settings-preferences",
    visibility: "settings-visibility",
    credentials: "settings-credentials",
    sources: "settings-sources",
    permissions: "settings-permissions",
  } as const;

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

  function findSnapshot(providerId: ProviderId): ProviderSnapshot | null {
    return (
      snapshots.find((provider) => provider.providerId === providerId) ?? null
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
  const providerSourceDisplayCopy =
    buildProviderSourceDisplayLocalizedCopy(i18n);
  const settingsSourceCardLabels = {
    ...settingsCopy.sources.cardLabels,
    sourceKindLabels: settingsCopy.sources.sourceKindLabels,
    routeFallback: settingsCopy.sources.routeFallback,
  };
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

  function scrollToSection(sectionId: string) {
    if (typeof document === "undefined") {
      return;
    }

    document.getElementById(sectionId)?.scrollIntoView({
      block: "start",
      behavior: getPreferredScrollBehavior(window),
    });
  }

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
        onThemeAction={onToggleThemeMode}
        onExpandAction={onOpenFullPage}
        onSecondaryAction={onBack}
        onPrimaryAction={onSavePreferences}
      />

      <section className="status-card settings-overview">
        <div className="dashboard-section__header">
          <div>
            <p className="section-label">{i18n.t("settings.overview.eyebrow")}</p>
            <h2 className="section-title">{i18n.t("settings.overview.title")}</h2>
          </div>
          <p className="supporting-copy">{i18n.t("settings.overview.detail")}</p>
        </div>

        <SummaryStrip
          ariaLabel={i18n.t("settings.overview.aria")}
          items={settingsSummaryItems}
        />

        <div className="settings-section-nav" aria-label={i18n.t("settings.sections.aria")}>
          <button
            className="settings-nav-chip"
            type="button"
            onClick={() => scrollToSection(SETTINGS_SECTION_IDS.preferences)}
          >
            {i18n.t("settings.sections.preferences")}
          </button>
          <button
            className="settings-nav-chip"
            type="button"
            onClick={() => scrollToSection(SETTINGS_SECTION_IDS.visibility)}
          >
            {i18n.t("settings.sections.visibility")}
          </button>
          <button
            className="settings-nav-chip"
            type="button"
            onClick={() => scrollToSection(SETTINGS_SECTION_IDS.credentials)}
          >
            {i18n.t("settings.sections.credentials")}
          </button>
          <button
            className="settings-nav-chip"
            type="button"
            onClick={() => scrollToSection(SETTINGS_SECTION_IDS.sources)}
          >
            {i18n.t("settings.sections.sources")}
          </button>
          <button
            className="settings-nav-chip"
            type="button"
            onClick={() => scrollToSection(SETTINGS_SECTION_IDS.permissions)}
          >
            {i18n.t("settings.sections.permissions")}
          </button>
        </div>
      </section>

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

          <label className="form-field">
            <span className="form-field__label">{i18n.t("settings.preferences.locale_label")}</span>
            <select
              className="form-field__control"
              value={settings.locale}
              onChange={(event) =>
                onLocalePreferenceChange(event.target.value as AppLocalePreference)
              }
            >
              {localeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span className="form-field__label">{i18n.t("settings.preferences.theme_mode_label")}</span>
            <select
              className="form-field__control"
              value={settings.themeMode}
              onChange={(event) =>
                onThemeModeChange(event.target.value as ThemeMode)
              }
            >
              <option value="system">{i18n.t("settings.preferences.theme_mode.system")}</option>
              <option value="light">{i18n.t("settings.preferences.theme_mode.light")}</option>
              <option value="dark">{i18n.t("settings.preferences.theme_mode.dark")}</option>
            </select>
          </label>

          <label className="form-field">
            <span className="form-field__label">{i18n.t("settings.preferences.accent_preset_label")}</span>
            <select
              className="form-field__control"
              value={settings.themePreset}
              onChange={(event) =>
                onThemePresetChange(event.target.value as ThemePreset)
              }
            >
              {THEME_PRESET_OPTIONS.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {themePresetOptionLabels[preset.value]}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span className="form-field__label">{i18n.t("settings.preferences.popup_progress_style_label")}</span>
            <select
              className="form-field__control"
              value={settings.popupProgressStyle}
              onChange={(event) =>
                onPopupProgressStyleChange(event.target.value as ProgressDisplayStyle)
              }
            >
              {PROGRESS_DISPLAY_STYLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {progressDisplayStyleOptionLabels[option.value]}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span className="form-field__label">{i18n.t("settings.preferences.sidebar_progress_style_label")}</span>
            <select
              className="form-field__control"
              value={settings.sidebarProgressStyle}
              onChange={(event) =>
                onSidebarProgressStyleChange(event.target.value as ProgressDisplayStyle)
              }
            >
              {PROGRESS_DISPLAY_STYLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {progressDisplayStyleOptionLabels[option.value]}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span className="form-field__label">{i18n.t("settings.preferences.full_page_progress_style_label")}</span>
            <select
              className="form-field__control"
              value={settings.fullPageProgressStyle}
              onChange={(event) =>
                onFullPageProgressStyleChange(event.target.value as ProgressDisplayStyle)
              }
            >
              {PROGRESS_DISPLAY_STYLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {progressDisplayStyleOptionLabels[option.value]}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span className="form-field__label">{i18n.t("settings.preferences.popup_size_label")}</span>
            <select
              className="form-field__control"
              value={settings.popupSizePreset}
              onChange={(event) =>
                onPopupSizePresetChange(event.target.value as PopupSizePreset)
              }
            >
              {POPUP_SIZE_PRESET_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {popupSizePresetOptionLabels[option.value]}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span className="form-field__label">{i18n.t("settings.preferences.popup_corner_label")}</span>
            <select
              className="form-field__control"
              value={settings.popupCornerStyle}
              onChange={(event) =>
                onPopupCornerStyleChange(event.target.value as PopupCornerStyle)
              }
            >
              {POPUP_CORNER_STYLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {popupCornerStyleOptionLabels[option.value]}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span className="form-field__label">{i18n.t("settings.preferences.popup_shadow_label")}</span>
            <select
              className="form-field__control"
              value={settings.popupShadowStyle}
              onChange={(event) =>
                onPopupShadowStyleChange(event.target.value as PopupShadowStyle)
              }
            >
              {POPUP_SHADOW_STYLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {popupShadowStyleOptionLabels[option.value]}
                </option>
              ))}
            </select>
          </label>
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

      <section
        className="status-card settings-section-anchor"
        id={SETTINGS_SECTION_IDS.visibility}
      >
        <p className="section-label">{i18n.t("settings.visibility.eyebrow")}</p>
        <div className="settings-list">
          {providers.map((provider) => (
            <label
              key={provider.id}
              className="switch-row"
              data-visibility-provider-id={provider.id}
              data-visibility-enabled={provider.enabled ? "true" : "false"}
            >
              <div>
                <p className="switch-row__title">{provider.label}</p>
                <p className="supporting-copy">
                  {provider.enabled
                    ? i18n.t("settings.visibility.enabled_detail")
                    : i18n.t("settings.visibility.disabled_detail")}
                </p>
              </div>
              <input
                className="switch-row__control"
                type="checkbox"
                checked={provider.enabled}
                data-visibility-toggle={provider.id}
                onChange={() => onToggleProvider(provider.id)}
              />
            </label>
          ))}
        </div>
      </section>

      {credentialProviders.length > 0 || codexProvider ? (
        <section
          className="dashboard-section settings-section-anchor"
          id={SETTINGS_SECTION_IDS.credentials}
        >
          <div className="dashboard-section__header">
            <div>
              <p className="section-label">{i18n.t("settings.credentials.eyebrow")}</p>
              <h2 className="section-title">{i18n.t("settings.credentials.title")}</h2>
            </div>
            <p className="supporting-copy">{i18n.t("settings.credentials.detail")}</p>
          </div>

          <div className="provider-shell-list">
            {credentialProviders.map((item, index) => {
              const isConfigured = item.provider.credentialStatus === "configured";
              const currentInput = credentialInputs[item.provider.id];
              const trimmedInput = currentInput.trim();

              return (
                <article key={item.provider.id} className="status-card">
                  <div className="dashboard-section__header">
                    <div>
                      <p className="section-label">
                        {settingsCopy.credentials.sectionLabel}
                      </p>
                      <h2 className="section-title">{item.title}</h2>
                    </div>
                    <p
                      className={`credential-state ${isConfigured ? "credential-state--configured" : "credential-state--missing"}`}
                    >
                      {isConfigured
                        ? settingsCopy.credentials.configured
                        : settingsCopy.credentials.missing}
                    </p>
                  </div>

                  <div className="credential-card">
                    <p className="supporting-copy">{item.helpText}</p>

                    <form
                      className="credential-form"
                      onSubmit={(event) =>
                        handleSaveProviderApiKey(item.provider.id, event)
                      }
                    >
                      <label className="form-field">
                        <span className="form-field__label">{item.inputLabel}</span>
                        <input
                          className="form-field__control"
                          type="password"
                          autoComplete="off"
                          spellCheck={false}
                          value={currentInput}
                          placeholder={
                            isConfigured
                              ? item.placeholderConfigured
                              : item.placeholderMissing
                          }
                          onChange={(event) =>
                            setCredentialInputs((current) => ({
                              ...current,
                              [item.provider.id]: event.target.value,
                            }))
                          }
                        />
                      </label>

                      <div className="credential-actions">
                        <button
                          className="text-button"
                          type="submit"
                          disabled={!trimmedInput}
                        >
                          {settingsCopy.credentials.saveKey}
                        </button>
                        <button
                          className="text-button"
                          type="button"
                          disabled={!isConfigured}
                          onClick={() => handleClearProviderApiKey(item.provider.id)}
                        >
                          {settingsCopy.credentials.clearStoredKey}
                        </button>
                      </div>
                    </form>

                    <p className="supporting-copy">{item.footerText}</p>
                  </div>
                </article>
              );
            })}

            {codexProvider ? (
              <article className="status-card">
                <div className="dashboard-section__header">
                  <div>
                    <p className="section-label">{settingsCopy.credentials.sectionLabel}</p>
                    <h2 className="section-title">
                      {settingsCopy.credentials.codexTitle}
                    </h2>
                  </div>
                  <p
                    className={`credential-state ${codexProvider.credentialStatus === "configured" ? "credential-state--configured" : "credential-state--missing"}`}
                  >
                    {codexProvider.credentialStatus === "configured"
                      ? settingsCopy.credentials.configured
                      : settingsCopy.credentials.missing}
                  </p>
                </div>

                <div className="credential-card">
                  <p className="supporting-copy">
                    {settingsCopy.credentials.codexHelpText}
                  </p>

                  <form className="credential-form" onSubmit={handleSaveCodexConfig}>
                    <label className="form-field">
                      <span className="form-field__label">{settingsCopy.credentials.analyticsApiKeyLabel}</span>
                      <input
                        className="form-field__control"
                        type="password"
                        autoComplete="off"
                        spellCheck={false}
                        value={codexAnalyticsApiKeyInput}
                        placeholder={
                          codexProvider.credentialStatus === "configured"
                            ? settingsCopy.credentials.codexAnalyticsPlaceholderConfigured
                            : settingsCopy.credentials.codexAnalyticsPlaceholderMissing
                        }
                        onChange={(event) =>
                          setCodexAnalyticsApiKeyInput(event.target.value)
                        }
                      />
                    </label>

                    <label className="form-field">
                      <span className="form-field__label">{settingsCopy.credentials.workspaceIdLabel}</span>
                      <input
                        className="form-field__control"
                        type="text"
                        autoComplete="off"
                        spellCheck={false}
                        value={codexWorkspaceIdInput}
                        placeholder={
                          codexProvider.credentialStatus === "configured"
                            ? settingsCopy.credentials.codexWorkspacePlaceholderConfigured
                            : settingsCopy.credentials.codexWorkspacePlaceholderMissing
                        }
                        onChange={(event) =>
                          setCodexWorkspaceIdInput(event.target.value)
                        }
                      />
                    </label>

                    <div className="credential-actions">
                      <button
                        className="text-button"
                        type="submit"
                        disabled={
                          !codexAnalyticsApiKeyInput.trim() ||
                          !codexWorkspaceIdInput.trim()
                        }
                      >
                        {settingsCopy.credentials.saveConfig}
                      </button>
                      <button
                        className="text-button"
                        type="button"
                        disabled={codexProvider.credentialStatus !== "configured"}
                        onClick={handleClearCodexConfig}
                      >
                        {settingsCopy.credentials.clearStoredConfig}
                      </button>
                    </div>
                  </form>

                  <p className="supporting-copy">
                    {settingsCopy.credentials.codexFooterText}
                  </p>
                </div>
              </article>
            ) : null}
          </div>
        </section>
      ) : null}

      <section
        className="dashboard-section settings-section-anchor"
        id={SETTINGS_SECTION_IDS.sources}
      >
        <div className="dashboard-section__header">
          <div>
            <p className="section-label">{i18n.t("settings.sources.eyebrow")}</p>
            <h2 className="section-title">{i18n.t("settings.sources.title")}</h2>
          </div>
          <p className="supporting-copy">{i18n.t("settings.sources.detail")}</p>
        </div>

        <div className="provider-shell-list">
          {providers.map((provider) => {
            const snapshot = findSnapshot(provider.id);

            if (!snapshot) {
              return null;
            }

            const sourceDisplay = buildProviderSourceDisplay(
              snapshot,
              provider,
              providerSourceDisplayCopy,
            );
            const sourceCardModel = buildSettingsSourceCardModel(
              sourceDisplay,
              settingsSourceCardLabels,
              getProviderDiagnosticPresentation(
                snapshot.warningDiagnostic,
                i18n,
              ),
              getProviderDiagnosticPresentation(
                snapshot.sourceSelectionDiagnostic,
                i18n,
              ),
              getProviderDiagnosticPresentation(
                snapshot.sourceFallbackDiagnostic,
                i18n,
              ),
            );
            const sessionPagePlan = sourceDisplay.sessionPagePlan;
            const canUseSessionPageAction =
              sessionPagePlan?.rolloutStage === "shipped";

            return (
              <article
                key={provider.id}
                className="source-card"
                data-provider-id={provider.id}
              >
                <div className="source-card__header">
                  <div>
                    <p className="source-card__provider">{provider.label}</p>
                    <p className="supporting-copy">
                      {sourceDisplay.currentContractDetail}
                    </p>
                  </div>
                  <div className="source-card__chips">
                    <span className="meta-chip">
                      {sourceDisplay.currentLabel}
                    </span>
                    <span className="meta-chip">
                      {sourceDisplay.currentContractLabel}
                    </span>
                    <span
                      className={`meta-chip ${sourceDisplay.fidelityTone === "error" ? "meta-chip--error" : sourceDisplay.fidelityTone === "warning" ? "meta-chip--warning" : ""}`.trim()}
                    >
                      {sourceDisplay.fidelityLabel}
                    </span>
                    <span
                      className={`meta-chip ${sourceDisplay.stateTone === "error" ? "meta-chip--error" : sourceDisplay.stateTone === "warning" ? "meta-chip--warning" : ""}`.trim()}
                    >
                      {sourceDisplay.stateLabel}
                    </span>
                  </div>
                </div>

                <div className="source-card__body">
                  <div className="source-card__summary-grid">
                    <div className="source-card__field">
                      <p className="source-card__label">{settingsCopy.sources.preferenceLabel}</p>
                      {sourceDisplay.sourcePreferenceOptions.length > 1 ? (
                        <label className="form-field">
                          <select
                            className="form-field__control"
                            value={sourceDisplay.sourcePreference}
                            onChange={(event) =>
                              onSetSourcePreference(
                                provider.id,
                                event.target.value as ProviderSourcePreference,
                              )
                            }
                          >
                            {sourceDisplay.sourcePreferenceOptions.map(
                              (preference) => (
                                <option key={preference} value={preference}>
                                  {getSettingsSourcePreferenceLabel(
                                    preference,
                                    settingsCopy,
                                  )}
                                </option>
                              ),
                            )}
                          </select>
                        </label>
                      ) : (
                        <p className="source-card__value">
                          {getSettingsSourcePreferenceLabel(
                            sourceDisplay.sourcePreference,
                            settingsCopy,
                          )}
                        </p>
                      )}
                    </div>
                    {sourceCardModel.primaryFields.map((field) => (
                      <div key={field.label} className="source-card__field">
                        <p className="source-card__label">{field.label}</p>
                        <p className="source-card__value">{field.value}</p>
                      </div>
                    ))}
                  </div>

                  {sourceCardModel.summaryNoteLines.length > 0 ? (
                    <div
                      className={`detail-note ${sourceCardModel.summaryNoteTone === "error" ? "detail-note--error" : sourceCardModel.summaryNoteTone === "warning" ? "detail-note--warning" : "detail-note--neutral"}`.trim()}
                      data-theme-stability-surface={
                        provider.id === "cursor"
                          ? "settings-cursor-operational-note"
                          : undefined
                      }
                    >
                      <p className="detail-note__label">{settingsCopy.sources.operationalNoteLabel}</p>
                      {sourceCardModel.summaryNoteLines.map((line) => (
                        <p key={line} className="supporting-copy">
                          {line}
                        </p>
                      ))}
                    </div>
                  ) : null}

                  {sessionPagePlan ? (
                    <div className="source-card__session">
                      <div className="source-card__session-header">
                        <div>
                          <p className="source-card__label">
                            {settingsCopy.sources.sessionPageTrackLabel}
                          </p>
                          <p className="source-card__value">
                            {sourceCardModel.sessionTrack?.title ?? sessionPagePlan.label}
                          </p>
                        </div>
                        <div className="source-card__session-chips">
                          {sourceCardModel.sessionTrack?.chips.map((chip) => (
                            <span
                              key={chip.label}
                              className={`meta-chip ${chip.tone === "error" ? "meta-chip--error" : chip.tone === "warning" ? "meta-chip--warning" : ""}`.trim()}
                            >
                              {chip.label}
                            </span>
                          ))}
                        </div>
                      </div>

                      {sourceCardModel.sessionTrack?.fields.length ? (
                        <div className="source-card__session-grid">
                          {sourceCardModel.sessionTrack.fields.map((field) => (
                            <div
                              key={field.label}
                              className="source-card__field"
                            >
                              <p className="source-card__label">{field.label}</p>
                              <p className="source-card__value">{field.value}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {sourceCardModel.sessionTrack?.noteLines.length ? (
                        <div
                          className={`detail-note ${sourceCardModel.sessionTrack.noteTone === "warning" ? "detail-note--warning" : sourceCardModel.sessionTrack.noteTone === "error" ? "detail-note--error" : "detail-note--neutral"}`.trim()}
                          data-theme-stability-surface={
                            provider.id === "cursor"
                              ? "settings-cursor-session-note"
                              : undefined
                          }
                        >
                          <p className="detail-note__label">{settingsCopy.sources.sessionPageNoteLabel}</p>
                          {sourceCardModel.sessionTrack.noteLines.map((line) => (
                            <p key={line} className="supporting-copy">
                              {line}
                            </p>
                          ))}
                        </div>
                      ) : null}

                      {canUseSessionPageAction ? (
                        <div className="credential-actions source-card__session-actions">
                          <button
                            className="text-button"
                            type="button"
                            disabled={!sessionPageNavigationAvailable}
                            onClick={() => onOpenSessionPage(provider.id)}
                          >
                            {sessionPageNavigationAvailable
                              ? settingsCopy.sources.findOrOpenPage
                              : settingsCopy.sources.extensionModeOnly}
                          </button>
                          <button
                            className="text-button"
                            type="button"
                            disabled={!activeSessionPageAttachAvailable}
                            onClick={() => onAttachActiveSessionPage(provider.id)}
                          >
                            {settingsCopy.sources.useActivePage}
                          </button>
                          <button
                            className="text-button"
                            type="button"
                            disabled={
                              sourceDisplay.pageBindingLabel === null ||
                              provider.pageBinding.status === "unbound"
                            }
                            onClick={() => onClearPageBinding(provider.id)}
                          >
                            {settingsCopy.sources.disconnectBinding}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <details className="source-card__details">
                    <summary className="source-card__details-toggle">
                      <span>{settingsCopy.sources.detailedDiagnostics}</span>
                      <span className="meta-chip">
                        {settingsCopy.sources.itemCount(
                          sourceCardModel.diagnosticsCount,
                        )}
                      </span>
                    </summary>

                    <div className="source-card__details-body">
                      {sourceCardModel.diagnosticGroups.map((group) => (
                        <section
                          key={group.title}
                          className="source-card__diagnostic-group"
                        >
                          <div className="source-card__diagnostic-group-header">
                            <p className="source-card__diagnostic-group-title">
                              {group.title}
                            </p>
                            <span className="meta-chip">
                              {settingsCopy.sources.itemCount(
                                group.fields.length + group.noteLines.length,
                              )}
                            </span>
                          </div>

                          {group.fields.length > 0 ? (
                            <div className="source-card__diagnostic-list">
                              {group.fields.map((field) => (
                                <div
                                  key={`${group.title}-${field.label}`}
                                  className="source-card__diagnostic-row"
                                >
                                  <p className="source-card__diagnostic-label">
                                    {field.label}
                                  </p>
                                  <p className="source-card__diagnostic-value">
                                    {field.value}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : null}

                          {group.noteLines.length > 0 ? (
                            <div className="detail-note detail-note--neutral">
                              <p className="detail-note__label">{group.title}</p>
                              {group.noteLines.map((line) => (
                                <p key={line} className="supporting-copy">
                                  {line}
                                </p>
                              ))}
                            </div>
                          ) : null}
                        </section>
                      ))}
                    </div>
                  </details>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section
        className="dashboard-section settings-section-anchor"
        id={SETTINGS_SECTION_IDS.permissions}
      >
        <div className="dashboard-section__header">
          <div>
            <p className="section-label">{i18n.t("settings.permissions.eyebrow")}</p>
            <h2 className="section-title">{i18n.t("settings.permissions.title")}</h2>
          </div>
          <p className="supporting-copy">{i18n.t("settings.permissions.detail")}</p>
        </div>

        <div className="provider-shell-list">
          {providers.map((provider) => (
            <PermissionPrompt
              key={provider.id}
              providerId={provider.id}
              providerLabel={provider.label}
              description={provider.description}
              hostsLabel={provider.hostsLabel}
              requiresHostAccess={(provider.hostOrigins?.length ?? 0) > 0}
              status={provider.status}
              labels={settingsCopy.permissions}
              onToggle={() => onTogglePermission(provider.id)}
            />
          ))}
        </div>
      </section>

      {toast ? (
        <Toast
          tone={toast.tone}
          title={toast.title}
          message={toast.message}
          onDismiss={onDismissToast}
        />
      ) : null}
    </main>
  );
}
