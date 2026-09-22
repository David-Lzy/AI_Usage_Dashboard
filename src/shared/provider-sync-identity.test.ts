import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_APP_STATE } from "./constants";
import { setSub2ApiKey } from "./provider-secrets";
import {
  captureProviderSyncIdentity,
  invalidateAllProviderSyncIdentities,
  invalidateProviderSyncIdentity,
  isProviderSyncIdentityCurrent,
} from "./provider-sync-identity";

const providerId = "sub2api-api-key";

describe("provider sync identity", () => {
  beforeEach(() => invalidateAllProviderSyncIdentities());

  it("reuses unchanged connections but not an explicitly invalidated generation", () => {
    const state = structuredClone(DEFAULT_APP_STATE);
    const first = captureProviderSyncIdentity(state, providerId);
    expect(captureProviderSyncIdentity(state, providerId)).toBe(first);
    invalidateProviderSyncIdentity(providerId);
    const next = captureProviderSyncIdentity(state, providerId);
    expect(next.generation).toBeGreaterThan(first.generation);
    expect(isProviderSyncIdentityCurrent(state, providerId, first)).toBe(false);
    expect(isProviderSyncIdentityCurrent(state, providerId, next)).toBe(true);
  });

  it("rejects connection drift even before a replacement refresh starts", () => {
    const state = structuredClone(DEFAULT_APP_STATE);
    const first = captureProviderSyncIdentity(state, providerId);
    state.providerSettings.find((setting) => setting.id === providerId)!
      .hostOrigins = ["https://changed.invalid/*"];
    expect(isProviderSyncIdentityCurrent(state, providerId, first)).toBe(false);
  });

  it("does not invalidate usage results for unrelated appearance or snapshot changes", () => {
    const state = structuredClone(DEFAULT_APP_STATE);
    const first = captureProviderSyncIdentity(state, providerId);
    state.settings.themeMode = "dark";
    state.providers.find((provider) => provider.providerId === providerId)!
      .syncedAt = "2026-09-22T12:00:00Z";
    expect(isProviderSyncIdentityCurrent(state, providerId, first)).toBe(true);
  });

  it("invalidates in-flight results when a credential changes without storing it in the identity", async () => {
    const state = structuredClone(DEFAULT_APP_STATE);
    await setSub2ApiKey("synthetic-initial-test-key");
    const first = captureProviderSyncIdentity(state, providerId);
    await setSub2ApiKey("synthetic-rotated-test-key");
    expect(isProviderSyncIdentityCurrent(state, providerId, first)).toBe(false);
    const next = captureProviderSyncIdentity(state, providerId);
    expect(JSON.stringify(next)).not.toContain("synthetic-");
    await setSub2ApiKey("synthetic-rotated-test-key");
    expect(isProviderSyncIdentityCurrent(state, providerId, next)).toBe(true);
  });
});
