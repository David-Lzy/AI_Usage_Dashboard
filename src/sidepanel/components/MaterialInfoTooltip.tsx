import { useId, type ReactNode } from "react";

type MaterialInfoTooltipProps = {
  children: ReactNode;
  className?: string;
};

export function MaterialInfoTooltip({
  children,
  className = "",
}: MaterialInfoTooltipProps) {
  const tooltipId = useId();
  const rootClassName = `material-info-tooltip${className ? ` ${className}` : ""}`;
  const accessibleLabel = typeof children === "string" ? children : undefined;

  return (
    <span className={rootClassName}>
      <button
        className="material-info-tooltip__trigger"
        type="button"
        aria-label={accessibleLabel}
        aria-describedby={tooltipId}
      >
        ?
      </button>
      <span
        id={tooltipId}
        className="material-info-tooltip__content"
        role="tooltip"
      >
        {children}
      </span>
    </span>
  );
}
