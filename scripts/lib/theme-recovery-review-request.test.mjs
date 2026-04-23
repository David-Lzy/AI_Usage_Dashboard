import { describe, expect, it } from "vitest";

import {
  buildThemeRecoveryReviewRequestCompletionIssues,
  buildThemeRecoveryReviewRequestFulfillment,
  buildThemeRecoveryReviewRequestRecord,
  THEME_RECOVERY_REVIEW_REQUEST_FULFILLED_STATUS,
} from "./theme-recovery-review-request.mjs";

const REVIEW_TEMPLATE = {
  workspaceRoute:
    "http://127.0.0.1:4173/src/sidepanel/index.html#debug-theme-recovery-review",
  targetProviderIds: ["cursor", "codex"],
  expectedThemePreset: "custom",
  expectedCustomSeedHex: "#4F46E5",
  recommendedDownloads: ["summary", "json"],
  workflow: ["Open the workspace.", "Export the review."],
  truthRules: ["Do not rewrite degraded stages into a pass claim."],
};

const SEEDED_REFERENCE_EXPORT = {
  generatedAt: "2026-04-23T11:00:00.000Z",
  themeMode: "light",
  themePreset: "custom",
  themeResolved: "light",
  themeCustomSeedHex: "#4F46E5",
  popupSnapshotLabel: "Mixed state",
  popupSnapshotTone: "warning",
  popupSnapshotHeadline: "Needs access",
  popupSnapshotDetail: "Cursor and Codex still need access.",
  computedActionBadge: {
    text: "2",
    title: "2 providers need attention",
  },
  scopeIsolationLabel: "Cursor + Codex isolated",
  scopeIsolationDetail: "Only the target providers are visible.",
  missingTargetProviderIds: [],
  extraVisibleProviderLabels: [],
  overallStage: "needs_access",
  overallLabel: "Needs access",
  overallTone: "warning",
  overallDetail: "Real operator recovery has not been proven yet.",
  targetProviders: [
    {
      providerId: "cursor",
      providerLabel: "Cursor",
      visible: true,
      displaySyncStatus: "warning",
      permissionStatus: "missing",
      currentSourceLabel: "Session page",
      currentSourceStateKind: "host_access_missing",
      currentSourceStateLabel: "Host access missing",
      currentSourceStateDetail: "Cursor still needs host access.",
      currentSourceStateTone: "warning",
      lastSyncLabel: "Never synced",
      recoveryLabel: "Needs access",
      recoveryTone: "warning",
      recoveryDetail: "Grant host access first.",
      hostAccessLabel: "Missing",
      isRecovered: false,
    },
    {
      providerId: "codex",
      providerLabel: "Codex",
      visible: true,
      displaySyncStatus: "warning",
      permissionStatus: "missing",
      currentSourceLabel: "Session page",
      currentSourceStateKind: "host_access_missing",
      currentSourceStateLabel: "Host access missing",
      currentSourceStateDetail: "Codex still needs host access.",
      currentSourceStateTone: "warning",
      lastSyncLabel: "Never synced",
      recoveryLabel: "Needs access",
      recoveryTone: "warning",
      recoveryDetail: "Grant host access first.",
      hostAccessLabel: "Missing",
      isRecovered: false,
    },
  ],
  liveActionBadge: null,
};

describe("theme recovery review request helpers", () => {
  it("rejects completion exports that drift from the request contract", () => {
    expect(
      buildThemeRecoveryReviewRequestCompletionIssues({
        requestManifest: {
          requestId: "2026-04-23-first-real-theme-recovery-review-request",
          createdAt: "2026-04-23T11:13:03.801Z",
        },
        reviewTemplate: REVIEW_TEMPLATE,
        reviewExport: {
          ...SEEDED_REFERENCE_EXPORT,
          requestContext: {
            requestId: "2026-04-23-other-request",
            requestCreatedAt: "2026-04-23T11:13:03.801Z",
            requestBoundWorkspaceRoute:
              "http://127.0.0.1:4173/src/sidepanel/index.html?themeRecoveryRequestId=2026-04-23-other-request#debug-theme-recovery-review",
          },
          themePreset: "sunset",
          targetProviders: [
            SEEDED_REFERENCE_EXPORT.targetProviders[0],
            {
              ...SEEDED_REFERENCE_EXPORT.targetProviders[1],
              providerId: "gemini",
              providerLabel: "Gemini",
            },
          ],
        },
      }),
    ).toEqual([
      "Completed theme-recovery export target provider at position 2 did not match the request template provider `codex`.",
      "Completed theme-recovery export preset `sunset` did not match the request template preset `custom`.",
      "Completed theme-recovery export request id `2026-04-23-other-request` did not match the pending request id `2026-04-23-first-real-theme-recovery-review-request`.",
    ]);
  });

  it("builds fulfillment metadata and preserves it in fulfilled request records", () => {
    const rawReviewExport = `${JSON.stringify(SEEDED_REFERENCE_EXPORT, null, 2)}\n`;
    const fulfillment = buildThemeRecoveryReviewRequestFulfillment({
      fulfilledAt: "2026-04-24T09:30:00.000Z",
      sourceCompletedReviewExport: "tmp/theme-recovery-review-export.json",
      archiveId: "2026-04-24-theme-recovery-request-pass",
      archiveReadmePath:
        "Doc/testing/theme_recovery_reviews/2026-04-24-theme-recovery-request-pass/README.md",
      archiveManifestPath:
        "Doc/testing/theme_recovery_reviews/2026-04-24-theme-recovery-request-pass/review-archive.json",
      reviewExport: SEEDED_REFERENCE_EXPORT,
      rawReviewExport,
    });
    const record = buildThemeRecoveryReviewRequestRecord({
      requestId: "2026-04-24-theme-recovery-request",
      createdAt: "2026-04-24T08:00:00.000Z",
      status: THEME_RECOVERY_REVIEW_REQUEST_FULFILLED_STATUS,
      reviewTemplate: REVIEW_TEMPLATE,
      sourceTemplate:
        "fixtures/theme-recovery/operator-review-request-template.fixture.json",
      seedReferenceExport: SEEDED_REFERENCE_EXPORT,
      sourceSeedArchiveReadme:
        "Doc/testing/theme_recovery_reviews/2026-04-23-theme-recovery-seeded-archive-baseline/README.md",
      sourceSeedReviewExport:
        "Doc/testing/theme_recovery_reviews/2026-04-23-theme-recovery-seeded-archive-baseline/theme-recovery-review-export.json",
      fulfillment,
    });

    expect(record.manifest.fulfillment.archiveId).toBe(
      "2026-04-24-theme-recovery-request-pass",
    );
    expect(record.manifest.fulfillment.completedStageSummary.overallLabel).toBe(
      "Needs access",
    );
    expect(record.manifest.fulfillment.completedReviewExportDigest.sha256).toMatch(
      /^[a-f0-9]{64}$/,
    );
    expect(record.readme).toContain("Fulfillment receipt:");
    expect(record.readme).toContain(
      "Doc/testing/theme_recovery_reviews/2026-04-24-theme-recovery-request-pass/README.md",
    );
  });
});
