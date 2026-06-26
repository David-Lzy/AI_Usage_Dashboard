import { afterEach, describe, expect, it, vi } from "vitest";

import type { AppState } from "../providers/types";
import {
  CUSTOM_SOURCE_RESPONSE_MAX_CHARS,
  CUSTOM_SOURCE_SCHEMA_V1,
  type CustomSourceSetting,
  type CustomSourceSnapshot,
  type CustomSourceSyncState,
} from "../shared/custom-sources";
import { SAMPLE_APP_STATE } from "../shared/constants";
import {
  CUSTOM_SOURCE_HOST_ACCESS_MISSING_MESSAGE,
  fetchCustomSourceSnapshot,
  shouldRefreshCustomSource,
  syncCustomSources,
} from "./custom-source-sync";

const NOW = new Date("2026-06-26T08:00:00.000Z");

function createCustomSourceSetting(
  overrides: Partial<CustomSourceSetting> = {},
): CustomSourceSetting {
  return {
    id: "custom:build_quota",
    label: "Build Quota",
    description: null,
    endpointUrl: "https://example.com/quota.json",
    displayEnabled: true,
    refreshIntervalMinutes: 15,
    createdAt: "2026-06-26T00:00:00.000Z",
    updatedAt: "2026-06-26T00:00:00.000Z",
    ...overrides,
  };
}

function createResponse(
  body: unknown,
  init: ResponseInit = {},
): Response {
  return new Response(
    typeof body === "string" ? body : JSON.stringify(body),
    {
      status: 200,
      headers: {
        "content-type": "application/json",
        ...init.headers,
      },
      ...init,
    },
  );
}

function createChunkedResponse(
  chunks: readonly string[],
  init: ResponseInit = {},
): { response: Response; wasCanceled: () => boolean } {
  const encoder = new TextEncoder();
  let chunkIndex = 0;
  let canceled = false;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      const chunk = chunks[chunkIndex];
      chunkIndex += 1;

      if (typeof chunk === "undefined") {
        controller.close();
        return;
      }

      controller.enqueue(encoder.encode(chunk));
    },
    cancel() {
      canceled = true;
    },
  });

  return {
    response: new Response(stream, {
      status: 200,
      headers: {
        "content-type": "application/json",
        ...init.headers,
      },
      ...init,
    }),
    wasCanceled: () => canceled,
  };
}

function createValidResponse(overrides: Record<string, unknown> = {}) {
  return {
    schema: CUSTOM_SOURCE_SCHEMA_V1,
    label: "Build Quota",
    status: "ok",
    quota: {
      unit: "minutes",
      remaining: 90,
      total: 100,
    },
    ...overrides,
  };
}

async function createSnapshot(): Promise<CustomSourceSnapshot> {
  const result = await fetchCustomSourceSnapshot(createCustomSourceSetting(), {
    fetchImpl: async () => createResponse(createValidResponse()),
    now: NOW,
  });

  if (!result.ok) {
    throw new Error("Expected a valid custom source snapshot.");
  }

  return result.snapshot;
}

function createState(
  customSources: CustomSourceSetting[],
  customSourceStates: CustomSourceSyncState[] = [],
): AppState {
  return {
    ...SAMPLE_APP_STATE,
    customSources,
    customSourceStates,
  };
}

