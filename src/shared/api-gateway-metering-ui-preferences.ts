import type {
  ApiGatewayMeteringModuleId,
  DisplaySurface,
  ProviderAccountId,
  ProviderId,
} from "../providers/types";
import {
  getSafeLocalStorage,
  getSafeStorageItem,
  setSafeStorageItem,
  type WebStorageLike,
} from "./local-storage";

export type ApiGatewayTrendMetric = "actual_spend" | "tokens" | "requests";
export type ApiGatewayTrendRangeDays = 7 | 30;

type Options = { storage?: WebStorageLike | null };

const STORAGE_KEY_PREFIX = "ai-usage-dashboard:api-gateway-metering:ui:";

function resolveStorage(options?: Options): WebStorageLike | null {
  return options && "storage" in options
    ? (options.storage ?? null)
    : getSafeLocalStorage();
}

function buildKey(
  providerId: ProviderId,
  accountId: ProviderAccountId,
  surface: DisplaySurface,
  field: string,
): string {
  return `${STORAGE_KEY_PREFIX}${encodeURIComponent(providerId)}:${encodeURIComponent(accountId)}:${surface}:${field}`;
}

export function readApiGatewayModuleCollapsed(
  providerId: ProviderId,
  accountId: ProviderAccountId,
  surface: DisplaySurface,
  moduleId: ApiGatewayMeteringModuleId,
  options?: Options,
): boolean {
  return (
    getSafeStorageItem(
      resolveStorage(options),
      buildKey(providerId, accountId, surface, `collapsed:${moduleId}`),
    ) === "1"
  );
}

export function writeApiGatewayModuleCollapsed(
  providerId: ProviderId,
  accountId: ProviderAccountId,
  surface: DisplaySurface,
  moduleId: ApiGatewayMeteringModuleId,
  collapsed: boolean,
  options?: Options,
): void {
  setSafeStorageItem(
    resolveStorage(options),
    buildKey(providerId, accountId, surface, `collapsed:${moduleId}`),
    collapsed ? "1" : "0",
  );
}

export function readApiGatewayTrendRangeDays(
  providerId: ProviderId,
  accountId: ProviderAccountId,
  surface: DisplaySurface,
  options?: Options,
): ApiGatewayTrendRangeDays {
  return getSafeStorageItem(
    resolveStorage(options),
    buildKey(providerId, accountId, surface, "range"),
  ) === "30"
    ? 30
    : 7;
}

export function writeApiGatewayTrendRangeDays(
  providerId: ProviderId,
  accountId: ProviderAccountId,
  surface: DisplaySurface,
  rangeDays: ApiGatewayTrendRangeDays,
  options?: Options,
): void {
  setSafeStorageItem(
    resolveStorage(options),
    buildKey(providerId, accountId, surface, "range"),
    String(rangeDays),
  );
}

export function readApiGatewayTrendMetric(
  providerId: ProviderId,
  accountId: ProviderAccountId,
  surface: DisplaySurface,
  options?: Options,
): ApiGatewayTrendMetric {
  const value = getSafeStorageItem(
    resolveStorage(options),
    buildKey(providerId, accountId, surface, "metric"),
  );
  return value === "tokens" || value === "requests" ? value : "actual_spend";
}

export function writeApiGatewayTrendMetric(
  providerId: ProviderId,
  accountId: ProviderAccountId,
  surface: DisplaySurface,
  metric: ApiGatewayTrendMetric,
  options?: Options,
): void {
  setSafeStorageItem(
    resolveStorage(options),
    buildKey(providerId, accountId, surface, "metric"),
    metric,
  );
}
