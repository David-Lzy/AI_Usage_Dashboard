import { beforeEach, describe, expect, it, vi } from "vitest";

import { SAMPLE_APP_STATE, SAMPLE_PROVIDER_SECRETS } from "../shared/constants";
import type { AppState, ProviderSnapshot } from "../providers/types";
import { getProviderSyncAdapter } from "../providers/registry";
import { readProviderSecrets } from "../shared/provider-secrets";
import { seedAppStateIfEmpty, updateAppState } from "../shared/storage";
import { syncCustomSources } from "./custom-source-sync";
import {
  getSyncEngineCoalescingKey,
  PROVIDER_SYNC_CONCURRENCY_LIMIT,
  runSyncEngine,
} from "./sync-engine";

vi.mock("../providers/registry", () => ({
  getProviderSyncAdapter: vi.fn(),
}));

vi.mock("../shared/provider-secrets", () => ({
  readProviderSecrets: vi.fn(),
}));

vi.mock("../shared/storage", () => ({
  seedAppStateIfEmpty: vi.fn(),
  updateAppState: vi.fn(),
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
    vi.mocked(updateAppState).mockImplementation(async (updater) =>
      updater(await seedAppStateIfEmpty()),
    );
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

    releaseSync();
    await Promise.all([firstRun, secondRun]);

    const displayEnabledCount = SAMPLE_APP_STATE.providerSettings.filter(
      (setting) => setting.displayEnabled,
    ).length;

    expect(sync).toHaveBeenCalledTimes(displayEnabledCount);
  });

  it("keeps manual recovery separate from automatic engine requests", () => {
    expect(
      getSyncEngineCoalescingKey({
        trigger: "manual",
        providerId: SAMPLE_APP_STATE.providerSettings[0].id,
      }),
    ).toBe(`provider:${SAMPLE_APP_STATE.providerSettings[0].id}:manual`);

    expect(
      getSyncEngineCoalescingKey({
        trigger: "alarm",
        providerId: SAMPLE_APP_STATE.providerSettings[0].id,
      }),
    ).toBe(`provider:${SAMPLE_APP_STATE.providerSettings[0].id}:automatic`);
  });

  it("coalesces concurrent provider-specific sync runs", async () => {
    let releaseSync = () => {};
    const syncGate = new Promise<void>((resolve) => {
      releaseSync = resolve;
    });
    const sync = vi.fn(async (provider: ProviderSnapshot) => {
      await syncGate;

      return { snapshot: provider };
    });
    const providerId = SAMPLE_APP_STATE.providerSettings.find(
      (setting) => setting.displayEnabled,
    )?.id;

    if (!providerId) {
      throw new Error("Expected one display-enabled provider in sample state.");
    }

    vi.mocked(getProviderSyncAdapter).mockReturnValue({ sync });

    const firstRun = runSyncEngine({ trigger: "manual", providerId });
    const secondRun = runSyncEngine({ trigger: "alarm", providerId });

    releaseSync();
    await Promise.all([firstRun, secondRun]);

    expect(sync).toHaveBeenCalledTimes(1);
  });

  it("does not coalesce all-provider sync runs across different triggers", () => {
    expect(getSyncEngineCoalescingKey({ trigger: "bootstrap" })).not.toBe(
      getSyncEngineCoalescingKey({ trigger: "alarm" }),
    );
  });

  it.each(["all", "provider"])("serializes a %s alarm and manual provider recovery", async (scope) => {
    let releaseAlarmSync = () => {};
    const alarmSyncGate = new Promise<void>((resolve) => {
      releaseAlarmSync = resolve;
    });
    const providerId = SAMPLE_APP_STATE.providerSettings.find(
      (setting) => setting.displayEnabled,
    )?.id;

    if (!providerId) {
      throw new Error("Expected one display-enabled provider in sample state.");
    }
    const callsByProvider = new Map<string, number>();
    const sync = vi.fn(async (provider: ProviderSnapshot) => {
      callsByProvider.set(
        provider.providerId,
        (callsByProvider.get(provider.providerId) ?? 0) + 1,
      );

      if (provider.providerId === providerId) {
        await alarmSyncGate;
      }

      return { snapshot: provider };
    });

    vi.mocked(getProviderSyncAdapter).mockReturnValue({ sync });

    const alarmRun = runSyncEngine({
      trigger: "alarm",
      providerId: scope === "provider" ? providerId : undefined,
    });
    await vi.waitFor(() => {
      expect(callsByProvider.get(providerId)).toBe(1);
    });

    const manualRun = runSyncEngine({ trigger: "manual", providerId });

    expect(callsByProvider.get(providerId)).toBe(1);

    releaseAlarmSync();
    await Promise.all([alarmRun, manualRun]);

    // The manual recovery runs once after the alarm attempt finishes instead
    // of racing the same page-session adapter concurrently.
    expect(callsByProvider.get(providerId)).toBe(2);
  });

  it("caps provider adapter concurrency inside an all-provider sync run", async () => {
    const allEnabledState = cloneState();
    allEnabledState.providerSettings = allEnabledState.providerSettings.map(
      (setting) => ({
        ...setting,
        displayEnabled: true,
      }),
    );
    vi.mocked(seedAppStateIfEmpty).mockImplementation(async () =>
      JSON.parse(JSON.stringify(allEnabledState)) as AppState,
    );

    let activeSyncCount = 0;
    let maxActiveSyncCount = 0;
    const sync = vi.fn(async (provider: ProviderSnapshot) => {
      activeSyncCount += 1;
      maxActiveSyncCount = Math.max(maxActiveSyncCount, activeSyncCount);

      await new Promise((resolve) => setTimeout(resolve, 0));

      activeSyncCount -= 1;

      return { snapshot: provider };
    });

    vi.mocked(getProviderSyncAdapter).mockReturnValue({ sync });

    await runSyncEngine({ trigger: "manual" });

    expect(sync).toHaveBeenCalledTimes(allEnabledState.providers.length);
    expect(maxActiveSyncCount).toBeLessThanOrEqual(
      PROVIDER_SYNC_CONCURRENCY_LIMIT,
    );
    expect(maxActiveSyncCount).toBeGreaterThan(1);
  });
});
