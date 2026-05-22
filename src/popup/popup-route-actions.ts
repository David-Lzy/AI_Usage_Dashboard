import type { ProviderId } from "../providers/types";
import {
  closeSidePanelBestEffort,
  openExtensionTabPath,
  openSideSurfacePath,
  resolveSidePanelCloseTarget,
} from "../shared/extension-side-panel-controls";
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
  const path = buildFullPageExtensionPath(route);

  if (typeof window !== "undefined") {
    storePendingFullPageEntry(
      "popup-expand",
      buildSidePanelHash(route),
      window.localStorage,
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
