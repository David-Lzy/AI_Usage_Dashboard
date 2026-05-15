import { useEffect, useState, type ChangeEvent } from "react";

import type {
  ActionBadgeSelections,
  AppSettings,
  PopupCircularProgressItemsPerRow,
  PopupCornerStyle,
  PopupShadowStyle,
  PopupSizePreset,
  ProgressColorBand,
  ProgressDisplayStyle,
  ProviderSetting,
  ProviderSnapshot,
  ThemePreset,
  ToolbarIconMode,
  UiFontFamily,
} from "../../providers/types";
import type { RuntimeI18n } from "../../shared/i18n";
import type { buildSettingsLocalizedCopy } from "../../shared/localized-copy";
import {
  SYNC_INTERVAL_MAX_MINUTES,
  SYNC_INTERVAL_MIN_MINUTES,
  WARNING_THRESHOLD_MAX_PERCENT,
  WARNING_THRESHOLD_MIN_PERCENT,
  ACTION_BADGE_ROTATION_INTERVAL_MAX_SECONDS,
  ACTION_BADGE_ROTATION_INTERVAL_MIN_SECONDS,
} from "../../shared/settings-preferences";
import { buildSettingsPreferenceOptions } from "../settings-preference-options";
import type { SettingsUserLevelVisibility } from "../settings-user-level-visibility";
import { ActionBadgeSelectionControls } from "./ActionBadgeSelectionControls";
import { AccentColorSelect } from "./AccentColorSelect";
import { ConfigurationBackupControls } from "./ConfigurationBackupControls";
import { EditableNumberCombobox } from "./EditableNumberCombobox";
import { MaterialInfoTooltip } from "./MaterialInfoTooltip";
import { MaterialSelect } from "./MaterialSelect";
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
  onActionBadgeSelectionsChange: (
    actionBadgeSelections: ActionBadgeSelections,
  ) => void;
  onActionBadgeRotationIntervalSecondsChange: (seconds: number) => void;
  onExportConfiguration: () => void;
  onImportConfigurationJson: (rawJson: string) => void;
  onSaveConfigurationToChromeSync: () => void;
  onRestoreConfigurationFromChromeSync: () => void;
  onToolbarIconModeChange: (toolbarIconMode: ToolbarIconMode) => void;
  onToolbarIconProviderIdChange: (
    toolbarIconProviderId: AppSettings["toolbarIconProviderId"],
  ) => void;
  onToolbarIconCustomImageDataUrlChange: (
    toolbarIconCustomImageDataUrl: string | null,
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
  onProgressColorBandsChange: (progressColorBands: ProgressColorBand[]) => void;
  onProgressThicknessPxChange: (progressThicknessPx: number) => void;
  onSidebarProgressStyleChange: (
    progressStyle: ProgressDisplayStyle,
  ) => void;
  onSyncIntervalChange: (minutes: number) => void;
  onThemeCustomSeedChange: (themeCustomSeedHex: string) => void;
  onThemePresetChange: (themePreset: ThemePreset) => void;
  onUiFontFamilyChange: (uiFontFamily: UiFontFamily) => void;
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
  onActionBadgeSelectionsChange,
  onActionBadgeRotationIntervalSecondsChange,
  onExportConfiguration,
  onImportConfigurationJson,
  onSaveConfigurationToChromeSync,
  onRestoreConfigurationFromChromeSync,
  onToolbarIconModeChange,
  onToolbarIconProviderIdChange,
  onToolbarIconCustomImageDataUrlChange,
  onFullPageProgressStyleChange,
  onPopupCornerStyleChange,
  onPopupCircularProgressItemsPerRowChange,
  onPopupProgressStyleChange,
  onPopupShadowStyleChange,
  onPopupSizePresetChange,
  onProgressColorBandsChange,
  onProgressThicknessPxChange,
  onSidebarProgressStyleChange,
  onSyncIntervalChange,
  onThemeCustomSeedChange,
  onThemePresetChange,
  onUiFontFamilyChange,
  onWarningThresholdChange,
}: SettingsPreferencesSectionProps) {
  const {
    actionBadgeOptions,
    actionBadgeRotationIntervalErrorText,
    actionBadgeRotationIntervalOptions,
    actionBadgeRotationMenuButtonLabel,
    actionBadgeRotationUnitLabel,
    normalizedActionBadgeSelections,
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
    toolbarIconModeOptions,
    toolbarIconProviderOptions,
    uiFontFamilyOptions,
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
  const popupCircularRowCountHelperText = i18n.t(
    "settings.preferences.popup_circular_row_count_helper",
  );
  const uiFontHelperText = i18n.t("settings.preferences.ui_font_helper");
  const popupCircularProgressItemsPerRowOptionsForSelect =
    popupCircularProgressItemsPerRowOptions.map((option) => ({
      value: String(option.value) as "1" | "2" | "3",
      label: option.label,
    }));
  const selectedToolbarIconProviderId =
    settings.toolbarIconProviderId ?? providers[0]?.id ?? null;

  function handleToolbarIconCustomImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.currentTarget.files?.[0] ?? null;

    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", () => {
      const result = reader.result;

      if (typeof result === "string") {
        onToolbarIconCustomImageDataUrlChange(result);
      }
    });
    reader.readAsDataURL(file);
  }

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

        <ActionBadgeSelectionControls
          label={i18n.t("settings.preferences.action_badge_label")}
          options={actionBadgeOptions}
          selectedValues={normalizedActionBadgeSelections}
          rotationLabel={i18n.t(
            "settings.preferences.action_badge_rotation_label",
          )}
          rotationValue={settings.actionBadgeRotationIntervalSeconds}
          rotationMinimum={ACTION_BADGE_ROTATION_INTERVAL_MIN_SECONDS}
          rotationMaximum={ACTION_BADGE_ROTATION_INTERVAL_MAX_SECONDS}
          rotationUnitLabel={actionBadgeRotationUnitLabel}
          rotationErrorText={actionBadgeRotationIntervalErrorText}
          rotationMenuButtonLabel={actionBadgeRotationMenuButtonLabel}
          rotationOptions={actionBadgeRotationIntervalOptions}
          onSelectionsChange={onActionBadgeSelectionsChange}
          onRotationIntervalChange={
            onActionBadgeRotationIntervalSecondsChange
          }
        />

        <MaterialSelect
          label={i18n.t("settings.preferences.toolbar_icon_label")}
          value={settings.toolbarIconMode}
          fieldIdPrefix="toolbar-icon-mode"
          options={toolbarIconModeOptions}
          onChange={onToolbarIconModeChange}
        />

        {settings.toolbarIconMode === "provider" &&
        selectedToolbarIconProviderId ? (
          <MaterialSelect
            label={i18n.t("settings.preferences.toolbar_icon_provider_label")}
            value={selectedToolbarIconProviderId}
            fieldIdPrefix="toolbar-icon-provider"
            options={toolbarIconProviderOptions}
            onChange={onToolbarIconProviderIdChange}
          />
        ) : null}

        {settings.toolbarIconMode === "custom" ? (
          <div
            className="form-field toolbar-icon-custom-field"
            data-toolbar-icon-custom-field=""
          >
            <span className="form-field__label">
              {i18n.t("settings.preferences.toolbar_icon_custom_label")}
            </span>
            <div className="toolbar-icon-custom-field__row">
              <input
                className="form-field__control toolbar-icon-custom-field__file"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                onChange={handleToolbarIconCustomImageChange}
              />
              <span className="meta-chip toolbar-icon-custom-field__status">
                {settings.toolbarIconCustomImageDataUrl
                  ? i18n.t(
                      "settings.preferences.toolbar_icon_custom_selected",
                    )
                  : i18n.t("settings.preferences.toolbar_icon_custom_empty")}
              </span>
              {settings.toolbarIconCustomImageDataUrl ? (
                <button
                  className="text-button toolbar-icon-custom-field__clear"
                  type="button"
                  onClick={() => onToolbarIconCustomImageDataUrlChange(null)}
                >
                  {i18n.t("settings.preferences.toolbar_icon_custom_clear")}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <ConfigurationBackupControls
        copy={settingsCopy.configurationBackup}
        onExportJson={onExportConfiguration}
        onImportJson={onImportConfigurationJson}
        onSaveToChromeSync={onSaveConfigurationToChromeSync}
        onRestoreFromChromeSync={onRestoreConfigurationFromChromeSync}
      />

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

            <div className="settings-preferences__field-with-helper">
              <MaterialSelect
                label={i18n.t("settings.preferences.ui_font_label")}
                value={settings.uiFontFamily}
                fieldIdPrefix="ui-font-family"
                options={uiFontFamilyOptions}
                onChange={onUiFontFamilyChange}
              />
              <MaterialInfoTooltip className="settings-preferences__field-note">
                {uiFontHelperText}
              </MaterialInfoTooltip>
            </div>
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
    </section>
  );
}
