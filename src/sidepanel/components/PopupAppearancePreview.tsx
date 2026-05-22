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

type PopupAppearancePreviewSettings = Pick<
  AppSettings,
  | "popupCornerStyle"
  | "progressColorBands"
  | "progressThicknessPx"
  | "popupProgressStyle"
  | "popupShadowStyle"
  | "popupSizePreset"
>;

type PopupAppearancePreviewProps = {
  i18n: RuntimeI18n;
  previewRemainingPercent: number;
  settings: PopupAppearancePreviewSettings;
  onPreviewRemainingPercentChange: (remainingPercent: number) => void;
};

type PopupAppearancePreviewSurfaceProps = {
  i18n: RuntimeI18n;
  previewRemainingPercent: number;
  settings: PopupAppearancePreviewSettings;
};

function PopupAppearancePreviewSurface({
  i18n,
  previewRemainingPercent,
  settings,
}: PopupAppearancePreviewSurfaceProps) {
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

function buildPopupPreviewShellAttributes(
  settings: PopupAppearancePreviewSettings,
) {
  return {
    "data-popup-size-preset": settings.popupSizePreset,
    "data-popup-corner-style": settings.popupCornerStyle,
    "data-popup-shadow-style": settings.popupShadowStyle,
    "data-popup-progress-style": settings.popupProgressStyle,
  };
}

export function PopupAppearancePreview({
  i18n,
  previewRemainingPercent,
  settings,
  onPreviewRemainingPercentChange,
}: PopupAppearancePreviewProps) {
  const normalizedPreviewRemainingPercent = normalizePreviewRemainingPercent(
    previewRemainingPercent,
  );

  function handleRemainingPercentChange(event: ChangeEvent<HTMLInputElement>) {
    onPreviewRemainingPercentChange(
      normalizePreviewRemainingPercent(event.target.valueAsNumber),
    );
  }

  return (
    <div
      className="popup-appearance-preview-card popup-appearance-preview-shell"
      {...buildPopupPreviewShellAttributes(settings)}
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
        <label className="popup-appearance-preview-percent-field">
          <span>{i18n.t("settings.popup_appearance_preview.remaining_label")}</span>
          <span className="popup-appearance-preview-percent-field__control">
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={normalizedPreviewRemainingPercent}
              aria-describedby="popup-preview-percent-help"
              onChange={handleRemainingPercentChange}
            />
            <span aria-hidden="true">%</span>
          </span>
          <span id="popup-preview-percent-help" className="sr-only">
            {i18n.t("settings.popup_appearance_preview.remaining_error")}
          </span>
        </label>
      </div>

      <div
        className="popup-appearance-preview-frame"
        aria-label={i18n.t("settings.popup_appearance_preview.title")}
      >
        <PopupAppearancePreviewSurface
          i18n={i18n}
          previewRemainingPercent={normalizedPreviewRemainingPercent}
          settings={settings}
        />
      </div>
    </div>
  );
}

export function FloatingToolbarPopupPreview({
  i18n,
  previewRemainingPercent,
  settings,
  onClose,
}: {
  i18n: RuntimeI18n;
  previewRemainingPercent: number;
  settings: PopupAppearancePreviewSettings;
  onClose: () => void;
}) {
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
      event.target.closest("button")
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

  return (
    <aside
      className="floating-toolbar-popup-preview popup-appearance-preview-shell"
      {...buildPopupPreviewShellAttributes(settings)}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
      }}
      aria-label={i18n.t("settings.popup_appearance_preview.open_test_popup")}
    >
      <div
        className="floating-toolbar-popup-preview__bar"
        role="toolbar"
        aria-label={i18n.t("settings.popup_appearance_preview.drag_test_popup")}
        onPointerDown={handleDragPointerDown}
      >
        <span>{i18n.t("settings.popup_appearance_preview.title")}</span>
        <button
          className="icon-button floating-toolbar-popup-preview__close"
          type="button"
          aria-label={i18n.t(
            "settings.popup_appearance_preview.close_test_popup",
          )}
          onClick={onClose}
        >
          <span aria-hidden="true">x</span>
        </button>
      </div>
      <PopupAppearancePreviewSurface
        i18n={i18n}
        previewRemainingPercent={normalizedPreviewRemainingPercent}
        settings={settings}
      />
    </aside>
  );
}
