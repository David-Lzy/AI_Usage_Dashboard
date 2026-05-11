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
  SYNC_INTERVAL_MAX_MINUTES,
  SYNC_INTERVAL_MIN_MINUTES,
  WARNING_THRESHOLD_MAX_PERCENT,
  WARNING_THRESHOLD_MIN_PERCENT,
} from "../../shared/settings-preferences";
import type { ResolvedThemeMode } from "../../shared/theme";
import { buildSettingsPreferenceOptions } from "../settings-preference-options";
import type { SettingsUserLevelVisibility } from "../settings-user-level-visibility";
import { EditableNumberCombobox } from "./EditableNumberCombobox";
import { MaterialSelect } from "./MaterialSelect";
import { PopupAppearancePreview } from "./PopupAppearancePreview";
import { ThemeCustomizationCard } from "./ThemeCustomizationCard";

type SettingsPreferencesSectionProps = {
  i18n: RuntimeI18n;
  providers: ProviderSetting[];
  resolvedThemeMode: ResolvedThemeMode;
  sectionId?: string;
  settings: AppSettings;
  settingsCopy: ReturnType<typeof buildSettingsLocalizedCopy>;
  snapshots: ProviderSnapshot[];
  themeCustomSeedDraft: string;
  userLevelVisibility: SettingsUserLevelVisibility;
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
  userLevelVisibility,
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
  const {
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
  } = buildSettingsPreferenceOptions({
    i18n,
    providers,
    settings,
    snapshots,
  });

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

        {userLevelVisibility.showWarningThreshold ? (
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
        ) : null}

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

        {userLevelVisibility.showDeveloperAppearanceControls ? (
          <>
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
          </>
        ) : null}

        {userLevelVisibility.showActionBadgeSelection ? (
          <MaterialSelect
            label={i18n.t("settings.preferences.action_badge_label")}
            value={normalizedActionBadgeSelection}
            fieldIdPrefix="action-badge-selection"
            options={actionBadgeOptions}
            onChange={onActionBadgeSelectionChange}
          />
        ) : null}
      </div>

      {userLevelVisibility.showPopupAppearancePreview ? (
        <PopupAppearancePreview i18n={i18n} settings={settings} />
      ) : null}

      <ThemeCustomizationCard
        i18n={i18n}
        resolvedThemeMode={resolvedThemeMode}
        settings={settings}
        settingsCopy={settingsCopy}
        themeCustomSeedDraft={themeCustomSeedDraft}
        onApplyThemeCustomSeed={onApplyThemeCustomSeed}
        onResetThemeCustomSeed={onResetThemeCustomSeed}
        onThemeCustomSeedDraftChange={onThemeCustomSeedDraftChange}
      />
    </section>
  );
}
