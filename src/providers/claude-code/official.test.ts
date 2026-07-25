import { describe, expect, it, vi } from "vitest";

import analyticsFixture from "../../../fixtures/claude/analytics-api.fixture.json";

import { createClaudeCodeAnalyticsClient } from "./official";

describe("createClaudeCodeAnalyticsClient", () => {
  it("returns the fixture response in fixture mode", async () => {
    const client = createClaudeCodeAnalyticsClient({
      source: "fixture",
    });

    await expect(
      client.getUsageReport({
        startingAt: "2026-04-19",
        limit: 100,
      }),
    ).resolves.toEqual(analyticsFixture);
  });

  it("requests live analytics pages and follows pagination cursors", async () => {
    const signal = new AbortController().signal;
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [analyticsFixture.data[0]],
          has_more: true,
          next_page: "page_2",
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [analyticsFixture.data[1]],
          has_more: false,
          next_page: null,
        }),
      } as Response);
    const client = createClaudeCodeAnalyticsClient({
      source: "live",
      apiKey: "sk-ant-admin-live",
      fetchImpl,
      signal,
    });

    const report = await client.getUsageReport({
      startingAt: "2026-04-19",
      limit: 1000,
    });

    expect(report.data).toHaveLength(2);
    expect(report.has_more).toBe(false);
    expect(report.next_page).toBeNull();
    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      "https://api.anthropic.com/v1/organizations/usage_report/claude_code?starting_at=2026-04-19&limit=1000",
      {
        headers: {
          "anthropic-version": "2023-06-01",
          "x-api-key": "sk-ant-admin-live",
        },
        signal,
      },
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      "https://api.anthropic.com/v1/organizations/usage_report/claude_code?starting_at=2026-04-19&limit=1000&page=page_2",
      {
        headers: {
          "anthropic-version": "2023-06-01",
          "x-api-key": "sk-ant-admin-live",
        },
        signal,
      },
    );
  });

  it("throws a clear error when live mode is requested without an Admin API key", async () => {
    const client = createClaudeCodeAnalyticsClient({
      source: "live",
    });

    await expect(
      client.getUsageReport({
        startingAt: "2026-04-19",
      }),
    ).rejects.toThrow("Claude Admin API key is required for live requests.");
  });
});
