import type { AppState, SyncTrigger } from "../providers/types";
import {
  CUSTOM_SOURCE_RESPONSE_MAX_CHARS,
  createEmptyCustomSourceSyncState,
  normalizeCustomSourceEndpointUrl,
  parseCustomSourceResponseJson,
  type CustomSourceSetting,
  type CustomSourceSnapshot,
  type CustomSourceSyncState,
  type CustomSourceValidationIssue,
} from "../shared/custom-sources";

export const CUSTOM_SOURCE_FETCH_TIMEOUT_MS = 10_000;

type FetchLike = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export type CustomSourceFetchFailureCode =
  | "invalid_url"
  | "unsupported_url_scheme"
  | "host_access_missing"
  | "network_error"
  | "timeout"
  | "http_error"
  | "response_too_large"
  | "invalid_response";

export type CustomSourceFetchResult =
  | {
      ok: true;
      snapshot: CustomSourceSnapshot;
    }
  | {
      ok: false;
      code: CustomSourceFetchFailureCode;
      message: string;
      issues?: CustomSourceValidationIssue[];
      statusCode?: number;
    };

type FetchCustomSourceOptions = {
  fetchImpl?: FetchLike;
  maxResponseChars?: number;
  now?: Date;
  timeoutMs?: number;
};

type SyncCustomSourcesOptions = FetchCustomSourceOptions & {
  hasHostAccess?: (endpointUrl: unknown) => Promise<boolean>;
  trigger: SyncTrigger;
};

export const CUSTOM_SOURCE_HOST_ACCESS_MISSING_MESSAGE =
  "Custom source host access was not granted for this endpoint.";

function getFetchImpl(fetchImpl?: FetchLike): FetchLike {
  if (fetchImpl) {
    return fetchImpl;
  }

  if (typeof fetch !== "function") {
    throw new Error("Fetch is not available in this runtime.");
  }

  return fetch;
}

function getResponseHeader(response: Response, name: string): string | null {
  return typeof response.headers?.get === "function"
    ? response.headers.get(name)
    : null;
}

function isAbortError(error: unknown): boolean {
  return (
    error instanceof DOMException && error.name === "AbortError"
  ) || (error instanceof Error && error.name === "AbortError");
}

function formatValidationIssues(issues: readonly CustomSourceValidationIssue[]) {
  const firstIssue = issues[0];

  return firstIssue
    ? `${firstIssue.path}: ${firstIssue.message}`
    : "Custom source JSON did not match the expected schema.";
}

function formatFailureMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Custom source request failed.";
}

