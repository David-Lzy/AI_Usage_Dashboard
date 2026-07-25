import { describe, expect, it } from "vitest";

import { createEmptyPageBinding } from "../../shared/page-bindings";
import type { ProviderSetting, ProviderSnapshot } from "../types";
import { syncJetBrainsProvider } from "./adapter";

const baseProvider: ProviderSnapshot = {
  providerId: "jetbrains-org-page",
  providerLabel: "JetBrains AI",
  planName: "Previously captured",
  quotaUnit: "credits",
  quotaWindow: "monthly",
  used: 72,
  remaining: 38,
  total: 110,
  resetAt: "Renews every 30 days",
  resetLabel: "Previously captured reset",
  syncedAt: "Earlier",
  syncSource: "page_parse",
  syncStatus: "ok",
  warningReason: null,
  lastSyncLabel: "Previously synced",
  sourceSelectionReason: "Previous source",
  sourceFallbackReason: null,
  tone: "neutral",
};

const setting: ProviderSetting = {
  id: "jetbrains-org-page",
  brandId: "jetbrains",
  label: "JetBrains AI",
  displayEnabled: false,
  enabled: false,
  status: "missing",
  credentialStatus: "not_required",
  sourceKind: "session_page",
  connectionMode: "page_session",
  sourcePreference: "session_page",
  pageBinding: createEmptyPageBinding(),
  hostsLabel: "account.jetbrains.com · jetbrains.com",
  hostOrigins: ["https://account.jetbrains.com/*", "https://*.jetbrains.com/*"],
  description: "Deferred organization source.",
};

describe("syncJetBrainsProvider", () => {
  it("returns an explicit no-network deferred snapshot", async () => {
    const { snapshot } = await syncJetBrainsProvider({
      provider: baseProvider,
      setting,
      warningThresholdPercent: 80,
      now: new Date(2026, 3, 20, 11, 34),
    });

    expect(snapshot).toMatchObject({
      providerId: "jetbrains-org-page",
      planName: "Deferred organization source",
      used: null,
      remaining: null,
      total: null,
      syncStatus: "warning",
      tone: "warning",
      warningDiagnostic: null,
      sourceFallbackReason: null,
      lastSyncLabel: "JetBrains integration remains deferred",
      syncedAt: "2026-04-20 11:34",
    });
    expect(snapshot.warningReason).toContain("remains deferred");
    expect(snapshot.resetLabel).toContain("No live quota");
  });

  it("does not preserve obsolete live quota fields while deferred", async () => {
    const { snapshot } = await syncJetBrainsProvider({
      provider: {
        ...baseProvider,
        usageWindows: [
          {
            label: "Legacy window",
            normalizedLabel: "Legacy window",
            kind: "unknown",
            modelLabel: null,
            quotaUnit: "percent",
            used: 65,
            remaining: 35,
            total: 100,
            resetAt: null,
            resetLabel: null,
          },
        ],
        usageSummary: "Legacy live summary",
      },
      setting: { ...setting, status: "granted", enabled: true },
      warningThresholdPercent: 80,
      now: new Date(2026, 3, 20, 11, 34),
    });

    expect(snapshot.usageWindows).toBeUndefined();
    expect(snapshot.usageSummary).toBeNull();
    expect(snapshot.used).toBeNull();
  });
});
