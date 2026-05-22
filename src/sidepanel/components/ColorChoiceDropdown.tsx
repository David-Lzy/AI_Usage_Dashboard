import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { normalizeThemeCustomSeedHex } from "../../shared/theme";
import { focusWithoutScroll } from "../focus";

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
  selectedLabel?: string;
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

export function ColorChoiceDropdown({
  label,
  valueHex,
  sections,
  copy,
  fieldIdPrefix,
  selectedLabel,
  onChange,
  onChoiceSelect,
}: ColorChoiceDropdownProps) {
  const generatedId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const fieldId = `${fieldIdPrefix}-${generatedId}`;
  const labelId = `${fieldId}-label`;
  const menuId = `${fieldId}-menu`;
  const normalizedValueHex = normalizeColorChoiceHex(valueHex);
  const selectedValueHex = normalizedValueHex ?? "#4F46E5";
  const allChoices = useMemo(() => flattenSections(sections), [sections]);
  const computedSelectedLabel =
    selectedLabel ??
    getColorChoiceSelectionLabel(
      selectedValueHex,
      sections,
      copy.customLabel,
    );
  const [isOpen, setIsOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
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
      setCustomOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  function selectHex(hex: string) {
    const normalizedHex = normalizeColorChoiceHex(hex);

    if (!normalizedHex) {
      return;
    }

    setCustomDraft(normalizedHex);
    setIsOpen(false);
    setCustomOpen(false);
    focusWithoutScroll(buttonRef.current);
    onChange(normalizedHex);
  }

  function selectChoice(choice: ColorChoiceDropdownChoice) {
    const normalizedHex = normalizeColorChoiceHex(choice.hex);

    if (!normalizedHex) {
      return;
    }

    setCustomDraft(normalizedHex);
    setIsOpen(false);
    setCustomOpen(false);
    focusWithoutScroll(buttonRef.current);

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
      setIsOpen(false);
      setCustomOpen(false);
      focusWithoutScroll(buttonRef.current);
    }
  }

  return (
    <div
      ref={rootRef}
      className="form-field color-choice-dropdown"
      data-color-choice-dropdown={fieldIdPrefix}
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
        onClick={() => setIsOpen((current) => !current)}
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

      {isOpen ? (
        <div
          id={menuId}
          className="color-choice-dropdown__menu"
          aria-labelledby={labelId}
        >
          {sections.map((section) => (
            <section
              key={section.id}
              className="color-choice-dropdown__section"
            >
              <p className="color-choice-dropdown__section-label">
                {section.label}
              </p>
              <div className="color-choice-dropdown__choice-grid">
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

          <section className="color-choice-dropdown__section color-choice-dropdown__custom">
            <button
              className="color-choice-dropdown__custom-toggle"
              type="button"
              aria-expanded={customOpen}
              onClick={() => setCustomOpen((current) => !current)}
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

            {customOpen ? (
              <div className="color-choice-dropdown__custom-panel">
                <p className="supporting-copy color-choice-dropdown__custom-help">
                  {copy.customHelp}
                </p>
                <div className="color-choice-dropdown__custom-fields">
                  <label className="form-field">
                    <span className="form-field__label">
                      {copy.customHexLabel}
                    </span>
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
                  <label className="color-choice-dropdown__native-picker">
                    <span
                      className="color-choice-dropdown__native-picker-swatch"
                      style={{ backgroundColor: customPickerValue }}
                      aria-hidden="true"
                    />
                    <span>{copy.customPickerLabel}</span>
                    <input
                      type="color"
                      value={customPickerValue}
                      aria-label={copy.customPickerLabel}
                      onChange={(event) => selectHex(event.target.value)}
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
            ) : null}
          </section>
        </div>
      ) : null}
    </div>
  );
}
