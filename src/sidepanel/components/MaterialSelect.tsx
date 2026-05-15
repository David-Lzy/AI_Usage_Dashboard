import {
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";

import { FormFieldLabel } from "./FormFieldLabel";

export type MaterialSelectOption<TValue extends string = string> = {
  value: TValue;
  label: string;
};

type MaterialSelectProps<TValue extends string> = {
  label: string;
  value: TValue;
  options: Array<MaterialSelectOption<TValue>>;
  fieldIdPrefix: string;
  labelHidden?: boolean;
  labelAccessory?: ReactNode;
  disabled?: boolean;
  onChange: (value: TValue) => void;
};

export function getNextMaterialSelectOptionIndex(
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

export function MaterialSelect<TValue extends string>({
  label,
  value,
  options,
  fieldIdPrefix,
  labelHidden = false,
  labelAccessory,
  disabled = false,
  onChange,
}: MaterialSelectProps<TValue>) {
  const generatedId = useId();
  const selectId = `${fieldIdPrefix}-${generatedId}`;
  const labelId = `${selectId}-label`;
  const listboxId = `${selectId}-listbox`;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : options[0];
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(
    selectedIndex >= 0 ? selectedIndex : 0,
  );
  const activeOption = activeIndex >= 0 ? options[activeIndex] : undefined;
  const activeOptionId =
    isOpen && activeOption
      ? `${listboxId}-option-${activeOption.value}`
      : undefined;
  const labelClassName = `form-field__label material-select__label${
    labelHidden ? " material-select__label--hidden" : ""
  }`;

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

  function applyValue(nextValue: TValue) {
    setIsOpen(false);

    if (nextValue !== value) {
      onChange(nextValue);
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

    setIsOpen(false);
  }

  function handleButtonKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setIsOpen(true);
        setActiveIndex((currentIndex) =>
          getNextMaterialSelectOptionIndex(currentIndex, "next", options.length),
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setIsOpen(true);
        setActiveIndex((currentIndex) =>
          getNextMaterialSelectOptionIndex(
            currentIndex,
            "previous",
            options.length,
          ),
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
      case " ":
        event.preventDefault();
        if (isOpen && activeIndex >= 0 && options[activeIndex]) {
          applyValue(options[activeIndex].value);
          return;
        }
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

  function handleButtonClick() {
    if (disabled) {
      return;
    }

    setIsOpen((current) => !current);
  }

  function handleOptionMouseDown(
    optionValue: TValue,
    event: MouseEvent<HTMLDivElement>,
  ) {
    event.preventDefault();
    buttonRef.current?.focus();
    applyValue(optionValue);
  }

  return (
    <div
      ref={rootRef}
      className="form-field material-select"
      data-label-hidden={labelHidden ? "true" : "false"}
      data-settings-material-select={fieldIdPrefix}
      onBlur={handleRootBlur}
    >
      <FormFieldLabel
        id={labelId}
        className={labelClassName}
        label={label}
        accessory={labelAccessory}
      />
      <button
        ref={buttonRef}
        id={selectId}
        className="material-select__button"
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-labelledby={`${labelId} ${selectId}`}
        aria-activedescendant={activeOptionId}
        data-open={isOpen ? "true" : "false"}
        disabled={disabled}
        onClick={handleButtonClick}
        onKeyDown={handleButtonKeyDown}
      >
        <span className="material-select__value">
          {selectedOption?.label ?? value}
        </span>
        <span className="material-select__menu-icon" aria-hidden="true" />
      </button>
      {isOpen ? (
        <div
          id={listboxId}
          className="material-select__menu"
          role="listbox"
          aria-labelledby={labelId}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;

            return (
              <div
                key={option.value}
                id={`${listboxId}-option-${option.value}`}
                className="material-select__option"
                role="option"
                aria-selected={isSelected}
                data-active={isActive ? "true" : "false"}
                data-selected={isSelected ? "true" : "false"}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) =>
                  handleOptionMouseDown(option.value, event)
                }
              >
                <span className="material-select__option-check" />
                <span>{option.label}</span>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
