import { getProviderSyncAdapter } from "../providers/registry";
import type { AppState, ProviderSetting, ProviderSnapshot } from "../providers/types";
import { getProviderAccountRuntime } from "../shared/provider-accounts";
import { readProviderSecrets } from "../shared/provider-secrets";
import { getAppStateReplacementGeneration, getProviderConnectionGeneration } from "../shared/provider-sync-identity";
import { hasCustomSourceHostAccess } from "../shared/custom-source-host-access";
import { seedAppStateIfEmpty, updateAppState } from "../shared/storage";
import { normalizeSnapshotTimestamp } from "../shared/snapshot-freshness";
import { runExplicitAccountAdapter } from "./sync-engine";

const PROVIDER_ID = "sub2api-api-key" as const;
type Runtime = NonNullable<ReturnType<typeof getProviderAccountRuntime>>;

function signature(runtime: Runtime | null): string | null {
  return runtime ? JSON.stringify([
    runtime.metadata.id, runtime.metadata.createdAt, runtime.metadata.apiGatewayConnection,
    runtime.setting.status, runtime.setting.credentialStatus, runtime.setting.sourcePreference,
    runtime.setting.hostOrigins, runtime.setting.pageBinding,
  ]) : null;
}

function mergeResult(state: AppState, accountId: string, snapshot: ProviderSnapshot, acquiredSetting: ProviderSetting): AppState {
  const target = getProviderAccountRuntime(state, PROVIDER_ID, accountId);
  if (!target) return state;
  const setting = {
    ...target.setting,
    status: acquiredSetting.status, credentialStatus: acquiredSetting.credentialStatus,
    hostsLabel: acquiredSetting.hostsLabel, hostOrigins: acquiredSetting.hostOrigins,
    pageBinding: acquiredSetting.pageBinding,
  };
  const collection = state.providerAccounts?.[PROVIDER_ID];
  if (!collection) return state;
  return {
    ...state,
    providers: target.active ? state.providers.map((entry) => entry.providerId === PROVIDER_ID ? snapshot : entry) : state.providers,
    providerSettings: target.active ? state.providerSettings.map((entry) => entry.id === PROVIDER_ID ? setting : entry) : state.providerSettings,
    providerAccounts: {
      ...state.providerAccounts,
      [PROVIDER_ID]: {
        ...collection,
        accounts: collection.accounts.map((account) => account.id === accountId
          ? { ...account, lastSuccessAt: normalizeSnapshotTimestamp(snapshot.lastSuccessAt) } : account),
        inactiveAccounts: target.active ? collection.inactiveAccounts : {
          ...collection.inactiveAccounts, [accountId]: { snapshot, setting },
        },
      },
    },
  };
}

export async function refreshSub2ApiAccount(accountId: string): Promise<AppState> {
  const started = await seedAppStateIfEmpty();
  const initial = getProviderAccountRuntime(started, PROVIDER_ID, accountId);
  if (!initial?.metadata.apiGatewayConnection) throw new Error("Missing deployment");
  const initialSignature = signature(initial);
  const replacement = getAppStateReplacementGeneration();
  const generation = getProviderConnectionGeneration(PROVIDER_ID);
  const isCurrent = (state: AppState) => replacement === getAppStateReplacementGeneration()
    && generation === getProviderConnectionGeneration(PROVIDER_ID)
    && signature(getProviderAccountRuntime(state, PROVIDER_ID, accountId)) === initialSignature;

  // Keep I/O and its merge in the provider queue; no network runs in the storage write queue.
  let resultState: AppState | undefined;
  await runExplicitAccountAdapter(PROVIDER_ID, accountId, async () => {
    const current = await seedAppStateIfEmpty();
    if (!isCurrent(current)) throw new Error("Deployment changed before refresh");
    const target = getProviderAccountRuntime(current, PROVIDER_ID, accountId)!;
    const origin = target.metadata.apiGatewayConnection!.baseUrl;
    const secrets = await readProviderSecrets({ [PROVIDER_ID]: accountId });
    const granted = await hasCustomSourceHostAccess(origin);
    if (!isCurrent(await seedAppStateIfEmpty())) throw new Error("Deployment changed during authorization");
    const setting: ProviderSetting = {
      ...target.setting, status: granted ? "granted" : "missing",
      credentialStatus: secrets[PROVIDER_ID].apiKey ? "configured" : "missing",
    };
    const outcome = await getProviderSyncAdapter(PROVIDER_ID).sync(target.snapshot, {
      accountId, accountMetadata: target.metadata, attemptedAt: new Date(),
      trigger: "manual", secrets, setting, warningThresholdPercent: current.settings.warningThresholdPercent,
    });
    if (granted && !await hasCustomSourceHostAccess(origin)) throw new Error("Deployment access revoked");
    let accepted = false;
    resultState = await updateAppState((latest) => {
      if (!isCurrent(latest) || outcome.snapshot.providerId !== PROVIDER_ID
        || (outcome.snapshot.apiGatewayMetering && (outcome.snapshot.apiGatewayMetering.accountId !== accountId
          || outcome.snapshot.apiGatewayMetering.origin !== origin))) return latest;
      accepted = true;
      return mergeResult(latest, accountId, outcome.snapshot, outcome.setting ?? setting);
    });
    if (!accepted) throw new Error("Deployment changed during refresh");
    return outcome;
  });
  return resultState!;
}
