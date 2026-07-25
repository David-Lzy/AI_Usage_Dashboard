import type { AppState, CredentialStatus, ProviderSecrets } from "../providers/types";
import { readProviderSecrets } from "../shared/provider-secrets";
import { getActiveProviderAccountIds } from "../shared/provider-accounts";
import { seedAppStateIfEmpty, writeAppState } from "../shared/storage";
import { readStoreScreenshotRuntimeLock } from "../shared/store-screenshot-runtime-lock";

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

export async function syncStoredProviderCredentials(): Promise<AppState> {
  const current = await seedAppStateIfEmpty();

  if (await readStoreScreenshotRuntimeLock()) {
    return current;
  }

  const secrets = await readProviderSecrets(getActiveProviderAccountIds(current));

  return writeAppState(
    reconcileProviderCredentials(current, secrets),
  );
}
