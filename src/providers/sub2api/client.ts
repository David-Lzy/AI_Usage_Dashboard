import type {
  ApiGatewayDailyUsage,
  ApiGatewayMeteringSnapshot,
  ApiGatewayModelUsage,
  ApiGatewayMoney,
  ApiGatewayUsageMetric,
  ProviderAccountId,
  SyncTrigger,
} from "../types";
import { normalizeApiGatewayMeteringSnapshot } from "../../shared/api-gateway-metering";
import { getSub2ApiUsageUrl } from "./connection";
import type { ApiGatewayConnectionMetadata } from "../types";

export type Sub2ApiClientErrorCode =
  | "credential_rejected"
  | "access_forbidden"
  | "rate_limited"
  | "server_error"
  | "network_error"
  | "timeout"
  | "cancelled"
  | "redirect_rejected"
  | "non_json_response"
  | "response_too_large"
  | "invalid_response";

export class Sub2ApiClientError extends Error {
  readonly code: Sub2ApiClientErrorCode;
  readonly retryAfterMs: number | null;

  constructor(
    code: Sub2ApiClientErrorCode,
    message: string,
    retryAfterMs: number | null = null,
  ) {
    super(message);
    this.name = "Sub2ApiClientError";
    this.code = code;
    this.retryAfterMs = retryAfterMs;
  }
}

export type FetchSub2ApiUsageOptions = Readonly<{
  accountId: ProviderAccountId;
  connection: ApiGatewayConnectionMetadata;
  apiKey: string;
  trigger: SyncTrigger;
  signal?: AbortSignal;
  timezone?: string;
  days?: number;
  now?: () => number;
  fetchImpl?: typeof fetch;
}>;

const MAX_RESPONSE_BYTES = 128 * 1024;
const RESULT_CACHE_TTL_MS = 60_000;
const HISTORY_CACHE_TTL_MS = 15 * 60_000;
const CACHE_KEY_SEPARATOR = "\u0000";

type CacheEntry = Readonly<{
  value: ApiGatewayMeteringSnapshot;
  storedAt: number;
}>;

const resultCache = new Map<string, CacheEntry>();
const historyCache = new Map<string, CacheEntry>();
const inflightRequests = new Map<string, Promise<ApiGatewayMeteringSnapshot>>();

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function firstValue(source: UnknownRecord, ...keys: string[]): unknown {
  for (const key of keys) {
    if (source[key] !== undefined) {
      return source[key];
    }
  }
  return undefined;
}

function optionalNonNegativeNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

function optionalNonNegativeInteger(value: unknown): number | null {
  const number = optionalNonNegativeNumber(value);
  return number !== null && Number.isInteger(number) ? number : null;
}

function optionalText(value: unknown, maxLength: number): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const normalized = String(value).trim().replace(/\s+/g, " ");
  return normalized && normalized.length <= maxLength && !/[<>]/.test(normalized)
    ? normalized
    : null;
}

function optionalTimestamp(value: unknown): string | null {
  const text = optionalText(value, 64);
  if (!text) {
    return null;
  }
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function money(value: unknown, unit: string | null): ApiGatewayMoney | null {
  const amount = optionalNonNegativeNumber(value);
  return amount === null || !unit ? null : { amount, unit };
}

function subscriptionMoney(
  source: UnknownRecord,
  usdKey: string,
  genericKey: string,
  unit: string | null,
): ApiGatewayMoney | null {
  if (source[usdKey] !== undefined) {
    return money(source[usdKey], "USD");
  }
  return money(source[genericKey], unit);
}

function parseMetric(
  value: unknown,
  unit: string | null,
): ApiGatewayUsageMetric | null {
  if (!isRecord(value)) {
    return null;
  }
  return {
    requests: optionalNonNegativeInteger(value.requests),
    inputTokens: optionalNonNegativeInteger(
      firstValue(value, "input_tokens", "inputTokens"),
    ),
    outputTokens: optionalNonNegativeInteger(
      firstValue(value, "output_tokens", "outputTokens"),
    ),
    cacheCreationTokens: optionalNonNegativeInteger(
      firstValue(
        value,
        "cache_creation_tokens",
        "cache_write_tokens",
        "cacheCreationTokens",
      ),
    ),
    cacheReadTokens: optionalNonNegativeInteger(
      firstValue(value, "cache_read_tokens", "cacheReadTokens"),
    ),
    totalTokens: optionalNonNegativeInteger(
      firstValue(value, "total_tokens", "totalTokens"),
    ),
    referenceCost: money(firstValue(value, "cost", "reference_cost"), unit),
    actualCost: money(firstValue(value, "actual_cost", "actualCost"), unit),
  };
}

function parseDailyUsage(
  value: unknown,
  unit: string | null,
): ApiGatewayDailyUsage[] | null {
  if (value === undefined) {
    return null;
  }
  if (!Array.isArray(value) || value.length > 366) {
    throw new Sub2ApiClientError(
      "invalid_response",
      "The usage response contains an invalid daily history.",
    );
  }
  return value.map((entry) => {
    if (!isRecord(entry)) {
      throw new Sub2ApiClientError(
        "invalid_response",
        "The usage response contains an invalid daily entry.",
      );
    }
    const date = optionalText(entry.date, 10);
    const totals = parseMetric(entry, unit);
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !totals) {
      throw new Sub2ApiClientError(
        "invalid_response",
        "The usage response contains an invalid daily entry.",
      );
    }
    return { date, totals };
  });
}

