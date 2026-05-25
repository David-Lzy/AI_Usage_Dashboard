import type { ProviderId } from "../providers/types";
import {
  closeSidePanelBestEffort,
  openExtensionTabPath,
  openSideSurfacePath,
  resolveSidePanelCloseTarget,
} from "../shared/extension-side-panel-controls";
import { storePendingFullPageEntry } from "../shared/extension-surface-entry";
import { getSafeLocalStorage } from "../shared/local-storage";
import {
  buildSurfaceSessionKey,
  captureSurfaceSessionState,
  createSurfaceSessionStateForRoute,
  restoreSurfaceSessionState,
} from "../shared/surface-session-state";
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
} from "../shared/sidepanel-route-state";

function getRouteProviderId(route: SidePanelRouteState): string | null {
  return route.name === "provider-detail" ? route.providerId : null;
}

async function capturePopupSurfaceHandoffState(
  route: SidePanelRouteState,
): Promise<void> {
  const routeKey = buildSidePanelHash(route);
  const storageKey = buildSurfaceSessionKey(routeKey);

  try {
    const existingState =
      route.name === "settings"
        ? await restoreSurfaceSessionState(storageKey)
        : null;
    const nextState = createSurfaceSessionStateForRoute({
      routeName: route.name,
      routeKey,
      providerId: getRouteProviderId(route),
    });

    await captureSurfaceSessionState(
      storageKey,
      route.name === "settings" && existingState?.settings
        ? {
            ...nextState,
            settings: existingState.settings,
          }
        : nextState,
    );
  } catch {
    // Popup navigation must keep working even when session storage is missing.
  }
}

export async function openSidePanelRoute(route: SidePanelRouteState) {
  void capturePopupSurfaceHandoffState(route);

  const path = buildSidePanelExtensionPath(route);

  if (
    await openSideSurfacePath(path, {
      closeFullPageExtensionTabs: true,
    })
  ) {
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
  await capturePopupSurfaceHandoffState(route);

  const path = buildFullPageExtensionPath(route);

  if (typeof window !== "undefined") {
    storePendingFullPageEntry(
      "popup-expand",
      buildSidePanelHash(route),
      getSafeLocalStorage(),
    );
  }

  const sidePanelCloseTarget = await resolveSidePanelCloseTarget();

  if (await openExtensionTabPath(path)) {
    await closeSidePanelBestEffort(sidePanelCloseTarget);
    window.close();
    return;
  }

  window.open(
    buildFullPagePreviewUrl(route, window.location.href),
    "_blank",
    "noopener,noreferrer",
  );
}

export async function openDashboardSidebar() {
  await openSidePanelRoute({ name: "dashboard" });
}

export async function openFullDashboard() {
  await openFullPageRoute({ name: "dashboard" });
}

export async function openFullDashboardTab() {
  await openFullPageRoute({ name: "dashboard" });
}

export async function openSettings(focus?: SettingsRouteFocus) {
  await openFullPageRoute({ name: "settings", focus });
}

export async function openProviderDetail(providerId: ProviderId) {
  await openFullPageRoute({ name: "provider-detail", providerId });
}
