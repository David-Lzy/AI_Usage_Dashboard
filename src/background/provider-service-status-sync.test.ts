import { describe, expect, it, vi } from "vitest";

import type { AppState } from "../providers/types";
import { SAMPLE_APP_STATE } from "../shared/constants";
import {
  createDefaultProviderServiceStatusVisibilityBySurface,
  setProviderServiceStatusVisibility,
} from "../shared/provider-service-status";
import {
  PROVIDER_SERVICE_STATUS_MAX_RESPONSE_BYTES,
  syncProviderServiceStatuses,
} from "./provider-service-status-sync";

const NOW = new Date("2026-07-25T06:00:00.000Z");

function createState(enabled = true): AppState {
  let visibility = createDefaultProviderServiceStatusVisibilityBySurface();
  if (enabled) {
    visibility = setProviderServiceStatusVisibility(
      visibility,
      "popup",
      "codex",
      true,
    );
  }
  return {
    ...SAMPLE_APP_STATE,
    providerServiceStatuses: [],
    settings: {
      ...SAMPLE_APP_STATE.settings,
      providerServiceStatusVisibilityBySurface: visibility,
    },
  };
}

function createSummaryResponse(status = 200): Response {
  return new Response(
    JSON.stringify({
      page: { id: "openai", name: "OpenAI", updated_at: NOW.toISOString() },
      status: { indicator: "none", description: "All Systems Operational" },
      components: [],
      incidents: [],
    }),
    { status, headers: { "content-type": "application/json" } },
  );
}

describe("provider service status sync", () => {
  it("does not check permission or fetch while every module is disabled", async () => {
    const fetcher = vi.fn(async () => createSummaryResponse());
    const hasHostAccess = vi.fn(async () => true);

    await expect(
      syncProviderServiceStatuses(createState(false), {
        fetcher,
        hasHostAccess,
        now: NOW,
      }),
    ).resolves.toEqual(createState(false));
    expect(fetcher).not.toHaveBeenCalled();
    expect(hasHostAccess).not.toHaveBeenCalled();
  });

  it("fetches an enabled official feed with conservative request options", async () => {
    const fetcher = vi.fn(async (_url: string, init?: RequestInit) => {
      expect(init).toMatchObject({
        cache: "no-store",
        credentials: "omit",
        headers: { Accept: "application/json" },
      });
      return createSummaryResponse();
    });
    const result = await syncProviderServiceStatuses(createState(), {
      fetcher,
      hasHostAccess: async () => true,
      now: NOW,
    });

    expect(fetcher).toHaveBeenCalledWith(
      "https://status.openai.com/api/v2/summary.json",
      expect.any(Object),
    );
    expect(result.providerServiceStatuses).toMatchObject([
      {
        vendorId: "openai",
        level: "operational",
        stale: false,
        failureReason: null,
      },
    ]);
  });

  it("coalesces concurrent requests and reuses a fresh cached status", async () => {
    let resolveResponse: ((response: Response) => void) | undefined;
    const fetcher = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveResponse = resolve;
        }),
    );
    const options = {
      fetcher,
      hasHostAccess: async () => true,
      now: NOW,
    };
    const first = syncProviderServiceStatuses(createState(), options);
    const second = syncProviderServiceStatuses(createState(), options);
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    resolveResponse?.(createSummaryResponse());
    const [firstResult, secondResult] = await Promise.all([first, second]);

    expect(firstResult.providerServiceStatuses).toEqual(
      secondResult.providerServiceStatuses,
    );
    const cachedFetcher = vi.fn(async () => createSummaryResponse());
    await syncProviderServiceStatuses(firstResult, {
      fetcher: cachedFetcher,
      hasHostAccess: async () => true,
      now: new Date(NOW.getTime() + 60_000),
    });
    expect(cachedFetcher).not.toHaveBeenCalled();
  });

  it("degrades permission, malformed, oversized, and rate-limit failures to unknown", async () => {
    const permissionResult = await syncProviderServiceStatuses(createState(), {
      fetcher: vi.fn(async () => createSummaryResponse()),
      hasHostAccess: async () => false,
      now: NOW,
    });
    expect(permissionResult.providerServiceStatuses?.[0]).toMatchObject({
      level: "unknown",
      failureReason: "permission_missing",
      stale: true,
    });

    const malformedResult = await syncProviderServiceStatuses(createState(), {
      fetcher: async () => new Response("not json"),
      hasHostAccess: async () => true,
      now: NOW,
    });
    expect(malformedResult.providerServiceStatuses?.[0].failureReason).toBe(
      "invalid_response",
    );

    const oversizedResult = await syncProviderServiceStatuses(createState(), {
      fetcher: async () =>
        new Response("{}", {
          headers: {
            "content-length": String(
              PROVIDER_SERVICE_STATUS_MAX_RESPONSE_BYTES + 1,
            ),
          },
        }),
      hasHostAccess: async () => true,
      now: NOW,
    });
    expect(oversizedResult.providerServiceStatuses?.[0].failureReason).toBe(
      "invalid_response",
    );

    const rateLimitedResult = await syncProviderServiceStatuses(createState(), {
      fetcher: async () => createSummaryResponse(429),
      hasHostAccess: async () => true,
      now: NOW,
    });
    expect(rateLimitedResult.providerServiceStatuses?.[0]).toMatchObject({
      level: "unknown",
      failureReason: "rate_limited",
    });
  });

  it("preserves the last successful status when a later request fails", async () => {
    const successful = await syncProviderServiceStatuses(createState(), {
      fetcher: async () => createSummaryResponse(),
      hasHostAccess: async () => true,
      now: NOW,
    });
    const failedAt = new Date(NOW.getTime() + 6 * 60_000);
    const result = await syncProviderServiceStatuses(successful, {
      fetcher: async () => new Response("not json"),
      hasHostAccess: async () => true,
      now: failedAt,
    });

    expect(result.providerServiceStatuses?.[0]).toMatchObject({
      vendorId: "openai",
      level: "operational",
      description: "All Systems Operational",
      checkedAt: NOW.toISOString(),
      stale: true,
      failureReason: "invalid_response",
    });
    expect(result.providerServiceStatuses?.[0].retryAt).toBe(
      new Date(failedAt.getTime() + 5 * 60_000).toISOString(),
    );
  });
});
