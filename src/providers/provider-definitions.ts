import type {
  ApiKeyProviderId,
  CredentialProviderId,
  LegacyProviderId,
  ProviderBrandId,
  ProviderId,
  ProviderSourceKind,
  ProviderSourcePreference,
  SourceConnectionMode,
} from "./types";

export type ProviderAudience =
  | "personal"
  | "team-api"
  | "api-gateway"
  | "policy"
  | "deferred";

export const PROVIDER_CAPABILITY_IDS = [
  "quotaWindows",
  "balances",
  "aggregateHistory",
  "spending",
  "serviceStatus",
  "multiAccount",
] as const;

export type ProviderCapabilityId = (typeof PROVIDER_CAPABILITY_IDS)[number];

/** Static implementation support. This does not describe current snapshot data. */
export type ProviderCapabilitySet = Readonly<
  Record<ProviderCapabilityId, boolean>
>;

export type ProviderRuntimeDescriptor = Readonly<{
  syncAdapterOwner: ProviderBrandId;
  executionMode:
    | "shared_strategy"
    | "no_network_policy"
    | "no_network_deferred";
  capabilities: ProviderCapabilitySet;
}>;

export type ProviderDefinition = {
  id: ProviderId;
  brandId: ProviderBrandId;
  label: string;
  shortLabel: string;
  audience: ProviderAudience;
  sourceKind: ProviderSourceKind;
  connectionMode: SourceConnectionMode;
  fixedSourcePreference: ProviderSourcePreference;
  defaultDisplayEnabled: boolean;
  quickSetupDefaultVisible: boolean;
};

export type ProviderDescriptor = ProviderDefinition & {
  runtime: ProviderRuntimeDescriptor;
};

export const PROVIDER_DEFINITIONS: readonly ProviderDescriptor[] = [
  {
    id: "cursor-personal-page",
    brandId: "cursor",
    label: "Cursor Personal Usage Page",
    shortLabel: "Cursor",
    audience: "personal",
    sourceKind: "session_page",
    connectionMode: "page_session",
    fixedSourcePreference: "session_page",
    defaultDisplayEnabled: false,
    quickSetupDefaultVisible: true,
    runtime: {
      syncAdapterOwner: "cursor",
      executionMode: "shared_strategy",
      capabilities: {
        quotaWindows: true,
        balances: true,
        aggregateHistory: true,
        spending: true,
        serviceStatus: true,
        multiAccount: false,
      },
    },
  },
  {
    id: "cursor-team-api",
    brandId: "cursor",
    label: "Cursor Team Admin API",
    shortLabel: "Cursor Team API",
    audience: "team-api",
    sourceKind: "official_api",
    connectionMode: "credential",
    fixedSourcePreference: "official_api",
    defaultDisplayEnabled: false,
    quickSetupDefaultVisible: false,
    runtime: {
      syncAdapterOwner: "cursor",
      executionMode: "shared_strategy",
      capabilities: {
        quotaWindows: false,
        balances: false,
        aggregateHistory: false,
        spending: true,
        serviceStatus: true,
        multiAccount: false,
      },
    },
  },
  {
    id: "claude-code-team-page",
    brandId: "claude-code",
    label: "Claude Personal Usage Page",
    shortLabel: "Claude Personal",
    audience: "personal",
    sourceKind: "session_page",
    connectionMode: "page_session",
    fixedSourcePreference: "session_page",
    defaultDisplayEnabled: true,
    quickSetupDefaultVisible: true,
    runtime: {
      syncAdapterOwner: "claude-code",
      executionMode: "shared_strategy",
      capabilities: {
        quotaWindows: true,
        balances: false,
        aggregateHistory: false,
        spending: true,
        serviceStatus: true,
        multiAccount: false,
      },
    },
  },
  {
    id: "claude-code-admin-api",
    brandId: "claude-code",
    label: "Claude Code Analytics Admin API",
    shortLabel: "Claude Admin API",
    audience: "team-api",
    sourceKind: "official_api",
    connectionMode: "credential",
    fixedSourcePreference: "official_api",
    defaultDisplayEnabled: false,
    quickSetupDefaultVisible: false,
    runtime: {
      syncAdapterOwner: "claude-code",
      executionMode: "shared_strategy",
      capabilities: {
        quotaWindows: false,
        balances: false,
        aggregateHistory: false,
        spending: true,
        serviceStatus: true,
        multiAccount: false,
      },
    },
  },
  {
    id: "codex-personal-page",
    brandId: "codex",
    label: "Codex Personal Usage Page",
    shortLabel: "Codex",
    audience: "personal",
    sourceKind: "session_page",
    connectionMode: "page_session",
    fixedSourcePreference: "session_page",
    defaultDisplayEnabled: true,
    quickSetupDefaultVisible: true,
    runtime: {
      syncAdapterOwner: "codex",
      executionMode: "shared_strategy",
      capabilities: {
        quotaWindows: true,
        balances: true,
        aggregateHistory: true,
        spending: false,
        serviceStatus: true,
        multiAccount: false,
      },
    },
  },
  {
    id: "codex-enterprise-api",
    brandId: "codex",
    label: "Codex Enterprise Analytics API",
    shortLabel: "Codex Enterprise",
    audience: "team-api",
    sourceKind: "official_api",
    connectionMode: "credential",
    fixedSourcePreference: "official_api",
    defaultDisplayEnabled: false,
    quickSetupDefaultVisible: false,
    runtime: {
      syncAdapterOwner: "codex",
      executionMode: "shared_strategy",
      capabilities: {
        quotaWindows: false,
        balances: false,
        aggregateHistory: false,
        spending: false,
        serviceStatus: true,
        multiAccount: false,
      },
    },
  },
  {
    id: "sub2api-api-key",
    brandId: "sub2api",
    label: "Sub2API API Key Usage",
    shortLabel: "Sub2API",
    audience: "api-gateway",
    sourceKind: "official_api",
    connectionMode: "credential",
    fixedSourcePreference: "official_api",
    defaultDisplayEnabled: false,
    quickSetupDefaultVisible: false,
    runtime: {
      syncAdapterOwner: "sub2api",
      executionMode: "shared_strategy",
      capabilities: {
        quotaWindows: true,
        balances: true,
        aggregateHistory: true,
        spending: true,
        serviceStatus: false,
        multiAccount: true,
      },
    },
  },
  {
    id: "gemini-policy",
    brandId: "gemini",
    label: "Gemini Code Assist Policy",
    shortLabel: "Gemini Code Assist",
    audience: "policy",
    sourceKind: "policy_only",
    connectionMode: "none",
    fixedSourcePreference: "auto",
    defaultDisplayEnabled: false,
    quickSetupDefaultVisible: true,
    runtime: {
      syncAdapterOwner: "gemini",
      executionMode: "no_network_policy",
      capabilities: {
        quotaWindows: false,
        balances: false,
        aggregateHistory: false,
        spending: false,
        serviceStatus: false,
        multiAccount: false,
      },
    },
  },
  {
    id: "jetbrains-org-page",
    brandId: "jetbrains",
    label: "JetBrains Organization Usage Page",
    shortLabel: "JetBrains AI",
    audience: "deferred",
    sourceKind: "session_page",
    connectionMode: "page_session",
    fixedSourcePreference: "session_page",
    defaultDisplayEnabled: false,
    quickSetupDefaultVisible: false,
    runtime: {
      syncAdapterOwner: "jetbrains",
      executionMode: "no_network_deferred",
      capabilities: {
        quotaWindows: false,
        balances: false,
        aggregateHistory: false,
        spending: false,
        serviceStatus: false,
        multiAccount: false,
      },
    },
  },
] as const;

