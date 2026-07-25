import type {
  ApiGatewayAllowance,
  ApiGatewayBillingMode,
  ApiGatewayDailyUsage,
  ApiGatewayMeteringDisplayPreferences,
  ApiGatewayMeteringModuleId,
  ApiGatewayMeteringModulePreference,
  ApiGatewayMeteringScope,
  ApiGatewayMeteringSnapshot,
  ApiGatewayModelUsage,
  ApiGatewayMoney,
  ApiGatewayRateLimitWindow,
  ApiGatewaySubscriptionAllowance,
  ApiGatewayUsageMetric,
  ApiGatewayUsageSummary,
  DisplaySurface,
} from "../providers/types";

export const MAX_API_GATEWAY_DAILY_BUCKETS = 31;
export const MAX_API_GATEWAY_MODEL_SERIES = 16;
export const MAX_API_GATEWAY_RATE_LIMITS = 8;

const MAX_INPUT_DAILY_BUCKETS = 366;
const MAX_INPUT_MODEL_SERIES = 128;
const MAX_COUNT = 1_000_000_000_000;
const MAX_TOKEN_COUNT = 1_000_000_000_000_000;
const MAX_MONEY_AMOUNT = 1_000_000_000_000;
const MAX_DURATION_MS = 86_400_000;
const ACCOUNT_ID_PATTERN = /^(?:default|account_[a-z0-9-]{8,80})$/i;
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DISPLAY_SURFACES: readonly DisplaySurface[] = [
  "popup",
  "sidebar",
  "fullPage",
];
const MODULE_IDS: readonly ApiGatewayMeteringModuleId[] = [
  "summary",
  "trend",
  "model_breakdown",
  "limit_windows",
];

type UnknownRecord = Record<string, unknown>;
type Normalized<T> = { valid: true; value: T } | { valid: false };

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeText(
  value: unknown,
  maxLength: number,
  allowNull = false,
): Normalized<string | null> {
  if (value === null || value === undefined) {
    return allowNull ? { valid: true, value: null } : { valid: false };
  }
  if (typeof value !== "string") {
    return { valid: false };
  }
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized && normalized.length <= maxLength && !/[<>]/.test(normalized)
    ? { valid: true, value: normalized }
    : { valid: false };
}

function normalizeOptionalNumber(
  value: unknown,
  options: Readonly<{ max: number; integer?: boolean }>,
): Normalized<number | null> {
  if (value === null || value === undefined) {
    return { valid: true, value: null };
  }
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > options.max ||
    (options.integer && !Number.isInteger(value))
  ) {
    return { valid: false };
  }
  return { valid: true, value };
}

function normalizeTimestamp(value: unknown): Normalized<string | null> {
  if (value === null || value === undefined) {
    return { valid: true, value: null };
  }
  if (typeof value !== "string" || !value.trim()) {
    return { valid: false };
  }
  const timestamp = new Date(value);
  return Number.isNaN(timestamp.getTime())
    ? { valid: false }
    : { valid: true, value: timestamp.toISOString() };
}

function normalizeRequiredTimestamp(value: unknown): string | null {
  const result = normalizeTimestamp(value);
  return result.valid ? result.value : null;
}