export async function fetchCustomSourceSnapshot(
  setting: CustomSourceSetting,
  options: FetchCustomSourceOptions = {},
): Promise<CustomSourceFetchResult> {
  const endpointUrl = normalizeCustomSourceEndpointUrl(setting.endpointUrl);

  if (!endpointUrl.ok) {
    const firstIssue = endpointUrl.issues[0];

    return {
      ok: false,
      code:
        firstIssue?.code === "unsupported_url_scheme"
          ? "unsupported_url_scheme"
          : "invalid_url",
      message: firstIssue?.message ?? "Custom source endpoint URL is invalid.",
      issues: endpointUrl.issues,
    };
  }

  const timeoutMs = options.timeoutMs ?? CUSTOM_SOURCE_FETCH_TIMEOUT_MS;
  const maxResponseChars =
    options.maxResponseChars ?? CUSTOM_SOURCE_RESPONSE_MAX_CHARS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await getFetchImpl(options.fetchImpl)(endpointUrl.value, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      credentials: "omit",
      redirect: "follow",
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        ok: false,
        code: "http_error",
        statusCode: response.status,
        message: `Custom source returned HTTP ${response.status}.`,
      };
    }

    const contentLength = Number.parseInt(
      getResponseHeader(response, "content-length") ?? "",
      10,
    );

    if (Number.isFinite(contentLength) && contentLength > maxResponseChars) {
      return {
        ok: false,
        code: "response_too_large",
        message: `Custom source response exceeds ${maxResponseChars} characters.`,
      };
    }

    const rawResponseText = await response.text();

    if (rawResponseText.length > maxResponseChars) {
      return {
        ok: false,
        code: "response_too_large",
        message: `Custom source response exceeds ${maxResponseChars} characters.`,
      };
    }

    const parsed = parseCustomSourceResponseJson(rawResponseText, {
      sourceId: setting.id,
      fetchedAt: (options.now ?? new Date()).toISOString(),
    });

    if (!parsed.ok) {
      return {
        ok: false,
        code:
          parsed.issues[0]?.code === "response_too_large"
            ? "response_too_large"
            : "invalid_response",
        message: formatValidationIssues(parsed.issues),
        issues: parsed.issues,
      };
    }

    return {
      ok: true,
      snapshot: parsed.value,
    };
  } catch (error) {
    return {
      ok: false,
      code: isAbortError(error) ? "timeout" : "network_error",
      message: isAbortError(error)
        ? `Custom source request timed out after ${timeoutMs}ms.`
        : formatFailureMessage(error),
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseTimestamp(rawValue: string | null): Date | null {
  if (!rawValue) {
    return null;
  }

  const parsedValue = new Date(rawValue);

  return Number.isNaN(parsedValue.getTime()) ? null : parsedValue;
}

export function shouldRefreshCustomSource(
  setting: CustomSourceSetting,
  state: CustomSourceSyncState | null,
  trigger: SyncTrigger,
  now: Date,
): boolean {
  if (!setting.displayEnabled) {
    return false;
  }

  if (trigger === "manual") {
    return true;
  }

  if (trigger !== "alarm") {
    return false;
  }

  const lastAttemptAt = parseTimestamp(state?.lastAttemptAt ?? null);

  if (!lastAttemptAt) {
    return true;
  }

  const ageMinutes = Math.floor(
    (now.getTime() - lastAttemptAt.getTime()) / 60000,
  );

  return ageMinutes >= setting.refreshIntervalMinutes;
}

function createFailedSyncState(
  sourceId: CustomSourceSetting["id"],
  previousState: CustomSourceSyncState | null,
  failure: Exclude<CustomSourceFetchResult, { ok: true }>,
  attemptedAt: string,
): CustomSourceSyncState {
  const previousSnapshot = previousState?.snapshot ?? null;
  const staleSnapshot = previousSnapshot
    ? {
        ...previousSnapshot,
        syncStatus: "warning" as const,
        tone: "warning" as const,
        warningReason: failure.message,
        lastSyncLabel: "Custom source refresh failed; showing cached data",
      }
    : null;

  return {
    sourceId,
    status: staleSnapshot ? "warning" : "error",
    snapshot: staleSnapshot,
    lastAttemptAt: attemptedAt,
    lastSuccessAt: previousState?.lastSuccessAt ?? null,
    lastFailureAt: attemptedAt,
    lastFailureReason: failure.message,
    stale: Boolean(staleSnapshot),
  };
}

async function syncOneCustomSource(
  setting: CustomSourceSetting,
  previousState: CustomSourceSyncState | null,
  options: SyncCustomSourcesOptions,
  now: Date,
): Promise<CustomSourceSyncState> {
  const attemptedAt = now.toISOString();
  const hasHostAccess =
    typeof options.hasHostAccess === "function"
      ? await options.hasHostAccess(setting.endpointUrl).catch(() => true)
      : true;

  if (!hasHostAccess) {
    return createFailedSyncState(
      setting.id,
      previousState,
      {
        ok: false,
        code: "host_access_missing",
        message: CUSTOM_SOURCE_HOST_ACCESS_MISSING_MESSAGE,
      },
      attemptedAt,
    );
  }

  const result = await fetchCustomSourceSnapshot(setting, {
    fetchImpl: options.fetchImpl,
    maxResponseChars: options.maxResponseChars,
    now,
    timeoutMs: options.timeoutMs,
  });

  if (!result.ok) {
    return createFailedSyncState(setting.id, previousState, result, attemptedAt);
  }

  return {
    sourceId: setting.id,
    status: result.snapshot.syncStatus,
    snapshot: result.snapshot,
    lastAttemptAt: attemptedAt,
    lastSuccessAt: attemptedAt,
    lastFailureAt: null,
    lastFailureReason: null,
    stale: false,
  };
}

export async function syncCustomSources(
  state: AppState,
  options: SyncCustomSourcesOptions,
): Promise<AppState> {
  const customSources = state.customSources ?? [];

  if (customSources.length === 0) {
    return state;
  }

  const now = options.now ?? new Date();
  const previousStates = new Map(
    (state.customSourceStates ?? []).map((entry) => [entry.sourceId, entry]),
  );
  const nextStates = new Map<CustomSourceSetting["id"], CustomSourceSyncState>(
    customSources.map((setting) => [
      setting.id,
      previousStates.get(setting.id) ??
        createEmptyCustomSourceSyncState(setting.id),
    ]),
  );

  await Promise.all(
    customSources.map(async (setting) => {
      const previousState = previousStates.get(setting.id) ?? null;

      if (
        !shouldRefreshCustomSource(setting, previousState, options.trigger, now)
      ) {
        return;
      }

      nextStates.set(
        setting.id,
        await syncOneCustomSource(setting, previousState, options, now),
      );
    }),
  );

  return {
    ...state,
    customSourceStates: customSources.flatMap((setting) => {
      const nextState = nextStates.get(setting.id);
      return nextState ? [nextState] : [];
    }),
  };
}
