import type { SyncTrigger } from "../types";
import type {
  CodexPersonalParseResult,
  CodexPersonalUsageBalance,
  CodexPersonalUsageWindow,
} from "./personal-page-parser";
import {
  codexCredentialBroker,
  type CodexCredentialBroker,
} from "./session-credential-broker";
import type { CodexSessionCredential } from "./session-credential";
import {
  CODEX_SESSION_USAGE_PATH,
  parseCodexSessionUsageResponse,
  type CodexSessionRateLimitWindow,
  type CodexSessionUsageContract,
} from "./session-usage-contract";
import {
  CODEX_DAILY_TOKEN_USAGE_PATH,
  CODEX_DAILY_WORKSPACE_USAGE_PATH,
  parseCodexDailyTokenUsageResponse,
  parseCodexDailyWorkspaceUsageResponse,
  type CodexObservedUsageHistoryContract,
} from "./usage-history-contract";
import { parseCodexUsageHistory } from "./usage-history-parser";

export const CODEX_SESSION_API_ORIGIN = "https://chatgpt.com";
export const CODEX_QUOTA_CACHE_TTL_MS = 60_000;
export const CODEX_HISTORY_CACHE_TTL_MS = 15 * 60_000;
export const CODEX_MANUAL_HISTORY_CACHE_TTL_MS = 60_000;
export const CODEX_SESSION_REQUEST_TIMEOUT_MS = 8_000;
export const CODEX_SESSION_RESPONSE_SIZE_LIMIT = 512_000;

const DEFAULT_RATE_LIMIT_BACKOFF_MS = 15 * 60_000;
const TRANSIENT_BACKOFF_STEPS_MS = [60_000, 5 * 60_000, 15 * 60_000] as const;

export type CodexSessionApiFailureCode =
  | "auth_missing"
  | "auth_cooldown"
  | "unauthorized"
  | "forbidden"
  | "rate_limited"
  | "request_timeout"
  | "network_error"
  | "server_error"
  | "protocol_drift";

export type CodexSessionApiUsageResult =
  | {
      ok: true;
      result: Extract<CodexPersonalParseResult, { status: "ok" }>;
      historyState: "fresh" | "cached" | "unavailable";
      replacePreviousSnapshot: boolean;
    }
  | {
      ok: false;
      code: CodexSessionApiFailureCode;
      reason: string;
      retryAt: number | null;
    };

export type CodexSessionApiClient = {
  getUsageSnapshot: (trigger?: SyncTrigger) => Promise<CodexSessionApiUsageResult>;
};

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export type CodexSessionApiClientOptions = {
  credentialBroker?: CodexCredentialBroker;
  fetchImpl?: FetchLike;
  now?: () => number;
  requestTimeoutMs?: number;
};

type TimedCache<T> = {
  capturedAt: number;
  credentialKey: string;
  value: T;
};

type ModuleState<T> = {
  backoffUntil: number;
  cache: TimedCache<T> | null;
  consecutiveFailures: number;
  forbiddenToken: string | null;
};

type RequestFailure = {
  ok: false;
  code: Exclude<
    CodexSessionApiFailureCode,
    "auth_missing" | "auth_cooldown"
  >;
  retryAt: number | null;
};

type RequestSuccess<T> = { ok: true; value: T };
type RequestResult<T> = RequestSuccess<T> | RequestFailure;

function createModuleState<T>(): ModuleState<T> {
  return {
    backoffUntil: 0,
    cache: null,
    consecutiveFailures: 0,
    forbiddenToken: null,
  };
}

function isCacheFresh<T>(
  cache: TimedCache<T> | null,
  credentialKey: string,
  now: number,
  ttlMs: number,
): cache is TimedCache<T> {
  return Boolean(
    cache &&
      cache.credentialKey === credentialKey &&
      now - cache.capturedAt >= 0 &&
      now - cache.capturedAt < ttlMs,
  );
}