function normalizeDateKey(value: unknown): string | null {
  if (typeof value !== "string" || !DATE_KEY_PATTERN.test(value)) {
    return null;
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
    ? value
    : null;
}

function normalizeMoney(value: unknown): Normalized<ApiGatewayMoney | null> {
  if (value === null || value === undefined) {
    return { valid: true, value: null };
  }
  if (!isRecord(value)) {
    return { valid: false };
  }
  const amount = normalizeOptionalNumber(value.amount, {
    max: MAX_MONEY_AMOUNT,
  });
  const unit = normalizeText(value.unit, 16);
  if (!amount.valid || amount.value === null || !unit.valid || !unit.value) {
    return { valid: false };
  }
  return {
    valid: true,
    value: { amount: amount.value, unit: unit.value },
  };
}

function normalizeMetric(value: unknown): Normalized<ApiGatewayUsageMetric | null> {
  if (value === null || value === undefined) {
    return { valid: true, value: null };
  }
  if (!isRecord(value)) {
    return { valid: false };
  }
  const requests = normalizeOptionalNumber(value.requests, {
    max: MAX_COUNT,
    integer: true,
  });
  const inputTokens = normalizeOptionalNumber(value.inputTokens, {
    max: MAX_TOKEN_COUNT,
    integer: true,
  });
  const outputTokens = normalizeOptionalNumber(value.outputTokens, {
    max: MAX_TOKEN_COUNT,
    integer: true,
  });
  const cacheCreationTokens = normalizeOptionalNumber(
    value.cacheCreationTokens,
    { max: MAX_TOKEN_COUNT, integer: true },
  );
  const cacheReadTokens = normalizeOptionalNumber(value.cacheReadTokens, {
    max: MAX_TOKEN_COUNT,
    integer: true,
  });
  const totalTokens = normalizeOptionalNumber(value.totalTokens, {
    max: MAX_TOKEN_COUNT,
    integer: true,
  });
  const referenceCost = normalizeMoney(value.referenceCost);
  const actualCost = normalizeMoney(value.actualCost);
  if (
    !requests.valid ||
    !inputTokens.valid ||
    !outputTokens.valid ||
    !cacheCreationTokens.valid ||
    !cacheReadTokens.valid ||
    !totalTokens.valid ||
    !referenceCost.valid ||
    !actualCost.valid
  ) {
    return { valid: false };
  }
  return {
    valid: true,
    value: {
      requests: requests.value,
      inputTokens: inputTokens.value,
      outputTokens: outputTokens.value,
      cacheCreationTokens: cacheCreationTokens.value,
      cacheReadTokens: cacheReadTokens.value,
      totalTokens: totalTokens.value,
      referenceCost: referenceCost.value,
      actualCost: actualCost.value,
    },
  };
}

function normalizeAllowance(value: unknown): Normalized<ApiGatewayAllowance | null> {
  if (value === null || value === undefined) {
    return { valid: true, value: null };
  }
  if (!isRecord(value)) {
    return { valid: false };
  }
  const limit = normalizeMoney(value.limit);
  const used = normalizeMoney(value.used);
  const remaining = normalizeMoney(value.remaining);
  if (!limit.valid || !used.valid || !remaining.valid) {
    return { valid: false };
  }
  return {
    valid: true,
    value: {
      limit: limit.value,
      used: used.value,
      remaining: remaining.value,
    },
  };
}

function normalizeSubscription(
  value: unknown,
): Normalized<ApiGatewaySubscriptionAllowance | null> {
  if (value === null || value === undefined) {
    return { valid: true, value: null };
  }
  if (!isRecord(value)) {
    return { valid: false };
  }
  const dailyUsage = normalizeMoney(value.dailyUsage);
  const weeklyUsage = normalizeMoney(value.weeklyUsage);
  const monthlyUsage = normalizeMoney(value.monthlyUsage);
  const dailyLimit = normalizeMoney(value.dailyLimit);
  const weeklyLimit = normalizeMoney(value.weeklyLimit);
  const monthlyLimit = normalizeMoney(value.monthlyLimit);
  const expiresAt = normalizeTimestamp(value.expiresAt);
  if (
    !dailyUsage.valid ||
    !weeklyUsage.valid ||
    !monthlyUsage.valid ||
    !dailyLimit.valid ||
    !weeklyLimit.valid ||
    !monthlyLimit.valid ||
    !expiresAt.valid
  ) {
    return { valid: false };
  }
  return {
    valid: true,
    value: {
      dailyUsage: dailyUsage.value,
      weeklyUsage: weeklyUsage.value,
      monthlyUsage: monthlyUsage.value,
      dailyLimit: dailyLimit.value,
      weeklyLimit: weeklyLimit.value,
      monthlyLimit: monthlyLimit.value,
      expiresAt: expiresAt.value,
    },
  };
}

function normalizeRateLimits(
  value: unknown,
): Normalized<ApiGatewayRateLimitWindow[]> {
  if (value === null || value === undefined) {
    return { valid: true, value: [] };
  }
  if (!Array.isArray(value) || value.length > MAX_API_GATEWAY_RATE_LIMITS) {
    return { valid: false };
  }
  const ids = new Set<string>();
  const limits: ApiGatewayRateLimitWindow[] = [];
  for (const candidate of value) {
    if (!isRecord(candidate)) {
      return { valid: false };
    }
    const id = normalizeText(candidate.id, 32);
    const allowance = normalizeAllowance(candidate);
    const windowStart = normalizeTimestamp(candidate.windowStart);
    const resetAt = normalizeTimestamp(candidate.resetAt);
    if (
      !id.valid ||
      !id.value ||
      ids.has(id.value) ||
      !allowance.valid ||
      !allowance.value ||
      !windowStart.valid ||
      !resetAt.valid
    ) {
      return { valid: false };
    }
    ids.add(id.value);
    limits.push({
      id: id.value,
      ...allowance.value,
      windowStart: windowStart.value,
      resetAt: resetAt.value,
    });
  }
  return { valid: true, value: limits };
}

function normalizeUsageSummary(
  value: unknown,
): Normalized<ApiGatewayUsageSummary | null> {
  if (value === null || value === undefined) {
    return { valid: true, value: null };
  }
  if (!isRecord(value)) {
    return { valid: false };
  }
  const today = normalizeMetric(value.today);
  const total = normalizeMetric(value.total);
  const averageDurationMs = normalizeOptionalNumber(value.averageDurationMs, {
    max: MAX_DURATION_MS,
  });
  const requestsPerMinute = normalizeOptionalNumber(value.requestsPerMinute, {
    max: MAX_COUNT,
  });
  const tokensPerMinute = normalizeOptionalNumber(value.tokensPerMinute, {
    max: MAX_TOKEN_COUNT,
  });
  if (
    !today.valid ||
    !total.valid ||
    !averageDurationMs.valid ||
    !requestsPerMinute.valid ||
    !tokensPerMinute.valid
  ) {
    return { valid: false };
  }
  return {
    valid: true,
    value: {
      today: today.value,
      total: total.value,
      averageDurationMs: averageDurationMs.value,
      requestsPerMinute: requestsPerMinute.value,
      tokensPerMinute: tokensPerMinute.value,
    },
  };
}

function normalizeDailyUsage(value: unknown): Normalized<ApiGatewayDailyUsage[]> {
  if (value === null || value === undefined) {
    return { valid: true, value: [] };
  }
  if (!Array.isArray(value) || value.length > MAX_INPUT_DAILY_BUCKETS) {
    return { valid: false };
  }
  const dates = new Set<string>();
  const days: ApiGatewayDailyUsage[] = [];
  for (const candidate of value) {
    if (!isRecord(candidate)) {
      return { valid: false };
    }
    const date = normalizeDateKey(candidate.date);
    const totals = normalizeMetric(candidate.totals);
    if (!date || dates.has(date) || !totals.valid || !totals.value) {
      return { valid: false };
    }
    dates.add(date);
    days.push({ date, totals: totals.value });
  }
  return {
    valid: true,
    value: days
      .sort((left, right) => left.date.localeCompare(right.date))
      .slice(-MAX_API_GATEWAY_DAILY_BUCKETS),
  };
}

function metricRank(metric: ApiGatewayUsageMetric): number {
  return metric.totalTokens ?? metric.requests ?? 0;
}

function normalizeModelUsage(
  value: unknown,
): Normalized<{ items: ApiGatewayModelUsage[]; truncated: boolean }> {
  if (value === null || value === undefined) {
    return { valid: true, value: { items: [], truncated: false } };
  }
  if (!Array.isArray(value) || value.length > MAX_INPUT_MODEL_SERIES) {
    return { valid: false };
  }
  const ids = new Set<string>();
  const models: ApiGatewayModelUsage[] = [];
  for (const candidate of value) {
    if (!isRecord(candidate)) {
      return { valid: false };
    }
    const id = normalizeText(candidate.id, 120);
    const label = normalizeText(candidate.label, 120);
    const totals = normalizeMetric(candidate.totals);
    if (
      !id.valid ||
      !id.value ||
      ids.has(id.value) ||
      !label.valid ||
      !label.value ||
      !totals.valid ||
      !totals.value
    ) {
      return { valid: false };
    }
    ids.add(id.value);
    models.push({ id: id.value, label: label.value, totals: totals.value });
  }
  const sorted = models.sort(
    (left, right) =>
      metricRank(right.totals) - metricRank(left.totals) ||
      left.id.localeCompare(right.id),
  );
  return {
    valid: true,
    value: {
      items: sorted.slice(0, MAX_API_GATEWAY_MODEL_SERIES),
      truncated: sorted.length > MAX_API_GATEWAY_MODEL_SERIES,
    },
  };
}

function normalizeOrigin(value: unknown):
  | { origin: string; transport: "http" | "https" }
  | null {
  if (typeof value !== "string" || value.length > 512) {
    return null;
  }
  try {
    const url = new URL(value);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      return null;
    }
    return {
      origin: url.origin,
      transport: url.protocol === "https:" ? "https" : "http",
    };
  } catch {
    return null;
  }
}

