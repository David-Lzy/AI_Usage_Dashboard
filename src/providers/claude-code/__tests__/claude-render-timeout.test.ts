/**
 * Test suite: Claude render timeout configuration (P3 fix)
 * Module under test: src/providers/claude-code/personal-page-capture.ts
 *
 * Before the fix, background tabs were given 10 s to load and 2 s post-load
 * delay. Chrome throttles background tabs and Next.js / React pages need client-
 * side hydration time before usage percentages appear in the DOM. The fix raises
 * the limits to 15 s / 3.5 s so personal Pro/Max account pages fully render
 * before the extension attempts to extract data.
 */
import { describe, expect, it, vi } from "vitest";

import {
  captureClaudePersonalLiveFixture,
} from "../personal-page-capture";
import type {
  PageSessionClient,
  PageSessionDefinition,
  PageSessionReloadOptions,
  PageSessionResult,
} from "../../page-session";

type CapturedDefinition = PageSessionDefinition & {
  reloadBeforeCapture?: boolean | PageSessionReloadOptions;
  reloadOnCaptureFailure?: boolean | PageSessionReloadOptions;
};

function makeCapturingClient(): {
  client: PageSessionClient;
  captured: CapturedDefinition[];
} {
  const captured: CapturedDefinition[] = [];
  const client: PageSessionClient = {
    async capture(definition: PageSessionDefinition): Promise<PageSessionResult> {
      captured.push(definition as CapturedDefinition);
      return { status: "not_found", attempts: [] };
    },
  };
  return { client, captured };
}

describe("captureClaudePersonalLiveFixture / background tab render timeouts (P3)", () => {
  describe("reloadBeforeCapture options", () => {
    it("should use waitForLoadTimeoutMs of 15 000 ms (increased from 10 000 ms)", async () => {
      const { client, captured } = makeCapturingClient();
      await captureClaudePersonalLiveFixture(client, { mode: "auto", tabId: null });

      const definition = captured[0];
      expect(definition).toBeDefined();
      const reload = definition?.reloadBeforeCapture;
      expect(typeof reload).toBe("object");
      expect((reload as PageSessionReloadOptions).waitForLoadTimeoutMs).toBe(15_000);
    });

    it("should use postLoadDelayMs of 3 500 ms (increased from 2 000 ms)", async () => {
      const { client, captured } = makeCapturingClient();
      await captureClaudePersonalLiveFixture(client, { mode: "auto", tabId: null });

      const reload = captured[0]?.reloadBeforeCapture;
      expect((reload as PageSessionReloadOptions).postLoadDelayMs).toBe(3_500);
    });
  });

  describe("reloadOnCaptureFailure options", () => {
    it("should use waitForLoadTimeoutMs of 15 000 ms on capture failure reload", async () => {
      const { client, captured } = makeCapturingClient();
      await captureClaudePersonalLiveFixture(client, { mode: "auto", tabId: null });

      const reload = captured[0]?.reloadOnCaptureFailure;
      expect((reload as PageSessionReloadOptions).waitForLoadTimeoutMs).toBe(15_000);
    });

    it("should use postLoadDelayMs of 3 500 ms on capture failure reload", async () => {
      const { client, captured } = makeCapturingClient();
      await captureClaudePersonalLiveFixture(client, { mode: "auto", tabId: null });

      const reload = captured[0]?.reloadOnCaptureFailure;
      expect((reload as PageSessionReloadOptions).postLoadDelayMs).toBe(3_500);
    });
  });

  describe("other reload options remain unchanged", () => {
    it("should keep bypassCache: true", async () => {
      const { client, captured } = makeCapturingClient();
      await captureClaudePersonalLiveFixture(client, { mode: "auto", tabId: null });

      const reload = captured[0]?.reloadBeforeCapture;
      expect((reload as PageSessionReloadOptions).bypassCache).toBe(true);
    });

    it("should keep loadPollIntervalMs at 250 ms", async () => {
      const { client, captured } = makeCapturingClient();
      await captureClaudePersonalLiveFixture(client, { mode: "auto", tabId: null });

      const reload = captured[0]?.reloadBeforeCapture;
      expect((reload as PageSessionReloadOptions).loadPollIntervalMs).toBe(250);
    });
  });
});
