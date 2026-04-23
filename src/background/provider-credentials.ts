import type { AppState, CredentialStatus } from "../providers/types";
import { readProviderSecrets } from "../shared/provider-secrets";
import { seedAppStateIfEmpty, writeAppState } from "../shared/storage";
import { readStoreScreenshotRuntimeLock } from "../shared/store-screenshot-runtime-lock";

function getProviderCredentialStatus(
  providerId: AppState["providerSettings"][number]["id"],
  secrets: {
    cursor: { adminApiKey: string | null };
    "claude-code": { adminApiKey: string | null };
    codex: { analyticsApiKey: string | null; workspaceId: string | null };
  },
): CredentialStatus {
  if (providerId === "cursor" || providerId === "claude-code") {
    return secrets[providerId].adminApiKey ? "configured" : "missing";
  }

  if (providerId === "codex") {
    return secrets.codex.analyticsApiKey && secrets.codex.workspaceId
      ? "configured"
      : "missing";
  }

  return "not_required";
}

export function reconcileProviderCredentials(
  state: AppState,
  secrets: {
    cursor: { adminApiKey: string | null };
    "claude-code": { adminApiKey: string | null };
    codex: { analyticsApiKey: string | null; workspaceId: string | null };
  },
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

  const secrets = await readProviderSecrets();

  return writeAppState(
    reconcileProviderCredentials(current, secrets),
  );
}
