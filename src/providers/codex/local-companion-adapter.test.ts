import { describe, expect, it } from "vitest";

import { DEFAULT_APP_STATE } from "../../shared/constants";
import type { CodexLocalSummary } from "../../shared/codex-local-bridge";
import { buildCodexLocalFailure, buildCodexLocalSnapshot } from "./local-companion-adapter";

const baseline = DEFAULT_APP_STATE.providers.find((provider) => provider.providerId === "codex-personal-page")!;
const capturedAt = "2026-09-24T10:00:00.000Z";
const summary: CodexLocalSummary = {
  schema: "ai-usage-dashboard.codex-local.v1",
  observedAt: capturedAt,
  accountDigest: "a".repeat(64),
  windows: [
    { id: "primary", kind: "rolling_5h", durationMinutes: 300, usedPercent: 20, resetAt: "2026-09-24T15:00:00.000Z" },
    { id: "secondary", kind: "weekly", durationMinutes: 10080, usedPercent: 65, resetAt: "2026-09-30T10:00:00.000Z" },
  ],
  availableResetCount: 0,
  estimates: [
    { windowId: "primary", status: "learning", fullUsd: null, fullLowerUsd: null, fullUpperUsd: null, currentUsd: null, sampleCount: 0, confidence: null, priceDate: null },
    { windowId: "secondary", status: "ready", fullUsd: 100, fullLowerUsd: 90, fullUpperUsd: 110, currentUsd: 65, sampleCount: 3, confidence: "medium", priceDate: "2026-09-24" },
  ],
};

describe("Codex local snapshot", () => {
  it("uses actual returned windows and keeps their successful capture time on failure", () => {
    const captured = buildCodexLocalSnapshot(baseline, summary, new Date("2026-09-24T10:00:02.000Z"));
    expect(captured).toMatchObject({ syncSource: "local_companion", syncStatus: "ok", remaining: 35, lastSuccessAt: capturedAt, codexLocal: { availableResetCount: 0, accountVerified: true } });
    expect(captured.usageWindows?.map((window) => window.kind)).toEqual(["rolling_5h", "weekly"]);
    const failed = buildCodexLocalFailure(captured, new Date("2026-09-24T12:00:00.000Z"));
    expect(failed).toMatchObject({ syncSource: "local_companion", syncStatus: "error", lastAttemptAt: "2026-09-24T12:00:00.000Z", lastSuccessAt: capturedAt });
    expect(failed.codexLocal?.estimates).toEqual(captured.codexLocal?.estimates);
  });
});
