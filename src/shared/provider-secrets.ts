import type {
  ApiKeyProviderId,
  LegacyProviderId,
  ProviderAccountId,
  ProviderId,
  ProviderSecrets,
} from "../providers/types";
import {
  PROVIDER_SECRETS_STORAGE_KEY,
  SAMPLE_PROVIDER_SECRETS,
} from "./constants";
import {
  getSafeLocalStorage,
  getSafeStorageItem,
  removeSafeStorageItem,
  setSafeStorageItem,
} from "./local-storage";
import { DEFAULT_PROVIDER_ACCOUNT_ID } from "./provider-accounts";

const PROVIDER_SECRETS_SCHEMA_VERSION = 2 as const;

type ProviderSecretProviderId = ApiKeyProviderId | "sub2api-api-key";

type ProviderSecretAccountMap = {
  [Provider in ProviderSecretProviderId]: Record<
    ProviderAccountId,
    ProviderSecrets[Provider]
  >;
};

type StoredProviderSecretsV2 = {
  schemaVersion: typeof PROVIDER_SECRETS_SCHEMA_VERSION;
  accounts: ProviderSecretAccountMap;
};

type LegacyStoredProviderSecrets = Partial<ProviderSecrets> &
  Partial<
    Record<
      LegacyProviderId,
      {
        adminApiKey?: unknown;
        analyticsApiKey?: unknown;
        workspaceId?: unknown;
      }
    >
  >;

type ActiveProviderAccountIds = Partial<
  Record<ProviderId, ProviderAccountId>
>;

let memoryFallbackStore: StoredProviderSecretsV2 | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cloneProviderSecrets(secrets: ProviderSecrets): ProviderSecrets {
  return structuredClone(secrets);
}

function cloneStoredProviderSecrets(
  store: StoredProviderSecretsV2,
): StoredProviderSecretsV2 {
  return structuredClone(store);
}

function normalizeApiKey(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function normalizeWorkspaceId(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function normalizeCursorSecret(value: unknown): ProviderSecrets["cursor-team-api"] {
  return {
    adminApiKey: normalizeApiKey(
      isRecord(value) ? value.adminApiKey : null,
    ),
  };
}

function normalizeClaudeSecret(
  value: unknown,
): ProviderSecrets["claude-code-admin-api"] {
  return {
    adminApiKey: normalizeApiKey(
      isRecord(value) ? value.adminApiKey : null,
    ),
  };
}

function normalizeCodexSecret(
  value: unknown,
): ProviderSecrets["codex-enterprise-api"] {
  return {
    analyticsApiKey: normalizeApiKey(
      isRecord(value) ? value.analyticsApiKey : null,
    ),
    workspaceId: normalizeWorkspaceId(
      isRecord(value) ? value.workspaceId : null,
    ),
  };
}

function normalizeSub2ApiSecret(
  value: unknown,
): ProviderSecrets["sub2api-api-key"] {
  return {
    apiKey: normalizeApiKey(isRecord(value) ? value.apiKey : null),
  };
}

function normalizeLegacyProviderSecrets(
  secrets: LegacyStoredProviderSecrets,
): ProviderSecrets {
  return {
    "cursor-team-api": normalizeCursorSecret(
      secrets["cursor-team-api"] ?? secrets.cursor,
    ),
    "claude-code-admin-api": normalizeClaudeSecret(
      secrets["claude-code-admin-api"] ?? secrets["claude-code"],
    ),
    "codex-enterprise-api": normalizeCodexSecret(
      secrets["codex-enterprise-api"] ?? secrets.codex,
    ),
    "sub2api-api-key": normalizeSub2ApiSecret(secrets["sub2api-api-key"]),
  };
}

function createEmptySecretStore(): StoredProviderSecretsV2 {
  return {
    schemaVersion: PROVIDER_SECRETS_SCHEMA_VERSION,
    accounts: {
      "cursor-team-api": {},
      "claude-code-admin-api": {},
      "codex-enterprise-api": {},
      "sub2api-api-key": {},
    },
  };
}

function createStoreFromLegacySecrets(
  secrets: LegacyStoredProviderSecrets,
): StoredProviderSecretsV2 {
  const normalized = normalizeLegacyProviderSecrets(secrets);
  return {
    schemaVersion: PROVIDER_SECRETS_SCHEMA_VERSION,
    accounts: {
      "cursor-team-api": {
        [DEFAULT_PROVIDER_ACCOUNT_ID]: normalized["cursor-team-api"],
      },
      "claude-code-admin-api": {
        [DEFAULT_PROVIDER_ACCOUNT_ID]: normalized["claude-code-admin-api"],
      },
      "codex-enterprise-api": {
        [DEFAULT_PROVIDER_ACCOUNT_ID]: normalized["codex-enterprise-api"],
      },
      "sub2api-api-key": {
        [DEFAULT_PROVIDER_ACCOUNT_ID]: normalized["sub2api-api-key"],
      },
    },
  };
}

function normalizeAccountMap<T>(
  value: unknown,
  normalize: (entry: unknown) => T,
): Record<ProviderAccountId, T> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(
        ([accountId]) =>
          accountId === DEFAULT_PROVIDER_ACCOUNT_ID ||
          /^account_[a-z0-9-]{8,80}$/i.test(accountId),
      )
      .map(([accountId, entry]) => [accountId, normalize(entry)]),
  );
}

