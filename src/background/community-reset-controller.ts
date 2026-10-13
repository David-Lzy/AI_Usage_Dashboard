import {
  COMMUNITY_RESET_ENDPOINTS, COMMUNITY_RESET_INTERVAL_MS, emptyCommunityResetCache,
  normalizeCommunityResetPreferences, normalizeCommunityResetStore,
  type CommunityResetEndpoint, type CommunityResetSource, type CommunityResetStore,
} from "../shared/community-reset-feeds";
import type { CommunityResetMessage, CommunityResetResponse } from "../shared/community-reset-client";
import { fetchCommunityResetEndpoint, type CommunityResetFetch } from "./community-reset-fetch";

type Dependencies = {
  readStore: () => Promise<unknown>;
  writeStore: (store: CommunityResetStore) => Promise<void>;
  hostAccess: (source: CommunityResetSource) => Promise<boolean>;
  schedule: (enabled: boolean) => Promise<void>;
  suppressed: () => Promise<boolean>;
  fetcher?: CommunityResetFetch;
  now?: () => number;
};
/** A generation barrier lets preference changes abort polling without waiting for network I/O. */
export function createCommunityResetController(deps: Dependencies) {
  let generation = 0;
  let active: { abort: AbortController; promise: Promise<void> } | null = null;
  let tail: Promise<unknown> = Promise.resolve();
  let alarmTail: Promise<void> = Promise.resolve();
  const serial = <T>(work: () => Promise<T>): Promise<T> => {
    const result = tail.then(work, work); tail = result.catch(() => undefined); return result;
  };
  function invalidate() { generation += 1; active?.abort.abort(); active = null; }
  async function reconcile() {
    const token = generation;
    const store = normalizeCommunityResetStore(await deps.readStore());
    const allowed = !await deps.suppressed() && store.preferences.mode !== "off"
      && (await Promise.all(store.preferences.sources.map(deps.hostAccess))).some(Boolean);
    if (token !== generation) return;
    if (!allowed) invalidate();
    const alarmGeneration = generation;
    const schedule = async () => { if (alarmGeneration === generation) await deps.schedule(allowed); };
    alarmTail = alarmTail.then(schedule, schedule);
    await alarmTail;
  }
  function poll(foreground = false): Promise<void> {
    if (active) return active.promise;
    const token = generation, abort = new AbortController();
    const promise = (async () => {
      const store = normalizeCommunityResetStore(await deps.readStore());
      if (await deps.suppressed() || store.preferences.mode === "off") { await reconcile(); return; }
      const now = deps.now?.() ?? Date.now();
      const updates: CommunityResetStore["caches"] = {};
      for (const endpoint of Object.keys(COMMUNITY_RESET_ENDPOINTS) as CommunityResetEndpoint[]) {
        const source = COMMUNITY_RESET_ENDPOINTS[endpoint].source;
        if (!store.preferences.sources.includes(source) || abort.signal.aborted) continue;
        const previous = store.caches[endpoint] ?? emptyCommunityResetCache();
        if (!await deps.hostAccess(source)) {
          updates[endpoint] = { ...previous, checkedAt: new Date(now).toISOString(), failure: "permission" };
          continue;
        }
        if (previous.retryAt && Date.parse(previous.retryAt) > now
          || previous.failure !== "permission" && previous.checkedAt && now - Date.parse(previous.checkedAt) < (foreground ? 60_000 : COMMUNITY_RESET_INTERVAL_MS)) continue;
        updates[endpoint] = await fetchCommunityResetEndpoint(endpoint, previous, now, abort.signal, deps.fetcher);
      }
      await serial(async () => {
        if (generation !== token || abort.signal.aborted) return;
        const latest = normalizeCommunityResetStore(await deps.readStore());
        if (latest.revision !== store.revision || JSON.stringify(latest.preferences) !== JSON.stringify(store.preferences) || await deps.suppressed()) return;
        // Permission may have been revoked after the final response was received.
        for (const endpoint of Object.keys(updates) as CommunityResetEndpoint[]) {
          if (!await deps.hostAccess(COMMUNITY_RESET_ENDPOINTS[endpoint].source)) updates[endpoint] = {
            ...(latest.caches[endpoint] ?? emptyCommunityResetCache()), failure: "permission", checkedAt: new Date(now).toISOString(),
          };
        }
        if (Object.keys(updates).length) await deps.writeStore({ ...latest, caches: { ...latest.caches, ...updates } });
      });
      await reconcile();
    })();
    active = { abort, promise };
    void promise.finally(() => { if (active?.promise === promise) active = null; }).catch(() => undefined);
    return promise;
  }
  function handle(message: CommunityResetMessage): Promise<CommunityResetResponse> {
    if (message.type === "community-resets:update") invalidate();
    if (message.type === "community-resets:refresh") return poll(true).then(() => handle({ type: "community-resets:read" }));
    return serial(async () => {
      if (message.type !== "community-resets:read" && message.type !== "community-resets:update") return { ok: false };
      let store = normalizeCommunityResetStore(await deps.readStore());
      if (message.type === "community-resets:update") {
        const preferences = normalizeCommunityResetPreferences(message.preferences);
        if (JSON.stringify(store.preferences) !== JSON.stringify(preferences)) {
          store = { ...store, preferences, revision: store.revision + 1 };
          await deps.writeStore(store);
        }
        await reconcile();
      }
      const access = Object.fromEntries(await Promise.all(store.preferences.sources.map(async (source) => [source, await deps.hostAccess(source)] as const)));
      return { ok: true, view: { store, access } };
    });
  }
  return { poll, handle, reconcile, invalidate };
}