describe("custom source fetch client", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("fetches and normalizes custom source JSON with conservative request options", async () => {
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.method).toBe("GET");
      expect(init?.credentials).toBe("omit");
      expect(init?.cache).toBe("no-store");
      expect(init?.headers).toEqual({ Accept: "application/json" });
      return createResponse(createValidResponse());
    });
    const result = await fetchCustomSourceSnapshot(createCustomSourceSetting(), {
      fetchImpl,
      now: NOW,
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://example.com/quota.json",
      expect.objectContaining({
        method: "GET",
      }),
    );
    expect(result).toMatchObject({
      ok: true,
      snapshot: {
        sourceId: "custom:build_quota",
        label: "Build Quota",
        remaining: 90,
        total: 100,
        syncedAt: NOW.toISOString(),
      },
    });
  });

  it("supports http and https endpoints", async () => {
    const fetchedUrls: string[] = [];
    const fetchImpl = vi.fn(async (url: RequestInfo | URL) => {
      fetchedUrls.push(String(url));
      return createResponse(createValidResponse());
    });

    await expect(
      fetchCustomSourceSnapshot(
        createCustomSourceSetting({
          endpointUrl: "http://localhost:4173/source.json",
        }),
        { fetchImpl, now: NOW },
      ),
    ).resolves.toMatchObject({ ok: true });
    await expect(
      fetchCustomSourceSnapshot(
        createCustomSourceSetting({
          endpointUrl: "https://example.com/source.json",
        }),
        { fetchImpl, now: NOW },
      ),
    ).resolves.toMatchObject({ ok: true });
    expect(fetchedUrls).toEqual([
      "http://localhost:4173/source.json",
      "https://example.com/source.json",
    ]);
  });

  it("rejects non-network endpoint schemes before fetch", async () => {
    const fetchImpl = vi.fn(async () => createResponse(createValidResponse()));

    for (const endpointUrl of [
      "javascript:alert(1)",
      "data:application/json,{}",
      "file:///tmp/source.json",
      "chrome-extension://extension/source.json",
      "moz-extension://extension/source.json",
    ]) {
      await expect(
        fetchCustomSourceSnapshot(
          createCustomSourceSetting({ endpointUrl }),
          { fetchImpl, now: NOW },
        ),
      ).resolves.toMatchObject({
        ok: false,
        code: "unsupported_url_scheme",
      });
    }
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns readable failures for timeouts, non-2xx, malformed JSON, and oversized bodies", async () => {
    vi.useFakeTimers();
    const timeoutFetch = vi.fn(
      (_url: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("The operation was aborted.", "AbortError"));
          });
        }),
    );
    const timeoutResultPromise = fetchCustomSourceSnapshot(
      createCustomSourceSetting(),
      {
        fetchImpl: timeoutFetch,
        now: NOW,
        timeoutMs: 25,
      },
    );

    await vi.advanceTimersByTimeAsync(25);
    await expect(timeoutResultPromise).resolves.toMatchObject({
      ok: false,
      code: "timeout",
    });
    vi.useRealTimers();

    await expect(
      fetchCustomSourceSnapshot(createCustomSourceSetting(), {
        fetchImpl: async () =>
          createResponse("Not found", {
            status: 404,
          }),
        now: NOW,
      }),
    ).resolves.toMatchObject({
      ok: false,
      code: "http_error",
      statusCode: 404,
    });
    await expect(
      fetchCustomSourceSnapshot(createCustomSourceSetting(), {
        fetchImpl: async () => createResponse("{not-json"),
        now: NOW,
      }),
    ).resolves.toMatchObject({
      ok: false,
      code: "invalid_response",
    });
    await expect(
      fetchCustomSourceSnapshot(createCustomSourceSetting(), {
        fetchImpl: async () =>
          createResponse(" ".repeat(CUSTOM_SOURCE_RESPONSE_MAX_CHARS + 1)),
        now: NOW,
      }),
    ).resolves.toMatchObject({
      ok: false,
      code: "response_too_large",
    });
  });

  it("reads chunked response bodies with the same size limit", async () => {
    const validJson = JSON.stringify(createValidResponse());
    const validResponse = createChunkedResponse([
      validJson.slice(0, 24),
      validJson.slice(24, 96),
      validJson.slice(96),
    ]);

    await expect(
      fetchCustomSourceSnapshot(createCustomSourceSetting(), {
        fetchImpl: async () => validResponse.response,
        now: NOW,
      }),
    ).resolves.toMatchObject({
      ok: true,
      snapshot: {
        sourceId: "custom:build_quota",
        remaining: 90,
      },
    });
    expect(validResponse.wasCanceled()).toBe(false);

    const oversizedResponse = createChunkedResponse([
      "{\"schema\":",
      `"${CUSTOM_SOURCE_SCHEMA_V1}",`,
      "\"label\":\"Build Quota\"",
    ]);

    await expect(
      fetchCustomSourceSnapshot(createCustomSourceSetting(), {
        fetchImpl: async () => oversizedResponse.response,
        maxResponseChars: 24,
        now: NOW,
      }),
    ).resolves.toMatchObject({
      ok: false,
      code: "response_too_large",
    });
    expect(oversizedResponse.wasCanceled()).toBe(true);
  });
});

