import { describe, expect, it, vi } from "vitest";

import { createEmptyPageBinding } from "../shared/page-bindings";
import {
  createProviderSourceStrategyRunner,
  type ProviderSourceAttempt,
} from "./provider-source-strategy";
import type { ProviderSetting, ProviderSnapshot } from "./types";

const snapshot: ProviderSnapshot = {
  providerId: "codex-personal-page",
  providerLabel: "Codex Personal",
  planName: "Personal",
  quotaUnit: "percent",
  quotaWindow: "rolling",
  used: 20,
  remaining: 80,
  total: 100,
  resetAt: "later",
  resetLabel: "later",
  syncedAt: "now",
  syncSource: "page_parse",
  syncStatus: "ok",
  warningReason: null,
  lastSyncLabel: "now",
  sourceSelectionReason: "session page",
  sourceFallbackReason: null,
  tone: "neutral",
};

const setting: ProviderSetting = {
  id: "codex-personal-page",
  brandId: "codex",
  label: "Codex Personal",
  displayEnabled: true,
  enabled: true,
  status: "granted",
  credentialStatus: "not_required",
  sourceKind: "session_page",
  connectionMode: "page_session",
  sourcePreference: "session_page",
  pageBinding: createEmptyPageBinding(),
  hostsLabel: "chatgpt.com",
  hostOrigins: ["https://chatgpt.com/*"],
  description: "Personal source",
};

function failedAttempt(
  code:
    | "host_access_missing"
    | "credential_missing"
    | "open_page_required"
    | "sync_error",
  kind: "session_page" | "official_api" = "session_page",
): ProviderSourceAttempt {
  return {
    ok: false,
    failure: { kind, code, detail: `Failure: ${code}` },
    snapshot,
    setting,
  };
}

function strategy(
  runAttempt: (signal: AbortSignal) => Promise<ProviderSourceAttempt>,
  kind: "page_capture" | "official_api" = "page_capture",
) {
  return [{ id: "provider_source", kind, runAttempt }] as const;
}

describe("provider source strategy bridge", () => {
  it("returns normalized successful attempts", async () => {
    const runner = createProviderSourceStrategyRunner();
    const attempt: ProviderSourceAttempt = {
      ok: true,
      kind: "session_page",
      snapshot,
      setting,
    };

    await expect(
      runner.run({
        sourceEntryId: "codex-personal-page",
        trigger: "manual",
        strategies: strategy(async () => attempt),
      }),
    ).resolves.toMatchObject({
      status: "success",
      attempt,
      failure: null,
    });
  });

  it("preserves typed failed attempts across an automatic cooldown", async () => {
    let currentTime = 1_000;
    const runAttempt = vi.fn(async () => failedAttempt("sync_error"));
    const runner = createProviderSourceStrategyRunner({
      now: () => currentTime,
      retryBackoffMs: [100],
    });
    const options = {
      sourceEntryId: "codex-personal-page" as const,
      trigger: "alarm" as const,
      strategies: strategy(runAttempt),
    };

    const first = await runner.run(options);
    expect(first).toMatchObject({
      status: "retryable_failure",
      failure: { code: "sync_error" },
      attempt: { snapshot, setting },
    });

    currentTime = 1_050;
    const cooledDown = await runner.run(options);
    expect(cooledDown).toMatchObject({
      status: "cooldown",
      failure: { code: "sync_error" },
      attempt: { snapshot, setting },
    });
    expect(runAttempt).toHaveBeenCalledTimes(1);
  });

  it("lets manual refresh bypass cooldown without creating another runner", async () => {
    let currentTime = 2_000;
    const runAttempt = vi.fn(async () => failedAttempt("sync_error"));
    const runner = createProviderSourceStrategyRunner({
      now: () => currentTime,
      retryBackoffMs: [100],
    });

    await runner.run({
      sourceEntryId: "cursor-personal-page",
      trigger: "alarm",
      strategies: strategy(runAttempt),
    });
    currentTime = 2_010;
    const manual = await runner.run({
      sourceEntryId: "cursor-personal-page",
      trigger: "manual",
      strategies: strategy(runAttempt),
    });

    expect(manual.status).toBe("unavailable");
    expect(runAttempt).toHaveBeenCalledTimes(2);
  });

  it("treats host access as terminal for the current run without sticky cooldown", async () => {
    const runAttempt = vi.fn(async () => failedAttempt("host_access_missing"));
    const runner = createProviderSourceStrategyRunner();
    const options = {
      sourceEntryId: "claude-code-team-page" as const,
      trigger: "alarm" as const,
      strategies: strategy(runAttempt),
    };

    expect((await runner.run(options)).status).toBe("terminal_failure");
    expect((await runner.run(options)).status).toBe("terminal_failure");
    expect(runAttempt).toHaveBeenCalledTimes(2);
  });

  it("keeps a missing API credential unavailable without retry cooldown", async () => {
    const runAttempt = vi.fn(async () =>
      failedAttempt("credential_missing", "official_api"),
    );
    const runner = createProviderSourceStrategyRunner();
    const options = {
      sourceEntryId: "codex-enterprise-api" as const,
      trigger: "alarm" as const,
      strategies: strategy(runAttempt, "official_api"),
    };

    expect((await runner.run(options)).status).toBe("unavailable");
    expect((await runner.run(options)).status).toBe("unavailable");
    expect(runAttempt).toHaveBeenCalledTimes(2);
  });

  it("classifies an orchestrator API timeout as an official API failure", async () => {
    vi.useFakeTimers();
    const runner = createProviderSourceStrategyRunner();
    const pending = runner.run({
      sourceEntryId: "codex-enterprise-api",
      trigger: "alarm",
      strategies: [
        {
          id: "codex_enterprise_api",
          kind: "official_api",
          timeoutMs: 5,
          runAttempt: () => new Promise(() => {}),
        },
      ],
    });

    await vi.advanceTimersByTimeAsync(5);
    await expect(pending).resolves.toMatchObject({
      status: "retryable_failure",
      failure: { kind: "official_api", code: "sync_error" },
    });
    vi.useRealTimers();
  });
});
