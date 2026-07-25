import type { SourceAttemptFailure } from "../shared/source-selection";
import { shouldAttemptFallback } from "../shared/source-selection";
import {
  createSourceStrategyOrchestrator,
  type BrowserSourceStrategyKind,
  type SourceStrategyAttemptDiagnostic,
  type SourceStrategyOrchestratorOptions,
  type SourceStrategyRunStatus,
} from "./source-strategy-orchestrator";
import type {
  ProviderId,
  ProviderSetting,
  ProviderSnapshot,
  ProviderSourceKind,
  SyncTrigger,
} from "./types";

export type SuccessfulProviderSourceAttempt = Readonly<{
  ok: true;
  kind: ProviderSourceKind;
  snapshot: ProviderSnapshot;
  setting?: ProviderSetting;
}>;

export type FailedProviderSourceAttempt = Readonly<{
  ok: false;
  failure: SourceAttemptFailure;
  snapshot: ProviderSnapshot;
  setting?: ProviderSetting;
  disposition?: "unavailable" | "retryable_failure" | "terminal_failure";
  retryAfterMs?: number;
  cooldownMs?: number;
}>;

export type ProviderSourceAttempt =
  | SuccessfulProviderSourceAttempt
  | FailedProviderSourceAttempt;

type ProviderFailureContext = Readonly<{
  attempt: FailedProviderSourceAttempt;
}>;

export type ProviderSourceStrategyDefinition = Readonly<{
  id: string;
  kind: BrowserSourceStrategyKind;
  timeoutMs?: number;
  runAttempt: (signal: AbortSignal) => Promise<ProviderSourceAttempt>;
}>;

export type ProviderSourceStrategyResult = Readonly<{
  status: SourceStrategyRunStatus;
  attempt: ProviderSourceAttempt | null;
  failure: SourceAttemptFailure | null;
  attempts: readonly SourceStrategyAttemptDiagnostic[];
}>;

export type ProviderSourceStrategyRunner = Readonly<{
  run: (options: {
    sourceEntryId: ProviderId;
    trigger: SyncTrigger;
    strategies: readonly ProviderSourceStrategyDefinition[];
  }) => Promise<ProviderSourceStrategyResult>;
}>;

const AUTOMATIC_TIMEOUT_MS = 20_000;
const MANUAL_TIMEOUT_MS = 30_000;

function getProviderSourceKind(
  strategyKind: BrowserSourceStrategyKind | undefined,
): ProviderSourceKind {
  if (strategyKind === "official_api") {
    return "official_api";
  }

  if (strategyKind === "policy") {
    return "policy_only";
  }

  return "session_page";
}

function classifyFailure(
  attempt: FailedProviderSourceAttempt,
  trigger: SyncTrigger,
) {
  const failure = {
    code: attempt.failure.code,
    detail: attempt.failure.detail,
    context: { attempt },
  };

  if (attempt.disposition === "terminal_failure") {
    return {
      status: "terminal_failure" as const,
      failure,
      cooldownMs: attempt.cooldownMs,
    };
  }
  if (attempt.disposition === "retryable_failure") {
    return {
      status: "retryable_failure" as const,
      failure,
      retryAfterMs: attempt.retryAfterMs,
    };
  }
  if (attempt.disposition === "unavailable") {
    return { status: "unavailable" as const, failure };
  }

  if (!shouldAttemptFallback(attempt.failure)) {
    return {
      status: "terminal_failure" as const,
      failure,
      cooldownMs: 0,
    };
  }

  if (attempt.failure.code === "sync_error" && trigger !== "manual") {
    return {
      status: "retryable_failure" as const,
      failure,
    };
  }

  return {
    status: "unavailable" as const,
    failure,
  };
}

export function createProviderSourceStrategyRunner(
  options: SourceStrategyOrchestratorOptions = {},
): ProviderSourceStrategyRunner {
  const orchestrator = createSourceStrategyOrchestrator<
    SuccessfulProviderSourceAttempt,
    never,
    ProviderFailureContext
  >(options);

  return {
    async run({ sourceEntryId, trigger, strategies }) {
      const result = await orchestrator.run({
        sourceEntryId,
        previousValue: null,
        bypassCooldown: trigger === "manual",
        mergePartial() {
          throw new Error("Provider source strategies do not emit partial outcomes.");
        },
        strategies: strategies.map((strategy) => ({
          id: strategy.id,
          kind: strategy.kind,
          timeoutMs:
            strategy.timeoutMs ??
            (trigger === "manual" ? MANUAL_TIMEOUT_MS : AUTOMATIC_TIMEOUT_MS),
          async run({ signal }) {
            const attempt = await strategy.runAttempt(signal);
            return attempt.ok
              ? { status: "success" as const, value: attempt }
              : classifyFailure(attempt, trigger);
          },
        })),
      });
      const failedAttempt = result.failure?.context?.attempt ?? null;
      const lastAttempt = result.attempts.at(-1);
      const failedStrategy = lastAttempt
        ? strategies.find((strategy) => strategy.id === lastAttempt.strategyId)
        : strategies[0];
      const failure =
        failedAttempt?.failure ??
        (result.failure
          ? {
              kind: getProviderSourceKind(failedStrategy?.kind),
              code: "sync_error" as const,
              detail: result.failure.detail,
            }
          : null);

      return {
        status: result.status,
        attempt: result.value ?? failedAttempt,
        failure,
        attempts: result.attempts,
      };
    },
  };
}

export const providerSourceStrategyRunner =
  createProviderSourceStrategyRunner();
