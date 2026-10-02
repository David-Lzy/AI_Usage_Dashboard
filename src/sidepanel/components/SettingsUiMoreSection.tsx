import { useEffect, useRef, useState, type ReactNode } from "react";

import type {
  AppSettings,
  DisplaySurface,
  PopupCircularProgressItemsPerRow,
  PopupCornerStyle,
  PopupProviderBrowsingMode,
  PopupShadowStyle,
  PopupSizePreset,
  ProgressDisplayStyle,
  ResetTimeDisplayMode,
} from "../../providers/types";
import type { RuntimeI18n } from "../../shared/i18n";
import {
  buildResetTimeDisplayCopy,
  RESET_TIME_DISPLAY_MODES,
} from "../../shared/reset-time-display";
import type { buildSettingsLocalizedCopy } from "../../shared/settings-localized-copy";
import { getSettingsAppearanceCopy } from "../../shared/settings-appearance-localized-copy";
import type { SettingsActivePopoverSessionState } from "../../shared/surface-session-state";
import { AdaptiveControlGrid } from "./AdaptiveControlGrid";
import { MaterialInfoTooltip } from "./MaterialInfoTooltip";
import type { MaterialSelectOption } from "./MaterialSelect";
import { FusionSelect } from "./material-ui/FusionControls";
import { MaterialActionIcon } from "../../shared/components/MaterialActionIcon";
import {
  ToolbarPopupPreview,
  type ToolbarPopupPreviewPosition,
} from "./ToolbarPopupPreview";

export const TOOLBAR_POPUP_PREVIEW_FLOATING_MIN_WIDTH_PX = 640;
export function canUseFloatingToolbarPopupPreview(
  containerWidth: number,
): boolean {
  return containerWidth >= TOOLBAR_POPUP_PREVIEW_FLOATING_MIN_WIDTH_PX;
}

function useFloatingToolbarPopupPreviewCapability() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canUseFloatingPreview, setCanUseFloatingPreview] = useState(false);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let frame: number | null = null;
    const measure = () => {
      frame = null;
      setCanUseFloatingPreview(
        canUseFloatingToolbarPopupPreview(
          container.getBoundingClientRect().width,
        ),
      );
    };
    const schedule = () => {
      if (frame === null) frame = window.requestAnimationFrame(measure);
    };
    measure();
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(schedule);
    observer?.observe(container);
    window.addEventListener("resize", schedule);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", schedule);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);
  return { containerRef, canUseFloatingPreview };
}

type SelectOption<T extends string> = Array<MaterialSelectOption<T>>;
type Props = {
  i18n: RuntimeI18n;
  settings: AppSettings;
  settingsCopy: ReturnType<typeof buildSettingsLocalizedCopy>;
  surface: DisplaySurface;
  displayControls?: ReactNode;
  popupAccountPresentationControls?: ReactNode;
  onSurfaceChange: (surface: DisplaySurface) => void;
  toolbarPopupPreviewOpen: boolean;
  popupPreviewRemainingPercent: number;
  toolbarPopupPreviewPosition: ToolbarPopupPreviewPosition | null;
  activePopover: SettingsActivePopoverSessionState | null;
  popupCircularRowCountHelperText: string;
  progressDisplayStyleOptions: SelectOption<ProgressDisplayStyle>;
  popupCircularProgressItemsPerRowOptions: SelectOption<"1" | "2" | "3" | "4">;
  popupSizePresetOptions: SelectOption<PopupSizePreset>;
  popupCornerStyleOptions: SelectOption<PopupCornerStyle>;
  popupShadowStyleOptions: SelectOption<PopupShadowStyle>;
  popupProviderBrowsingModeOptions: SelectOption<PopupProviderBrowsingMode>;
  toolbarPreferenceControls: ReactNode;
  toolbarPreferenceMeasurementLabels: readonly string[];
  onToggleToolbarPopupPreview: () => void;
  onCloseToolbarPopupPreview: () => void;
  onPreviewRemainingPercentChange: (remainingPercent: number) => void;
  onToolbarPopupPreviewPositionChange: (
    position: ToolbarPopupPreviewPosition | null,
  ) => void;
  onActivePopoverChange: (
    next: SettingsActivePopoverSessionState | null,
  ) => void;
  onFullPageProgressStyleChange: (style: ProgressDisplayStyle) => void;
  onPopupCornerStyleChange: (style: PopupCornerStyle) => void;
  onPopupCircularProgressItemsPerRowChange: (
    items: PopupCircularProgressItemsPerRow,
  ) => void;
  onPopupProgressStyleChange: (style: ProgressDisplayStyle) => void;
  onPopupShadowStyleChange: (style: PopupShadowStyle) => void;
  onPopupSizePresetChange: (size: PopupSizePreset) => void;
  onPopupProviderBrowsingModeChange: (mode: PopupProviderBrowsingMode) => void;
  onSidebarProgressStyleChange: (style: ProgressDisplayStyle) => void;
  onResetTimeDisplayModeChange: (mode: ResetTimeDisplayMode) => void;
};

