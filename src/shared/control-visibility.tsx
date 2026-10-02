import { createContext, useContext, useRef, type ComponentPropsWithoutRef } from "react";
import { useDisclosureMotion } from "./use-disclosure-motion";

const ControlVisibilityContext = createContext(true);

// Hidden panels stay mounted to retain drafts. Portals must follow the same
// visibility boundary even though their DOM lives outside the panel.
export function ControlVisibilityBoundary({ as: Tag = "div", hidden = false, animate = false, children, ...props }: ComponentPropsWithoutRef<"div"> & { as?: "div" | "section"; animate?: boolean }) {
  const parentVisible = useContext(ControlVisibilityContext);
  const ref = useRef<HTMLDivElement | null>(null);
  const physicallyHidden = useDisclosureMotion(ref, hidden, animate, parentVisible);
  return <ControlVisibilityContext.Provider value={parentVisible && !hidden}>
    <Tag {...props} ref={ref} hidden={physicallyHidden}
      inert={hidden || !parentVisible || undefined}
      aria-hidden={hidden || !parentVisible || undefined}
      data-motion-disclosure={animate || undefined}>{children}</Tag>
  </ControlVisibilityContext.Provider>;
}

export function useControlVisibility() { return useContext(ControlVisibilityContext); }
