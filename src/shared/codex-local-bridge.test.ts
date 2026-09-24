import { describe, expect, it } from "vitest";
import { normalizeCodexLocalSummary } from "./codex-local-bridge";
import { getCodexLocalConnectionCopy } from "./codex-local-localized-copy";
import { getCodexLocalEstimateCopy } from "./codex-local-estimate-copy";
import type { ResolvedAppLocale } from "./i18n";

const locales: ResolvedAppLocale[] = ["en", "zh-CN", "zh-TW", "ja", "ko", "es-419", "pt-BR", "fr", "de", "it", "ru", "ar", "hi", "id"];
const base = {
  schema: "ai-usage-dashboard.codex-local.v1",
  observedAt: "2026-09-24T10:00:00.000Z",
  accountDigest: "a".repeat(64),
  windows: [{ id: "primary", kind: "weekly", durationMinutes: 10080, usedPercent: 50, resetAt: "2026-09-30T10:00:00.000Z" }],
  availableResetCount: 0,
  estimates: [{ windowId: "primary", status: "ready", usedEquivalentUsd: 12.5, fullEquivalentUsd: 25, fullLowerUsd: 22, fullUpperUsd: 28, sampleCount: 4, confidence: "medium", priceDate: "2026-09-24" }],
};

describe("Codex local summary boundary", () => {
  it("whitelists bounded equivalent values without accepting raw identity or account URLs", () => {
    const parsed = normalizeCodexLocalSummary({ ...base, accountId: "secret-account", rawLog: "secret-prompt", path: "/secret/path" });
    expect(parsed).toMatchObject({ availableResetCount: 0, estimates: [{ status: "ready", currentUsd: 12.5, fullUsd: 25 }] });
    expect(JSON.stringify(parsed)).not.toContain("secret-");
    expect(normalizeCodexLocalSummary({ ...base, estimates: [{ ...base.estimates[0], fullEquivalentUsd: -1 }] })).toBeNull();
    expect(normalizeCodexLocalSummary({ ...base, windows: [base.windows[0], base.windows[0]] })).toBeNull();
    expect(normalizeCodexLocalSummary({ ...base, windows: [{ ...base.windows[0], id: "secondary" }], estimates: [{ ...base.estimates[0], windowId: "secondary" }] })?.estimates[0]?.windowId).toBe("secondary");
    expect(normalizeCodexLocalSummary({ ...base, windows: [{ ...base.windows[0], id: "secondary" }] })).toBeNull();
    expect(normalizeCodexLocalSummary({ ...base, estimates: [{ ...base.estimates[0], confidence: "low" }] })?.estimates[0]?.confidence).toBe("low");
  });

  it("supplies nonempty connection and estimate labels for all 14 locales", () => {
    for (const locale of locales) {
      expect(Object.values(getCodexLocalConnectionCopy(locale)).every((value) => value.length > 0)).toBe(true);
      expect(Object.values(getCodexLocalEstimateCopy(locale)).every((value) => value.length > 0)).toBe(true);
    }
  });
});
