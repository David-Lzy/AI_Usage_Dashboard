import type {
  ApiKeyProviderId,
  LegacyProviderId,
  ProviderBrandId,
  ProviderId,
  ProviderSourceKind,
  ProviderSourcePreference,
  SourceConnectionMode,
} from "./types";

export type ProviderAudience = "personal" | "team-api" | "policy" | "deferred";

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

export const PROVIDER_DEFINITIONS: readonly ProviderDefinition[] = [
  {
    id: "cursor-personal-page",
    brandId: "cursor",
    label: "Cursor Personal Usage Page",
    shortLabel: "Cursor",
    audience: "personal",
    sourceKind: "session_page",
    connectionMode: "page_session",
    fixedSourcePreference: "session_page",
    defaultDisplayEnabled: true,
    quickSetupDefaultVisible: true,
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
  },
  {
    id: "claude-code-team-page",
    brandId: "claude-code",
    label: "Claude Team Usage Page",
    shortLabel: "Claude Team",
    audience: "personal",
    sourceKind: "session_page",
    connectionMode: "page_session",
    fixedSourcePreference: "session_page",
    defaultDisplayEnabled: true,
    quickSetupDefaultVisible: true,
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
    defaultDisplayEnabled: true,
    quickSetupDefaultVisible: true,
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
  },
] as const;

export const PROVIDER_IDS = PROVIDER_DEFINITIONS.map(
  (provider) => provider.id,
) as ProviderId[];

export const API_KEY_PROVIDER_IDS = PROVIDER_DEFINITIONS.filter(
  (provider): provider is ProviderDefinition & { id: ApiKeyProviderId } =>
    provider.connectionMode === "credential",
).map((provider) => provider.id) as ApiKeyProviderId[];

export const LEGACY_PROVIDER_ID_MAP: Record<LegacyProviderId, ProviderId> = {
  cursor: "cursor-personal-page",
  jetbrains: "jetbrains-org-page",
  "claude-code": "claude-code-team-page",
  gemini: "gemini-policy",
  codex: "codex-personal-page",
};

const PROVIDER_DEFINITION_BY_ID = new Map(
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

export function getProviderDefinition(providerId: ProviderId): ProviderDefinition {
  const definition = PROVIDER_DEFINITION_BY_ID.get(providerId);
  if (!definition) {
    throw new Error(`Unknown provider id: ${providerId}`);
  }
  return definition;
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
