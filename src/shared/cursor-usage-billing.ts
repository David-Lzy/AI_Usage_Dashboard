import type {
  CursorObservedUsageBillingContract,
  CursorUsageEventContract,
} from "../providers/cursor/usage-billing-contract";
import type {
  CursorPlanUsagePool,
  CursorUsageAggregateHistory,
  CursorUsageBilling,
  CursorUsageBreakdown,
  CursorUsageDailyAggregate,
  CursorUsageMetric,
  CursorUsagePool,
} from "../providers/types";

export const MAX_CURSOR_USAGE_DAYS = 31;
export const MAX_CURSOR_USAGE_SERIES = 12;
const MAX_CURSOR_USAGE_BREAKDOWN_ENTRIES = MAX_CURSOR_USAGE_SERIES + 1;

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toStringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function toBooleanOrNull(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function toNonNegativeNumber(value: unknown): number | null {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(numericValue) && numericValue >= 0
    ? numericValue
    : null;
}

function normalizeOptionalNonNegativeNumber(value: unknown): {
  valid: boolean;
  value: number | null;
} {
  if (value === null || value === undefined) {
    return { valid: true, value: null };
  }

  const normalized = toNonNegativeNumber(value);
  return normalized === null
    ? { valid: false, value: null }
    : { valid: true, value: normalized };
}

function normalizeIsoTimestamp(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const timestamp = new Date(value);
  return Number.isNaN(timestamp.getTime()) ? null : timestamp.toISOString();
}

function normalizeDateKey(value: unknown): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
    ? value
    : null;
}

function emptyMetric(): CursorUsageMetric {
  return {
    requests: 0,
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    apiValueCents: 0,
    chargedCents: 0,
  };
}

function addMetric(
  target: CursorUsageMetric,
  source: CursorUsageMetric,
): CursorUsageMetric {
  target.requests += source.requests;
  target.inputTokens = addNullableMetric(
    target.inputTokens,
    source.inputTokens,
  );
  target.outputTokens = addNullableMetric(
    target.outputTokens,
    source.outputTokens,
  );
  target.cacheReadTokens = addNullableMetric(
    target.cacheReadTokens,
    source.cacheReadTokens,
  );
  target.apiValueCents = addNullableMetric(
    target.apiValueCents,
    source.apiValueCents,
  );
  target.chargedCents = addNullableMetric(
    target.chargedCents,
    source.chargedCents,
  );
  return target;
}

function addNullableMetric(
  target: number | null,
  source: number | null,
): number | null {
  return target === null || source === null ? null : target + source;
}

function normalizeMetric(value: unknown): CursorUsageMetric | null {
  if (!isRecord(value)) {
    return null;
  }

  const requests = toNonNegativeNumber(value.requests);
  const inputTokens = normalizeOptionalNonNegativeNumber(value.inputTokens);
  const outputTokens = normalizeOptionalNonNegativeNumber(value.outputTokens);
  const cacheReadTokens = normalizeOptionalNonNegativeNumber(
    value.cacheReadTokens,
  );
  const apiValueCents = normalizeOptionalNonNegativeNumber(value.apiValueCents);
  const chargedCents = normalizeOptionalNonNegativeNumber(value.chargedCents);

  if (
    requests === null ||
    !inputTokens.valid ||
    !outputTokens.valid ||
    !cacheReadTokens.valid ||
    !apiValueCents.valid ||
    !chargedCents.valid
  ) {
    return null;
  }

  return {
    requests: Math.floor(requests),
    inputTokens:
      inputTokens.value === null ? null : Math.floor(inputTokens.value),
    outputTokens:
      outputTokens.value === null ? null : Math.floor(outputTokens.value),
    cacheReadTokens:
      cacheReadTokens.value === null
        ? null
        : Math.floor(cacheReadTokens.value),
    apiValueCents: apiValueCents.value,
    chargedCents: chargedCents.value,
  };
}

