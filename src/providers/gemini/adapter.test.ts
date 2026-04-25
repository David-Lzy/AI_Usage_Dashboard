import { describe, expect, it } from "vitest";

import type { ProviderSetting, ProviderSnapshot } from "../types";
import { createEmptyPageBinding } from "../../shared/page-bindings";

import { syncGeminiProvider } from "./adapter";
import {
  getGeminiReleaseDecision,
  getGeminiStaticQuotaPolicy,
} from "./official";

const baseProvider: ProviderSnapshot = {
  providerId: "gemini",
  providerLabel: "Gemini Code Assist",
  planName: "Unknown",
  quotaUnit: "requests",
  quotaWindow: "daily",
  used: null,
  remaining: null,
  total: null,
  resetAt: "Unknown",
  resetLabel: "Unknown",
  syncedAt: "Unknown",
  syncSource: "official",
  syncStatus: "ok",
  warningReason: null,
  lastSyncLabel: "Never synced",
  sourceSelectionReason: "",
  sourceFallbackReason: null,
  tone: "neutral",
};

const grantedSetting: ProviderSetting = {
  id: "gemini",
  label: "Gemini Code Assist",
  enabled: true,
  status: "granted",
  credentialStatus: "not_required",
  sourcePreference: "auto",
  pageBinding: createEmptyPageBinding(),
  hostsLabel: "No host access required",
  hostOrigins: [],
  description: "Uses documented static quota policy only in v1.",
};

describe("Gemini static quota policy", () => {
  it("records the shipped release decision as policy-only", () => {
    const decision = getGeminiReleaseDecision();

    expect(decision.mode).toBe("policy_only");
    expect(decision.reviewedOn).toBe("2026-04-22");
    expect(decision.rationale).toContain("Cloud Quotas");
    expect(decision.rationale).toContain("project-scoped");
  });

  it("records the documented enterprise quota tier", () => {
    const policy = getGeminiStaticQuotaPolicy("enterprise");

    expect(policy.planLabel).toBe("Gemini Code Assist Enterprise");
    expect(policy.requestsPerUserPerMinute).toBe(120);
    expect(policy.requestsPerUserPerDay).toBe(2000);
    expect(policy.localCodebaseAwarenessTokens).toBe(1_000_000);
    expect(policy.codeCustomizationRepositories).toBe(20_000);
  });

  it("normalizes the enterprise static policy into a dashboard snapshot", async () => {
    const attemptedAt = new Date(2026, 3, 20, 13, 10);
    const { snapshot } = await syncGeminiProvider({
      provider: baseProvider,
      setting: grantedSetting,
      warningThresholdPercent: 80,
      now: attemptedAt,
    });

    expect(snapshot.providerLabel).toBe("Gemini Code Assist");
    expect(snapshot.planName).toBe(
      "Gemini Code Assist Enterprise (documented policy)",
    );
    expect(snapshot.used).toBeNull();
    expect(snapshot.remaining).toBeNull();
    expect(snapshot.total).toBe(2000);
    expect(snapshot.quotaUnit).toBe("requests");
    expect(snapshot.quotaWindow).toBe("daily");
    expect(snapshot.syncStatus).toBe("warning");
    expect(snapshot.tone).toBe("warning");
    expect(snapshot.warningReason).toBe(
      "120/min and 2000/day per user for Gemini CLI and agent mode. No stable official per-user live usage source is documented.",
    );
    expect(snapshot.warningDiagnostic).toMatchObject({
      code: "policy.documented_limit_only",
      category: "policy_only",
      severity: "warning",
      rawMessage: snapshot.warningReason,
      params: {
        providerId: "gemini",
        policyOnlyKind: "documented_limit_only",
      },
    });
    expect(snapshot.resetLabel).toBe(
      "Documented quota only; check Google Cloud Quotas for live project usage",
    );
    expect(snapshot.lastSyncLabel).toBe(
      "Gemini documented quota policy synced just now",
    );
    expect(snapshot.syncedAt).toBe("2026-04-20 13:10");
  });
});
