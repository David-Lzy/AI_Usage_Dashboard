import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

import type { ProgressGradientStop } from "../../providers/types";
import type { ProgressGradientPresetId } from "../../shared/progress-appearance";
import type { SettingsActivePopoverSessionState } from "../../shared/surface-session-state";
import { focusWithoutScroll } from "../focus";
import {
  resolveFloatingMenuPosition,
  type FloatingMenuPosition,
} from "../floating-menu-position";
import { shouldPreservePopoverForSurfaceSwitch } from "../surface-switch-intent";
import { useAdaptiveDropdownMenuGrid } from "./AdaptiveDropdownMenuGrid";

export type ProgressGradientSchemeOption = {
  id: ProgressGradientPresetId;
  label: string;
  stops: readonly ProgressGradientStop[];
};

type ProgressGradientSchemeDropdownProps = {
  label: string;
  helperText: string;
  layout?: "default" | "inline";
  valueLabel: string;
  valueStops: readonly ProgressGradientStop[];
  options: readonly ProgressGradientSchemeOption[];
  imageImportAction: string;
  imageImportBusy: string;
  imageImportHelp: string;
  imageImportAccept: string;
  isImageImporting: boolean;
  sessionPopoverId?: string;
  activePopover?: SettingsActivePopoverSessionState | null;
  onActivePopoverChange?: (
    nextPopover: SettingsActivePopoverSessionState | null,
  ) => void;
  onSchemeSelect: (schemeId: ProgressGradientPresetId) => void;
  onImageImport: (event: ChangeEvent<HTMLInputElement>) => void;
};

function buildGradientTrackBackground(
  stops: readonly ProgressGradientStop[],
): string {
  return `linear-gradient(90deg, ${stops
    .map((stop) => `${stop.colorHex} ${stop.positionPercent}%`)
    .join(", ")})`;
}

