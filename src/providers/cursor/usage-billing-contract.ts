export const CURSOR_USAGE_SUMMARY_PATH = "/api/usage-summary";
export const CURSOR_PLAN_INFO_PATH = "/api/dashboard/get-plan-info";
export const CURSOR_HARD_LIMIT_PATH = "/api/dashboard/get-hard-limit";
export const CURSOR_FILTERED_USAGE_EVENTS_PATH =
  "/api/dashboard/get-filtered-usage-events";

export const CURSOR_USAGE_BILLING_PATHS = [
  CURSOR_USAGE_SUMMARY_PATH,
  CURSOR_PLAN_INFO_PATH,
  CURSOR_HARD_LIMIT_PATH,
  CURSOR_FILTERED_USAGE_EVENTS_PATH,
] as const;

export type CursorUsagePoolContract = {
  enabled: boolean;
  used: number | null;
  limit: number | null;
  remaining: number | null;
};

export type CursorUsageSummaryContract = {
  billingCycleStart: string;
  billingCycleEnd: string;
  membershipType: string | null;
  limitType: string | null;
  isUnlimited: boolean | null;
  individualUsage: {
    plan: (CursorUsagePoolContract & {
      breakdown: {
        included: number | null;
        bonus: number | null;
        total: number | null;
      };
      autoPercentUsed: number | null;
      apiPercentUsed: number | null;
      totalPercentUsed: number | null;
    }) | null;
    onDemand: CursorUsagePoolContract | null;
  };
};

export type CursorPlanInfoContract = {
  planInfo: {
    planName: string | null;
    includedAmountCents: number | null;
    price: string | null;
    billingCycleEnd: string | null;
    planOwner: string | null;
  } | null;
};

export type CursorHardLimitContract = {
  noUsageBasedAllowed: boolean;
};

export type CursorUsageEventContract = {
  timestamp: string;
  model: string;
  kind: string;
  requestsCosts: number | null;
  usageBasedCosts: string | null;
  isTokenBasedCall: boolean;
  tokenUsage: {
    inputTokens: number | null;
    outputTokens: number | null;
    cacheReadTokens: number | null;
    totalCents: number | null;
  } | null;
  isChargeable: boolean | null;
  chargedCents: number | null;
};

export type CursorFilteredUsageEventsContract = {
  totalUsageEventsCount: number;
  usageEventsDisplay: CursorUsageEventContract[];
};

export type CursorUsageBillingContractFixture = {
  capturedAt: string;
  usageSummary: CursorUsageSummaryContract;
  planInfo: CursorPlanInfoContract;
  hardLimit: CursorHardLimitContract;
  usageEvents: CursorFilteredUsageEventsContract;
};

export type CursorObservedUsageBillingContract = {
  usageSummary: CursorUsageSummaryContract | null;
  planInfo: CursorPlanInfoContract | null;
  hardLimit: CursorHardLimitContract | null;
  usageEvents: CursorFilteredUsageEventsContract | null;
};

type ObservedEntry = {
  url: string;
  ok: boolean | null;
  bodyText: string | null;
};

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

function sanitizePool(value: unknown): CursorUsagePoolContract | null {
  if (!isRecord(value) || typeof value.enabled !== "boolean") {
    return null;
  }

  return {
    enabled: value.enabled,
    used: toNonNegativeNumber(value.used),
    limit: toNonNegativeNumber(value.limit),
    remaining: toNonNegativeNumber(value.remaining),
  };
}

function sanitizeUsageSummary(value: unknown): CursorUsageSummaryContract | null {
  if (!isRecord(value)) {
    return null;
  }

  const billingCycleStart = toStringOrNull(value.billingCycleStart);
  const billingCycleEnd = toStringOrNull(value.billingCycleEnd);
  const individualUsage = isRecord(value.individualUsage)
    ? value.individualUsage
    : null;

  if (!billingCycleStart || !billingCycleEnd || !individualUsage) {
    return null;
  }

  const planSource = isRecord(individualUsage.plan)
    ? individualUsage.plan
    : null;
  const planPool = sanitizePool(planSource);
  const breakdown = isRecord(planSource?.breakdown)
    ? planSource.breakdown
    : {};

  return {
    billingCycleStart,
    billingCycleEnd,
    membershipType: toStringOrNull(value.membershipType),
    limitType: toStringOrNull(value.limitType),
    isUnlimited: toBooleanOrNull(value.isUnlimited),
    individualUsage: {
      plan:
        planSource && planPool
          ? {
              ...planPool,
              breakdown: {
                included: toNonNegativeNumber(breakdown.included),
                bonus: toNonNegativeNumber(breakdown.bonus),
                total: toNonNegativeNumber(breakdown.total),
              },
              autoPercentUsed: toNonNegativeNumber(planSource.autoPercentUsed),
              apiPercentUsed: toNonNegativeNumber(planSource.apiPercentUsed),
              totalPercentUsed: toNonNegativeNumber(planSource.totalPercentUsed),
            }
          : null,
      onDemand: sanitizePool(individualUsage.onDemand),
    },
  };
}

