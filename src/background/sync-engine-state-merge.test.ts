import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AppState, ProviderSnapshot } from "../providers/types";
import { getProviderSyncAdapter } from "../providers/registry";
import { SAMPLE_APP_STATE } from "../shared/demo-state";
import { clearAppState, readAppState, updateAppState, writeAppState } from "../shared/storage";
import { syncCustomSources } from "./custom-source-sync";
import { syncCodexBarDashboardSources } from "./codexbar-dashboard-sync";
import { syncProviderServiceStatuses } from "./provider-service-status-sync";
import { runSyncEngine } from "./sync-engine";

vi.mock("../providers/registry", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../providers/registry")>()),
  getProviderSyncAdapter: vi.fn(),
}));
vi.mock("./custom-source-sync", () => ({ syncCustomSources: vi.fn() }));
vi.mock("./codexbar-dashboard-sync", () => ({
  syncCodexBarDashboardSources: vi.fn(), getCodexBarDashboardGeneration: () => 0,
}));
vi.mock("./provider-service-status-sync", () => ({ syncProviderServiceStatuses: vi.fn() }));

function gate() {
  let release = () => {};
  const promise = new Promise<void>((resolve) => { release = resolve; });
  return { promise, release };
}

describe("sync merges at the write boundary", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await clearAppState();
    await writeAppState(structuredClone(SAMPLE_APP_STATE));
    vi.mocked(getProviderSyncAdapter).mockReturnValue({ sync: async (snapshot) => ({ snapshot }) });
    vi.mocked(syncCustomSources).mockImplementation(async (state) => state);
    vi.mocked(syncCodexBarDashboardSources).mockImplementation(async (state) => state);
    vi.mocked(syncProviderServiceStatuses).mockImplementation(async (state) => state);
  });

  it.each([
    ["bridge", syncCodexBarDashboardSources],
    ["custom source", syncCustomSources],
    ["service status", syncProviderServiceStatuses],
  ] as const)("preserves edits while %s fetch is pending", async (_name, fetcher) => {
    const started = gate();
    const pending = gate();
    vi.mocked(fetcher).mockImplementation(async (state: AppState) => {
      started.release();
      await pending.promise;
      return state;
    });
    const run = runSyncEngine({ trigger: "manual" });
    await started.promise;
    await updateAppState((state) => ({
      ...state,
      settings: { ...state.settings, warningThresholdPercent: 77, themeMode: "dark" },
    }));
    pending.release();
    await run;
    expect((await readAppState())?.settings).toMatchObject({ warningThresholdPercent: 77, themeMode: "dark" });
  });

  it("does not replay an older fast-provider result after a slow sibling finishes", async () => {
    const initial = (await readAppState())!;
    const [fast, slow] = initial.providerSettings.filter((setting) => setting.displayEnabled);
    expect(fast).toBeDefined();
    expect(slow).toBeDefined();
    const slowStarted = gate();
    const slowPending = gate();
    let fastCalls = 0;
    vi.mocked(getProviderSyncAdapter).mockReturnValue({
      sync: async (snapshot: ProviderSnapshot) => {
        if (snapshot.providerId === slow.id) {
          slowStarted.release();
          await slowPending.promise;
        }
        return { snapshot: snapshot.providerId === fast.id
          ? { ...snapshot, remaining: ++fastCalls === 1 ? 41 : 62 }
          : snapshot };
      },
    });
    const allRun = runSyncEngine({ trigger: "alarm" });
    await slowStarted.promise;
    await vi.waitFor(async () => expect((await readAppState())?.providers.find((p) => p.providerId === fast.id)?.remaining).toBe(41));
    await runSyncEngine({ trigger: "manual", providerId: fast.id });
    slowPending.release();
    await allRun;
    expect((await readAppState())?.providers.find((p) => p.providerId === fast.id)?.remaining).toBe(62);
  });

  it("does not resurrect sources after configuration replacement during a fetch", async () => {
    const started = gate();
    const pending = gate();
    vi.mocked(syncCustomSources).mockImplementation(async (state) => {
      started.release();
      await pending.promise;
      return { ...state, settings: { ...state.settings, warningThresholdPercent: 12 } };
    });
    const run = runSyncEngine({ trigger: "manual" });
    await started.promise;
    const replacement = structuredClone(SAMPLE_APP_STATE);
    replacement.settings.warningThresholdPercent = 71;
    await writeAppState(replacement);
    pending.release();
    await run;
    expect((await readAppState())?.settings.warningThresholdPercent).toBe(71);
  });

  it("recovers after a rejected adapter without blocking later writes", async () => {
    const initial = (await readAppState())!;
    const providerId = initial.providerSettings.find((setting) => setting.displayEnabled)!.id;
    vi.mocked(getProviderSyncAdapter).mockReturnValue({ sync: vi.fn().mockRejectedValueOnce(new Error("adapter rejected")) });
    await expect(runSyncEngine({ trigger: "manual", providerId })).rejects.toThrow("adapter rejected");
    vi.mocked(getProviderSyncAdapter).mockReturnValue({ sync: async (snapshot) => ({ snapshot: { ...snapshot, remaining: 66 } }) });
    await runSyncEngine({ trigger: "manual", providerId });
    expect((await readAppState())?.providers.find((p) => p.providerId === providerId)?.remaining).toBe(66);
  });
});
