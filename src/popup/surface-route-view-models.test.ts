import { describe, expect, it } from "vitest";

import type { ProviderId } from "../providers/types";
import type { ProviderViewModel } from "../sidepanel/view-models";
import {
  buildActionSection,
  buildSurfaceRolesCard,
} from "./surface-route-view-models";
import type {
  PopupGuidanceAction,
  PopupGuidanceCard,
} from "./view-model-types";

function createGuidanceCard(
  kind: PopupGuidanceAction["kind"],
): PopupGuidanceCard {
  return {
    label: "Next step",
    tone: "warning",
    headline: "Action needed",
    detail: "Follow the primary route first.",
    action: {
      kind,
      label: "Primary action",
      providerId: "codex-personal-page" as ProviderId,
    },
  };
}

function createProvider(
  overrides: Partial<ProviderViewModel> = {},
): ProviderViewModel {
  return {
    currentSourceStateKind: "ready",
    providerLabel: "Codex",
    ...overrides,
  } as ProviderViewModel;
}

describe("buildActionSection", () => {
  it("shows dashboard and settings as quick actions without primary guidance", () => {
    expect(buildActionSection(null)).toEqual({
      label: "Quick Actions",
      detail:
        "Open the dashboard for the full multi-provider overview, or jump into settings when you need provider toggles, permissions, or source controls.",
      actions: [
        {
          kind: "dashboard",
          label: "Open dashboard",
        },
        {
          kind: "settings",
          label: "Open settings",
        },
      ],
    });
  });

  it("keeps dashboard as the secondary action when settings is primary", () => {
    expect(buildActionSection(createGuidanceCard("settings"))).toMatchObject({
      label: "Other route",
      actions: [
        {
          kind: "dashboard",
        },
      ],
    });
  });

  it("keeps settings as the secondary action when dashboard is primary", () => {
    expect(buildActionSection(createGuidanceCard("dashboard"))).toMatchObject({
      label: "Other route",
      actions: [
        {
          kind: "settings",
        },
      ],
    });
  });

  it("keeps broader secondary actions when provider detail is primary", () => {
    expect(
      buildActionSection(createGuidanceCard("provider-detail")),
    ).toMatchObject({
      label: "Secondary actions",
      actions: [
        {
          kind: "dashboard",
        },
        {
          kind: "settings",
        },
      ],
    });
  });
});

describe("buildSurfaceRolesCard", () => {
  it("points zero-provider states to the recommended first provider setup", () => {
    expect(
      buildSurfaceRolesCard([], createGuidanceCard("settings"), {
        providerId: "cursor-personal-page" as ProviderId,
        providerLabel: "Cursor",
      }),
    ).toEqual({
      label: "Surface roles",
      headline: "Settings owns setup",
      detail:
        "Use Settings > Quick Setup to enable Cursor, grant host access, and open the usage page. The dashboard becomes useful after at least one provider is visible.",
    });
  });

  it("uses the contract-control story when settings is primary for policy-only providers", () => {
    expect(
      buildSurfaceRolesCard(
        [
          createProvider({
            currentSourceStateKind: "policy_only",
            providerLabel: "Gemini Code Assist",
          }),
        ],
        createGuidanceCard("settings"),
      ),
    ).toMatchObject({
      headline: "Settings owns contract controls",
    });
  });

  it("uses the setup story when settings is primary for non-policy-only providers", () => {
    expect(
      buildSurfaceRolesCard([createProvider()], createGuidanceCard("settings")),
    ).toMatchObject({
      headline: "Settings owns setup",
    });
  });

  it("uses the dashboard review story when dashboard is primary", () => {
    expect(
      buildSurfaceRolesCard([createProvider()], createGuidanceCard("dashboard")),
    ).toMatchObject({
      headline: "Dashboard owns contract review",
    });
  });

  it("uses the provider-detail review story when provider detail is primary", () => {
    expect(
      buildSurfaceRolesCard(
        [createProvider()],
        createGuidanceCard("provider-detail"),
      ),
    ).toMatchObject({
      headline: "Provider detail owns review",
    });
  });

  it("uses the quick-glance story when there is no primary guidance", () => {
    expect(buildSurfaceRolesCard([createProvider()], null)).toMatchObject({
      headline: "Popup stays quick glance",
    });
  });
});