function normalizeScope(value: unknown): ApiGatewayMeteringScope | null {
  return value === "api_key" || value === "account" ? value : null;
}

function normalizeBillingMode(value: unknown): ApiGatewayBillingMode | null {
  return value === "wallet" ||
    value === "quota" ||
    value === "subscription" ||
    value === "unrestricted"
    ? value
    : value === null || value === undefined
      ? null
      : null;
}

export function normalizeApiGatewayMeteringSnapshot(
  value: unknown,
): ApiGatewayMeteringSnapshot | undefined {
  if (!isRecord(value) || value.schemaVersion !== 1) {
    return undefined;
  }
  const accountId =
    typeof value.accountId === "string" && ACCOUNT_ID_PATTERN.test(value.accountId)
      ? value.accountId
      : null;
  const displayLabel = normalizeText(value.displayLabel, 64);
  const origin = normalizeOrigin(value.origin);
  const scope = normalizeScope(value.scope);
  const capturedAt = normalizeRequiredTimestamp(value.capturedAt);
  const status = normalizeText(value.status, 48, true);
  const planName = normalizeText(value.planName, 120, true);
  const remaining = normalizeMoney(value.remaining);
  const balance = normalizeMoney(value.balance);
  const quota = normalizeAllowance(value.quota);
  const subscription = normalizeSubscription(value.subscription);
  const rateLimits = normalizeRateLimits(value.rateLimits);
  const usage = normalizeUsageSummary(value.usage);
  const dailyUsage = normalizeDailyUsage(value.dailyUsage);
  const modelUsage = normalizeModelUsage(value.modelUsage);
  const isValid =
    value.isValid === null || value.isValid === undefined
      ? null
      : typeof value.isValid === "boolean"
        ? value.isValid
        : undefined;
  if (
    value.productKind !== "metered_api_gateway" ||
    !accountId ||
    !displayLabel.valid ||
    !displayLabel.value ||
    !origin ||
    !scope ||
    !capturedAt ||
    typeof value.stale !== "boolean" ||
    isValid === undefined ||
    (value.modelSeriesTruncated !== undefined &&
      typeof value.modelSeriesTruncated !== "boolean") ||
    !status.valid ||
    !planName.valid ||
    !remaining.valid ||
    !balance.valid ||
    !quota.valid ||
    !subscription.valid ||
    !rateLimits.valid ||
    !usage.valid ||
    !dailyUsage.valid ||
    !modelUsage.valid
  ) {
    return undefined;
  }
  const billingMode = normalizeBillingMode(value.billingMode);
  if (value.billingMode !== null && value.billingMode !== undefined && !billingMode) {
    return undefined;
  }
  return {
    schemaVersion: 1,
    accountId,
    productKind: "metered_api_gateway",
    displayLabel: displayLabel.value,
    origin: origin.origin,
    transport: origin.transport,
    scope,
    billingMode,
    capturedAt,
    stale: value.stale,
    isValid,
    status: status.value,
    planName: planName.value,
    remaining: remaining.value,
    balance: balance.value,
    quota: quota.value,
    subscription: subscription.value,
    rateLimits: rateLimits.value,
    usage: usage.value,
    dailyUsage: dailyUsage.value,
    modelUsage: modelUsage.value.items,
    modelSeriesTruncated:
      modelUsage.value.truncated || value.modelSeriesTruncated === true,
  };
}

