import { describe, expect, it, vi } from "vitest";

import analyticsFixture from "../../../fixtures/codex/analytics-api.fixture.json";

import { createCodexAnalyticsClient } from "./official";

describe("createCodexAnalyticsClient", () => {
  it("returns the fixture response in fixture mode", async () => {
    const client = createCodexAnalyticsClient({
      source: "fixture",
    });

    await expect(
      client.getUsageReport({
        limit: 100,
      }),
    ).resolves.toEqual(analyticsFixture);
  });

  it("requests live analytics pages and follows cursor pagination", async () => {
    const signal = new AbortController().signal;
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [analyticsFixture.data[0]],
          has_more: true,
          next_cursor: "cursor_2",
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [analyticsFixture.data[1]],
          has_more: false,
          next_cursor: null,
        }),
      } as Response);
    const client = createCodexAnalyticsClient({
      source: "live",
      apiKey: "sk-codex-enterprise",
      workspaceId: "ws_123",
      fetchImpl,
      signal,
    });

    const report = await client.getUsageReport({
      limit: 100,
    });

    expect(report.data).toHaveLength(2);
    expect(report.has_more).toBe(false);
    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      "https://api.chatgpt.com/v1/analytics/codex/workspaces/ws_123/usage?limit=100",
      {
        headers: {
          Authorization: "Bearer sk-codex-enterprise",
        },
        signal,
      },
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      "https://api.chatgpt.com/v1/analytics/codex/workspaces/ws_123/usage?limit=100&cursor=cursor_2",
      {
        headers: {
          Authorization: "Bearer sk-codex-enterprise",
        },
        signal,
      },
    );
  });

  it("throws a clear error when live mode is requested without an analytics key", async () => {
    const client = createCodexAnalyticsClient({
      source: "live",
      workspaceId: "ws_123",
    });

    await expect(
      client.getUsageReport({
        limit: 100,
      }),
    ).rejects.toThrow("Codex analytics API key is required for live requests.");
  });

  it("throws a clear error when live mode is requested without a workspace ID", async () => {
    const client = createCodexAnalyticsClient({
      source: "live",
      apiKey: "sk-codex-enterprise",
    });

    await expect(
      client.getUsageReport({
        limit: 100,
      }),
    ).rejects.toThrow("Codex workspace ID is required for live requests.");
  });
});
