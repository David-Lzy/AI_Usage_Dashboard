import type {
  ProviderSetting,
  ProviderSnapshot,
  ProviderSyncOutcome,
} from "../types";
import { formatSyncTimestamp } from "../normalize";

type JetBrainsAdapterContext = {
  provider: ProviderSnapshot;
  setting: ProviderSetting;
  warningThresholdPercent: number;
  now: Date;
};

const DEFERRED_SOURCE_REASON =
  "JetBrains organization usage remains deferred until a real organization-visible Users and licensing session is reverified.";

export async function syncJetBrainsProvider({
  provider,
  setting: _setting,
  warningThresholdPercent: _warningThresholdPercent,
  now,
}: JetBrainsAdapterContext): Promise<ProviderSyncOutcome> {
  return {
    snapshot: {
      ...provider,
      providerLabel: "JetBrains AI",
      planName: "Deferred organization source",
      quotaUnit: "credits",
      quotaWindow: "monthly",
      used: null,
      remaining: null,
      total: null,
      resetAt: "Unavailable while deferred",
      resetLabel: "No live quota is claimed by this deferred source",
      syncedAt: formatSyncTimestamp(now),
      syncSource: "page_parse",
      syncStatus: "warning",
      tone: "warning",
      warningReason: DEFERRED_SOURCE_REASON,
      warningDiagnostic: null,
      usageWindows: undefined,
      usageBalances: undefined,
      usageFacts: undefined,
      usageSummary: null,
      sourceSelectionReason:
        "JetBrains session-page parsing is retained for future verification, but no live source is active in this release.",
      sourceSelectionDiagnostic: null,
      sourceFallbackReason: null,
      sourceFallbackDiagnostic: null,
      lastSyncLabel: "JetBrains integration remains deferred",
    },
  };
}
