import { storePendingFullPageEntry } from "../shared/extension-surface-entry";
import {
  buildSurfaceSessionKey,
  captureSurfaceSessionState,
  createSurfaceSessionStateForRoute,
  restoreSurfaceSessionState,
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
import { getSafeLocalStorage } from "../shared/local-storage";
import {
  getExtensionPermissionsApi,
  getExtensionTabsApi,
  hasExtensionRuntime,
} from "../shared/extension-api";
import {
  buildSidePanelHash,
  type SidePanelRouteState,
} from "./route-state";
import {
  getLatestSettingsSurfaceSessionStateSnapshot,
  SETTINGS_SURFACE_SESSION_ROUTE_KEY,
  SETTINGS_SURFACE_SESSION_STORAGE_KEY,
} from "./use-settings-surface-session-state";
import {
  getSurfaceScrollProgress,
  getSurfaceScrollY,
} from "./surface-scroll-position";

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

function getRouteProviderId(route: SidePanelRouteState): string | null {
  return route.name === "provider-detail" ? route.providerId : null;
}

async function captureRouteSurfaceSessionState(
  route: SidePanelRouteState,
): Promise<void> {
  const routeKey = buildSidePanelHash(route);
  const storageKey = buildSurfaceSessionKey(routeKey);
  const scrollY = getSurfaceScrollY();
  const scrollProgress = getSurfaceScrollProgress();

  try {
    const latestSettingsState =
      route.name === "settings"
        ? getLatestSettingsSurfaceSessionStateSnapshot(
            scrollY,
            scrollProgress,
          )
        : null;
    const existingState =
      route.name === "settings" && !latestSettingsState?.settings
        ? await restoreSurfaceSessionState(SETTINGS_SURFACE_SESSION_STORAGE_KEY)
        : route.name === "provider-detail"
          ? await restoreSurfaceSessionState(storageKey)
          : null;
    const effectiveScrollProgress =
      route.name === "settings"
        ? (latestSettingsState?.scrollProgress ?? scrollProgress)
        : scrollProgress;
    const effectiveScrollY =
      route.name === "settings"
        ? (latestSettingsState?.scrollY ?? scrollY)
        : scrollY;
    const nextState = createSurfaceSessionStateForRoute({
      routeName: route.name,
      routeKey,
      scrollProgress: effectiveScrollProgress,
      scrollY: effectiveScrollY,
      providerId: getRouteProviderId(route),
    });
    const settings = latestSettingsState?.settings ?? existingState?.settings;
    const providerDetail =
      route.name === "provider-detail" &&
      existingState?.providerDetail?.providerId === route.providerId
        ? existingState.providerDetail
        : nextState.providerDetail;
    const stateToCapture =
      route.name === "settings" && settings
        ? {
            ...nextState,
            settings,
          }
        : route.name === "provider-detail"
          ? {
              ...nextState,
              providerDetail,
            }
        : nextState;

    if (
      route.name === "settings" &&
      settings &&
      storageKey !== SETTINGS_SURFACE_SESSION_STORAGE_KEY
    ) {
      await captureSurfaceSessionState(SETTINGS_SURFACE_SESSION_STORAGE_KEY, {
        ...stateToCapture,
        routeKey: SETTINGS_SURFACE_SESSION_ROUTE_KEY,
      });
    }

    await captureSurfaceSessionState(storageKey, stateToCapture);
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
      getSafeLocalStorage(),
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
  await captureRouteSurfaceSessionState(route);

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
