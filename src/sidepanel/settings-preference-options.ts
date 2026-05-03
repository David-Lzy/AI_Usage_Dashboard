import type {
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
} from "../providers/types";
import type { RuntimeI18n } from "../shared/i18n";
import {
  buildActionBadgeSelectOptions,
  normalizeActionBadgeSelection,
} from "../shared/action-badge-preferences";
import {
  POPUP_CORNER_STYLE_OPTIONS,
  POPUP_SHADOW_STYLE_OPTIONS,
  POPUP_SIZE_PRESET_OPTIONS,
} from "../shared/popup-appearance";
import { PROGRESS_DISPLAY_STYLE_OPTIONS } from "../shared/progress-display";
import {
  SYNC_INTERVAL_MAX_MINUTES,
  SYNC_INTERVAL_MIN_MINUTES,
  SYNC_INTERVAL_PRESETS,
  WARNING_THRESHOLD_MAX_PERCENT,
  WARNING_THRESHOLD_MIN_PERCENT,
  WARNING_THRESHOLD_PRESETS,
} from "../shared/settings-preferences";
import { THEME_PRESET_OPTIONS } from "../shared/theme";

type BuildSettingsPreferenceOptionsInput = {
  i18n: RuntimeI18n;
  providers: ProviderSetting[];
  settings: AppSettings;
  snapshots: ProviderSnapshot[];
};

export function buildSettingsPreferenceOptions({
  i18n,
  providers,
  settings,
  snapshots,
}: BuildSettingsPreferenceOptionsInput) {
  const themePresetOptionLabels: Record<ThemePreset, string> = {
    default: i18n.t("settings.preferences.theme_preset.default"),
    meadow: i18n.t("settings.preferences.theme_preset.meadow"),
    sunset: i18n.t("settings.preferences.theme_preset.sunset"),
    custom: i18n.t("settings.preferences.theme_preset.custom"),
  };
  const progressDisplayStyleOptionLabels: Record<ProgressDisplayStyle, string> =
    {
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

  return {
    actionBadgeOptions,
    localeOptions,
    normalizedActionBadgeSelection,
    popupCornerStyleOptions,
    popupShadowStyleOptions,
    popupSizePresetOptions,
    progressDisplayStyleOptions,
    syncIntervalErrorText,
    syncIntervalMenuButtonLabel,
    syncIntervalOptions,
    syncIntervalUnitLabel,
    themeModeOptions,
    themePresetOptions,
    warningThresholdErrorText,
    warningThresholdMenuButtonLabel,
    warningThresholdOptions,
  };
}
