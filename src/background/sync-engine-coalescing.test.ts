import { beforeEach, describe, expect, it, vi } from "vitest";

import { SAMPLE_APP_STATE, SAMPLE_PROVIDER_SECRETS } from "../shared/constants";
import type { AppState, ProviderSnapshot } from "../providers/types";
import { getProviderSyncAdapter } from "../providers/registry";
import { readProviderSecrets } from "../shared/provider-secrets";
import { seedAppStateIfEmpty, writeAppState } from "../shared/storage";
import { syncCustomSources } from "./custom-source-sync";
import { getSyncEngineCoalescingKey, runSyncEngine } from "./sync-engine";

vi.mock("../providers/registry", () => ({
  getProviderSyncAdapter: vi.fn(),
}));

vi.mock("../shared/provider-secrets", () => ({
  readProviderSecrets: vi.fn(),
}));

vi.mock("../shared/storage", () => ({
  seedAppStateIfEmpty: vi.fn(),
  writeAppState: vi.fn(),
}));

vi.mock("./custom-source-sync", () => ({
  syncCustomSources: vi.fn(),
}));

vi.mock("../shared/custom-source-host-access", () => ({
  hasCustomSourceHostAccess: vi.fn(),
}));

function cloneState(): AppState {
  return JSON.parse(JSON.stringify(SAMPLE_APP_STATE)) as AppState;
}

describe("sync engine run coalescing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(readProviderSecrets).mockResolvedValue(SAMPLE_PROVIDER_SECRETS);
    vi.mocked(seedAppStateIfEmpty).mockImplementation(async () => cloneState());
    vi.mocked(writeAppState).mockImplementation(async (state) => state);
    vi.mocked(syncCustomSources).mockImplementation(async (state) => state);
  });

  it("coalesces concurrent all-provider sync runs", async () => {
    let releaseSync = () => {};
    const syncGate = new Promise<void>((resolve) => {
      releaseSync = resolve;
    });
    const sync = vi.fn(async (provider: ProviderSnapshot) => {
      await syncGate;

      return { snapshot: provider };
    });

    vi.mocked(getProviderSyncAdapter).mockReturnValue({ sync });

    const firstRun = runSyncEngine({ trigger: "bootstrap" });
    const secondRun = runSyncEngine({ trigger: "bootstrap" });

    expect(secondRun).toBe(firstRun);

    releaseSync();
    await firstRun;

    const displayEnabledCount = SAMPLE_APP_STATE.providerSettings.filter(
      (setting) => setting.displayEnabled,
    ).length;

    expect(sync).toHaveBeenCalledTimes(displayEnabledCount);
  });

  it("does not coalesce provider-specific manual sync runs", () => {
    expect(
      getSyncEngineCoalescingKey({
        trigger: "manual",
        providerId: SAMPLE_APP_STATE.providerSettings[0].id,
      }),
    ).toBeNull();
  });

  it("does not coalesce all-provider sync runs across different triggers", () => {
    expect(getSyncEngineCoalescingKey({ trigger: "bootstrap" })).not.toBe(
      getSyncEngineCoalescingKey({ trigger: "alarm" }),
    );
  });
});
