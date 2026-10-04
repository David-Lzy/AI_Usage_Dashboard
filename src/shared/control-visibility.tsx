import { createContext, useContext, useRef, type ComponentPropsWithoutRef } from "react";
import { useDisclosureMotion } from "./use-disclosure-motion";

const ControlVisibilityContext = createContext(true);

// Hidden panels stay mounted to retain drafts. Portals must follow the same
// visibility boundary even though their DOM lives outside the panel.
export function ControlVisibilityBoundary({ as: Tag = "div", hidden = false, logicalHidden = hidden, animate = false, children, style, ...props }: ComponentPropsWithoutRef<"div"> & { as?: "div" | "section"; animate?: boolean; logicalHidden?: boolean }) {
  const parentVisible = useContext(ControlVisibilityContext);
  const ref = useRef<HTMLDivElement | null>(null);
  const physicallyHidden = useDisclosureMotion(ref, hidden, animate, parentVisible);
  return <ControlVisibilityContext.Provider value={parentVisible && !logicalHidden}>
    <Tag {...props} ref={ref} hidden={physicallyHidden}
      style={physicallyHidden ? { ...style, display: "none" } : style}
      inert={logicalHidden || !parentVisible || undefined}
      aria-hidden={logicalHidden || !parentVisible || undefined}
      data-motion-disclosure={animate || undefined}>{children}</Tag>
  </ControlVisibilityContext.Provider>;
}

export function useControlVisibility() { return useContext(ControlVisibilityContext); }
