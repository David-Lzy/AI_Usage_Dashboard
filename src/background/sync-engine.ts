import { createSyncStaleDiagnostic } from "../providers/diagnostics";
import { getProviderSyncAdapter } from "../providers/registry";
import type {
  AppState,
  AppSettings,
  ProviderAccountId,
  ProviderId,
  ProviderSetting,
  ProviderSnapshot,
  SyncTrigger,
} from "../providers/types";
import { hasCustomSourceHostAccess } from "../shared/custom-source-host-access";
import { mapWithConcurrency } from "../shared/async-concurrency";
import { readProviderSecrets } from "../shared/provider-secrets";
import {
  DEFAULT_PROVIDER_ACCOUNT_ID,
  getActiveProviderAccountId,
  getActiveProviderAccountIds,
  getActiveProviderAccountMetadata,
} from "../shared/provider-accounts";
import { seedAppStateIfEmpty, updateAppState } from "../shared/storage";
import {
  captureProviderSyncIdentity,
  getAppStateReplacementGeneration,
  isProviderSyncIdentityCurrent,
  type ProviderSyncIdentity,
} from "../shared/provider-sync-identity";
import { syncCustomSources } from "./custom-source-sync";
import {
  getCodexBarDashboardGeneration,
  syncCodexBarDashboardSources,
} from "./codexbar-dashboard-sync";
import { syncProviderServiceStatuses } from "./provider-service-status-sync";
import { mergeBackgroundSyncState } from "./background-state-merge";
import { normalizeSnapshotTimestamp } from "../shared/snapshot-freshness";
import { readLocalCompanionPairing } from "../shared/local-companion-pairing";
import { computeCodexAccountDigest } from "../shared/codex-local-bridge";
import { codexCredentialBroker } from "../providers/codex/session-credential-broker";
import { syncCodexLocalProvider } from "../providers/codex/local-companion-adapter";
import { DEFAULT_APP_STATE } from "../shared/constants";

const STALE_MULTIPLIER = 2;
const MIN_STALE_MINUTES = 60;
export const PROVIDER_SYNC_CONCURRENCY_LIMIT = 2;

type SyncEngineOutcome = {
  accountId: ProviderAccountId;
  didSync: boolean;
  providerId: ProviderId;
  setting: ProviderSetting | null;
  snapshot: ProviderSnapshot;
  startedSetting: ProviderSetting | null;
  identity: ProviderSyncIdentity | null;
};

type ProviderAdapterSyncResult = {
  setting?: ProviderSetting;
  snapshot: ProviderSnapshot;
};

export async function syncCodexBySelectedSource(
  provider: ProviderSnapshot,
  setting: ProviderSetting,
  current: AppState,
  accountId: ProviderAccountId,
  secrets: Awaited<ReturnType<typeof readProviderSecrets>>,
  trigger: SyncTrigger,
  now: Date,
): Promise<ProviderAdapterSyncResult> {
  const pairing = await readLocalCompanionPairing();
  if (!pairing || pairing.codexMode === "browser" || !pairing.codexMode) {
    return getProviderSyncAdapter(provider.providerId).sync(provider, {
      accountId, accountMetadata: getActiveProviderAccountMetadata(current, provider.providerId),
      attemptedAt: now, trigger, secrets, setting,
      warningThresholdPercent: current.settings.warningThresholdPercent,
    });
  }
  const local = await syncCodexLocalProvider(provider, pairing, now);
  if (pairing.codexMode !== "hybrid" || !local.accountDigest || local.snapshot.syncStatus !== "ok") {
    return { snapshot: local.snapshot, setting };
  }
  const beforeCredential = await codexCredentialBroker.peekCredential?.();
  const browserBaseline = DEFAULT_APP_STATE.providers.find((item) => item.providerId === provider.providerId)!;
  const browser = await getProviderSyncAdapter(provider.providerId).sync(browserBaseline, {
    accountId, accountMetadata: getActiveProviderAccountMetadata(current, provider.providerId),
    attemptedAt: now, trigger, secrets, setting,
    warningThresholdPercent: current.settings.warningThresholdPercent,
  });
  const afterCredential = await codexCredentialBroker.peekCredential?.();
  const matches = async (id: string | null | undefined) => id
    ? await computeCodexAccountDigest(pairing.token!, id) === local.accountDigest
    : false;
  const browserCapture = normalizeSnapshotTimestamp(browser.snapshot.lastSuccessAt);
  const sameAccount = await matches(afterCredential?.accountId) &&
    (!beforeCredential?.accountId || await matches(beforeCredential.accountId));
  const browserHistoryIsNew = browserCapture !== null && Date.parse(browserCapture) >= now.getTime() - 1000;
  return {
    setting,
    snapshot: {
      ...local.snapshot,
      usageHistory: sameAccount && browserHistoryIsNew && browser.snapshot.syncStatus === "ok"
        ? browser.snapshot.usageHistory : undefined,
    },
  };
}

