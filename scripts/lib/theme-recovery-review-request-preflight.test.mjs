import { describe, expect, it } from "vitest";

import { buildThemeRecoveryReviewRequestPreflight } from "./theme-recovery-review-request-preflight.mjs";

const REQUEST_MANIFEST = {
  requestId: "2026-04-23-first-real-theme-recovery-review-request",
  createdAt: "2026-04-23T11:13:03.801Z",
  status: "pending_operator_review",
};

const REVIEW_TEMPLATE = {
  workspaceRoute:
    "http://127.0.0.1:4173/src/sidepanel/index.html#debug-theme-recovery-review",
  targetProviderIds: ["cursor", "codex"],
  expectedThemePreset: "custom",
  expectedCustomSeedHex: "#4F46E5",
};

const REVIEW_EXPORT = {
  generatedAt: "2026-04-24T10:15:00.000Z",
  requestContext: {
    requestId: "2026-04-23-first-real-theme-recovery-review-request",
    requestCreatedAt: "2026-04-23T11:13:03.801Z",
    requestBoundWorkspaceRoute:
      "http://127.0.0.1:4173/src/sidepanel/index.html?themeRecoveryRequestId=2026-04-23-first-real-theme-recovery-review-request&themeRecoveryRequestCreatedAt=2026-04-23T11%3A13%3A03.801Z#debug-theme-recovery-review",
  },
  themeMode: "light",
  themePreset: "custom",
  themeResolved: "light",
  themeCustomSeedHex: "#4F46E5",
  popupSnapshotLabel: "Mixed state",
  scopeIsolationLabel: "Cursor + Codex isolated",
  overallStage: "needs_access",
  overallLabel: "Needs access",
  targetProviders: [
    { providerId: "cursor" },
    { providerId: "codex" },
  ],
};

describe("theme recovery review request preflight helpers", () => {
  it("accepts a matching request-bound export", () => {
    const report = buildThemeRecoveryReviewRequestPreflight({
      requestManifest: REQUEST_MANIFEST,
      reviewTemplate: REVIEW_TEMPLATE,
      reviewExport: REVIEW_EXPORT,
    });

    expect(report.ok).toBe(true);
    expect(report.failures).toEqual([]);
    expect(report.requestBinding.requestId).toBe(
      "2026-04-23-first-real-theme-recovery-review-request",
    );
  });

  it("rejects a mismatched request binding", () => {
    const report = buildThemeRecoveryReviewRequestPreflight({
      requestManifest: REQUEST_MANIFEST,
      reviewTemplate: REVIEW_TEMPLATE,
      reviewExport: {
        ...REVIEW_EXPORT,
        requestContext: {
          ...REVIEW_EXPORT.requestContext,
          requestId: "2026-04-23-wrong-request-id",
        },
      },
    });

    expect(report.ok).toBe(false);
    expect(report.failures[0]).toContain("request binding did not match");
  });
});
