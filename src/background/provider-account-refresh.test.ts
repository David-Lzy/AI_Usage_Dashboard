import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AppState, ProviderSnapshot, ProviderSyncOutcome } from "../providers/types";
import { getProviderSyncAdapter } from "../providers/registry";
import { DEFAULT_APP_STATE } from "../shared/constants";
import { SAMPLE_PROVIDER_SECRETS } from "../shared/demo-state";
import { addInactiveProviderAccount, getProviderAccountRuntime, selectActiveProviderAccount, updateActiveProviderAccountConnection } from "../shared/provider-accounts";
import { readProviderSecrets } from "../shared/provider-secrets";
import { hasCustomSourceHostAccess } from "../shared/custom-source-host-access";
import { seedAppStateIfEmpty, updateAppState } from "../shared/storage";
import { invalidateAllProviderSyncIdentities, invalidateProviderSyncIdentity } from "../shared/provider-sync-identity";
import { refreshSub2ApiAccount } from "./provider-account-refresh";
import { runSyncEngine } from "./sync-engine";

vi.mock("../providers/registry", async (original) => ({ ...await original<typeof import("../providers/registry")>(), getProviderSyncAdapter: vi.fn() }));
vi.mock("../shared/provider-secrets", () => ({ readProviderSecrets: vi.fn() }));
vi.mock("../shared/custom-source-host-access", async (original) => ({ ...await original<typeof import("../shared/custom-source-host-access")>(), hasCustomSourceHostAccess: vi.fn() }));
vi.mock("../shared/storage", () => ({ seedAppStateIfEmpty: vi.fn(), updateAppState: vi.fn() }));
const ID = "sub2api-api-key";
const B = "account_refresh-b";
const connection = { schemaVersion: 1 as const, baseUrl: "https://gateway.example.test", displayLabel: "Gateway", insecureTransportAcknowledged: false };
function initial(): AppState {
  const state = updateActiveProviderAccountConnection(structuredClone(DEFAULT_APP_STATE), ID, connection);
  const runtime = getProviderAccountRuntime(state, ID, "default")!;
  Object.assign(runtime.setting, { status: "granted", credentialStatus: "configured", displayEnabled: true });
  runtime.snapshot.remaining = 11;
  return addInactiveProviderAccount(state, { providerId: ID, accountId: B, label: "B", snapshot: { ...runtime.snapshot, remaining: 22 }, setting: runtime.setting, apiGatewayConnection: connection });
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
describe("explicit account refresh", () => {
  let stored: AppState;
  let writes: AppState[];
  let calls: { id: string; snapshot: ProviderSnapshot; pending: ReturnType<typeof deferred<ProviderSyncOutcome>> }[];
  beforeEach(() => {
    vi.clearAllMocks();
    invalidateAllProviderSyncIdentities();
    stored = initial(); writes = []; calls = [];
    vi.mocked(seedAppStateIfEmpty).mockImplementation(async () => structuredClone(stored));
    vi.mocked(updateAppState).mockImplementation(async (update) => { stored = structuredClone(update(structuredClone(stored))); writes.push(structuredClone(stored)); return stored; });
    vi.mocked(readProviderSecrets).mockResolvedValue({ ...SAMPLE_PROVIDER_SECRETS, [ID]: { apiKey: "synthetic-test-only" } });
    vi.mocked(hasCustomSourceHostAccess).mockResolvedValue(true);
    vi.mocked(getProviderSyncAdapter).mockReturnValue({ sync: async (snapshot, context) => {
      const pending = deferred<ProviderSyncOutcome>(); calls.push({ id: context.accountId, snapshot, pending }); return pending.promise;
    } });
  });
  function resolve(index: number, remaining = 77, error = false) {
    calls[index].pending.resolve({ snapshot: { ...calls[index].snapshot, remaining, syncStatus: error ? "error" : "ok", lastSuccessAt: error ? null : "2026-09-22T12:00:00Z" } });
  }
  it("refreshes an inactive account without even intermediate active selection writes", async () => {
    const pending = refreshSub2ApiAccount(B);
    await vi.waitFor(() => expect(calls).toHaveLength(1));
    stored.settings.locale = "ar";
    stored.settings.themeMode = "dark";
    getProviderAccountRuntime(stored, ID, B)!.setting.displayEnabled = false;
    resolve(0); await pending;
    expect(vi.mocked(readProviderSecrets)).toHaveBeenCalledWith({ [ID]: B });
    expect(writes.every((state) => state.providerAccounts![ID]!.activeAccountId === "default")).toBe(true);
    expect(getProviderAccountRuntime(stored, ID, "default")!.snapshot.remaining).toBe(11);
    expect(getProviderAccountRuntime(stored, ID, B)!.snapshot.remaining).toBe(77);
    expect(getProviderAccountRuntime(stored, ID, B)!.setting.displayEnabled).toBe(false);
    expect(stored.settings).toMatchObject({ locale: "ar", themeMode: "dark" });
  });
  it("follows the target runtime through selection and A-B-A without putting values in another account", async () => {
    const pending = refreshSub2ApiAccount(B);
    await vi.waitFor(() => expect(calls).toHaveLength(1));
    stored = selectActiveProviderAccount(stored, ID, B);
    invalidateProviderSyncIdentity(ID, false);
    stored = selectActiveProviderAccount(stored, ID, "default");
    invalidateProviderSyncIdentity(ID, false);
    resolve(0); await pending;
    expect(getProviderAccountRuntime(stored, ID, "default")!.snapshot.remaining).toBe(11);
    expect(getProviderAccountRuntime(stored, ID, B)!.snapshot.remaining).toBe(77);
  });
  it("can merge to a target made active while held without changing preferences", async () => {
    const pending = refreshSub2ApiAccount(B);
    await vi.waitFor(() => expect(calls).toHaveLength(1));
    stored = selectActiveProviderAccount(stored, ID, B);
    stored.settings.warningThresholdPercent = 95;
    resolve(0); await pending;
    expect(getProviderAccountRuntime(stored, ID, B)!.active).toBe(true);
    expect(getProviderAccountRuntime(stored, ID, B)!.snapshot.remaining).toBe(77);
    expect(stored.settings.warningThresholdPercent).toBe(95);
  });
  it.each(["delete", "connection", "credential", "replace", "permission"])("rejects %s during held I/O without resurrecting data", async (change) => {
    const pending = refreshSub2ApiAccount(B);
    const rejected = expect(pending).rejects.toThrow();
    await vi.waitFor(() => expect(calls).toHaveLength(1));
    if (change === "delete") {
      stored.providerAccounts![ID]!.accounts = stored.providerAccounts![ID]!.accounts.filter((entry) => entry.id !== B);
      delete stored.providerAccounts![ID]!.inactiveAccounts[B];
    } else if (change === "connection") getProviderAccountRuntime(stored, ID, B)!.metadata.apiGatewayConnection!.baseUrl = "https://changed.example.test";
    else if (change === "credential") invalidateProviderSyncIdentity(ID);
    else if (change === "replace") invalidateAllProviderSyncIdentities();
    else vi.mocked(hasCustomSourceHostAccess).mockResolvedValue(false);
    resolve(0); await rejected;
    expect(getProviderAccountRuntime(stored, ID, "default")!.snapshot.remaining).toBe(11);
    expect(getProviderAccountRuntime(stored, ID, B)?.snapshot.remaining).not.toBe(77);
  });
  it("serializes with active automatic refresh, including a failed predecessor", async () => {
    const active = runSyncEngine({ trigger: "alarm", providerId: ID });
    const rejected = expect(active).rejects.toThrow("synthetic failure");
    await vi.waitFor(() => expect(calls).toHaveLength(1));
    const target = refreshSub2ApiAccount(B);
    await new Promise((done) => setTimeout(done, 10));
    expect(calls).toHaveLength(1);
    calls[0].pending.reject(new Error("synthetic failure")); await rejected;
    await vi.waitFor(() => expect(calls).toHaveLength(2));
    expect(calls.map((call) => call.id)).toEqual(["default", B]);
    resolve(1); await target;
  });
  it("does not start queued I/O after a target is removed", async () => {
    const active = runSyncEngine({ trigger: "alarm", providerId: ID });
    await vi.waitFor(() => expect(calls).toHaveLength(1));
    const target = refreshSub2ApiAccount(B);
    const rejected = expect(target).rejects.toThrow();
    await new Promise((done) => setTimeout(done, 10));
    stored.providerAccounts![ID]!.accounts = stored.providerAccounts![ID]!.accounts.filter((entry) => entry.id !== B);
    resolve(0); await active; await rejected;
    expect(calls).toHaveLength(1);
  });
  it("shares the global two-source network limit with independent active runs", async () => {
    const others = stored.providers.filter((provider) => provider.providerId !== ID).slice(0, 2);
    const first = runSyncEngine({ trigger: "manual", providerId: others[0].providerId });
    const second = runSyncEngine({ trigger: "manual", providerId: others[1].providerId });
    await vi.waitFor(() => expect(calls).toHaveLength(2));
    const target = refreshSub2ApiAccount(B);
    await new Promise((done) => setTimeout(done, 20));
    expect(calls).toHaveLength(2);
    resolve(0); await first;
    await vi.waitFor(() => expect(calls).toHaveLength(3));
    expect(calls[2].id).toBe(B);
    resolve(1); resolve(2);
    await second; await target;
  });
  it("persists a failed target result without losing another account or treating it as fresh", async () => {
    const pending = refreshSub2ApiAccount(B);
    await vi.waitFor(() => expect(calls).toHaveLength(1));
    resolve(0, 22, true); await pending;
    expect(getProviderAccountRuntime(stored, ID, B)!.snapshot).toMatchObject({ remaining: 22, syncStatus: "error", lastSuccessAt: null });
    expect(getProviderAccountRuntime(stored, ID, "default")!.snapshot.remaining).toBe(11);
  });
});