function normalizeBreakdowns(value: unknown): CursorUsageBreakdown[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const seen = new Set<string>();
  const normalized: CursorUsageBreakdown[] = [];

  for (const candidate of value) {
    if (!isRecord(candidate)) {
      return null;
    }

    const id = toStringOrNull(candidate.id);
    const label = toStringOrNull(candidate.label);
    const metric = normalizeMetric(candidate);

    if (!id || !label || !metric || seen.has(id)) {
      return null;
    }

    seen.add(id);
    normalized.push({ id, label, ...metric });
  }

  return normalized;
}

function stableSeriesId(label: string): string {
  const id = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return id || "unknown";
}

function parseDollarValueToCents(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().replace(/^\$/, "");
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount >= 0 ? amount * 100 : null;
}

function metricFromEvent(event: CursorUsageEventContract): CursorUsageMetric {
  return {
    requests: 1,
    inputTokens: event.isTokenBasedCall
      ? (event.tokenUsage?.inputTokens ?? null)
      : 0,
    outputTokens: event.isTokenBasedCall
      ? (event.tokenUsage?.outputTokens ?? null)
      : 0,
    cacheReadTokens: event.isTokenBasedCall
      ? (event.tokenUsage?.cacheReadTokens ?? null)
      : 0,
    apiValueCents:
      event.isTokenBasedCall
        ? (event.tokenUsage?.totalCents ?? null)
        : parseDollarValueToCents(event.usageBasedCosts),
    chargedCents:
      event.chargedCents ?? (event.isChargeable === false ? 0 : null),
  };
}

type MutableDay = {
  date: string;
  totals: CursorUsageMetric;
  byModel: Map<string, CursorUsageBreakdown>;
  byKind: Map<string, CursorUsageBreakdown>;
};

function addBreakdownMetric(
  map: Map<string, CursorUsageBreakdown>,
  label: string,
  metric: CursorUsageMetric,
): void {
  const id = stableSeriesId(label);
  const current = map.get(id) ?? { id, label, ...emptyMetric() };
  addMetric(current, metric);
  map.set(id, current);
}

function buildPrimarySeriesIds(
  days: readonly MutableDay[],
  field: "byModel" | "byKind",
): Set<string> {
  const totals = new Map<string, CursorUsageBreakdown>();

  for (const day of days) {
    for (const series of day[field].values()) {
      const current = totals.get(series.id) ?? {
        id: series.id,
        label: series.label,
        ...emptyMetric(),
      };
      addMetric(current, series);
      totals.set(series.id, current);
    }
  }

  return new Set(
    [...totals.values()]
      .sort(
        (left, right) =>
          (right.apiValueCents ?? -1) - (left.apiValueCents ?? -1) ||
          (right.inputTokens ?? 0) + (right.outputTokens ?? 0) -
            ((left.inputTokens ?? 0) + (left.outputTokens ?? 0)) ||
          right.requests - left.requests ||
          left.id.localeCompare(right.id),
      )
      .slice(0, MAX_CURSOR_USAGE_SERIES)
      .map((series) => series.id),
  );
}

function collapseBreakdowns(
  source: ReadonlyMap<string, CursorUsageBreakdown>,
  primaryIds: ReadonlySet<string>,
): CursorUsageBreakdown[] {
  const primary: CursorUsageBreakdown[] = [];
  const other: CursorUsageBreakdown = {
    id: "other",
    label: "Other",
    ...emptyMetric(),
  };

  for (const series of source.values()) {
    if (primaryIds.has(series.id)) {
      primary.push({ ...series });
    } else {
      addMetric(other, series);
    }
  }

  primary.sort((left, right) => left.id.localeCompare(right.id));
  return other.requests > 0 ? [...primary, other] : primary;
}

