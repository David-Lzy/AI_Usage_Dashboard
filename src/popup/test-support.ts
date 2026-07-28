import type {
  ApiGatewayMeteringSnapshot,
  AppState,
  PopupProviderAccountPresentationMode,
  ProviderAccountId,
  ProviderSnapshot,
} from "../providers/types";
import { SAMPLE_APP_STATE } from "../shared/constants";

const SUB2API_PROVIDER_ID = "sub2api-api-key" as const;

function createMeteringSnapshot(
  accountId: ProviderAccountId,
  displayLabel: string,
  remainingAmount: number,
): ApiGatewayMeteringSnapshot {
  return {
    schemaVersion: 1,
    accountId,
    productKind: "metered_api_gateway",
    displayLabel,
    origin: `https://${displayLabel.toLowerCase()}.example.test`,
    transport: "https",
    scope: "api_key",
    billingMode: "wallet",
    capturedAt: "2026-07-28T08:00:00.000Z",
    stale: false,
    isValid: true,
    status: "active",
    planName: null,
    remaining: { amount: remainingAmount, unit: "USD" },
    balance: { amount: remainingAmount, unit: "USD" },
    quota: null,
    subscription: null,
    rateLimits: [],
    usage: null,
    dailyUsage: [],
    modelUsage: [],
    modelSeriesTruncated: false,
  };
}

function withMetering(
  snapshot: ProviderSnapshot,
  accountId: ProviderAccountId,
  displayLabel: string,
  remainingAmount: number,
): ProviderSnapshot {
  return {
    ...structuredClone(snapshot),
    apiGatewayMetering: createMeteringSnapshot(
      accountId,
      displayLabel,
      remainingAmount,
    ),
    planName: displayLabel,
    syncStatus: "ok",
    tone: "neutral",
    warningReason: null,
    warningDiagnostic: null,
    lastSyncLabel: "Synced just now",
  };
}

export function createMultiDeploymentSub2ApiState(
  mode: PopupProviderAccountPresentationMode,
): AppState {
  const baseSnapshot = SAMPLE_APP_STATE.providers.find(
    ({ providerId }) => providerId === SUB2API_PROVIDER_ID,
  );
  const baseSetting = SAMPLE_APP_STATE.providerSettings.find(
    ({ id }) => id === SUB2API_PROVIDER_ID,
  );
  if (!baseSnapshot || !baseSetting) {
    throw new Error("Missing Sub2API sample runtime");
  }

  const alphaId = "account_alpha123";
  const betaId = "account_beta1234";
  const activeSnapshot = withMetering(baseSnapshot, alphaId, "Alpha", 18);
  const inactiveSnapshot = withMetering(baseSnapshot, betaId, "Beta", 42);
  const enabledSetting = {
    ...structuredClone(baseSetting),
    displayEnabled: true,
    status: "granted" as const,
    credentialStatus: "configured" as const,
  };

  return {
    ...structuredClone(SAMPLE_APP_STATE),
    providers: SAMPLE_APP_STATE.providers.map((provider) =>
      provider.providerId === SUB2API_PROVIDER_ID
        ? activeSnapshot
        : structuredClone(provider),
    ),
    providerSettings: SAMPLE_APP_STATE.providerSettings.map((setting) =>
      setting.id === SUB2API_PROVIDER_ID
        ? enabledSetting
        : structuredClone(setting),
    ),
    providerAccounts: {
      ...structuredClone(SAMPLE_APP_STATE.providerAccounts),
      [SUB2API_PROVIDER_ID]: {
        activeAccountId: alphaId,
        accounts: [
          {
            id: alphaId,
            label: "Alpha",
            createdAt: null,
            lastSuccessAt: activeSnapshot.syncedAt,
          },
          {
            id: betaId,
            label: "Beta",
            createdAt: null,
            lastSuccessAt: inactiveSnapshot.syncedAt,
          },
        ],
        inactiveAccounts: {
          [betaId]: {
            snapshot: inactiveSnapshot,
            setting: structuredClone(enabledSetting),
          },
        },
      },
    },
    settings: {
      ...structuredClone(SAMPLE_APP_STATE.settings),
      popupProviderAccountPresentationByProvider: {
        ...SAMPLE_APP_STATE.settings
          .popupProviderAccountPresentationByProvider,
        [SUB2API_PROVIDER_ID]: mode,
      },
    },
  };
}
