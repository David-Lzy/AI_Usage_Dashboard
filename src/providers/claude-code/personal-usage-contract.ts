import type { PageSessionObservedNetworkEntry } from "../page-session-network-observer";

export const CLAUDE_USAGE_ENDPOINT_SUFFIX = "/usage";
export const CLAUDE_PREPAID_CREDITS_ENDPOINT_SUFFIX = "/prepaid/credits";
export const CLAUDE_OVERAGE_SPEND_LIMIT_ENDPOINT_SUFFIX =
  "/overage_spend_limit";
export const CLAUDE_PERSONAL_USAGE_MATCH_SUBSTRINGS = [
  CLAUDE_USAGE_ENDPOINT_SUFFIX,
  CLAUDE_PREPAID_CREDITS_ENDPOINT_SUFFIX,
  CLAUDE_OVERAGE_SPEND_LIMIT_ENDPOINT_SUFFIX,
] as const;
export const MAX_CLAUDE_PERSONAL_RESPONSE_LENGTH = 80_000;
export const MAX_CLAUDE_PERSONAL_LIMITS = 16;

export type ClaudePersonalPlanIdentity = {
  kind: "pro" | "max" | "max_5x" | "max_20x";
  label: "Claude Pro" | "Claude Max" | "Claude Max 5x" | "Claude Max 20x";
};

export type ClaudePersonalStructuredLimit = {
  kind: string;
  group: string;
  usedPercent: number;
  remainingPercent: number;
  severity: string | null;
  resetsAt: string | null;
  scope: string | null;
  isActive: boolean;
};

export type ClaudePersonalExtraUsage = {
  isEnabled: boolean;
  monthlyLimit: number | null;
  usedCredits: number | null;
  utilization: number | null;
  currency: string | null;
  decimalPlaces: number | null;
  disabledReason: string | null;
  spentAmountMinor: number | null;
  spentCurrency: string | null;
  spentExponent: number | null;
};

export type ClaudePersonalCredits = {
  amount: number | null;
  currency: string | null;
  balanceCredits: number | null;
  nextExpiresAt: string | null;
};

