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

const providerRegistry: Record<ProviderId, MockProviderAdapter> = {
  cursor: {
    sync(provider, context) {
      return syncCursorProvider({
        provider,
        secrets: context.secrets,
        setting: context.setting,
        warningThresholdPercent: context.warningThresholdPercent,
        now: context.attemptedAt,
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
      });
    },
  },
};

export function getProviderSyncAdapter(providerId: ProviderId): MockProviderAdapter {
  return providerRegistry[providerId];
}
