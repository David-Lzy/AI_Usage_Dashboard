import type { ProviderId } from "../providers/types";

export type SidePanelRouteState =
  | { name: "dashboard" }
  | { name: "settings" }
  | { name: "provider-detail"; providerId: ProviderId };

const PROVIDER_DETAIL_HASH_PATTERN =
  /^#provider-detail\/(cursor|jetbrains|claude-code|gemini|codex)$/;

export function buildSidePanelHash(route: SidePanelRouteState): string {
  switch (route.name) {
    case "dashboard":
      return "#dashboard";
    case "settings":
      return "#settings";
    case "provider-detail":
      return `#provider-detail/${route.providerId}`;
  }
}

export function parseSidePanelHash(hash: string): SidePanelRouteState | null {
  if (hash === "" || hash === "#" || hash === "#dashboard") {
    return { name: "dashboard" };
  }

  if (hash === "#settings") {
    return { name: "settings" };
  }

  const providerMatch = hash.match(PROVIDER_DETAIL_HASH_PATTERN);

  if (providerMatch) {
    return {
      name: "provider-detail",
      providerId: providerMatch[1] as ProviderId,
    };
  }

  return null;
}
