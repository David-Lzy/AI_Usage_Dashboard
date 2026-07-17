import type { SyncTrigger } from "../types";
import {
  parseCursorPersonalUsageContract,
  type CursorPersonalParseResult,
} from "./personal-page-parser";
import {
  CURSOR_HARD_LIMIT_PATH,
  CURSOR_PLAN_INFO_PATH,
  CURSOR_USAGE_SUMMARY_PATH,
  extractCursorObservedUsageBillingContract,
  mergeCursorObservedUsageBillingContracts,
} from "./usage-billing-contract";

export const CURSOR_SESSION_API_ORIGIN = "https://cursor.com";
export const CURSOR_SESSION_CACHE_TTL_MS = 60_000;
export const CURSOR_SESSION_REQUEST_TIMEOUT_MS = 8_000;
export const CURSOR_SESSION_RESPONSE_SIZE_LIMIT = 240_000;

const CURSOR_SESSION_ENDPOINTS = [
  CURSOR_USAGE_SUMMARY_PATH,
  CURSOR_PLAN_INFO_PATH,
  CURSOR_HARD_LIMIT_PATH,
] as const;
const DEFAULT_RATE_LIMIT_BACKOFF_MS = 15 * 60_000;
const AUTH_FAILURE_BACKOFF_MS = 5 * 60_000;
const TRANSIENT_BACKOFF_STEPS_MS = [60_000, 5 * 60_000, 15 * 60_000] as const;

export type CursorSessionApiFailureCode =
  | "unauthorized"
  | "forbidden"
  | "rate_limited"
  | "request_timeout"
  | "network_error"
  | "server_error"
  | "retry_cooldown"
  | "protocol_drift";

export type CursorSessionApiResult =
  | {
      ok: true;
      result: Extract<CursorPersonalParseResult, { status: "ok" }>;
    }
  | {
      ok: false;
      code: CursorSessionApiFailureCode;
      reason: string;
      retryAt: number | null;
    };

export type CursorSessionApiClient = {
  getUsageSnapshot: (trigger?: SyncTrigger) => Promise<CursorSessionApiResult>;
};

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export type CursorSessionApiClientOptions = {
  fetchImpl?: FetchLike;
  now?: () => number;
  requestTimeoutMs?: number;
};

type RequestFailure = Extract<CursorSessionApiResult, { ok: false }>;
type RequestSuccess = {
  ok: true;
  entry: { url: string; ok: true; bodyText: string };
};
type RequestResult = RequestSuccess | RequestFailure;

function parseRetryAfter(value: string | null, now: number): number | null {
  if (!value) {
    return null;
  }

  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return now + seconds * 1_000;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && timestamp > now ? timestamp : null;
}

function failureReason(code: CursorSessionApiFailureCode): string {
  switch (code) {
    case "unauthorized":
      return "The current Cursor browser session was not accepted by the personal usage endpoint.";
    case "forbidden":
      return "The current Cursor account cannot access the personal usage endpoint.";
    case "rate_limited":
      return "The Cursor usage endpoint asked the extension to wait before retrying.";
    case "request_timeout":
      return "The Cursor usage endpoint did not respond before the local timeout.";
    case "network_error":
      return "The Cursor usage endpoint could not be reached from the extension background worker.";
    case "server_error":
      return "The Cursor usage endpoint returned a temporary server error.";
    case "retry_cooldown":
      return "The Cursor usage endpoint is waiting for the current local retry cooldown.";
    case "protocol_drift":
      return "The Cursor usage endpoint returned an unsupported response shape.";
  }
}

function buildFailure(
  code: CursorSessionApiFailureCode,
  retryAt: number | null = null,
): RequestFailure {
  return { ok: false, code, reason: failureReason(code), retryAt };
}

