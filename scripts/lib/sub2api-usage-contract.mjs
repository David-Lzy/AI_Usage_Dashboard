export const SUB2API_USAGE_DISCOVERY_FIXTURE_SCHEMA =
  "ai-usage-dashboard.sub2api-usage-discovery.v1";

const MAX_FIXTURE_BYTES = 128 * 1024;
const MAX_DAILY_POINTS = 31;
const MAX_MODEL_SERIES = 16;
const MAX_RATE_LIMITS = 8;
const FORBIDDEN_FIXTURE_KEYS = new Set([
  "access_token",
  "account_id",
  "api_key_id",
  "authorization",
  "cookie",
  "email",
  "key_name",
  "password",
  "prompt",
  "refresh_token",
  "request_id",
  "user_id",
]);

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function boundedText(value, label, maxLength = 160) {
  if (typeof value !== "string") {
    throw new Error(`${label} must be a string.`);
  }
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized || normalized.length > maxLength || /[<>]/.test(normalized)) {
    throw new Error(`${label} is empty, oversized, or contains markup.`);
  }
  return normalized;
}

function optionalText(value, label, maxLength = 160) {
  return value === undefined || value === null
    ? null
    : boundedText(value, label, maxLength);
}

function nonNegativeNumber(value, label, { integer = false, nullable = false } = {}) {
  if (value === undefined || value === null) {
    if (nullable) {
      return null;
    }
    throw new Error(`${label} is required.`);
  }
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    (integer && !Number.isInteger(value))
  ) {
    throw new Error(`${label} must be a finite non-negative${integer ? " integer" : " number"}.`);
  }
  return value;
}

function nullableTimestamp(value, label) {
  if (value === undefined || value === null) {
    return null;
  }
  const timestamp = boundedText(value, label, 48);
  if (!Number.isFinite(Date.parse(timestamp))) {
    throw new Error(`${label} must be an ISO-compatible timestamp.`);
  }
  return timestamp;
}

function calendarDate(value, label) {
  const date = boundedText(value, label, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(`${date}T00:00:00Z`))) {
    throw new Error(`${label} must use YYYY-MM-DD.`);
  }
  return date;
}

function assertSanitizedFixture(value, path = "fixture") {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => assertSanitizedFixture(entry, `${path}[${index}]`));
    return;
  }
  if (!isRecord(value)) {
    if (
      typeof value === "string" &&
      (/\bBearer\s+\S+/i.test(value) || /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(value))
    ) {
      throw new Error(`${path} contains credential-like or account-identifying text.`);
    }
    return;
  }
  for (const [key, entry] of Object.entries(value)) {
    if (FORBIDDEN_FIXTURE_KEYS.has(key.toLowerCase())) {
      throw new Error(`${path}.${key} is forbidden in a sanitized fixture.`);
    }
    assertSanitizedFixture(entry, `${path}.${key}`);
  }
}

function parseDeploymentBaseUrl(value) {
  const url = new URL(boundedText(value, "deployment.baseUrl", 512));
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("deployment.baseUrl must use HTTP or HTTPS.");
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error("deployment.baseUrl must not contain credentials, query, or fragment data.");
  }
  return {
    origin: url.origin,
    transport: url.protocol === "https:" ? "https" : "http",
    insecureTransport: url.protocol === "http:",
  };
}

