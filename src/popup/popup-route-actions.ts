import type { ProviderId } from "../providers/types";
import { storePendingFullPageEntry } from "../shared/extension-surface-entry";
import {
  buildFullPageExtensionPath,
  buildFullPagePreviewUrl,
  buildSidePanelExtensionPath,
  buildSidePanelPreviewUrl,
} from "../shared/extension-surface-paths";
import {
  buildSidePanelHash,
  type SettingsRouteFocus,
  type SidePanelRouteState,
} from "../sidepanel/route-state";

export async function openSidePanelRoute(route: SidePanelRouteState) {
  const path = buildSidePanelExtensionPath(route);

  if (
    typeof chrome !== "undefined" &&
    Boolean(chrome.runtime?.id) &&
    typeof chrome.sidePanel?.open === "function" &&
    typeof chrome.sidePanel?.setOptions === "function" &&
    typeof chrome.windows?.getCurrent === "function"
  ) {
    const [activeTab] =
      typeof chrome.tabs?.query === "function"
        ? await chrome.tabs.query({ active: true, currentWindow: true })
        : [];

    if (typeof activeTab?.id === "number") {
      await chrome.sidePanel.setOptions({
        tabId: activeTab.id,
        enabled: true,
        path,
      });
      await chrome.sidePanel.open({ tabId: activeTab.id });
    } else {
      const currentWindow = await chrome.windows.getCurrent();

      if (typeof currentWindow.id === "number") {
        await chrome.sidePanel.setOptions({
          enabled: true,
          path,
        });
        await chrome.sidePanel.open({ windowId: currentWindow.id });
      }
    }

    window.close();
    return;
  }

  window.open(
    buildSidePanelPreviewUrl(route, window.location.href),
    "_blank",
    "noopener,noreferrer",
  );
}

export async function openFullPageRoute(route: SidePanelRouteState) {
  const path = buildFullPageExtensionPath(route);

  if (typeof window !== "undefined") {
    storePendingFullPageEntry(
      "popup-expand",
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
    window.close();
    return;
  }

  window.open(
    buildFullPagePreviewUrl(route, window.location.href),
    "_blank",
    "noopener,noreferrer",
  );
}

export async function openFullDashboard() {
  await openSidePanelRoute({ name: "dashboard" });
}

export async function openFullDashboardTab() {
  await openFullPageRoute({ name: "dashboard" });
}

export async function openSettings(focus?: SettingsRouteFocus) {
  await openSidePanelRoute({ name: "settings", focus });
}

export async function openProviderDetail(providerId: ProviderId) {
  await openSidePanelRoute({ name: "provider-detail", providerId });
}
