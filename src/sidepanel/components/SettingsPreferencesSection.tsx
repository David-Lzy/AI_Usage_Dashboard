import { useEffect, useState } from "react";

import type {
  ActionBadgeSelection,
  AppSettings,
  PopupCircularProgressItemsPerRow,
  PopupCornerStyle,
  PopupShadowStyle,
  PopupSizePreset,
  ProgressColorBand,
  ProgressDisplayStyle,
  ProgressItemsBySurface,
  ProviderOrderBySurface,
  ProviderSetting,
  ProviderSnapshot,
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
import { buildSettingsPreferenceOptions } from "../settings-preference-options";
import type { SettingsUserLevelVisibility } from "../settings-user-level-visibility";
import { AccentColorSelect } from "./AccentColorSelect";
import { EditableNumberCombobox } from "./EditableNumberCombobox";
import { MaterialInfoTooltip } from "./MaterialInfoTooltip";
import { MaterialSelect } from "./MaterialSelect";
import { ProviderOrderPreferenceControls } from "./ProviderOrderPreferenceControls";
import { ProviderProgressItemPreferenceControls } from "./ProviderProgressItemPreferenceControls";
import { ProgressAppearancePreferenceControls } from "./ProgressAppearancePreferenceControls";
import { PopupAppearancePreview } from "./PopupAppearancePreview";

type SettingsPreferencesSectionProps = {
  i18n: RuntimeI18n;
  providers: ProviderSetting[];
  sectionId?: string;
  settings: AppSettings;
  settingsCopy: ReturnType<typeof buildSettingsLocalizedCopy>;
  snapshots: ProviderSnapshot[];
  userLevelVisibility: SettingsUserLevelVisibility;
  onActionBadgeSelectionChange: (
    actionBadgeSelection: ActionBadgeSelection,
  ) => void;
  onFullPageProgressStyleChange: (
    progressStyle: ProgressDisplayStyle,
  ) => void;
  onPopupCornerStyleChange: (cornerStyle: PopupCornerStyle) => void;
  onPopupCircularProgressItemsPerRowChange: (
    itemsPerRow: PopupCircularProgressItemsPerRow,
  ) => void;
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
  onSidebarProgressStyleChange: (
    progressStyle: ProgressDisplayStyle,
  ) => void;
  onSyncIntervalChange: (minutes: number) => void;
  onThemeCustomSeedChange: (themeCustomSeedHex: string) => void;
  onThemePresetChange: (themePreset: ThemePreset) => void;
  onWarningThresholdChange: (percent: number) => void;
};

export function SettingsPreferencesSection({
  i18n,
  providers,
  sectionId,
  settings,
  settingsCopy,
  snapshots,
  userLevelVisibility: _userLevelVisibility,
  onActionBadgeSelectionChange,
  onFullPageProgressStyleChange,
  onPopupCornerStyleChange,
  onPopupCircularProgressItemsPerRowChange,
  onPopupProgressStyleChange,
  onPopupShadowStyleChange,
  onPopupSizePresetChange,
  onProviderOrderBySurfaceChange,
  onProgressItemsBySurfaceChange,
  onProgressColorBandsChange,
  onProgressThicknessPxChange,
  onSidebarProgressStyleChange,
  onSyncIntervalChange,
  onThemeCustomSeedChange,
  onThemePresetChange,
  onWarningThresholdChange,
}: SettingsPreferencesSectionProps) {
  const {
    actionBadgeOptions,
    normalizedActionBadgeSelection,
    popupCornerStyleOptions,
    popupCircularProgressItemsPerRowOptions,
    popupShadowStyleOptions,
    popupSizePresetOptions,
    progressDisplayStyleOptions,
    syncIntervalErrorText,
    syncIntervalMenuButtonLabel,
    syncIntervalOptions,
    syncIntervalUnitLabel,
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
  const [uiMoreOpen, setUiMoreOpen] = useState(settings.themePreset === "custom");
  const [providerDisplayOpen, setProviderDisplayOpen] = useState(false);
  const popupCircularRowCountHelperText = i18n.t(
    "settings.preferences.popup_circular_row_count_helper",
  );
  const popupCircularProgressItemsPerRowOptionsForSelect =
    popupCircularProgressItemsPerRowOptions.map((option) => ({
      value: String(option.value) as "1" | "2" | "3",
      label: option.label,
    }));

  useEffect(() => {
    if (settings.themePreset === "custom") {
      setUiMoreOpen(true);
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

        <AccentColorSelect
          label={i18n.t("settings.preferences.accent_preset_label")}
          themePreset={settings.themePreset}
          themeCustomSeedHex={settings.themeCustomSeedHex}
          themePresetOptions={themePresetOptions}
          copy={settingsCopy.colorChoices}
          onThemePresetChange={onThemePresetChange}
          onThemeCustomSeedChange={onThemeCustomSeedChange}
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
        className="source-card__details settings-preferences__more settings-preferences__more--ui"
        open={uiMoreOpen}
        onToggle={(event) =>
          setUiMoreOpen((event.currentTarget as HTMLDetailsElement).open)
        }
      >
        <summary className="source-card__details-toggle">
          <span>
            {uiMoreOpen
              ? settingsCopy.preferenceGroups.uiMoreHide
              : settingsCopy.preferenceGroups.uiMoreShow}
          </span>
        </summary>

        <div className="source-card__details-body settings-preferences__more-body">
          <div className="settings-preferences__more-info">
            <MaterialInfoTooltip>
              {settingsCopy.preferenceGroups.uiMoreDetail}
            </MaterialInfoTooltip>
          </div>

          <div className="settings-grid">
            <MaterialSelect
              label={i18n.t("settings.preferences.popup_progress_style_label")}
              value={settings.popupProgressStyle}
              fieldIdPrefix="popup-progress-style"
              options={progressDisplayStyleOptions}
              onChange={onPopupProgressStyleChange}
            />

            <div className="settings-preferences__field-with-helper">
              <MaterialSelect
                label={i18n.t(
                  "settings.preferences.popup_circular_row_count_label",
                )}
                value={
                  String(settings.popupCircularProgressItemsPerRow) as
                    | "1"
                    | "2"
                    | "3"
                }
                fieldIdPrefix="popup-circular-row-count"
                options={popupCircularProgressItemsPerRowOptionsForSelect}
                onChange={(value) =>
                  onPopupCircularProgressItemsPerRowChange(
                    Number(value) as PopupCircularProgressItemsPerRow,
                  )
                }
              />
              <MaterialInfoTooltip className="settings-preferences__field-note">
                {popupCircularRowCountHelperText}
              </MaterialInfoTooltip>
            </div>

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
            colorChoiceCopy={settingsCopy.colorChoices}
            thicknessPx={settings.progressThicknessPx}
            colorBands={settings.progressColorBands}
            onThicknessPxChange={onProgressThicknessPxChange}
            onColorBandsChange={onProgressColorBandsChange}
          />

          <PopupAppearancePreview i18n={i18n} settings={settings} />
        </div>
      </details>

      <details
        className="source-card__details settings-preferences__more settings-preferences__more--provider-display"
        open={providerDisplayOpen}
        onToggle={(event) =>
          setProviderDisplayOpen((event.currentTarget as HTMLDetailsElement).open)
        }
      >
        <summary className="source-card__details-toggle">
          <span>
            {providerDisplayOpen
              ? settingsCopy.preferenceGroups.providerDisplayHide
              : settingsCopy.preferenceGroups.providerDisplayShow}
          </span>
        </summary>

        <div className="source-card__details-body settings-preferences__more-body">
          <div className="settings-preferences__more-info">
            <MaterialInfoTooltip>
              {settingsCopy.preferenceGroups.providerDisplayDetail}
            </MaterialInfoTooltip>
          </div>
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
