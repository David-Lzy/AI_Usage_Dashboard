import { describe, expect, it } from "vitest";

import type { ProviderViewModel } from "../shared/provider-view-models";
import { buildSnapshotStatus } from "./snapshot-status-view-models";

function createProvider(
  overrides: Partial<ProviderViewModel> = {},
): ProviderViewModel {
  return {
    displaySyncStatus: "ok",
    lastSyncLabel: "just now",
    permissionStatus: "granted",
    providerLabel: "Codex",
    syncedAt: "2026-05-13T03:00:00.000Z",
    ...overrides,
  } as ProviderViewModel;
}

describe("buildSnapshotStatus", () => {
  it("returns the existing no-provider warning copy", () => {
    expect(buildSnapshotStatus([])).toEqual({
      label: "No providers",
      tone: "warning",
      headline: "No visible providers",
      detail:
        "No shared popup snapshot exists yet. Enable one provider to start caching state here.",
    });
  });

  it("marks one aligned provider as neutral", () => {
    expect(buildSnapshotStatus([createProvider()])).toEqual({
      label: "Aligned",
      tone: "neutral",
      headline: "just now",
      detail: "The visible provider shares the same cached snapshot window.",
    });
  });

  it("marks aligned multiple providers as neutral", () => {
    expect(
      buildSnapshotStatus([
        createProvider({ providerLabel: "Codex" }),
        createProvider({ providerLabel: "Cursor" }),
      ]),
    ).toEqual({
      label: "Aligned",
      tone: "neutral",
      headline: "just now",
      detail: "All 2 visible providers share the same cached snapshot window.",
    });
  });

  it("marks mixed snapshot times as warning with newest and oldest context", () => {
    expect(
      buildSnapshotStatus([
        createProvider({
          providerLabel: "Cursor",
          syncedAt: "2026-05-13T02:00:00.000Z",
          lastSyncLabel: "1 hour ago",
        }),
        createProvider({
          providerLabel: "Codex",
          syncedAt: "2026-05-13T03:00:00.000Z",
          lastSyncLabel: "just now",
        }),
      ]),
    ).toEqual({
      label: "Mixed state",
      tone: "warning",
      headline: "just now",
      detail:
        "Newest visible snapshot: Codex (just now). Oldest visible snapshot: Cursor (1 hour ago).",
    });
  });

  it("marks missing permissions as mixed warning even when timestamps align", () => {
    expect(
      buildSnapshotStatus([
        createProvider({
          permissionStatus: "missing",
        }),
      ]),
    ).toMatchObject({
      label: "Mixed state",
      tone: "warning",
    });
  });

  it("lets sync errors dominate the tone", () => {
    expect(
      buildSnapshotStatus([
        createProvider({
          displaySyncStatus: "error",
        }),
      ]),
    ).toMatchObject({
      label: "Sync issue",
      tone: "error",
    });
  });
});
