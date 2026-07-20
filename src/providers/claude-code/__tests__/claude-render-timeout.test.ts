/**
 * Test suite: Claude structured-capture timeout configuration
 * Module under test: src/providers/claude-code/personal-page-capture.ts
 *
 * The document-start network observer now owns the bounded wait for the usage
 * response. Reload waits stay short and deterministic; DOM hydration remains a
 * fallback instead of adding a second multi-second delay.
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

describe("captureClaudePersonalLiveFixture / structured capture budgets", () => {
  describe("reloadBeforeCapture options", () => {
    it("uses a bounded 12 second page-load wait", async () => {
      const { client, captured } = makeCapturingClient();
      await captureClaudePersonalLiveFixture(client, { mode: "auto", tabId: null });

      const definition = captured[0];
      expect(definition).toBeDefined();
      const reload = definition?.reloadBeforeCapture;
      expect(typeof reload).toBe("object");
      expect((reload as PageSessionReloadOptions).waitForLoadTimeoutMs).toBe(12_000);
    });

    it("keeps only a short DOM fallback delay", async () => {
      const { client, captured } = makeCapturingClient();
      await captureClaudePersonalLiveFixture(client, { mode: "auto", tabId: null });

      const reload = captured[0]?.reloadBeforeCapture;
      expect((reload as PageSessionReloadOptions).postLoadDelayMs).toBe(250);
    });
  });

  describe("reloadOnCaptureFailure options", () => {
    it("uses the same bounded load wait on one recovery reload", async () => {
      const { client, captured } = makeCapturingClient();
      await captureClaudePersonalLiveFixture(client, { mode: "auto", tabId: null });

      const reload = captured[0]?.reloadOnCaptureFailure;
      expect((reload as PageSessionReloadOptions).waitForLoadTimeoutMs).toBe(12_000);
    });

    it("does not reintroduce a long hydration delay on recovery", async () => {
      const { client, captured } = makeCapturingClient();
      await captureClaudePersonalLiveFixture(client, { mode: "auto", tabId: null });

      const reload = captured[0]?.reloadOnCaptureFailure;
      expect((reload as PageSessionReloadOptions).postLoadDelayMs).toBe(250);
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

  it("waits for the required usage response through the network observer", async () => {
    const { client, captured } = makeCapturingClient();
    await captureClaudePersonalLiveFixture(client, { mode: "auto", tabId: null });

    expect(captured[0]?.extraction).toMatchObject({
      mode: "network_observer",
      requiredMatchUrlSubstrings: ["/usage"],
      observeReload: true,
      waitForRequiredEntriesTimeoutMs: 15_000,
    });
  });
});
