import type {
  ProviderBrandId,
  ProviderId,
  ProviderSecrets,
  ProviderSetting,
  ProviderSnapshot,
  ProviderSyncOutcome,
  SourceConnectionMode,
  SyncTrigger,
} from "./types";
import { syncClaudeCodeProvider } from "./claude-code/adapter";
import { syncCodexProvider } from "./codex/adapter";
import { syncCursorProvider } from "./cursor/adapter";
import { syncGeminiProvider } from "./gemini/adapter";
import { syncJetBrainsProvider } from "./jetbrains/adapter";
import {
  PROVIDER_DESCRIPTORS,
  PROVIDER_IDS,
  type ProviderCapabilityId,
  type ProviderDescriptor,
} from "./provider-definitions";

export type ProviderSyncContext = {
  attemptedAt: Date;
  trigger: SyncTrigger;
  secrets: ProviderSecrets;
  setting: ProviderSetting;
  warningThresholdPercent: number;
};

export type ProviderSyncAdapter = Readonly<{
  sync: (
    provider: ProviderSnapshot,
    context: ProviderSyncContext,
  ) => Promise<ProviderSyncOutcome>;
}>;

export type ProviderRegistryEntry = ProviderSyncAdapter &
  Readonly<{
    descriptor: ProviderDescriptor;
  }>;

function withFixedSourcePreference(
  descriptor: ProviderDescriptor,
  setting: ProviderSetting,
): ProviderSetting {
  return {
    ...setting,
    sourcePreference: descriptor.fixedSourcePreference,
  };
}

const PROVIDER_ADAPTERS_BY_OWNER: Readonly<
  Record<ProviderBrandId, ProviderSyncAdapter>
> = {
  cursor: {
    sync(provider, context) {
      return syncCursorProvider({
        provider,
        secrets: context.secrets,
        setting: context.setting,
        warningThresholdPercent: context.warningThresholdPercent,
        now: context.attemptedAt,
        trigger: context.trigger,
      });
    },
  },
  jetbrains: {
    sync(provider, context) {
      return syncJetBrainsProvider({
        provider,
        setting: context.setting,
        warningThresholdPercent: context.warningThresholdPercent,
        now: context.attemptedAt,
      });
    },
  },
  "claude-code": {
    sync(provider, context) {
      return syncClaudeCodeProvider({
        provider,
        secrets: context.secrets,
        setting: context.setting,
        warningThresholdPercent: context.warningThresholdPercent,
        now: context.attemptedAt,
        trigger: context.trigger,
      });
    },
  },
  gemini: {
    sync(provider, context) {
      return syncGeminiProvider({
        provider,
        setting: context.setting,
        warningThresholdPercent: context.warningThresholdPercent,
        now: context.attemptedAt,
      });
    },
  },
  codex: {
    sync(provider, context) {
      return syncCodexProvider({
        provider,
        secrets: context.secrets,
        setting: context.setting,
        warningThresholdPercent: context.warningThresholdPercent,
        now: context.attemptedAt,
        trigger: context.trigger,
      });
    },
  },
};

function assertMatchingSourceEntry(
  descriptor: ProviderDescriptor,
  provider: ProviderSnapshot,
  setting: ProviderSetting,
): void {
  if (provider.providerId !== descriptor.id || setting.id !== descriptor.id) {
    throw new Error(
      `Provider registry mismatch for ${descriptor.id}: snapshot=${provider.providerId}, setting=${setting.id}`,
    );
  }

  if (setting.brandId !== descriptor.brandId) {
    throw new Error(
      `Provider registry brand mismatch for ${descriptor.id}: expected=${descriptor.brandId}, setting=${setting.brandId}`,
    );
  }
}

export function buildProviderRegistry(
  descriptors: readonly ProviderDescriptor[] = PROVIDER_DESCRIPTORS,
): ReadonlyMap<ProviderId, ProviderRegistryEntry> {
  const expectedIds = new Set<ProviderId>(PROVIDER_IDS);
  const entries = new Map<ProviderId, ProviderRegistryEntry>();

  for (const descriptor of descriptors) {
    if (!expectedIds.has(descriptor.id)) {
      throw new Error(`Unexpected provider descriptor: ${descriptor.id}`);
    }
    if (entries.has(descriptor.id)) {
      throw new Error(`Duplicate provider descriptor: ${descriptor.id}`);
    }
    if (descriptor.runtime.syncAdapterOwner !== descriptor.brandId) {
      throw new Error(
        `Provider adapter owner mismatch for ${descriptor.id}: brand=${descriptor.brandId}, owner=${descriptor.runtime.syncAdapterOwner}`,
      );
    }

    const ownerAdapter = PROVIDER_ADAPTERS_BY_OWNER[
      descriptor.runtime.syncAdapterOwner
    ];
    if (!ownerAdapter) {
      throw new Error(
        `Missing provider adapter owner: ${descriptor.runtime.syncAdapterOwner}`,
      );
    }

    entries.set(descriptor.id, {
      descriptor,
      sync(provider, context) {
        assertMatchingSourceEntry(descriptor, provider, context.setting);
        return ownerAdapter.sync(provider, {
          ...context,
          setting: withFixedSourcePreference(descriptor, context.setting),
        });
      },
    });
  }

  const missingIds = PROVIDER_IDS.filter((providerId) => !entries.has(providerId));
  if (missingIds.length > 0) {
    throw new Error(`Missing provider descriptors: ${missingIds.join(", ")}`);
  }

  return entries;
}

const providerRegistry = buildProviderRegistry();

export function getProviderRegistryEntry(
  providerId: ProviderId,
): ProviderRegistryEntry {
  const entry = providerRegistry.get(providerId);
  if (!entry) {
    throw new Error(`Missing provider registry entry: ${providerId}`);
  }
  return entry;
}

export function getProviderSyncAdapter(providerId: ProviderId): ProviderSyncAdapter {
  return getProviderRegistryEntry(providerId);
}

export function getRegisteredProviderDescriptor(
  providerId: ProviderId,
): ProviderDescriptor {
  return getProviderRegistryEntry(providerId).descriptor;
}

export function getRegisteredProviderConnectionMode(
  providerId: ProviderId,
): SourceConnectionMode {
  return getRegisteredProviderDescriptor(providerId).connectionMode;
}

export function hasRegisteredProviderCapability(
  providerId: ProviderId,
  capability: ProviderCapabilityId,
): boolean {
  return getRegisteredProviderDescriptor(providerId).runtime.capabilities[
    capability
  ];
}
