import { storePendingFullPageEntry } from "../shared/extension-surface-entry";
import {
  buildFullPageExtensionPath,
  buildFullPagePreviewUrl,
} from "../shared/extension-surface-paths";
import {
  buildSidePanelHash,
  type SidePanelRouteState,
} from "./route-state";

export function hasDirectPermissionControl(): boolean {
  return (
    typeof chrome !== "undefined" &&
    Boolean(chrome.runtime?.id) &&
    typeof chrome.permissions?.contains === "function" &&
    typeof chrome.permissions?.request === "function" &&
    typeof chrome.permissions?.remove === "function"
  );
}

export function hasTabNavigationControl(): boolean {
  return (
    typeof chrome !== "undefined" &&
    Boolean(chrome.runtime?.id) &&
    typeof chrome.tabs?.query === "function" &&
    typeof chrome.tabs?.create === "function" &&
    typeof chrome.tabs?.update === "function"
  );
}

function scoreTab(tab: chrome.tabs.Tab): number {
  return (tab.active ? 10_000 : 0) + (tab.lastAccessed ?? 0);
}

export function sortTabsByPriority(tabs: chrome.tabs.Tab[]): chrome.tabs.Tab[] {
  return [...tabs].sort((left, right) => scoreTab(right) - scoreTab(left));
}

export async function openFullPageRoute(
  route: SidePanelRouteState,
): Promise<void> {
  const path = buildFullPageExtensionPath(route);

  if (typeof window !== "undefined") {
    storePendingFullPageEntry(
      "sidebar-expand",
      buildSidePanelHash(route),
      window.localStorage,
    );
  }

  if (
    typeof chrome !== "undefined" &&
    Boolean(chrome.runtime?.id) &&
    typeof chrome.runtime?.getURL === "function" &&
    typeof chrome.tabs?.create === "function"
  ) {
    await chrome.tabs.create({
      url: chrome.runtime.getURL(path),
      active: true,
    });
    return;
  }

  if (typeof window === "undefined") {
    return;
  }

  window.open(
    buildFullPagePreviewUrl(route, window.location.href),
    "_blank",
    "noopener,noreferrer",
  );
}
