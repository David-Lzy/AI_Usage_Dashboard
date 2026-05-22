import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import type { AppSettings } from "../../providers/types";
import { buildRuntimeCommonCopy, type RuntimeI18n } from "../../shared/i18n";
import { MaterialInfoTooltip } from "./MaterialInfoTooltip";
import { formatPopupPreviewQuotaLabel } from "./provider-progress-compact-labels";
import { UsageProgress } from "./UsageProgress";

export const POPUP_APPEARANCE_PREVIEW_DEFAULT_REMAINING_PERCENT = 51;

type ToolbarPopupPreviewSettings = Pick<
  AppSettings,
  | "popupCornerStyle"
  | "progressColorBands"
  | "progressThicknessPx"
  | "popupProgressStyle"
  | "popupShadowStyle"
  | "popupSizePreset"
>;

type ToolbarPopupPreviewPlacement = "inline" | "floating";

type ToolbarPopupPreviewProps = {
  i18n: RuntimeI18n;
  placement: ToolbarPopupPreviewPlacement;
  previewRemainingPercent: number;
  settings: ToolbarPopupPreviewSettings;
  onPreviewRemainingPercentChange: (remainingPercent: number) => void;
  onClose?: () => void;
};

type ToolbarPopupPreviewSurfaceProps = {
  i18n: RuntimeI18n;
  previewRemainingPercent: number;
  settings: ToolbarPopupPreviewSettings;
};

function ToolbarPopupPreviewSurface({
  i18n,
  previewRemainingPercent,
  settings,
}: ToolbarPopupPreviewSurfaceProps) {
  const sampleQuotaLabel = formatPopupPreviewQuotaLabel(i18n);
  const remainingLabel = buildRuntimeCommonCopy(i18n).remaining;
  const sampleRemainingLabel =
    settings.popupProgressStyle === "line"
      ? `${previewRemainingPercent}% ${remainingLabel}`
      : `${previewRemainingPercent}%`;
  const usedPercent = 100 - previewRemainingPercent;

  return (
    <div className="popup-appearance-preview-surface">
      <div className="popup-appearance-preview-provider">
        <div>
          <p className="popup-appearance-preview-provider__title">
            {i18n.t("settings.popup_appearance_preview.sample_provider")}
          </p>
          <p className="supporting-copy">
            {sampleQuotaLabel}
          </p>
        </div>
        <div
          className={`popup-appearance-preview-progress popup-appearance-preview-progress--${settings.popupProgressStyle}`}
        >
          <UsageProgress
            used={usedPercent}
            remaining={previewRemainingPercent}
            total={100}
            tone="neutral"
            label={sampleQuotaLabel}
            displayStyle={settings.popupProgressStyle}
            progressColorBands={settings.progressColorBands}
            progressThicknessPx={settings.progressThicknessPx}
            valueKind="remaining"
            valueLabel={sampleRemainingLabel}
            valueText={`${sampleQuotaLabel}: ${previewRemainingPercent}% ${remainingLabel}`}
          />
        </div>
      </div>
    </div>
  );
}

