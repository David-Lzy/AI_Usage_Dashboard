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
  isManagedCustomSource,
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
  Promise<CodexBarDashboardBridgeResult>
>();

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
  token: string,
  options: FetchOptions,
): Promise<CodexBarDashboardBridgeResult> {
  const existing = inFlightRequests.get(endpointUrl);
  if (existing) {
    return existing;
  }
  const request = fetchCodexBarDashboardSnapshot(endpointUrl, token, options);
  inFlightRequests.set(endpointUrl, request);
  try {
    return await request;
  } finally {
    if (inFlightRequests.get(endpointUrl) === request) {
      inFlightRequests.delete(endpointUrl);
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

export async function syncCodexBarDashboardSources(
  state: AppState,
  options: SyncOptions,
): Promise<AppState> {
  const connection = await readCodexBarDashboardConnection();
  const now = options.now ?? new Date();
  if (!connection || !shouldRefresh(state, options.trigger, now)) {
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
  if (!hasAccess) {
    return mergeFailedSnapshot(state, missingPermissionFailure(), now);
  }
  const token = await readLocalCompanionToken(
    tokenStorageKey(connection.endpointUrl),
  );
  if (!token) {
    return mergeFailedSnapshot(state, missingTokenFailure(), now);
  }
  const result = await fetchCoalesced(connection.endpointUrl, token, {
    fetchImpl: options.fetchImpl,
    now,
    timeoutMs: options.timeoutMs,
  });
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
  const endpoint = normalizeCodexBarDashboardEndpoint(endpointUrl);
  const now = options.now ?? new Date();
  if (!endpoint.ok) {
    return { ok: false, state, failure: endpoint };
  }
  const tokenKey = tokenStorageKey(endpoint.value);
  const previousConnection = await readCodexBarDashboardConnection();
  const candidateToken = token?.trim() || (await readLocalCompanionToken(tokenKey));
  if (!candidateToken) {
    const failure = missingTokenFailure();
    return { ok: false, state: mergeFailedSnapshot(state, failure, now), failure };
  }

  const result = await fetchCoalesced(endpoint.value, candidateToken, {
    ...options,
    now,
  });
  if (!result.ok) {
    return {
      ok: false,
      state: mergeFailedSnapshot(state, result, now),
      failure: result,
    };
  }
  if (token && !(await writeLocalCompanionToken(tokenKey, token))) {
    const failure = missingTokenFailure();
    return { ok: false, state, failure };
  }
  if (
    previousConnection &&
    tokenStorageKey(previousConnection.endpointUrl) !== tokenKey
  ) {
    await clearLocalCompanionToken(
      tokenStorageKey(previousConnection.endpointUrl),
    );
  }
  await writeCodexBarDashboardConnection(endpoint.value);
  return {
    ok: true,
    state: mergeSuccessfulSnapshot(state, endpoint.value, result.value, now),
    snapshot: result.value,
  };
}

export async function disconnectCodexBarDashboard(state: AppState): Promise<AppState> {
  const connection = await readCodexBarDashboardConnection();
  if (connection) {
    await clearLocalCompanionToken(tokenStorageKey(connection.endpointUrl));
  }
  await clearCodexBarDashboardConnection();
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
}

export async function clearCodexBarDashboardToken(state: AppState): Promise<AppState> {
  const connection = await readCodexBarDashboardConnection();
  if (!connection) {
    return state;
  }
  await clearLocalCompanionToken(tokenStorageKey(connection.endpointUrl));
  return mergeFailedSnapshot(state, missingTokenFailure(), new Date());
}

export function resetCodexBarDashboardInFlightForTests(): void {
  inFlightRequests.clear();
}
