import type { SourceAttemptFailure } from "../shared/source-selection";
import { shouldAttemptFallback } from "../shared/source-selection";
import {
  createSourceStrategyOrchestrator,
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

export type SuccessfulPersonalSourceAttempt = Readonly<{
  ok: true;
  kind: ProviderSourceKind;
  snapshot: ProviderSnapshot;
  setting?: ProviderSetting;
}>;

export type FailedPersonalSourceAttempt = Readonly<{
  ok: false;
  failure: SourceAttemptFailure;
  snapshot: ProviderSnapshot;
  setting?: ProviderSetting;
}>;

export type PersonalSourceAttempt =
  | SuccessfulPersonalSourceAttempt
  | FailedPersonalSourceAttempt;

type PersonalFailureContext = Readonly<{
  attempt: FailedPersonalSourceAttempt;
}>;

export type PersonalSourceStrategyResult = Readonly<{
  status: SourceStrategyRunStatus;
  attempt: PersonalSourceAttempt | null;
  failure: SourceAttemptFailure | null;
  attempts: readonly SourceStrategyAttemptDiagnostic[];
}>;

export type PersonalSourceStrategyRunner = Readonly<{
  run: (options: {
    sourceEntryId: ProviderId;
    trigger: SyncTrigger;
    strategyId: string;
    runAttempt: (signal: AbortSignal) => Promise<PersonalSourceAttempt>;
  }) => Promise<PersonalSourceStrategyResult>;
}>;

const AUTOMATIC_TIMEOUT_MS = 20_000;
const MANUAL_TIMEOUT_MS = 30_000;

function classifyFailure(
  attempt: FailedPersonalSourceAttempt,
  trigger: SyncTrigger,
) {
  const failure = {
    code: attempt.failure.code,
    detail: attempt.failure.detail,
    context: { attempt },
  };

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

export function createPersonalSourceStrategyRunner(
  options: SourceStrategyOrchestratorOptions = {},
): PersonalSourceStrategyRunner {
  const orchestrator = createSourceStrategyOrchestrator<
    SuccessfulPersonalSourceAttempt,
    never,
    PersonalFailureContext
  >(options);

  return {
    async run({ sourceEntryId, trigger, strategyId, runAttempt }) {
      const result = await orchestrator.run({
        sourceEntryId,
        previousValue: null,
        bypassCooldown: trigger === "manual",
        mergePartial() {
          throw new Error("Personal source strategies do not emit partial outcomes.");
        },
        strategies: [
          {
            id: strategyId,
            kind: "page_capture",
            timeoutMs:
              trigger === "manual" ? MANUAL_TIMEOUT_MS : AUTOMATIC_TIMEOUT_MS,
            async run({ signal }) {
              const attempt = await runAttempt(signal);
              return attempt.ok
                ? { status: "success", value: attempt }
                : classifyFailure(attempt, trigger);
            },
          },
        ],
      });
      const failedAttempt = result.failure?.context?.attempt ?? null;
      const failure = failedAttempt?.failure ??
        (result.failure
          ? {
              kind: "session_page" as const,
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

export const personalSourceStrategyRunner =
  createPersonalSourceStrategyRunner();
