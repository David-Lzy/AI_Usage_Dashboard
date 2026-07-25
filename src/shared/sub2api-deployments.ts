import type {
  ApiGatewayMeteringDisplayPreferences,
  AppState,
  ProviderAccountId,
  ProviderSetting,
  ProviderSnapshot,
} from "../providers/types";
import {
  normalizeSub2ApiConnection,
  type Sub2ApiConnectionIssueCode,
} from "../providers/sub2api/connection";
import { SAMPLE_APP_STATE } from "./constants";
import {
  addInactiveProviderAccount,
  createOpaqueProviderAccountId,
  getActiveProviderAccountId,
  normalizeProviderAccounts,
  removeProviderAccount,
  selectActiveProviderAccount,
  updateActiveProviderAccountConnection,
  updateProviderAccountMeteringDisplayPreferences,
} from "./provider-accounts";

export const SUB2API_PROVIDER_ID = "sub2api-api-key" as const;

export type Sub2ApiDeploymentDraft = Readonly<{
  accountId: ProviderAccountId | null;
  displayLabel: string;
  baseUrl: string;
  apiKey: string | null;
  insecureTransportAcknowledged: boolean;
}>;

export type SaveSub2ApiDeploymentResult =
  | Readonly<{
      ok: true;
      accountId: ProviderAccountId;
      state: AppState;
    }>
  | Readonly<{
      ok: false;
      code: Sub2ApiConnectionIssueCode | "missing_api_key" | "missing_account";
      message: string;
    }>;

function getBaselineRuntime(): {
  snapshot: ProviderSnapshot;
  setting: ProviderSetting;
} {
  const snapshot = SAMPLE_APP_STATE.providers.find(
    (provider) => provider.providerId === SUB2API_PROVIDER_ID,
  );
  const setting = SAMPLE_APP_STATE.providerSettings.find(
    (provider) => provider.id === SUB2API_PROVIDER_ID,
  );
  if (!snapshot || !setting) {
    throw new Error("Missing Sub2API baseline runtime");
  }
  return {
    snapshot: structuredClone(snapshot),
    setting: structuredClone(setting),
  };
}

function selectAccountIfNeeded(
  state: AppState,
  accountId: ProviderAccountId,
): AppState {
  return getActiveProviderAccountId(state, SUB2API_PROVIDER_ID) === accountId
    ? state
    : selectActiveProviderAccount(state, SUB2API_PROVIDER_ID, accountId);
}

export function saveSub2ApiDeployment(
  state: AppState,
  draft: Sub2ApiDeploymentDraft,
  options: Readonly<{
    createAccountId?: () => ProviderAccountId;
    now?: () => string;
  }> = {},
): SaveSub2ApiDeploymentResult {
  const connection = normalizeSub2ApiConnection(draft);
  if (!connection.ok) {
    return connection;
  }

  let nextState = state;
  let accountId = draft.accountId;
  if (accountId === null) {
    if (!draft.apiKey?.trim()) {
      return {
        ok: false,
        code: "missing_api_key",
        message: "A new deployment requires an API key.",
      };
    }
    accountId =
      options.createAccountId?.() ?? createOpaqueProviderAccountId();
    const baseline = getBaselineRuntime();
    nextState = addInactiveProviderAccount(nextState, {
      providerId: SUB2API_PROVIDER_ID,
      accountId,
      label: connection.value.displayLabel,
      snapshot: baseline.snapshot,
      setting: baseline.setting,
      createdAt: options.now?.() ?? new Date().toISOString(),
      apiGatewayConnection: connection.value,
    });
    nextState = selectActiveProviderAccount(
      nextState,
      SUB2API_PROVIDER_ID,
      accountId,
    );
  } else {
    const collection = normalizeProviderAccounts(
      state.providers,
      state.providerAccounts,
    )[SUB2API_PROVIDER_ID];
    if (!collection?.accounts.some((account) => account.id === accountId)) {
      return {
        ok: false,
        code: "missing_account",
        message: "The selected deployment no longer exists.",
      };
    }
    nextState = selectAccountIfNeeded(nextState, accountId);
    nextState = updateActiveProviderAccountConnection(
      nextState,
      SUB2API_PROVIDER_ID,
      connection.value,
    );
  }

  return { ok: true, accountId, state: nextState };
}

export function disconnectSub2ApiDeployment(
  state: AppState,
  accountId: ProviderAccountId,
  retainCachedSummary: boolean,
): AppState {
  let nextState = selectAccountIfNeeded(state, accountId);
  nextState = updateActiveProviderAccountConnection(
    nextState,
    SUB2API_PROVIDER_ID,
    null,
  );
  const baseline = getBaselineRuntime().snapshot;

  return {
    ...nextState,
    providers: nextState.providers.map((provider) => {
      if (provider.providerId !== SUB2API_PROVIDER_ID) {
        return provider;
      }
      if (retainCachedSummary && provider.apiGatewayMetering) {
        return {
          ...provider,
          apiGatewayMetering: {
            ...provider.apiGatewayMetering,
            stale: true,
          },
          syncStatus: "warning",
          tone: "warning",
          warningReason:
            "Deployment disconnected; cached nonsecret metering is retained.",
          lastSyncLabel: "Disconnected; cached metering retained",
        };
      }
      return {
        ...structuredClone(baseline),
        providerLabel: provider.providerLabel,
      };
    }),
  };
}

export function removeSub2ApiDeployment(
  state: AppState,
  accountId: ProviderAccountId,
): AppState {
  return removeProviderAccount(state, SUB2API_PROVIDER_ID, accountId);
}

export function setSub2ApiMeteringDisplayPreferences(
  state: AppState,
  accountId: ProviderAccountId,
  preferences: ApiGatewayMeteringDisplayPreferences,
): AppState {
  return updateProviderAccountMeteringDisplayPreferences(
    state,
    SUB2API_PROVIDER_ID,
    accountId,
    preferences,
  );
}