type ActiveProviderAdapterRun = {
  promise: Promise<ProviderAdapterSyncResult>;
  trigger: SyncTrigger;
  identity: ProviderSyncIdentity;
};

function formatAge(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  if (minutes < 24 * 60) {
    return `${Math.floor(minutes / 60)}h`;
  }

  return `${Math.floor(minutes / (24 * 60))}d`;
}

function getPageBindingStateKey(
  binding: ProviderSetting["pageBinding"],
): string {
  return [
    binding.mode,
    binding.status,
    binding.tabId ?? "",
    binding.matchedUrl ?? "",
    binding.matchedTitle ?? "",
    binding.updatedAt ?? "",
  ].join("|");
}

export function hasSyncRelevantProviderSettingDrift(
  startedSetting: ProviderSetting,
  latestSetting: ProviderSetting,
): boolean {
  return (
    startedSetting.displayEnabled !== latestSetting.displayEnabled ||
    startedSetting.status !== latestSetting.status ||
    startedSetting.credentialStatus !== latestSetting.credentialStatus ||
    startedSetting.sourcePreference !== latestSetting.sourcePreference ||
    getPageBindingStateKey(startedSetting.pageBinding) !==
      getPageBindingStateKey(latestSetting.pageBinding)
  );
}

function markProviderStale(
  provider: ProviderSnapshot,
  syncIntervalMinutes: number,
  now: Date,
): ProviderSnapshot {
  const captureTime = normalizeSnapshotTimestamp(provider.lastSuccessAt);
  const parsedTimestamp = captureTime ? new Date(captureTime) : null;

  if (!parsedTimestamp) {
    return provider;
  }

  const ageMinutes = Math.max(
    0,
    Math.floor((now.getTime() - parsedTimestamp.getTime()) / 60000),
  );
  const staleAfterMinutes = Math.max(
    MIN_STALE_MINUTES,
    syncIntervalMinutes * STALE_MULTIPLIER,
  );

  if (ageMinutes < staleAfterMinutes) {
    return provider;
  }

  if (provider.syncStatus === "error") {
    const warningReason =
      provider.warningReason ??
      "Automatic sync is overdue; cached state may be stale.";
    const warningDiagnostic = provider.warningReason
      ? provider.warningDiagnostic
      : createSyncStaleDiagnostic({
          providerId: provider.providerId,
          syncStaleKind: "automatic_sync_overdue",
          rawMessage: warningReason,
          ageMinutes,
          staleAfterMinutes,
        });

    return {
      ...provider,
      lastSyncLabel: `Cached snapshot stale by ${formatAge(ageMinutes)}`,
      warningReason,
      ...(warningDiagnostic !== undefined ? { warningDiagnostic } : {}),
      tone: "error",
    };
  }

  const warningReason =
    provider.warningReason ?? "Automatic refresh is overdue; showing cached data.";
  const warningDiagnostic = provider.warningReason
    ? provider.warningDiagnostic
    : createSyncStaleDiagnostic({
        providerId: provider.providerId,
        syncStaleKind: "cached_state_stale",
        rawMessage: warningReason,
        ageMinutes,
        staleAfterMinutes,
      });

  return {
    ...provider,
    syncStatus: "warning",
    tone: "warning",
    lastSyncLabel: `Cached snapshot stale by ${formatAge(ageMinutes)}`,
    warningReason,
    ...(warningDiagnostic !== undefined ? { warningDiagnostic } : {}),
  };
}

export function reconcileAppStateHealth(
  state: AppState,
  now: Date = new Date(),
): AppState {
  return {
    ...state,
    providers: state.providers.map((provider) =>
      markProviderStale(provider, state.settings.syncIntervalMinutes, now),
    ),
  };
}

export function shouldReconcileHealthAfterSettingsUpdate(
  settings: Partial<AppSettings>,
): boolean {
  return typeof settings.syncIntervalMinutes === "number";
}

type RunSyncEngineParams = {
  trigger: SyncTrigger;
  providerId?: ProviderId;
};

const activeSyncEngineRuns = new Map<string, Promise<AppState>>();
const activeProviderAdapterRuns = new Map<
  ProviderId,
  ActiveProviderAdapterRun
>();
let explicitAccountRunGeneration = 0;
let activeAdapterCount = 0;
const adapterWaiters: (() => void)[] = [];