function parseModelUsage(
  value: unknown,
  unit: string | null,
): ApiGatewayModelUsage[] | null {
  if (value === undefined) {
    return null;
  }
  if (!Array.isArray(value) || value.length > 128) {
    throw new Sub2ApiClientError(
      "invalid_response",
      "The usage response contains an invalid model breakdown.",
    );
  }
  return value.map((entry) => {
    if (!isRecord(entry)) {
      throw new Sub2ApiClientError(
        "invalid_response",
        "The usage response contains an invalid model entry.",
      );
    }
    const label = optionalText(firstValue(entry, "model", "label"), 120);
    const totals = parseMetric(entry, unit);
    if (!label || !totals) {
      throw new Sub2ApiClientError(
        "invalid_response",
        "The usage response contains an invalid model entry.",
      );
    }
    return { id: label, label, totals };
  });
}

export function parseSub2ApiUsageResponse(
  input: unknown,
  context: Readonly<{
    accountId: ProviderAccountId;
    connection: ApiGatewayConnectionMetadata;
    capturedAt: string;
    previousHistory?: ApiGatewayMeteringSnapshot | null;
  }>,
): ApiGatewayMeteringSnapshot {
  if (!isRecord(input)) {
    throw new Sub2ApiClientError(
      "invalid_response",
      "The usage endpoint did not return a JSON object.",
    );
  }
  const mode = optionalText(input.mode, 32);
  if (mode !== "quota_limited" && mode !== "unrestricted") {
    throw new Sub2ApiClientError(
      "invalid_response",
      "The usage response mode is unsupported.",
    );
  }
  const quotaSource = input.quota;
  const subscriptionSource = input.subscription;
  if (
    (quotaSource !== undefined && quotaSource !== null && !isRecord(quotaSource)) ||
    (subscriptionSource !== undefined &&
      subscriptionSource !== null &&
      !isRecord(subscriptionSource))
  ) {
    throw new Sub2ApiClientError(
      "invalid_response",
      "The usage response contains an invalid allowance.",
    );
  }
  const quota = isRecord(quotaSource) ? quotaSource : null;
  const subscription = isRecord(subscriptionSource) ? subscriptionSource : null;
  const unit =
    optionalText(input.unit, 16) ??
    optionalText(quota?.unit, 16);
  const usageSource = input.usage;
  if (usageSource !== undefined && usageSource !== null && !isRecord(usageSource)) {
    throw new Sub2ApiClientError(
      "invalid_response",
      "The usage response contains an invalid usage summary.",
    );
  }
  const usage = isRecord(usageSource) ? usageSource : null;
  const dailyUsage = parseDailyUsage(
    firstValue(input, "daily_usage", "dailyUsage"),
    unit,
  );
  const modelUsage = parseModelUsage(
    firstValue(input, "model_stats", "modelStats"),
    unit,
  );
  const previousHistory = context.previousHistory;
  const rateLimitsSource = firstValue(input, "rate_limits", "rateLimits");
  if (
    rateLimitsSource !== undefined &&
    rateLimitsSource !== null &&
    !Array.isArray(rateLimitsSource)
  ) {
    throw new Sub2ApiClientError(
      "invalid_response",
      "The usage response contains invalid rate limits.",
    );
  }

  const candidate: ApiGatewayMeteringSnapshot = {
    schemaVersion: 1,
    accountId: context.accountId,
    productKind: "metered_api_gateway",
    displayLabel: context.connection.displayLabel,
    origin: context.connection.baseUrl,
    transport: context.connection.baseUrl.startsWith("https:")
      ? "https"
      : "http",
    scope: "api_key",
    billingMode: quota
      ? "quota"
      : subscription
        ? "subscription"
        : optionalNonNegativeNumber(input.balance) !== null
          ? "wallet"
          : "unrestricted",
    capturedAt: context.capturedAt,
    stale: false,
    isValid: typeof input.isValid === "boolean" ? input.isValid : null,
    status: optionalText(input.status, 48),
    planName: optionalText(firstValue(input, "planName", "plan_name"), 120),
    remaining: money(input.remaining, unit),
    balance: money(input.balance, unit),
    quota: quota
      ? {
          limit: money(quota.limit, optionalText(quota.unit, 16) ?? unit),
          used: money(quota.used, optionalText(quota.unit, 16) ?? unit),
          remaining: money(
            quota.remaining,
            optionalText(quota.unit, 16) ?? unit,
          ),
        }
      : null,
    subscription: subscription
      ? {
          dailyUsage: subscriptionMoney(
            subscription,
            "daily_usage_usd",
            "dailyUsage",
            unit,
          ),
          weeklyUsage: subscriptionMoney(
            subscription,
            "weekly_usage_usd",
            "weeklyUsage",
            unit,
          ),
          monthlyUsage: subscriptionMoney(
            subscription,
            "monthly_usage_usd",
            "monthlyUsage",
            unit,
          ),
          dailyLimit: subscriptionMoney(
            subscription,
            "daily_limit_usd",
            "dailyLimit",
            unit,
          ),
          weeklyLimit: subscriptionMoney(
            subscription,
            "weekly_limit_usd",
            "weeklyLimit",
            unit,
          ),
          monthlyLimit: subscriptionMoney(
            subscription,
            "monthly_limit_usd",
            "monthlyLimit",
            unit,
          ),
          expiresAt: optionalTimestamp(
            firstValue(subscription, "expires_at", "expiresAt"),
          ),
        }
      : null,
    rateLimits: Array.isArray(rateLimitsSource)
      ? rateLimitsSource.map((entry) => {
          if (!isRecord(entry)) {
            throw new Sub2ApiClientError(
              "invalid_response",
              "The usage response contains an invalid rate-limit entry.",
            );
          }
          const id = optionalText(firstValue(entry, "window", "id"), 32);
          if (!id) {
            throw new Sub2ApiClientError(
              "invalid_response",
              "The usage response contains an invalid rate-limit identifier.",
            );
          }
          return {
            id,
            limit: money(entry.limit, unit),
            used: money(entry.used, unit),
            remaining: money(entry.remaining, unit),
            windowStart: optionalTimestamp(
              firstValue(entry, "window_start", "windowStart"),
            ),
            resetAt: optionalTimestamp(firstValue(entry, "reset_at", "resetAt")),
          };
        })
      : [],
    usage: usage
      ? {
          today: parseMetric(usage.today, unit),
          total: parseMetric(usage.total, unit),
          averageDurationMs: optionalNonNegativeNumber(
            firstValue(usage, "average_duration_ms", "averageDurationMs"),
          ),
          requestsPerMinute: optionalNonNegativeNumber(
            firstValue(usage, "rpm", "requestsPerMinute"),
          ),
          tokensPerMinute: optionalNonNegativeNumber(
            firstValue(usage, "tpm", "tokensPerMinute"),
          ),
        }
      : null,
    dailyUsage: dailyUsage ?? previousHistory?.dailyUsage ?? [],
    modelUsage: modelUsage ?? previousHistory?.modelUsage ?? [],
    modelSeriesTruncated:
      (modelUsage?.length ?? previousHistory?.modelUsage.length ?? 0) > 16 ||
      (modelUsage === null && previousHistory?.modelSeriesTruncated === true),
  };
  const normalized = normalizeApiGatewayMeteringSnapshot(candidate);
  if (!normalized) {
    throw new Sub2ApiClientError(
      "invalid_response",
      "The usage response failed bounded schema validation.",
    );
  }
  return normalized;
}