function normalizeStoredProviderSecrets(value: unknown): {
  store: StoredProviderSecretsV2;
  migrated: boolean;
} {
  if (
    isRecord(value) &&
    value.schemaVersion === PROVIDER_SECRETS_SCHEMA_VERSION &&
    isRecord(value.accounts)
  ) {
    return {
      store: {
        schemaVersion: PROVIDER_SECRETS_SCHEMA_VERSION,
        accounts: {
          "cursor-team-api": normalizeAccountMap(
            value.accounts["cursor-team-api"],
            normalizeCursorSecret,
          ),
          "claude-code-admin-api": normalizeAccountMap(
            value.accounts["claude-code-admin-api"],
            normalizeClaudeSecret,
          ),
          "codex-enterprise-api": normalizeAccountMap(
            value.accounts["codex-enterprise-api"],
            normalizeCodexSecret,
          ),
          "sub2api-api-key": normalizeAccountMap(
            value.accounts["sub2api-api-key"],
            normalizeSub2ApiSecret,
          ),
        },
      },
      migrated: false,
    };
  }

  if (isRecord(value)) {
    return {
      store: createStoreFromLegacySecrets(value as LegacyStoredProviderSecrets),
      migrated: true,
    };
  }

  return { store: createEmptySecretStore(), migrated: false };
}

function hasChromeStorage(): boolean {
  return typeof chrome !== "undefined" && typeof chrome.storage?.local !== "undefined";
}

function readMemoryFallbackStore(): StoredProviderSecretsV2 | null {
  return memoryFallbackStore
    ? cloneStoredProviderSecrets(memoryFallbackStore)
    : null;
}

function readLocalStorageStore(storage: Storage): {
  store: StoredProviderSecretsV2;
  migrated: boolean;
} | null {
  const rawSecrets = getSafeStorageItem(storage, PROVIDER_SECRETS_STORAGE_KEY);

  if (!rawSecrets) {
    return null;
  }

  try {
    return normalizeStoredProviderSecrets(JSON.parse(rawSecrets) as unknown);
  } catch {
    removeSafeStorageItem(storage, PROVIDER_SECRETS_STORAGE_KEY);
    return null;
  }
}

function writeLocalStorageStore(
  storage: Storage,
  store: StoredProviderSecretsV2,
): boolean {
  return setSafeStorageItem(
    storage,
    PROVIDER_SECRETS_STORAGE_KEY,
    JSON.stringify(store),
  );
}

async function persistSecretStore(store: StoredProviderSecretsV2): Promise<void> {
  const normalized = normalizeStoredProviderSecrets(store).store;

  if (hasChromeStorage()) {
    await chrome.storage.local.set({
      [PROVIDER_SECRETS_STORAGE_KEY]: normalized,
    });
    return;
  }

  const localStorage = getSafeLocalStorage();
  if (localStorage && writeLocalStorageStore(localStorage, normalized)) {
    memoryFallbackStore = null;
  } else {
    memoryFallbackStore = normalized;
  }
}

async function readSecretStore(): Promise<StoredProviderSecretsV2> {
  if (hasChromeStorage()) {
    const stored = await chrome.storage.local.get(PROVIDER_SECRETS_STORAGE_KEY);
    const rawSecrets = stored[PROVIDER_SECRETS_STORAGE_KEY] as unknown;
    if (rawSecrets === undefined) {
      return createStoreFromLegacySecrets(SAMPLE_PROVIDER_SECRETS);
    }
    const normalized = normalizeStoredProviderSecrets(rawSecrets);
    if (normalized.migrated) {
      await persistSecretStore(normalized.store);
    }
    return normalized.store;
  }

  const localStorage = getSafeLocalStorage();
  if (localStorage) {
    const normalized = readLocalStorageStore(localStorage);
    if (normalized) {
      if (normalized.migrated) {
        await persistSecretStore(normalized.store);
      }
      return normalized.store;
    }
  }

  return (
    readMemoryFallbackStore() ??
    createStoreFromLegacySecrets(SAMPLE_PROVIDER_SECRETS)
  );
}

