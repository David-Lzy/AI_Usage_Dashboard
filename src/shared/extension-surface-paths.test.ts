import { describe, expect, it } from "vitest";

import type { SidePanelRouteState } from "../sidepanel/route-state";
import {
  FULL_PAGE_SURFACE_SEARCH,
  SIDEPANEL_ENTRY_PATH,
  buildFullPageExtensionPath,
  buildFullPagePreviewUrl,
  buildSidePanelExtensionPath,
  buildSidePanelPreviewUrl,
  isFullPageSurfaceSearch,
} from "./extension-surface-paths";

const route: SidePanelRouteState = {
  name: "provider-detail",
  providerId: "codex-personal-page",
};

describe("extension surface paths", () => {
  it("builds stable sidepanel and full-page extension paths", () => {
    expect(buildSidePanelExtensionPath(route)).toBe(
      `${SIDEPANEL_ENTRY_PATH}#provider-detail/codex-personal-page`,
    );
    expect(buildFullPageExtensionPath(route)).toBe(
      `${SIDEPANEL_ENTRY_PATH}${FULL_PAGE_SURFACE_SEARCH}#provider-detail/codex-personal-page`,
    );
  });

  it("builds preview urls that preserve the route contract", () => {
    const currentHref = "http://127.0.0.1:4173/src/popup/index.html";

    expect(buildSidePanelPreviewUrl(route, currentHref)).toBe(
      "http://127.0.0.1:4173/src/sidepanel/index.html#provider-detail/codex-personal-page",
    );
    expect(buildFullPagePreviewUrl(route, currentHref)).toBe(
      "http://127.0.0.1:4173/src/sidepanel/index.html?surface=full-page#provider-detail/codex-personal-page",
    );
  });

  it("recognizes only the explicit full-page surface search", () => {
    expect(isFullPageSurfaceSearch("?surface=full-page")).toBe(true);
    expect(isFullPageSurfaceSearch("surface=full-page")).toBe(true);
    expect(isFullPageSurfaceSearch("?surface=side-panel")).toBe(false);
    expect(isFullPageSurfaceSearch("")).toBe(false);
  });
});