describe("custom source scheduler", () => {
  it("refreshes enabled custom sources during manual refresh", async () => {
    const setting = createCustomSourceSetting();
    const fetchImpl = vi.fn(async () => createResponse(createValidResponse()));
    const state = await syncCustomSources(createState([setting]), {
      trigger: "manual",
      fetchImpl,
      now: NOW,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(state.customSourceStates?.[0]).toMatchObject({
      sourceId: setting.id,
      status: "ok",
      lastAttemptAt: NOW.toISOString(),
      lastSuccessAt: NOW.toISOString(),
      lastFailureAt: null,
      stale: false,
      snapshot: {
        sourceId: setting.id,
        remaining: 90,
      },
    });
  });

  it("reports missing host access without fetching the endpoint", async () => {
    const setting = createCustomSourceSetting();
    const fetchImpl = vi.fn(async () => createResponse(createValidResponse()));
    const hasHostAccess = vi.fn(async () => false);
    const state = await syncCustomSources(createState([setting]), {
      trigger: "manual",
      fetchImpl,
      hasHostAccess,
      now: NOW,
    });

    expect(hasHostAccess).toHaveBeenCalledWith(setting.endpointUrl);
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(state.customSourceStates?.[0]).toMatchObject({
      sourceId: setting.id,
      status: "error",
      lastAttemptAt: NOW.toISOString(),
      lastFailureAt: NOW.toISOString(),
      lastFailureReason: CUSTOM_SOURCE_HOST_ACCESS_MISSING_MESSAGE,
      stale: false,
      snapshot: null,
    });
  });

  it("respects per-source alarm refresh intervals", () => {
    const setting = createCustomSourceSetting({
      refreshIntervalMinutes: 15,
    });

    expect(
      shouldRefreshCustomSource(
        setting,
        {
          sourceId: setting.id,
          status: "ok",
          snapshot: null,
          lastAttemptAt: "2026-06-26T07:50:00.000Z",
          lastSuccessAt: "2026-06-26T07:50:00.000Z",
          lastFailureAt: null,
          lastFailureReason: null,
          stale: false,
        },
        "alarm",
        NOW,
      ),
    ).toBe(false);
    expect(
      shouldRefreshCustomSource(
        setting,
        {
          sourceId: setting.id,
          status: "ok",
          snapshot: null,
          lastAttemptAt: "2026-06-26T07:44:00.000Z",
          lastSuccessAt: "2026-06-26T07:44:00.000Z",
          lastFailureAt: null,
          lastFailureReason: null,
          stale: false,
        },
        "alarm",
        NOW,
      ),
    ).toBe(true);
  });

  it("skips disabled custom sources and bootstrap refreshes", async () => {
    const setting = createCustomSourceSetting({ displayEnabled: false });
    const fetchImpl = vi.fn(async () => createResponse(createValidResponse()));

    await expect(
      syncCustomSources(createState([setting]), {
        trigger: "manual",
        fetchImpl,
        now: NOW,
      }),
    ).resolves.toMatchObject({
      customSourceStates: [
        {
          sourceId: setting.id,
          status: "warning",
          snapshot: null,
        },
      ],
    });
    expect(
      shouldRefreshCustomSource(
        createCustomSourceSetting({ displayEnabled: true }),
        null,
        "bootstrap",
        NOW,
      ),
    ).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("keeps the last successful snapshot as stale when a later refresh fails", async () => {
    const setting = createCustomSourceSetting();
    const snapshot = await createSnapshot();
    const state = await syncCustomSources(
      createState(
        [setting],
        [
          {
            sourceId: setting.id,
            status: "ok",
            snapshot,
            lastAttemptAt: "2026-06-26T07:00:00.000Z",
            lastSuccessAt: "2026-06-26T07:00:00.000Z",
            lastFailureAt: null,
            lastFailureReason: null,
            stale: false,
          },
        ],
      ),
      {
        trigger: "manual",
        fetchImpl: async () => createResponse("Server error", { status: 500 }),
        now: NOW,
      },
    );

    expect(state.customSourceStates?.[0]).toMatchObject({
      sourceId: setting.id,
      status: "warning",
      lastAttemptAt: NOW.toISOString(),
      lastSuccessAt: "2026-06-26T07:00:00.000Z",
      lastFailureAt: NOW.toISOString(),
      lastFailureReason: "Custom source returned HTTP 500.",
      stale: true,
      snapshot: {
        syncStatus: "warning",
        tone: "warning",
        warningReason: "Custom source returned HTTP 500.",
        lastSyncLabel: "Custom source refresh failed; showing cached data",
      },
    });
  });
});
