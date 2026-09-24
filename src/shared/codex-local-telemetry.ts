import type { CodexLocalTelemetry, CodexObservedEstimate } from "../providers/types";

const finiteNonnegative = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0;

export function normalizeCodexLocalTelemetry(value: unknown): CodexLocalTelemetry | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const count = raw.availableResetCount;
  if (count !== null && (!Number.isSafeInteger(count) || Number(count) < 0)) return null;
  if (typeof raw.accountVerified !== "boolean" || !Array.isArray(raw.estimates) || raw.estimates.length > 2) return null;
  const estimates: CodexObservedEstimate[] = [];
  const seen = new Set<string>();
  for (const item of raw.estimates) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    const estimate = item as Record<string, unknown>;
    if ((estimate.windowId !== "primary" && estimate.windowId !== "secondary") || seen.has(estimate.windowId) || !["learning", "ready", "unpriced", "account_unknown"].includes(String(estimate.status)) || !Number.isSafeInteger(estimate.sampleCount) || Number(estimate.sampleCount) < 0 || Number(estimate.sampleCount) > 1_000_000 || (estimate.confidence !== null && estimate.confidence !== "low" && estimate.confidence !== "medium") || (estimate.priceDate !== null && (typeof estimate.priceDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/u.test(estimate.priceDate)))) return null;
    const amounts = [estimate.fullUsd, estimate.fullLowerUsd, estimate.fullUpperUsd, estimate.currentUsd];
    if (!amounts.every((entry) => entry === null || finiteNonnegative(entry))) return null;
    if (estimate.status === "ready" && (amounts.some((entry) => entry === null) || !estimate.confidence || !estimate.priceDate)) return null;
    if (estimate.status !== "ready" && amounts.some((entry) => entry !== null)) return null;
    seen.add(estimate.windowId);
    estimates.push({ windowId: estimate.windowId, status: estimate.status as CodexObservedEstimate["status"], fullUsd: estimate.fullUsd as number | null, fullLowerUsd: estimate.fullLowerUsd as number | null, fullUpperUsd: estimate.fullUpperUsd as number | null, currentUsd: estimate.currentUsd as number | null, sampleCount: Number(estimate.sampleCount), confidence: estimate.confidence as CodexObservedEstimate["confidence"], priceDate: estimate.priceDate as string | null });
  }
  return { availableResetCount: count as number | null, accountVerified: raw.accountVerified, estimates };
}
