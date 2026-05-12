export const RDP_EXTENSION_WINDOW_ROUTES = Object.freeze({
  popup: {
    routePath: "src/popup/index.html",
    expectedTitle: "AI Usage Dashboard Popup",
    width: 640,
    height: 400,
  },
  dashboard: {
    routePath: "src/sidepanel/index.html?surface=full-page#dashboard",
    expectedTitle: "AI Usage Dashboard",
    width: 1280,
    height: 800,
  },
  settings: {
    routePath: "src/sidepanel/index.html?surface=full-page#settings",
    expectedTitle: "AI Usage Dashboard",
    width: 1280,
    height: 800,
  },
  "settings-quick-setup-cursor": {
    routePath:
      "src/sidepanel/index.html?surface=full-page#settings/quick-setup/cursor",
    expectedTitle: "AI Usage Dashboard",
    width: 1280,
    height: 800,
  },
  "settings-credentials-codex": {
    routePath:
      "src/sidepanel/index.html?surface=full-page#settings/credentials/codex",
    expectedTitle: "AI Usage Dashboard",
    width: 1280,
    height: 800,
  },
  "provider-detail-codex": {
    routePath: "src/sidepanel/index.html?surface=full-page#provider-detail/codex",
    expectedTitle: "AI Usage Dashboard",
    width: 1280,
    height: 800,
  },
  "full-page-dashboard": {
    routePath: "src/sidepanel/index.html?surface=full-page#dashboard",
    expectedTitle: "AI Usage Dashboard",
    width: 1280,
    height: 800,
  },
  "full-page-settings": {
    routePath: "src/sidepanel/index.html?surface=full-page#settings",
    expectedTitle: "AI Usage Dashboard",
    width: 1280,
    height: 800,
  },
  "full-page-provider-detail-codex": {
    routePath: "src/sidepanel/index.html?surface=full-page#provider-detail/codex",
    expectedTitle: "AI Usage Dashboard",
    width: 1280,
    height: 800,
  },
});

export function getRdpExtensionWindowRouteConfig(routeKey) {
  return RDP_EXTENSION_WINDOW_ROUTES[routeKey] ?? null;
}

export function getRdpExtensionWindowRouteKeys() {
  return Object.keys(RDP_EXTENSION_WINDOW_ROUTES);
}
