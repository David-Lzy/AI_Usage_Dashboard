import type {
  AppState,
  ProviderServiceStatus,
  ProviderServiceStatusFailureReason,
  ProviderServiceStatusVendorId,
} from "../providers/types";
import { hasProviderServiceStatusHostAccess } from "../shared/provider-service-status-host-access";
import {
  createUnknownProviderServiceStatus,
  getEnabledProviderServiceStatusVendorIds,
  parseProviderServiceStatusSummary,
  PROVIDER_SERVICE_STATUS_CONFIG,
} from "../shared/provider-service-status";

export const PROVIDER_SERVICE_STATUS_TTL_MS = 5 * 60_000;
export const PROVIDER_SERVICE_STATUS_TIMEOUT_MS = 8_000;
export const PROVIDER_SERVICE_STATUS_MAX_RESPONSE_BYTES = 128 * 1024;
const DEFAULT_FAILURE_BACKOFF_MS = 5 * 60_000;
const RATE_LIMIT_BACKOFF_MS = 15 * 60_000;

type StatusFetch = (
  input: string,
  init?: RequestInit,
) => Promise<Pick<Response, "ok" | "status" | "headers" | "text">>;

type SyncProviderServiceStatusesOptions = {
  now?: Date;
  fetcher?: StatusFetch;
  hasHostAccess?: (
    vendorId: ProviderServiceStatusVendorId,
  ) => Promise<boolean>;
  isOnline?: () => boolean;
};

const activeStatusRequests = new Map<
  ProviderServiceStatusVendorId,
  Promise<ProviderServiceStatus>
>();

function parseTime(value: string | null): number | null {
  if (!value) {
    return null;
  }
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : null;
}

function isFresh(status: ProviderServiceStatus, nowMs: number): boolean {
  const checkedAt = parseTime(status.checkedAt);
  return (
    !status.stale &&
    status.failureReason === null &&
    checkedAt !== null &&
    nowMs - checkedAt < PROVIDER_SERVICE_STATUS_TTL_MS
  );
}

function isInBackoff(status: ProviderServiceStatus, nowMs: number): boolean {
  const retryAt = parseTime(status.retryAt);
  return status.failureReason !== null && retryAt !== null && retryAt > nowMs;
}

function buildFailureStatus(
  vendorId: ProviderServiceStatusVendorId,
  checkedAt: Date,
  reason: Exclude<ProviderServiceStatusFailureReason, null>,
  backoffMs = DEFAULT_FAILURE_BACKOFF_MS,
): ProviderServiceStatus {
  return createUnknownProviderServiceStatus({
    vendorId,
    checkedAt,
    failureReason: reason,
    retryAt: new Date(checkedAt.getTime() + backoffMs),
  });
}

function preserveLastSuccessfulStatus(
  previous: ProviderServiceStatus | undefined,
  failure: ProviderServiceStatus,
): ProviderServiceStatus {
  if (!previous) {
    return failure;
  }

  return {
    ...previous,
    failureReason: failure.failureReason,
    retryAt: failure.retryAt,
    stale: true,
  };
}

async function fetchStatusOnce({
  fetcher,
  now,
  vendorId,
}: {
  fetcher: StatusFetch;
  now: Date;
  vendorId: ProviderServiceStatusVendorId;
}): Promise<ProviderServiceStatus> {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    PROVIDER_SERVICE_STATUS_TIMEOUT_MS,
  );

  try {
    const response = await fetcher(
      PROVIDER_SERVICE_STATUS_CONFIG[vendorId].endpointUrl,
      {
        cache: "no-store",
        credentials: "omit",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      },
    );

    if (response.status === 429) {
      return buildFailureStatus(
        vendorId,
        now,
        "rate_limited",
        RATE_LIMIT_BACKOFF_MS,
      );
    }
    if (!response.ok) {
      return buildFailureStatus(vendorId, now, "http_error");
    }

    const declaredLength = Number(response.headers.get("content-length"));
    if (
      Number.isFinite(declaredLength) &&
      declaredLength > PROVIDER_SERVICE_STATUS_MAX_RESPONSE_BYTES
    ) {
      return buildFailureStatus(vendorId, now, "invalid_response");
    }

    const rawBody = await response.text();
    if (new TextEncoder().encode(rawBody).byteLength > PROVIDER_SERVICE_STATUS_MAX_RESPONSE_BYTES) {
      return buildFailureStatus(vendorId, now, "invalid_response");
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody) as unknown;
    } catch {
      return buildFailureStatus(vendorId, now, "invalid_response");
    }

    return (
      parseProviderServiceStatusSummary({ vendorId, checkedAt: now, payload }) ??
      buildFailureStatus(vendorId, now, "invalid_response")
    );
  } catch (error) {
    return buildFailureStatus(
      vendorId,
      now,
      error instanceof DOMException && error.name === "AbortError"
        ? "timeout"
        : "offline",
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

function fetchStatusCoalesced(
  vendorId: ProviderServiceStatusVendorId,
  run: () => Promise<ProviderServiceStatus>,
): Promise<ProviderServiceStatus> {
  const active = activeStatusRequests.get(vendorId);
  if (active) {
    return active;
  }

  const next = run();
  activeStatusRequests.set(vendorId, next);
  void next.then(
    () => {
      if (activeStatusRequests.get(vendorId) === next) {
        activeStatusRequests.delete(vendorId);
      }
    },
    () => {
      if (activeStatusRequests.get(vendorId) === next) {
        activeStatusRequests.delete(vendorId);
      }
    },
  );
  return next;
}

export async function syncProviderServiceStatuses(
  state: AppState,
  options: SyncProviderServiceStatusesOptions = {},
): Promise<AppState> {
  const enabledVendorIds = getEnabledProviderServiceStatusVendorIds(
    state.settings.providerServiceStatusVisibilityBySurface,
  );
  if (enabledVendorIds.length === 0) {
    return state;
  }

  const now = options.now ?? new Date();
  const nowMs = now.getTime();
  const fetcher = options.fetcher ?? fetch;
  const hasHostAccess =
    options.hasHostAccess ?? hasProviderServiceStatusHostAccess;
  const isOnline =
    options.isOnline ??
    (() => typeof navigator === "undefined" || navigator.onLine !== false);
  const existingByVendor = new Map(
    (state.providerServiceStatuses ?? []).map((status) => [
      status.vendorId,
      status,
    ]),
  );

  const updates = await Promise.all(
    enabledVendorIds.map(async (vendorId) => {
      const existing = existingByVendor.get(vendorId);
      if (existing && (isFresh(existing, nowMs) || isInBackoff(existing, nowMs))) {
        return existing;
      }
      if (!isOnline()) {
        return preserveLastSuccessfulStatus(
          existing,
          buildFailureStatus(vendorId, now, "offline"),
        );
      }
      if (!(await hasHostAccess(vendorId))) {
        return preserveLastSuccessfulStatus(
          existing,
          buildFailureStatus(vendorId, now, "permission_missing"),
        );
      }

      const fetched = await fetchStatusCoalesced(vendorId, () =>
        fetchStatusOnce({ fetcher, now, vendorId }),
      );
      return fetched.failureReason
        ? preserveLastSuccessfulStatus(existing, fetched)
        : fetched;
    }),
  );

  for (const status of updates) {
    existingByVendor.set(status.vendorId, status);
  }

  return {
    ...state,
    providerServiceStatuses: [...existingByVendor.values()],
  };
}
