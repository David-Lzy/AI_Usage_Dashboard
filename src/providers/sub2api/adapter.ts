import type {
  ProviderAccountId,
  ProviderAccountMetadata,
  ProviderSecrets,
  ProviderSetting,
  ProviderSnapshot,
  ProviderSyncOutcome,
  SyncTrigger,
} from "../types";
import {
  createAdapterErrorDiagnostic,
  createCredentialDiagnostic,
  createHostAccessDiagnostic,
  createSourceSelectionDiagnostic,
} from "../diagnostics";
import { formatSyncTimestamp } from "../normalize";
import {
  providerSourceStrategyRunner,
  type FailedProviderSourceAttempt,
  type ProviderSourceAttempt,
} from "../provider-source-strategy";
import {
  fetchSub2ApiUsage,
  Sub2ApiClientError,
  type Sub2ApiClientErrorCode,
} from "./client";

type Sub2ApiAdapterContext = Readonly<{
  provider: ProviderSnapshot;
  secrets: ProviderSecrets;
  setting: ProviderSetting;
  accountId: ProviderAccountId;
  accountMetadata: ProviderAccountMetadata | null;
  now: Date;
  trigger?: SyncTrigger;
}>;

function markMeteringStale(provider: ProviderSnapshot): ProviderSnapshot {
  return provider.apiGatewayMetering
    ? {
        ...provider,
        apiGatewayMetering: { ...provider.apiGatewayMetering, stale: true },
      }
    : provider;
}

function buildFailureSnapshot(
  provider: ProviderSnapshot,
  now: Date,
  warningReason: string,
  failureCode: string,
): ProviderSnapshot {
  return {
    ...markMeteringStale(provider),
    syncedAt: formatSyncTimestamp(now),
    syncSource: "official",
    syncStatus: "error",
    tone: "error",
    warningReason,
    warningDiagnostic: createAdapterErrorDiagnostic({
      providerId: provider.providerId,
      adapterErrorKind:
        failureCode === "invalid_response" ? "unsupported_response" : "unexpected_error",
      sourceKind: "official_api",
      failureCode,
      rawMessage: warningReason,
    }),
    lastSyncLabel: "Sub2API sync failed; cached data retained",
    sourceSelectionReason: "Official API selected.",
    sourceFallbackReason: null,
  };
}

function getFailureDisposition(error: Sub2ApiClientError): Pick<
  FailedProviderSourceAttempt,
  "disposition" | "retryAfterMs" | "cooldownMs"
> {
  if (error.code === "credential_rejected" || error.code === "access_forbidden") {
    return { disposition: "terminal_failure", cooldownMs: 5 * 60_000 };
  }
  if (error.code === "rate_limited") {
    return {
      disposition: "retryable_failure",
      ...(error.retryAfterMs !== null ? { retryAfterMs: error.retryAfterMs } : {}),
    };
  }
  if (error.code === "network_error" || error.code === "server_error") {
    return { disposition: "retryable_failure" };
  }
  if (error.code === "cancelled" || error.code === "timeout") {
    return { disposition: "unavailable" };
  }
  return { disposition: "terminal_failure", cooldownMs: 5 * 60_000 };
}

function getClientFailureMessage(code: Sub2ApiClientErrorCode): string {
  switch (code) {
    case "credential_rejected":
      return "The Sub2API deployment rejected the configured API key.";
    case "access_forbidden":
      return "The configured API key cannot read Sub2API usage.";
    case "rate_limited":
      return "The Sub2API deployment rate-limited the usage request.";
    case "server_error":
      return "The Sub2API deployment returned a temporary server error.";
    case "network_error":
      return "The Sub2API deployment could not be reached.";
    case "timeout":
      return "The Sub2API usage request timed out.";
    case "cancelled":
      return "The Sub2API usage request was cancelled.";
    case "redirect_rejected":
      return "The Sub2API usage endpoint attempted to cross the configured origin.";
    case "non_json_response":
      return "The Sub2API usage endpoint did not return JSON.";
    case "response_too_large":
      return "The Sub2API usage response exceeded the allowed size.";
    case "invalid_response":
      return "The Sub2API usage response did not match the supported contract.";
  }
}

