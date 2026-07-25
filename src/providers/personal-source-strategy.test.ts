import { describe, expect, it, vi } from "vitest";

import { createEmptyPageBinding } from "../shared/page-bindings";
import {
  createPersonalSourceStrategyRunner,
  type PersonalSourceAttempt,
} from "./personal-source-strategy";
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
  code: "host_access_missing" | "open_page_required" | "sync_error",
): PersonalSourceAttempt {
  return {
    ok: false,
    failure: { kind: "session_page", code, detail: `Failure: ${code}` },
    snapshot,
    setting,
  };
}

describe("personal provider source strategy bridge", () => {
  it("returns normalized successful attempts", async () => {
    const runner = createPersonalSourceStrategyRunner();
    const attempt: PersonalSourceAttempt = {
      ok: true,
      kind: "session_page",
      snapshot,
      setting,
    };

    await expect(
      runner.run({
        sourceEntryId: "codex-personal-page",
        trigger: "manual",
        strategyId: "codex_personal",
        runAttempt: async () => attempt,
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
    const runner = createPersonalSourceStrategyRunner({
      now: () => currentTime,
      retryBackoffMs: [100],
    });
    const options = {
      sourceEntryId: "codex-personal-page" as const,
      trigger: "alarm" as const,
      strategyId: "codex_personal",
      runAttempt,
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
    const runner = createPersonalSourceStrategyRunner({
      now: () => currentTime,
      retryBackoffMs: [100],
    });

    await runner.run({
      sourceEntryId: "cursor-personal-page",
      trigger: "alarm",
      strategyId: "cursor_personal",
      runAttempt,
    });
    currentTime = 2_010;
    const manual = await runner.run({
      sourceEntryId: "cursor-personal-page",
      trigger: "manual",
      strategyId: "cursor_personal",
      runAttempt,
    });

    expect(manual.status).toBe("unavailable");
    expect(runAttempt).toHaveBeenCalledTimes(2);
  });

  it("treats host access as terminal for the current run without sticky cooldown", async () => {
    const runAttempt = vi.fn(async () => failedAttempt("host_access_missing"));
    const runner = createPersonalSourceStrategyRunner();
    const options = {
      sourceEntryId: "claude-code-team-page" as const,
      trigger: "alarm" as const,
      strategyId: "claude_personal",
      runAttempt,
    };

    expect((await runner.run(options)).status).toBe("terminal_failure");
    expect((await runner.run(options)).status).toBe("terminal_failure");
    expect(runAttempt).toHaveBeenCalledTimes(2);
  });
});
