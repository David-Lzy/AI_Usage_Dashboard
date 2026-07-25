import { hasRegisteredProviderCapability } from "../providers/registry";
import type {
  ApiGatewayConnectionMetadata,
  AppState,
  ProviderAccountCollection,
  ProviderAccountId,
  ProviderAccountMetadata,
  ProviderAccountsByProvider,
  ProviderId,
  ProviderSetting,
  ProviderSnapshot,
} from "../providers/types";
import {
  getSub2ApiHostOriginPattern,
  normalizeStoredSub2ApiConnection,
} from "../providers/sub2api/connection";
import {
  createDefaultApiGatewayMeteringDisplayPreferences,
  normalizeApiGatewayMeteringDisplayPreferences,
  normalizeApiGatewayMeteringSnapshot,
} from "./api-gateway-metering";

export const DEFAULT_PROVIDER_ACCOUNT_ID: ProviderAccountId = "default";

export type ProviderMultiAccountCapabilityResolver = (
  providerId: ProviderId,
) => boolean;

const defaultCapabilityResolver: ProviderMultiAccountCapabilityResolver = (
  providerId,
) => hasRegisteredProviderCapability(providerId, "multiAccount");

function getLastSuccessAt(snapshot: ProviderSnapshot): string | null {
  return snapshot.syncStatus === "ok" ? snapshot.syncedAt : null;
}

