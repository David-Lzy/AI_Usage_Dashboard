import { useEffect, useState, type FormEvent } from "react";

import type {
  ActionBadgeSelection,
  AppLocalePreference,
  AppSettings,
  PopupCornerStyle,
  PopupShadowStyle,
  PopupSizePreset,
  ProgressColorBand,
  ProgressDisplayStyle,
  ProgressItemsBySurface,
  ProviderOrderBySurface,
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
import { ProviderOrderPreferenceControls } from "./ProviderOrderPreferenceControls";
import { ProviderProgressItemPreferenceControls } from "./ProviderProgressItemPreferenceControls";
import { ProgressAppearancePreferenceControls } from "./ProgressAppearancePreferenceControls";
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
  onProviderOrderBySurfaceChange: (
    providerOrderBySurface: ProviderOrderBySurface,
  ) => void;
  onProgressItemsBySurfaceChange: (
    progressItemsBySurface: ProgressItemsBySurface,
  ) => void;
  onProgressColorBandsChange: (progressColorBands: ProgressColorBand[]) => void;
  onProgressThicknessPxChange: (progressThicknessPx: number) => void;
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
  userLevelVisibility: _userLevelVisibility,
  onActionBadgeSelectionChange,
  onApplyThemeCustomSeed,
  onFullPageProgressStyleChange,
  onLocalePreferenceChange,
  onPopupCornerStyleChange,
  onPopupProgressStyleChange,
  onPopupShadowStyleChange,
  onPopupSizePresetChange,
  onProviderOrderBySurfaceChange,
  onProgressItemsBySurfaceChange,
  onProgressColorBandsChange,
  onProgressThicknessPxChange,
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
  const [moreOpen, setMoreOpen] = useState(settings.themePreset === "custom");

  useEffect(() => {
    if (settings.themePreset === "custom") {
      setMoreOpen(true);
    }
  }, [settings.themePreset]);

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
          label={i18n.t("settings.preferences.action_badge_label")}
          value={normalizedActionBadgeSelection}
          fieldIdPrefix="action-badge-selection"
          options={actionBadgeOptions}
          onChange={onActionBadgeSelectionChange}
        />
      </div>

      <details
        className="source-card__details settings-preferences__more"
        open={moreOpen}
        onToggle={(event) =>
          setMoreOpen((event.currentTarget as HTMLDetailsElement).open)
        }
      >
        <summary className="source-card__details-toggle">
          <span>
            {moreOpen
              ? settingsCopy.preferences.hideMore
              : settingsCopy.preferences.showMore}
          </span>
        </summary>

        <div className="source-card__details-body settings-preferences__more-body">
          <p className="supporting-copy settings-preferences__more-copy">
            {settingsCopy.preferences.detail}
          </p>

          <div className="settings-grid">
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
          </div>

          <ProgressAppearancePreferenceControls
            copy={settingsCopy.progressAppearance}
            thicknessPx={settings.progressThicknessPx}
            colorBands={settings.progressColorBands}
            onThicknessPxChange={onProgressThicknessPxChange}
            onColorBandsChange={onProgressColorBandsChange}
          />

          <PopupAppearancePreview i18n={i18n} settings={settings} />

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

          <ProviderOrderPreferenceControls
            copy={settingsCopy.providerOrder}
            providers={providers}
            providerOrderBySurface={settings.providerOrderBySurface}
            onChange={onProviderOrderBySurfaceChange}
          />

          <ProviderProgressItemPreferenceControls
            copy={settingsCopy.progressItems}
            providers={providers}
            snapshots={snapshots}
            progressItemsBySurface={settings.progressItemsBySurface}
            onChange={onProgressItemsBySurfaceChange}
          />
        </div>
      </details>
    </section>
  );
}
