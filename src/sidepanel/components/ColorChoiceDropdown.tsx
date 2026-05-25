import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

import type { SettingsActivePopoverSessionState } from "../../shared/surface-session-state";
import { normalizeThemeCustomSeedHex } from "../../shared/theme";
import { focusWithoutScroll } from "../focus";
import {
  resolveFloatingMenuPosition,
  type FloatingMenuPosition,
} from "../floating-menu-position";
import { shouldPreservePopoverForSurfaceSwitch } from "../surface-switch-intent";
import { useAdaptiveDropdownMenuGrid } from "./AdaptiveDropdownMenuGrid";
import { MaterialColorPicker } from "./MaterialColorPicker";

export type ColorChoiceDropdownChoice = {
  id: string;
  hex: string;
  label: string;
};

export type ColorChoiceDropdownSection = {
  id: string;
  label: string;
  choices: ColorChoiceDropdownChoice[];
};

export type ColorChoiceDropdownCopy = {
  customLabel: string;
  customHelp: string;
  customHexLabel: string;
  customPickerLabel: string;
  applyCustom: string;
  invalidHex: string;
};

type ColorChoiceDropdownProps = {
  label: string;
  valueHex: string | null;
  sections: ColorChoiceDropdownSection[];
  copy: ColorChoiceDropdownCopy;
  fieldIdPrefix: string;
  menuDensity?: "default" | "compact";
  selectedLabel?: string;
  sessionPopoverId?: string;
  activePopover?: SettingsActivePopoverSessionState | null;
  onActivePopoverChange?: (
    nextPopover: SettingsActivePopoverSessionState | null,
  ) => void;
  onChange: (hex: string) => void;
  onChoiceSelect?: (choice: ColorChoiceDropdownChoice) => void;
};

export function normalizeColorChoiceHex(value: unknown): string | null {
  return normalizeThemeCustomSeedHex(value);
}

export function getColorChoiceSelectionLabel(
  valueHex: string | null,
  sections: readonly ColorChoiceDropdownSection[],
  fallbackLabel: string,
): string {
  const normalizedValueHex = normalizeColorChoiceHex(valueHex);

  if (!normalizedValueHex) {
    return fallbackLabel;
  }

  for (const section of sections) {
    const matchingChoice = section.choices.find(
      (choice) => normalizeColorChoiceHex(choice.hex) === normalizedValueHex,
    );

    if (matchingChoice) {
      return matchingChoice.label;
    }
  }

  return normalizedValueHex;
}

function flattenSections(
  sections: readonly ColorChoiceDropdownSection[],
): ColorChoiceDropdownChoice[] {
  return sections.flatMap((section) => section.choices);
}

function getMenuMeasurementLabels(
  sections: readonly ColorChoiceDropdownSection[],
): string[] {
  return flattenSections(sections).map((choice) => choice.label);
}

