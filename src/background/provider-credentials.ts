import type { AppState, CredentialStatus, ProviderSecrets } from "../providers/types";
import { readProviderSecrets } from "../shared/provider-secrets";
import { getActiveProviderAccountIds } from "../shared/provider-accounts";
import { seedAppStateIfEmpty, updateAppState } from "../shared/storage";
import { readStoreScreenshotRuntimeLock } from "../shared/store-screenshot-runtime-lock";
import {
  captureProviderSyncIdentity,
  isProviderSyncIdentityCurrent,
  type ProviderSyncIdentity,
} from "../shared/provider-sync-identity";

function getProviderCredentialStatus(
  providerId: AppState["providerSettings"][number]["id"],
  secrets: ProviderSecrets,
): CredentialStatus {
  if (providerId === "cursor-team-api" || providerId === "claude-code-admin-api") {
    return secrets[providerId].adminApiKey ? "configured" : "missing";
  }

  if (providerId === "codex-enterprise-api") {
    return secrets["codex-enterprise-api"].analyticsApiKey &&
      secrets["codex-enterprise-api"].workspaceId
      ? "configured"
      : "missing";
  }

  if (providerId === "sub2api-api-key") {
    return secrets[providerId].apiKey ? "configured" : "missing";
  }

  return "not_required";
}

export function reconcileProviderCredentials(
  state: AppState,
  secrets: ProviderSecrets,
): AppState {
  return {
    ...state,
    providerSettings: state.providerSettings.map((provider) => ({
      ...provider,
      credentialStatus: getProviderCredentialStatus(provider.id, secrets),
    })),
  };
}

type CredentialCheck = {
  providerId: AppState["providerSettings"][number]["id"];
  identity: ProviderSyncIdentity;
  status: CredentialStatus;
};

function applyCredentialChecks(
  state: AppState,
  checks: readonly CredentialCheck[],
): AppState {
  const checksByProviderId = new Map(
    checks.map((check) => [check.providerId, check]),
  );
  let changed = false;
  const providerSettings = state.providerSettings.map((provider) => {
    const check = checksByProviderId.get(provider.id);

    if (
      !check ||
      provider.credentialStatus === check.status ||
      !isProviderSyncIdentityCurrent(state, provider.id, check.identity)
    ) {
      return provider;
    }

    changed = true;
    return { ...provider, credentialStatus: check.status };
  });

  return changed ? { ...state, providerSettings } : state;
}

export async function syncStoredProviderCredentials(): Promise<AppState> {
  const current = await seedAppStateIfEmpty();

  if (await readStoreScreenshotRuntimeLock()) {
    return current;
  }

  const activeAccountIds = getActiveProviderAccountIds(current);
  const checks = current.providerSettings.map((provider) => ({
    providerId: provider.id,
    identity: captureProviderSyncIdentity(current, provider.id),
  }));
  const secrets = await readProviderSecrets(activeAccountIds);

  return updateAppState((latest) =>
    applyCredentialChecks(
      latest,
      checks.map((check) => ({
        ...check,
        status: getProviderCredentialStatus(check.providerId, secrets),
      })),
    ),
  );
}
