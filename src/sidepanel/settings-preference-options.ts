import type {
  AppLocalePreference,
  AppSettings,
  MotionMode,
  PopupCornerStyle,
  PopupCircularProgressItemsPerRow,
  PopupShadowStyle,
  PopupSizePreset,
  ProgressDisplayStyle,
  ProviderSetting,
  ProviderSnapshot,
  ThemeMode,
  ThemePreset,
  ToolbarIconMode,
  UiFontFamily,
} from "../providers/types";
import type { RuntimeI18n } from "../shared/i18n";
import {
  APP_LOCALE_METADATA,
  SUPPORTED_APP_LOCALES,
  buildRuntimeCommonCopy,
} from "../shared/i18n";
import {
  buildActionBadgeSelectOptions,
  getSelectedActionBadgeSelections,
} from "../shared/action-badge-preferences";
import {
  POPUP_CIRCULAR_PROGRESS_ITEMS_PER_ROW_OPTIONS,
  POPUP_CORNER_STYLE_OPTIONS,
  POPUP_SHADOW_STYLE_OPTIONS,
  POPUP_SIZE_PRESET_OPTIONS,
} from "../shared/popup-appearance";
import { PROGRESS_DISPLAY_STYLE_OPTIONS } from "../shared/progress-display";
import { MOTION_MODE_OPTIONS } from "../shared/motion-preferences";
import {
  SYNC_INTERVAL_MAX_MINUTES,
  SYNC_INTERVAL_MIN_MINUTES,
  SYNC_INTERVAL_PRESETS,
  ACTION_BADGE_ROTATION_INTERVAL_MAX_SECONDS,
  ACTION_BADGE_ROTATION_INTERVAL_MIN_SECONDS,
  ACTION_BADGE_ROTATION_INTERVAL_PRESETS,
  WARNING_THRESHOLD_MAX_PERCENT,
  WARNING_THRESHOLD_MIN_PERCENT,
  WARNING_THRESHOLD_PRESETS,
} from "../shared/settings-preferences";
import { THEME_PRESET_OPTIONS } from "../shared/theme";
import { TOOLBAR_ICON_MODE_OPTIONS } from "../shared/toolbar-icon-preferences";
import { UI_FONT_FAMILY_OPTIONS } from "../shared/ui-font-family";

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
  const uiFontFamilyOptionLabels: Record<UiFontFamily, string> = {
    default: i18n.t("settings.preferences.ui_font.default"),
    system: i18n.t("settings.preferences.ui_font.system"),
    serif: i18n.t("settings.preferences.ui_font.serif"),
    mono: i18n.t("settings.preferences.ui_font.mono"),
  };
  const motionModeOptionLabels: Record<MotionMode, string> = {
    system: i18n.t("settings.preferences.motion_mode.system"),
    full: i18n.t("settings.preferences.motion_mode.full"),
    reduced: i18n.t("settings.preferences.motion_mode.reduced"),
  };
  const toolbarIconModeOptionLabels: Record<ToolbarIconMode, string> = {
    default: i18n.t("settings.preferences.toolbar_icon.default"),
    "match-badge": i18n.t("settings.preferences.toolbar_icon.match_badge"),
    provider: i18n.t("settings.preferences.toolbar_icon.provider"),
    custom: i18n.t("settings.preferences.toolbar_icon.custom"),
  };
  const progressDisplayStyleOptionLabels: Record<ProgressDisplayStyle, string> = {
    line: i18n.t("settings.preferences.progress_style.line"),
    circle: i18n.t("settings.preferences.progress_style.circle"),
    "circle-soft": i18n.t("settings.preferences.progress_style.circle_soft"),
    "circle-gauge": i18n.t("settings.preferences.progress_style.circle_gauge"),
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
  const popupCircularProgressItemsPerRowOptionLabels: Record<
    PopupCircularProgressItemsPerRow,
    string
  > = {
    1: i18n.t("settings.preferences.popup_circular_row_count.one"),
    2: i18n.t("settings.preferences.popup_circular_row_count.two"),
    3: i18n.t("settings.preferences.popup_circular_row_count.three"),
    4: i18n.t("settings.preferences.popup_circular_row_count.four"),
  };
  const localeOptions: Array<{ value: AppLocalePreference; label: string }> = [
    { value: "system", label: i18n.t("settings.preferences.locale.system") },
    ...SUPPORTED_APP_LOCALES.map((locale) => ({
      value: locale,
      label: APP_LOCALE_METADATA[locale].nativeLabel,
    })),
  ];
  const themeModeOptions: Array<{ value: ThemeMode; label: string }> = [
    { value: "system", label: i18n.t("settings.preferences.theme_mode.system") },
    { value: "light", label: i18n.t("settings.preferences.theme_mode.light") },
    { value: "dark", label: i18n.t("settings.preferences.theme_mode.dark") },
    { value: "time", label: i18n.t("settings.preferences.theme_mode.time") },
  ];
  const themePresetOptions = THEME_PRESET_OPTIONS.map((preset) => ({
    value: preset.value,
    label: themePresetOptionLabels[preset.value],
  }));
  const uiFontFamilyOptions = UI_FONT_FAMILY_OPTIONS.map((option) => ({
    value: option.value,
    label: uiFontFamilyOptionLabels[option.value],
  }));
  const motionModeOptions = MOTION_MODE_OPTIONS.map((option) => ({
    value: option.value,
    label: motionModeOptionLabels[option.value],
  }));
  const toolbarIconModeOptions = TOOLBAR_ICON_MODE_OPTIONS.map((option) => ({
    value: option.value,
    label: toolbarIconModeOptionLabels[option.value],
  }));
  const toolbarIconProviderOptions = providers.map((provider) => ({
    value: provider.id,
    label: provider.label,
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
  const popupCircularProgressItemsPerRowOptions =
    POPUP_CIRCULAR_PROGRESS_ITEMS_PER_ROW_OPTIONS.map((option) => ({
      value: option.value,
      label: popupCircularProgressItemsPerRowOptionLabels[option.value],
    }));
  const actionBadgeState = {
    providers: snapshots,
    providerSettings: providers,
    settings,
  };
  const actionBadgeOptions = buildActionBadgeSelectOptions(actionBadgeState, i18n);
  const normalizedActionBadgeSelections =
    getSelectedActionBadgeSelections(actionBadgeState);
  const syncIntervalUnitLabel = i18n.t("settings.preferences.minutes");
  const actionBadgeRotationUnitLabel = i18n.t("settings.preferences.seconds");
  const syncIntervalOptions = SYNC_INTERVAL_PRESETS.map((preset) => ({
    value: preset,
    label: `${i18n.formatNumber(preset)} ${syncIntervalUnitLabel}`,
  }));
  const actionBadgeRotationIntervalOptions =
    ACTION_BADGE_ROTATION_INTERVAL_PRESETS.map((preset) => ({
      value: preset,
      label: `${i18n.formatNumber(preset)} ${actionBadgeRotationUnitLabel}`,
    }));
  const warningThresholdOptions = WARNING_THRESHOLD_PRESETS.map((preset) => ({
    value: preset,
    label: i18n.formatPercentValue(preset),
  }));
  const commonCopy = buildRuntimeCommonCopy(i18n);
  const syncIntervalErrorText = commonCopy.syncIntervalRangeError(
    SYNC_INTERVAL_MIN_MINUTES,
    SYNC_INTERVAL_MAX_MINUTES,
    syncIntervalUnitLabel,
  );
  const warningThresholdErrorText = commonCopy.warningThresholdRangeError(
    WARNING_THRESHOLD_MIN_PERCENT,
    WARNING_THRESHOLD_MAX_PERCENT,
  );
  const actionBadgeRotationIntervalErrorText = commonCopy.syncIntervalRangeError(
    ACTION_BADGE_ROTATION_INTERVAL_MIN_SECONDS,
    ACTION_BADGE_ROTATION_INTERVAL_MAX_SECONDS,
    actionBadgeRotationUnitLabel,
  );
  const syncIntervalMenuButtonLabel = commonCopy.syncIntervalMenuButton;
  const warningThresholdMenuButtonLabel = commonCopy.warningThresholdMenuButton;
  const actionBadgeRotationMenuButtonLabel = i18n.t(
    "settings.preferences.action_badge_rotation_menu_button",
  );

  return {
    actionBadgeOptions,
    actionBadgeRotationIntervalErrorText,
    actionBadgeRotationIntervalOptions,
    actionBadgeRotationMenuButtonLabel,
    actionBadgeRotationUnitLabel,
    localeOptions,
    motionModeOptions,
    normalizedActionBadgeSelections,
    popupCornerStyleOptions,
    popupShadowStyleOptions,
    popupSizePresetOptions,
    popupCircularProgressItemsPerRowOptions,
    progressDisplayStyleOptions,
    syncIntervalErrorText,
    syncIntervalMenuButtonLabel,
    syncIntervalOptions,
    syncIntervalUnitLabel,
    themeModeOptions,
    themePresetOptions,
    toolbarIconModeOptions,
    toolbarIconProviderOptions,
    uiFontFamilyOptions,
    warningThresholdErrorText,
    warningThresholdMenuButtonLabel,
    warningThresholdOptions,
  };
}
