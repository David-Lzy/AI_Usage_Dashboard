import {
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";

import type { ActionBadgeSelection } from "../../providers/types";
import { ACTION_BADGE_ATTENTION_SELECTION } from "../../shared/action-badge-preferences";
import type { MaterialSelectOption } from "./MaterialSelect";

type ActionBadgeSelectionControlsProps = {
  label: string;
  options: Array<MaterialSelectOption<ActionBadgeSelection>>;
  selectedValues: ActionBadgeSelection[];
  onSelectionsChange: (selections: ActionBadgeSelection[]) => void;
};

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

export function ActionBadgeSelectionControls({
  label,
  options,
  selectedValues,
  onSelectionsChange,
}: ActionBadgeSelectionControlsProps) {
  const generatedId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const fieldId = `action-badge-selection-${generatedId}`;
  const labelId = `${fieldId}-label`;
  const listboxId = `${fieldId}-listbox`;
  const [isOpen, setIsOpen] = useState(false);
  const selectedValueSet = new Set(selectedValues);
  const selectionSummary = getActionBadgeSelectionSummary(
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

      if (target instanceof Node && rootRef.current?.contains(target)) {
        return;
      }

      setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  function handleToggleSelection(value: ActionBadgeSelection) {
    const nextSelections = selectedValueSet.has(value)
      ? selectedValues.filter((selection) => selection !== value)
      : [...selectedValues, value];

    onSelectionsChange(
      nextSelections.length > 0
        ? nextSelections
        : [ACTION_BADGE_ATTENTION_SELECTION],
    );
  }

  function handleRootBlur(event: FocusEvent<HTMLDivElement>) {
    const nextFocusedElement = event.relatedTarget;

    if (
      nextFocusedElement instanceof Node &&
      event.currentTarget.contains(nextFocusedElement)
    ) {
      return;
    }

    setIsOpen(false);
  }

  function handleButtonKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case "ArrowDown":
      case "Enter":
      case " ":
        event.preventDefault();
        setIsOpen(true);
        break;
      case "Escape":
        if (isOpen) {
          event.preventDefault();
          setIsOpen(false);
        }
        break;
      default:
        break;
    }
  }

  return (
    <div
      ref={rootRef}
      className="form-field action-badge-selection-controls"
      data-action-badge-selection-controls=""
      onBlur={handleRootBlur}
    >
      <span id={labelId} className="form-field__label">
        {label}
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
          aria-controls={listboxId}
          aria-labelledby={`${labelId} ${fieldId}`}
          data-open={isOpen ? "true" : "false"}
          onClick={() => setIsOpen((current) => !current)}
          onKeyDown={handleButtonKeyDown}
        >
          <span className="material-select__value">{selectionSummary}</span>
          <span className="material-select__menu-icon" aria-hidden="true" />
        </button>
        {isOpen ? (
          <div
            id={listboxId}
            className="action-badge-selection-controls__menu material-select__menu"
            role="listbox"
            aria-multiselectable="true"
            aria-labelledby={labelId}
          >
            {options.map((option) => {
              const isSelected = selectedValueSet.has(option.value);

              return (
                <label
                  key={option.value}
                  className="action-badge-selection-controls__menu-option material-select__option"
                  role="option"
                  aria-selected={isSelected}
                  data-selected={isSelected ? "true" : "false"}
                >
                  <input
                    className="action-badge-selection-controls__checkbox"
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSelection(option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
