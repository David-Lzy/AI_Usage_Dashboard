import { describe, expect, it } from "vitest";

import {
  RDP_EXTENSION_WINDOW_ROUTES,
  getRdpExtensionWindowRouteConfig,
  getRdpExtensionWindowRouteKeys,
} from "./rdp-extension-window-routes.mjs";
import { STORE_SCREENSHOT_RUNTIME_CAPTURE_PLAN } from "./store-screenshot-rdp-capture.mjs";

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

  it("keeps store screenshot runtime routes aligned with extension-window routes", () => {
    const entriesByFilename = new Map(
      STORE_SCREENSHOT_RUNTIME_CAPTURE_PLAN.map((entry) => [
        entry.filename,
        entry,
      ]),
    );

    expect(entriesByFilename.get("01-toolbar-first-quick-glance.png")).toMatchObject(
      RDP_EXTENSION_WINDOW_ROUTES.popup,
    );
    expect(entriesByFilename.get("02-setup-guidance.png")).toMatchObject(
      RDP_EXTENSION_WINDOW_ROUTES.popup,
    );
    expect(
      entriesByFilename.get("03-honest-contract-or-policy-only.png"),
    ).toMatchObject(RDP_EXTENSION_WINDOW_ROUTES.popup);
    expect(entriesByFilename.get("04-settings-and-setup-depth.png")).toMatchObject(
      RDP_EXTENSION_WINDOW_ROUTES.settings,
    );
    expect(entriesByFilename.get("05-provider-or-dashboard-depth.png")).toMatchObject(
      RDP_EXTENSION_WINDOW_ROUTES["provider-detail-codex"],
    );
  });
});
