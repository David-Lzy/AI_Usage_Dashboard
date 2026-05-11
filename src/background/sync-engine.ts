import { createSyncStaleDiagnostic } from "../providers/diagnostics";
import { getProviderSyncAdapter } from "../providers/registry";
import type {
  AppState,
  ProviderId,
  ProviderSetting,
  ProviderSnapshot,
  SyncTrigger,
} from "../providers/types";
import { readProviderSecrets } from "../shared/provider-secrets";
import { seedAppStateIfEmpty, writeAppState } from "../shared/storage";

const STALE_MULTIPLIER = 2;
const MIN_STALE_MINUTES = 60;

type SyncEngineOutcome = {
  didSync: boolean;
  providerId: ProviderId;
  setting: ProviderSetting | null;
  snapshot: ProviderSnapshot;
  startedSetting: ProviderSetting | null;
};

function parseTimestamp(rawValue: string): Date | null {
  const normalizedValue = rawValue.includes("T")
    ? rawValue
    : rawValue.replace(" ", "T");
  const parsedValue = new Date(normalizedValue);

  return Number.isNaN(parsedValue.getTime()) ? null : parsedValue;
}

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
    startedSetting.enabled !== latestSetting.enabled ||
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
  const parsedTimestamp = parseTimestamp(provider.syncedAt);

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
      lastSyncLabel: `Last failed sync ${formatAge(ageMinutes)} ago`,
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

type RunSyncEngineParams = {
  trigger: SyncTrigger;
  providerId?: ProviderId;
};

export async function runSyncEngine({
  trigger,
  providerId,
}: RunSyncEngineParams): Promise<AppState> {
  const current = await seedAppStateIfEmpty();
  const secrets = await readProviderSecrets();
  const now = new Date();
  const providerSettings = new Map(
    current.providerSettings.map((provider) => [provider.id, provider]),
  );

  const outcomes = await Promise.all(
    current.providers.map(async (provider) => {
      const setting = providerSettings.get(provider.providerId);

      if (!setting) {
        return {
          didSync: false,
          providerId: provider.providerId,
          snapshot: provider,
          setting: null,
          startedSetting: null,
        };
      }

      const shouldSync = providerId
        ? provider.providerId === providerId
        : setting.enabled;

      if (!shouldSync) {
        return {
          didSync: false,
          providerId: provider.providerId,
          snapshot: provider,
          setting,
          startedSetting: setting,
        };
      }

      const adapter = getProviderSyncAdapter(provider.providerId);
      const outcome = await adapter.sync(provider, {
        attemptedAt: now,
        trigger,
        secrets,
        setting,
        warningThresholdPercent: current.settings.warningThresholdPercent,
      });

      return {
        didSync: true,
        providerId: provider.providerId,
        snapshot: outcome.snapshot,
        setting: outcome.setting ?? setting,
        startedSetting: setting,
      };
    }),
  );
  const latest = await seedAppStateIfEmpty();
  const latestProviderSettings = new Map<ProviderId, ProviderSetting>(
    latest.providerSettings.map((provider) => [provider.id, provider]),
  );
  const syncedOutcomes = new Map<ProviderId, SyncEngineOutcome>();

  for (const outcome of outcomes) {
    if (!outcome.didSync || !outcome.startedSetting) {
      continue;
    }

    const latestSetting = latestProviderSettings.get(outcome.providerId);

    if (
      !latestSetting ||
      hasSyncRelevantProviderSettingDrift(outcome.startedSetting, latestSetting)
    ) {
      continue;
    }

    syncedOutcomes.set(outcome.providerId, outcome);
  }

  const nextProviderSettings = new Map<ProviderId, ProviderSetting>(
    latest.providerSettings.map((provider) => [provider.id, provider]),
  );

  for (const outcome of syncedOutcomes.values()) {
    if (!outcome.setting) {
      continue;
    }

    const latestSetting = nextProviderSettings.get(outcome.providerId);

    if (!latestSetting) {
      nextProviderSettings.set(outcome.setting.id, outcome.setting);
      continue;
    }

    nextProviderSettings.set(outcome.providerId, {
      ...latestSetting,
      pageBinding: outcome.setting.pageBinding,
    });
  }

  const nextProviders = latest.providers.map(
    (provider) => syncedOutcomes.get(provider.providerId)?.snapshot ?? provider,
  );

  const nextState = reconcileAppStateHealth(
    {
      ...latest,
      providers: nextProviders,
      providerSettings: latest.providerSettings.map(
        (provider) => nextProviderSettings.get(provider.id) ?? provider,
      ),
    },
    now,
  );

  return writeAppState(nextState);
}
