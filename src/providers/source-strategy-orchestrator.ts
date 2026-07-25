import type { ProviderId } from "./types";

export type BrowserSourceStrategyKind =
  | "official_api"
  | "session_api"
  | "observed_response"
  | "page_capture"
  | "policy";

export type SourceStrategyFailure<TContext = never> = Readonly<{
  code: string;
  detail: string;
  context?: TContext;
}>;

export type SourceStrategyAttemptOutcome<
  TValue,
  TPartial,
  TFailureContext = never,
> =
  | Readonly<{ status: "success"; value: TValue }>
  | Readonly<{ status: "partial"; value: TPartial }>
  | Readonly<{
      status: "unavailable";
      failure: SourceStrategyFailure<TFailureContext>;
    }>
  | Readonly<{
      status: "retryable_failure";
      failure: SourceStrategyFailure<TFailureContext>;
      retryAfterMs?: number;
    }>
  | Readonly<{
      status: "terminal_failure";
      failure: SourceStrategyFailure<TFailureContext>;
      cooldownMs?: number;
    }>;

export type SourceStrategy<TValue, TPartial, TFailureContext = never> = Readonly<{
  id: string;
  kind: BrowserSourceStrategyKind;
  timeoutMs?: number;
  run: (context: {
    signal: AbortSignal;
  }) => Promise<
    SourceStrategyAttemptOutcome<TValue, TPartial, TFailureContext>
  >;
}>;

export type SourceStrategyAttemptDiagnostic = Readonly<{
  strategyId: string;
  kind: BrowserSourceStrategyKind;
  outcome:
    | SourceStrategyAttemptOutcome<unknown, unknown>["status"]
    | "cooldown_skipped"
    | "timeout"
    | "cancelled";
  failureCode: string | null;
  durationMs: number;
  cooldownUntil: number | null;
}>;

export type SourceStrategyRunStatus =
  | "success"
  | "partial"
  | "unavailable"
  | "retryable_failure"
  | "terminal_failure"
  | "cooldown"
  | "cancelled";

export type SourceStrategyRunResult<TValue, TFailureContext = never> = Readonly<{
  status: SourceStrategyRunStatus;
  value: TValue | null;
  selectedStrategyId: string | null;
  failure: SourceStrategyFailure<TFailureContext> | null;
  attempts: readonly SourceStrategyAttemptDiagnostic[];
}>;

export type SourceStrategyRunOptions<
  TValue,
  TPartial,
  TFailureContext = never,
> = Readonly<{
  sourceEntryId: ProviderId;
  strategies: readonly SourceStrategy<TValue, TPartial, TFailureContext>[];
  previousValue: TValue | null;
  mergePartial: (previous: TValue | null, partial: TPartial) => TValue;
  bypassCooldown?: boolean;
  signal?: AbortSignal;
}>;

export type SourceStrategyDebugSnapshot = Readonly<{
  runsStarted: number;
  coalescedRuns: number;
  attemptsStarted: number;
  attemptsTimedOut: number;
  attemptsCancelled: number;
  cooldownSkips: number;
  activeSourceEntries: readonly ProviderId[];
  cooldownCount: number;
}>;

export type SourceStrategyOrchestratorOptions = Readonly<{
  defaultTimeoutMs?: number;
  retryBackoffMs?: readonly number[];
  terminalCooldownMs?: number;
  now?: () => number;
}>;

export type SourceStrategyOrchestrator<
  TValue,
  TPartial,
  TFailureContext = never,
> = Readonly<{
  run: (
    options: SourceStrategyRunOptions<TValue, TPartial, TFailureContext>,
  ) => Promise<SourceStrategyRunResult<TValue, TFailureContext>>;
  getDebugSnapshot: () => SourceStrategyDebugSnapshot;
}>;

type RetryCooldown<TFailureContext> = {
  failureCount: number;
  failure: SourceStrategyFailure<TFailureContext>;
  until: number;
};

type TerminalCooldown<TFailureContext> = {
  failure: SourceStrategyFailure<TFailureContext>;
  until: number;
};

type AttemptExecution<TValue, TPartial, TFailureContext> =
  | {
      kind: "outcome";
      outcome: SourceStrategyAttemptOutcome<
        TValue,
        TPartial,
        TFailureContext
      >;
    }
  | { kind: "timeout" }
  | { kind: "cancelled" };

const DEFAULT_TIMEOUT_MS = 12_000;
const DEFAULT_RETRY_BACKOFF_MS = [60_000, 5 * 60_000, 15 * 60_000] as const;
const DEFAULT_TERMINAL_COOLDOWN_MS = 5 * 60_000;
const MAX_TIMEOUT_MS = 60_000;