function normalizePreviewRemainingPercent(value: number): number {
  if (!Number.isFinite(value)) {
    return POPUP_APPEARANCE_PREVIEW_DEFAULT_REMAINING_PERCENT;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

function buildToolbarPopupPreviewShellAttributes(
  settings: ToolbarPopupPreviewSettings,
) {
  return {
    "data-popup-size-preset": settings.popupSizePreset,
    "data-popup-corner-style": settings.popupCornerStyle,
    "data-popup-shadow-style": settings.popupShadowStyle,
    "data-popup-progress-style": settings.popupProgressStyle,
  };
}

function ToolbarPopupPreviewPercentField({
  helpId,
  i18n,
  previewRemainingPercent,
  onPreviewRemainingPercentChange,
}: {
  helpId: string;
  i18n: RuntimeI18n;
  previewRemainingPercent: number;
  onPreviewRemainingPercentChange: (remainingPercent: number) => void;
}) {
  const normalizedPreviewRemainingPercent = normalizePreviewRemainingPercent(
    previewRemainingPercent,
  );

  function handleRemainingPercentChange(event: ChangeEvent<HTMLInputElement>) {
    onPreviewRemainingPercentChange(
      normalizePreviewRemainingPercent(event.target.valueAsNumber),
    );
  }

  return (
    <label className="popup-appearance-preview-percent-field">
      <span>{i18n.t("settings.popup_appearance_preview.remaining_label")}</span>
      <span className="popup-appearance-preview-percent-field__control">
        <input
          type="number"
          min={0}
          max={100}
          step={1}
          value={normalizedPreviewRemainingPercent}
          aria-describedby={helpId}
          onChange={handleRemainingPercentChange}
        />
        <span aria-hidden="true">%</span>
      </span>
      <span id={helpId} className="sr-only">
        {i18n.t("settings.popup_appearance_preview.remaining_error")}
      </span>
    </label>
  );
}

export function ToolbarPopupPreview({
  i18n,
  placement,
  previewRemainingPercent,
  settings,
  onPreviewRemainingPercentChange,
  onClose,
}: ToolbarPopupPreviewProps) {
  const dragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const normalizedPreviewRemainingPercent = normalizePreviewRemainingPercent(
    previewRemainingPercent,
  );

  useEffect(() => {
    if (!isDragging || typeof document === "undefined") {
      return undefined;
    }

    function handlePointerMove(event: PointerEvent) {
      const dragStart = dragStartRef.current;

      if (!dragStart) {
        return;
      }

      setPosition({
        x: dragStart.originX + event.clientX - dragStart.pointerX,
        y: dragStart.originY + event.clientY - dragStart.pointerY,
      });
    }

    function handlePointerUp() {
      dragStartRef.current = null;
      setIsDragging(false);
    }

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp, { once: true });

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging]);

  function handleDragPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return;
    }

    if (
      event.target instanceof Element &&
      event.target.closest("button,input,label")
    ) {
      return;
    }

    event.preventDefault();
    dragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      originX: position.x,
      originY: position.y,
    };
    setIsDragging(true);
  }

  const previewSurface = (
    <ToolbarPopupPreviewSurface
      i18n={i18n}
      previewRemainingPercent={normalizedPreviewRemainingPercent}
      settings={settings}
    />
  );
  const percentField = (
    <ToolbarPopupPreviewPercentField
      helpId={`toolbar-popup-preview-${placement}-percent-help`}
      i18n={i18n}
      previewRemainingPercent={normalizedPreviewRemainingPercent}
      onPreviewRemainingPercentChange={onPreviewRemainingPercentChange}
    />
  );

  if (placement === "floating") {
    return (
      <aside
        className="toolbar-popup-preview toolbar-popup-preview--floating popup-appearance-preview-shell"
        data-toolbar-popup-preview="floating"
        {...buildToolbarPopupPreviewShellAttributes(settings)}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        }}
        aria-label={i18n.t("settings.popup_appearance_preview.title")}
      >
        <div
          className="toolbar-popup-preview__bar"
          role="toolbar"
          aria-label={i18n.t("settings.popup_appearance_preview.drag_test_popup")}
          onPointerDown={handleDragPointerDown}
        >
          <span className="toolbar-popup-preview__bar-title">
            {i18n.t("settings.popup_appearance_preview.title")}
          </span>
          <div className="toolbar-popup-preview__bar-field">
            {percentField}
          </div>
          <button
            className="icon-button toolbar-popup-preview__close"
            type="button"
            aria-label={i18n.t(
              "settings.popup_appearance_preview.close_test_popup",
            )}
            onClick={onClose}
          >
            <span aria-hidden="true">x</span>
          </button>
        </div>
        {previewSurface}
      </aside>
    );
  }

  return (
    <div
      className="toolbar-popup-preview toolbar-popup-preview--inline popup-appearance-preview-card popup-appearance-preview-shell"
      data-toolbar-popup-preview="inline"
      {...buildToolbarPopupPreviewShellAttributes(settings)}
    >
      <div className="dashboard-section__header popup-appearance-preview-header">
        <div>
          <p className="section-label">
            {i18n.t("settings.popup_appearance_preview.eyebrow")}
          </p>
          <div className="section-title-with-info">
            <h2 className="section-title">
              {i18n.t("settings.popup_appearance_preview.title")}
            </h2>
            <MaterialInfoTooltip>
              {i18n.t("settings.popup_appearance_preview.detail")}
            </MaterialInfoTooltip>
          </div>
        </div>
        {percentField}
      </div>

      <div
        className="popup-appearance-preview-frame"
        aria-label={i18n.t("settings.popup_appearance_preview.title")}
      >
        {previewSurface}
      </div>
    </div>
  );
}
