import type { AppState } from "../providers/types";
import { createEmptyCustomSourceSyncState, isCustomSourceId, type CustomSourceId, type CustomSourceSetting } from "../shared/custom-sources";
import { hasCustomSourceHostAccess } from "../shared/custom-source-host-access";
import { fetchLocalCompanionBridgeHealth, fetchLocalCompanionBridgeSource, fetchLocalCompanionBridgeSourceIndex, normalizeLocalCompanionBridgeBaseUrl, pairLocalCompanionBridge, revokeLocalCompanionBridgePairing } from "../shared/local-companion-bridge";
import { readLocalCompanionPairing, writeLocalCompanionPairing, type LocalCompanionPairing } from "../shared/local-companion-pairing";
import { isLocalCompanionCaptureStale, type LocalCompanionAction, type LocalCompanionSettingsFailure, type LocalCompanionSettingsView } from "../shared/local-companion-settings";
import { getAppStateReplacementGeneration } from "../shared/provider-sync-identity";
import { normalizeSnapshotTimestamp } from "../shared/snapshot-freshness";
import { seedAppStateIfEmpty, updateAppState } from "../shared/storage";

type Dependencies = {
  readState: () => Promise<AppState>;
  updateState: (update: (state: AppState) => AppState) => Promise<AppState>;
  readPairing: () => Promise<LocalCompanionPairing | null>;
  writePairing: (pairing: LocalCompanionPairing | null) => Promise<void>;
  hasAccess: (url: string) => Promise<boolean>;
  replacement: () => number;
  fetchImpl: typeof fetch;
  now: () => Date;
};
const managed = (source: CustomSourceSetting) => source.managedBy === "local-companion";
const endpoint = (baseUrl: string, sourceId: CustomSourceId) => `${baseUrl}/v1/sources/${encodeURIComponent(sourceId)}`;

function removeManaged(state: AppState, sourceId?: CustomSourceId): AppState {
  const removed = new Set((state.customSources ?? []).filter((source) => managed(source) && (!sourceId || source.id === sourceId)).map((source) => source.id));
  return { ...state, customSources: (state.customSources ?? []).filter((source) => !removed.has(source.id)), customSourceStates: (state.customSourceStates ?? []).filter((source) => !removed.has(source.sourceId)) };
}

function view(pairing: LocalCompanionPairing | null, state: AppState, failure: LocalCompanionSettingsFailure | null): LocalCompanionSettingsView {
  return {
    baseUrl: pairing?.baseUrl ?? null,
    status: pairing ? pairing.token ? pairing.status : "expired" : "disconnected",
    checkedAt: pairing?.checkedAt ?? null,
    failure,
    sources: pairing?.sources.map((source) => ({ ...source, managedId: (state.customSources ?? []).find((setting) => managed(setting) && setting.endpointUrl === endpoint(pairing.baseUrl, source.sourceId))?.id ?? null })) ?? [],
  };
}

