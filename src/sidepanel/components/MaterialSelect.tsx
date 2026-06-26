import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import type { SettingsActivePopoverSessionState } from "../../shared/surface-session-state";
import { focusWithoutScroll } from "../focus";
import {
  areFloatingMenuPositionsEqual,
  resolveFloatingMenuPosition,
  type FloatingMenuPosition,
} from "../floating-menu-position";
import { shouldPreservePopoverForSurfaceSwitch } from "../surface-switch-intent";
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
  sessionPopoverId?: string;
  activePopover?: SettingsActivePopoverSessionState | null;
  onActivePopoverChange?: (
    nextPopover: SettingsActivePopoverSessionState | null,
  ) => void;
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
  sessionPopoverId,
  activePopover,
  onActivePopoverChange,
  onChange,
}: MaterialSelectProps<TValue>) {
  const generatedId = useId();
  const selectId = `${fieldIdPrefix}-${generatedId}`;
  const labelId = `${selectId}-label`;
  const listboxId = `${selectId}-listbox`;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : options[0];
  const [isOpen, setIsOpen] = useState(
    () => Boolean(sessionPopoverId) && activePopover?.id === sessionPopoverId,
  );
  const [menuPosition, setMenuPosition] =
    useState<FloatingMenuPosition | null>(null);
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

  function closeMenu({ keepActivePopover = false } = {}) {
    setIsOpen(false);
    if (!keepActivePopover) {
      clearActivePopover();
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

    const anchorRect = anchor.getBoundingClientRect();
    const nextMenuPosition = resolveFloatingMenuPosition(
      anchorRect,
      {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      {
        align: direction,
        minHeight: 160,
        preferredMaxHeight: 360,
        preferredWidth: anchorRect.width,
      },
    );

    setMenuPosition((currentMenuPosition) =>
      areFloatingMenuPositionsEqual(currentMenuPosition, nextMenuPosition)
        ? currentMenuPosition
        : nextMenuPosition,
    );
  }

  function openMenu() {
    updateMenuPosition();
    setIsOpen(true);
    publishActivePopover();
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

  function applyValue(nextValue: TValue) {
    closeMenu();

    if (nextValue !== value) {
      onChange(nextValue);
    }
  }

  function handleRootBlur(event: FocusEvent<HTMLDivElement>) {
    const nextFocusedElement = event.relatedTarget;

    if (
      nextFocusedElement instanceof Node &&
      (event.currentTarget.contains(nextFocusedElement) ||
        menuRef.current?.contains(nextFocusedElement))
    ) {
      return;
    }

    closeMenu({
      keepActivePopover: shouldPreservePopoverForSurfaceSwitch(
        nextFocusedElement,
      ),
    });
  }

  function handleButtonKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        openMenu();
        setActiveIndex((currentIndex) =>
          getNextMaterialSelectOptionIndex(currentIndex, "next", options.length),
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        openMenu();
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

  function handleButtonClick() {
    if (disabled) {
      return;
    }

    if (isOpen) {
      closeMenu();
      return;
    }

    openMenu();
  }

  function handleOptionMouseDown(
    optionValue: TValue,
    event: MouseEvent<HTMLDivElement>,
  ) {
    event.preventDefault();
    focusWithoutScroll(buttonRef.current);
    applyValue(optionValue);
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
      id={listboxId}
      className="material-select__menu material-select__menu--floating"
      role="listbox"
      aria-labelledby={labelId}
      data-placement={menuPosition?.placement ?? "below"}
      style={menuStyle}
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
  ) : null;

  return (
    <div
      ref={rootRef}
      className="form-field material-select"
      data-label-hidden={labelHidden ? "true" : "false"}
      data-settings-material-select={fieldIdPrefix}
      data-session-popover-id={sessionPopoverId}
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
      {menu && typeof document !== "undefined"
        ? createPortal(menu, document.body)
        : menu}
    </div>
  );
}
