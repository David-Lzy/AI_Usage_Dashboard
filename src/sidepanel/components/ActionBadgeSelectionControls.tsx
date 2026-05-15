import type { ActionBadgeSelection } from "../../providers/types";
import { ACTION_BADGE_ATTENTION_SELECTION } from "../../shared/action-badge-preferences";
import { EditableNumberCombobox } from "./EditableNumberCombobox";
import type { MaterialSelectOption } from "./MaterialSelect";

type NumberOption = {
  value: number;
  label: string;
};

type ActionBadgeSelectionControlsProps = {
  label: string;
  options: Array<MaterialSelectOption<ActionBadgeSelection>>;
  selectedValues: ActionBadgeSelection[];
  rotationLabel: string;
  rotationValue: number;
  rotationMinimum: number;
  rotationMaximum: number;
  rotationUnitLabel: string;
  rotationErrorText: string;
  rotationMenuButtonLabel: string;
  rotationOptions: NumberOption[];
  onSelectionsChange: (selections: ActionBadgeSelection[]) => void;
  onRotationIntervalChange: (seconds: number) => void;
};

export function ActionBadgeSelectionControls({
  label,
  options,
  selectedValues,
  rotationLabel,
  rotationValue,
  rotationMinimum,
  rotationMaximum,
  rotationUnitLabel,
  rotationErrorText,
  rotationMenuButtonLabel,
  rotationOptions,
  onSelectionsChange,
  onRotationIntervalChange,
}: ActionBadgeSelectionControlsProps) {
  const selectedValueSet = new Set(selectedValues);

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

  return (
    <div
      className="form-field action-badge-selection-controls"
      data-action-badge-selection-controls=""
    >
      <span className="form-field__label">{label}</span>
      <div
        className="action-badge-selection-controls__list"
        role="group"
        aria-label={label}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className="action-badge-selection-controls__option"
          >
            <input
              type="checkbox"
              checked={selectedValueSet.has(option.value)}
              onChange={() => handleToggleSelection(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      <EditableNumberCombobox
        label={rotationLabel}
        value={rotationValue}
        minimum={rotationMinimum}
        maximum={rotationMaximum}
        unitLabel={rotationUnitLabel}
        errorText={rotationErrorText}
        menuButtonLabel={rotationMenuButtonLabel}
        fieldIdPrefix="action-badge-rotation-interval"
        options={rotationOptions}
        onChange={onRotationIntervalChange}
      />
    </div>
  );
}
