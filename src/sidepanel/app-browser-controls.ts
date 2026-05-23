import { storePendingFullPageEntry } from "../shared/extension-surface-entry";
import {
  buildSurfaceSessionKey,
  captureSurfaceSessionState,
  createSurfaceSessionStateForRoute,
} from "../shared/surface-session-state";
import {
  closeSidePanelBestEffort,
  getBrowserCapabilities,
  openExtensionTabPath,
  openSideSurfacePath,
  resolveSidePanelCloseTargets,
} from "../shared/extension-side-panel-controls";
import {
  buildFullPageExtensionPath,
  buildFullPagePreviewUrl,
  buildSidePanelExtensionPath,
  buildSidePanelPreviewUrl,
} from "../shared/extension-surface-paths";
import {
  getExtensionPermissionsApi,
  getExtensionTabsApi,
  hasExtensionRuntime,
} from "../shared/extension-api";
import {
  buildSidePanelHash,
  type SidePanelRouteState,
} from "./route-state";

export function hasDirectPermissionControl(): boolean {
  const permissionsApi = getExtensionPermissionsApi();

  return (
    typeof permissionsApi?.contains === "function" &&
    typeof permissionsApi.request === "function" &&
    typeof permissionsApi.remove === "function"
  );
}

export function hasTabNavigationControl(): boolean {
  const tabsApi = getExtensionTabsApi();

  return (
    hasExtensionRuntime() &&
    typeof tabsApi?.query === "function" &&
    typeof tabsApi.create === "function" &&
    typeof tabsApi.update === "function"
  );
}

function scoreTab(tab: chrome.tabs.Tab): number {
  return (tab.active ? 10_000 : 0) + (tab.lastAccessed ?? 0);
}

export function sortTabsByPriority(tabs: chrome.tabs.Tab[]): chrome.tabs.Tab[] {
  return [...tabs].sort((left, right) => scoreTab(right) - scoreTab(left));
}

function getWindowScrollY(): number | null {
  return typeof window !== "undefined" && typeof window.scrollY === "number"
    ? window.scrollY
    : null;
}

function getRouteProviderId(route: SidePanelRouteState): string | null {
  return route.name === "provider-detail" ? route.providerId : null;
}

async function captureRouteSurfaceSessionState(
  route: SidePanelRouteState,
): Promise<void> {
  const routeKey = buildSidePanelHash(route);

  try {
    await captureSurfaceSessionState(
      buildSurfaceSessionKey(routeKey),
      createSurfaceSessionStateForRoute({
        routeName: route.name,
        routeKey,
        scrollY: getWindowScrollY(),
        providerId: getRouteProviderId(route),
      }),
    );
  } catch {
    // Surface switching should remain best-effort even if session storage fails.
  }
}

export async function openFullPageRoute(
  route: SidePanelRouteState,
): Promise<void> {
  await captureRouteSurfaceSessionState(route);

  const path = buildFullPageExtensionPath(route);

  if (typeof window !== "undefined") {
    storePendingFullPageEntry(
      "sidebar-expand",
      buildSidePanelHash(route),
      window.localStorage,
    );
  }

  const sidePanelCloseTargets = await resolveSidePanelCloseTargets({
    preferWindow: true,
  });

  if (await openExtensionTabPath(path)) {
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
  void captureRouteSurfaceSessionState(route);

  const path = buildSidePanelExtensionPath(route);
  const capabilities = getBrowserCapabilities();

  if (
    await openSideSurfacePath(path, {
      closeCurrentExtensionTab:
        capabilities.supportsChromeSidePanel ||
        capabilities.supportsFirefoxSidebar,
      closeFullPageExtensionTabs: true,
      preferWindow: true,
    })
  ) {
    return;
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
