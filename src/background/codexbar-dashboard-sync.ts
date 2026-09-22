import type { AppState, SyncTrigger } from "../providers/types";
import {
  fetchCodexBarDashboardSnapshot,
  normalizeCodexBarDashboardEndpoint,
  type CodexBarDashboardBridgeFailure,
  type CodexBarDashboardBridgeResult,
  type CodexBarDashboardSnapshot,
} from "../shared/codexbar-dashboard-bridge";
import {
  clearCodexBarDashboardConnection,
  readCodexBarDashboardConnection,
  writeCodexBarDashboardConnection,
} from "../shared/codexbar-dashboard-connection";
import {
  isCodexBarManagedCustomSource as isManagedCustomSource,
  type CustomSourceSetting,
  type CustomSourceSyncState,
} from "../shared/custom-sources";
import {
  clearLocalCompanionToken,
  readLocalCompanionToken,
  writeLocalCompanionToken,
} from "../shared/local-companion-secrets";

export const CODEXBAR_DASHBOARD_REFRESH_INTERVAL_MINUTES = 15;
export const CODEXBAR_DASHBOARD_FAILURE_COOLDOWN_MINUTES = 5;

type FetchOptions = {
  fetchImpl?: typeof fetch;
  now?: Date;
  timeoutMs?: number;
};

type SyncOptions = FetchOptions & {
  hasHostAccess?: (endpointUrl: unknown) => Promise<boolean>;
  trigger: SyncTrigger;
};

export type CodexBarDashboardConnectResult =
  | { ok: true; state: AppState; snapshot: CodexBarDashboardSnapshot }
  | { ok: false; state: AppState; failure: CodexBarDashboardBridgeFailure };

const inFlightRequests = new Map<
  string,
  Map<number, Promise<CodexBarDashboardBridgeResult>>
>();

let codexBarDashboardGeneration = 0;
let persistenceTail: Promise<void> = Promise.resolve();
let activeMutationGeneration: number | null = null;

type PersistenceResult = "committed" | "stale";

export function getCodexBarDashboardGeneration(): number {
  return codexBarDashboardGeneration;
}

function beginCodexBarDashboardMutation(): number {
  codexBarDashboardGeneration += 1;
  activeMutationGeneration = codexBarDashboardGeneration;
  return activeMutationGeneration;
}

function isCurrentGeneration(generation: number): boolean {
  return generation === codexBarDashboardGeneration;
}

function isMutationInProgress(): boolean {
  return activeMutationGeneration === codexBarDashboardGeneration;
}

function finishCodexBarDashboardMutation(generation: number): void {
  if (activeMutationGeneration === generation) {
    activeMutationGeneration = null;
  }
}

function enqueuePersistence<T>(
  generation: number,
  transaction: () => Promise<T>,
): Promise<T | PersistenceResult> {
  const queued: Promise<T | PersistenceResult> = persistenceTail.then<
    T | PersistenceResult
  >(
    () =>
      isCurrentGeneration(generation)
        ? transaction()
        : ("stale" as const),
  );
  // A failed storage operation must not prevent the action queued after it.
  persistenceTail = queued.then(
    () => undefined,
    () => undefined,
  );
  return queued;
}

function tokenStorageKey(endpointUrl: string): string {
  return new URL(endpointUrl).origin;
}

