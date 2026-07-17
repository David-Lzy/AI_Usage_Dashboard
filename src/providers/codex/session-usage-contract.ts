export const CODEX_SESSION_USAGE_PATH = "/backend-api/wham/usage";

export type CodexSessionRateLimitWindow = {
  usedPercent: number;
  remainingPercent: number;
  limitWindowSeconds: number | null;
  resetAt: number | null;
};

export type CodexSessionRateLimit = {
  primaryWindow: CodexSessionRateLimitWindow | null;
  secondaryWindow: CodexSessionRateLimitWindow | null;
};

export type CodexSessionAdditionalRateLimit = {
  id: string;
  label: string;
  rateLimit: CodexSessionRateLimit;
};

export type CodexSessionCreditStatus = {
  hasCredits: boolean | null;
  unlimited: boolean | null;
  balance: number | null;
};

export type CodexSessionUsageContract = {
  planType: string | null;
  rateLimit: CodexSessionRateLimit;
  additionalRateLimits: CodexSessionAdditionalRateLimit[];
  credits: CodexSessionCreditStatus | null;
  spendControlReached: boolean | null;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toRecord(value: unknown): UnknownRecord | null {
  return isRecord(value) ? value : null;
}

function toFiniteNumber(value: unknown): number | null {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

function toBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function parseWindow(value: unknown): CodexSessionRateLimitWindow | null {
  const source = toRecord(value);

  if (!source) {
    return null;
  }

  const usedPercent = toFiniteNumber(source.used_percent);

  if (usedPercent === null || usedPercent < 0 || usedPercent > 100) {
    return null;
  }

  const limitWindowSeconds = toFiniteNumber(source.limit_window_seconds);
  const resetAt = toFiniteNumber(source.reset_at);

  return {
    usedPercent,
    remainingPercent: 100 - usedPercent,
    limitWindowSeconds:
      limitWindowSeconds !== null && limitWindowSeconds >= 0
        ? limitWindowSeconds
        : null,
    resetAt: resetAt !== null && resetAt >= 0 ? resetAt : null,
  };
}

function parseRateLimit(value: unknown): CodexSessionRateLimit {
  const source = toRecord(value);

  return {
    primaryWindow: parseWindow(source?.primary_window),
    secondaryWindow: parseWindow(source?.secondary_window),
  };
}

function parseCredits(value: unknown): CodexSessionCreditStatus | null {
  const source = toRecord(value);

  if (!source) {
    return null;
  }

  const balance = toFiniteNumber(source.balance);
  const parsed: CodexSessionCreditStatus = {
    hasCredits: toBoolean(source.has_credits),
    unlimited: toBoolean(source.unlimited),
    balance: balance !== null && balance >= 0 ? balance : null,
  };

  return parsed.hasCredits !== null ||
    parsed.unlimited !== null ||
    parsed.balance !== null
    ? parsed
    : null;
}

function parseAdditionalRateLimits(
  value: unknown,
): CodexSessionAdditionalRateLimit[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.slice(0, 16).flatMap((entry) => {
    const source = toRecord(entry);
    const id =
      typeof source?.metered_feature === "string"
        ? source.metered_feature.trim()
        : "";
    const label =
      typeof source?.limit_name === "string" ? source.limit_name.trim() : "";
    const rateLimit = parseRateLimit(source?.rate_limit);

    return id && label &&
      (rateLimit.primaryWindow !== null || rateLimit.secondaryWindow !== null)
      ? [{ id, label, rateLimit }]
      : [];
  });
}

export function parseCodexSessionUsageResponse(
  value: unknown,
): CodexSessionUsageContract | null {
  const source = toRecord(value);

  if (!source) {
    return null;
  }

  const rateLimit = parseRateLimit(source.rate_limit);
  const additionalRateLimits = parseAdditionalRateLimits(
    source.additional_rate_limits,
  );
  const credits = parseCredits(source.credits);

  if (
    rateLimit.primaryWindow === null &&
    rateLimit.secondaryWindow === null &&
    additionalRateLimits.length === 0 &&
    credits === null
  ) {
    return null;
  }

  const spendControl = toRecord(source.spend_control);

  return {
    planType:
      typeof source.plan_type === "string" && source.plan_type.trim()
        ? source.plan_type.trim()
        : null,
    rateLimit,
    additionalRateLimits,
    credits,
    spendControlReached: toBoolean(spendControl?.reached),
  };
}
