import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import type { ProviderAccountId } from "../../providers/types";
import {
  areFloatingMenuPositionsEqual,
  resolveFloatingMenuPosition,
  type FloatingMenuPosition,
} from "../floating-menu-position";
import { TechnicalText } from "./TechnicalText";
import "./api-gateway-metering-summary.css";

export function ApiGatewayDeploymentSelector({
  activeDeploymentId,
  displayLabel,
  onSelectDeployment,
  options,
  summaryLabel,
}: {
  activeDeploymentId: ProviderAccountId | null;
  displayLabel: string;
  onSelectDeployment?: (accountId: ProviderAccountId) => void;
  options: readonly Readonly<{ id: ProviderAccountId; label: string }>[];
  summaryLabel: string;
}) {
  const generatedId = useId();
  const listboxId = `api-gateway-deployment-${generatedId}-listbox`;
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const selectedIndex = options.findIndex(
    (option) => option.id === activeDeploymentId,
  );
  const activeLabel = options[selectedIndex]?.label ?? displayLabel;
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(
    selectedIndex >= 0 ? selectedIndex : 0,
  );
  const [menuPosition, setMenuPosition] =
    useState<FloatingMenuPosition | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [isOpen, selectedIndex]);

  function closeMenu() {
    setIsOpen(false);
  }

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") {
      return undefined;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (
        target instanceof Node &&
        (buttonRef.current?.contains(target) || menuRef.current?.contains(target))
      ) {
        return;
      }

      closeMenu();
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
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
    const preferredMaxHeight = Math.min(240, options.length * 40 + 10);
    const nextMenuPosition = resolveFloatingMenuPosition(
      anchor.getBoundingClientRect(),
      { width: window.innerWidth, height: window.innerHeight },
      {
        align: direction,
        margin: 8,
        minHeight: Math.min(88, preferredMaxHeight),
        preferredMaxHeight,
        preferredWidth: 176,
        spacing: 4,
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
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
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
  }, [isOpen, options.length]);

  function applyDeployment(index: number) {
    const option = options[index];

    if (!option) {
      return;
    }

    closeMenu();
    buttonRef.current?.focus({ preventScroll: true });

    if (option.id !== activeDeploymentId) {
      onSelectDeployment?.(option.id);
    }
  }

  function moveActiveOption(direction: "previous" | "next") {
    setActiveIndex((currentIndex) => {
      if (options.length === 0) {
        return -1;
      }

      if (currentIndex < 0) {
        return direction === "next" ? 0 : options.length - 1;
      }

      if (direction === "next") {
        return currentIndex >= options.length - 1 ? 0 : currentIndex + 1;
      }

      return currentIndex <= 0 ? options.length - 1 : currentIndex - 1;
    });
  }

  function handleButtonKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!isOpen) {
          openMenu();
        }
        moveActiveOption("next");
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!isOpen) {
          openMenu();
        }
        moveActiveOption("previous");
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
        if (isOpen) {
          applyDeployment(activeIndex);
        } else {
          openMenu();
        }
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

  if (options.length <= 1 || !onSelectDeployment) {
    return (
      <span
        className="api-gateway-metering-deployment api-gateway-metering-deployment--single"
        title={activeLabel}
      >
        <TechnicalText direction="auto">{activeLabel}</TechnicalText>
      </span>
    );
  }

  const activeOptionId =
    isOpen && activeIndex >= 0
      ? `${listboxId}-option-${activeIndex}`
      : undefined;
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
      className="api-gateway-metering-deployment__menu"
      role="listbox"
      aria-label={summaryLabel}
      data-placement={menuPosition?.placement ?? "below"}
      style={menuStyle}
    >
      {options.map((option, index) => {
        const isSelected = option.id === activeDeploymentId;
        const isActive = index === activeIndex;

        return (
          <div
            key={option.id}
            id={`${listboxId}-option-${index}`}
            className="api-gateway-metering-deployment__option"
            role="option"
            aria-selected={isSelected}
            data-active={isActive ? "true" : "false"}
            data-selected={isSelected ? "true" : "false"}
            title={option.label}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseDown={(event: MouseEvent<HTMLDivElement>) => {
              event.preventDefault();
              applyDeployment(index);
            }}
          >
            <span
              className="api-gateway-metering-deployment__option-check"
              aria-hidden="true"
            />
            <TechnicalText direction="auto">{option.label}</TechnicalText>
          </div>
        );
      })}
    </div>
  ) : null;

  return (
    <span className="api-gateway-metering-deployment api-gateway-metering-deployment--select">
      <button
        ref={buttonRef}
        className="api-gateway-metering-deployment__button"
        type="button"
        role="combobox"
        aria-label={`${summaryLabel}: ${activeLabel}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={activeOptionId}
        data-open={isOpen ? "true" : "false"}
        title={activeLabel}
        onBlur={(event) => {
          const nextTarget = event.relatedTarget;

          if (
            nextTarget instanceof Node &&
            menuRef.current?.contains(nextTarget)
          ) {
            return;
          }

          closeMenu();
        }}
        onClick={() => (isOpen ? closeMenu() : openMenu())}
        onKeyDown={handleButtonKeyDown}
      >
        <TechnicalText
          className="api-gateway-metering-deployment__value"
          direction="auto"
        >
          {activeLabel}
        </TechnicalText>
        <span
          className="api-gateway-metering-deployment__menu-icon"
          aria-hidden="true"
        />
      </button>
      {menu && typeof document !== "undefined"
        ? createPortal(menu, document.body)
        : menu}
    </span>
  );
}
