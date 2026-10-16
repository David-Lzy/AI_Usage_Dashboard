import { lazy, Suspense, type ComponentProps } from "react";
import type { CommunityResetPanel } from "./CommunityResetPanel";

const Panel = lazy(() => import("./CommunityResetPanel").then((module) => ({ default: module.CommunityResetPanel })));

export function CommunityResetPanelSlot(props: ComponentProps<typeof CommunityResetPanel>) {
  return <Suspense fallback={null}><Panel {...props} /></Suspense>;
}
