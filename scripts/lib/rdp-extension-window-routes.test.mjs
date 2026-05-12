import { describe, expect, it } from "vitest";

import {
  RDP_EXTENSION_WINDOW_ROUTES,
  getRdpExtensionWindowRouteConfig,
  getRdpExtensionWindowRouteKeys,
} from "./rdp-extension-window-routes.mjs";

const FULL_PAGE_ROUTE_KEYS = [
  "dashboard",
  "settings",
  "settings-quick-setup-cursor",
  "settings-credentials-codex",
  "provider-detail-codex",
  "full-page-dashboard",
  "full-page-settings",
  "full-page-provider-detail-codex",
];

describe("RDP extension window routes", () => {
  it("keeps app-window sidepanel routes on the full-page surface contract", () => {
    for (const routeKey of FULL_PAGE_ROUTE_KEYS) {
      const routeConfig = getRdpExtensionWindowRouteConfig(routeKey);

      expect(routeConfig, routeKey).toBeTruthy();
      expect(routeConfig.routePath, routeKey).toContain(
        "src/sidepanel/index.html?surface=full-page#",
      );
      expect(routeConfig.routePath, routeKey).not.toMatch(
        /^src\/sidepanel\/index\.html#/,
      );
      expect(routeConfig.expectedTitle, routeKey).toBe("AI Usage Dashboard");
    }
  });

  it("keeps popup as the only app-window route without a full-page surface", () => {
    expect(getRdpExtensionWindowRouteConfig("popup")).toEqual({
      routePath: "src/popup/index.html",
      expectedTitle: "AI Usage Dashboard Popup",
      width: 640,
      height: 400,
    });
  });

  it("keeps short aliases equivalent to their explicit full-page aliases", () => {
    expect(RDP_EXTENSION_WINDOW_ROUTES.dashboard).toEqual(
      RDP_EXTENSION_WINDOW_ROUTES["full-page-dashboard"],
    );
    expect(RDP_EXTENSION_WINDOW_ROUTES.settings).toEqual(
      RDP_EXTENSION_WINDOW_ROUTES["full-page-settings"],
    );
    expect(RDP_EXTENSION_WINDOW_ROUTES["provider-detail-codex"]).toEqual(
      RDP_EXTENSION_WINDOW_ROUTES["full-page-provider-detail-codex"],
    );
  });

  it("lists supported route keys for command help", () => {
    expect(getRdpExtensionWindowRouteKeys()).toEqual([
      "popup",
      ...FULL_PAGE_ROUTE_KEYS,
    ]);
  });
});
