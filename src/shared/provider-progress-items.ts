import type {
  ProviderId,
  ProviderSnapshot,
  ProviderTone,
  ProviderUsageBalance,
  ProviderUsageWindow,
  QuotaUnit,
} from "../providers/types";

export type ProviderProgressItemKind =
  | "primary_quota"
  | "usage_window"
  | "usage_balance";

export type ProviderProgressItemAvailability =
  | "progress"
  | "value_only"
  | "unavailable";

export type ProviderProgressItem = {
  id: string;
  kind: ProviderProgressItemKind;
  providerId: ProviderId;
  providerLabel: string;
  label: string;
  quotaUnit: QuotaUnit;
  used: number | null;
  remaining: number | null;
  total: number | null;
  resetAt: string | null;
  resetLabel: string | null;
  detail: string | null;
  tone: ProviderTone;
  availability: ProviderProgressItemAvailability;
};

export type ProviderProgressItemIdsByProvider = Partial<
  Record<ProviderId, string[]>
>;

const FLEX_CREDIT_BALANCE_ITEM_ID_PREFIX = "balance:flex_credit_balance:";

export function isFlexCreditBalanceProgressItemId(itemId: string): boolean {
  return itemId.startsWith(FLEX_CREDIT_BALANCE_ITEM_ID_PREFIX);
}

export function isFlexCreditBalanceProgressItem(
  item: ProviderProgressItem,
): boolean {
  return (
    item.kind === "usage_balance" &&
    isFlexCreditBalanceProgressItemId(item.id)
  );
}

function encodeProgressItemPart(value: string | null | undefined): string {
  return encodeURIComponent(value ?? "");
}

function hasFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function getProgressItemAvailability(
  used: number | null,
  remaining: number | null,
  total: number | null,
): ProviderProgressItemAvailability {
  if (hasFiniteNumber(total) && (hasFiniteNumber(used) || hasFiniteNumber(remaining))) {
    return "progress";
  }

  if (hasFiniteNumber(used) || hasFiniteNumber(remaining) || hasFiniteNumber(total)) {
    return "value_only";
  }

  return "unavailable";
}

function normalizeProgressTotal(
  quotaUnit: QuotaUnit,
  used: number | null,
  remaining: number | null,
  total: number | null,
): number | null {
  if (quotaUnit === "percent" && (hasFiniteNumber(used) || hasFiniteNumber(remaining))) {
    return 100;
  }

  return total;
}

function getUsageWindowTone(usageWindow: ProviderUsageWindow): ProviderTone {
  if (!hasFiniteNumber(usageWindow.remaining)) {
    return "neutral";
  }

  if (usageWindow.remaining <= 30) {
    return "error";
  }

  if (usageWindow.remaining <= 50) {
    return "warning";
  }

  return "neutral";
}

function buildUsageWindowProgressItemId(
  usageWindow: ProviderUsageWindow,
  index: number,
): string {
  return [
    "window",
    usageWindow.kind,
    usageWindow.normalizedLabel,
    usageWindow.modelLabel ?? "",
    String(index),
  ]
    .map(encodeProgressItemPart)
    .join(":");
}

function buildUsageBalanceProgressItemId(
  usageBalance: ProviderUsageBalance,
  index: number,
): string {
  return ["balance", usageBalance.kind, usageBalance.normalizedLabel, String(index)]
    .map(encodeProgressItemPart)
    .join(":");
}

function buildPrimaryProgressItem(
  provider: ProviderSnapshot,
): ProviderProgressItem | null {
  if (!hasFiniteNumber(provider.used) && !hasFiniteNumber(provider.remaining)) {
    return null;
  }

  const total = normalizeProgressTotal(
    provider.quotaUnit,
    provider.used,
    provider.remaining,
    provider.total,
  );

  return {
    id: "primary",
    kind: "primary_quota",
    providerId: provider.providerId,
    providerLabel: provider.providerLabel,
    label: `${provider.quotaWindow} ${provider.quotaUnit}`,
    quotaUnit: provider.quotaUnit,
    used: provider.used,
    remaining: provider.remaining,
    total,
    resetAt: provider.resetAt || null,
    resetLabel: provider.resetLabel || null,
    detail: provider.usageSummary ?? null,
    tone: provider.tone,
    availability: getProgressItemAvailability(
      provider.used,
      provider.remaining,
      total,
    ),
  };
}