export type ClaudePersonalUsageContract = {
  planIdentity: ClaudePersonalPlanIdentity | null;
  limits: ClaudePersonalStructuredLimit[];
  extraUsage: ClaudePersonalExtraUsage | null;
  credits: ClaudePersonalCredits | null;
  memberDashboardAvailable: boolean | null;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseJsonObject(bodyText: string | null): UnknownRecord | null {
  if (
    typeof bodyText !== "string" ||
    bodyText.length === 0 ||
    bodyText.length > MAX_CLAUDE_PERSONAL_RESPONSE_LENGTH
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(bodyText) as unknown;
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function finiteNumber(value: unknown, minimum = 0): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= minimum
    ? value
    : null;
}

function percent(value: unknown): number | null {
  const parsed = finiteNumber(value);
  return parsed !== null && parsed <= 100 ? parsed : null;
}

function boundedString(value: unknown, maxLength = 120): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > 0 && normalized.length <= maxLength
    ? normalized
    : null;
}

function nullableBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function endpointKind(
  rawUrl: string,
): "usage" | "credits" | "spend_limit" | null {
  try {
    const url = new URL(rawUrl);
    if (url.hostname !== "claude.ai") {
      return null;
    }

    if (/^\/api\/organizations\/[^/]+\/usage\/?$/i.test(url.pathname)) {
      return "usage";
    }
    if (
      /^\/api\/organizations\/[^/]+\/prepaid\/credits\/?$/i.test(
        url.pathname,
      )
    ) {
      return "credits";
    }
    if (
      /^\/api\/organizations\/[^/]+\/overage_spend_limit\/?$/i.test(
        url.pathname,
      )
    ) {
      return "spend_limit";
    }
  } catch {
    return null;
  }

  return null;
}

export function detectClaudePersonalPlanIdentity(
  textSnippets: readonly string[],
): ClaudePersonalPlanIdentity | null {
  const text = textSnippets.join("\n");

  if (/\b(?:claude\s+)?max\s*20\s*x\b/i.test(text)) {
    return { kind: "max_20x", label: "Claude Max 20x" };
  }
  if (/\b(?:claude\s+)?max\s*5\s*x\b/i.test(text)) {
    return { kind: "max_5x", label: "Claude Max 5x" };
  }
  if (/plan usage limits\s+max\b|\b(?:claude\s+)?max plan\b/i.test(text)) {
    return { kind: "max", label: "Claude Max" };
  }
  if (/plan usage limits\s+pro\b|\b(?:claude\s+)?pro plan\b/i.test(text)) {
    return { kind: "pro", label: "Claude Pro" };
  }

  return null;
}

function parseLimit(value: unknown): ClaudePersonalStructuredLimit | null {
  if (!isRecord(value)) {
    return null;
  }

  const kind = boundedString(value.kind, 80);
  const group = boundedString(value.group, 80);
  const usedPercent = percent(value.percent);
  const isActive = nullableBoolean(value.is_active);
  if (!kind || !group || usedPercent === null || isActive === null) {
    return null;
  }

  return {
    kind,
    group,
    usedPercent,
    remainingPercent: 100 - usedPercent,
    severity: boundedString(value.severity, 40),
    resetsAt: boundedString(value.resets_at),
    scope: boundedString(value.scope, 80),
    isActive,
  };
}

function parseCompatibilityLimit(
  value: unknown,
  kind: string,
  group: string,
): ClaudePersonalStructuredLimit | null {
  if (!isRecord(value)) {
    return null;
  }

  const usedPercent = percent(value.utilization);
  if (usedPercent === null) {
    return null;
  }

  return {
    kind,
    group,
    usedPercent,
    remainingPercent: 100 - usedPercent,
    severity: null,
    resetsAt: boundedString(value.resets_at),
    scope: null,
    isActive: true,
  };
}

function parseLimits(body: UnknownRecord): ClaudePersonalStructuredLimit[] {
  const limits = Array.isArray(body.limits)
    ? body.limits
        .slice(0, MAX_CLAUDE_PERSONAL_LIMITS)
        .map(parseLimit)
        .filter((value): value is ClaudePersonalStructuredLimit => value !== null)
    : [];

  const compatibilityLimits = [
    parseCompatibilityLimit(body.five_hour, "session", "session"),
    parseCompatibilityLimit(body.seven_day, "weekly_all", "weekly"),
  ].filter(
    (value): value is ClaudePersonalStructuredLimit => value !== null,
  );

  for (const compatibilityLimit of compatibilityLimits) {
    const existingIndex = limits.findIndex(
      (limit) =>
        limit.kind === compatibilityLimit.kind ||
        limit.group === compatibilityLimit.group,
    );

    if (existingIndex === -1) {
      limits.push(compatibilityLimit);
      continue;
    }

    const existingLimit = limits[existingIndex];
    if (existingLimit && !existingLimit.isActive) {
      // Claude can mark the weekly limits[] row as inactive while still
      // exposing the corresponding top-level seven_day window in the Usage
      // UI. The top-level window is display evidence, not a synthetic value.
      limits[existingIndex] = {
        ...existingLimit,
        usedPercent: compatibilityLimit.usedPercent,
        remainingPercent: compatibilityLimit.remainingPercent,
        resetsAt: compatibilityLimit.resetsAt ?? existingLimit.resetsAt,
        isActive: true,
      };
    }
  }

  return limits.slice(0, MAX_CLAUDE_PERSONAL_LIMITS);
}

function parseExtraUsage(body: UnknownRecord): ClaudePersonalExtraUsage | null {
  const extraUsage = isRecord(body.extra_usage) ? body.extra_usage : null;
  const spend = isRecord(body.spend) ? body.spend : null;
  const spent = spend && isRecord(spend.used) ? spend.used : null;
  const isEnabled = nullableBoolean(extraUsage?.is_enabled ?? spend?.enabled);

  if (!extraUsage && !spend) {
    return null;
  }

  return {
    isEnabled: isEnabled ?? false,
    monthlyLimit: finiteNumber(extraUsage?.monthly_limit),
    usedCredits: finiteNumber(extraUsage?.used_credits),
    utilization: percent(extraUsage?.utilization ?? spend?.percent),
    currency: boundedString(extraUsage?.currency, 12),
    decimalPlaces: finiteNumber(extraUsage?.decimal_places),
    disabledReason: boundedString(
      extraUsage?.disabled_reason ?? spend?.disabled_reason,
      160,
    ),
    spentAmountMinor: finiteNumber(spent?.amount_minor),
    spentCurrency: boundedString(spent?.currency, 12),
    spentExponent: finiteNumber(spent?.exponent),
  };
}

function parseCredits(body: UnknownRecord): ClaudePersonalCredits {
  return {
    amount: finiteNumber(body.amount),
    currency: boundedString(body.currency, 12),
    balanceCredits: finiteNumber(body.balance_credits),
    nextExpiresAt: boundedString(body.next_expires_at),
  };
}

export function extractClaudePersonalUsageContract(
  entries: readonly PageSessionObservedNetworkEntry[],
  textSnippets: readonly string[] = [],
): ClaudePersonalUsageContract | null {
  let usageBody: UnknownRecord | null = null;
  let creditsBody: UnknownRecord | null = null;

  for (const entry of entries.slice(-MAX_CLAUDE_PERSONAL_LIMITS)) {
    if (entry.ok === false) {
      continue;
    }

    const kind = endpointKind(entry.url);
    const body = parseJsonObject(entry.bodyText);
    if (!kind || !body) {
      continue;
    }

    if (kind === "usage") {
      usageBody = body;
    } else if (kind === "credits") {
      creditsBody = body;
    }
  }

  if (!usageBody && !creditsBody) {
    return null;
  }

  return {
    planIdentity: detectClaudePersonalPlanIdentity(textSnippets),
    limits: usageBody ? parseLimits(usageBody) : [],
    extraUsage: usageBody ? parseExtraUsage(usageBody) : null,
    credits: creditsBody ? parseCredits(creditsBody) : null,
    memberDashboardAvailable: usageBody
      ? nullableBoolean(usageBody.member_dashboard_available)
      : null,
  };
}
