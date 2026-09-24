import { describe, expect, it } from "vitest";
import type { AppState, ProviderDiagnostic } from "../providers/types";
import { createDefaultAppState } from "./production-state";
import { createSanitizedDiagnostics } from "./sanitized-diagnostics";

const SECRET = "DO_NOT_EXPORT_SECRET_SENTINEL";
const NOW = new Date("2026-09-22T17:00:00Z");
const options = { appVersion: "0.2.0-rc.13", generatedAt: NOW };
function gatewayState() {
  const state = createDefaultAppState();
  state.providers = state.providers.filter((entry) => entry.providerId === "sub2api-api-key");
  state.providerSettings = state.providerSettings.filter((entry) => entry.id === "sub2api-api-key");
  return state;
}

describe("sanitized support diagnostics", () => {
  it("exports an explicit versioned schema without storage or identity fields", () => {
    const state = gatewayState();
    Object.assign(state.providers[0], {
      providerLabel: SECRET, planName: SECRET, resetAt: SECRET, syncedAt: SECRET,
      warningReason: SECRET, rawResponse: { authorization: SECRET },
      lastAttemptAt: NOW.toISOString(), lastSuccessAt: "2026-09-22T15:00:00+00:00",
      warningDiagnostic: { code: "host_access.missing", severity: "warning", category: SECRET,
        rawMessage: SECRET, params: { hostLabel: SECRET, credential: SECRET } },
      usageFacts: [{ label: SECRET, value: SECRET, detail: SECRET }],
      apiGatewayMetering: { accountId: SECRET, origin: `https://example.test/?token=${SECRET}` },
    });
    Object.assign(state.providerSettings[0], {
      label: SECRET, hostsLabel: SECRET, hostOrigins: [SECRET], description: SECRET,
      pageBinding: { status: "bound", tabId: 123, url: SECRET, title: SECRET },
    });
    const report = createSanitizedDiagnostics(state, options);
    expect(JSON.stringify(report)).not.toContain(SECRET);
    expect(Object.keys(report)).toEqual(["schemaVersion", "appVersion", "generatedAt", "providers"]);
    expect(report.providers).toEqual([{ providerType: "sub2api-api-key", accounts: [{
      account: "account-1", active: true, displayEnabled: false, permissionStatus: "granted",
      credentialStatus: "missing", sourceKind: "official_api", sourcePreference: "official_api",
      pageBindingStatus: "bound", snapshotPresent: true, syncSource: "official", syncStatus: "warning",
      lastAttemptAt: NOW.toISOString(), lastSuccessAt: "2026-09-22T15:00:00.000Z",
      diagnostics: [{ code: "host_access.missing", category: "host_access", severity: "warning" }],
    }] }]);
  });

  it("anonymizes living accounts and never exports orphaned or deleted cache entries", () => {
    const state = gatewayState();
    const snapshot = state.providers[0], setting = state.providerSettings[0];
    state.providerAccounts = { "sub2api-api-key": {
      activeAccountId: `${SECRET}-a`,
      accounts: ["a", "b", "c"].map((id) => ({ id: `${SECRET}-${id}`, label: SECRET, createdAt: SECRET, lastSuccessAt: SECRET })),
      inactiveAccounts: {
        [`${SECRET}-b`]: { setting, snapshot: { ...snapshot, syncStatus: "error" } },
        [`${SECRET}-deleted`]: { setting, snapshot: { ...snapshot, syncStatus: "ok" } },
      },
    } };
    const report = createSanitizedDiagnostics(state, options);
    expect(JSON.stringify(report)).not.toContain(SECRET);
    expect(report.providers[0].accounts.map((account) => [account.account, account.active, account.syncStatus]))
      .toEqual([["account-1", true, "warning"], ["account-2", false, "error"], ["account-3", false, null]]);
  });

  it("reports the local Codex source without exporting estimate or account material", () => {
    const state = createDefaultAppState();
    const codex = state.providers.find((provider) => provider.providerId === "codex-personal-page")!;
    Object.assign(codex, {
      syncSource: "local_companion", accountDigest: SECRET,
      codexLocal: { availableResetCount: 2, accountVerified: true, estimates: [{ fullUsd: 42, rawLog: SECRET }] },
    });
    const report = createSanitizedDiagnostics(state, options);
    expect(report.providers.find((provider) => provider.providerType === "codex-personal-page")?.accounts[0]?.syncSource).toBe("local_companion");
    expect(JSON.stringify(report)).not.toContain(SECRET);
    expect(JSON.stringify(report)).not.toContain("fullUsd");
  });

  it("rejects unknown codes, prototype names, source enums and timestamp text", () => {
    const state = gatewayState();
    const snapshot = state.providers[0];
    Object.assign(snapshot, { syncStatus: SECRET, syncSource: SECRET, lastSuccessAt: SECRET, lastAttemptAt: SECRET });
    for (const code of [SECRET, "__proto__", "constructor", "toString"]) {
      snapshot.warningDiagnostic = { code, category: "adapter_error", severity: "error", rawMessage: SECRET };
      const report = createSanitizedDiagnostics(state, { ...options, appVersion: SECRET });
      expect(JSON.stringify(report)).not.toContain(SECRET);
      expect(report.appVersion).toBeNull();
      expect(report.providers[0].accounts[0]).toMatchObject({ syncStatus: null, syncSource: null, lastSuccessAt: null, lastAttemptAt: null, diagnostics: [] });
    }
    snapshot.warningDiagnostic = { code: "adapter.parse_failed", severity: SECRET } as unknown as ProviderDiagnostic;
    expect(createSanitizedDiagnostics(state, options).providers[0].accounts[0].diagnostics[0].severity).toBeNull();
  });

  it("does not infer success from legacy sync fields and leaves empty profiles useful", () => {
    const state = createDefaultAppState();
    state.providers[0].syncedAt = NOW.toISOString();
    state.providers[0].syncStatus = "ok";
    const report = createSanitizedDiagnostics(state, options);
    expect(report.providers).toHaveLength(9);
    expect(report.providers.every((provider) => provider.accounts[0].lastSuccessAt === null)).toBe(true);
    expect(createSanitizedDiagnostics({ providers: [], providerSettings: [] }, options).providers).toEqual([]);
  });

  it("omits unknown providers, deduplicates metadata and refuses a mismatched snapshot", () => {
    const state = gatewayState();
    state.providers.push({ ...state.providers[0], providerId: SECRET } as unknown as AppState["providers"][number]);
    state.providerAccounts = { "sub2api-api-key": {
      activeAccountId: "deleted-account",
      accounts: ["known", "known"].map((id) => ({ id, label: SECRET, createdAt: null, lastSuccessAt: null })),
      inactiveAccounts: { known: { snapshot: { ...state.providers[0], providerId: "codex-personal-page" }, setting: state.providerSettings[0] } },
    } };
    const report = createSanitizedDiagnostics(state, options);
    expect(JSON.stringify(report)).not.toContain(SECRET);
    expect(report.providers).toHaveLength(1);
    expect(report.providers[0].accounts).toHaveLength(1);
    expect(report.providers[0].accounts[0]).toMatchObject({ active: false, snapshotPresent: false, syncStatus: null });
  });

  it("makes immutable preview data without mutating or retaining source references", () => {
    const state = gatewayState();
    const before = structuredClone(state);
    const report = createSanitizedDiagnostics(state, options);
    expect(state).toEqual(before);
    state.providers[0].warningDiagnostic!.code = SECRET;
    state.providers[0].lastSuccessAt = NOW.toISOString();
    expect(JSON.stringify(report)).not.toContain(SECRET);
    expect(report.providers[0].accounts[0].lastSuccessAt).toBeNull();
    expect(createSanitizedDiagnostics(state, { appVersion: "1.2.3", generatedAt: new Date(NaN) }).generatedAt).toBeNull();
  });
});