function createDefaultMetadata(
  snapshot: ProviderSnapshot,
): ProviderAccountMetadata {
  return {
    id: DEFAULT_PROVIDER_ACCOUNT_ID,
    label: "Default",
    createdAt: null,
    lastSuccessAt: getLastSuccessAt(snapshot),
    ...(snapshot.apiGatewayMetering
      ? {
          apiGatewayMeteringDisplayPreferences:
            createDefaultApiGatewayMeteringDisplayPreferences(),
        }
      : {}),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeAccountId(value: unknown): ProviderAccountId | null {
  if (value === DEFAULT_PROVIDER_ACCOUNT_ID) {
    return DEFAULT_PROVIDER_ACCOUNT_ID;
  }
  if (typeof value !== "string" || !/^account_[a-z0-9-]{8,80}$/i.test(value)) {
    return null;
  }
  return value;
}

function normalizeAccountLabel(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }
  const normalized = value.trim().replace(/\s+/g, " ").slice(0, 64);
  return normalized.length > 0 && !normalized.includes("@")
    ? normalized
    : fallback;
}

function normalizeTimestamp(value: unknown): string | null {
  return typeof value === "string" && Number.isFinite(Date.parse(value))
    ? value
    : null;
}

function normalizeMetadata(
  value: unknown,
  fallbackIndex: number,
): ProviderAccountMetadata | null {
  if (!isRecord(value)) {
    return null;
  }
  const id = normalizeAccountId(value.id);
  if (!id) {
    return null;
  }
  const apiGatewayMeteringDisplayPreferences =
    value.apiGatewayMeteringDisplayPreferences === undefined
      ? undefined
      : normalizeApiGatewayMeteringDisplayPreferences(
          value.apiGatewayMeteringDisplayPreferences,
        );
  const apiGatewayConnection = normalizeStoredSub2ApiConnection(
    value.apiGatewayConnection,
  );
  return {
    id,
    label: normalizeAccountLabel(value.label, `Account ${fallbackIndex + 1}`),
    createdAt: normalizeTimestamp(value.createdAt),
    lastSuccessAt: normalizeTimestamp(value.lastSuccessAt),
    ...(apiGatewayConnection ? { apiGatewayConnection } : {}),
    ...(apiGatewayMeteringDisplayPreferences
      ? { apiGatewayMeteringDisplayPreferences }
      : {}),
  };
}

function normalizeInactiveSnapshot(
  snapshot: ProviderSnapshot,
): ProviderSnapshot {
  const apiGatewayMetering = normalizeApiGatewayMeteringSnapshot(
    snapshot.apiGatewayMetering,
  );
  const {
    apiGatewayMetering: _apiGatewayMetering,
    ...snapshotWithoutGatewayMetering
  } = snapshot;
  return {
    ...snapshotWithoutGatewayMetering,
    ...(apiGatewayMetering ? { apiGatewayMetering } : {}),
  };
}

function isMatchingInactiveState(
  value: unknown,
  providerId: ProviderId,
): value is { snapshot: ProviderSnapshot; setting: ProviderSetting } {
  return (
    isRecord(value) &&
    isRecord(value.snapshot) &&
    value.snapshot.providerId === providerId &&
    isRecord(value.setting) &&
    value.setting.id === providerId
  );
}

function createSingleAccountCollection(
  snapshot: ProviderSnapshot,
): ProviderAccountCollection {
  return {
    activeAccountId: DEFAULT_PROVIDER_ACCOUNT_ID,
    accounts: [createDefaultMetadata(snapshot)],
    inactiveAccounts: {},
  };
}

function normalizeCapableCollection(
  value: unknown,
  providerId: ProviderId,
  snapshot: ProviderSnapshot,
): ProviderAccountCollection {
  if (!isRecord(value)) {
    return createSingleAccountCollection(snapshot);
  }

  const accounts = Array.isArray(value.accounts)
    ? value.accounts
        .map(normalizeMetadata)
        .filter((entry): entry is ProviderAccountMetadata => entry !== null)
    : [];
  const deduplicatedAccounts = Array.from(
    new Map(accounts.map((entry) => [entry.id, entry])).values(),
  );

  if (!deduplicatedAccounts.some((entry) => entry.id === DEFAULT_PROVIDER_ACCOUNT_ID)) {
    deduplicatedAccounts.unshift(createDefaultMetadata(snapshot));
  }

  const requestedActiveId = normalizeAccountId(value.activeAccountId);
  const activeAccountId = deduplicatedAccounts.some(
    (entry) => entry.id === requestedActiveId,
  )
    ? requestedActiveId!
    : DEFAULT_PROVIDER_ACCOUNT_ID;
  const inactiveSource = isRecord(value.inactiveAccounts)
    ? value.inactiveAccounts
    : {};
  const inactiveAccounts: ProviderAccountCollection["inactiveAccounts"] = {};

  for (const account of deduplicatedAccounts) {
    if (account.id === activeAccountId) {
      continue;
    }
    const storedState = inactiveSource[account.id];
    if (isMatchingInactiveState(storedState, providerId)) {
      inactiveAccounts[account.id] = {
        snapshot: normalizeInactiveSnapshot(storedState.snapshot),
        setting: structuredClone(storedState.setting),
      };
    }
  }

  // An account without isolated runtime data cannot be selected safely.
  const selectableAccounts = deduplicatedAccounts.filter(
    (account) =>
      account.id === activeAccountId || Boolean(inactiveAccounts[account.id]),
  );
  const activeMetadata = selectableAccounts.find(
    (account) => account.id === activeAccountId,
  );
  if (activeMetadata) {
    activeMetadata.lastSuccessAt = getLastSuccessAt(snapshot);
  }

  return {
    activeAccountId,
    accounts: selectableAccounts,
    inactiveAccounts,
  };
}

export function normalizeProviderAccounts(
  providers: readonly ProviderSnapshot[],
  storedAccounts: unknown,
  capabilityResolver: ProviderMultiAccountCapabilityResolver =
    defaultCapabilityResolver,
): ProviderAccountsByProvider {
  const source = isRecord(storedAccounts) ? storedAccounts : {};
  const result: ProviderAccountsByProvider = {};

  for (const snapshot of providers) {
    result[snapshot.providerId] = capabilityResolver(snapshot.providerId)
      ? normalizeCapableCollection(
          source[snapshot.providerId],
          snapshot.providerId,
          snapshot,
        )
      : createSingleAccountCollection(snapshot);
  }

  return result;
}

export function getActiveProviderAccountIds(
  state: Pick<AppState, "providers" | "providerAccounts">,
): Partial<Record<ProviderId, ProviderAccountId>> {
  const result: Partial<Record<ProviderId, ProviderAccountId>> = {};
  for (const provider of state.providers) {
    result[provider.providerId] =
      state.providerAccounts?.[provider.providerId]?.activeAccountId ??
      DEFAULT_PROVIDER_ACCOUNT_ID;
  }
  return result;
}

export function getActiveProviderAccountId(
  state: Pick<AppState, "providerAccounts">,
  providerId: ProviderId,
): ProviderAccountId {
  return (
    state.providerAccounts?.[providerId]?.activeAccountId ??
    DEFAULT_PROVIDER_ACCOUNT_ID
  );
}

export function createOpaqueProviderAccountId(
  randomUuid: () => string = () => globalThis.crypto.randomUUID(),
): ProviderAccountId {
  return `account_${randomUuid().toLowerCase()}`;
}

export function addInactiveProviderAccount(
  state: AppState,
  input: Readonly<{
    providerId: ProviderId;
    label: string;
    snapshot: ProviderSnapshot;
    setting: ProviderSetting;
    accountId?: ProviderAccountId;
    createdAt?: string;
    apiGatewayConnection?: ApiGatewayConnectionMetadata;
  }>,
  capabilityResolver: ProviderMultiAccountCapabilityResolver =
    defaultCapabilityResolver,
): AppState {
  if (!capabilityResolver(input.providerId)) {
    throw new Error(`${input.providerId} does not support multiple accounts`);
  }
  if (
    input.snapshot.providerId !== input.providerId ||
    input.setting.id !== input.providerId
  ) {
    throw new Error("Provider account runtime data crossed a source-entry boundary");
  }

  const providerAccounts = normalizeProviderAccounts(
    state.providers,
    state.providerAccounts,
    capabilityResolver,
  );
  const collection = providerAccounts[input.providerId];
  if (!collection) {
    throw new Error(`Missing provider account collection: ${input.providerId}`);
  }
  const accountId = normalizeAccountId(
    input.accountId ?? createOpaqueProviderAccountId(),
  );
  if (!accountId || accountId === DEFAULT_PROVIDER_ACCOUNT_ID) {
    throw new Error("A new provider account requires an opaque account ID");
  }
  if (collection.accounts.some((account) => account.id === accountId)) {
    throw new Error(`Duplicate provider account ID: ${accountId}`);
  }

  const normalizedConnection = input.apiGatewayConnection
    ? normalizeStoredSub2ApiConnection(input.apiGatewayConnection)
    : null;
  if (input.apiGatewayConnection && !normalizedConnection) {
    throw new Error("Invalid API gateway connection metadata");
  }
  collection.accounts.push({
    id: accountId,
    label: normalizeAccountLabel(input.label, "Account"),
    createdAt: normalizeTimestamp(input.createdAt ?? new Date().toISOString()),
    lastSuccessAt: getLastSuccessAt(input.snapshot),
    ...(normalizedConnection
      ? { apiGatewayConnection: normalizedConnection }
      : {}),
    ...(input.snapshot.apiGatewayMetering
      ? {
          apiGatewayMeteringDisplayPreferences:
            createDefaultApiGatewayMeteringDisplayPreferences(),
        }
      : {}),
  });
  collection.inactiveAccounts[accountId] = {
    snapshot: normalizeInactiveSnapshot(input.snapshot),
    setting: structuredClone(input.setting),
  };

  return { ...state, providerAccounts };
}

export function selectActiveProviderAccount(
  state: AppState,
  providerId: ProviderId,
  accountId: ProviderAccountId,
  capabilityResolver: ProviderMultiAccountCapabilityResolver =
    defaultCapabilityResolver,
): AppState {
  if (!capabilityResolver(providerId)) {
    throw new Error(`${providerId} does not support multiple accounts`);
  }

  const providerAccounts = normalizeProviderAccounts(
    state.providers,
    state.providerAccounts,
    capabilityResolver,
  );
  const collection = providerAccounts[providerId];
  if (!collection || collection.activeAccountId === accountId) {
    return { ...state, providerAccounts };
  }
  const nextRuntime = collection.inactiveAccounts[accountId];
  const currentSnapshot = state.providers.find(
    (provider) => provider.providerId === providerId,
  );
  const currentSetting = state.providerSettings.find(
    (setting) => setting.id === providerId,
  );
  if (!nextRuntime || !currentSnapshot || !currentSetting) {
    throw new Error(`Provider account is not selectable: ${providerId}/${accountId}`);
  }

  const previousActiveId = collection.activeAccountId;
  collection.inactiveAccounts[previousActiveId] = {
    snapshot: structuredClone(currentSnapshot),
    setting: structuredClone(currentSetting),
  };
  delete collection.inactiveAccounts[accountId];
  collection.activeAccountId = accountId;

  const previousMetadata = collection.accounts.find(
    (account) => account.id === previousActiveId,
  );
  if (previousMetadata) {
    previousMetadata.lastSuccessAt = getLastSuccessAt(currentSnapshot);
  }

  return {
    ...state,
    providers: state.providers.map((provider) =>
      provider.providerId === providerId
        ? structuredClone(nextRuntime.snapshot)
        : provider,
    ),
    providerSettings: state.providerSettings.map((setting) =>
      setting.id === providerId
        ? structuredClone(nextRuntime.setting)
        : setting,
    ),
    providerAccounts,
  };
}

export function getProviderAccountOptions(
  state: Pick<AppState, "providerAccounts">,
  providerId: ProviderId,
  capabilityResolver: ProviderMultiAccountCapabilityResolver =
    defaultCapabilityResolver,
): Readonly<{
  activeAccountId: ProviderAccountId;
  accounts: readonly ProviderAccountMetadata[];
}> | null {
  if (!capabilityResolver(providerId)) {
    return null;
  }
  const collection = state.providerAccounts?.[providerId];
  return collection && collection.accounts.length > 1
    ? {
        activeAccountId: collection.activeAccountId,
        accounts: collection.accounts,
      }
    : null;
}

export function getActiveProviderAccountMetadata(
  state: Pick<AppState, "providerAccounts">,
  providerId: ProviderId,
): ProviderAccountMetadata | null {
  const collection = state.providerAccounts?.[providerId];
  if (!collection) {
    return null;
  }
  return (
    collection.accounts.find(
      (account) => account.id === collection.activeAccountId,
    ) ?? null
  );
}

export function applyActiveProviderAccountConnections(
  providerSettings: readonly ProviderSetting[],
  providerAccounts: ProviderAccountsByProvider,
): ProviderSetting[] {
  return providerSettings.map((setting) => {
    if (setting.id !== "sub2api-api-key") {
      return setting;
    }
    const collection = providerAccounts[setting.id];
    const metadata = collection?.accounts.find(
      (account) => account.id === collection.activeAccountId,
    );
    const connection = metadata?.apiGatewayConnection;

    return connection
      ? {
          ...setting,
          hostsLabel: connection.baseUrl,
          hostOrigins: [getSub2ApiHostOriginPattern(connection)],
        }
      : {
          ...setting,
          status: "granted",
          hostsLabel: "No deployment configured",
          hostOrigins: [],
        };
  });
}

export function updateActiveProviderAccountConnection(
  state: AppState,
  providerId: ProviderId,
  connection: ApiGatewayConnectionMetadata | null,
  capabilityResolver: ProviderMultiAccountCapabilityResolver =
    defaultCapabilityResolver,
): AppState {
  if (!capabilityResolver(providerId)) {
    throw new Error(`${providerId} does not support account-scoped connections`);
  }
  const providerAccounts = normalizeProviderAccounts(
    state.providers,
    state.providerAccounts,
    capabilityResolver,
  );
  const collection = providerAccounts[providerId];
  const metadata = collection?.accounts.find(
    (account) => account.id === collection.activeAccountId,
  );
  if (!collection || !metadata) {
    throw new Error(`Missing active provider account: ${providerId}`);
  }
  const normalizedConnection = connection
    ? normalizeStoredSub2ApiConnection(connection)
    : null;
  if (connection && !normalizedConnection) {
    throw new Error("Invalid API gateway connection metadata");
  }
  const previousOrigin = metadata.apiGatewayConnection
    ? getSub2ApiHostOriginPattern(metadata.apiGatewayConnection)
    : null;
  const nextOrigin = normalizedConnection
    ? getSub2ApiHostOriginPattern(normalizedConnection)
    : null;
  if (normalizedConnection) {
    metadata.apiGatewayConnection = normalizedConnection;
  } else {
    delete metadata.apiGatewayConnection;
  }

  const providerSettings: ProviderSetting[] = state.providerSettings.map((setting) =>
    setting.id === providerId && previousOrigin !== nextOrigin
      ? {
          ...setting,
          status: normalizedConnection ? "missing" : "granted",
        }
      : setting,
  );

  return {
    ...state,
    providerAccounts,
    providerSettings: applyActiveProviderAccountConnections(
      providerSettings,
      providerAccounts,
    ),
  };
}