function parseRetryAfter(value: string | null, now: number): number | null {
  if (!value) {
    return null;
  }
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(seconds * 1000, 24 * 60 * 60 * 1000);
  }
  const date = Date.parse(value);
  return Number.isFinite(date) ? Math.max(0, date - now) : null;
}

async function readBoundedText(response: Response): Promise<string> {
  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_RESPONSE_BYTES) {
    throw new Sub2ApiClientError(
      "response_too_large",
      "The usage response exceeds the allowed size.",
    );
  }
  if (!response.body) {
    const text = await response.text();
    if (new TextEncoder().encode(text).byteLength > MAX_RESPONSE_BYTES) {
      throw new Sub2ApiClientError(
        "response_too_large",
        "The usage response exceeds the allowed size.",
      );
    }
    return text;
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const result = await reader.read();
    if (result.done) {
      break;
    }
    size += result.value.byteLength;
    if (size > MAX_RESPONSE_BYTES) {
      await reader.cancel();
      throw new Sub2ApiClientError(
        "response_too_large",
        "The usage response exceeds the allowed size.",
      );
    }
    chunks.push(result.value);
  }
  const merged = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(merged);
}

async function digestSecret(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

async function createCacheKey(
  accountId: ProviderAccountId,
  connection: ApiGatewayConnectionMetadata,
  apiKey: string,
): Promise<string> {
  return [accountId, connection.baseUrl, await digestSecret(apiKey)].join(
    CACHE_KEY_SEPARATOR,
  );
}

async function performFetch(
  options: FetchSub2ApiUsageOptions,
  cacheKey: string,
): Promise<ApiGatewayMeteringSnapshot> {
  const now = options.now ?? Date.now;
  const fetchImpl = options.fetchImpl ?? fetch;
  const timezone =
    options.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
  const requestUrl = getSub2ApiUsageUrl(options.connection, {
    days: options.days ?? 31,
    timezone,
  });
  let response: Response;
  try {
    response = await fetchImpl(requestUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${options.apiKey}`,
      },
      credentials: "omit",
      cache: "no-store",
      redirect: "manual",
      signal: options.signal,
    });
  } catch (error) {
    if (options.signal?.aborted) {
      throw new Sub2ApiClientError("cancelled", "The usage request was cancelled.");
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Sub2ApiClientError("timeout", "The usage request timed out.");
    }
    throw new Sub2ApiClientError(
      "network_error",
      "The usage endpoint could not be reached.",
    );
  }
  if (response.status >= 300 && response.status < 400) {
    throw new Sub2ApiClientError(
      "redirect_rejected",
      "The usage endpoint attempted a redirect.",
    );
  }
  if (response.status === 401) {
    throw new Sub2ApiClientError(
      "credential_rejected",
      "The deployment rejected the configured API key.",
    );
  }
  if (response.status === 403) {
    throw new Sub2ApiClientError(
      "access_forbidden",
      "The configured API key cannot access usage data.",
    );
  }
  if (response.status === 429) {
    throw new Sub2ApiClientError(
      "rate_limited",
      "The deployment rate-limited the usage request.",
      parseRetryAfter(response.headers.get("retry-after"), now()),
    );
  }
  if (response.status >= 500) {
    throw new Sub2ApiClientError(
      "server_error",
      "The deployment returned a temporary server error.",
    );
  }
  if (!response.ok) {
    throw new Sub2ApiClientError(
      "invalid_response",
      "The deployment returned an unsupported response status.",
    );
  }
  const responseUrl = response.url ? new URL(response.url) : null;
  if (
    response.redirected ||
    (responseUrl && responseUrl.origin !== options.connection.baseUrl)
  ) {
    throw new Sub2ApiClientError(
      "redirect_rejected",
      "The usage response crossed the configured origin boundary.",
    );
  }
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("json")) {
    throw new Sub2ApiClientError(
      "non_json_response",
      "The usage endpoint did not return JSON.",
    );
  }
  const text = await readBoundedText(response);
  let payload: unknown;
  try {
    payload = JSON.parse(text) as unknown;
  } catch {
    throw new Sub2ApiClientError(
      "invalid_response",
      "The usage endpoint returned malformed JSON.",
    );
  }
  const history = historyCache.get(cacheKey);
  const value = parseSub2ApiUsageResponse(payload, {
    accountId: options.accountId,
    connection: options.connection,
    capturedAt: new Date(now()).toISOString(),
    previousHistory:
      history && now() - history.storedAt <= HISTORY_CACHE_TTL_MS
        ? history.value
        : null,
  });
  const entry = { value, storedAt: now() };
  resultCache.set(cacheKey, entry);
  if (value.dailyUsage.length > 0 || value.modelUsage.length > 0) {
    historyCache.set(cacheKey, entry);
  }
  return value;
}

export async function fetchSub2ApiUsage(
  options: FetchSub2ApiUsageOptions,
): Promise<ApiGatewayMeteringSnapshot> {
  const apiKey = options.apiKey.trim();
  if (!apiKey) {
    throw new Sub2ApiClientError(
      "credential_rejected",
      "A Sub2API API key is required.",
    );
  }
  const cacheKey = await createCacheKey(
    options.accountId,
    options.connection,
    apiKey,
  );
  const now = options.now ?? Date.now;
  const cached = resultCache.get(cacheKey);
  if (
    options.trigger !== "manual" &&
    cached &&
    now() - cached.storedAt <= RESULT_CACHE_TTL_MS
  ) {
    return cached.value;
  }
  const active = inflightRequests.get(cacheKey);
  if (active) {
    return active;
  }
  const request = performFetch({ ...options, apiKey }, cacheKey);
  inflightRequests.set(cacheKey, request);
  const clearInflight = () => {
    if (inflightRequests.get(cacheKey) === request) {
      inflightRequests.delete(cacheKey);
    }
  };
  void request.then(clearInflight, clearInflight);
  return request;
}

export function resetSub2ApiClientCachesForTests(): void {
  resultCache.clear();
  historyCache.clear();
  inflightRequests.clear();
}
