import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import type {
  ActionBadgeSelection,
  ActionBadgeSelectionMode,
} from "../../providers/types";
import { ACTION_BADGE_ATTENTION_SELECTION } from "../../shared/action-badge-preferences";
import {
  areFloatingMenuPositionsEqual,
  resolveFloatingMenuPosition,
  type FloatingMenuPosition,
} from "../floating-menu-position";
import type { MaterialSelectOption } from "./MaterialSelect";

type ActionBadgeSelectionControlsProps = {
  label: string;
  options: Array<MaterialSelectOption<ActionBadgeSelection>>;
  selectedValues: ActionBadgeSelection[];
  selectionMode: ActionBadgeSelectionMode;
  selectionModeLabel: string;
  automaticLabel: string;
  manualLabel: string;
  labelAccessory?: ReactNode;
  onSelectionModeChange: (mode: ActionBadgeSelectionMode) => void;
  onSelectionsChange: (selections: ActionBadgeSelection[]) => void;
};

type ActionBadgeSelectionOptionGroup = {
  id: string;
  label: string;
  options: Array<MaterialSelectOption<ActionBadgeSelection>>;
};

type ActionBadgeSelectionOptionGroups = {
  attentionOptions: Array<MaterialSelectOption<ActionBadgeSelection>>;
  providerGroups: ActionBadgeSelectionOptionGroup[];
  fallbackOptions: Array<MaterialSelectOption<ActionBadgeSelection>>;
};

const ACTION_BADGE_LABEL_SEPARATOR = " · ";
const QUOTA_ACTION_BADGE_SELECTION_PREFIX = "quota:";

export function getActionBadgeSelectionSummary(
  options: Array<MaterialSelectOption<ActionBadgeSelection>>,
  selectedValues: readonly ActionBadgeSelection[],
  fallbackLabel: string,
): string {
  const selectedValueSet = new Set(selectedValues);
  const selectedLabels = options
    .filter((option) => selectedValueSet.has(option.value))
    .map((option) => option.label);

  if (selectedLabels.length === 0) {
    return fallbackLabel;
  }

  if (selectedLabels.length <= 2) {
    return selectedLabels.join(" · ");
  }

  return `${selectedLabels.slice(0, 2).join(" · ")} +${
    selectedLabels.length - 2
  }`;
}

