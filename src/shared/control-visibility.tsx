import { createContext, useContext, type ComponentPropsWithoutRef } from "react";

const ControlVisibilityContext = createContext(true);

// Hidden panels stay mounted to retain drafts. Portals must follow the same
// visibility boundary even though their DOM lives outside the panel.
export function ControlVisibilityBoundary({ as: Tag = "div", hidden = false, children, ...props }: ComponentPropsWithoutRef<"div"> & { as?: "div" | "section" }) {
  const parentVisible = useContext(ControlVisibilityContext);
  return <ControlVisibilityContext.Provider value={parentVisible && !hidden}>
    <Tag {...props} hidden={hidden}>{children}</Tag>
  </ControlVisibilityContext.Provider>;
}

export function useControlVisibility() { return useContext(ControlVisibilityContext); }