function buildAggregateHistory(
  events: readonly CursorUsageEventContract[],
  sourceEventCount: number,
): CursorUsageAggregateHistory | null {
  const days = new Map<string, MutableDay>();

  for (const event of events) {
    const timestamp = new Date(event.timestamp);
    if (Number.isNaN(timestamp.getTime())) {
      continue;
    }

    const date = timestamp.toISOString().slice(0, 10);
    const metric = metricFromEvent(event);
    const day = days.get(date) ?? {
      date,
      totals: emptyMetric(),
      byModel: new Map(),
      byKind: new Map(),
    };

    addMetric(day.totals, metric);
    addBreakdownMetric(day.byModel, event.model, metric);
    addBreakdownMetric(day.byKind, event.kind, metric);
    days.set(date, day);
  }

  const boundedDays = [...days.values()]
    .sort((left, right) => left.date.localeCompare(right.date))
    .slice(-MAX_CURSOR_USAGE_DAYS);

  if (boundedDays.length === 0) {
    return null;
  }

  const primaryModelIds = buildPrimarySeriesIds(boundedDays, "byModel");
  const primaryKindIds = buildPrimarySeriesIds(boundedDays, "byKind");
  const normalizedDays: CursorUsageDailyAggregate[] = boundedDays.map((day) => ({
    date: day.date,
    totals: { ...day.totals },
    byModel: collapseBreakdowns(day.byModel, primaryModelIds),
    byKind: collapseBreakdowns(day.byKind, primaryKindIds),
  }));

  return {
    rangeStart: normalizedDays[0]!.date,
    rangeEnd: normalizedDays.at(-1)!.date,
    granularity: "day",
    sourceEventCount: Math.max(0, Math.floor(sourceEventCount)),
    capturedEventCount: events.length,
    complete: events.length >= sourceEventCount,
    days: normalizedDays,
  };
}

function normalizePool(value: unknown): CursorUsagePool | null {
  if (!isRecord(value) || typeof value.enabled !== "boolean") {
    return null;
  }

  const usedCents = normalizeOptionalNonNegativeNumber(value.usedCents);
  const limitCents = normalizeOptionalNonNegativeNumber(value.limitCents);
  const remainingCents = normalizeOptionalNonNegativeNumber(
    value.remainingCents,
  );

  if (!usedCents.valid || !limitCents.valid || !remainingCents.valid) {
    return null;
  }

  return {
    enabled: value.enabled,
    usedCents: usedCents.value,
    limitCents: limitCents.value,
    remainingCents: remainingCents.value,
  };
}

function normalizePlanPool(value: unknown): CursorPlanUsagePool | null {
  const pool = normalizePool(value);
  if (!pool || !isRecord(value)) {
    return null;
  }

  const includedUsageCents = normalizeOptionalNonNegativeNumber(
    value.includedUsageCents,
  );
  const bonusUsageCents = normalizeOptionalNonNegativeNumber(
    value.bonusUsageCents,
  );
  const totalUsageCents = normalizeOptionalNonNegativeNumber(
    value.totalUsageCents,
  );

  if (
    !includedUsageCents.valid ||
    !bonusUsageCents.valid ||
    !totalUsageCents.valid
  ) {
    return null;
  }

  return {
    ...pool,
    includedUsageCents: includedUsageCents.value,
    bonusUsageCents: bonusUsageCents.value,
    totalUsageCents: totalUsageCents.value,
    autoPercentUsed: toNonNegativeNumber(value.autoPercentUsed),
    apiPercentUsed: toNonNegativeNumber(value.apiPercentUsed),
    totalPercentUsed: toNonNegativeNumber(value.totalPercentUsed),
  };
}

