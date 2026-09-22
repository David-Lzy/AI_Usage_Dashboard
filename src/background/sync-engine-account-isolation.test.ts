import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ProviderSyncContext } from "../providers/registry";
import type {
  AppState,
  ProviderAccountId,
  ProviderId,
  ProviderSnapshot,
  ProviderSyncOutcome,
} from "../providers/types";
import { getProviderSyncAdapter } from "../providers/registry";
import { SAMPLE_APP_STATE, SAMPLE_PROVIDER_SECRETS } from "../shared/constants";
import {
  addInactiveProviderAccount,
  selectActiveProviderAccount,
  updateActiveProviderAccountConnection,
} from "../shared/provider-accounts";
import { readProviderSecrets } from "../shared/provider-secrets";
import { seedAppStateIfEmpty, updateAppState } from "../shared/storage";
import { syncCustomSources } from "./custom-source-sync";
import { syncCodexBarDashboardSources } from "./codexbar-dashboard-sync";
import { syncProviderServiceStatuses } from "./provider-service-status-sync";
import { runSyncEngine } from "./sync-engine";

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

vi.mock("./codexbar-dashboard-sync", () => ({
  syncCodexBarDashboardSources: vi.fn(),
  getCodexBarDashboardGeneration: () => 0,
}));

vi.mock("./provider-service-status-sync", () => ({
  syncProviderServiceStatuses: vi.fn(),
}));

vi.mock("../shared/custom-source-host-access", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../shared/custom-source-host-access")>()),
  hasCustomSourceHostAccess: vi.fn(),
}));

const PROVIDER_ID: ProviderId = "sub2api-api-key";
const ACCOUNT_A = "default";
const ACCOUNT_B = "account_isolation-b-0001";
const supportsSub2Api = (providerId: ProviderId) => providerId === PROVIDER_ID;

type Deferred<T> = {
  promise: Promise<T>;
  reject: (reason?: unknown) => void;
  resolve: (value: T) => void;
};

type AdapterCall = {
  accountId: ProviderAccountId;
  connection: string | null;
  deferred: Deferred<ProviderSyncOutcome>;
};

function createDeferred<T>(): Deferred<T> {
  let resolve = (_value: T) => {};
  let reject = (_reason?: unknown) => {};
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, reject, resolve };
}

function cloneState(state: AppState): AppState {
  return structuredClone(state);
}

function createMultiAccountState(): AppState {
  const source = cloneState(SAMPLE_APP_STATE);
  const provider = source.providers.find(
    (candidate) => candidate.providerId === PROVIDER_ID,
  );
  const setting = source.providerSettings.find(
    (candidate) => candidate.id === PROVIDER_ID,
  );

  if (!provider || !setting) {
    throw new Error("Expected the sample state to include Sub2API.");
  }

  const activeSnapshot = {
    ...provider,
    remaining: 31,
    syncedAt: "2026-09-22T00:00:00.000Z",
  };
  const activeSetting = { ...setting, displayEnabled: true };
  const singleProviderState: AppState = {
    ...source,
    providers: [activeSnapshot],
    providerSettings: [activeSetting],
  };

  return addInactiveProviderAccount(
    singleProviderState,
    {
      providerId: PROVIDER_ID,
      accountId: ACCOUNT_B,
      label: "Account B",
      snapshot: {
        ...activeSnapshot,
        remaining: 23,
        syncedAt: "2026-09-22T00:01:00.000Z",
      },
      setting: activeSetting,
    },
    supportsSub2Api,
  );
}

function selectAccount(state: AppState, accountId: ProviderAccountId): AppState {
  return selectActiveProviderAccount(
    state,
    PROVIDER_ID,
    accountId,
    supportsSub2Api,
  );
}

function snapshotFor(
  provider: ProviderSnapshot,
  remaining: number,
): ProviderSnapshot {
  return {
    ...provider,
    remaining,
    syncedAt: new Date(Date.UTC(2026, 8, 22, 0, remaining)).toISOString(),
    syncStatus: "ok",
    tone: "neutral",
    warningReason: null,
  };
}

function persistedProjection(state: AppState) {
  const collection = state.providerAccounts?.[PROVIDER_ID];

  return {
    activeAccountId: collection?.activeAccountId,
    activeRemaining: state.providers[0]?.remaining,
    inactiveDefaultRemaining:
      collection?.inactiveAccounts[ACCOUNT_A]?.snapshot.remaining ?? null,
    inactiveBRemaining:
      collection?.inactiveAccounts[ACCOUNT_B]?.snapshot.remaining ?? null,
  };
}