export function createCursorSessionApiClient(
  options: CursorSessionApiClientOptions = {},
): CursorSessionApiClient {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis);
  const now = options.now ?? Date.now;
  const requestTimeoutMs =
    options.requestTimeoutMs ?? CURSOR_SESSION_REQUEST_TIMEOUT_MS;
  let activeRefresh: Promise<CursorSessionApiResult> | null = null;
  let cachedResult: { capturedAt: number; value: CursorSessionApiResult } | null =
    null;
  let backoffUntil = 0;
  let consecutiveFailures = 0;

  function applyFailure(failure: RequestFailure): void {
    if (failure.code === "unauthorized" || failure.code === "forbidden") {
      backoffUntil = now() + AUTH_FAILURE_BACKOFF_MS;
      return;
    }

    if (failure.code === "rate_limited") {
      backoffUntil =
        failure.retryAt ?? now() + DEFAULT_RATE_LIMIT_BACKOFF_MS;
      return;
    }

    if (
      failure.code === "network_error" ||
      failure.code === "server_error" ||
      failure.code === "request_timeout"
    ) {
      const index = Math.min(
        consecutiveFailures,
        TRANSIENT_BACKOFF_STEPS_MS.length - 1,
      );
      consecutiveFailures += 1;
      backoffUntil = now() + TRANSIENT_BACKOFF_STEPS_MS[index]!;
    }
  }

  async function request(path: string): Promise<RequestResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs);
    const url = `${CURSOR_SESSION_API_ORIGIN}${path}`;

    try {
      const response = await fetchImpl(url, {
        cache: "no-store",
        credentials: "include",
        headers: { Accept: "application/json" },
        method: "GET",
        signal: controller.signal,
      });

      if (response.status === 401) {
        return buildFailure("unauthorized");
      }
      if (response.status === 403) {
        return buildFailure("forbidden");
      }
      if (response.status === 429) {
        return buildFailure(
          "rate_limited",
          parseRetryAfter(response.headers.get("Retry-After"), now()),
        );
      }
      if (response.status >= 500) {
        return buildFailure("server_error");
      }
      if (!response.ok) {
        return buildFailure("protocol_drift");
      }

      const bodyText = await response.text();
      if (bodyText.length > CURSOR_SESSION_RESPONSE_SIZE_LIMIT) {
        return buildFailure("protocol_drift");
      }

      return { ok: true, entry: { url, ok: true, bodyText } };
    } catch (error) {
      return buildFailure(
        error instanceof DOMException && error.name === "AbortError"
          ? "request_timeout"
          : "network_error",
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async function runRefresh(trigger: SyncTrigger): Promise<CursorSessionApiResult> {
    const startedAt = now();
    if (
      trigger !== "manual" &&
      cachedResult &&
      startedAt - cachedResult.capturedAt >= 0 &&
      startedAt - cachedResult.capturedAt < CURSOR_SESSION_CACHE_TTL_MS
    ) {
      return cachedResult.value;
    }

    if (trigger !== "manual" && backoffUntil > startedAt) {
      return buildFailure("retry_cooldown", backoffUntil);
    }

    const responses = await Promise.all(
      CURSOR_SESSION_ENDPOINTS.map((path) => request(path)),
    );
    const summaryResponse = responses[0]!;

    if (!summaryResponse.ok) {
      applyFailure(summaryResponse);
      return summaryResponse;
    }

    const successfulEntries = responses.flatMap((response) =>
      response.ok ? [response.entry] : [],
    );
    const contract = mergeCursorObservedUsageBillingContracts([
      extractCursorObservedUsageBillingContract(successfulEntries),
    ]);
    const parsed = contract?.usageSummary
      ? parseCursorPersonalUsageContract(
          contract,
          new Date(startedAt).toISOString(),
        )
      : null;

    if (!parsed) {
      const failure = buildFailure("protocol_drift");
      applyFailure(failure);
      return failure;
    }

    consecutiveFailures = 0;
    backoffUntil = 0;
    const value: CursorSessionApiResult = { ok: true, result: parsed };
    cachedResult = { capturedAt: startedAt, value };
    return value;
  }

  return {
    async getUsageSnapshot(trigger = "manual") {
      if (activeRefresh) {
        return activeRefresh;
      }

      activeRefresh = runRefresh(trigger);
      try {
        return await activeRefresh;
      } finally {
        activeRefresh = null;
      }
    },
  };
}

export const cursorSessionApiClient = createCursorSessionApiClient();
