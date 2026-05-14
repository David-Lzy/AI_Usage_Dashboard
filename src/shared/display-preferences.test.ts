import { describe, expect, it } from "vitest";

import type { ProviderId } from "../providers/types";
import {
  createDefaultProgressItemsBySurface,
  createDefaultProviderOrderBySurface,
  DISPLAY_SURFACES,
  normalizeProgressItemsBySurface,
  normalizeProviderOrderBySurface,
  moveProviderInOrder,
  reorderProviderBefore,
  resolveProviderOrder,
} from "./display-preferences";

const PROVIDER_IDS: ProviderId[] = [
  "cursor",
  "jetbrains",
  "claude-code",
  "gemini",
  "codex",
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
          popup: ["codex", "unknown", "cursor", "codex"],
          sidebar: ["gemini"],
          fullPage: [],
        },
        PROVIDER_IDS,
      ),
    ).toEqual({
      popup: ["codex", "cursor", "jetbrains", "claude-code", "gemini"],
      sidebar: ["gemini", "cursor", "jetbrains", "claude-code", "codex"],
      fullPage: [],
    });
  });

  it("resolves automatic order to the default provider order", () => {
    expect(resolveProviderOrder([], PROVIDER_IDS)).toEqual(PROVIDER_IDS);
    expect(resolveProviderOrder(["codex"], PROVIDER_IDS)).toEqual([
      "codex",
      "cursor",
      "jetbrains",
      "claude-code",
      "gemini",
    ]);
  });

  it("moves providers inside a resolved order", () => {
    expect(moveProviderInOrder([], PROVIDER_IDS, "jetbrains", "up")).toEqual([
      "jetbrains",
      "cursor",
      "claude-code",
      "gemini",
      "codex",
    ]);
    expect(
      moveProviderInOrder(["codex", "cursor"], PROVIDER_IDS, "codex", "down"),
    ).toEqual(["cursor", "codex", "jetbrains", "claude-code", "gemini"]);
  });

  it("reorders a dragged provider before a target provider", () => {
    expect(reorderProviderBefore([], PROVIDER_IDS, "codex", "cursor")).toEqual([
      "codex",
      "cursor",
      "jetbrains",
      "claude-code",
      "gemini",
    ]);
  });

  it("falls back to automatic provider order for missing or invalid surfaces", () => {
    expect(
      normalizeProviderOrderBySurface(
        {
          popup: "codex",
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
            codex: [
              { id: "window:weekly", visible: false },
              { id: "unknown", visible: false },
              { id: "window:weekly", visible: true },
            ],
            cursor: [{ id: "primary", visible: "yes" }],
            unknown: [{ id: "primary", visible: false }],
          },
          fullPage: {
            codex: [{ id: "balance:flex", visible: false }],
          },
        },
        PROVIDER_IDS,
        {
          codex: ["window:5h", "window:weekly", "balance:flex"],
          cursor: ["primary"],
        },
      ),
    ).toEqual({
      popup: {
        codex: [
          { id: "window:weekly", visible: false },
          { id: "window:5h", visible: true },
          { id: "balance:flex", visible: true },
        ],
        cursor: [{ id: "primary", visible: true }],
      },
      sidebar: {},
      fullPage: {
        codex: [
          { id: "balance:flex", visible: false },
          { id: "window:5h", visible: true },
          { id: "window:weekly", visible: true },
        ],
      },
    });
  });

  it("drops progress preferences when no known item ids are supplied", () => {
    expect(
      normalizeProgressItemsBySurface(
        {
          popup: {
            codex: [{ id: "window:weekly", visible: false }],
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
