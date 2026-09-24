import { PROVIDER_DIAGNOSTIC_CODE_CATEGORIES } from "../providers/diagnostics";
import { PROVIDER_IDS } from "../providers/provider-definitions";
import type {
  AppState,
  KnownProviderDiagnosticCode,
  ProviderDiagnostic,
  ProviderId,
  ProviderSetting,
  ProviderSnapshot,
} from "../providers/types";
import { normalizeSnapshotTimestamp } from "./snapshot-freshness";

export type DiagnosticsSourceState = Pick<
  AppState, "providers" | "providerSettings" | "providerAccounts"
>;

function enumValue<const T extends readonly string[]>(value: unknown, values: T): T[number] | null {
  return typeof value === "string" && values.includes(value) ? value : null;
}

function diagnosticCode(diagnostic: ProviderDiagnostic | null | undefined) {
  const code = diagnostic?.code;
  if (typeof code !== "string" || !Object.hasOwn(PROVIDER_DIAGNOSTIC_CODE_CATEGORIES, code)) return null;
  const knownCode = code as KnownProviderDiagnosticCode;
  return {
    code: knownCode,
    category: PROVIDER_DIAGNOSTIC_CODE_CATEGORIES[knownCode],
    severity: enumValue(diagnostic?.severity, ["info", "warning", "error"]),
  };
}

function projectAccount(
  providerId: ProviderId,
  index: number,
  active: boolean,
  setting: ProviderSetting | undefined,
  snapshot: ProviderSnapshot | undefined,
) {
  // Reject mismatched cache entries instead of exporting another account's state.
  const source = setting?.id === providerId ? setting : undefined;
  const data = snapshot?.providerId === providerId ? snapshot : undefined;
  return {
    account: `account-${index + 1}`,
    active,
    displayEnabled: typeof source?.displayEnabled === "boolean" ? source.displayEnabled : null,
    permissionStatus: enumValue(source?.status, ["granted", "missing"]),
    credentialStatus: enumValue(source?.credentialStatus, ["configured", "missing", "not_required"]),
    sourceKind: enumValue(source?.sourceKind, ["official_api", "session_page", "policy_only"]),
    sourcePreference: enumValue(source?.sourcePreference, ["auto", "official_api", "session_page"]),
    pageBindingStatus: enumValue(source?.pageBinding?.status, ["unbound", "bound", "stale"]),
    snapshotPresent: Boolean(data),
    syncSource: enumValue(data?.syncSource, ["official", "page_parse", "local_companion"]),
    syncStatus: enumValue(data?.syncStatus, ["ok", "warning", "error"]),
    lastAttemptAt: normalizeSnapshotTimestamp(data?.lastAttemptAt),
    lastSuccessAt: normalizeSnapshotTimestamp(data?.lastSuccessAt),
    diagnostics: [data?.warningDiagnostic, data?.sourceSelectionDiagnostic, data?.sourceFallbackDiagnostic]
      .map(diagnosticCode).filter((diagnostic) => diagnostic !== null),
  };
}

/** Build a fresh object field by field. Never clone stored objects into an export. */
export function createSanitizedDiagnostics(
  state: DiagnosticsSourceState,
  { appVersion, generatedAt = new Date() }: { appVersion: string; generatedAt?: Date },
) {
  const providers = PROVIDER_IDS.flatMap((providerId) => {
    const setting = state.providerSettings.find((entry) => entry.id === providerId);
    const snapshot = state.providers.find((entry) => entry.providerId === providerId);
    const collection = state.providerAccounts?.[providerId];
    if (!setting && !snapshot && !collection) return [];
    const seen = new Set<string>();
    const accounts = collection
      ? collection.accounts.flatMap((account) => {
          if (typeof account.id !== "string" || !account.id || seen.has(account.id)) return [];
          seen.add(account.id);
          const active = account.id === collection.activeAccountId;
          const cache = Object.hasOwn(collection.inactiveAccounts, account.id)
            ? collection.inactiveAccounts[account.id] : undefined;
          return [projectAccount(providerId, seen.size - 1, active,
            active ? setting : cache?.setting, active ? snapshot : cache?.snapshot)];
        })
      : [projectAccount(providerId, 0, true, setting, snapshot)];
    return [{ providerType: providerId, accounts }];
  });
  return {
    schemaVersion: 1 as const,
    appVersion: /^\d{1,4}\.\d{1,4}\.\d{1,4}(?:-(?:alpha|beta|rc|dev)\.\d{1,5})?$/.test(appVersion)
      ? appVersion : null,
    generatedAt: Number.isFinite(generatedAt.getTime()) ? generatedAt.toISOString() : null,
    providers,
  };
}

export type SanitizedDiagnosticsReport = ReturnType<typeof createSanitizedDiagnostics>;