function getCredentialKey(credential: CodexSessionCredential): string {
  return credential.accountId
    ? `account:${credential.accountId}`
    : `session:${credential.accessToken}`;
}

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

function classifyWindow(
  window: CodexSessionRateLimitWindow,
  modelLabel: string | null,
): Pick<CodexPersonalUsageWindow, "kind" | "label" | "normalizedLabel"> {
  if (modelLabel) {
    return {
      kind:
        window.limitWindowSeconds === 18_000
          ? "model_rolling_5h"
          : window.limitWindowSeconds === 604_800
            ? "model_weekly"
            : "unknown",
      label: modelLabel,
      normalizedLabel: modelLabel,
    };
  }

  if (window.limitWindowSeconds === 18_000) {
    return {
      kind: "rolling_5h",
      label: "5-hour usage window",
      normalizedLabel: "5-hour usage window",
    };
  }

  if (window.limitWindowSeconds === 604_800) {
    return {
      kind: "weekly",
      label: "Weekly usage window",
      normalizedLabel: "Weekly usage window",
    };
  }

  const label = window.limitWindowSeconds
    ? `${Math.max(1, Math.round(window.limitWindowSeconds / 3_600))}-hour usage window`
    : "Codex usage window";
  return { kind: "unknown", label, normalizedLabel: label };
}

function toPersonalWindow(
  window: CodexSessionRateLimitWindow,
  modelLabel: string | null,
): CodexPersonalUsageWindow {
  const classified = classifyWindow(window, modelLabel);
  const resetAt =
    window.resetAt === null
      ? null
      : new Date(window.resetAt * 1_000).toISOString();

  return {
    ...classified,
    modelLabel,
    remainingPercent: window.remainingPercent,
    usedPercent: window.usedPercent,
    totalPercent: 100,
    resetAt,
    resetText: resetAt,
  };
}

function buildWindows(contract: CodexSessionUsageContract): CodexPersonalUsageWindow[] {
  const windows: CodexPersonalUsageWindow[] = [];
  const appendRateLimit = (
    rateLimit: CodexSessionUsageContract["rateLimit"],
    modelLabel: string | null,
  ) => {
    if (rateLimit.primaryWindow) {
      windows.push(toPersonalWindow(rateLimit.primaryWindow, modelLabel));
    }
    if (rateLimit.secondaryWindow) {
      windows.push(toPersonalWindow(rateLimit.secondaryWindow, modelLabel));
    }
  };

  appendRateLimit(contract.rateLimit, null);
  for (const additional of contract.additionalRateLimits) {
    appendRateLimit(additional.rateLimit, additional.label);
  }

  return windows;
}

function buildBalances(
  contract: CodexSessionUsageContract,
): CodexPersonalUsageBalance[] {
  const balance = contract.credits?.balance;

  if (balance === null || balance === undefined) {
    return [];
  }

  return [
    {
      label: "Credit balance",
      normalizedLabel: "Credit balance",
      kind: "flex_credit_balance",
      remainingCredits: balance,
      totalCredits: null,
      detail: contract.credits?.unlimited ? "Unlimited credits" : null,
    },
  ];
}

function buildParseResult(
  contract: CodexSessionUsageContract,
  history: CodexObservedUsageHistoryContract | null,
  capturedAt: number,
): Extract<CodexPersonalParseResult, { status: "ok" }> | null {
  const windows = buildWindows(contract);
  const primaryWindow =
    windows.find((window) => window.kind === "rolling_5h") ?? windows[0] ?? null;

  if (!primaryWindow) {
    return null;
  }

  return {
    status: "ok",
    snapshot: {
      providerId: "codex-personal-page",
      providerLabel: "Codex",
      measurementKind: "window_percent",
      routeKey: "cloud_analytics",
      sourceUrl: `${CODEX_SESSION_API_ORIGIN}${CODEX_SESSION_USAGE_PATH}`,
      sourceHeading: "Codex session usage",
      primaryWindow,
      windows,
      balances: buildBalances(contract),
      usageHistory: parseCodexUsageHistory(
        history,
        new Date(capturedAt).toISOString(),
      ),
      note:
        "Codex usage was read from the current local ChatGPT session. The access token remains in session-only extension storage.",
    },
  };
}