function formatActionBadgeProviderIdLabel(value: ActionBadgeSelection): string {
  if (!value.startsWith(QUOTA_ACTION_BADGE_SELECTION_PREFIX)) {
    return "";
  }

  const providerId = value
    .slice(QUOTA_ACTION_BADGE_SELECTION_PREFIX.length)
    .split(":")[0];

  if (!providerId) {
    return "";
  }

  return providerId
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function getActionBadgeSelectionOptionDisplayLabel(
  option: MaterialSelectOption<ActionBadgeSelection>,
): string {
  if (!option.value.startsWith(QUOTA_ACTION_BADGE_SELECTION_PREFIX)) {
    return option.label;
  }

  const labelParts = option.label
    .split(ACTION_BADGE_LABEL_SEPARATOR)
    .map((part) => part.trim())
    .filter(Boolean);

  return labelParts.length > 1
    ? labelParts.slice(1).join(ACTION_BADGE_LABEL_SEPARATOR)
    : option.label;
}

export function groupActionBadgeSelectionOptions(
  options: Array<MaterialSelectOption<ActionBadgeSelection>>,
): ActionBadgeSelectionOptionGroups {
  const attentionOptions: Array<MaterialSelectOption<ActionBadgeSelection>> = [];
  const providerGroups: ActionBadgeSelectionOptionGroup[] = [];
  const fallbackOptions: Array<MaterialSelectOption<ActionBadgeSelection>> = [];
  const providerGroupByLabel = new Map<string, ActionBadgeSelectionOptionGroup>();

  for (const option of options) {
    if (option.value === ACTION_BADGE_ATTENTION_SELECTION) {
      attentionOptions.push(option);
      continue;
    }

    if (!option.value.startsWith(QUOTA_ACTION_BADGE_SELECTION_PREFIX)) {
      fallbackOptions.push(option);
      continue;
    }

    const providerLabelFromOption = option.label
      .split(ACTION_BADGE_LABEL_SEPARATOR)[0]
      ?.trim();
    const providerLabel =
      providerLabelFromOption || formatActionBadgeProviderIdLabel(option.value);

    if (!providerLabel) {
      fallbackOptions.push(option);
      continue;
    }

    const existingGroup = providerGroupByLabel.get(providerLabel);

    if (existingGroup) {
      existingGroup.options.push(option);
      continue;
    }

    const nextGroup: ActionBadgeSelectionOptionGroup = {
      id: `provider-${providerGroups.length}-${providerLabel}`,
      label: providerLabel,
      options: [option],
    };

    providerGroupByLabel.set(providerLabel, nextGroup);
    providerGroups.push(nextGroup);
  }

  return { attentionOptions, providerGroups, fallbackOptions };
}

export function ActionBadgeSelectionControls({
  label,
  options,
  selectedValues,
  selectionMode,
  selectionModeLabel,
  automaticLabel,
  manualLabel,
  labelAccessory,
  onSelectionModeChange,
  onSelectionsChange,
}: ActionBadgeSelectionControlsProps) {
  const generatedId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const fieldId = `action-badge-selection-${generatedId}`;
  const labelId = `${fieldId}-label`;
  const listboxId = `${fieldId}-listbox`;
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] =
    useState<FloatingMenuPosition | null>(null);
  const selectedValueSet = new Set(selectedValues);
  const isAutomaticMode = selectionMode === "auto";
  const optionGroups = useMemo(
    () => groupActionBadgeSelectionOptions(options),
    [options],
  );
  const selectionSummary = isAutomaticMode
    ? automaticLabel
    : getActionBadgeSelectionSummary(
        options,
        selectedValues,
        options[0]?.label ?? label,
      );

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

      setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

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

    const nextMenuPosition = resolveFloatingMenuPosition(
      anchor.getBoundingClientRect(),
      {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      {
        align: direction,
        minHeight: 180,
        preferredMaxHeight: 460,
        preferredWidth: 520,
      },
    );

    setMenuPosition((currentMenuPosition) =>
      areFloatingMenuPositionsEqual(currentMenuPosition, nextMenuPosition)
        ? currentMenuPosition
        : nextMenuPosition,
    );
  }

  function closeMenu() {
    setIsOpen(false);
  }

  function openMenu() {
    updateMenuPosition();
    setIsOpen(true);
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

  function handleToggleSelection(value: ActionBadgeSelection) {
    if (isAutomaticMode) {
      return;
    }

    const nextSelections = selectedValueSet.has(value)
      ? selectedValues.filter((selection) => selection !== value)
      : [...selectedValues, value];

    onSelectionsChange(
      nextSelections.length > 0
        ? nextSelections
        : [ACTION_BADGE_ATTENTION_SELECTION],
    );
  }

  function handleControlBlur(event: FocusEvent<HTMLElement>) {
    const nextFocusedElement = event.relatedTarget;

    if (
      nextFocusedElement instanceof Node &&
      (rootRef.current?.contains(nextFocusedElement) ||
        menuRef.current?.contains(nextFocusedElement))
    ) {
      return;
    }

    closeMenu();
  }

  function handleButtonKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case "ArrowDown":
      case "Enter":
      case " ":
        event.preventDefault();
        openMenu();
        break;
      case "Escape":
        if (isOpen) {
          event.preventDefault();
          closeMenu();
        }
        break;
      default:
        break;
    }
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Escape") {
      return;
    }

    event.preventDefault();
    closeMenu();
    buttonRef.current?.focus();
  }

  function handleSelectionModeChange(nextMode: ActionBadgeSelectionMode) {
    if (nextMode === selectionMode) {
      return;
    }

    onSelectionModeChange(nextMode);
  }

  function handleButtonClick() {
    if (isOpen) {
      closeMenu();
      return;
    }

    openMenu();
  }

  function renderOption(
    option: MaterialSelectOption<ActionBadgeSelection>,
    extraClassName = "",
  ) {
    const isSelected = selectedValueSet.has(option.value);
    const displayLabel = getActionBadgeSelectionOptionDisplayLabel(option);
    const optionClassName = [
      "action-badge-selection-controls__menu-option",
      "material-select__option",
      extraClassName,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <label
        key={option.value}
        className={optionClassName}
        role="option"
        aria-selected={isSelected}
        data-selected={isSelected ? "true" : "false"}
        data-readonly={isAutomaticMode ? "true" : "false"}
        title={option.label}
      >
        <input
          className="action-badge-selection-controls__checkbox"
          type="checkbox"
          checked={isSelected}
          disabled={isAutomaticMode}
          onChange={() => handleToggleSelection(option.value)}
        />
        <span className="action-badge-selection-controls__option-label">
          {displayLabel}
        </span>
      </label>
    );
  }

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
      className="action-badge-selection-controls__menu material-select__menu material-select__menu--floating"
      aria-labelledby={labelId}
      data-placement={menuPosition?.placement ?? "below"}
      data-readonly={isAutomaticMode ? "true" : "false"}
      style={menuStyle}
      onBlur={handleControlBlur}
      onKeyDown={handleMenuKeyDown}
    >
      <div className="action-badge-selection-controls__menu-header">
        <span className="action-badge-selection-controls__menu-mode-label">
          {selectionModeLabel}
        </span>
        <span
          className="action-badge-selection-controls__mode-switch"
          role="group"
          aria-label={selectionModeLabel}
          data-action-badge-mode-switch=""
        >
          <button
            className="action-badge-selection-controls__mode-button"
            type="button"
            aria-pressed={isAutomaticMode}
            data-selected={isAutomaticMode ? "true" : "false"}
            onClick={() => handleSelectionModeChange("auto")}
          >
            {automaticLabel}
          </button>
          <button
            className="action-badge-selection-controls__mode-button"
            type="button"
            aria-pressed={!isAutomaticMode}
            data-selected={!isAutomaticMode ? "true" : "false"}
            onClick={() => handleSelectionModeChange("manual")}
          >
            {manualLabel}
          </button>
        </span>
      </div>
      <div
        id={listboxId}
        className="action-badge-selection-controls__menu-body"
        role="listbox"
        aria-multiselectable="true"
        aria-readonly={isAutomaticMode}
        aria-labelledby={labelId}
        data-readonly={isAutomaticMode ? "true" : "false"}
      >
        {optionGroups.attentionOptions.map((option) =>
          renderOption(
            option,
            "action-badge-selection-controls__menu-option--attention",
          ),
        )}
        {optionGroups.providerGroups.map((group) => (
          <section
            key={group.id}
            className="action-badge-selection-controls__provider-group"
            role="group"
            aria-label={group.label}
          >
            <p className="action-badge-selection-controls__provider-label">
              {group.label}
            </p>
            <div className="action-badge-selection-controls__provider-options">
              {group.options.map((option) => renderOption(option))}
            </div>
          </section>
        ))}
        {optionGroups.fallbackOptions.map((option) => renderOption(option))}
      </div>
    </div>
  ) : null;

  return (
    <div
      ref={rootRef}
      className="form-field action-badge-selection-controls"
      data-action-badge-selection-controls=""
      data-action-badge-selection-mode={selectionMode}
      onBlur={handleControlBlur}
    >
      <span className="form-field__label-row action-badge-selection-controls__label-row">
        <span id={labelId} className="form-field__label">
          {label}
        </span>
        {labelAccessory}
      </span>
      <div className="action-badge-selection-controls__dropdown">
        <button
          ref={buttonRef}
          id={fieldId}
          className="action-badge-selection-controls__button material-select__button"
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-readonly={isAutomaticMode}
          aria-controls={listboxId}
          aria-labelledby={`${labelId} ${fieldId}`}
          data-open={isOpen ? "true" : "false"}
          data-readonly={isAutomaticMode ? "true" : "false"}
          onClick={handleButtonClick}
          onKeyDown={handleButtonKeyDown}
        >
          <span className="material-select__value">{selectionSummary}</span>
          <span className="material-select__menu-icon" aria-hidden="true" />
        </button>
        {menu && typeof document !== "undefined"
          ? createPortal(menu, document.body)
          : menu}
      </div>
    </div>
  );
}
