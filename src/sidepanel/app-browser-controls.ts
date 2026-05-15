import { storePendingFullPageEntry } from "../shared/extension-surface-entry";
import {
  closeSidePanelBestEffort,
  getActiveTabId,
  getCurrentWindowId,
  resolveSidePanelCloseTargets,
} from "../shared/extension-side-panel-controls";
import {
  buildFullPageExtensionPath,
  buildFullPagePreviewUrl,
  buildSidePanelExtensionPath,
  buildSidePanelPreviewUrl,
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

async function closeCurrentExtensionTabBestEffort(): Promise<void> {
  if (
    typeof chrome === "undefined" ||
    !chrome.runtime?.id ||
    typeof chrome.tabs?.getCurrent !== "function" ||
    typeof chrome.tabs?.remove !== "function"
  ) {
    return;
  }

  try {
    const currentTab = await chrome.tabs.getCurrent();

    if (typeof currentTab?.id === "number") {
      await chrome.tabs.remove(currentTab.id);
    }
  } catch {
    // If the current surface is not a normal extension tab, keep it open.
  }
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
    const sidePanelCloseTargets = await resolveSidePanelCloseTargets({
      preferWindow: true,
    });

    await chrome.tabs.create({
      url: chrome.runtime.getURL(path),
      active: true,
    });
    await closeSidePanelBestEffort(sidePanelCloseTargets);
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

export async function openSidePanelRoute(
  route: SidePanelRouteState,
): Promise<void> {
  const path = buildSidePanelExtensionPath(route);

  if (
    typeof chrome !== "undefined" &&
    Boolean(chrome.runtime?.id) &&
    typeof chrome.sidePanel?.open === "function" &&
    typeof chrome.sidePanel?.setOptions === "function"
  ) {
    const currentWindowId = await getCurrentWindowId();

    if (currentWindowId !== null) {
      await chrome.sidePanel.setOptions({
        enabled: true,
        path,
      });
      await chrome.sidePanel.open({ windowId: currentWindowId });
      await closeCurrentExtensionTabBestEffort();
      return;
    }

    const activeTabId = await getActiveTabId();

    if (activeTabId !== null) {
      await chrome.sidePanel.setOptions({
        tabId: activeTabId,
        enabled: true,
        path,
      });
      await chrome.sidePanel.open({ tabId: activeTabId });
      return;
    }
  }

  if (typeof window === "undefined") {
    return;
  }

  window.open(
    buildSidePanelPreviewUrl(route, window.location.href),
    "_blank",
    "noopener,noreferrer",
  );
}