async function trySub2ApiSource(
  context: Sub2ApiAdapterContext,
  signal: AbortSignal,
): Promise<ProviderSourceAttempt> {
  const { provider, setting, accountId, accountMetadata, now } = context;
  const connection = accountMetadata?.apiGatewayConnection;
  if (!connection) {
    const warningReason = "Connect a Sub2API deployment before refreshing usage.";
    return {
      ok: false,
      failure: {
        kind: "official_api",
        code: "credential_missing",
        detail: warningReason,
      },
      disposition: "terminal_failure",
      cooldownMs: 0,
      snapshot: {
        ...markMeteringStale(provider),
        syncedAt: formatSyncTimestamp(now),
        syncStatus: "warning",
        tone: "warning",
        warningReason,
        warningDiagnostic: createCredentialDiagnostic({
          providerId: provider.providerId,
          credentialKind: "admin_api_key",
          rawMessage: warningReason,
        }),
        lastSyncLabel: "Sub2API deployment not connected",
      },
    };
  }
  if (setting.status !== "granted") {
    const warningReason = "Grant access to the configured Sub2API origin.";
    return {
      ok: false,
      failure: {
        kind: "official_api",
        code: "host_access_missing",
        detail: warningReason,
      },
      disposition: "terminal_failure",
      cooldownMs: 0,
      snapshot: {
        ...markMeteringStale(provider),
        syncedAt: formatSyncTimestamp(now),
        syncStatus: "warning",
        tone: "warning",
        warningReason,
        warningDiagnostic: createHostAccessDiagnostic({
          providerId: provider.providerId,
          sourceKind: "official_api",
          hostLabel: connection.baseUrl,
          rawMessage: warningReason,
        }),
        lastSyncLabel: "Sub2API host access required",
      },
    };
  }
  const apiKey = context.secrets["sub2api-api-key"].apiKey;
  if (!apiKey) {
    const warningReason = "Add a Sub2API API key before refreshing usage.";
    return {
      ok: false,
      failure: {
        kind: "official_api",
        code: "credential_missing",
        detail: warningReason,
      },
      disposition: "terminal_failure",
      cooldownMs: 0,
      snapshot: {
        ...markMeteringStale(provider),
        syncedAt: formatSyncTimestamp(now),
        syncStatus: "warning",
        tone: "warning",
        warningReason,
        warningDiagnostic: createCredentialDiagnostic({
          providerId: provider.providerId,
          credentialKind: "admin_api_key",
          rawMessage: warningReason,
        }),
        lastSyncLabel: "Sub2API API key required",
      },
    };
  }

  try {
    const metering = await fetchSub2ApiUsage({
      accountId,
      connection,
      apiKey,
      trigger: context.trigger ?? "alarm",
      signal,
      now: () => now.getTime(),
    });
    const insecure = metering.transport === "http";
    const invalid = metering.isValid === false;
    const warningReason = insecure
      ? "This Sub2API connection uses HTTP; the API key is not protected by transport encryption."
      : invalid
        ? "The Sub2API deployment reports that this API key is not valid."
        : null;
    const sourceSelectionReason = "Official API selected.";
    return {
      ok: true,
      kind: "official_api",
      snapshot: {
        ...provider,
        providerLabel: "Sub2API",
        planName: metering.planName ?? connection.displayLabel,
        used: null,
        remaining: null,
        total: null,
        resetAt: "No single reset window",
        resetLabel: "API gateway metering uses source-defined limits",
        syncedAt: formatSyncTimestamp(now),
        syncSource: "official",
        syncStatus: warningReason ? "warning" : "ok",
        tone: warningReason ? "warning" : "neutral",
        warningReason,
        warningDiagnostic: warningReason
          ? createAdapterErrorDiagnostic({
              providerId: provider.providerId,
              adapterErrorKind: "unexpected_error",
              sourceKind: "official_api",
              failureCode: insecure ? "insecure_transport" : "invalid_api_key",
              rawMessage: warningReason,
            })
          : null,
        lastSyncLabel: "Sub2API usage synced just now",
        sourceSelectionReason,
        sourceSelectionDiagnostic: createSourceSelectionDiagnostic({
          providerId: provider.providerId,
          sourcePreference: "official_api",
          selectedKind: "official_api",
          hadFallback: false,
          rawMessage: sourceSelectionReason,
        }),
        sourceFallbackReason: null,
        sourceFallbackDiagnostic: null,
        apiGatewayMetering: metering,
      },
      setting: {
        ...setting,
        status: "granted",
        credentialStatus: "configured",
        hostsLabel: connection.baseUrl,
        hostOrigins: [connection.baseUrl],
      },
    };
  } catch (error) {
    const clientError =
      error instanceof Sub2ApiClientError
        ? error
        : new Sub2ApiClientError(
            "network_error",
            "The Sub2API usage request failed.",
          );
    const warningReason = getClientFailureMessage(clientError.code);
    return {
      ok: false,
      failure: {
        kind: "official_api",
        code: "sync_error",
        detail: warningReason,
      },
      ...getFailureDisposition(clientError),
      ...(clientError.code === "credential_rejected" ||
      clientError.code === "access_forbidden"
        ? {
            setting: {
              ...setting,
              credentialStatus: "missing" as const,
            },
          }
        : {}),
      snapshot: buildFailureSnapshot(
        provider,
        now,
        warningReason,
        clientError.code,
      ),
    };
  }
}

export async function syncSub2ApiProvider(
  context: Sub2ApiAdapterContext,
): Promise<ProviderSyncOutcome> {
  const result = await providerSourceStrategyRunner.run({
    sourceEntryId: context.provider.providerId,
    trigger: context.trigger ?? "alarm",
    strategies: [
      {
        id: "sub2api-api-key-usage",
        kind: "official_api",
        timeoutMs: context.trigger === "manual" ? 20_000 : 12_000,
        runAttempt: (signal) => trySub2ApiSource(context, signal),
      },
    ],
  });
  if (result.attempt) {
    return {
      snapshot: result.attempt.snapshot,
      ...(result.attempt.setting ? { setting: result.attempt.setting } : {}),
    };
  }
  const warningReason =
    result.failure?.detail ?? "Sub2API synchronization is temporarily unavailable.";
  return {
    snapshot: buildFailureSnapshot(
      context.provider,
      context.now,
      warningReason,
      result.status,
    ),
  };
}
