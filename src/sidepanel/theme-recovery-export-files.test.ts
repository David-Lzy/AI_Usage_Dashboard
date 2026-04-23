import { describe, expect, it } from "vitest";

import { buildThemeRecoveryExportFilename } from "./theme-recovery-export-files";
import type { ThemeRecoveryReviewExport } from "./theme-recovery-review";

const sampleExport: ThemeRecoveryReviewExport = {
  generatedAt: "2026-04-23T10:37:14.371Z",
  requestContext: null,
  themeMode: "dark",
  themePreset: "custom",
  themeResolved: "dark",
  themeCustomSeedHex: "#4F46E5",
  popupSnapshotLabel: "Aligned",
  popupSnapshotTone: "neutral",
  popupSnapshotHeadline: "Synced 1m ago",
  popupSnapshotDetail: "Visible providers are currently healthy.",
  computedActionBadge: {
    text: "",
    title: "AI Usage Dashboard: all visible providers are healthy",
  },
  scopeIsolationLabel: "Cursor + Codex isolated",
  scopeIsolationDetail: "Only the target session-page providers are visible.",
  missingTargetProviderIds: [],
  extraVisibleProviderLabels: [],
  overallStage: "recovered",
  overallLabel: "Recovered",
  overallTone: "neutral",
  overallDetail: "The target providers are healthy.",
  targetProviders: [],
  liveActionBadge: null,
};

describe("theme recovery export filenames", () => {
  it("builds a stable summary filename", () => {
    expect(
      buildThemeRecoveryExportFilename("summary-draft", sampleExport),
    ).toBe(
      "theme-recovery-summary-2026-04-23-dark-recovered-custom.md",
    );
  });

  it("builds a stable export filename", () => {
    expect(
      buildThemeRecoveryExportFilename("export-json", sampleExport),
    ).toBe(
      "theme-recovery-export-2026-04-23-dark-recovered-custom.json",
    );
  });

  it("includes the request id when the export is request-bound", () => {
    expect(
      buildThemeRecoveryExportFilename("export-json", {
        ...sampleExport,
        requestContext: {
          requestId: "2026-04-23-first-real-theme-recovery-review-request",
          requestCreatedAt: "2026-04-23T11:13:03.801Z",
          requestBoundWorkspaceRoute:
            "http://127.0.0.1:4173/src/sidepanel/index.html?themeRecoveryRequestId=2026-04-23-first-real-theme-recovery-review-request&themeRecoveryRequestCreatedAt=2026-04-23T11%3A13%3A03.801Z#debug-theme-recovery-review",
        },
      }),
    ).toBe(
      "theme-recovery-export-2026-04-23-dark-recovered-custom-request-2026-04-23-first-real-theme-recovery-rev.json",
    );
  });
});
