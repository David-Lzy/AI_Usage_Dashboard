export function providerInsightsQaOverrides(now = Date.now(), windows = 1) {
  const capturedAt = new Date(now).toISOString();
  const future = (hours) => new Date(now + hours * 3600_000).toISOString();
  const meta = (source = "page") => ({ source, capturedAt, accountVerified: source === "local_companion" });
  const window = (id, kind, used, hours) => ({ id, kind, label: kind === "weekly" ? "Weekly limit" : "5-hour limit", normalizedLabel: kind,
    modelLabel: null, quotaUnit: "percent", used, remaining: 100 - used, total: 100, resetAt: future(hours), resetLabel: null });
  return {
    "codex-personal-page": { syncSource: "local_companion", syncStatus: "ok", quotaUnit: "percent", quotaWindow: "rolling", used: 24, remaining: 76, total: 100,
      lastSuccessAt: capturedAt, lastAttemptAt: capturedAt, syncedAt: capturedAt, resetAt: future(120), planName: "Synthetic Codex",
      usageWindows: [...(windows > 1 ? [window("codex:primary", "rolling_5h", 12, 3)] : []), window("codex:secondary", "weekly", 24, 120)], usageBalances: [],
      codexLocal: { availableResetCount: 2, accountVerified: true, estimates: [
        { windowId: "secondary", status: "ready", fullUsd: 800, fullLowerUsd: 720, fullUpperUsd: 920, currentUsd: 192, sampleCount: 42, confidence: "medium", priceDate: "2026-09-24" },
        { windowId: "primary", status: "learning", fullUsd: null, fullLowerUsd: null, fullUpperUsd: null, currentUsd: null, sampleCount: 3, confidence: null, priceDate: null },
      ] }, usageInsights: { quotaScope: { ...meta(), scope: "shared_plan" },
        resetCredits: { ...meta("local_companion"), availableCount: 2, detailsComplete: false,
          offers: [{ kind: "codex", available: true, expiresAt: future(16) }, { kind: "codex", available: true, expiresAt: null }] },
        distribution: { ...meta(), kind: "function", unit: "percent", rangeStart: "2026-10-06", rangeEnd: "2026-10-12",
          values: [{ id: "tasks", label: "Tasks", value: 64 }, { id: "subagents", label: "Subagents", value: 24 }, { id: "memory", label: "Memory", value: 12 }] },
      } },
    "claude-code-team-page": { syncSource: "page_parse", syncStatus: "ok", lastSuccessAt: capturedAt, lastAttemptAt: capturedAt, syncedAt: capturedAt,
      quotaUnit: "percent", quotaWindow: "rolling", used: 18, remaining: 82, total: 100, resetAt: future(96), planName: "Synthetic Claude",
      usageWindows: [window("claude:five_hour", "rolling_5h", 18, 3), window("claude:weekly", "weekly", 41, 96)],
      usageInsights: { resetCredits: { ...meta(), availableCount: null, detailsComplete: null, offers: [
        { kind: "full", available: true, expiresAt: future(48) }, { kind: "rolling_5h", available: false, expiresAt: null },
      ] }, balances: [
        { ...meta(), id: "cloud_session", remaining: 17, total: 25, unit: "USD", expiresAt: future(12) },
        { ...meta(), id: "usage_credit", remaining: 42, total: null, unit: "USD", expiresAt: null },
      ] } },
    "cursor-personal-page": { syncSource: "page_parse", syncStatus: "ok", lastSuccessAt: capturedAt, lastAttemptAt: capturedAt, syncedAt: capturedAt,
      quotaUnit: "unknown", used: null, remaining: null, total: null, usageWindows: [], planName: "Synthetic Cursor",
      usageInsights: { quotaPools: [
        { ...meta(), id: "cursor_models", kind: "monthly", usedPercent: 32, remainingPercent: 68, resetAt: null, resetText: "Source: November 1" },
        { ...meta(), id: "other_models", kind: "monthly", usedPercent: 68, remainingPercent: 32, resetAt: null, resetText: "Source: November 1" },
        { ...meta(), id: "grok_bot", kind: "weekly", usedPercent: 0, remainingPercent: 100, resetAt: null, resetText: "Resets weekly" },
      ] } },
  };
}

export function communityResetQaStore(now = Date.now()) {
  const capturedAt = new Date(now).toISOString(), expiresAt = new Date(now + 600_000).toISOString();
  const event = { source: "codex-resets", id: "2100000000000000001", kind: "reset", state: "reported", announcedAt: capturedAt,
    scheduledFor: null, originalUrl: "https://x.com/i/web/status/2100000000000000001", traceable: true, summary: "Synthetic community reset report." };
  const cache = (fragment) => ({ fragment, etag: null, checkedAt: capturedAt, capturedAt, expiresAt, retryAt: null, failures: 0, failure: null });
  return { schemaVersion: 1, revision: 0, preferences: { mode: "off", sources: ["codex-resets", "codex-reset"] }, caches: {
    status: cache({ events: [event], forecasts: [], generatedAt: capturedAt }),
    timeline: cache({ events: [{ ...event, source: "codex-reset", state: "unknown" }], forecasts: [], generatedAt: null }),
    forecast: cache({ events: [], forecasts: [{ source: "codex-reset", capturedAt, expiresAt: null, percent24h: 19, percent48h: 34,
      watchPercent: null, confidence: "low", lastResetAt: capturedAt }], generatedAt: capturedAt }),
  } };
}
