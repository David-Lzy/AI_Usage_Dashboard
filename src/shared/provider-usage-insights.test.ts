import { describe, expect, it } from "vitest";
import { mergeProviderUsageInsights, normalizeProviderResetCredits, normalizeProviderUsageInsights } from "./provider-usage-insights";

const meta = { source: "local_companion", capturedAt: "2026-10-13T10:00:00.000Z", accountVerified: false };
const reset = { ...meta, availableCount: 4, offers: [{ kind: "codex", available: true, expiresAt: "2026-10-20T00:00:00.000Z" }] };

describe("usage insight persistence boundary", () => {
  it("keeps count authoritative and distinguishes unknown, empty and capped details", () => {
    expect(normalizeProviderResetCredits(reset)).toMatchObject({ availableCount: 4, detailsComplete: false });
    expect(normalizeProviderResetCredits({ ...reset, offers: null })?.offers).toBeNull();
    expect(normalizeProviderResetCredits({ ...reset, availableCount: 0, offers: [] })).toMatchObject({ availableCount: 0, offers: [], detailsComplete: true });
    expect(normalizeProviderResetCredits({ ...reset, availableCount: null, offers: [] })).toMatchObject({ availableCount: null, detailsComplete: null });
  });

  it("drops opaque IDs, descriptions, invalid dates and unsupported provider data", () => {
    const parsed = normalizeProviderUsageInsights({ resetCredits: { ...reset, token: "private-token", offers: [
      { ...reset.offers[0], id: "private-id", description: "private-description" },
      { ...reset.offers[0], expiresAt: "invalid" },
    ] }, rawLog: "private-prompt" }, "codex-personal-page");
    expect(parsed?.resetCredits?.offers).toHaveLength(1);
    expect(JSON.stringify(parsed)).not.toContain("private-");
    expect(normalizeProviderUsageInsights({ resetCredits: reset }, "cursor-personal-page")).toBeNull();
    expect(normalizeProviderUsageInsights({ resetCredits: reset }, "codex-enterprise-api")).toBeNull();
    expect(normalizeProviderResetCredits({ ...reset, availableCount: -1 })).toBeNull();
    expect(normalizeProviderResetCredits({ ...reset, availableCount: 1.5 })).toBeNull();
  });

  it("keeps a fixed-period composition distinct from quota and rejects invalid sums", () => {
    const distribution = { ...meta, source: "page", accountVerified: true, kind: "function", unit: "percent", rangeStart: "2026-10-07", rangeEnd: "2026-10-13",
      values: [{ id: "tasks", label: "Tasks", value: 74.7 }, { id: "subagents", label: "Subagents", value: 11.3 }] };
    const parsed = normalizeProviderUsageInsights({ distribution });
    expect(parsed?.distribution).toMatchObject({ accountVerified: false, rangeStart: "2026-10-07", values: distribution.values });
    expect(parsed).not.toHaveProperty("remaining");
    expect(normalizeProviderUsageInsights({ distribution: { ...distribution, rangeEnd: "2026-02-30" } })).toBeNull();
    expect(normalizeProviderUsageInsights({ distribution: { ...distribution, values: [{ id: "tasks", label: "Tasks", value: 100 }, { id: "other", label: "Other", value: 40 }] } })).toBeNull();
  });

  it("merges independent capture times without replacing newer data with an old result", () => {
    const previous = normalizeProviderUsageInsights({ resetCredits: reset })!;
    const older = normalizeProviderUsageInsights({ resetCredits: { ...reset, capturedAt: "2026-10-12T10:00:00.000Z", availableCount: 2 },
      quotaScope: { ...meta, source: "page", scope: "shared_plan" } })!;
    expect(mergeProviderUsageInsights(older, previous)).toMatchObject({ resetCredits: { availableCount: 4 }, quotaScope: { scope: "shared_plan" } });
  });
});