function mergeHistory(
  current: CodexObservedUsageHistoryContract,
  previous: CodexObservedUsageHistoryContract | null,
): CodexObservedUsageHistoryContract {
  return {
    dailyTokenUsageBreakdown:
      current.dailyTokenUsageBreakdown ??
      previous?.dailyTokenUsageBreakdown ??
      null,
    dailyWorkspaceUsageCounts:
      current.dailyWorkspaceUsageCounts ??
      previous?.dailyWorkspaceUsageCounts ??
      null,
  };
}

function failureReason(code: CodexSessionApiFailureCode): string {
  switch (code) {
    case "auth_missing":
      return "The current ChatGPT session did not expose a usable Codex access token.";
    case "auth_cooldown":
      return "Codex session authentication is cooling down after a failed attempt.";
    case "unauthorized":
      return "The Codex session token expired and one renewal attempt did not recover.";
    case "forbidden":
      return "The current ChatGPT account cannot access the Codex usage endpoint.";
    case "rate_limited":
      return "The Codex usage endpoint asked the extension to wait before retrying.";
    case "request_timeout":
      return "The Codex usage endpoint did not respond before the local timeout.";
    case "network_error":
      return "The Codex usage endpoint could not be reached from this browser session.";
    case "server_error":
      return "The Codex usage endpoint returned a temporary server error.";
    case "protocol_drift":
      return "The Codex usage endpoint returned an unsupported response shape.";
  }
}

