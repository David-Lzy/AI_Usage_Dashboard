import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createSourceStrategyOrchestrator,
  type SourceStrategy,
} from "./source-strategy-orchestrator";

type Snapshot = {
  history: readonly number[];
  quota: number | null;
};

type PartialSnapshot = Partial<Snapshot>;

const PREVIOUS_SNAPSHOT: Snapshot = {
  history: [10, 20, 30],
  quota: 45,
};

function mergePartial(
  previous: Snapshot | null,
  partial: PartialSnapshot,
): Snapshot {
  return {
    history: partial.history ?? previous?.history ?? [],
    quota: partial.quota ?? previous?.quota ?? null,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

function strategy(
  id: string,
  run: SourceStrategy<Snapshot, PartialSnapshot>["run"],
  timeoutMs?: number,
): SourceStrategy<Snapshot, PartialSnapshot> {
  return {
    id,
    kind: "session_api",
    ...(timeoutMs === undefined ? {} : { timeoutMs }),
    run,
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("provider source strategy orchestrator", () => {
  it("runs explicit fallbacks in order and returns the first success", async () => {
    const calls: string[] = [];
    const orchestrator = createSourceStrategyOrchestrator<
      Snapshot,
      PartialSnapshot
    >();

    const result = await orchestrator.run({
      sourceEntryId: "codex-personal-page",
      previousValue: PREVIOUS_SNAPSHOT,
      mergePartial,
      strategies: [
        strategy("session", async () => {
          calls.push("session");
          return {
            status: "unavailable",
            failure: { code: "missing_session", detail: "No session." },
          };
        }),
        {
          ...strategy("page", async () => {
            calls.push("page");
            return {
              status: "success",
              value: { history: [40], quota: 60 },
            };
          }),
          kind: "page_capture" as const,
        },
      ],
    });

    expect(calls).toEqual(["session", "page"]);
    expect(result).toMatchObject({
      status: "success",
      selectedStrategyId: "page",
      value: { history: [40], quota: 60 },
      failure: null,
    });
    expect(result.attempts.map((attempt) => attempt.outcome)).toEqual([
      "unavailable",
      "success",
    ]);
  });

  it("merges partial data without erasing unrelated previous modules", async () => {
    const orchestrator = createSourceStrategyOrchestrator<
      Snapshot,
      PartialSnapshot
    >();

    const result = await orchestrator.run({
      sourceEntryId: "cursor-personal-page",
      previousValue: PREVIOUS_SNAPSHOT,
      mergePartial,
      strategies: [
        strategy("billing", async () => ({
          status: "partial",
          value: { quota: 72 },
        })),
      ],
    });

    expect(result).toMatchObject({
      status: "partial",
      selectedStrategyId: "billing",
      value: { history: [10, 20, 30], quota: 72 },
    });
  });

  it("coalesces concurrent runs for one source entry only", async () => {
    const pendingCodex = deferred<{
      status: "success";
      value: Snapshot;
    }>();
    const pendingCursor = deferred<{
      status: "success";
      value: Snapshot;
    }>();
    const codexRun = vi.fn(() => pendingCodex.promise);
    const cursorRun = vi.fn(() => pendingCursor.promise);
    const orchestrator = createSourceStrategyOrchestrator<
      Snapshot,
      PartialSnapshot
    >();
    const baseOptions = {
      previousValue: PREVIOUS_SNAPSHOT,
      mergePartial,
    };

    const first = orchestrator.run({
      ...baseOptions,
      sourceEntryId: "codex-personal-page",
      strategies: [strategy("session", codexRun)],
    });
    const second = orchestrator.run({
      ...baseOptions,
      sourceEntryId: "codex-personal-page",
      strategies: [
        strategy("ignored", async () => ({
          status: "success",
          value: PREVIOUS_SNAPSHOT,
        })),
      ],
    });
    const otherSource = orchestrator.run({
      ...baseOptions,
      sourceEntryId: "cursor-personal-page",
      strategies: [strategy("session", cursorRun)],
    });

    expect(second).toBe(first);
    await vi.waitFor(() => {
      expect(codexRun).toHaveBeenCalledTimes(1);
      expect(cursorRun).toHaveBeenCalledTimes(1);
    });
    pendingCodex.resolve({ status: "success", value: PREVIOUS_SNAPSHOT });
    pendingCursor.resolve({ status: "success", value: PREVIOUS_SNAPSHOT });
    await Promise.all([first, second, otherSource]);

    expect(orchestrator.getDebugSnapshot()).toMatchObject({
      runsStarted: 2,
      coalescedRuns: 1,
      attemptsStarted: 2,
      activeSourceEntries: [],
    });
  });

  it("applies deterministic retry cooldown and supports an explicit bypass", async () => {
    let currentTime = 1_000;
    const run = vi.fn(async () => ({
      status: "retryable_failure" as const,
      failure: { code: "network_error", detail: "Network unavailable." },
    }));
    const orchestrator = createSourceStrategyOrchestrator<
      Snapshot,
      PartialSnapshot
    >({ now: () => currentTime, retryBackoffMs: [100, 500] });
    const options = {
      sourceEntryId: "claude-code-team-page" as const,
      previousValue: PREVIOUS_SNAPSHOT,
      mergePartial,
      strategies: [strategy("page", run)],
    };

    const first = await orchestrator.run(options);
    expect(first.status).toBe("retryable_failure");
    expect(first.attempts[0]).toMatchObject({
      failureCode: "network_error",
      cooldownUntil: 1_100,
    });

    currentTime = 1_050;
    const cooledDown = await orchestrator.run(options);
    expect(cooledDown).toMatchObject({
      status: "cooldown",
      failure: { code: "network_error" },
    });
    expect(cooledDown.attempts[0]).toMatchObject({
      outcome: "cooldown_skipped",
      failureCode: "network_error",
    });
    expect(run).toHaveBeenCalledTimes(1);

    const bypassed = await orchestrator.run({
      ...options,
      bypassCooldown: true,
    });
    expect(bypassed.attempts[0]?.cooldownUntil).toBe(1_550);
    expect(run).toHaveBeenCalledTimes(2);
  });

  it("stops on terminal failure and preserves the previous value", async () => {
    let currentTime = 2_000;
    const fallback = vi.fn();
    const orchestrator = createSourceStrategyOrchestrator<
      Snapshot,
      PartialSnapshot
    >({ now: () => currentTime, terminalCooldownMs: 300 });
    const options = {
      sourceEntryId: "codex-personal-page" as const,
      previousValue: PREVIOUS_SNAPSHOT,
      mergePartial,
      strategies: [
        strategy("session", async () => ({
          status: "terminal_failure",
          failure: { code: "forbidden", detail: "Access denied." },
        })),
        strategy("page", fallback),
      ],
    };

    const failed = await orchestrator.run(options);
    expect(failed).toMatchObject({
      status: "terminal_failure",
      value: PREVIOUS_SNAPSHOT,
      failure: { code: "forbidden" },
    });
    expect(fallback).not.toHaveBeenCalled();

    currentTime = 2_100;
    const cooledDown = await orchestrator.run(options);
    expect(cooledDown).toMatchObject({
      status: "cooldown",
      value: PREVIOUS_SNAPSHOT,
      failure: { code: "forbidden" },
    });
  });

  it("aborts timed-out attempts and releases the in-flight entry", async () => {
    vi.useFakeTimers();
    const observedSignals: AbortSignal[] = [];
    const orchestrator = createSourceStrategyOrchestrator<
      Snapshot,
      PartialSnapshot
    >({ retryBackoffMs: [100] });
    const neverFinishes = strategy(
      "session",
      ({ signal }) => {
        observedSignals.push(signal);
        return new Promise(() => {});
      },
      25,
    );

    const pending = orchestrator.run({
      sourceEntryId: "codex-personal-page",
      previousValue: PREVIOUS_SNAPSHOT,
      mergePartial,
      strategies: [neverFinishes],
    });
    await vi.advanceTimersByTimeAsync(25);
    const result = await pending;

    expect(result.status).toBe("retryable_failure");
    expect(result.attempts[0]?.outcome).toBe("timeout");
    expect(observedSignals[0]?.aborted).toBe(true);
    expect(orchestrator.getDebugSnapshot()).toMatchObject({
      attemptsTimedOut: 1,
      activeSourceEntries: [],
    });
  });

  it("cancels cleanly and permits a later run", async () => {
    const controller = new AbortController();
    const firstAttempt = vi.fn(
      ({ signal }: { signal: AbortSignal }) =>
        new Promise<never>(() => {
          expect(signal.aborted).toBe(false);
        }),
    );
    const orchestrator = createSourceStrategyOrchestrator<
      Snapshot,
      PartialSnapshot
    >();

    const pending = orchestrator.run({
      sourceEntryId: "cursor-personal-page",
      previousValue: PREVIOUS_SNAPSHOT,
      mergePartial,
      signal: controller.signal,
      strategies: [strategy("session", firstAttempt)],
    });
    await vi.waitFor(() => expect(firstAttempt).toHaveBeenCalledTimes(1));
    controller.abort();
    await expect(pending).resolves.toMatchObject({
      status: "cancelled",
      value: PREVIOUS_SNAPSHOT,
    });

    const later = await orchestrator.run({
      sourceEntryId: "cursor-personal-page",
      previousValue: PREVIOUS_SNAPSHOT,
      mergePartial,
      strategies: [
        strategy("session", async () => ({
          status: "success",
          value: { history: [], quota: 90 },
        })),
      ],
    });
    expect(later.status).toBe("success");
  });

  it("rejects invalid strategy lists and reports an empty list as unavailable", async () => {
    const orchestrator = createSourceStrategyOrchestrator<
      Snapshot,
      PartialSnapshot
    >();
    const baseOptions = {
      sourceEntryId: "gemini-policy" as const,
      previousValue: PREVIOUS_SNAPSHOT,
      mergePartial,
    };

    await expect(
      orchestrator.run({ ...baseOptions, strategies: [] }),
    ).resolves.toMatchObject({
      status: "unavailable",
      failure: { code: "no_strategy" },
    });
    await expect(
      orchestrator.run({
        ...baseOptions,
        strategies: [
          strategy("duplicate", async () => ({
            status: "success",
            value: PREVIOUS_SNAPSHOT,
          })),
          strategy("duplicate", async () => ({
            status: "success",
            value: PREVIOUS_SNAPSHOT,
          })),
        ],
      }),
    ).rejects.toThrow(/Duplicate source strategy id/);
  });

  it("keeps debug output limited to counters and source-entry ids", async () => {
    const orchestrator = createSourceStrategyOrchestrator<
      Snapshot,
      PartialSnapshot
    >();
    await orchestrator.run({
      sourceEntryId: "jetbrains-org-page",
      previousValue: PREVIOUS_SNAPSHOT,
      mergePartial,
      strategies: [
        strategy("policy", async () => ({
          status: "unavailable",
          failure: {
            code: "deferred",
            detail: "Sensitive provider response must not enter counters.",
          },
        })),
      ],
    });

    const serialized = JSON.stringify(orchestrator.getDebugSnapshot());
    expect(serialized).not.toContain("Sensitive provider response");
    expect(serialized).not.toContain("deferred");
    expect(orchestrator.getDebugSnapshot()).toEqual({
      runsStarted: 1,
      coalescedRuns: 0,
      attemptsStarted: 1,
      attemptsTimedOut: 0,
      attemptsCancelled: 0,
      cooldownSkips: 0,
      activeSourceEntries: [],
      cooldownCount: 0,
    });
  });
});