function parseTimestamp(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

function managedSettings(state: AppState): CustomSourceSetting[] {
  return (state.customSources ?? []).filter(isManagedCustomSource);
}

function managedStates(state: AppState): CustomSourceSyncState[] {
  const managedIds = new Set(managedSettings(state).map((source) => source.id));
  return (state.customSourceStates ?? []).filter((entry) =>
    managedIds.has(entry.sourceId),
  );
}

function shouldRefresh(
  state: AppState,
  trigger: SyncTrigger,
  now: Date,
): boolean {
  if (trigger === "manual") {
    return true;
  }
  if (trigger !== "alarm") {
    return false;
  }

  const states = managedStates(state);
  const latestAttempt = states
    .map((entry) => parseTimestamp(entry.lastAttemptAt))
    .filter((value): value is number => value !== null)
    .sort((left, right) => right - left)[0];
  if (!latestAttempt) {
    return true;
  }

  const latestFailure = states
    .map((entry) => parseTimestamp(entry.lastFailureAt))
    .filter((value): value is number => value !== null)
    .sort((left, right) => right - left)[0];
  const latestSuccess = states
    .map((entry) => parseTimestamp(entry.lastSuccessAt))
    .filter((value): value is number => value !== null)
    .sort((left, right) => right - left)[0];
  const intervalMinutes =
    latestFailure && (!latestSuccess || latestFailure >= latestSuccess)
      ? CODEXBAR_DASHBOARD_FAILURE_COOLDOWN_MINUTES
      : CODEXBAR_DASHBOARD_REFRESH_INTERVAL_MINUTES;

  return (
    now.getTime() - latestAttempt >=
    intervalMinutes * 60_000
  );
}

async function fetchCoalesced(
  endpointUrl: string,
  generation: number,
  token: string,
  options: FetchOptions,
): Promise<CodexBarDashboardBridgeResult> {
  const requestsForEndpoint = inFlightRequests.get(endpointUrl);
  const existing = requestsForEndpoint?.get(generation);
  if (existing) {
    return existing;
  }
  const request = fetchCodexBarDashboardSnapshot(endpointUrl, token, options);
  const nextRequests = requestsForEndpoint ?? new Map();
  nextRequests.set(generation, request);
  if (!requestsForEndpoint) {
    inFlightRequests.set(endpointUrl, nextRequests);
  }
  try {
    return await request;
  } finally {
    const currentRequests = inFlightRequests.get(endpointUrl);
    if (currentRequests?.get(generation) === request) {
      currentRequests.delete(generation);
      if (currentRequests.size === 0) {
        inFlightRequests.delete(endpointUrl);
      }
    }
  }
}

function mergeSuccessfulSnapshot(
  state: AppState,
  endpointUrl: string,
  snapshot: CodexBarDashboardSnapshot,
  now: Date,
): AppState {
  const attemptedAt = now.toISOString();
  const previousSettings = new Map(
    managedSettings(state).map((setting) => [setting.id, setting]),
  );
  const unmanagedSettings = (state.customSources ?? []).filter(
    (source) => !isManagedCustomSource(source),
  );
  const unmanagedStates = (state.customSourceStates ?? []).filter(
    (entry) => !previousSettings.has(entry.sourceId),
  );
  const nextSettings: CustomSourceSetting[] = snapshot.sources.map((source) => {
    const previous = previousSettings.get(source.sourceId);
    return {
      id: source.sourceId,
      label: source.snapshot.label,
      description: source.snapshot.description,
      endpointUrl,
      displayEnabled: previous?.displayEnabled ?? source.enabled,
      refreshIntervalMinutes: CODEXBAR_DASHBOARD_REFRESH_INTERVAL_MINUTES,
      createdAt: previous?.createdAt ?? attemptedAt,
      updatedAt: attemptedAt,
      managedBy: "codexbar-dashboard",
    };
  });
  const nextStates: CustomSourceSyncState[] = snapshot.sources.map((source) => ({
    sourceId: source.sourceId,
    status: source.snapshot.syncStatus,
    snapshot: source.snapshot,
    lastAttemptAt: attemptedAt,
    lastSuccessAt: attemptedAt,
    lastFailureAt: null,
    lastFailureReason: null,
    stale: snapshot.stale,
  }));

  return {
    ...state,
    customSources: [...unmanagedSettings, ...nextSettings],
    customSourceStates: [...unmanagedStates, ...nextStates],
  };
}

function mergeFailedSnapshot(
  state: AppState,
  failure: CodexBarDashboardBridgeFailure,
  now: Date,
): AppState {
  const attemptedAt = now.toISOString();
  const managedIds = new Set(managedSettings(state).map((source) => source.id));
  return {
    ...state,
    customSourceStates: (state.customSourceStates ?? []).map((entry) => {
      if (!managedIds.has(entry.sourceId)) {
        return entry;
      }
      const snapshot = entry.snapshot
        ? {
            ...entry.snapshot,
            syncStatus: "warning" as const,
            tone: "warning" as const,
            warningReason: failure.message,
            lastSyncLabel: "CodexBar refresh failed; showing cached data",
          }
        : null;
      return {
        ...entry,
        status: snapshot ? ("warning" as const) : ("error" as const),
        snapshot,
        lastAttemptAt: attemptedAt,
        lastFailureAt: attemptedAt,
        lastFailureReason: failure.message,
        stale: Boolean(snapshot),
      };
    }),
  };
}

function missingTokenFailure(): CodexBarDashboardBridgeFailure {
  return {
    ok: false,
    code: "invalid_token",
    message: "The CodexBar dashboard token is missing or was cleared.",
  };
}

function missingPermissionFailure(): CodexBarDashboardBridgeFailure {
  return {
    ok: false,
    code: "unavailable",
    message: "Loopback host access has not been granted for CodexBar.",
  };
}

function supersededMutationFailure(): CodexBarDashboardBridgeFailure {
  return {
    ok: false,
    code: "unavailable",
    message: "A newer CodexBar dashboard change superseded this connection attempt.",
  };
}

async function restoreToken(
  origin: string,
  previousToken: string | null,
): Promise<void> {
  if (previousToken) {
    await writeLocalCompanionToken(origin, previousToken);
    return;
  }
  await clearLocalCompanionToken(origin);
}

async function restoreConnection(
  previousConnection: Awaited<ReturnType<typeof readCodexBarDashboardConnection>>,
): Promise<void> {
  if (previousConnection) {
    await writeCodexBarDashboardConnection(previousConnection.endpointUrl);
    return;
  }
  await clearCodexBarDashboardConnection();
}

export async function syncCodexBarDashboardSources(
  state: AppState,
  options: SyncOptions,
): Promise<AppState> {
  const generation = getCodexBarDashboardGeneration();
  if (isMutationInProgress()) {
    return state;
  }
  const connection = await readCodexBarDashboardConnection();
  const now = options.now ?? new Date();
  if (
    !isCurrentGeneration(generation) ||
    isMutationInProgress() ||
    !connection ||
    !shouldRefresh(state, options.trigger, now)
  ) {
    return state;
  }

  const hasVisibleSource = managedSettings(state).some(
    (source) => source.displayEnabled,
  );
  if (managedSettings(state).length > 0 && !hasVisibleSource) {
    return state;
  }
  const hasAccess = options.hasHostAccess
    ? await options.hasHostAccess(connection.endpointUrl).catch(() => false)
    : true;
  if (!isCurrentGeneration(generation) || isMutationInProgress()) {
    return state;
  }
  if (!hasAccess) {
    return mergeFailedSnapshot(state, missingPermissionFailure(), now);
  }
  const token = await readLocalCompanionToken(
    tokenStorageKey(connection.endpointUrl),
  );
  if (!isCurrentGeneration(generation) || isMutationInProgress()) {
    return state;
  }
  if (!token) {
    return mergeFailedSnapshot(state, missingTokenFailure(), now);
  }
  const result = await fetchCoalesced(connection.endpointUrl, generation, token, {
    fetchImpl: options.fetchImpl,
    now,
    timeoutMs: options.timeoutMs,
  });
  if (!isCurrentGeneration(generation) || isMutationInProgress()) {
    return state;
  }
  return result.ok
    ? mergeSuccessfulSnapshot(state, connection.endpointUrl, result.value, now)
    : mergeFailedSnapshot(state, result, now);
}

export async function connectCodexBarDashboard(
  state: AppState,
  endpointUrl: string,
  token: string | null,
  options: FetchOptions = {},
): Promise<CodexBarDashboardConnectResult> {
  const generation = beginCodexBarDashboardMutation();
  try {
    const endpoint = normalizeCodexBarDashboardEndpoint(endpointUrl);
    const now = options.now ?? new Date();
    if (!endpoint.ok) {
      return { ok: false, state, failure: endpoint };
    }
    const tokenKey = tokenStorageKey(endpoint.value);
    const candidateToken = token?.trim() || (await readLocalCompanionToken(tokenKey));
    if (!isCurrentGeneration(generation)) {
      const failure = supersededMutationFailure();
      return { ok: false, state, failure };
    }
    if (!candidateToken) {
      const failure = missingTokenFailure();
      return { ok: false, state: mergeFailedSnapshot(state, failure, now), failure };
    }

    const result = await fetchCoalesced(endpoint.value, generation, candidateToken, {
      ...options,
      now,
    });
    if (!isCurrentGeneration(generation)) {
      const failure = supersededMutationFailure();
      return { ok: false, state, failure };
    }
    if (!result.ok) {
      return {
        ok: false,
        state: mergeFailedSnapshot(state, result, now),
        failure: result,
      };
    }
    const persisted = await enqueuePersistence(generation, async () => {
      const previousConnection = await readCodexBarDashboardConnection();
      if (!isCurrentGeneration(generation)) {
        return "stale" as const;
      }
      const previousToken = await readLocalCompanionToken(tokenKey);
      if (!isCurrentGeneration(generation)) {
        return "stale" as const;
      }
      let wroteToken = false;
      if (token && !(await writeLocalCompanionToken(tokenKey, candidateToken))) {
        return "token_failure" as const;
      }
      if (token) {
        wroteToken = true;
      }
      if (!isCurrentGeneration(generation)) {
        if (wroteToken) {
          await restoreToken(tokenKey, previousToken);
        }
        return "stale" as const;
      }
      const previousOrigin = previousConnection
        ? tokenStorageKey(previousConnection.endpointUrl)
        : null;
      const previousConnectionToken =
        previousOrigin && previousOrigin !== tokenKey
          ? await readLocalCompanionToken(previousOrigin)
          : null;
      if (!isCurrentGeneration(generation)) {
        if (wroteToken) {
          await restoreToken(tokenKey, previousToken);
        }
        return "stale" as const;
      }
      if (previousOrigin && previousOrigin !== tokenKey) {
        await clearLocalCompanionToken(previousOrigin);
        if (!isCurrentGeneration(generation)) {
          await restoreToken(previousOrigin, previousConnectionToken);
          if (wroteToken) {
            await restoreToken(tokenKey, previousToken);
          }
          return "stale" as const;
        }
      }
      const connected = await writeCodexBarDashboardConnection(endpoint.value);
      if (!connected) {
        if (previousOrigin && previousOrigin !== tokenKey) {
          await restoreToken(previousOrigin, previousConnectionToken);
        }
        if (wroteToken) {
          await restoreToken(tokenKey, previousToken);
        }
        return "token_failure" as const;
      }
      if (!isCurrentGeneration(generation)) {
        await restoreConnection(previousConnection);
        if (previousOrigin && previousOrigin !== tokenKey) {
          await restoreToken(previousOrigin, previousConnectionToken);
        }
        if (wroteToken) {
          await restoreToken(tokenKey, previousToken);
        }
        return "stale" as const;
      }
      return "committed" as const;
    });
    if (persisted === "stale" || !isCurrentGeneration(generation)) {
      const failure = supersededMutationFailure();
      return { ok: false, state, failure };
    }
    if (persisted === "token_failure") {
      const failure = missingTokenFailure();
      return { ok: false, state, failure };
    }
    return {
      ok: true,
      state: mergeSuccessfulSnapshot(state, endpoint.value, result.value, now),
      snapshot: result.value,
    };
  } catch {
    const failure: CodexBarDashboardBridgeFailure = {
      ok: false,
      code: "unavailable",
      message: "CodexBar dashboard settings could not be saved locally.",
    };
    return { ok: false, state, failure };
  } finally {
    finishCodexBarDashboardMutation(generation);
  }
}

export async function disconnectCodexBarDashboard(state: AppState): Promise<AppState> {
  const generation = beginCodexBarDashboardMutation();
  try {
    const disconnected = await enqueuePersistence(generation, async () => {
      const connection = await readCodexBarDashboardConnection();
      if (!isCurrentGeneration(generation)) {
        return "stale" as const;
      }
      if (connection) {
        await clearLocalCompanionToken(tokenStorageKey(connection.endpointUrl));
        if (!isCurrentGeneration(generation)) {
          return "stale" as const;
        }
      }
      await clearCodexBarDashboardConnection();
      return "committed" as const;
    });
    if (disconnected !== "committed" || !isCurrentGeneration(generation)) {
      return state;
    }
    const managedIds = new Set(managedSettings(state).map((source) => source.id));
    return {
      ...state,
      customSources: (state.customSources ?? []).filter(
        (source) => !isManagedCustomSource(source),
      ),
      customSourceStates: (state.customSourceStates ?? []).filter(
        (entry) => !managedIds.has(entry.sourceId),
      ),
    };
  } finally {
    finishCodexBarDashboardMutation(generation);
  }
}

export async function clearCodexBarDashboardToken(state: AppState): Promise<AppState> {
  const generation = beginCodexBarDashboardMutation();
  try {
    const cleared = await enqueuePersistence(generation, async () => {
      const connection = await readCodexBarDashboardConnection();
      if (!isCurrentGeneration(generation)) {
        return "stale" as const;
      }
      if (!connection) {
        return "missing" as const;
      }
      await clearLocalCompanionToken(tokenStorageKey(connection.endpointUrl));
      return isCurrentGeneration(generation)
        ? ("committed" as const)
        : ("stale" as const);
    });
    if (cleared !== "committed" || !isCurrentGeneration(generation)) {
      return state;
    }
    return mergeFailedSnapshot(state, missingTokenFailure(), new Date());
  } finally {
    finishCodexBarDashboardMutation(generation);
  }
}

export function resetCodexBarDashboardInFlightForTests(): void {
  inFlightRequests.clear();
  codexBarDashboardGeneration = 0;
  persistenceTail = Promise.resolve();
  activeMutationGeneration = null;
}
