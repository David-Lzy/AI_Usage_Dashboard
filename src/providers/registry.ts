import type {
  ProviderId,
  ProviderSyncOutcome,
  ProviderSecrets,
  ProviderSetting,
  ProviderSnapshot,
  SyncTrigger,
} from "./types";
import { syncClaudeCodeProvider } from "./claude-code/adapter";
import { syncCodexProvider } from "./codex/adapter";
import { syncCursorProvider } from "./cursor/adapter";
import { syncGeminiProvider } from "./gemini/adapter";
import { syncJetBrainsProvider } from "./jetbrains/adapter";
import { getProviderSourcePreference } from "./provider-definitions";

type ProviderSyncContext = {
  attemptedAt: Date;
  trigger: SyncTrigger;
  secrets: ProviderSecrets;
  setting: ProviderSetting;
  warningThresholdPercent: number;
};

type MockProviderAdapter = {
  sync: (
    provider: ProviderSnapshot,
    context: ProviderSyncContext,
  ) => Promise<ProviderSyncOutcome>;
};

function withFixedSourcePreference(setting: ProviderSetting): ProviderSetting {
  return {
    ...setting,
    sourcePreference: getProviderSourcePreference(setting.id),
  };
}

const providerRegistry: Record<ProviderId, MockProviderAdapter> = {
  "cursor-personal-page": {
    sync(provider, context) {
      return syncCursorProvider({
        provider,
        secrets: context.secrets,
        setting: withFixedSourcePreference(context.setting),
        warningThresholdPercent: context.warningThresholdPercent,
        now: context.attemptedAt,
        trigger: context.trigger,
      });
    },
  },
  "cursor-team-api": {
    sync(provider, context) {
      return syncCursorProvider({
        provider,
        secrets: context.secrets,
        setting: withFixedSourcePreference(context.setting),
        warningThresholdPercent: context.warningThresholdPercent,
        now: context.attemptedAt,
        trigger: context.trigger,
      });
    },
  },
  "jetbrains-org-page": {
    sync(provider, context) {
      return syncJetBrainsProvider({
        provider,
        setting: withFixedSourcePreference(context.setting),
        warningThresholdPercent: context.warningThresholdPercent,
        now: context.attemptedAt,
      });
    },
  },
  "claude-code-team-page": {
    sync(provider, context) {
      return syncClaudeCodeProvider({
        provider,
        secrets: context.secrets,
        setting: withFixedSourcePreference(context.setting),
        warningThresholdPercent: context.warningThresholdPercent,
        now: context.attemptedAt,
        trigger: context.trigger,
      });
    },
  },
  "claude-code-admin-api": {
    sync(provider, context) {
      return syncClaudeCodeProvider({
        provider,
        secrets: context.secrets,
        setting: withFixedSourcePreference(context.setting),
        warningThresholdPercent: context.warningThresholdPercent,
        now: context.attemptedAt,
        trigger: context.trigger,
      });
    },
  },
  "gemini-policy": {
    sync(provider, context) {
      return syncGeminiProvider({
        provider,
        setting: withFixedSourcePreference(context.setting),
        warningThresholdPercent: context.warningThresholdPercent,
        now: context.attemptedAt,
      });
    },
  },
  "codex-personal-page": {
    sync(provider, context) {
      return syncCodexProvider({
        provider,
        secrets: context.secrets,
        setting: withFixedSourcePreference(context.setting),
        warningThresholdPercent: context.warningThresholdPercent,
        now: context.attemptedAt,
        trigger: context.trigger,
      });
    },
  },
  "codex-enterprise-api": {
    sync(provider, context) {
      return syncCodexProvider({
        provider,
        secrets: context.secrets,
        setting: withFixedSourcePreference(context.setting),
        warningThresholdPercent: context.warningThresholdPercent,
        now: context.attemptedAt,
        trigger: context.trigger,
      });
    },
  },
};

export function getProviderSyncAdapter(providerId: ProviderId): MockProviderAdapter {
  return providerRegistry[providerId];
}