function getSelectedAccountId(
  accountIds: ActiveProviderAccountIds,
  providerId: ProviderSecretProviderId,
): ProviderAccountId {
  return accountIds[providerId] ?? DEFAULT_PROVIDER_ACCOUNT_ID;
}

function selectProviderSecrets(
  store: StoredProviderSecretsV2,
  accountIds: ActiveProviderAccountIds,
): ProviderSecrets {
  return {
    "cursor-team-api": normalizeCursorSecret(
      store.accounts["cursor-team-api"][
        getSelectedAccountId(accountIds, "cursor-team-api")
      ],
    ),
    "claude-code-admin-api": normalizeClaudeSecret(
      store.accounts["claude-code-admin-api"][
        getSelectedAccountId(accountIds, "claude-code-admin-api")
      ],
    ),
    "codex-enterprise-api": normalizeCodexSecret(
      store.accounts["codex-enterprise-api"][
        getSelectedAccountId(accountIds, "codex-enterprise-api")
      ],
    ),
    "sub2api-api-key": normalizeSub2ApiSecret(
      store.accounts["sub2api-api-key"][
        getSelectedAccountId(accountIds, "sub2api-api-key")
      ],
    ),
  };
}

export async function readProviderSecrets(
  accountIds: ActiveProviderAccountIds = {},
): Promise<ProviderSecrets> {
  return selectProviderSecrets(await readSecretStore(), accountIds);
}

export async function writeProviderSecrets(
  secrets: ProviderSecrets,
  accountIds: ActiveProviderAccountIds = {},
): Promise<ProviderSecrets> {
  const normalizedSecrets = cloneProviderSecrets({
    "cursor-team-api": normalizeCursorSecret(secrets["cursor-team-api"]),
    "claude-code-admin-api": normalizeClaudeSecret(
      secrets["claude-code-admin-api"],
    ),
    "codex-enterprise-api": normalizeCodexSecret(
      secrets["codex-enterprise-api"],
    ),
    "sub2api-api-key": normalizeSub2ApiSecret(secrets["sub2api-api-key"]),
  });
  const store = await readSecretStore();

  store.accounts["cursor-team-api"][
    getSelectedAccountId(accountIds, "cursor-team-api")
  ] = normalizedSecrets["cursor-team-api"];
  store.accounts["claude-code-admin-api"][
    getSelectedAccountId(accountIds, "claude-code-admin-api")
  ] = normalizedSecrets["claude-code-admin-api"];
  store.accounts["codex-enterprise-api"][
    getSelectedAccountId(accountIds, "codex-enterprise-api")
  ] = normalizedSecrets["codex-enterprise-api"];
  store.accounts["sub2api-api-key"][
    getSelectedAccountId(accountIds, "sub2api-api-key")
  ] = normalizedSecrets["sub2api-api-key"];

  await persistSecretStore(store);
  return normalizedSecrets;
}

export async function updateProviderSecrets(
  updater: (secrets: ProviderSecrets) => ProviderSecrets,
  accountIds: ActiveProviderAccountIds = {},
): Promise<ProviderSecrets> {
  const current = await readProviderSecrets(accountIds);
  const next = updater(cloneProviderSecrets(current));
  return writeProviderSecrets(next, accountIds);
}

export async function setProviderAdminApiKey(
  providerId: ApiKeyProviderId,
  apiKey: string | null,
  accountId: ProviderAccountId = DEFAULT_PROVIDER_ACCOUNT_ID,
): Promise<ProviderSecrets> {
  if (providerId === "codex-enterprise-api") {
    return readProviderSecrets({ [providerId]: accountId });
  }

  return updateProviderSecrets(
    (current) => ({
      ...current,
      [providerId]: {
        ...current[providerId],
        adminApiKey: normalizeApiKey(apiKey),
      },
    }),
    { [providerId]: accountId },
  );
}

export async function setSub2ApiKey(
  apiKey: string | null,
  accountId: ProviderAccountId = DEFAULT_PROVIDER_ACCOUNT_ID,
): Promise<ProviderSecrets> {
  return updateProviderSecrets(
    (current) => ({
      ...current,
      "sub2api-api-key": {
        apiKey: normalizeApiKey(apiKey),
      },
    }),
    { "sub2api-api-key": accountId },
  );
}

export async function setCodexWorkspaceConfig(
  analyticsApiKey: string | null,
  workspaceId: string | null,
  accountId: ProviderAccountId = DEFAULT_PROVIDER_ACCOUNT_ID,
): Promise<ProviderSecrets> {
  return updateProviderSecrets(
    (current) => ({
      ...current,
      "codex-enterprise-api": {
        ...current["codex-enterprise-api"],
        analyticsApiKey: normalizeApiKey(analyticsApiKey),
        workspaceId: normalizeWorkspaceId(workspaceId),
      },
    }),
    { "codex-enterprise-api": accountId },
  );
}