export function ProgressGradientSchemeDropdown({
  label,
  helperText,
  layout = "default",
  valueLabel,
  valueStops,
  options,
  imageImportAction,
  imageImportBusy,
  imageImportHelp,
  imageImportAccept,
  isImageImporting,
  sessionPopoverId,
  activePopover,
  onActivePopoverChange,
  onSchemeSelect,
  onImageImport,
}: ProgressGradientSchemeDropdownProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const labelId = "progress-gradient-scheme-label";
  const buttonId = "progress-gradient-scheme-button";
  const menuId = "progress-gradient-scheme-menu";
  const [isOpen, setIsOpen] = useState(
    () => Boolean(sessionPopoverId) && activePopover?.id === sessionPopoverId,
  );
  const [menuPosition, setMenuPosition] =
    useState<FloatingMenuPosition | null>(null);
  const {
    labelsToMeasure,
    gridRef,
    measurerRef,
    style: adaptiveMenuGridStyle,
  } = useAdaptiveDropdownMenuGrid({
    measurementLabels: options.map((option) => option.label),
    itemCount: options.length,
    layoutSignal: isOpen ? (menuPosition?.width ?? "open") : "closed",
    minFallbackPx: 132,
  });
  const valueTrackStyle = {
    "--progress-gradient-track": buildGradientTrackBackground(valueStops),
  } as CSSProperties & {
    "--progress-gradient-track": string;
  };

  function publishActivePopover() {
    if (!sessionPopoverId || !onActivePopoverChange) {
      return;
    }

    onActivePopoverChange({ id: sessionPopoverId });
  }

  function clearActivePopover() {
    if (
      sessionPopoverId &&
      onActivePopoverChange &&
      (!activePopover || activePopover.id === sessionPopoverId)
    ) {
      onActivePopoverChange(null);
    }
  }

  function closeMenu({
    keepActivePopover = false,
    restoreFocus = false,
  }: {
    keepActivePopover?: boolean;
    restoreFocus?: boolean;
  } = {}) {
    setIsOpen(false);

    if (!keepActivePopover) {
      clearActivePopover();
    }

    if (restoreFocus) {
      focusWithoutScroll(buttonRef.current);
    }
  }

  function updateMenuPosition() {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const anchor = buttonRef.current;

    if (!anchor) {
      return;
    }

    const direction =
      document.documentElement.dataset.appDirection === "rtl" ||
      document.documentElement.dir === "rtl"
        ? "end"
        : "start";

    setMenuPosition(
      resolveFloatingMenuPosition(
        anchor.getBoundingClientRect(),
        {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        {
          align: direction,
          minHeight: 180,
          preferredMaxHeight: 520,
          preferredWidth: 560,
        },
      ),
    );
  }

  function openMenu() {
    updateMenuPosition();
    setIsOpen(true);
    publishActivePopover();
  }

  function toggleMenu() {
    if (isOpen) {
      closeMenu();
      return;
    }

    openMenu();
  }

  function selectScheme(schemeId: ProgressGradientPresetId) {
    closeMenu({ restoreFocus: true });
    onSchemeSelect(schemeId);
  }

  function handleImageImport(event: ChangeEvent<HTMLInputElement>) {
    closeMenu({ restoreFocus: true });
    onImageImport(event);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      closeMenu({ restoreFocus: true });
    }
  }

  useEffect(() => {
    if (!sessionPopoverId) {
      return;
    }

    if (activePopover?.id === sessionPopoverId) {
      setIsOpen(true);
      if (typeof window !== "undefined") {
        window.requestAnimationFrame(updateMenuPosition);
      }
      return;
    }

    if (activePopover && activePopover.id !== sessionPopoverId) {
      setIsOpen(false);
    }
  }, [activePopover?.id, sessionPopoverId]);

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") {
      return undefined;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      closeMenu({ restoreFocus: true });
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (
        target instanceof Node &&
        (rootRef.current?.contains(target) || menuRef.current?.contains(target))
      ) {
        return;
      }

      closeMenu({
        keepActivePopover: shouldPreservePopoverForSurfaceSwitch(target),
      });
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || typeof window === "undefined") {
      return undefined;
    }

    updateMenuPosition();

    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(updateMenuPosition);

    if (buttonRef.current) {
      resizeObserver?.observe(buttonRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
      resizeObserver?.disconnect();
    };
  }, [isOpen]);

  const menuStyle: CSSProperties | undefined = menuPosition
    ? {
        left: `${menuPosition.left}px`,
        top: `${menuPosition.top}px`,
        width: `${menuPosition.width}px`,
        maxHeight: `${menuPosition.maxHeight}px`,
      }
    : undefined;

  const menu = isOpen ? (
    <div
      ref={menuRef}
      id={menuId}
      className="progress-gradient-scheme-dropdown__menu"
      aria-labelledby={labelId}
      data-placement={menuPosition?.placement ?? "below"}
      style={menuStyle}
    >
      <div className="progress-gradient-scheme-dropdown__menu-header">
        <p className="progress-gradient-scheme-dropdown__menu-label">
          {label}
        </p>
        <label
          className="text-button progress-gradient-scheme-dropdown__image-import"
          title={imageImportHelp}
        >
          <span>{isImageImporting ? imageImportBusy : imageImportAction}</span>
          <input
            type="file"
            accept={imageImportAccept}
            disabled={isImageImporting}
            onChange={handleImageImport}
          />
        </label>
      </div>
      <div
        ref={measurerRef}
        className="adaptive-dropdown-menu-grid__measurer"
        aria-hidden="true"
      >
        {labelsToMeasure.map((measurementLabel) => (
          <span
            key={measurementLabel}
            className="progress-gradient-scheme-dropdown__measure-choice"
            data-adaptive-dropdown-menu-measure-choice=""
          >
            <span className="progress-gradient-scheme-dropdown__measure-preview" />
            <span>{measurementLabel}</span>
          </span>
        ))}
      </div>
      <div
        ref={gridRef}
        className="adaptive-dropdown-menu-grid progress-gradient-scheme-dropdown__grid"
        style={adaptiveMenuGridStyle}
      >
        {options.map((option) => (
          <button
            key={option.id}
            className="progress-gradient-scheme-dropdown__option"
            type="button"
            data-progress-gradient-scheme={option.id}
            onClick={() => selectScheme(option.id)}
          >
            <span
              className="progress-gradient-scheme-dropdown__option-preview"
              style={
                {
                  "--progress-gradient-track": buildGradientTrackBackground(
                    option.stops,
                  ),
                } as CSSProperties & {
                  "--progress-gradient-track": string;
                }
              }
              aria-hidden="true"
            />
            <span className="progress-gradient-scheme-dropdown__option-label">
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <div
      ref={rootRef}
      className={`form-field progress-gradient-scheme-dropdown${
        layout === "inline" ? " progress-gradient-scheme-dropdown--inline" : ""
      }`}
      data-progress-gradient-scheme-dropdown=""
      data-session-popover-id={sessionPopoverId}
      onKeyDown={handleKeyDown}
    >
      <span
        id={labelId}
        className={`form-field__label${
          layout === "inline"
            ? " progress-gradient-scheme-dropdown__label--hidden"
            : ""
        }`}
      >
        {label}
      </span>
      <button
        ref={buttonRef}
        id={buttonId}
        className="progress-gradient-scheme-dropdown__button"
        type="button"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-labelledby={`${labelId} ${buttonId}`}
        data-open={isOpen ? "true" : "false"}
        onClick={toggleMenu}
      >
        <span
          className="progress-gradient-scheme-dropdown__value-preview"
          style={valueTrackStyle}
          aria-hidden="true"
        />
        <span className="progress-gradient-scheme-dropdown__value">
          {valueLabel}
        </span>
        <span
          className="progress-gradient-scheme-dropdown__menu-icon"
          aria-hidden="true"
        />
      </button>
      {layout === "inline" ? null : (
        <p className="supporting-copy progress-gradient-scheme-dropdown__help">
          {helperText}
        </p>
      )}
      {menu && typeof document !== "undefined"
        ? createPortal(menu, document.body)
        : menu}
    </div>
  );
}
