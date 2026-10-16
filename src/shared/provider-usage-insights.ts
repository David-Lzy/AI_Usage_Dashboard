import type {
  ProviderId, ProviderInsightCapture, ProviderResetCredits, ProviderResetOffer,
  ProviderScopedBalance, ProviderUsageDistribution, ProviderUsageInsights,
  ProviderQuotaPool,
} from "../providers/types";
import { normalizeSnapshotTimestamp } from "./snapshot-freshness";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const nonnegative = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;
const text = (value: unknown, max = 80): string | null => {
  if (typeof value !== "string") return null;
  const clean = value.replace(/\s+/g, " ").trim();
  return clean && clean.length <= max && !/[<>\u0000-\u001f\u007f@]/.test(clean) ? clean : null;
};

function insightTimestamp(value: unknown): string | null {
  return typeof value === "string" && day(value.slice(0, 10)) ? normalizeSnapshotTimestamp(value) : null;
}

function capture(raw: Record<string, unknown>): ProviderInsightCapture | null {
  const capturedAt = insightTimestamp(raw.capturedAt);
  return capturedAt && (raw.source === "page" || raw.source === "local_companion")
    && typeof raw.accountVerified === "boolean"
    ? { source: raw.source, capturedAt, accountVerified: raw.source === "local_companion" && raw.accountVerified } : null;
}

export function normalizeProviderResetCredits(value: unknown): ProviderResetCredits | null {
  if (!isRecord(value)) return null;
  const meta = capture(value);
  if (!meta || value.availableCount !== null
    && (!Number.isSafeInteger(value.availableCount) || Number(value.availableCount) < 0)) return null;
  if (value.offers !== null && !Array.isArray(value.offers)) return null;
  const offers: ProviderResetOffer[] | null = value.offers === null ? null : [];
  if (Array.isArray(value.offers)) for (const item of value.offers.slice(0, 32)) {
    if (!isRecord(item) || typeof item.kind !== "string" || !["codex", "full", "rolling_5h", "unknown"].includes(item.kind)
      || item.available !== null && typeof item.available !== "boolean") continue;
    const expiresAt = insightTimestamp(item.expiresAt);
    if (item.expiresAt !== null && !expiresAt) continue;
    const expiryText = text(item.expiryText);
    offers!.push({ kind: item.kind as ProviderResetOffer["kind"], available: item.available as boolean | null,
      expiresAt, ...(expiryText ? { expiryText } : {}) });
  }
  const count = value.availableCount as number | null;
  return { ...meta, availableCount: count, offers,
    detailsComplete: offers === null || count === null ? null
      : offers.filter((offer) => offer.available === true).length >= count };
}

function normalizeBalance(value: unknown): ProviderScopedBalance | null {
  if (!isRecord(value)) return null;
  const meta = capture(value);
  const unit = value.unit === "credits" || typeof value.unit === "string" && /^[A-Z]{3}$/.test(value.unit)
    ? value.unit as string : null;
  const expiresAt = insightTimestamp(value.expiresAt);
  if (!meta || !unit || value.id !== "cloud_session" && value.id !== "usage_credit"
    || value.remaining !== null && !nonnegative(value.remaining)
    || value.total !== null && !nonnegative(value.total)
    || value.expiresAt !== null && !expiresAt) return null;
  if (nonnegative(value.remaining) && nonnegative(value.total) && value.remaining > value.total) return null;
  const expiryText = text(value.expiryText);
  return { ...meta, id: value.id, unit, remaining: value.remaining as number | null,
    total: value.total as number | null, expiresAt, ...(expiryText ? { expiryText } : {}) };
}

function day(value: unknown): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const time = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(time) && new Date(time).toISOString().startsWith(value) ? value : null;
}

function normalizeDistribution(value: unknown): ProviderUsageDistribution | null {
  if (!isRecord(value)) return null;
  const meta = capture(value);
  if (!meta || value.kind !== "function" && value.kind !== "product" || value.unit !== "percent"
    || !Array.isArray(value.values)) return null;
  const seen = new Set<string>();
  const values = value.values.slice(0, 16).flatMap((item) => {
    if (!isRecord(item) || typeof item.id !== "string" || !/^[a-z][a-z0-9_.-]{0,47}$/.test(item.id)
      || seen.has(item.id) || !nonnegative(item.value) || item.value > 100) return [];
    const label = text(item.label);
    if (!label) return [];
    seen.add(item.id);
    return [{ id: item.id, label, value: item.value }];
  });
  if (!values.length || values.reduce((sum, item) => sum + item.value, 0) > 101) return null;
  const rangeStart = day(value.rangeStart), rangeEnd = day(value.rangeEnd);
  if (value.rangeStart !== null && !rangeStart || value.rangeEnd !== null && !rangeEnd
    || rangeStart && rangeEnd && rangeStart > rangeEnd) return null;
  return { ...meta, kind: value.kind, unit: "percent", rangeStart, rangeEnd, values };
}

