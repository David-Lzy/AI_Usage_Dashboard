import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { MaterialIcon } from "./MaterialIcon";

type MaterialInfoTooltipProps = {
  children: ReactNode;
  className?: string;
};

export function MaterialInfoTooltip({
  children,
  className = "",
}: MaterialInfoTooltipProps) {
  const tooltipId = useId();
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLSpanElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(
    null,
  );
  const rootClassName = `material-info-tooltip${className ? ` ${className}` : ""}`;
  const accessibleLabel = typeof children === "string" ? children : undefined;
  const tooltipStyle =
    position === null
      ? undefined
      : ({
          "--material-info-tooltip-left": `${position.left}px`,
          "--material-info-tooltip-top": `${position.top}px`,
        } as CSSProperties);
  const tooltipContent = (
    <span
      ref={contentRef}
      id={tooltipId}
      className="material-info-tooltip__content"
      data-open={isOpen ? "true" : "false"}
      data-positioned={position === null ? "false" : "true"}
      role="tooltip"
      style={tooltipStyle}
    >
      {children}
    </span>
  );

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return undefined;
    }

    const hoverTarget =
      root.closest<HTMLElement>(
        ".form-field__label-row, .section-title-with-info, .field-label-with-info, .settings-overview__eyebrow",
      ) ?? root;

    function openTooltip() {
      setIsOpen(true);
    }

    function closeTooltip() {
      setIsOpen(false);
    }

    function handleFocusOut(event: FocusEvent) {
      const relatedTarget = event.relatedTarget;

      if (relatedTarget && hoverTarget.contains(relatedTarget as Node)) {
        return;
      }

      closeTooltip();
    }

    hoverTarget.addEventListener("pointerenter", openTooltip);
    hoverTarget.addEventListener("pointerleave", closeTooltip);
    hoverTarget.addEventListener("focusin", openTooltip);
    hoverTarget.addEventListener("focusout", handleFocusOut);

    return () => {
      hoverTarget.removeEventListener("pointerenter", openTooltip);
      hoverTarget.removeEventListener("pointerleave", closeTooltip);
      hoverTarget.removeEventListener("focusin", openTooltip);
      hoverTarget.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  useEffect(() => {
    if (!isOpen || typeof window === "undefined") {
      setPosition(null);
      return undefined;
    }

    let frameId = 0;

    function updatePosition() {
      const trigger = triggerRef.current;
      const content = contentRef.current;

      if (!trigger || !content) {
        return;
      }

      const triggerRect = trigger.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const viewportPadding = 16;
      const gap = 8;
      const tooltipWidth = Math.min(340, Math.max(0, viewportWidth - 32));
      const tooltipHeight = contentRect.height || 48;
      const centeredLeft =
        triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
      const left = Math.min(
        Math.max(viewportPadding, centeredLeft),
        Math.max(viewportPadding, viewportWidth - tooltipWidth - viewportPadding),
      );
      const belowTop = triggerRect.bottom + gap;
      const aboveTop = triggerRect.top - tooltipHeight - gap;
      const top =
        belowTop + tooltipHeight + viewportPadding <= viewportHeight
          ? belowTop
          : Math.max(viewportPadding, aboveTop);

      setPosition({
        left,
        top,
      });
    }

    frameId = window.requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, children]);

  return (
    <span
      ref={rootRef}
      className={rootClassName}
      data-open={isOpen ? "true" : "false"}
      data-positioned={position === null ? "false" : "true"}
    >
      <button
        ref={triggerRef}
        className="material-info-tooltip__trigger"
        type="button"
        aria-label={accessibleLabel}
        aria-describedby={tooltipId}
      >
        <MaterialIcon name="help-outline" />
      </button>
      {typeof document === "undefined"
        ? tooltipContent
        : createPortal(tooltipContent, document.body)}
    </span>
  );
}