export function SettingsUiMoreSection(props: Props) {
  const {
    i18n,
    settings,
    settingsCopy,
    surface,
    displayControls,
    activePopover,
    onActivePopoverChange,
  } = props;
  const copy = getSettingsAppearanceCopy(i18n.resolvedLocale);
  const { containerRef, canUseFloatingPreview } =
    useFloatingToolbarPopupPreviewCapability();
  const resetCopy = buildResetTimeDisplayCopy(i18n.resolvedLocale);
  const surfaceLabels = settingsCopy.progressItems.surfaceLabels;
  const progressSettings = {
    popup: {
      key: "popup-progress-style",
      label: "settings.preferences.popup_progress_style_label",
      value: settings.popupProgressStyle,
      change: props.onPopupProgressStyleChange,
    },
    sidebar: {
      key: "sidebar-progress-style",
      label: "settings.preferences.sidebar_progress_style_label",
      value: settings.sidebarProgressStyle,
      change: props.onSidebarProgressStyleChange,
    },
    fullPage: {
      key: "full-page-progress-style",
      label: "settings.preferences.full_page_progress_style_label",
      value: settings.fullPageProgressStyle,
      change: props.onFullPageProgressStyleChange,
    },
  } as const;
  const progress = progressSettings[surface];
  const measurements = [
    ...props.progressDisplayStyleOptions,
    ...props.popupSizePresetOptions,
    ...props.popupCornerStyleOptions,
    ...props.popupShadowStyleOptions,
    ...props.popupCircularProgressItemsPerRowOptions,
    ...props.popupProviderBrowsingModeOptions,
  ].map(({ label }) => label);
  const preview = (placement: "inline" | "floating") => (
    <ToolbarPopupPreview
      i18n={i18n}
      settings={settings}
      placement={placement}
      previewRemainingPercent={props.popupPreviewRemainingPercent}
      floatingPosition={props.toolbarPopupPreviewPosition}
      onPreviewRemainingPercentChange={props.onPreviewRemainingPercentChange}
      onFloatingPositionChange={props.onToolbarPopupPreviewPositionChange}
      onClose={props.onCloseToolbarPopupPreview}
    />
  );
  return (
    <div
      ref={containerRef}
      className="settings-appearance-editor"
      data-toolbar-popup-preview-mode={
        canUseFloatingPreview ? "floating" : "inline"
      }
    >
      <section
        className="settings-appearance-group"
        data-settings-appearance-group="layout"
      >
        <div className="settings-appearance-group__header">
          <h2>{copy.layout}</h2>
          <button
            type="button"
            className="text-button text-button--outlined settings-preferences__test-popup-button"
            aria-pressed={props.toolbarPopupPreviewOpen}
            onClick={props.onToggleToolbarPopupPreview}
          >
            <MaterialActionIcon name="tab" />
            {i18n.t(
              props.toolbarPopupPreviewOpen
                ? "settings.popup_appearance_preview.close_test_popup"
                : "settings.popup_appearance_preview.open_test_popup",
            )}
          </button>
        </div>
        <div className="settings-surface-selector">
          <FusionSelect
            fieldIdPrefix="settings-editing-surface"
            label={copy.surface}
            value={surface}
            onChange={props.onSurfaceChange}
            options={(["popup", "sidebar", "fullPage"] as const).map(
              (value) => ({ value, label: surfaceLabels[value] }),
            )}
          />
        </div>
        {props.toolbarPopupPreviewOpen && !canUseFloatingPreview
          ? preview("inline")
          : null}
        <AdaptiveControlGrid
          className="settings-grid settings-grid--balanced-settings"
          measurementLabels={measurements}
        >
          <FusionSelect
            key={progress.key}
            label={i18n.t(progress.label)}
            value={progress.value}
            fieldIdPrefix={progress.key}
            sessionPopoverId={progress.key}
            activePopover={activePopover}
            onActivePopoverChange={onActivePopoverChange}
            options={props.progressDisplayStyleOptions}
            onChange={progress.change}
          />
          {surface === "popup" && (
            <>
              <FusionSelect
                label={i18n.t(
                  "settings.preferences.popup_circular_row_count_label",
                )}
                value={
                  String(settings.popupCircularProgressItemsPerRow) as
                    "1" | "2" | "3" | "4"
                }
                fieldIdPrefix="popup-circular-row-count"
                sessionPopoverId="popup-circular-row-count"
                activePopover={activePopover}
                onActivePopoverChange={onActivePopoverChange}
                options={props.popupCircularProgressItemsPerRowOptions}
                labelAccessory={
                  <MaterialInfoTooltip>
                    {props.popupCircularRowCountHelperText}
                  </MaterialInfoTooltip>
                }
                onChange={(value) =>
                  props.onPopupCircularProgressItemsPerRowChange(
                    Number(value) as PopupCircularProgressItemsPerRow,
                  )
                }
              />
              <FusionSelect
                label={i18n.t(
                  "settings.preferences.popup_provider_browsing_mode_label",
                )}
                value={settings.popupProviderBrowsingMode}
                fieldIdPrefix="popup-provider-browsing-mode"
                sessionPopoverId="popup-provider-browsing-mode"
                activePopover={activePopover}
                onActivePopoverChange={onActivePopoverChange}
                options={props.popupProviderBrowsingModeOptions}
                onChange={props.onPopupProviderBrowsingModeChange}
              />
              <FusionSelect
                label={i18n.t("settings.preferences.popup_size_label")}
                value={settings.popupSizePreset}
                fieldIdPrefix="popup-size-preset"
                sessionPopoverId="popup-size-preset"
                activePopover={activePopover}
                onActivePopoverChange={onActivePopoverChange}
                options={props.popupSizePresetOptions}
                onChange={props.onPopupSizePresetChange}
              />
              <FusionSelect
                label={i18n.t("settings.preferences.popup_corner_label")}
                value={settings.popupCornerStyle}
                fieldIdPrefix="popup-corner-style"
                sessionPopoverId="popup-corner-style"
                activePopover={activePopover}
                onActivePopoverChange={onActivePopoverChange}
                options={props.popupCornerStyleOptions}
                onChange={props.onPopupCornerStyleChange}
              />
              <FusionSelect
                label={i18n.t("settings.preferences.popup_shadow_label")}
                value={settings.popupShadowStyle}
                fieldIdPrefix="popup-shadow-style"
                sessionPopoverId="popup-shadow-style"
                activePopover={activePopover}
                onActivePopoverChange={onActivePopoverChange}
                options={props.popupShadowStyleOptions}
                onChange={props.onPopupShadowStyleChange}
              />
              {props.popupAccountPresentationControls}
            </>
          )}
        </AdaptiveControlGrid>
      </section>
      <section
        className="settings-appearance-group"
        data-settings-appearance-group="content"
      >
        {displayControls ?? <h2>{copy.content}</h2>}
        <div className="settings-reset-format">
          <FusionSelect
            label={`${resetCopy.settingLabel} (${copy.global})`}
            value={settings.resetTimeDisplayMode}
            fieldIdPrefix="reset-time-display-mode"
            sessionPopoverId="reset-time-display-mode"
            activePopover={activePopover}
            onActivePopoverChange={onActivePopoverChange}
            options={RESET_TIME_DISPLAY_MODES.map((value) => ({
              value,
              label:
                value === "date"
                  ? resetCopy.dateOption
                  : value === "weekday"
                    ? resetCopy.weekdayOption
                    : resetCopy.dateAndWeekdayOption,
            }))}
            onChange={props.onResetTimeDisplayModeChange}
          />
        </div>
      </section>
      <section
        className="settings-appearance-group"
        data-settings-appearance-group="toolbar"
      >
        <h2>{copy.toolbar}</h2>
        <AdaptiveControlGrid
          className="settings-grid settings-grid--balanced-settings"
          measurementLabels={props.toolbarPreferenceMeasurementLabels}
        >
          {props.toolbarPreferenceControls}
        </AdaptiveControlGrid>
      </section>
      {props.toolbarPopupPreviewOpen && canUseFloatingPreview
        ? preview("floating")
        : null}
    </div>
  );
}
