import { useId, useRef, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { ControlVisibilityBoundary, useControlVisibility } from "../control-visibility";
import { useDisclosureMotion } from "../use-disclosure-motion";

export function MotionDetails({ summary, summaryProps, children, open: controlledOpen, onOpenChange, ...props }: Omit<ComponentPropsWithoutRef<"details">, "onToggle"> & {
  summary: ReactNode;
  summaryProps?: Omit<ComponentPropsWithoutRef<"summary">, "onClick" | "aria-expanded" | "aria-controls">;
  onOpenChange?: (open: boolean) => void;
}) {
  const [localOpen, setLocalOpen] = useState(Boolean(controlledOpen));
  const controlled = controlledOpen !== undefined && Boolean(onOpenChange);
  const open = controlled ? controlledOpen : localOpen;
  const bodyId = useId();
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useControlVisibility();
  const hidden = useDisclosureMotion(ref, !open, true, visible);
  return <details {...props} open={open || !hidden} data-motion-details="">
    <summary {...summaryProps} aria-expanded={open} aria-controls={bodyId} onClick={(event) => {
      event.preventDefault();
      if (!controlled) setLocalOpen(!open);
      onOpenChange?.(!open);
    }}>{summary}</summary>
    <div ref={ref} id={bodyId} hidden={hidden}>
      <ControlVisibilityBoundary logicalHidden={!open}>
        {children}
      </ControlVisibilityBoundary>
    </div>
  </details>;
}
