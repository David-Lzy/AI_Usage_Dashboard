import type {
  ProviderUsageHistory,
  ProviderUsageHistoryPoint,
  ProviderUsageHistoryValue,
} from "../providers/types";

export const MAX_PROVIDER_USAGE_HISTORY_DAYS = 31;
export const MAX_PROVIDER_USAGE_HISTORY_SERIES = 16;

type UsageHistoryUnit = "percent" | "turns";
type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDateKey(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function normalizeValue(value: unknown, unit: UsageHistoryUnit): number | null {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim().length > 0
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  if (unit === "percent") {
    return Math.min(100, Math.max(0, numericValue));
  }

  return Math.max(0, Math.floor(numericValue));
}

function normalizeHistoryValues(
  value: unknown,
  unit: UsageHistoryUnit,
): ProviderUsageHistoryValue[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const values = new Map<string, ProviderUsageHistoryValue>();

  for (const candidate of value) {
    if (!isRecord(candidate)) {
      continue;
    }

    const id = typeof candidate.id === "string" ? candidate.id.trim() : "";
    const label =
      typeof candidate.label === "string" ? candidate.label.trim() : "";
    const normalizedValue = normalizeValue(candidate.value, unit);

    if (!id || !label || normalizedValue === null || values.has(id)) {
      continue;
    }

    values.set(id, { id, label, value: normalizedValue });

    if (values.size >= MAX_PROVIDER_USAGE_HISTORY_SERIES) {
      break;
    }
  }

  const normalizedValues = [...values.values()];

  if (unit !== "percent") {
    return normalizedValues;
  }

  const total = normalizedValues.reduce((sum, item) => sum + item.value, 0);

  if (total <= 100 || total === 0) {
    return normalizedValues;
  }

  return normalizedValues.map((item) => ({
    ...item,
    value: (item.value / total) * 100,
  }));
}

function normalizeHistoryPoints(
  value: unknown,
  unit: UsageHistoryUnit,
): ProviderUsageHistoryPoint[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const points = new Map<string, ProviderUsageHistoryPoint>();

  for (const candidate of value) {
    if (!isRecord(candidate) || !isDateKey(candidate.date)) {
      continue;
    }

    const values = normalizeHistoryValues(candidate.values, unit);
    points.set(candidate.date, { date: candidate.date, values });
  }

  return [...points.values()]
    .sort((left, right) => left.date.localeCompare(right.date))
    .slice(-MAX_PROVIDER_USAGE_HISTORY_DAYS);
}

function normalizeCapturedAt(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const timestamp = new Date(value);
  return Number.isNaN(timestamp.getTime()) ? null : timestamp.toISOString();
}

export function normalizeProviderUsageHistory(
  value: unknown,
): ProviderUsageHistory | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const capturedAt = normalizeCapturedAt(value.capturedAt);
  if (!capturedAt) {
    return undefined;
  }

  const personalSource = isRecord(value.personalUsageBySurface)
    ? value.personalUsageBySurface
    : null;
  const turnsSource = isRecord(value.turns) ? value.turns : null;
  const personalPoints = personalSource
    ? normalizeHistoryPoints(personalSource.points, "percent")
    : [];
  const byModel = turnsSource
    ? normalizeHistoryPoints(turnsSource.byModel, "turns")
    : [];
  const bySurface = turnsSource
    ? normalizeHistoryPoints(turnsSource.bySurface, "turns")
    : [];
  const allDates = [...personalPoints, ...byModel, ...bySurface]
    .map((point) => point.date)
    .sort();

  if (allDates.length === 0) {
    return undefined;
  }

  return {
    capturedAt,
    rangeStart: allDates[0]!,
    rangeEnd: allDates.at(-1)!,
    granularity: "day",
    personalUsageBySurface:
      personalPoints.length > 0
        ? { unit: "percent", points: personalPoints }
        : null,
    turns:
      byModel.length > 0 || bySurface.length > 0
        ? {
            total: normalizeValue(turnsSource?.total, "turns"),
            byModel,
            bySurface,
          }
        : null,
  };
}
