import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

export type EditableNumberComboboxOption = {
  value: number;
  label: string;
};

type EditableNumberComboboxProps = {
  label: string;
  value: number;
  minimum: number;
  maximum: number;
  unitLabel: string;
  options: EditableNumberComboboxOption[];
  errorText: string;
  menuButtonLabel: string;
  fieldIdPrefix: string;
  onChange: (value: number) => void;
};

export function parseEditableNumberDraft(rawValue: string): number | null {
  const normalizedValue = rawValue.trim();

  if (!normalizedValue) {
    return null;
  }

  const match = normalizedValue.match(
    /^(\d+)(?:\s*(?:%|m|mins?|minutes?|分钟))?$/i,
  );

  if (!match) {
    return null;
  }

  const parsedValue = Number(match[1]);

  return Number.isSafeInteger(parsedValue) ? parsedValue : null;
}

export function isEditableNumberInRange(
  value: number,
  minimum: number,
  maximum: number,
): boolean {
  return Number.isInteger(value) && value >= minimum && value <= maximum;
}

function formatDraftValue(value: number): string {
  return String(value);
}

function getNextOptionIndex(
  currentIndex: number,
  direction: "previous" | "next",
  optionCount: number,
): number {
  if (optionCount === 0) {
    return -1;
  }

  if (currentIndex < 0) {
    return direction === "next" ? 0 : optionCount - 1;
  }

  if (direction === "next") {
    return currentIndex >= optionCount - 1 ? 0 : currentIndex + 1;
  }

  return currentIndex <= 0 ? optionCount - 1 : currentIndex - 1;
}

export function EditableNumberCombobox({
  label,
  value,
  minimum,
  maximum,
  unitLabel,
  options,
  errorText,
  menuButtonLabel,
  fieldIdPrefix,
  onChange,
}: EditableNumberComboboxProps) {
  const generatedId = useId();
  const inputId = `${fieldIdPrefix}-${generatedId}`;
  const listboxId = `${inputId}-listbox`;
  const errorId = `${inputId}-error`;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const [draftValue, setDraftValue] = useState(formatDraftValue(value));
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(
    selectedIndex >= 0 ? selectedIndex : 0,
  );
  const [hasError, setHasError] = useState(false);
  const activeOption = activeIndex >= 0 ? options[activeIndex] : undefined;
  const activeOptionId =
    isOpen && activeOption
      ? `${listboxId}-option-${activeOption.value}`
      : undefined;

  useEffect(() => {
    setDraftValue(formatDraftValue(value));
    setHasError(false);
  }, [value]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [isOpen, selectedIndex]);

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") {
      return undefined;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (
        target instanceof Node &&
        rootRef.current?.contains(target)
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

  function isValidValue(nextValue: number): boolean {
    return isEditableNumberInRange(nextValue, minimum, maximum);
  }

  function applyValue(nextValue: number) {
    if (!isValidValue(nextValue)) {
      setHasError(true);
      return;
    }

    setDraftValue(formatDraftValue(nextValue));
    setHasError(false);
    setIsOpen(false);

    if (nextValue !== value) {
      onChange(nextValue);
    }
  }

  function commitDraft() {
    const parsedValue = parseEditableNumberDraft(draftValue);

    if (parsedValue === null) {
      setHasError(true);
      return;
    }

    applyValue(parsedValue);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const nextDraftValue = event.target.value;
    const parsedValue = parseEditableNumberDraft(nextDraftValue);

    setDraftValue(nextDraftValue);

    if (parsedValue === null) {
      setHasError(nextDraftValue.trim().length > 0);
      return;
    }

    if (!isValidValue(parsedValue)) {
      setHasError(true);
      return;
    }

    setHasError(false);

    if (parsedValue !== value) {
      onChange(parsedValue);
    }
  }

  function handleRootBlur(event: FocusEvent<HTMLDivElement>) {
    const nextFocusedElement = event.relatedTarget;

    if (
      nextFocusedElement instanceof Node &&
      event.currentTarget.contains(nextFocusedElement)
    ) {
      return;
    }

    const parsedValue = parseEditableNumberDraft(draftValue);

    setIsOpen(false);

    if (parsedValue !== null && isValidValue(parsedValue)) {
      applyValue(parsedValue);
      return;
    }

    setDraftValue(formatDraftValue(value));
    setHasError(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setIsOpen(true);
        setActiveIndex((currentIndex) =>
          getNextOptionIndex(currentIndex, "next", options.length),
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setIsOpen(true);
        setActiveIndex((currentIndex) =>
          getNextOptionIndex(currentIndex, "previous", options.length),
        );
        break;
      case "Home":
        if (isOpen && options.length > 0) {
          event.preventDefault();
          setActiveIndex(0);
        }
        break;
      case "End":
        if (isOpen && options.length > 0) {
          event.preventDefault();
          setActiveIndex(options.length - 1);
        }
        break;
      case "Enter":
        event.preventDefault();
        if (isOpen && activeIndex >= 0 && options[activeIndex]) {
          applyValue(options[activeIndex].value);
          return;
        }
        commitDraft();
        break;
      case "Escape":
        if (isOpen) {
          event.preventDefault();
          setIsOpen(false);
          return;
        }
        setDraftValue(formatDraftValue(value));
        setHasError(false);
        break;
      default:
        break;
    }
  }

  function handleMenuButtonMouseDown(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    inputRef.current?.focus();
  }

  function handleMenuButtonClick() {
    setIsOpen((current) => !current);
  }

  function handleOptionMouseDown(
    optionValue: number,
    event: MouseEvent<HTMLDivElement>,
  ) {
    event.preventDefault();
    inputRef.current?.focus();
    applyValue(optionValue);
  }

  return (
    <div
      ref={rootRef}
      className="form-field editable-number-combobox"
      data-invalid={hasError ? "true" : "false"}
      data-settings-custom-number-field={fieldIdPrefix}
      onBlur={handleRootBlur}
    >
      <label className="form-field__label" htmlFor={inputId}>
        {label}
      </label>
      <div
        className="editable-number-combobox__anchor"
        data-open={isOpen ? "true" : "false"}
        data-invalid={hasError ? "true" : "false"}
      >
        <input
          ref={inputRef}
          id={inputId}
          className="editable-number-combobox__input"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="none"
          aria-activedescendant={activeOptionId}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          value={draftValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <span className="editable-number-combobox__suffix" aria-hidden="true">
          {unitLabel}
        </span>
        <button
          className="editable-number-combobox__menu-button"
          type="button"
          tabIndex={-1}
          aria-label={menuButtonLabel}
          aria-expanded={isOpen}
          aria-controls={listboxId}
          onMouseDown={handleMenuButtonMouseDown}
          onClick={handleMenuButtonClick}
        >
          <span
            className="editable-number-combobox__menu-icon"
            aria-hidden="true"
          />
        </button>
      </div>
      {isOpen ? (
        <div
          id={listboxId}
          className="editable-number-combobox__menu"
          role="listbox"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;

            return (
              <div
                key={option.value}
                id={`${listboxId}-option-${option.value}`}
                className="editable-number-combobox__option"
                role="option"
                aria-selected={isSelected}
                data-active={isActive ? "true" : "false"}
                data-selected={isSelected ? "true" : "false"}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) =>
                  handleOptionMouseDown(option.value, event)
                }
              >
                <span className="editable-number-combobox__option-marker" />
                <span>{option.label}</span>
              </div>
            );
          })}
        </div>
      ) : null}
      {hasError ? (
        <p id={errorId} className="editable-number-combobox__error">
          {errorText}
        </p>
      ) : null}
    </div>
  );
}
