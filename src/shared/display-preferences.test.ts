import { describe, expect, it } from "vitest";

import type { ProviderId } from "../providers/types";
import type { DashboardSourceId } from "./custom-sources";
import {
  createDefaultProgressItemsBySurface,
  createDefaultProviderOrderBySurface,
  DISPLAY_SURFACES,
  normalizeProgressItemsBySurface,
  normalizeProviderOrderBySurface,
  moveProgressItemPreference,
  moveProviderInOrder,
  reorderProgressItemPreferenceBefore,
  reorderProviderBefore,
  resolveProgressItemPreferences,
  resolveProviderOrder,
  setProgressItemVisibility,
} from "./display-preferences";

const PROVIDER_IDS: ProviderId[] = [
  "cursor-personal-page",
  "jetbrains-org-page",
  "claude-code-team-page",
  "gemini-policy",
  "codex-personal-page",
];
const DASHBOARD_SOURCE_IDS: DashboardSourceId[] = [
  ...PROVIDER_IDS,
  "custom:build_quota",
];

describe("display preferences", () => {
  it("defines the shipped display surfaces", () => {
    expect(DISPLAY_SURFACES).toEqual(["popup", "sidebar", "fullPage"]);
  });

  it("creates empty default provider order per surface", () => {
    expect(createDefaultProviderOrderBySurface()).toEqual({
      popup: [],
      sidebar: [],
      fullPage: [],
    });
  });

  it("creates empty default progress item settings per surface", () => {
    expect(createDefaultProgressItemsBySurface()).toEqual({
      popup: {},
      sidebar: {},
      fullPage: {},
    });
  });

  it("normalizes provider order, drops unknown ids, dedupes, and appends missing providers", () => {
    expect(
      normalizeProviderOrderBySurface(
        {
          popup: ["codex-personal-page", "unknown", "cursor-personal-page", "codex-personal-page"],
          sidebar: ["gemini-policy"],
          fullPage: [],
        },
        PROVIDER_IDS,
      ),
    ).toEqual({
      popup: ["codex-personal-page", "cursor-personal-page", "jetbrains-org-page", "claude-code-team-page", "gemini-policy"],
      sidebar: ["gemini-policy", "cursor-personal-page", "jetbrains-org-page", "claude-code-team-page", "codex-personal-page"],
      fullPage: [],
    });
  });

  it("keeps custom source ids in display order normalization", () => {
    expect(
      normalizeProviderOrderBySurface(
        {
          popup: [
            "custom:build_quota",
            "codex-personal-page",
            "custom:build_quota",
            "unknown",
          ],
        },
        DASHBOARD_SOURCE_IDS,
      ).popup,
    ).toEqual([
      "custom:build_quota",
      "codex-personal-page",
      "cursor-personal-page",
      "jetbrains-org-page",
      "claude-code-team-page",
      "gemini-policy",
    ]);
  });

  it("resolves automatic order to the default provider order", () => {
    expect(resolveProviderOrder([], PROVIDER_IDS)).toEqual(PROVIDER_IDS);
    expect(resolveProviderOrder(["codex-personal-page"], PROVIDER_IDS)).toEqual([
      "codex-personal-page",
      "cursor-personal-page",
      "jetbrains-org-page",
      "claude-code-team-page",
      "gemini-policy",
    ]);
  });

  it("moves providers inside a resolved order", () => {
    expect(moveProviderInOrder([], PROVIDER_IDS, "jetbrains-org-page", "up")).toEqual([
      "jetbrains-org-page",
      "cursor-personal-page",
      "claude-code-team-page",
      "gemini-policy",
      "codex-personal-page",
    ]);
    expect(
      moveProviderInOrder(["codex-personal-page", "cursor-personal-page"], PROVIDER_IDS, "codex-personal-page", "down"),
    ).toEqual(["cursor-personal-page", "codex-personal-page", "jetbrains-org-page", "claude-code-team-page", "gemini-policy"]);
  });

  it("reorders a dragged provider before a target provider", () => {
    expect(reorderProviderBefore([], PROVIDER_IDS, "codex-personal-page", "cursor-personal-page")).toEqual([
      "codex-personal-page",
      "cursor-personal-page",
      "jetbrains-org-page",
      "claude-code-team-page",
      "gemini-policy",
    ]);
  });

  it("falls back to automatic provider order for missing or invalid surfaces", () => {
    expect(
      normalizeProviderOrderBySurface(
        {
          popup: "codex-personal-page",
          sidebar: ["unknown"],
        },
        PROVIDER_IDS,
      ),
    ).toEqual({
      popup: [],
      sidebar: [],
      fullPage: [],
    });
  });

  it("normalizes progress item preferences by surface and provider", () => {
    expect(
      normalizeProgressItemsBySurface(
        {
          popup: {
            "codex-personal-page": [
              { id: "window:weekly", visible: false },
              { id: "unknown", visible: false },
              { id: "window:weekly", visible: true },
            ],
            cursor: [{ id: "primary", visible: "yes" }],
            unknown: [{ id: "primary", visible: false }],
          },
          fullPage: {
            "codex-personal-page": [{ id: "balance:flex", visible: false }],
          },
        },
        PROVIDER_IDS,
        {
          "codex-personal-page": ["window:5h", "window:weekly", "balance:flex"],
          "cursor-personal-page": ["primary"],
        },
      ),
    ).toEqual({
      popup: {
        "codex-personal-page": [
          { id: "window:weekly", visible: false },
          { id: "window:5h", visible: true },
          { id: "balance:flex", visible: true },
        ],
        "cursor-personal-page": [{ id: "primary", visible: true }],
      },
      sidebar: {},
      fullPage: {
        "codex-personal-page": [
          { id: "balance:flex", visible: false },
          { id: "window:5h", visible: true },
          { id: "window:weekly", visible: true },
        ],
      },
    });
  });

  it("normalizes progress item preferences for custom source ids", () => {
    expect(
      normalizeProgressItemsBySurface(
        {
          popup: {
            "custom:build_quota": [
              { id: "primary", visible: false },
              { id: "unknown", visible: true },
            ],
          },
        },
        DASHBOARD_SOURCE_IDS,
        {
          "custom:build_quota": ["primary"],
        },
      ),
    ).toEqual({
      popup: {
        "custom:build_quota": [{ id: "primary", visible: false }],
      },
      sidebar: {},
      fullPage: {},
    });
  });

  it("resolves progress item preferences to visible defaults and appended known ids", () => {
    expect(resolveProgressItemPreferences(undefined, ["primary"])).toEqual([
      { id: "primary", visible: true },
    ]);
    expect(
      resolveProgressItemPreferences(
        [{ id: "window:weekly", visible: false }],
        ["window:5h", "window:weekly", "balance:flex"],
      ),
    ).toEqual([
      { id: "window:weekly", visible: false },
      { id: "window:5h", visible: true },
      { id: "balance:flex", visible: true },
    ]);
  });

  it("defaults normalized Flex credit balances to hidden while preserving explicit visibility", () => {
    const flexItemId =
      "balance:flex_credit_balance:Flex%20credit%20balance:0";

    expect(
      resolveProgressItemPreferences(undefined, ["window:weekly", flexItemId]),
    ).toEqual([
      { id: "window:weekly", visible: true },
      { id: flexItemId, visible: false },
    ]);
    expect(
      resolveProgressItemPreferences(
        [{ id: flexItemId, visible: true }],
        ["window:weekly", flexItemId],
      ),
    ).toEqual([
      { id: flexItemId, visible: true },
      { id: "window:weekly", visible: true },
    ]);
  });

  it("updates progress item visibility while preserving all known items", () => {
    expect(
      setProgressItemVisibility(undefined, ["window:5h", "window:weekly"], "window:5h", false),
    ).toEqual([
      { id: "window:5h", visible: false },
      { id: "window:weekly", visible: true },
    ]);
  });

  it("moves and reorders progress item preferences without losing visibility", () => {
    const preferences = [
      { id: "window:5h", visible: true },
      { id: "window:weekly", visible: false },
      { id: "balance:flex", visible: true },
    ];

    expect(
      moveProgressItemPreference(
        preferences,
        ["window:5h", "window:weekly", "balance:flex"],
        "balance:flex",
        "up",
      ),
    ).toEqual([
      { id: "window:5h", visible: true },
      { id: "balance:flex", visible: true },
      { id: "window:weekly", visible: false },
    ]);
    expect(
      reorderProgressItemPreferenceBefore(
        preferences,
        ["window:5h", "window:weekly", "balance:flex"],
        "balance:flex",
        "window:5h",
      ),
    ).toEqual([
      { id: "balance:flex", visible: true },
      { id: "window:5h", visible: true },
      { id: "window:weekly", visible: false },
    ]);
  });

  it("drops progress preferences when no known item ids are supplied", () => {
    expect(
      normalizeProgressItemsBySurface(
        {
          popup: {
            "codex-personal-page": [{ id: "window:weekly", visible: false }],
          },
        },
        PROVIDER_IDS,
      ),
    ).toEqual({
      popup: {},
      sidebar: {},
      fullPage: {},
    });
  });
});
