import { describe, expect, it } from "vitest";

import type { AppState } from "../providers/types";
import { SAMPLE_APP_STATE } from "../shared/demo-state";
import type { CustomSourceSetting, CustomSourceSyncState } from "../shared/custom-sources";
import { createUnknownProviderServiceStatus } from "../shared/provider-service-status";
import { mergeBackgroundSyncState } from "./background-state-merge";

const source: CustomSourceSetting = {
  id: "custom:merge-test", label: "Test", description: null,
  endpointUrl: "https://example.test/usage", displayEnabled: true,
  refreshIntervalMinutes: 15, createdAt: "2026-09-22T10:00:00Z", updatedAt: "2026-09-22T10:00:00Z",
};
function state(): AppState {
  return { ...structuredClone(SAMPLE_APP_STATE), customSources: [source], customSourceStates: [], providerServiceStatuses: [] };
}
function result(time: string): CustomSourceSyncState {
  return { sourceId: source.id, status: "error", snapshot: null, lastAttemptAt: time,
    lastSuccessAt: null, lastFailureAt: time, lastFailureReason: "Synthetic failure", stale: false };
}

describe("field-owned background merge", () => {
  it("does not restore removed or reconfigured custom sources", () => {
    const before = state();
    const completed = { ...before, customSourceStates: [result("2026-09-22T11:00:00Z")] };
    const removed = { ...before, customSources: [] };
    expect(mergeBackgroundSyncState(before, completed, removed).customSourceStates).toEqual([]);
    const edited = { ...before, customSources: [{ ...source, endpointUrl: "https://example.test/new" }] };
    expect(mergeBackgroundSyncState(before, completed, edited).customSourceStates).toEqual([]);
  });

  it("keeps a newer custom result regardless of fetch completion order", () => {
    const before = state();
    const earlier = { ...before, customSourceStates: [result("2026-09-22T11:00:00Z")] };
    const later = { ...before, customSourceStates: [result("2026-09-22T12:00:00Z")] };
    expect(mergeBackgroundSyncState(before, earlier, later).customSourceStates).toEqual(later.customSourceStates);
    expect(mergeBackgroundSyncState(before, later, earlier).customSourceStates).toEqual(later.customSourceStates);
  });

  it("does not add managed sources after their connection was revoked", () => {
    const before = state();
    const managed: CustomSourceSetting = { ...source, id: "custom:codexbar:test", managedBy: "codexbar-dashboard" };
    const completed = { ...before, customSources: [...before.customSources!, managed] };
    expect(mergeBackgroundSyncState(before, completed, before, { allowManagedSources: false }).customSources).toEqual([source]);
  });

  it("removes all managed rows on an explicit disconnect even after display edits", () => {
    const before = state();
    const managed: CustomSourceSetting = { ...source, id: "custom:codexbar:test", managedBy: "codexbar-dashboard" };
    before.customSources!.push(managed);
    const latest = structuredClone(before);
    latest.customSources![1].displayEnabled = false;
    latest.customSourceStates = [{ ...result("2026-09-22T11:00:00Z"), sourceId: managed.id }];
    const merged = mergeBackgroundSyncState(before, state(), latest, { removeManagedSources: true });
    expect(merged.customSources).toEqual([source]);
    expect(merged.customSourceStates).toEqual([]);
  });

  it("does not mutate settings, providers or account containers", () => {
    const before = state();
    const latest = structuredClone(before);
    latest.settings.warningThresholdPercent = 77;
    latest.providers[0].remaining = 31;
    const completed = { ...before, customSourceStates: [result("2026-09-22T11:00:00Z")] };
    const merged = mergeBackgroundSyncState(before, completed, latest);
    expect(merged.settings).toBe(latest.settings);
    expect(merged.providers).toBe(latest.providers);
    expect(merged.providerAccounts).toBe(latest.providerAccounts);
    expect(merged.customSourceStates).toEqual(completed.customSourceStates);
  });

  it("preserves newer service status and respects visibility changes", () => {
    const before = state();
    const failure = { vendorId: "openai" as const, failureReason: "offline" as const, retryAt: new Date("2026-09-22T12:05:00Z") };
    const earlier = createUnknownProviderServiceStatus({ ...failure, checkedAt: new Date("2026-09-22T11:00:00Z") });
    const later = createUnknownProviderServiceStatus({ ...failure, checkedAt: new Date("2026-09-22T12:00:00Z") });
    const completed = { ...before, providerServiceStatuses: [earlier] };
    expect(mergeBackgroundSyncState(before, completed, { ...before, providerServiceStatuses: [later] }).providerServiceStatuses).toEqual([later]);
    const latest = structuredClone(before);
    latest.settings.providerServiceStatusVisibilityBySurface.popup.codex = true;
    expect(mergeBackgroundSyncState(before, completed, latest).providerServiceStatuses).toEqual([]);
  });
});
