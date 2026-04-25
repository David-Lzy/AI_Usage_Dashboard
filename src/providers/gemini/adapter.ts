import type {
  ProviderSetting,
  ProviderSnapshot,
  ProviderSyncOutcome,
} from "../types";
import { createPolicyOnlyDiagnostic } from "../diagnostics";
import { formatSyncTimestamp } from "../normalize";
import {
  getGeminiReleaseDecision,
  getGeminiStaticQuotaPolicy,
} from "./official";

type GeminiAdapterContext = {
  provider: ProviderSnapshot;
  setting: ProviderSetting;
  warningThresholdPercent: number;
  now: Date;
};

const GEMINI_STATIC_PLAN = "enterprise" as const;

export async function syncGeminiProvider({
  provider,
  setting: _setting,
  warningThresholdPercent: _warningThresholdPercent,
  now,
}: GeminiAdapterContext): Promise<ProviderSyncOutcome> {
  const syncedAt = formatSyncTimestamp(now);
  const policy = getGeminiStaticQuotaPolicy(GEMINI_STATIC_PLAN);
  const releaseDecision = getGeminiReleaseDecision();
  const warningReason = `${policy.requestsPerUserPerMinute}/min and ${policy.requestsPerUserPerDay}/day per user for Gemini CLI and agent mode. ${
    releaseDecision.mode === "policy_only"
      ? "No stable official per-user live usage source is documented."
      : ""
  }`;

  return {
    snapshot: {
      ...provider,
      providerLabel: "Gemini Code Assist",
      planName: `${policy.planLabel} (documented policy)`,
      quotaUnit: "requests",
      quotaWindow: "daily",
      used: null,
      remaining: null,
      total: policy.requestsPerUserPerDay,
      resetAt: "Daily per-user quota window",
      resetLabel:
        "Documented quota only; check Google Cloud Quotas for live project usage",
      syncedAt,
      syncSource: "official",
      syncStatus: "warning",
      tone: "warning",
      warningReason,
      warningDiagnostic: createPolicyOnlyDiagnostic({
        providerId: "gemini",
        policyOnlyKind: "documented_limit_only",
        rawMessage: warningReason,
      }),
      lastSyncLabel: "Gemini documented quota policy synced just now",
      sourceSelectionReason:
        "Policy only is the only shipped source for Gemini Code Assist.",
      sourceFallbackReason: null,
    },
  };
}