function clampDelay(value: number, fallback: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : fallback;
}

function buildCooldownKey(sourceEntryId: ProviderId, strategyId: string): string {
  return `${sourceEntryId}:${strategyId}`;
}

function assertUniqueStrategies<TValue, TPartial, TFailureContext>(
  strategies: readonly SourceStrategy<TValue, TPartial, TFailureContext>[],
): void {
  const ids = new Set<string>();
  for (const strategy of strategies) {
    if (!strategy.id.trim()) {
      throw new Error("Source strategy ids must be non-empty.");
    }
    if (ids.has(strategy.id)) {
      throw new Error(`Duplicate source strategy id: ${strategy.id}`);
    }
    ids.add(strategy.id);
  }
}

export function createSourceStrategyOrchestrator<
  TValue,
  TPartial,
  TFailureContext = never,
>(
  options: SourceStrategyOrchestratorOptions = {},
): SourceStrategyOrchestrator<TValue, TPartial, TFailureContext> {
  const defaultTimeoutMs = Math.min(
    MAX_TIMEOUT_MS,
    Math.max(1, options.defaultTimeoutMs ?? DEFAULT_TIMEOUT_MS),
  );
  const retryBackoffMs =
    options.retryBackoffMs && options.retryBackoffMs.length > 0
      ? options.retryBackoffMs.map((delay) => clampDelay(delay, 0))
      : [...DEFAULT_RETRY_BACKOFF_MS];
  const terminalCooldownMs = clampDelay(
    options.terminalCooldownMs ?? DEFAULT_TERMINAL_COOLDOWN_MS,
    DEFAULT_TERMINAL_COOLDOWN_MS,
  );
  const now = options.now ?? Date.now;
  const activeRuns = new Map<
    ProviderId,
    Promise<SourceStrategyRunResult<TValue, TFailureContext>>
  >();
  const retryCooldowns = new Map<string, RetryCooldown<TFailureContext>>();
  const terminalCooldowns = new Map<
    ProviderId,
    TerminalCooldown<TFailureContext>
  >();
  const counters = {
    runsStarted: 0,
    coalescedRuns: 0,
    attemptsStarted: 0,
    attemptsTimedOut: 0,
    attemptsCancelled: 0,
    cooldownSkips: 0,
  };

  async function executeAttempt(
    strategy: SourceStrategy<TValue, TPartial, TFailureContext>,
    parentSignal: AbortSignal | undefined,
  ): Promise<AttemptExecution<TValue, TPartial, TFailureContext>> {
    if (parentSignal?.aborted) {
      return { kind: "cancelled" };
    }

    const controller = new AbortController();
    const timeoutMs = Math.min(
      MAX_TIMEOUT_MS,
      Math.max(1, strategy.timeoutMs ?? defaultTimeoutMs),
    );
    let timeoutId: ReturnType<typeof globalThis.setTimeout> | null = null;
    let removeParentAbortListener = () => {};

    const interruption = new Promise<
      AttemptExecution<TValue, TPartial, TFailureContext>
    >(
      (resolve) => {
        const cancel = () => {
          controller.abort();
          resolve({ kind: "cancelled" });
        };

        if (parentSignal) {
          parentSignal.addEventListener("abort", cancel, { once: true });
          removeParentAbortListener = () =>
            parentSignal.removeEventListener("abort", cancel);
          if (parentSignal.aborted) {
            cancel();
          }
        }

        timeoutId = globalThis.setTimeout(() => {
          controller.abort();
          resolve({ kind: "timeout" });
        }, timeoutMs);
      },
    );

    const attempt = Promise.resolve()
      .then(() => strategy.run({ signal: controller.signal }))
      .then<AttemptExecution<TValue, TPartial, TFailureContext>>((outcome) => ({
        kind: "outcome",
        outcome,
      }))
      .catch<AttemptExecution<TValue, TPartial, TFailureContext>>(() => ({
        kind: "outcome",
        outcome: {
          status: "retryable_failure",
          failure: {
            code: "unexpected_error",
            detail: "Source strategy failed unexpectedly.",
          },
        },
      }));

    try {
      return await Promise.race([attempt, interruption]);
    } finally {
      if (timeoutId !== null) {
        globalThis.clearTimeout(timeoutId);
      }
      removeParentAbortListener();
    }
  }

  async function executeRun(
    runOptions: SourceStrategyRunOptions<
      TValue,
      TPartial,
      TFailureContext
    >,
  ): Promise<SourceStrategyRunResult<TValue, TFailureContext>> {
    assertUniqueStrategies(runOptions.strategies);
    const attempts: SourceStrategyAttemptDiagnostic[] = [];
    const startedAt = now();

    if (runOptions.strategies.length === 0) {
      return {
        status: "unavailable",
        value: runOptions.previousValue,
        selectedStrategyId: null,
        failure: {
          code: "no_strategy",
          detail: "No source strategy is configured for this source entry.",
        },
        attempts,
      };
    }

    const terminalCooldown = terminalCooldowns.get(runOptions.sourceEntryId);

    if (terminalCooldown && terminalCooldown.until <= startedAt) {
      terminalCooldowns.delete(runOptions.sourceEntryId);
    }

    if (
      !runOptions.bypassCooldown &&
      terminalCooldown &&
      terminalCooldown.until > startedAt
    ) {
      counters.cooldownSkips += 1;
      return {
        status: "cooldown",
        value: runOptions.previousValue,
        selectedStrategyId: null,
        failure: terminalCooldown.failure,
        attempts,
      };
    }

    let finalStatus: SourceStrategyRunStatus = "unavailable";
    let finalFailure: SourceStrategyFailure<TFailureContext> | null = null;
    let attemptedStrategy = false;

    for (const strategy of runOptions.strategies) {
      if (runOptions.signal?.aborted) {
        counters.attemptsCancelled += 1;
        return {
          status: "cancelled",
          value: runOptions.previousValue,
          selectedStrategyId: null,
          failure: { code: "cancelled", detail: "Source strategy was cancelled." },
          attempts,
        };
      }

      const cooldownKey = buildCooldownKey(
        runOptions.sourceEntryId,
        strategy.id,
      );
      const retryCooldown = retryCooldowns.get(cooldownKey);
      if (
        !runOptions.bypassCooldown &&
        retryCooldown &&
        retryCooldown.until > now()
      ) {
        counters.cooldownSkips += 1;
        attempts.push({
          strategyId: strategy.id,
          kind: strategy.kind,
          outcome: "cooldown_skipped",
          failureCode: retryCooldown.failure.code,
          durationMs: 0,
          cooldownUntil: retryCooldown.until,
        });
        finalStatus = "cooldown";
        finalFailure = retryCooldown.failure;
        continue;
      }

      attemptedStrategy = true;
      counters.attemptsStarted += 1;
      const attemptStartedAt = now();
      const execution = await executeAttempt(strategy, runOptions.signal);
      const durationMs = Math.max(0, now() - attemptStartedAt);

      if (execution.kind === "cancelled") {
        counters.attemptsCancelled += 1;
        attempts.push({
          strategyId: strategy.id,
          kind: strategy.kind,
          outcome: "cancelled",
          failureCode: "cancelled",
          durationMs,
          cooldownUntil: null,
        });
        return {
          status: "cancelled",
          value: runOptions.previousValue,
          selectedStrategyId: null,
          failure: { code: "cancelled", detail: "Source strategy was cancelled." },
          attempts,
        };
      }

      if (execution.kind === "timeout") {
        counters.attemptsTimedOut += 1;
        const failureCount = (retryCooldown?.failureCount ?? 0) + 1;
        const delay = retryBackoffMs[
          Math.min(failureCount - 1, retryBackoffMs.length - 1)
        ]!;
        const cooldownUntil = now() + delay;
        const failure = {
          code: "timeout",
          detail: "Source strategy timed out.",
        };
        retryCooldowns.set(cooldownKey, {
          failureCount,
          failure,
          until: cooldownUntil,
        });
        attempts.push({
          strategyId: strategy.id,
          kind: strategy.kind,
          outcome: "timeout",
          failureCode: failure.code,
          durationMs,
          cooldownUntil,
        });
        finalStatus = "retryable_failure";
        finalFailure = failure;
        continue;
      }

      const outcome = execution.outcome;
      if (outcome.status === "success") {
        retryCooldowns.delete(cooldownKey);
        terminalCooldowns.delete(runOptions.sourceEntryId);
        attempts.push({
          strategyId: strategy.id,
          kind: strategy.kind,
          outcome: outcome.status,
          failureCode: null,
          durationMs,
          cooldownUntil: null,
        });
        return {
          status: "success",
          value: outcome.value,
          selectedStrategyId: strategy.id,
          failure: null,
          attempts,
        };
      }

      if (outcome.status === "partial") {
        retryCooldowns.delete(cooldownKey);
        terminalCooldowns.delete(runOptions.sourceEntryId);
        let value: TValue;
        try {
          value = runOptions.mergePartial(
            runOptions.previousValue,
            outcome.value,
          );
        } catch {
          const failure = {
            code: "partial_merge_failed",
            detail: "Partial source data could not be merged safely.",
          };
          const cooldownUntil = now() + terminalCooldownMs;
          terminalCooldowns.set(runOptions.sourceEntryId, {
            failure,
            until: cooldownUntil,
          });
          attempts.push({
            strategyId: strategy.id,
            kind: strategy.kind,
            outcome: "terminal_failure",
            failureCode: failure.code,
            durationMs,
            cooldownUntil,
          });
          return {
            status: "terminal_failure",
            value: runOptions.previousValue,
            selectedStrategyId: null,
            failure,
            attempts,
          };
        }

        attempts.push({
          strategyId: strategy.id,
          kind: strategy.kind,
          outcome: outcome.status,
          failureCode: null,
          durationMs,
          cooldownUntil: null,
        });
        return {
          status: "partial",
          value,
          selectedStrategyId: strategy.id,
          failure: null,
          attempts,
        };
      }

      if (outcome.status === "unavailable") {
        attempts.push({
          strategyId: strategy.id,
          kind: strategy.kind,
          outcome: outcome.status,
          failureCode: outcome.failure.code,
          durationMs,
          cooldownUntil: null,
        });
        finalStatus = "unavailable";
        finalFailure = outcome.failure;
        continue;
      }

      if (outcome.status === "retryable_failure") {
        const failureCount = (retryCooldown?.failureCount ?? 0) + 1;
        const backoff = retryBackoffMs[
          Math.min(failureCount - 1, retryBackoffMs.length - 1)
        ]!;
        const delay = clampDelay(outcome.retryAfterMs ?? backoff, backoff);
        const cooldownUntil = now() + delay;
        retryCooldowns.set(cooldownKey, {
          failureCount,
          failure: outcome.failure,
          until: cooldownUntil,
        });
        attempts.push({
          strategyId: strategy.id,
          kind: strategy.kind,
          outcome: outcome.status,
          failureCode: outcome.failure.code,
          durationMs,
          cooldownUntil,
        });
        finalStatus = "retryable_failure";
        finalFailure = outcome.failure;
        continue;
      }

      const delay = clampDelay(
        outcome.cooldownMs ?? terminalCooldownMs,
        terminalCooldownMs,
      );
      const cooldownUntil = delay > 0 ? now() + delay : null;
      if (cooldownUntil === null) {
        terminalCooldowns.delete(runOptions.sourceEntryId);
      } else {
        terminalCooldowns.set(runOptions.sourceEntryId, {
          failure: outcome.failure,
          until: cooldownUntil,
        });
      }
      attempts.push({
        strategyId: strategy.id,
        kind: strategy.kind,
        outcome: outcome.status,
        failureCode: outcome.failure.code,
        durationMs,
        cooldownUntil,
      });
      return {
        status: "terminal_failure",
        value: runOptions.previousValue,
        selectedStrategyId: null,
        failure: outcome.failure,
        attempts,
      };
    }

    return {
      status: attemptedStrategy ? finalStatus : "cooldown",
      value: runOptions.previousValue,
      selectedStrategyId: null,
      failure: finalFailure,
      attempts,
    };
  }

  function run(
    runOptions: SourceStrategyRunOptions<
      TValue,
      TPartial,
      TFailureContext
    >,
  ): Promise<SourceStrategyRunResult<TValue, TFailureContext>> {
    const activeRun = activeRuns.get(runOptions.sourceEntryId);
    if (activeRun) {
      counters.coalescedRuns += 1;
      return activeRun;
    }

    counters.runsStarted += 1;
    const nextRun = executeRun(runOptions).finally(() => {
      if (activeRuns.get(runOptions.sourceEntryId) === nextRun) {
        activeRuns.delete(runOptions.sourceEntryId);
      }
    });
    activeRuns.set(runOptions.sourceEntryId, nextRun);
    return nextRun;
  }

  function getDebugSnapshot(): SourceStrategyDebugSnapshot {
    const observedAt = now();
    const activeRetryCooldownCount = [...retryCooldowns.values()].filter(
      ({ until }) => until > observedAt,
    ).length;
    const activeTerminalCooldownCount = [...terminalCooldowns.values()].filter(
      ({ until }) => until > observedAt,
    ).length;

    return {
      ...counters,
      activeSourceEntries: [...activeRuns.keys()],
      cooldownCount: activeRetryCooldownCount + activeTerminalCooldownCount,
    };
  }

  return { run, getDebugSnapshot };
}
