import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../shared/constants";
import { buildPopupViewModel } from "./view-models";

describe("popup view models", () => {
  it("prioritizes providers needing attention in the compact popup list", () => {
    const model = buildPopupViewModel(SAMPLE_APP_STATE);

    expect(model.featuredProviders.map((provider) => provider.providerId)).toEqual([
      "claude-code",
      "codex",
      "gemini",
    ]);
  });

  it("falls back to the first visible providers when everything is healthy", () => {
    const model = buildPopupViewModel({
      ...SAMPLE_APP_STATE,
      providers: SAMPLE_APP_STATE.providers.map((provider) => ({
        ...provider,
        syncStatus: "ok",
        tone: "neutral",
        warningReason: null,
      })),
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) => ({
        ...provider,
        status: "granted",
      })),
    });

    expect(model.featuredProviders.map((provider) => provider.providerId)).toEqual([
      "claude-code",
      "codex",
      "cursor",
    ]);
  });

  it("surfaces mixed cached snapshot freshness in the popup status model", () => {
    const model = buildPopupViewModel(SAMPLE_APP_STATE);

    expect(model.snapshotStatus).toMatchObject({
      label: "Mixed state",
      tone: "warning",
      headline: "Synced 2m ago",
    });
    expect(model.snapshotStatus.detail).toContain("Cursor");
    expect(model.snapshotStatus.detail).toContain("Claude Code");
  });

  it("marks aligned popup snapshots when visible providers share one fresh state", () => {
    const model = buildPopupViewModel({
      ...SAMPLE_APP_STATE,
      providers: SAMPLE_APP_STATE.providers.map((provider) => ({
        ...provider,
        syncedAt: "2026-04-20 10:42",
        lastSyncLabel: "Synced just now",
        syncStatus: "ok",
        tone: "neutral",
        warningReason: null,
      })),
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) => ({
        ...provider,
        status: provider.enabled ? "granted" : provider.status,
      })),
    });

    expect(model.snapshotStatus).toEqual({
      label: "Aligned",
      tone: "neutral",
      headline: "Synced just now",
      detail:
        "Visible providers are currently healthy. All 4 visible providers share the same cached snapshot window.",
    });
  });
});