export function deriveApiGatewayReferenceSavings(
  metric: ApiGatewayUsageMetric | null | undefined,
): ApiGatewayMoney | null {
  const reference = metric?.referenceCost;
  const actual = metric?.actualCost;
  if (!reference || !actual || reference.unit !== actual.unit) {
    return null;
  }
  return {
    amount: Math.max(
      Number((reference.amount - actual.amount).toPrecision(12)),
      0,
    ),
    unit: reference.unit,
  };
}

function addNullableValues(values: Array<number | null>): number | null {
  return values.some((value) => value === null)
    ? null
    : values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
}

function addMoney(values: Array<ApiGatewayMoney | null>): ApiGatewayMoney | null {
  if (values.length === 0 || values.some((value) => value === null)) {
    return null;
  }
  const unit = values[0]!.unit;
  if (values.some((value) => value?.unit !== unit)) {
    return null;
  }
  return {
    amount: Number(
      values
        .reduce((sum, value) => sum + (value?.amount ?? 0), 0)
        .toPrecision(12),
    ),
    unit,
  };
}

function mergeMetrics(metrics: ApiGatewayUsageMetric[]): ApiGatewayUsageMetric {
  return {
    requests: addNullableValues(metrics.map((metric) => metric.requests)),
    inputTokens: addNullableValues(metrics.map((metric) => metric.inputTokens)),
    outputTokens: addNullableValues(metrics.map((metric) => metric.outputTokens)),
    cacheCreationTokens: addNullableValues(
      metrics.map((metric) => metric.cacheCreationTokens),
    ),
    cacheReadTokens: addNullableValues(
      metrics.map((metric) => metric.cacheReadTokens),
    ),
    totalTokens: addNullableValues(metrics.map((metric) => metric.totalTokens)),
    referenceCost: addMoney(metrics.map((metric) => metric.referenceCost)),
    actualCost: addMoney(metrics.map((metric) => metric.actualCost)),
  };
}

