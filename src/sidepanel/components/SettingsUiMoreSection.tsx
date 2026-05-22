import type {
  AppSettings,
  PopupCircularProgressItemsPerRow,
  PopupCornerStyle,
  PopupShadowStyle,
  PopupSizePreset,
  ProgressColorBand,
  ProgressDisplayStyle,
  UiFontFamily,
} from "../../providers/types";
import type { RuntimeI18n } from "../../shared/i18n";
import type { buildSettingsLocalizedCopy } from "../../shared/settings-localized-copy";
import { MaterialInfoTooltip } from "./MaterialInfoTooltip";
import { MaterialSelect, type MaterialSelectOption } from "./MaterialSelect";
import { ProgressAppearancePreferenceControls } from "./ProgressAppearancePreferenceControls";
import { ToolbarPopupPreview } from "./ToolbarPopupPreview";

type PopupCircularProgressItemsPerRowSelectValue = "1" | "2" | "3" | "4";

type SettingsUiMoreSectionProps = {
  i18n: RuntimeI18n;
  settings: AppSettings;
  settingsCopy: ReturnType<typeof buildSettingsLocalizedCopy>;
  uiMoreOpen: boolean;
  toolbarPopupPreviewOpen: boolean;
  popupPreviewRemainingPercent: number;
  popupCircularRowCountHelperText: string;
  uiFontHelperText: string;
  progressDisplayStyleOptions: Array<MaterialSelectOption<ProgressDisplayStyle>>;
  popupCircularProgressItemsPerRowOptions: Array<
    MaterialSelectOption<PopupCircularProgressItemsPerRowSelectValue>
  >;
  popupSizePresetOptions: Array<MaterialSelectOption<PopupSizePreset>>;
  popupCornerStyleOptions: Array<MaterialSelectOption<PopupCornerStyle>>;
  popupShadowStyleOptions: Array<MaterialSelectOption<PopupShadowStyle>>;
  uiFontFamilyOptions: Array<MaterialSelectOption<UiFontFamily>>;
  onToggleUiMore: () => void;
  onToggleToolbarPopupPreview: () => void;
  onCloseToolbarPopupPreview: () => void;
  onPreviewRemainingPercentChange: (remainingPercent: number) => void;
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
  onUiFontFamilyChange: (uiFontFamily: UiFontFamily) => void;
};

export function SettingsUiMoreSection({
  i18n,
  settings,
  settingsCopy,
  uiMoreOpen,
  toolbarPopupPreviewOpen,
  popupPreviewRemainingPercent,
  popupCircularRowCountHelperText,
  uiFontHelperText,
  progressDisplayStyleOptions,
  popupCircularProgressItemsPerRowOptions,
  popupSizePresetOptions,
  popupCornerStyleOptions,
  popupShadowStyleOptions,
  uiFontFamilyOptions,
  onToggleUiMore,
  onToggleToolbarPopupPreview,
  onCloseToolbarPopupPreview,
  onPreviewRemainingPercentChange,
  onFullPageProgressStyleChange,
  onPopupCornerStyleChange,
  onPopupCircularProgressItemsPerRowChange,
  onPopupProgressStyleChange,
  onPopupShadowStyleChange,
  onPopupSizePresetChange,
  onProgressColorBandsChange,
  onProgressThicknessPxChange,
  onSidebarProgressStyleChange,
  onUiFontFamilyChange,
}: SettingsUiMoreSectionProps) {
  return (
    <div
      className="source-card__details settings-preferences__more settings-preferences__more--ui"
      data-open={uiMoreOpen ? "true" : "false"}
    >
      <div className="settings-preferences__more-toolbar">
        <button
          className="source-card__details-toggle settings-preferences__more-toggle"
          type="button"
          aria-expanded={uiMoreOpen}
          onClick={onToggleUiMore}
        >
          <span>
            {uiMoreOpen
              ? settingsCopy.preferenceGroups.uiMoreHide
              : settingsCopy.preferenceGroups.uiMoreShow}
          </span>
        </button>
        <button
          className="text-button text-button--outlined settings-preferences__test-popup-button"
          type="button"
          aria-pressed={toolbarPopupPreviewOpen}
          onClick={onToggleToolbarPopupPreview}
        >
          {toolbarPopupPreviewOpen
            ? i18n.t("settings.popup_appearance_preview.close_test_popup")
            : i18n.t("settings.popup_appearance_preview.open_test_popup")}
        </button>
        <div className="settings-preferences__more-info">
          <MaterialInfoTooltip>
            {settingsCopy.preferenceGroups.uiMoreDetail}
          </MaterialInfoTooltip>
        </div>
      </div>

      {uiMoreOpen ? (
        <div className="source-card__details-body settings-preferences__more-body">
          {toolbarPopupPreviewOpen ? (
            <ToolbarPopupPreview
              i18n={i18n}
              placement="inline"
              previewRemainingPercent={popupPreviewRemainingPercent}
              settings={settings}
              onPreviewRemainingPercentChange={onPreviewRemainingPercentChange}
            />
          ) : null}

          <div className="settings-grid settings-grid--balanced-settings">
            <MaterialSelect
              label={i18n.t("settings.preferences.popup_progress_style_label")}
              value={settings.popupProgressStyle}
              fieldIdPrefix="popup-progress-style"
              options={progressDisplayStyleOptions}
              onChange={onPopupProgressStyleChange}
            />

            <MaterialSelect
              label={i18n.t(
                "settings.preferences.popup_circular_row_count_label",
              )}
              value={
                String(settings.popupCircularProgressItemsPerRow) as
                  PopupCircularProgressItemsPerRowSelectValue
              }
              fieldIdPrefix="popup-circular-row-count"
              options={popupCircularProgressItemsPerRowOptions}
              labelAccessory={
                <MaterialInfoTooltip className="settings-preferences__field-note">
                  {popupCircularRowCountHelperText}
                </MaterialInfoTooltip>
              }
              onChange={(value) =>
                onPopupCircularProgressItemsPerRowChange(
                  Number(value) as PopupCircularProgressItemsPerRow,
                )
              }
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
              label={i18n.t("settings.preferences.ui_font_label")}
              value={settings.uiFontFamily}
              fieldIdPrefix="ui-font-family"
              options={uiFontFamilyOptions}
              labelAccessory={
                <MaterialInfoTooltip className="settings-preferences__field-note">
                  {uiFontHelperText}
                </MaterialInfoTooltip>
              }
              onChange={onUiFontFamilyChange}
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
        </div>
      ) : null}
      {toolbarPopupPreviewOpen ? (
        <ToolbarPopupPreview
          i18n={i18n}
          placement="floating"
          previewRemainingPercent={popupPreviewRemainingPercent}
          settings={settings}
          onPreviewRemainingPercentChange={onPreviewRemainingPercentChange}
          onClose={onCloseToolbarPopupPreview}
        />
      ) : null}
    </div>
  );
}