export const PROVIDER_DESCRIPTORS = PROVIDER_DEFINITIONS;

export const PROVIDER_IDS = PROVIDER_DEFINITIONS.map(
  (provider) => provider.id,
) as ProviderId[];

export const API_KEY_PROVIDER_IDS = PROVIDER_DEFINITIONS.filter(
  (provider): provider is ProviderDescriptor & { id: ApiKeyProviderId } =>
    provider.connectionMode === "credential" &&
    provider.id !== "sub2api-api-key",
).map((provider) => provider.id) as ApiKeyProviderId[];

export const CREDENTIAL_PROVIDER_IDS = PROVIDER_DEFINITIONS.filter(
  (provider): provider is ProviderDescriptor & { id: CredentialProviderId } =>
    provider.connectionMode === "credential",
).map((provider) => provider.id) as CredentialProviderId[];

export const LEGACY_PROVIDER_ID_MAP: Record<LegacyProviderId, ProviderId> = {
  cursor: "cursor-personal-page",
  jetbrains: "jetbrains-org-page",
  "claude-code": "claude-code-team-page",
  gemini: "gemini-policy",
  codex: "codex-personal-page",
};

const PROVIDER_DEFINITION_BY_ID = new Map<ProviderId, ProviderDescriptor>(
  PROVIDER_DEFINITIONS.map((provider) => [provider.id, provider] as const),
);

const LEGACY_PROVIDER_IDS = new Set<LegacyProviderId>([
  "cursor",
  "jetbrains",
  "claude-code",
  "gemini",
  "codex",
]);

export function isProviderId(value: unknown): value is ProviderId {
  return typeof value === "string" && PROVIDER_DEFINITION_BY_ID.has(value as ProviderId);
}

export function isLegacyProviderId(value: unknown): value is LegacyProviderId {
  return typeof value === "string" && LEGACY_PROVIDER_IDS.has(value as LegacyProviderId);
}

export function isApiKeyProviderId(value: unknown): value is ApiKeyProviderId {
  return typeof value === "string" && API_KEY_PROVIDER_IDS.includes(value as ApiKeyProviderId);
}

export function isCredentialProviderId(
  value: unknown,
): value is CredentialProviderId {
  return (
    typeof value === "string" &&
    CREDENTIAL_PROVIDER_IDS.includes(value as CredentialProviderId)
  );
}

export function getProviderDefinition(providerId: ProviderId): ProviderDefinition {
  return getProviderDescriptor(providerId);
}

export function getProviderDescriptor(providerId: ProviderId): ProviderDescriptor {
  const definition = PROVIDER_DEFINITION_BY_ID.get(providerId);
  if (!definition) {
    throw new Error(`Unknown provider id: ${providerId}`);
  }
  return definition;
}

export function hasProviderCapability(
  providerId: ProviderId,
  capability: ProviderCapabilityId,
): boolean {
  return getProviderDescriptor(providerId).runtime.capabilities[capability];
}

export function getProviderBrandId(providerId: ProviderId): ProviderBrandId {
  return getProviderDefinition(providerId).brandId;
}

export function getProviderSourcePreference(
  providerId: ProviderId,
): ProviderSourcePreference {
  return getProviderDefinition(providerId).fixedSourcePreference;
}

export function mapLegacyProviderId(providerId: LegacyProviderId): ProviderId {
  return LEGACY_PROVIDER_ID_MAP[providerId];
}

export function normalizeProviderId(value: unknown): ProviderId | null {
  if (isProviderId(value)) {
    return value;
  }
  if (isLegacyProviderId(value)) {
    return mapLegacyProviderId(value);
  }
  return null;
}