export function ColorChoiceDropdown({
  label,
  valueHex,
  sections,
  copy,
  fieldIdPrefix,
  menuDensity = "default",
  selectedLabel,
  sessionPopoverId,
  activePopover,
  onActivePopoverChange,
  onChange,
  onChoiceSelect,
}: ColorChoiceDropdownProps) {
  const generatedId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const fieldId = `${fieldIdPrefix}-${generatedId}`;
  const labelId = `${fieldId}-label`;
  const menuId = `${fieldId}-menu`;
  const normalizedValueHex = normalizeColorChoiceHex(valueHex);
  const selectedValueHex = normalizedValueHex ?? "#4F46E5";
  const allChoices = useMemo(() => flattenSections(sections), [sections]);
  const menuMeasurementLabels = useMemo(
    () => getMenuMeasurementLabels(sections),
    [sections],
  );
  const {
    labelsToMeasure: menuLabelsToMeasure,
    measurerRef: menuMeasurerRef,
    style: adaptiveMenuGridStyle,
  } = useAdaptiveDropdownMenuGrid({
    measurementLabels: menuMeasurementLabels,
    minFallbackPx: menuDensity === "compact" ? 92 : 136,
  });
  const computedSelectedLabel =
    selectedLabel ??
    getColorChoiceSelectionLabel(
      selectedValueHex,
      sections,
      copy.customLabel,
    );
  const [isOpen, setIsOpen] = useState(
    () => Boolean(sessionPopoverId) && activePopover?.id === sessionPopoverId,
  );
  const [menuPosition, setMenuPosition] =
    useState<FloatingMenuPosition | null>(null);
  const [customOpen, setCustomOpen] = useState(
    () =>
      Boolean(sessionPopoverId) &&
      activePopover?.id === sessionPopoverId &&
      activePopover?.customPanelOpen === true,
  );
  const [customDraft, setCustomDraft] = useState(selectedValueHex);
  const normalizedCustomDraft = normalizeColorChoiceHex(customDraft);
  const customPickerValue = normalizedCustomDraft ?? selectedValueHex;
  const selectedChoiceId =
    allChoices.find(
      (choice) => normalizeColorChoiceHex(choice.hex) === normalizedValueHex,
    )?.id ?? null;

  useEffect(() => {
    setCustomDraft(selectedValueHex);
  }, [selectedValueHex]);

  function publishActivePopover(customPanelOpen = customOpen) {
    if (!sessionPopoverId || !onActivePopoverChange) {
      return;
    }

    onActivePopoverChange({
      id: sessionPopoverId,
      ...(customPanelOpen ? { customPanelOpen: true } : {}),
    });
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
    setCustomOpen(false);

    if (!keepActivePopover) {
      clearActivePopover();
    }

    if (restoreFocus) {
      focusWithoutScroll(buttonRef.current);
    }
  }

  function openMenu(nextCustomOpen = customOpen) {
    updateMenuPosition();
    setIsOpen(true);
    setCustomOpen(nextCustomOpen);
    publishActivePopover(nextCustomOpen);
  }

  useEffect(() => {
    if (!sessionPopoverId) {
      return;
    }

    if (activePopover?.id === sessionPopoverId) {
      setIsOpen(true);
      setCustomOpen(activePopover.customPanelOpen === true);
      if (typeof window !== "undefined") {
        window.requestAnimationFrame(updateMenuPosition);
      }
      return;
    }

    if (activePopover && activePopover.id !== sessionPopoverId) {
      setIsOpen(false);
      setCustomOpen(false);
    }
  }, [
    activePopover?.customPanelOpen,
    activePopover?.id,
    menuDensity,
    sessionPopoverId,
  ]);

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") {
      return undefined;
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

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen, menuDensity]);

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
          preferredMaxHeight: 560,
          preferredWidth: menuDensity === "compact" ? 420 : 640,
        },
      ),
    );
  }

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

  function selectHex(hex: string) {
    const normalizedHex = normalizeColorChoiceHex(hex);

    if (!normalizedHex) {
      return;
    }

    setCustomDraft(normalizedHex);
    closeMenu({ restoreFocus: true });
    onChange(normalizedHex);
  }

  function selectChoice(choice: ColorChoiceDropdownChoice) {
    const normalizedHex = normalizeColorChoiceHex(choice.hex);

    if (!normalizedHex) {
      return;
    }

    setCustomDraft(normalizedHex);
    closeMenu({ restoreFocus: true });

    if (onChoiceSelect) {
      onChoiceSelect({
        ...choice,
        hex: normalizedHex,
      });
      return;
    }

    onChange(normalizedHex);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      closeMenu({ restoreFocus: true });
    }
  }

  function toggleMenu() {
    if (isOpen) {
      closeMenu();
      return;
    }

    openMenu(false);
  }

  function toggleCustomPanel() {
    setCustomOpen((current) => {
      const nextCustomOpen = !current;
      publishActivePopover(nextCustomOpen);
      return nextCustomOpen;
    });
  }

  const menuStyle: CSSProperties | undefined = menuPosition
    ? {
        left: `${menuPosition.left}px`,
        top: `${menuPosition.top}px`,
        width: `${menuPosition.width}px`,
        maxHeight: `${menuPosition.maxHeight}px`,
      }
    : undefined;

  const primarySectionLabel = sections[0]?.label ?? label;
  const customToggle = (
    <button
      className="color-choice-dropdown__custom-toggle"
      type="button"
      aria-expanded={customOpen}
      onClick={toggleCustomPanel}
    >
      <span
        className="color-choice-dropdown__choice-swatch"
        style={{ backgroundColor: customPickerValue }}
        aria-hidden="true"
      />
      <span>{copy.customLabel}</span>
      <span
        className="color-choice-dropdown__custom-icon"
        aria-hidden="true"
      />
    </button>
  );
  const customPanel = customOpen ? (
    <div className="color-choice-dropdown__custom-panel">
      <p className="supporting-copy color-choice-dropdown__custom-help">
        {copy.customHelp}
      </p>
      <MaterialColorPicker
        label={copy.customPickerLabel}
        valueHex={customPickerValue}
        onChange={setCustomDraft}
      />
      <div className="color-choice-dropdown__custom-fields">
        <label className="form-field">
          <span className="form-field__label">{copy.customHexLabel}</span>
          <input
            className="form-field__control"
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            pattern="#[0-9A-Fa-f]{6}"
            value={customDraft}
            onChange={(event) =>
              setCustomDraft(event.target.value.toUpperCase())
            }
          />
        </label>
      </div>
      {normalizedCustomDraft ? null : (
        <p className="supporting-copy color-choice-dropdown__error">
          {copy.invalidHex}
        </p>
      )}
      <button
        className="text-button color-choice-dropdown__apply"
        type="button"
        disabled={!normalizedCustomDraft}
        onClick={() => selectHex(customDraft)}
      >
        {copy.applyCustom}
      </button>
    </div>
  ) : null;

  const menu = isOpen ? (
    <div
      ref={menuRef}
      id={menuId}
      className={`color-choice-dropdown__menu color-choice-dropdown__menu--floating${
        menuDensity === "compact" ? " color-choice-dropdown__menu--compact" : ""
      }`}
      aria-labelledby={labelId}
      data-placement={menuPosition?.placement ?? "below"}
      style={menuStyle}
    >
      <div className="color-choice-dropdown__menu-header">
        <p className="color-choice-dropdown__section-label">
          {primarySectionLabel}
        </p>
        {customToggle}
      </div>

      {customPanel}

      <div
        ref={menuMeasurerRef}
        className="adaptive-dropdown-menu-grid__measurer"
        aria-hidden="true"
      >
        {menuLabelsToMeasure.map((measurementLabel) => (
          <span
            key={measurementLabel}
            className={`adaptive-dropdown-menu-grid__measure-choice${
              menuDensity === "compact"
                ? " adaptive-dropdown-menu-grid__measure-choice--compact"
                : ""
            }`}
            data-adaptive-dropdown-menu-measure-choice=""
          >
            <span
              className="color-choice-dropdown__choice-swatch"
              aria-hidden="true"
            />
            <span className="adaptive-dropdown-menu-grid__measure-label">
              {measurementLabel}
            </span>
          </span>
        ))}
      </div>

      {sections.map((section, sectionIndex) => (
        <section
          key={section.id}
          className="color-choice-dropdown__section"
        >
          {sectionIndex === 0 ? null : (
            <p className="color-choice-dropdown__section-label">
              {section.label}
            </p>
          )}
          <div
            className="adaptive-dropdown-menu-grid color-choice-dropdown__choice-grid"
            style={adaptiveMenuGridStyle}
          >
            {section.choices.map((choice) => {
              const normalizedChoiceHex =
                normalizeColorChoiceHex(choice.hex) ?? choice.hex;
              const isSelected =
                selectedChoiceId === choice.id ||
                (selectedChoiceId === null &&
                  normalizedValueHex === normalizedChoiceHex);

              return (
                <button
                  key={choice.id}
                  className="color-choice-dropdown__choice"
                  type="button"
                  data-selected={isSelected ? "true" : "false"}
                  onClick={() => selectChoice(choice)}
                >
                  <span
                    className="color-choice-dropdown__choice-swatch"
                    style={{ backgroundColor: normalizedChoiceHex }}
                    aria-hidden="true"
                  />
                  <span className="color-choice-dropdown__choice-label">
                    {choice.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  ) : null;

  return (
    <div
      ref={rootRef}
      className="form-field color-choice-dropdown"
      data-color-choice-dropdown={fieldIdPrefix}
      data-color-choice-menu-density={menuDensity}
      data-session-popover-id={sessionPopoverId}
      onKeyDown={handleKeyDown}
    >
      <span id={labelId} className="form-field__label">
        {label}
      </span>
      <button
        ref={buttonRef}
        id={fieldId}
        className="color-choice-dropdown__button"
        type="button"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-labelledby={`${labelId} ${fieldId}`}
        data-open={isOpen ? "true" : "false"}
        onClick={toggleMenu}
      >
        <span
          className="color-choice-dropdown__swatch"
          style={{ backgroundColor: selectedValueHex }}
          aria-hidden="true"
        />
        <span className="color-choice-dropdown__value">
          <span>{computedSelectedLabel}</span>
        </span>
        <span className="color-choice-dropdown__menu-icon" aria-hidden="true" />
      </button>

      {menu && typeof document !== "undefined"
        ? createPortal(menu, document.body)
        : menu}
    </div>
  );
}