export function createCodexSessionApiClient(
  options: CodexSessionApiClientOptions = {},
): CodexSessionApiClient {
  const broker = options.credentialBroker ?? codexCredentialBroker;
  const fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis);
  const now = options.now ?? Date.now;
  const requestTimeoutMs =
    options.requestTimeoutMs ?? CODEX_SESSION_REQUEST_TIMEOUT_MS;
  const quotaState = createModuleState<CodexSessionUsageContract>();
  const historyState = createModuleState<CodexObservedUsageHistoryContract>();
  let activeRefresh: Promise<CodexSessionApiUsageResult> | null = null;
  let lastSuccessfulCredentialKey: string | undefined;

  function applyRequestFailure<T>(
    state: ModuleState<T>,
    failure: RequestFailure,
    accessToken: string,
  ): void {
    if (failure.code === "forbidden") {
      state.forbiddenToken = accessToken;
      state.backoffUntil = Number.POSITIVE_INFINITY;
      return;
    }

    state.forbiddenToken = null;
    if (failure.code === "rate_limited") {
      state.backoffUntil =
        failure.retryAt ?? now() + DEFAULT_RATE_LIMIT_BACKOFF_MS;
      return;
    }

    if (
      failure.code === "network_error" ||
      failure.code === "server_error" ||
      failure.code === "request_timeout"
    ) {
      const index = Math.min(
        state.consecutiveFailures,
        TRANSIENT_BACKOFF_STEPS_MS.length - 1,
      );
      state.consecutiveFailures += 1;
      state.backoffUntil = now() + TRANSIENT_BACKOFF_STEPS_MS[index]!;
    }
  }

  function clearRequestFailure<T>(state: ModuleState<T>): void {
    state.backoffUntil = 0;
    state.consecutiveFailures = 0;
    state.forbiddenToken = null;
  }

  async function performRequest<T>(
    path: string,
    credential: CodexSessionCredential,
    parser: (value: unknown) => T | null,
  ): Promise<RequestResult<T>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

    try {
      const headers: Record<string, string> = {
        Accept: "application/json",
        Authorization: `Bearer ${credential.accessToken}`,
      };
      if (credential.accountId) {
        headers["ChatGPT-Account-Id"] = credential.accountId;
      }

      const response = await fetchImpl(`${CODEX_SESSION_API_ORIGIN}${path}`, {
        cache: "no-store",
        credentials: "omit",
        headers,
        method: "GET",
        signal: controller.signal,
      });

      if (response.status === 401) {
        return { ok: false, code: "unauthorized", retryAt: null };
      }
      if (response.status === 403) {
        return { ok: false, code: "forbidden", retryAt: null };
      }
      if (response.status === 429) {
        return {
          ok: false,
          code: "rate_limited",
          retryAt: parseRetryAfter(response.headers.get("Retry-After"), now()),
        };
      }
      if (response.status >= 500) {
        return { ok: false, code: "server_error", retryAt: null };
      }
      if (!response.ok) {
        return { ok: false, code: "protocol_drift", retryAt: null };
      }

      const bodyText = await response.text();
      if (bodyText.length > CODEX_SESSION_RESPONSE_SIZE_LIMIT) {
        return { ok: false, code: "protocol_drift", retryAt: null };
      }

      let body: unknown;
      try {
        body = JSON.parse(bodyText);
      } catch {
        return { ok: false, code: "protocol_drift", retryAt: null };
      }

      const value = parser(body);
      return value
        ? { ok: true, value }
        : { ok: false, code: "protocol_drift", retryAt: null };
    } catch (error) {
      return {
        ok: false,
        code:
          error instanceof DOMException && error.name === "AbortError"
            ? "request_timeout"
            : "network_error",
        retryAt: null,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  async function runRefresh(trigger: SyncTrigger): Promise<CodexSessionApiUsageResult> {
    const manual = trigger === "manual";
    const credentialResult = await broker.getCredential({
      bypassCooldown: manual,
    });

    if (!credentialResult.ok) {
      return {
        ok: false,
        code: credentialResult.code,
        reason: failureReason(credentialResult.code),
        retryAt: credentialResult.retryAt,
      };
    }

    let credential = credentialResult.credential;
    const startedAt = now();
    let credentialKey = getCredentialKey(credential);
    const quotaFresh =
      !manual &&
      isCacheFresh(
        quotaState.cache,
        credentialKey,
        startedAt,
        CODEX_QUOTA_CACHE_TTL_MS,
      );
    const historyFresh = isCacheFresh(
      historyState.cache,
      credentialKey,
      startedAt,
      manual ? CODEX_MANUAL_HISTORY_CACHE_TTL_MS : CODEX_HISTORY_CACHE_TTL_MS,
    );
    let credentialRenewal: Promise<
      Awaited<ReturnType<CodexCredentialBroker["getCredential"]>>
    > | null = null;

    async function requestWithRenewal<T>(
      path: string,
      parser: (value: unknown) => T | null,
    ): Promise<RequestResult<T>> {
      const first = await performRequest(path, credential, parser);

      if (first.ok || first.code !== "unauthorized") {
        return first;
      }

      if (!credentialRenewal) {
        credentialRenewal = (async () => {
          await broker.clearCredential();
          return broker.getCredential({ bypassCooldown: true, forceRefresh: true });
        })();
      }

      const renewed = await credentialRenewal;
      if (!renewed.ok) {
        return first;
      }

      credential = renewed.credential;
      credentialKey = getCredentialKey(credential);
      return performRequest(path, credential, parser);
    }

    const quotaBlocked =
      !quotaFresh &&
      (quotaState.backoffUntil > startedAt ||
        quotaState.forbiddenToken === credential.accessToken);
    const historyBlocked =
      !historyFresh &&
      (historyState.backoffUntil > startedAt ||
        historyState.forbiddenToken === credential.accessToken);

    const quotaPromise: Promise<RequestResult<CodexSessionUsageContract> | null> =
      quotaFresh || quotaBlocked
        ? Promise.resolve(null)
        : requestWithRenewal(CODEX_SESSION_USAGE_PATH, parseCodexSessionUsageResponse);
    const tokenHistoryPromise =
      historyFresh || historyBlocked
        ? Promise.resolve(null)
        : requestWithRenewal(
            CODEX_DAILY_TOKEN_USAGE_PATH,
            parseCodexDailyTokenUsageResponse,
          );
    const workspaceHistoryPromise =
      historyFresh || historyBlocked
        ? Promise.resolve(null)
        : requestWithRenewal(
            CODEX_DAILY_WORKSPACE_USAGE_PATH,
            parseCodexDailyWorkspaceUsageResponse,
          );
    const [quotaRequest, tokenHistoryRequest, workspaceHistoryRequest] =
      await Promise.all([
        quotaPromise,
        tokenHistoryPromise,
        workspaceHistoryPromise,
      ]);
    const capturedAt = now();

    if (quotaRequest?.ok) {
      quotaState.cache = {
        capturedAt,
        credentialKey,
        value: quotaRequest.value,
      };
      clearRequestFailure(quotaState);
    } else if (quotaRequest && !quotaRequest.ok) {
      applyRequestFailure(quotaState, quotaRequest, credential.accessToken);
    }

    const currentHistory: CodexObservedUsageHistoryContract = {
      dailyTokenUsageBreakdown: tokenHistoryRequest?.ok
        ? tokenHistoryRequest.value
        : null,
      dailyWorkspaceUsageCounts: workspaceHistoryRequest?.ok
        ? workspaceHistoryRequest.value
        : null,
    };
    const hasFreshHistory = Boolean(
      currentHistory.dailyTokenUsageBreakdown ||
        currentHistory.dailyWorkspaceUsageCounts,
    );

    if (hasFreshHistory) {
      historyState.cache = {
        capturedAt,
        credentialKey,
        value: mergeHistory(
          currentHistory,
          historyState.cache?.credentialKey === credentialKey
            ? historyState.cache.value
            : null,
        ),
      };
      clearRequestFailure(historyState);
    } else {
      const historyFailure = [tokenHistoryRequest, workspaceHistoryRequest].find(
        (result): result is RequestFailure => Boolean(result && !result.ok),
      );
      if (historyFailure) {
        applyRequestFailure(historyState, historyFailure, credential.accessToken);
      }
    }

    const quotaCache = quotaState.cache;
    if (!quotaCache || quotaCache.credentialKey !== credentialKey) {
      const failure = quotaRequest && !quotaRequest.ok ? quotaRequest : null;
      const code =
        failure?.code ??
        (quotaState.forbiddenToken === credential.accessToken
          ? "forbidden"
          : quotaBlocked
            ? "rate_limited"
            : "protocol_drift");
      return {
        ok: false,
        code,
        reason: failureReason(code),
        retryAt:
          failure?.retryAt ??
          (Number.isFinite(quotaState.backoffUntil)
            ? quotaState.backoffUntil
            : null),
      };
    }

    const historyCache =
      historyState.cache?.credentialKey === credentialKey
        ? historyState.cache
        : null;
    const result = buildParseResult(
      quotaCache.value,
      historyCache?.value ?? null,
      Math.max(quotaCache.capturedAt, historyCache?.capturedAt ?? 0),
    );

    if (!result) {
      return {
        ok: false,
        code: "protocol_drift",
        reason: failureReason("protocol_drift"),
        retryAt: null,
      };
    }

    const replacePreviousSnapshot =
      lastSuccessfulCredentialKey !== undefined &&
      lastSuccessfulCredentialKey !== credentialKey;
    lastSuccessfulCredentialKey = credentialKey;

    return {
      ok: true,
      result,
      historyState: hasFreshHistory
        ? "fresh"
        : historyCache
          ? "cached"
          : "unavailable",
      replacePreviousSnapshot,
    };
  }

  return {
    getUsageSnapshot(trigger: SyncTrigger = "manual") {
      if (activeRefresh) {
        return activeRefresh;
      }

      activeRefresh = runRefresh(trigger);
      return activeRefresh.finally(() => {
        activeRefresh = null;
      });
    },
  };
}

export const codexSessionApiClient = createCodexSessionApiClient();