function normalizeHistory(value: unknown): CursorUsageAggregateHistory | null {
  if (!isRecord(value) || !Array.isArray(value.days)) {
    return null;
  }

  if (value.days.length > MAX_CURSOR_USAGE_DAYS) {
    return null;
  }

  const seenDates = new Set<string>();
  let malformed = false;

  const days = value.days
    .flatMap<CursorUsageDailyAggregate>((candidate) => {
      if (!isRecord(candidate)) {
        malformed = true;
        return [];
      }

      const date = normalizeDateKey(candidate.date);
      const totals = normalizeMetric(candidate.totals);
      const byModel = Array.isArray(candidate.byModel) ? candidate.byModel : null;
      const byKind = Array.isArray(candidate.byKind) ? candidate.byKind : null;
      if (
        !date ||
        !totals ||
        !byModel ||
        !byKind ||
        byModel.length > MAX_CURSOR_USAGE_BREAKDOWN_ENTRIES ||
        byKind.length > MAX_CURSOR_USAGE_BREAKDOWN_ENTRIES ||
        seenDates.has(date)
      ) {
        malformed = true;
        return [];
      }

      const normalizedByModel = normalizeBreakdowns(byModel);
      const normalizedByKind = normalizeBreakdowns(byKind);
      if (!normalizedByModel || !normalizedByKind) {
        malformed = true;
        return [];
      }

      seenDates.add(date);

      return [{
        date,
        totals,
        byModel: normalizedByModel,
        byKind: normalizedByKind,
      }];
    })
    .sort((left, right) => left.date.localeCompare(right.date));

  if (malformed || days.length === 0) {
    return null;
  }

  const sourceEventCount = toNonNegativeNumber(value.sourceEventCount) ?? 0;
  const capturedEventCount = toNonNegativeNumber(value.capturedEventCount) ?? 0;

  return {
    rangeStart: days[0]!.date,
    rangeEnd: days.at(-1)!.date,
    granularity: "day",
    sourceEventCount: Math.floor(sourceEventCount),
    capturedEventCount: Math.floor(capturedEventCount),
    complete: value.complete === true,
    days,
  };
}

export function buildCursorUsageBillingFromContract(
  contract: CursorObservedUsageBillingContract,
  capturedAt: string,
): CursorUsageBilling | undefined {
  const normalizedCapturedAt = normalizeIsoTimestamp(capturedAt);
  if (!normalizedCapturedAt) {
    return undefined;
  }

  const summary = contract.usageSummary;
  const planInfo = contract.planInfo?.planInfo ?? null;
  const events = contract.usageEvents;
  const hasBilling = Boolean(summary || planInfo || contract.hardLimit);
  const history = events
    ? buildAggregateHistory(
        events.usageEventsDisplay,
        events.totalUsageEventsCount,
      )
    : null;

  if (!hasBilling && !history) {
    return undefined;
  }

  return {
    capturedAt: normalizedCapturedAt,
    billingCapturedAt: hasBilling ? normalizedCapturedAt : null,
    historyCapturedAt: history ? normalizedCapturedAt : null,
    billingCycleStart: summary?.billingCycleStart ?? null,
    billingCycleEnd: summary?.billingCycleEnd ?? planInfo?.billingCycleEnd ?? null,
    membershipType: summary?.membershipType ?? null,
    limitType: summary?.limitType ?? null,
    isUnlimited: summary?.isUnlimited ?? null,
    currency: "USD",
    planName: planInfo?.planName ?? summary?.membershipType ?? null,
    planIncludedAmountCents: planInfo?.includedAmountCents ?? null,
    planPriceLabel: planInfo?.price ?? null,
    planOwner: planInfo?.planOwner ?? null,
    plan: summary?.individualUsage.plan
      ? {
          enabled: summary.individualUsage.plan.enabled,
          usedCents: summary.individualUsage.plan.used,
          limitCents: summary.individualUsage.plan.limit,
          remainingCents: summary.individualUsage.plan.remaining,
          includedUsageCents: summary.individualUsage.plan.breakdown.included,
          bonusUsageCents: summary.individualUsage.plan.breakdown.bonus,
          totalUsageCents: summary.individualUsage.plan.breakdown.total,
          autoPercentUsed: summary.individualUsage.plan.autoPercentUsed,
          apiPercentUsed: summary.individualUsage.plan.apiPercentUsed,
          totalPercentUsed: summary.individualUsage.plan.totalPercentUsed,
        }
      : null,
    onDemand: summary?.individualUsage.onDemand
      ? {
          enabled: summary.individualUsage.onDemand.enabled,
          usedCents: summary.individualUsage.onDemand.used,
          limitCents: summary.individualUsage.onDemand.limit,
          remainingCents: summary.individualUsage.onDemand.remaining,
        }
      : null,
    noUsageBasedAllowed:
      contract.hardLimit?.noUsageBasedAllowed ?? null,
    history,
  };
}

