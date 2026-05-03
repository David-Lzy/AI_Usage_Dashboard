import type { FormEvent } from "react";

import type {
  ActionBadgeSelection,
  AppLocalePreference,
  AppSettings,
  PopupCornerStyle,
  PopupShadowStyle,
  PopupSizePreset,
  ProgressDisplayStyle,
  ProviderSetting,
  ProviderSnapshot,
  ThemeMode,
  ThemePreset,
} from "../../providers/types";
import type { RuntimeI18n } from "../../shared/i18n";
import type { buildSettingsLocalizedCopy } from "../../shared/localized-copy";
import {
  buildActionBadgeSelectOptions,
  normalizeActionBadgeSelection,
} from "../../shared/action-badge-preferences";
import {
  POPUP_CORNER_STYLE_OPTIONS,
  POPUP_SHADOW_STYLE_OPTIONS,
  POPUP_SIZE_PRESET_OPTIONS,
} from "../../shared/popup-appearance";
import { PROGRESS_DISPLAY_STYLE_OPTIONS } from "../../shared/progress-display";
import {
  SYNC_INTERVAL_MAX_MINUTES,
  SYNC_INTERVAL_MIN_MINUTES,
  SYNC_INTERVAL_PRESETS,
  WARNING_THRESHOLD_MAX_PERCENT,
  WARNING_THRESHOLD_MIN_PERCENT,
  WARNING_THRESHOLD_PRESETS,
} from "../../shared/settings-preferences";
import {
  THEME_PRESET_OPTIONS,
  buildCustomThemePalette,
  normalizeThemeCustomSeedHex,
  type ResolvedThemeMode,
} from "../../shared/theme";
import type { SettingsSectionId } from "../settings-section-ids";
import { EditableNumberCombobox } from "./EditableNumberCombobox";
import { MaterialSelect } from "./MaterialSelect";

type SettingsPreferencesSectionProps = {
  i18n: RuntimeI18n;
  providers: ProviderSetting[];
  resolvedThemeMode: ResolvedThemeMode;
  sectionId: SettingsSectionId;
  settings: AppSettings;
  settingsCopy: ReturnType<typeof buildSettingsLocalizedCopy>;
  snapshots: ProviderSnapshot[];
  themeCustomSeedDraft: string;
  onActionBadgeSelectionChange: (
    actionBadgeSelection: ActionBadgeSelection,
  ) => void;
  onApplyThemeCustomSeed: (event: FormEvent<HTMLFormElement>) => void;
  onFullPageProgressStyleChange: (
    progressStyle: ProgressDisplayStyle,
  ) => void;
  onLocalePreferenceChange: (locale: AppLocalePreference) => void;
  onPopupCornerStyleChange: (cornerStyle: PopupCornerStyle) => void;
  onPopupProgressStyleChange: (progressStyle: ProgressDisplayStyle) => void;
  onPopupShadowStyleChange: (shadowStyle: PopupShadowStyle) => void;
  onPopupSizePresetChange: (sizePreset: PopupSizePreset) => void;
  onResetThemeCustomSeed: () => void;
  onSidebarProgressStyleChange: (
    progressStyle: ProgressDisplayStyle,
  ) => void;
  onSyncIntervalChange: (minutes: number) => void;
  onThemeCustomSeedDraftChange: (themeCustomSeedDraft: string) => void;
  onThemeModeChange: (themeMode: ThemeMode) => void;
  onThemePresetChange: (themePreset: ThemePreset) => void;
  onWarningThresholdChange: (percent: number) => void;
};

export function SettingsPreferencesSection({
  i18n,
  providers,
  resolvedThemeMode,
  sectionId,
  settings,
  settingsCopy,
  snapshots,
  themeCustomSeedDraft,
  onActionBadgeSelectionChange,
  onApplyThemeCustomSeed,
  onFullPageProgressStyleChange,
  onLocalePreferenceChange,
  onPopupCornerStyleChange,
  onPopupProgressStyleChange,
  onPopupShadowStyleChange,
  onPopupSizePresetChange,
  onResetThemeCustomSeed,
  onSidebarProgressStyleChange,
  onSyncIntervalChange,
  onThemeCustomSeedDraftChange,
  onThemeModeChange,
  onThemePresetChange,
  onWarningThresholdChange,
}: SettingsPreferencesSectionProps) {
  const normalizedThemeCustomSeedDraft =
    normalizeThemeCustomSeedHex(themeCustomSeedDraft);
  const customThemePreviewPalette = normalizedThemeCustomSeedDraft
    ? buildCustomThemePalette(normalizedThemeCustomSeedDraft, resolvedThemeMode)
    : null;
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
  const actionBadgeOptions = buildActionBadgeSelectOptions(
    {
      providers: snapshots,
      providerSettings: providers,
      settings,
    },
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

  return (
    <section className="status-card settings-section-anchor" id={sectionId}>
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
                <p className="section-label">{i18n.t("popup.header.eyebrow")}</p>
                <h3 className="section-title">{i18n.t("popup.header.title")}</h3>
              </div>
              <div className="popup-appearance-preview-actions">
                <span>
                  {i18n.t("settings.popup_appearance_preview.sample_refresh")}
                </span>
                <span>
                  {i18n.t("settings.popup_appearance_preview.sample_tab")}
                </span>
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
            <p className="section-label">
              {i18n.t("settings.theme_customization.eyebrow")}
            </p>
            <h2 className="section-title">
              {i18n.t("settings.theme_customization.title")}
            </h2>
          </div>
          <p className="supporting-copy">
            {i18n.t("settings.theme_customization.detail")}
          </p>
        </div>

        <form
          className="theme-customization-form"
          onSubmit={onApplyThemeCustomSeed}
        >
          <label className="form-field">
            <span className="form-field__label">
              {i18n.t("settings.theme_customization.seed_label")}
            </span>
            <input
              className="form-field__control"
              type="text"
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              value={themeCustomSeedDraft}
              placeholder="#4F46E5"
              onChange={(event) =>
                onThemeCustomSeedDraftChange(event.target.value)
              }
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
              onClick={onResetThemeCustomSeed}
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
          <div
            className="theme-preview-grid"
            aria-label={i18n.t("settings.theme_customization.preview.aria")}
          >
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
                <p className="theme-preview-swatch__label">
                  {i18n.t("settings.theme_customization.preview.primary")}
                </p>
                <p className="supporting-copy">
                  {customThemePreviewPalette.primary}
                </p>
              </div>
            </div>

            <div className="theme-preview-swatch">
              <span
                className="theme-preview-swatch__color"
                style={{
                  backgroundColor:
                    customThemePreviewPalette.secondaryContainer,
                  color: customThemePreviewPalette.onSecondaryContainer,
                }}
              >
                Aa
              </span>
              <div>
                <p className="theme-preview-swatch__label">
                  {i18n.t(
                    "settings.theme_customization.preview.secondary_container",
                  )}
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
                <p className="theme-preview-swatch__label">
                  {i18n.t("settings.theme_customization.preview.tertiary")}
                </p>
                <p className="supporting-copy">
                  {customThemePreviewPalette.tertiary}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