describe("sync engine account isolation", () => {
  let stored: AppState;
  let writes: AppState[];
  let adapterCalls: AdapterCall[];

  beforeEach(() => {
    vi.clearAllMocks();
    stored = createMultiAccountState();
    writes = [];
    adapterCalls = [];

    vi.mocked(readProviderSecrets).mockResolvedValue(SAMPLE_PROVIDER_SECRETS);
    vi.mocked(seedAppStateIfEmpty).mockImplementation(async () => cloneState(stored));
    vi.mocked(updateAppState).mockImplementation(async (updater) => {
      const persisted = cloneState(updater(cloneState(stored)));
      writes.push(persisted);
      stored = cloneState(persisted);
      return persisted;
    });
    vi.mocked(syncCustomSources).mockImplementation(async (state) => state);
    vi.mocked(syncCodexBarDashboardSources).mockImplementation(async (state) => state);
    vi.mocked(syncProviderServiceStatuses).mockImplementation(async (state) => state);
    vi.mocked(getProviderSyncAdapter).mockReturnValue({
      sync: async (provider, context: ProviderSyncContext) => {
        const deferred = createDeferred<ProviderSyncOutcome>();
        adapterCalls.push({
          accountId: context.accountId,
          connection: context.accountMetadata?.apiGatewayConnection?.baseUrl ?? null,
          deferred,
        });
        return deferred.promise;
      },
    });
  });

  it("keeps a refresh-all A result out of B and refreshes B separately", async () => {
    const allRun = runSyncEngine({ trigger: "manual" });
    await vi.waitFor(() => expect(adapterCalls).toHaveLength(1));

    stored = selectAccount(stored, ACCOUNT_B);
    const bRun = runSyncEngine({ trigger: "manual", providerId: PROVIDER_ID });

    adapterCalls[0].deferred.resolve({
      snapshot: snapshotFor(createMultiAccountState().providers[0], 91),
    });
    await vi.waitFor(() => expect(adapterCalls).toHaveLength(2));
    adapterCalls[1].deferred.resolve({
      snapshot: snapshotFor(stored.providers[0], 82),
    });
    await bRun;
    await allRun;

    expect(adapterCalls.map((call) => call.accountId)).toEqual([ACCOUNT_A, ACCOUNT_B]);
    const transitions = writes.map(persistedProjection).filter((entry, index, entries) =>
      index === 0 || JSON.stringify(entry) !== JSON.stringify(entries[index - 1]),
    );
    expect(transitions).toEqual([
      {
        activeAccountId: ACCOUNT_B,
        activeRemaining: 23,
        inactiveDefaultRemaining: 31,
        inactiveBRemaining: null,
      },
      {
        activeAccountId: ACCOUNT_B,
        activeRemaining: 82,
        inactiveDefaultRemaining: 31,
        inactiveBRemaining: null,
      },
    ]);
  });

  it("does not reuse a pending provider A request for a manual B refresh", async () => {
    const aRun = runSyncEngine({ trigger: "manual", providerId: PROVIDER_ID });
    await vi.waitFor(() => expect(adapterCalls).toHaveLength(1));

    stored = selectAccount(stored, ACCOUNT_B);
    const bRun = runSyncEngine({ trigger: "manual", providerId: PROVIDER_ID });

    adapterCalls[0].deferred.resolve({
      snapshot: snapshotFor(createMultiAccountState().providers[0], 91),
    });
    await vi.waitFor(() => expect(adapterCalls).toHaveLength(2));
    adapterCalls[1].deferred.resolve({
      snapshot: snapshotFor(stored.providers[0], 72),
    });
    await bRun;
    await aRun;

    expect(adapterCalls.map((call) => call.accountId)).toEqual([ACCOUNT_A, ACCOUNT_B]);
    expect(writes.map(persistedProjection)).toEqual([
      {
        activeAccountId: ACCOUNT_B,
        activeRemaining: 23,
        inactiveDefaultRemaining: 31,
        inactiveBRemaining: null,
      },
      {
        activeAccountId: ACCOUNT_B,
        activeRemaining: 72,
        inactiveDefaultRemaining: 31,
        inactiveBRemaining: null,
      },
    ]);
  });

  it("rejects superseded A and B results across an A-B-A account sequence", async () => {
    const firstARun = runSyncEngine({ trigger: "manual", providerId: PROVIDER_ID });
    await vi.waitFor(() => expect(adapterCalls).toHaveLength(1));

    stored = selectAccount(stored, ACCOUNT_B);
    const bRun = runSyncEngine({ trigger: "manual", providerId: PROVIDER_ID });

    stored = selectAccount(stored, ACCOUNT_A);
    const secondARun = runSyncEngine({ trigger: "manual", providerId: PROVIDER_ID });

    adapterCalls[0].deferred.resolve({
      snapshot: snapshotFor(stored.providers[0], 91),
    });
    await vi.waitFor(() => expect(adapterCalls).toHaveLength(2));
    adapterCalls[1].deferred.resolve({
      snapshot: snapshotFor(createMultiAccountState().providers[0], 72),
    });
    await vi.waitFor(() => expect(adapterCalls).toHaveLength(3));
    adapterCalls[2].deferred.resolve({
      snapshot: snapshotFor(stored.providers[0], 93),
    });
    await bRun;
    await Promise.all([firstARun, secondARun]);

    expect(adapterCalls.map((call) => call.accountId)).toEqual([
      ACCOUNT_A,
      ACCOUNT_B,
      ACCOUNT_A,
    ]);
    expect(writes.map(persistedProjection)).toEqual([
      {
        activeAccountId: ACCOUNT_A,
        activeRemaining: 31,
        inactiveDefaultRemaining: null,
        inactiveBRemaining: 23,
      },
      {
        activeAccountId: ACCOUNT_A,
        activeRemaining: 31,
        inactiveDefaultRemaining: null,
        inactiveBRemaining: 23,
      },
      {
        activeAccountId: ACCOUNT_A,
        activeRemaining: 93,
        inactiveDefaultRemaining: null,
        inactiveBRemaining: 23,
      },
    ]);
  });

  it("rejects a pending result after the active connection metadata changes", async () => {
    stored = updateActiveProviderAccountConnection(
      stored,
      PROVIDER_ID,
      {
        schemaVersion: 1,
        displayLabel: "Gateway one",
        baseUrl: "https://one.example.test",
        insecureTransportAcknowledged: false,
      },
      supportsSub2Api,
    );
    const oldConnectionRun = runSyncEngine({
      trigger: "manual",
      providerId: PROVIDER_ID,
    });
    await vi.waitFor(() => expect(adapterCalls).toHaveLength(1));

    stored = updateActiveProviderAccountConnection(
      stored,
      PROVIDER_ID,
      {
        schemaVersion: 1,
        displayLabel: "Gateway two",
        baseUrl: "https://two.example.test",
        insecureTransportAcknowledged: false,
      },
      supportsSub2Api,
    );
    const newConnectionRun = runSyncEngine({
      trigger: "manual",
      providerId: PROVIDER_ID,
    });

    adapterCalls[0].deferred.resolve({
      snapshot: snapshotFor(createMultiAccountState().providers[0], 91),
    });
    await oldConnectionRun;
    await vi.waitFor(() => expect(adapterCalls).toHaveLength(2));
    adapterCalls[1].deferred.resolve({
      snapshot: snapshotFor(stored.providers[0], 81),
    });
    await newConnectionRun;

    expect(adapterCalls.map((call) => call.connection)).toEqual([
      "https://one.example.test",
      "https://two.example.test",
    ]);
    expect(writes.map(persistedProjection)).toEqual([
      {
        activeAccountId: ACCOUNT_A,
        activeRemaining: 31,
        inactiveDefaultRemaining: null,
        inactiveBRemaining: 23,
      },
      {
        activeAccountId: ACCOUNT_A,
        activeRemaining: 81,
        inactiveDefaultRemaining: null,
        inactiveBRemaining: 23,
      },
    ]);
  });

  it("runs a queued B manual recovery after a failed A alarm with B context", async () => {
    const alarmRun = runSyncEngine({ trigger: "alarm", providerId: PROVIDER_ID });
    await vi.waitFor(() => expect(adapterCalls).toHaveLength(1));

    stored = selectAccount(stored, ACCOUNT_B);
    const bRun = runSyncEngine({ trigger: "manual", providerId: PROVIDER_ID });
    expect(adapterCalls.map((call) => call.accountId)).toEqual([ACCOUNT_A]);

    adapterCalls[0].deferred.reject(new Error("A alarm failed"));
    await expect(alarmRun).rejects.toThrow("A alarm failed");
    await vi.waitFor(() => expect(adapterCalls).toHaveLength(2));
    expect(adapterCalls.map((call) => call.accountId)).toEqual([ACCOUNT_A, ACCOUNT_B]);

    adapterCalls[1].deferred.resolve({
      snapshot: snapshotFor(stored.providers[0], 73),
    });
    await bRun;

    expect(writes.map(persistedProjection)).toEqual([
      {
        activeAccountId: ACCOUNT_B,
        activeRemaining: 73,
        inactiveDefaultRemaining: 31,
        inactiveBRemaining: null,
      },
    ]);
  });

  it("still coalesces two manual refreshes for the same account", async () => {
    const firstRun = runSyncEngine({ trigger: "manual", providerId: PROVIDER_ID });
    await vi.waitFor(() => expect(adapterCalls).toHaveLength(1));
    const secondRun = runSyncEngine({ trigger: "manual", providerId: PROVIDER_ID });

    adapterCalls[0].deferred.resolve({
      snapshot: snapshotFor(stored.providers[0], 74),
    });
    await Promise.all([firstRun, secondRun]);

    expect(adapterCalls.map((call) => call.accountId)).toEqual([ACCOUNT_A]);
    expect(writes.map(persistedProjection)).toEqual([
      {
        activeAccountId: ACCOUNT_A,
        activeRemaining: 74,
        inactiveDefaultRemaining: null,
        inactiveBRemaining: 23,
      },
    ]);
  });
});
