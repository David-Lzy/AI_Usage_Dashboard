import {
  buildSidePanelHash,
  type SidePanelRouteState,
} from "../sidepanel/route-state";

export const SIDEPANEL_ENTRY_PATH = "src/sidepanel/index.html";
export const FULL_PAGE_SURFACE_SEARCH = "?surface=full-page";

function buildPreviewUrl(
  relativeEntryPath: string,
  route: SidePanelRouteState,
  currentHref: string,
): string {
  return new URL(
    `${relativeEntryPath}${buildSidePanelHash(route)}`,
    currentHref,
  ).toString();
}

export function buildSidePanelExtensionPath(route: SidePanelRouteState): string {
  return `${SIDEPANEL_ENTRY_PATH}${buildSidePanelHash(route)}`;
}

export function buildFullPageExtensionPath(route: SidePanelRouteState): string {
  return `${SIDEPANEL_ENTRY_PATH}${FULL_PAGE_SURFACE_SEARCH}${buildSidePanelHash(route)}`;
}

export function buildSidePanelPreviewUrl(
  route: SidePanelRouteState,
  currentHref: string,
): string {
  return buildPreviewUrl("../sidepanel/index.html", route, currentHref);
}

export function buildFullPagePreviewUrl(
  route: SidePanelRouteState,
  currentHref: string,
): string {
  return buildPreviewUrl(
    `../sidepanel/index.html${FULL_PAGE_SURFACE_SEARCH}`,
    route,
    currentHref,
  );
}

export function isFullPageSurfaceSearch(search: string): boolean {
  const normalizedSearch = search.startsWith("?") ? search.slice(1) : search;
  return new URLSearchParams(normalizedSearch).get("surface") === "full-page";
}