export function buildApiGatewayModelBreakdownView(
  modelUsage: readonly ApiGatewayModelUsage[],
  maxSeries = 6,
): ApiGatewayModelUsage[] {
  const boundedMax = Math.max(1, Math.min(MAX_API_GATEWAY_MODEL_SERIES, maxSeries));
  const models = modelUsage.slice(0, MAX_API_GATEWAY_MODEL_SERIES);
  if (models.length <= boundedMax) {
    return structuredClone(models);
  }
  if (boundedMax === 1) {
    return [{ id: "other", label: "Other", totals: mergeMetrics(models.map((item) => item.totals)) }];
  }
  const primary = models.slice(0, boundedMax - 1);
  const overflow = models.slice(boundedMax - 1);
  return [
    ...structuredClone(primary),
    {
      id: "other",
      label: "Other",
      totals: mergeMetrics(overflow.map((item) => item.totals)),
    },
  ];
}

export function createDefaultApiGatewayMeteringDisplayPreferences(): ApiGatewayMeteringDisplayPreferences {
  return Object.fromEntries(
    DISPLAY_SURFACES.map((surface) => [
      surface,
      MODULE_IDS.map((id) => ({ id, visible: true })),
    ]),
  ) as ApiGatewayMeteringDisplayPreferences;
}

function normalizeModulePreferences(
  value: unknown,
): ApiGatewayMeteringModulePreference[] {
  const defaults = MODULE_IDS.map((id) => ({ id, visible: true }));
  if (!Array.isArray(value)) {
    return defaults;
  }
  const seen = new Set<ApiGatewayMeteringModuleId>();
  const normalized: ApiGatewayMeteringModulePreference[] = [];
  for (const candidate of value) {
    if (
      !isRecord(candidate) ||
      !MODULE_IDS.includes(candidate.id as ApiGatewayMeteringModuleId) ||
      seen.has(candidate.id as ApiGatewayMeteringModuleId) ||
      typeof candidate.visible !== "boolean"
    ) {
      continue;
    }
    const id = candidate.id as ApiGatewayMeteringModuleId;
    seen.add(id);
    normalized.push({ id, visible: candidate.visible });
  }
  for (const fallback of defaults) {
    if (!seen.has(fallback.id)) {
      normalized.push(fallback);
    }
  }
  return normalized;
}

export function normalizeApiGatewayMeteringDisplayPreferences(
  value: unknown,
): ApiGatewayMeteringDisplayPreferences {
  const source = isRecord(value) ? value : {};
  return Object.fromEntries(
    DISPLAY_SURFACES.map((surface) => [
      surface,
      normalizeModulePreferences(source[surface]),
    ]),
  ) as ApiGatewayMeteringDisplayPreferences;
}