async function withProviderSyncSlot(run: () => Promise<ProviderAdapterSyncResult>): Promise<ProviderAdapterSyncResult> {
  if (activeAdapterCount >= PROVIDER_SYNC_CONCURRENCY_LIMIT) {
    await new Promise<void>((resolve) => adapterWaiters.push(resolve));
  } else activeAdapterCount += 1;
  try { return await run(); }
  finally {
    const next = adapterWaiters.shift();
    if (next) next();
    else activeAdapterCount -= 1;
  }
}

function trackProviderAdapterRun(
  providerId: ProviderId,
  trigger: SyncTrigger,
  identity: ProviderSyncIdentity,
  promise: Promise<ProviderAdapterSyncResult>,
): Promise<ProviderAdapterSyncResult> {
  const trackedRun = { promise, trigger, identity };
  activeProviderAdapterRuns.set(providerId, trackedRun);

  const cleanup = () => {
    if (activeProviderAdapterRuns.get(providerId) === trackedRun) {
      activeProviderAdapterRuns.delete(providerId);
    }
  };

  void promise.then(cleanup, cleanup);

  return promise;
}

function runProviderAdapterCoalesced({
  providerId,
  trigger,
  identity,
  run,
}: {
  providerId: ProviderId;
  trigger: SyncTrigger;
  identity: ProviderSyncIdentity;
  run: () => Promise<ProviderAdapterSyncResult>;
}): Promise<ProviderAdapterSyncResult> {
  const activeRun = activeProviderAdapterRuns.get(providerId);

  if (!activeRun) {
    return trackProviderAdapterRun(providerId, trigger, identity, withProviderSyncSlot(run));
  }

  if (
    activeRun.identity.generation !== identity.generation ||
    (trigger === "manual" && activeRun.trigger !== "manual")
  ) {
    const queuedManualRun = activeRun.promise.then(() => withProviderSyncSlot(run), () => withProviderSyncSlot(run));

    return trackProviderAdapterRun(providerId, trigger, identity, queuedManualRun);
  }

  return activeRun.promise;
}

/** Explicit account refresh shares the provider queue but never aliases an active-account request. */
export function runExplicitAccountAdapter(
  providerId: ProviderId,
  accountId: ProviderAccountId,
  run: () => Promise<ProviderAdapterSyncResult>,
): Promise<ProviderAdapterSyncResult> {
  return runProviderAdapterCoalesced({
    providerId, trigger: "manual",
    identity: { accountId, generation: --explicitAccountRunGeneration, signature: "explicit-account" },
    run,
  });
}

export function getSyncEngineCoalescingKey(
  { trigger, providerId }: RunSyncEngineParams,
  requestIdentities?: ReadonlyMap<ProviderId, ProviderSyncIdentity>,
): string {
  const scope = providerId
    ? `provider:${providerId}:${trigger === "manual" ? "manual" : "automatic"}`
    : `all-providers:${trigger}`;
  return requestIdentities
    ? `${scope}:${JSON.stringify(
        [...requestIdentities].map(([id, identity]) => [
          id, identity.accountId, identity.generation,
        ]),
      )}`
    : scope;
}

export async function runSyncEngine(params: RunSyncEngineParams): Promise<AppState> {
  const current = await seedAppStateIfEmpty();
  const requestIdentities = new Map<ProviderId, ProviderSyncIdentity>();
  for (const setting of current.providerSettings) {
    if (params.providerId ? setting.id === params.providerId : setting.displayEnabled) {
      requestIdentities.set(setting.id, captureProviderSyncIdentity(current, setting.id));
    }
  }
  const replacementGeneration = getAppStateReplacementGeneration();
  const coalescingKey = `${getSyncEngineCoalescingKey(params, requestIdentities)}:${replacementGeneration}:${getCodexBarDashboardGeneration()}`;

  const activeRun = activeSyncEngineRuns.get(coalescingKey);

  if (activeRun) {
    return activeRun;
  }

  const nextRun = runSyncEngineOnce(params, current, requestIdentities, replacementGeneration);
  activeSyncEngineRuns.set(coalescingKey, nextRun);

  void nextRun.then(
    () => {
      if (activeSyncEngineRuns.get(coalescingKey) === nextRun) {
        activeSyncEngineRuns.delete(coalescingKey);
      }
    },
    () => {
      if (activeSyncEngineRuns.get(coalescingKey) === nextRun) {
        activeSyncEngineRuns.delete(coalescingKey);
      }
    },
  );

  return nextRun;
}