async function managedSourceId(baseUrl: string, sourceId: CustomSourceId): Promise<CustomSourceId> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${baseUrl}\0${sourceId}`));
  return `custom:companion-${[...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("").slice(0, 40)}`;
}

export function createLocalCompanionController(overrides: Partial<Dependencies> = {}) {
  const deps: Dependencies = {
    readState: seedAppStateIfEmpty, updateState: updateAppState,
    readPairing: readLocalCompanionPairing, writePairing: writeLocalCompanionPairing,
    hasAccess: hasCustomSourceHostAccess, replacement: getAppStateReplacementGeneration,
    fetchImpl: (...args) => fetch(...args), now: () => new Date(), ...overrides,
  };
  let generation = 0;
  let commandTail: Promise<unknown> = Promise.resolve();

  async function finish(failure: LocalCompanionSettingsFailure | null = null) {
    const state = await deps.readState();
    return { state, localCompanion: view(await deps.readPairing(), state, failure) };
  }

  async function execute(action: LocalCompanionAction, expected: number, replacement: number) {
    const current = () => generation === expected && deps.replacement() === replacement;
    const initial = await deps.readState();
    if (!["developer", "debug"].includes(initial.settings.userLevel)) {
      return { state: initial, localCompanion: view(null, initial, "developer_required") };
    }
    if (!current()) return finish("superseded");
    if (action.action === "status") return finish();
    let pairing = await deps.readPairing();
    const network = { fetchImpl: deps.fetchImpl };

    async function fail(code: LocalCompanionSettingsFailure, sourceId?: CustomSourceId) {
      if (!current()) return finish("superseded");
      if (pairing) {
        const expired = code === "unauthorized" || code === "invalid_token";
        const disconnected = expired || code === "unavailable" || code === "timeout" || code === "permission_required";
        pairing = { ...pairing, token: expired ? null : pairing.token, status: expired ? "expired" : disconnected ? "unavailable" : pairing.status, checkedAt: deps.now().toISOString() };
        await deps.writePairing(pairing);
        await deps.updateState((state) => {
          if (!current()) return state;
          const ids = new Set((state.customSources ?? []).filter((source) => managed(source) && (!sourceId || source.endpointUrl === endpoint(pairing!.baseUrl, sourceId))).map((source) => source.id));
          return { ...state, customSourceStates: (state.customSourceStates ?? []).map((entry) => ids.has(entry.sourceId) ? { ...entry, status: "warning", stale: true, lastAttemptAt: sourceId ? deps.now().toISOString() : entry.lastAttemptAt, lastFailureAt: deps.now().toISOString(), lastFailureReason: code } : entry) };
        });
      }
      return finish(code);
    }

    if (action.action === "disconnect") {
      // Invalidate local access before best-effort remote revocation; no fetch owns AppState.
      await deps.writePairing(null);
      await deps.updateState((state) => current() ? removeManaged(state) : state);
      if (pairing?.token && await deps.hasAccess(pairing.baseUrl).catch(() => false)) {
        await revokeLocalCompanionBridgePairing(pairing.baseUrl, pairing.token, network);
      }
      return finish();
    }
    if (action.action === "remove-source") {
      if (!isCustomSourceId(action.sourceId) || !pairing?.sources.some((source) => source.sourceId === action.sourceId)) return finish("source_missing");
      const sourceUrl = endpoint(pairing.baseUrl, action.sourceId);
      await deps.updateState((state) => {
        if (!current()) return state;
        const id = state.customSources?.find((source) => managed(source) && source.endpointUrl === sourceUrl)?.id;
        return id ? removeManaged(state, id) : state;
      });
      return finish();
    }
    if (action.action === "pair") {
      const url = normalizeLocalCompanionBridgeBaseUrl(action.baseUrl);
      if (!url.ok) return finish(url.code);
      if (!await deps.hasAccess(url.value).catch(() => false)) return finish("permission_required");
      const result = await pairLocalCompanionBridge(url.value, action.pairingCode, network);
      if (!result.ok) return current() ? finish(result.code) : finish("superseded");
      if (!current()) {
        await revokeLocalCompanionBridgePairing(url.value, result.value, network);
        return finish("superseded");
      }
      const previous = pairing;
      pairing = { baseUrl: url.value, token: result.value, status: "connected", checkedAt: deps.now().toISOString(), sources: previous?.baseUrl === url.value ? previous.sources : [] };
      await deps.writePairing(pairing);
      if (previous?.baseUrl !== url.value) await deps.updateState((state) => current() ? removeManaged(state) : state);
      if (previous?.token && previous.baseUrl !== url.value && await deps.hasAccess(previous.baseUrl).catch(() => false)) {
        await revokeLocalCompanionBridgePairing(previous.baseUrl, previous.token, network);
      }
    }
    if (!current()) return finish("superseded");
    if (!pairing?.token) return fail("invalid_token");
    if (!await deps.hasAccess(pairing.baseUrl).catch(() => false)) return fail("permission_required");

    if (action.action === "refresh-source") {
      if (!isCustomSourceId(action.sourceId)) return finish("source_missing");
      const binding = initial.customSources?.find((source) => managed(source) && source.id === action.sourceId);
      const remote = pairing.sources.find((source) => source.sourceId === action.sourceId || (binding && binding.endpointUrl === endpoint(pairing!.baseUrl, source.sourceId)));
      if (!remote) return finish("source_missing");
      const sourceUrl = endpoint(pairing.baseUrl, remote.sourceId);
      const id = await managedSourceId(pairing.baseUrl, remote.sourceId);
      const result = await fetchLocalCompanionBridgeSource(pairing.baseUrl, pairing.token, remote.sourceId, network);
      if (!current()) return finish("superseded");
      if (!result.ok) return fail(result.code, remote.sourceId);
      const now = deps.now();
      const capturedAt = normalizeSnapshotTimestamp(result.value.syncedAt);
      let conflict = false;
      await deps.updateState((state) => {
        if (!current()) return state;
        const existing = state.customSources?.find((source) => source.id === id);
        if (existing && (!managed(existing) || existing.endpointUrl !== sourceUrl)) { conflict = true; return state; }
        const setting: CustomSourceSetting = { id, label: result.value.label, description: result.value.description, endpointUrl: sourceUrl, displayEnabled: existing?.displayEnabled ?? true, refreshIntervalMinutes: 15, createdAt: existing?.createdAt ?? now.toISOString(), updatedAt: now.toISOString(), managedBy: "local-companion" };
        return {
          ...state,
          customSources: [...(state.customSources ?? []).filter((source) => source.id !== id), setting],
          customSourceStates: [...(state.customSourceStates ?? []).filter((entry) => entry.sourceId !== id), {
            ...createEmptyCustomSourceSyncState(id), status: result.value.syncStatus,
            snapshot: { ...result.value, sourceId: id, endpointId: null }, lastAttemptAt: now.toISOString(), lastSuccessAt: capturedAt,
            stale: isLocalCompanionCaptureStale(capturedAt, now),
          }],
        };
      });
      if (!current()) return finish("superseded");
      await deps.writePairing({ ...pairing, status: "connected", checkedAt: now.toISOString() });
      return finish(conflict ? "conflict" : null);
    }
    const health = await fetchLocalCompanionBridgeHealth(pairing.baseUrl, pairing.token, network);
    if (!health.ok) return fail(health.code);
    if (!current()) return finish("superseded");
    const index = await fetchLocalCompanionBridgeSourceIndex(pairing.baseUrl, pairing.token, network);
    if (!index.ok) return fail(index.code);
    if (!current()) return finish("superseded");
    pairing = { ...pairing, sources: index.value.sources, status: "connected", checkedAt: deps.now().toISOString() };
    await deps.writePairing(pairing);
    const endpoints = new Set(pairing.sources.map((source) => endpoint(pairing!.baseUrl, source.sourceId)));
    await deps.updateState((state) => {
      if (!current()) return state;
      const missing = (state.customSources ?? []).filter((source) => managed(source) && !endpoints.has(source.endpointUrl));
      return missing.reduce((next, source) => removeManaged(next, source.id), state);
    });
    return finish();
  }

  return {
    handle(action: LocalCompanionAction) {
      if (["pair", "disconnect", "remove-source"].includes(action.action)) generation += 1;
      const expected = generation, replacement = deps.replacement();
      // A bridge command queue orders its credential lifecycle; the shared storage queue
      // is entered only for short latest-state reducers, never while waiting on the network.
      const work = commandTail.then(() => execute(action, expected, replacement));
      commandTail = work.catch(() => undefined);
      return work;
    },
  };
}

export const localCompanionController = createLocalCompanionController();