export function normalizeCursorUsageBilling(
  value: unknown,
): CursorUsageBilling | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const capturedAt = normalizeIsoTimestamp(value.capturedAt);
  if (!capturedAt) {
    return undefined;
  }

  const billingCapturedAt = normalizeIsoTimestamp(value.billingCapturedAt);
  const historyCapturedAt = normalizeIsoTimestamp(value.historyCapturedAt);
  const plan = normalizePlanPool(value.plan);
  const onDemand = normalizePool(value.onDemand);
  const history = normalizeHistory(value.history);
  const billingCycleStart = normalizeIsoTimestamp(value.billingCycleStart);
  const billingCycleEnd = normalizeIsoTimestamp(value.billingCycleEnd);
  const planIncludedAmountCents = normalizeOptionalNonNegativeNumber(
    value.planIncludedAmountCents,
  );

  if (
    (value.currency !== undefined && value.currency !== "USD") ||
    (value.billingCapturedAt != null && !billingCapturedAt) ||
    (value.historyCapturedAt != null && !historyCapturedAt) ||
    (value.billingCycleStart != null && !billingCycleStart) ||
    (value.billingCycleEnd != null && !billingCycleEnd) ||
    !planIncludedAmountCents.valid ||
    (value.plan != null && !plan) ||
    (value.onDemand != null && !onDemand) ||
    (value.history != null && !history)
  ) {
    return undefined;
  }

  if (!billingCapturedAt && !historyCapturedAt && !plan && !onDemand && !history) {
    return undefined;
  }

  return {
    capturedAt,
    billingCapturedAt,
    historyCapturedAt,
    billingCycleStart,
    billingCycleEnd,
    membershipType: toStringOrNull(value.membershipType),
    limitType: toStringOrNull(value.limitType),
    isUnlimited: toBooleanOrNull(value.isUnlimited),
    currency: "USD",
    planName: toStringOrNull(value.planName),
    planIncludedAmountCents: planIncludedAmountCents.value,
    planPriceLabel: toStringOrNull(value.planPriceLabel),
    planOwner: toStringOrNull(value.planOwner),
    plan,
    onDemand,
    noUsageBasedAllowed: toBooleanOrNull(value.noUsageBasedAllowed),
    history,
  };
}

export function mergeCursorUsageBilling(
  current: CursorUsageBilling | undefined,
  previous: CursorUsageBilling | undefined,
): CursorUsageBilling | undefined {
  const normalizedCurrent = normalizeCursorUsageBilling(current);
  const normalizedPrevious = normalizeCursorUsageBilling(previous);

  if (!normalizedCurrent) {
    return normalizedPrevious;
  }
  if (!normalizedPrevious) {
    return normalizedCurrent;
  }

  const hasCurrentBilling = normalizedCurrent.billingCapturedAt !== null;
  const hasCurrentHistory = normalizedCurrent.historyCapturedAt !== null;

  return normalizeCursorUsageBilling({
    ...normalizedPrevious,
    ...normalizedCurrent,
    ...(hasCurrentBilling
      ? {}
      : {
          billingCapturedAt: normalizedPrevious.billingCapturedAt,
          billingCycleStart: normalizedPrevious.billingCycleStart,
          billingCycleEnd: normalizedPrevious.billingCycleEnd,
          membershipType: normalizedPrevious.membershipType,
          limitType: normalizedPrevious.limitType,
          isUnlimited: normalizedPrevious.isUnlimited,
          planName: normalizedPrevious.planName,
          planIncludedAmountCents:
            normalizedPrevious.planIncludedAmountCents,
          planPriceLabel: normalizedPrevious.planPriceLabel,
          planOwner: normalizedPrevious.planOwner,
          plan: normalizedPrevious.plan,
          onDemand: normalizedPrevious.onDemand,
          noUsageBasedAllowed: normalizedPrevious.noUsageBasedAllowed,
        }),
    ...(hasCurrentHistory
      ? {}
      : {
          historyCapturedAt: normalizedPrevious.historyCapturedAt,
          history: normalizedPrevious.history,
        }),
  });
}