async function runSyncEngineOnce(
  { trigger, providerId }: RunSyncEngineParams,
  current: AppState,
  requestIdentities: ReadonlyMap<ProviderId, ProviderSyncIdentity>,
  replacementGeneration: number,
): Promise<AppState> {
  const activeAccountIds = getActiveProviderAccountIds(current);
  const secrets = await readProviderSecrets(activeAccountIds);
  const now = new Date();
  const providerSettings = new Map(
    current.providerSettings.map((provider) => [provider.id, provider]),
  );

  await mapWithConcurrency(
    current.providers,
    PROVIDER_SYNC_CONCURRENCY_LIMIT,
    async (provider) => {
      const setting = providerSettings.get(provider.providerId);
      const accountId =
        activeAccountIds[provider.providerId] ?? DEFAULT_PROVIDER_ACCOUNT_ID;

      if (!setting) {
        return {
          accountId,
          didSync: false,
          providerId: provider.providerId,
          snapshot: provider,
          setting: null,
          startedSetting: null,
          identity: null,
        };
      }

      const shouldSync = providerId
        ? provider.providerId === providerId
        : setting.displayEnabled;

      if (!shouldSync) {
        return {
          accountId,
          didSync: false,
          providerId: provider.providerId,
          snapshot: provider,
          setting,
          startedSetting: setting,
          identity: null,
        };
      }

      const adapter = getProviderSyncAdapter(provider.providerId);
      const identity = requestIdentities.get(provider.providerId)!;
      const outcome = await runProviderAdapterCoalesced({
        providerId: provider.providerId,
        trigger,
        identity,
        run: () => provider.providerId === "codex-personal-page"
          ? syncCodexBySelectedSource(provider, setting, current, accountId, secrets, trigger, now)
          : adapter.sync(provider, {
            accountId,
            accountMetadata: getActiveProviderAccountMetadata(
              current,
              provider.providerId,
            ),
            attemptedAt: now,
            trigger,
            secrets,
            setting,
            warningThresholdPercent: current.settings.warningThresholdPercent,
          }),
      });

      const completed: SyncEngineOutcome = {
        accountId,
        didSync: true,
        providerId: provider.providerId,
        snapshot: outcome.snapshot,
        setting: outcome.setting ?? setting,
        startedSetting: setting,
        identity,
      };
      // Commit each provider promptly; a slow sibling must not replay an older result.
      await updateAppState((latest) => mergeProviderSyncOutcome(latest, completed, now));
      return completed;
    },
  );
  const before = await seedAppStateIfEmpty();
  if (providerId || replacementGeneration !== getAppStateReplacementGeneration()) {
    return before;
  }
  const bridgeGeneration = getCodexBarDashboardGeneration();
  const nextStateWithCodexBar = await syncCodexBarDashboardSources(before, {
        trigger,
        hasHostAccess: hasCustomSourceHostAccess,
        now,
      });
  const nextStateWithCustomSources = await syncCustomSources(nextStateWithCodexBar, {
        trigger,
        hasHostAccess: hasCustomSourceHostAccess,
        now,
      });
  const completed = await syncProviderServiceStatuses(nextStateWithCustomSources, { now });

  return updateAppState((latest) =>
    replacementGeneration === getAppStateReplacementGeneration()
      ? mergeBackgroundSyncState(before, completed, latest, {
          allowManagedSources: bridgeGeneration === getCodexBarDashboardGeneration(),
        })
      : latest,
  );
}

function mergeProviderSyncOutcome(
  latest: AppState,
  outcome: SyncEngineOutcome,
  now: Date,
): AppState {
  const setting = latest.providerSettings.find((entry) => entry.id === outcome.providerId);
  if (
    !setting || !outcome.startedSetting || !outcome.setting || !outcome.identity ||
    !isProviderSyncIdentityCurrent(latest, outcome.providerId, outcome.identity) ||
    getActiveProviderAccountId(latest, outcome.providerId) !== outcome.accountId ||
    hasSyncRelevantProviderSettingDrift(outcome.startedSetting, setting)
  ) return latest;

  const resultSetting = outcome.setting;
  return {
    ...latest,
    providers: latest.providers.map((provider) => provider.providerId === outcome.providerId
      ? markProviderStale(outcome.snapshot, latest.settings.syncIntervalMinutes, now)
      : provider),
    providerSettings: latest.providerSettings.map((entry) => entry.id === outcome.providerId
      ? {
          ...entry,
          status: resultSetting.status,
          credentialStatus: resultSetting.credentialStatus,
          hostsLabel: resultSetting.hostsLabel,
          hostOrigins: resultSetting.hostOrigins,
          pageBinding: resultSetting.pageBinding,
        }
      : entry),
  };
}