function parseUsageAggregate(value, label) {
  if (value === undefined || value === null) {
    return null;
  }
  if (!isRecord(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return {
    requests: nonNegativeNumber(value.requests, `${label}.requests`, {
      integer: true,
      nullable: true,
    }),
    inputTokens: nonNegativeNumber(value.input_tokens, `${label}.input_tokens`, {
      integer: true,
      nullable: true,
    }),
    outputTokens: nonNegativeNumber(value.output_tokens, `${label}.output_tokens`, {
      integer: true,
      nullable: true,
    }),
    cacheCreationTokens: nonNegativeNumber(
      value.cache_creation_tokens,
      `${label}.cache_creation_tokens`,
      { integer: true, nullable: true },
    ),
    cacheReadTokens: nonNegativeNumber(
      value.cache_read_tokens,
      `${label}.cache_read_tokens`,
      { integer: true, nullable: true },
    ),
    totalTokens: nonNegativeNumber(value.total_tokens, `${label}.total_tokens`, {
      integer: true,
      nullable: true,
    }),
    referenceCostUsd: nonNegativeNumber(value.cost, `${label}.cost`, {
      nullable: true,
    }),
    actualCostUsd: nonNegativeNumber(value.actual_cost, `${label}.actual_cost`, {
      nullable: true,
    }),
  };
}

function parseUsageSummary(value, label = "response.usage") {
  if (value === undefined || value === null) {
    return null;
  }
  if (!isRecord(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return {
    today: parseUsageAggregate(value.today, `${label}.today`),
    total: parseUsageAggregate(value.total, `${label}.total`),
    averageDurationMs: nonNegativeNumber(
      value.average_duration_ms,
      `${label}.average_duration_ms`,
      { nullable: true },
    ),
    rpm: nonNegativeNumber(value.rpm, `${label}.rpm`, {
      integer: true,
      nullable: true,
    }),
    tpm: nonNegativeNumber(value.tpm, `${label}.tpm`, {
      integer: true,
      nullable: true,
    }),
  };
}

function parseDailyUsage(value, label) {
  if (value === undefined || value === null) {
    return [];
  }
  if (!Array.isArray(value) || value.length > MAX_DAILY_POINTS) {
    throw new Error(`${label} must contain at most ${MAX_DAILY_POINTS} daily points.`);
  }
  const dates = new Set();
  return value
    .map((point, index) => {
      if (!isRecord(point)) {
        throw new Error(`${label}[${index}] must be an object.`);
      }
      const date = calendarDate(point.date, `${label}[${index}].date`);
      if (dates.has(date)) {
        throw new Error(`${label} contains duplicate date ${date}.`);
      }
      dates.add(date);
      return {
        date,
        ...parseUsageAggregate(
          {
            ...point,
            cache_creation_tokens:
              point.cache_creation_tokens ?? point.cache_write_tokens,
          },
          `${label}[${index}]`,
        ),
      };
    })
    .sort((left, right) => left.date.localeCompare(right.date));
}

function parseModelStats(value, label) {
  if (value === undefined || value === null) {
    return [];
  }
  if (!Array.isArray(value) || value.length > MAX_MODEL_SERIES) {
    throw new Error(`${label} must contain at most ${MAX_MODEL_SERIES} model series.`);
  }
  return value.map((model, index) => {
    if (!isRecord(model)) {
      throw new Error(`${label}[${index}] must be an object.`);
    }
    return {
      id: boundedText(model.model, `${label}[${index}].model`, 120),
      ...parseUsageAggregate(model, `${label}[${index}]`),
    };
  });
}

function parseRateLimits(value) {
  if (value === undefined || value === null) {
    return [];
  }
  if (!Array.isArray(value) || value.length > MAX_RATE_LIMITS) {
    throw new Error(`response.rate_limits must contain at most ${MAX_RATE_LIMITS} entries.`);
  }
  return value.map((entry, index) => {
    if (!isRecord(entry)) {
      throw new Error(`response.rate_limits[${index}] must be an object.`);
    }
    const window = boundedText(entry.window, `response.rate_limits[${index}].window`, 32);
    return {
      window,
      limitUsd: nonNegativeNumber(entry.limit, `response.rate_limits[${index}].limit`),
      usedUsd: nonNegativeNumber(entry.used, `response.rate_limits[${index}].used`),
      remainingUsd: nonNegativeNumber(
        entry.remaining,
        `response.rate_limits[${index}].remaining`,
      ),
      windowStart: nullableTimestamp(
        entry.window_start,
        `response.rate_limits[${index}].window_start`,
      ),
      resetAt: nullableTimestamp(
        entry.reset_at,
        `response.rate_limits[${index}].reset_at`,
      ),
    };
  });
}

function parseApiKeyResponse(response) {
  if (!isRecord(response)) {
    throw new Error("response must be an object.");
  }
  const mode = boundedText(response.mode, "response.mode", 32);
  if (!["quota_limited", "unrestricted"].includes(mode)) {
    throw new Error("response.mode is unsupported.");
  }
  const quota = response.quota;
  if (quota !== undefined && quota !== null && !isRecord(quota)) {
    throw new Error("response.quota must be an object.");
  }
  const subscription = response.subscription;
  if (subscription !== undefined && subscription !== null && !isRecord(subscription)) {
    throw new Error("response.subscription must be an object.");
  }
  const billingKind = quota
    ? "quota"
    : subscription
      ? "subscription"
      : response.balance !== undefined
        ? "wallet"
        : "unknown";

  return {
    scope: "api_key",
    mode,
    billingKind,
    isValid: typeof response.isValid === "boolean" ? response.isValid : null,
    status:
      response.status === undefined || response.status === null
        ? null
        : boundedText(String(response.status), "response.status", 48),
    planName: optionalText(response.planName, "response.planName", 120),
    unit: optionalText(response.unit, "response.unit", 16),
    remainingUsd: nonNegativeNumber(response.remaining, "response.remaining", {
      nullable: true,
    }),
    balanceUsd: nonNegativeNumber(response.balance, "response.balance", {
      nullable: true,
    }),
    quota: quota
      ? {
          limitUsd: nonNegativeNumber(quota.limit, "response.quota.limit"),
          usedUsd: nonNegativeNumber(quota.used, "response.quota.used"),
          remainingUsd: nonNegativeNumber(
            quota.remaining,
            "response.quota.remaining",
          ),
        }
      : null,
    subscription: subscription
      ? {
          dailyUsageUsd: nonNegativeNumber(
            subscription.daily_usage_usd,
            "response.subscription.daily_usage_usd",
            { nullable: true },
          ),
          weeklyUsageUsd: nonNegativeNumber(
            subscription.weekly_usage_usd,
            "response.subscription.weekly_usage_usd",
            { nullable: true },
          ),
          monthlyUsageUsd: nonNegativeNumber(
            subscription.monthly_usage_usd,
            "response.subscription.monthly_usage_usd",
            { nullable: true },
          ),
          dailyLimitUsd: nonNegativeNumber(
            subscription.daily_limit_usd,
            "response.subscription.daily_limit_usd",
            { nullable: true },
          ),
          weeklyLimitUsd: nonNegativeNumber(
            subscription.weekly_limit_usd,
            "response.subscription.weekly_limit_usd",
            { nullable: true },
          ),
          monthlyLimitUsd: nonNegativeNumber(
            subscription.monthly_limit_usd,
            "response.subscription.monthly_limit_usd",
            { nullable: true },
          ),
          expiresAt: nullableTimestamp(
            subscription.expires_at,
            "response.subscription.expires_at",
          ),
        }
      : null,
    rateLimits: parseRateLimits(response.rate_limits),
    usage: parseUsageSummary(response.usage),
    dailyUsage: parseDailyUsage(response.daily_usage, "response.daily_usage"),
    modelStats: parseModelStats(response.model_stats, "response.model_stats"),
  };
}

function parseAccountResponse(response) {
  if (!isRecord(response) || response.code !== 0 || !isRecord(response.data)) {
    throw new Error("Account dashboard response must use a successful data envelope.");
  }
  const data = response.data;
  return {
    scope: "account",
    mode: "account_dashboard",
    generatedAt: nullableTimestamp(data.generated_at, "response.data.generated_at"),
    rangeStart: calendarDate(data.start_date, "response.data.start_date"),
    rangeEnd: calendarDate(data.end_date, "response.data.end_date"),
    granularity: boundedText(data.granularity, "response.data.granularity", 16),
    dailyUsage: parseDailyUsage(data.trend, "response.data.trend"),
    modelStats: parseModelStats(data.models, "response.data.models"),
  };
}

export function parseSub2ApiUsageDiscoveryFixture(input) {
  if (!isRecord(input)) {
    throw new Error("Sub2API discovery fixture must be an object.");
  }
  const encoded = JSON.stringify(input);
  if (Buffer.byteLength(encoded, "utf8") > MAX_FIXTURE_BYTES) {
    throw new Error(`Sub2API discovery fixture exceeds ${MAX_FIXTURE_BYTES} bytes.`);
  }
  assertSanitizedFixture(input);
  if (input.fixtureSchema !== SUB2API_USAGE_DISCOVERY_FIXTURE_SCHEMA) {
    throw new Error("Sub2API discovery fixture schema is unsupported.");
  }
  if (input.fixtureKind !== "synthetic_contract_example") {
    throw new Error("Sub2API discovery fixture kind is unsupported.");
  }
  if (!isRecord(input.deployment)) {
    throw new Error("deployment is required.");
  }
  const deployment = parseDeploymentBaseUrl(input.deployment.baseUrl);
  const scope = input.scope;
  if (!["api_key", "account"].includes(scope)) {
    throw new Error("scope must be api_key or account.");
  }
  const endpoint = boundedText(input.request?.path, "request.path", 160);
  const expectedEndpoint =
    scope === "api_key" ? "/v1/usage" : "/api/v1/usage/dashboard/snapshot-v2";
  if (endpoint !== expectedEndpoint) {
    throw new Error(`request.path must be ${expectedEndpoint} for ${scope} scope.`);
  }
  const auth = boundedText(input.request?.auth, "request.auth", 64);
  const expectedAuth = scope === "api_key" ? "bearer_api_key" : "bearer_user_session";
  if (auth !== expectedAuth) {
    throw new Error(`request.auth must be ${expectedAuth} for ${scope} scope.`);
  }

  return {
    fixtureId: boundedText(input.fixtureId, "fixtureId", 96),
    deployment,
    endpoint,
    auth,
    contract:
      scope === "api_key"
        ? parseApiKeyResponse(input.response)
        : parseAccountResponse(input.response),
  };
}