function normalizeQuotaPool(value: unknown): ProviderQuotaPool | null {
  if (!isRecord(value)) return null;
  const meta = capture(value);
  const resetAt = insightTimestamp(value.resetAt);
  if (!meta || meta.source !== "page" || typeof value.id !== "string" || !["cursor_models", "other_models", "grok_bot"].includes(value.id)
    || value.kind !== "monthly" && value.kind !== "weekly"
    || value.kind !== (value.id === "grok_bot" ? "weekly" : "monthly")
    || value.usedPercent !== null && (!nonnegative(value.usedPercent) || value.usedPercent > 100)
    || value.remainingPercent !== null && (!nonnegative(value.remainingPercent) || value.remainingPercent > 100)
    || value.resetAt !== null && !resetAt) return null;
  if (nonnegative(value.usedPercent) && nonnegative(value.remainingPercent)
    && Math.abs(value.usedPercent + value.remainingPercent - 100) > 0.01) return null;
  const resetText = text(value.resetText);
  return { ...meta, id: value.id as ProviderQuotaPool["id"], kind: value.kind,
    usedPercent: value.usedPercent as number | null, remainingPercent: value.remainingPercent as number | null,
    resetAt, ...(resetText ? { resetText } : {}) };
}

export function normalizeProviderUsageInsights(value: unknown, providerId?: ProviderId): ProviderUsageInsights | null {
  if (!isRecord(value) || providerId && !["codex-personal-page", "claude-code-team-page", "cursor-personal-page"].includes(providerId)) return null;
  const result: ProviderUsageInsights = {};
  if (isRecord(value.quotaScope)) {
    const meta = capture(value.quotaScope);
    if (meta && (value.quotaScope.scope === "shared_plan" || value.quotaScope.scope === "provider"))
      result.quotaScope = { ...meta, scope: value.quotaScope.scope };
  }
  const resets = normalizeProviderResetCredits(value.resetCredits);
  if (resets) result.resetCredits = resets;
  if (Array.isArray(value.balances)) {
    const seen = new Set<string>();
    const balances = value.balances.slice(0, 8).flatMap((item) => {
      const balance = normalizeBalance(item);
      if (!balance || seen.has(balance.id)) return [];
      seen.add(balance.id);
      return [balance];
    });
    if (balances.length) result.balances = balances;
  }
  const distribution = normalizeDistribution(value.distribution);
  if (distribution) result.distribution = distribution;
  if ((!providerId || providerId === "cursor-personal-page") && Array.isArray(value.quotaPools)) {
    const seen = new Set<string>();
    const pools = value.quotaPools.slice(0, 8).flatMap((item) => {
      const pool = normalizeQuotaPool(item);
      if (!pool || seen.has(pool.id)) return [];
      seen.add(pool.id);
      return [pool];
    });
    if (pools.length) result.quotaPools = pools;
  }
  if (providerId !== undefined && providerId !== "codex-personal-page") {
    if (result.quotaScope?.source === "local_companion") delete result.quotaScope;
    if (result.resetCredits?.source === "local_companion") delete result.resetCredits;
    if (result.distribution?.source === "local_companion") delete result.distribution;
    result.balances = result.balances?.filter((balance) => balance.source !== "local_companion");
    if (!result.balances?.length) delete result.balances;
  }
  return Object.keys(result).length ? result : null;
}

export function mergeProviderUsageInsights(current?: ProviderUsageInsights, previous?: ProviderUsageInsights): ProviderUsageInsights | undefined {
  if (!current && !previous) return undefined;
  const latest = <T extends ProviderInsightCapture>(next: T | undefined, old: T | undefined): T | undefined =>
    !next || old && Date.parse(old.capturedAt) > Date.parse(next.capturedAt) ? old : next;
  const balances = new Map(previous?.balances?.map((balance) => [balance.id, balance]));
  for (const balance of current?.balances ?? []) balances.set(balance.id, latest(balance, balances.get(balance.id))!);
  const quotaScope = latest(current?.quotaScope, previous?.quotaScope);
  const resetCredits = latest(current?.resetCredits, previous?.resetCredits);
  const distribution = latest(current?.distribution, previous?.distribution);
  const pools = new Map(previous?.quotaPools?.map((pool) => [pool.id, pool]));
  for (const pool of current?.quotaPools ?? []) pools.set(pool.id, latest(pool, pools.get(pool.id))!);
  return { ...(quotaScope ? { quotaScope } : {}), ...(resetCredits ? { resetCredits } : {}),
    ...(distribution ? { distribution } : {}), ...(balances.size ? { balances: [...balances.values()] } : {}),
    ...(pools.size ? { quotaPools: [...pools.values()] } : {}) };
}