function sanitizePlanInfo(value: unknown): CursorPlanInfoContract | null {
  if (!isRecord(value)) {
    return null;
  }

  const planInfo = isRecord(value.planInfo) ? value.planInfo : null;

  return {
    planInfo: planInfo
      ? {
          planName: toStringOrNull(planInfo.planName),
          includedAmountCents: toNonNegativeNumber(
            planInfo.includedAmountCents,
          ),
          price: toStringOrNull(planInfo.price),
          billingCycleEnd: toStringOrNull(planInfo.billingCycleEnd),
          planOwner: toStringOrNull(planInfo.planOwner),
        }
      : null,
  };
}

function sanitizeHardLimit(value: unknown): CursorHardLimitContract | null {
  return isRecord(value) && typeof value.noUsageBasedAllowed === "boolean"
    ? { noUsageBasedAllowed: value.noUsageBasedAllowed }
    : null;
}

function sanitizeUsageEvent(value: unknown): CursorUsageEventContract | null {
  if (!isRecord(value)) {
    return null;
  }

  const timestamp = toStringOrNull(value.timestamp);
  const model = toStringOrNull(value.model);
  const kind = toStringOrNull(value.kind);

  if (!timestamp || !model || !kind || typeof value.isTokenBasedCall !== "boolean") {
    return null;
  }

  const tokenUsage = isRecord(value.tokenUsage) ? value.tokenUsage : null;

  return {
    timestamp,
    model,
    kind,
    requestsCosts: toNonNegativeNumber(value.requestsCosts),
    usageBasedCosts: toStringOrNull(value.usageBasedCosts),
    isTokenBasedCall: value.isTokenBasedCall,
    tokenUsage: tokenUsage
      ? {
          inputTokens: toNonNegativeNumber(tokenUsage.inputTokens),
          outputTokens: toNonNegativeNumber(tokenUsage.outputTokens),
          cacheReadTokens: toNonNegativeNumber(tokenUsage.cacheReadTokens),
          totalCents: toNonNegativeNumber(tokenUsage.totalCents),
        }
      : null,
    isChargeable: toBooleanOrNull(value.isChargeable),
    chargedCents: toNonNegativeNumber(value.chargedCents),
  };
}

function sanitizeUsageEvents(
  value: unknown,
): CursorFilteredUsageEventsContract | null {
  if (!isRecord(value) || !Array.isArray(value.usageEventsDisplay)) {
    return null;
  }

  const usageEventsDisplay = value.usageEventsDisplay
    .slice(0, 100)
    .flatMap<CursorUsageEventContract>((entry) => {
      const sanitized = sanitizeUsageEvent(entry);
      return sanitized ? [sanitized] : [];
    });

  return {
    totalUsageEventsCount:
      toNonNegativeNumber(value.totalUsageEventsCount) ??
      usageEventsDisplay.length,
    usageEventsDisplay,
  };
}

function parseBody(entry: ObservedEntry): unknown {
  if (entry.ok !== true || !entry.bodyText) {
    return null;
  }

  try {
    return JSON.parse(entry.bodyText);
  } catch {
    return null;
  }
}

export function extractCursorObservedUsageBillingContract(
  entries: readonly ObservedEntry[] | undefined,
): CursorObservedUsageBillingContract | null {
  let usageSummary: CursorUsageSummaryContract | null = null;
  let planInfo: CursorPlanInfoContract | null = null;
  let hardLimit: CursorHardLimitContract | null = null;
  let usageEvents: CursorFilteredUsageEventsContract | null = null;

  for (const entry of entries ?? []) {
    if (!usageSummary && entry.url.includes(CURSOR_USAGE_SUMMARY_PATH)) {
      usageSummary = sanitizeUsageSummary(parseBody(entry));
    }
    if (!planInfo && entry.url.includes(CURSOR_PLAN_INFO_PATH)) {
      planInfo = sanitizePlanInfo(parseBody(entry));
    }
    if (!hardLimit && entry.url.includes(CURSOR_HARD_LIMIT_PATH)) {
      hardLimit = sanitizeHardLimit(parseBody(entry));
    }
    if (
      !usageEvents &&
      entry.url.includes(CURSOR_FILTERED_USAGE_EVENTS_PATH)
    ) {
      usageEvents = sanitizeUsageEvents(parseBody(entry));
    }
  }

  return usageSummary || planInfo || hardLimit || usageEvents
    ? { usageSummary, planInfo, hardLimit, usageEvents }
    : null;
}

export function isCursorUsageBillingUrl(url: string): boolean {
  return CURSOR_USAGE_BILLING_PATHS.some((path) => url.includes(path));
}