function buildUsageWindowProgressItem(
  provider: ProviderSnapshot,
  usageWindow: ProviderUsageWindow,
  index: number,
): ProviderProgressItem | null {
  const total = normalizeProgressTotal(
    usageWindow.quotaUnit,
    usageWindow.used,
    usageWindow.remaining,
    usageWindow.total,
  );
  const availability = getProgressItemAvailability(
    usageWindow.used,
    usageWindow.remaining,
    total,
  );

  if (availability === "unavailable") {
    return null;
  }

  return {
    id: buildUsageWindowProgressItemId(usageWindow, index),
    kind: "usage_window",
    providerId: provider.providerId,
    providerLabel: provider.providerLabel,
    label: usageWindow.normalizedLabel || usageWindow.label,
    quotaUnit: usageWindow.quotaUnit,
    used: usageWindow.used,
    remaining: usageWindow.remaining,
    total,
    resetAt: usageWindow.resetAt,
    resetLabel: usageWindow.resetLabel,
    detail: usageWindow.modelLabel,
    tone: getUsageWindowTone(usageWindow),
    availability,
  };
}

function buildUsageBalanceProgressItem(
  provider: ProviderSnapshot,
  usageBalance: ProviderUsageBalance,
  index: number,
): ProviderProgressItem | null {
  const total = normalizeProgressTotal(
    usageBalance.quotaUnit,
    null,
    usageBalance.remaining,
    usageBalance.total,
  );
  const availability = getProgressItemAvailability(
    null,
    usageBalance.remaining,
    total,
  );

  if (availability === "unavailable") {
    return null;
  }

  return {
    id: buildUsageBalanceProgressItemId(usageBalance, index),
    kind: "usage_balance",
    providerId: provider.providerId,
    providerLabel: provider.providerLabel,
    label: usageBalance.normalizedLabel || usageBalance.label,
    quotaUnit: usageBalance.quotaUnit,
    used: null,
    remaining: usageBalance.remaining,
    total,
    resetAt: null,
    resetLabel: null,
    detail: usageBalance.detail,
    tone: provider.tone,
    availability,
  };
}

export function buildProviderProgressItems(
  provider: ProviderSnapshot,
): ProviderProgressItem[] {
  const progressItems: ProviderProgressItem[] = [];
  const usageWindows = (provider.usageWindows ?? [])
    .map((usageWindow, index) =>
      buildUsageWindowProgressItem(provider, usageWindow, index),
    )
    .filter((item): item is ProviderProgressItem => item !== null);
  const usageBalances = (provider.usageBalances ?? [])
    .map((usageBalance, index) =>
      buildUsageBalanceProgressItem(provider, usageBalance, index),
    )
    .filter((item): item is ProviderProgressItem => item !== null);
  const primaryProgressItem =
    usageWindows.length === 0 ? buildPrimaryProgressItem(provider) : null;

  if (primaryProgressItem) {
    progressItems.push(primaryProgressItem);
  }

  progressItems.push(...usageWindows);
  progressItems.push(...usageBalances);

  return progressItems;
}

export function buildProviderProgressItemIdsByProvider(
  providers: readonly ProviderSnapshot[],
): ProviderProgressItemIdsByProvider {
  return Object.fromEntries(
    providers.map((provider) => [
      provider.providerId,
      buildProviderProgressItems(provider).map((item) => item.id),
    ]),
  ) as ProviderProgressItemIdsByProvider;
}
