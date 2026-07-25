import {
  CUSTOM_SOURCE_MAX_BALANCES,
  CUSTOM_SOURCE_MAX_WINDOWS,
  normalizeCustomSourceResponse,
  type CustomSourceId,
  type CustomSourceSnapshot,
} from "./custom-sources";
import { normalizeLocalCompanionBearerToken } from "./local-companion-bridge";

export const CODEXBAR_DASHBOARD_SCHEMA_VERSION = 1 as const;
export const CODEXBAR_DASHBOARD_PATH = "/dashboard/v1/snapshot";
export const CODEXBAR_DASHBOARD_FETCH_TIMEOUT_MS = 7_500;
export const CODEXBAR_DASHBOARD_MAX_RESPONSE_CHARS = 256 * 1024;
export const CODEXBAR_DASHBOARD_MAX_PROVIDERS = 64;
export const CODEXBAR_DASHBOARD_SOURCE_PREFIX = "custom:codexbar-";

const SAFE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/u;
const SAFE_TEXT_PATTERN = /^[^<>\u0000-\u001F\u007F]{1,160}$/u;
const STATUS_LEVELS = new Set(["ok", "warning", "critical", "unknown"]);
const MAX_STALE_AFTER_SECONDS = 24 * 60 * 60;
const MAX_REFRESH_INTERVAL_SECONDS = 24 * 60 * 60;
const MAX_MONEY_OR_CREDIT_VALUE = 1_000_000_000_000;

type FetchLike = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export type CodexBarDashboardBridgeFailureCode =
  | "invalid_endpoint"
  | "invalid_token"
  | "unavailable"
  | "timeout"
  | "unauthorized"
  | "rate_limited"
  | "http_error"
  | "invalid_content_type"
  | "response_too_large"
  | "invalid_response";

export type CodexBarDashboardBridgeFailure = {
  ok: false;
  code: CodexBarDashboardBridgeFailureCode;
  message: string;
  statusCode?: number;
  issues?: string[];
};

export type CodexBarDashboardSource = {
  sourceId: CustomSourceId;
  upstreamProviderId: string;
  enabled: boolean;
  snapshot: CustomSourceSnapshot;
};

export type CodexBarDashboardSnapshot = {
  schemaVersion: typeof CODEXBAR_DASHBOARD_SCHEMA_VERSION;
  generatedAt: string;
  staleAfterSeconds: number;
  stale: boolean;
  hostVersion: string | null;
  refreshIntervalSeconds: number;
  sources: CodexBarDashboardSource[];
};

export type CodexBarDashboardBridgeResult =
  | { ok: true; value: CodexBarDashboardSnapshot }
  | CodexBarDashboardBridgeFailure;

type FetchCodexBarDashboardOptions = {
  fetchImpl?: FetchLike;
  maxResponseChars?: number;
  now?: Date;
  timeoutMs?: number;
};

type ParsedWindow = {
  kind: string;
  label: string;
  usedPercent: number;
  remainingPercent: number;
  resetAt: string | null;
};

type ParsedProvider = {
  id: string;
  name: string;
  enabled: boolean;
  source: string;
  status: {
    level: "ok" | "warning" | "critical" | "unknown";
    label: string;
  } | null;
  windows: ParsedWindow[];
  credits: { remaining: number; unit: string } | null;
  cost: { todayUSD: number | null; last30DaysUSD: number | null } | null;
  hasError: boolean;
  updatedAt: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function getFetch(fetchImpl?: FetchLike): FetchLike {
  if (fetchImpl) {
    return fetchImpl;
  }
  if (typeof fetch !== "function") {
    throw new Error("Fetch is not available in this runtime.");
  }
  return fetch;
}

export function normalizeCodexBarDashboardEndpoint(
  value: unknown,
): { ok: true; value: string } | CodexBarDashboardBridgeFailure {
  if (typeof value !== "string" || value.trim().length === 0) {
    return {
      ok: false,
      code: "invalid_endpoint",
      message: "A CodexBar loopback dashboard endpoint is required.",
    };
  }

  try {
    const url = new URL(value.trim());
    const port = Number.parseInt(url.port, 10);

    if (
      url.protocol !== "http:" ||
      url.hostname !== "127.0.0.1" ||
      !Number.isInteger(port) ||
      port < 1 ||
      port > 65_535 ||
      url.pathname !== CODEXBAR_DASHBOARD_PATH ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      return {
        ok: false,
        code: "invalid_endpoint",
        message:
          "Use the exact http://127.0.0.1:<port>/dashboard/v1/snapshot endpoint.",
      };
    }

    return { ok: true, value: url.toString() };
  } catch {
    return {
      ok: false,
      code: "invalid_endpoint",
      message: "The CodexBar dashboard endpoint is invalid.",
    };
  }
}

function normalizeSafeText(
  value: unknown,
  path: string,
  issues: string[],
  maxLength = 160,
): string | null {
  if (typeof value !== "string") {
    issues.push(`${path}: expected a string.`);
    return null;
  }
  const normalized = value.replace(/\s+/gu, " ").trim();
  if (
    normalized.length === 0 ||
    normalized.length > maxLength ||
    !SAFE_TEXT_PATTERN.test(normalized)
  ) {
    issues.push(`${path}: invalid display text.`);
    return null;
  }
  return normalized;
}

function normalizeTimestamp(
  value: unknown,
  path: string,
  issues: string[],
  required = false,
): string | null {
  if (value === null || value === undefined) {
    if (required) {
      issues.push(`${path}: timestamp is required.`);
    }
    return null;
  }
  if (typeof value !== "string" || value.length > 96) {
    issues.push(`${path}: invalid timestamp.`);
    return null;
  }
  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) {
    issues.push(`${path}: invalid timestamp.`);
    return null;
  }
  return value;
}

function normalizeBoundedNumber(
  value: unknown,
  path: string,
  issues: string[],
  min: number,
  max: number,
  options: { integer?: boolean; nullable?: boolean } = {},
): number | null {
  if ((value === null || value === undefined) && options.nullable) {
    return null;
  }
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < min ||
    value > max ||
    (options.integer && !Number.isInteger(value))
  ) {
    issues.push(`${path}: invalid numeric value.`);
    return null;
  }
  return value;
}

function parseWindow(
  value: unknown,
  path: string,
  issues: string[],
): ParsedWindow | null {
  if (!isRecord(value)) {
    issues.push(`${path}: expected a window object.`);
    return null;
  }

  const kind =
    typeof value.kind === "string" && SAFE_ID_PATTERN.test(value.kind)
      ? value.kind
      : null;
  if (!kind) {
    issues.push(`${path}.kind: invalid window identifier.`);
  }
  const label = normalizeSafeText(value.label, `${path}.label`, issues, 96);
  const usedPercent = normalizeBoundedNumber(
    value.usedPercent,
    `${path}.usedPercent`,
    issues,
    0,
    100,
  );
  const remainingPercent = normalizeBoundedNumber(
    value.remainingPercent,
    `${path}.remainingPercent`,
    issues,
    0,
    100,
  );
  const resetAt = normalizeTimestamp(value.resetAt, `${path}.resetAt`, issues);

  if (
    usedPercent !== null &&
    remainingPercent !== null &&
    Math.abs(usedPercent + remainingPercent - 100) > 0.1
  ) {
    issues.push(`${path}: used and remaining percentages must total 100.`);
  }

  return kind && label && usedPercent !== null && remainingPercent !== null
    ? { kind, label, usedPercent, remainingPercent, resetAt }
    : null;
}

function parseProvider(
  value: unknown,
  index: number,
  issues: string[],
): ParsedProvider | null {
  const path = `providers[${index}]`;
  if (!isRecord(value)) {
    issues.push(`${path}: expected a provider object.`);
    return null;
  }

  const id =
    typeof value.id === "string" && SAFE_ID_PATTERN.test(value.id)
      ? value.id
      : null;
  if (!id) {
    issues.push(`${path}.id: invalid provider identifier.`);
  }
  const name = normalizeSafeText(value.name, `${path}.name`, issues, 80);
  const enabled = typeof value.enabled === "boolean" ? value.enabled : null;
  if (enabled === null) {
    issues.push(`${path}.enabled: expected a boolean.`);
  }
  const source = normalizeSafeText(value.source, `${path}.source`, issues, 64);

  let status: ParsedProvider["status"] = null;
  if (value.status !== null && value.status !== undefined) {
    if (!isRecord(value.status) || !STATUS_LEVELS.has(String(value.status.level))) {
      issues.push(`${path}.status: invalid status object.`);
    } else {
      const label = normalizeSafeText(
        value.status.label,
        `${path}.status.label`,
        issues,
        96,
      );
      normalizeTimestamp(
        value.status.updatedAt,
        `${path}.status.updatedAt`,
        issues,
      );
      if (label) {
        status = {
          level: value.status.level as ParsedProvider["status"] extends infer T
            ? T extends { level: infer L }
              ? L
              : never
            : never,
          label,
        };
      }
    }
  }

  const rawWindows = Array.isArray(value.windows) ? value.windows : null;
  if (!rawWindows || rawWindows.length > CUSTOM_SOURCE_MAX_WINDOWS) {
    issues.push(`${path}.windows: expected at most ${CUSTOM_SOURCE_MAX_WINDOWS} windows.`);
  }
  const windows = (rawWindows ?? []).flatMap((entry, windowIndex) => {
    const parsed = parseWindow(entry, `${path}.windows[${windowIndex}]`, issues);
    return parsed ? [parsed] : [];
  });

  let credits: ParsedProvider["credits"] = null;
  if (value.credits !== null && value.credits !== undefined) {
    if (!isRecord(value.credits)) {
      issues.push(`${path}.credits: invalid credits object.`);
    } else {
      const remaining = normalizeBoundedNumber(
        value.credits.remaining,
        `${path}.credits.remaining`,
        issues,
        0,
        MAX_MONEY_OR_CREDIT_VALUE,
      );
      const unit = normalizeSafeText(
        value.credits.unit,
        `${path}.credits.unit`,
        issues,
        32,
      );
      if (remaining !== null && unit) {
        credits = { remaining, unit };
      }
    }
  }

  let cost: ParsedProvider["cost"] = null;
  if (value.cost !== null && value.cost !== undefined) {
    if (!isRecord(value.cost)) {
      issues.push(`${path}.cost: invalid cost object.`);
    } else {
      const todayUSD = normalizeBoundedNumber(
        value.cost.todayUSD,
        `${path}.cost.todayUSD`,
        issues,
        0,
        MAX_MONEY_OR_CREDIT_VALUE,
        { nullable: true },
      );
      const last30DaysUSD = normalizeBoundedNumber(
        value.cost.last30DaysUSD,
        `${path}.cost.last30DaysUSD`,
        issues,
        0,
        MAX_MONEY_OR_CREDIT_VALUE,
        { nullable: true },
      );
      if (todayUSD !== null || last30DaysUSD !== null) {
        cost = { todayUSD, last30DaysUSD };
      }
    }
  }

  if (!isRecord(value.display)) {
    issues.push(`${path}.display: expected display metadata.`);
  }
  const updatedAt = normalizeTimestamp(
    value.updatedAt,
    `${path}.updatedAt`,
    issues,
  );
  const hasError = value.error !== null && value.error !== undefined;
  if (hasError && !isRecord(value.error)) {
    issues.push(`${path}.error: invalid error payload.`);
  }

  return id && name && enabled !== null && source && rawWindows
    ? {
        id,
        name,
        enabled,
        source,
        status,
        windows,
        credits,
        cost,
        hasError,
        updatedAt,
      }
    : null;
}

function hashId(value: string): string {
  let hash = 0x811c9dc5;
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function toCodexBarCustomSourceId(upstreamProviderId: string): CustomSourceId {
  const slug = upstreamProviderId
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/gu, "-")
    .replace(/^-+|-+$/gu, "")
    .slice(0, 42) || "provider";
  return `${CODEXBAR_DASHBOARD_SOURCE_PREFIX}${slug}-${hashId(upstreamProviderId)}`;
}

function providerStatus(provider: ParsedProvider, stale: boolean) {
  if (provider.hasError || provider.status?.level === "critical") {
    return "error" as const;
  }
  if (
    stale ||
    provider.status?.level === "warning" ||
    provider.status?.level === "unknown"
  ) {
    return "warning" as const;
  }
  return "ok" as const;
}

function mapProviderToCustomSource(
  provider: ParsedProvider,
  generatedAt: string,
  stale: boolean,
): CodexBarDashboardSource | null {
  const sourceId = toCodexBarCustomSourceId(provider.id);
  const status = providerStatus(provider, stale);
  const warningReason = provider.hasError
    ? "CodexBar reported a provider refresh error."
    : stale
      ? "The CodexBar dashboard snapshot is stale."
      : status === "warning"
        ? "CodexBar reported a provider warning."
        : null;
  const metrics = provider.windows.map((window) => ({
    label: window.label,
    unit: "percent",
    window: window.kind,
    used: window.usedPercent,
    remaining: window.remainingPercent,
    total: 100,
    resetAt: window.resetAt ?? undefined,
  }));
  const balances = [
    ...(provider.credits
      ? [
          {
            label: "Credits",
            unit: provider.credits.unit,
            remaining: provider.credits.remaining,
          },
        ]
      : []),
    ...(provider.cost?.todayUSD !== null && provider.cost?.todayUSD !== undefined
      ? [
          {
            label: "Cost today",
            unit: "USD",
            used: provider.cost.todayUSD,
          },
        ]
      : []),
    ...(provider.cost?.last30DaysUSD !== null &&
    provider.cost?.last30DaysUSD !== undefined
      ? [
          {
            label: "Cost over 30 days",
            unit: "USD",
            used: provider.cost.last30DaysUSD,
          },
        ]
      : []),
  ].slice(0, CUSTOM_SOURCE_MAX_BALANCES);

  const normalized = normalizeCustomSourceResponse(
    {
      schema: "ai-usage-dashboard.custom-source.v1",
      id: `codexbar:${provider.id}`,
      label: `CodexBar · ${provider.name}`,
      description: "Authenticated local CodexBar dashboard snapshot",
      status,
      tone: status === "ok" ? "neutral" : status,
      syncedAt: provider.updatedAt ?? generatedAt,
      summary: provider.status?.label ?? undefined,
      quota: metrics[0],
      windows: metrics,
      balances,
      facts: [{ label: "CodexBar source", value: provider.source }],
      warningReason,
    },
    { sourceId, fetchedAt: generatedAt },
  );

  return normalized.ok
    ? {
        sourceId,
        upstreamProviderId: provider.id,
        enabled: provider.enabled,
        snapshot: normalized.value,
      }
    : null;
}

export function parseCodexBarDashboardSnapshot(
  rawText: string,
  options: { now?: Date; maxResponseChars?: number } = {},
): CodexBarDashboardBridgeResult {
  const maxResponseChars =
    options.maxResponseChars ?? CODEXBAR_DASHBOARD_MAX_RESPONSE_CHARS;
  if (rawText.length > maxResponseChars) {
    return {
      ok: false,
      code: "response_too_large",
      message: "The CodexBar dashboard response exceeded the size limit.",
    };
  }

  let value: unknown;
  try {
    value = JSON.parse(rawText) as unknown;
  } catch {
    return {
      ok: false,
      code: "invalid_response",
      message: "The CodexBar dashboard response was not valid JSON.",
    };
  }

  const issues: string[] = [];
  if (!isRecord(value)) {
    return {
      ok: false,
      code: "invalid_response",
      message: "The CodexBar dashboard response must be a JSON object.",
    };
  }
  if (value.schemaVersion !== CODEXBAR_DASHBOARD_SCHEMA_VERSION) {
    issues.push("schemaVersion: unsupported dashboard schema.");
  }
  const generatedAt = normalizeTimestamp(
    value.generatedAt,
    "generatedAt",
    issues,
    true,
  );
  const staleAfterSeconds = normalizeBoundedNumber(
    value.staleAfterSeconds,
    "staleAfterSeconds",
    issues,
    1,
    MAX_STALE_AFTER_SECONDS,
    { integer: true },
  );
  const host = isRecord(value.host) ? value.host : null;
  if (!host) {
    issues.push("host: expected host metadata.");
  }
  const hostVersion =
    host?.codexBarVersion === null || host?.codexBarVersion === undefined
      ? null
      : normalizeSafeText(
          host.codexBarVersion,
          "host.codexBarVersion",
          issues,
          32,
        );
  const refreshIntervalSeconds = normalizeBoundedNumber(
    host?.refreshIntervalSeconds,
    "host.refreshIntervalSeconds",
    issues,
    0,
    MAX_REFRESH_INTERVAL_SECONDS,
    { integer: true },
  );
  const rawProviders = Array.isArray(value.providers) ? value.providers : null;
  if (!rawProviders || rawProviders.length > CODEXBAR_DASHBOARD_MAX_PROVIDERS) {
    issues.push(
      `providers: expected at most ${CODEXBAR_DASHBOARD_MAX_PROVIDERS} entries.`,
    );
  }
  const providers = (rawProviders ?? []).flatMap((provider, index) => {
    const parsed = parseProvider(provider, index, issues);
    return parsed ? [parsed] : [];
  });
  const uniqueProviderIds = new Set(providers.map((provider) => provider.id));
  if (uniqueProviderIds.size !== providers.length) {
    issues.push("providers: duplicate provider identifiers are not accepted.");
  }

  if (
    issues.length > 0 ||
    !generatedAt ||
    staleAfterSeconds === null ||
    refreshIntervalSeconds === null ||
    !rawProviders
  ) {
    return {
      ok: false,
      code: "invalid_response",
      message: "The CodexBar dashboard response failed schema validation.",
      issues: issues.slice(0, 12),
    };
  }

  const now = options.now ?? new Date();
  const generatedAtMs = new Date(generatedAt).getTime();
  if (generatedAtMs > now.getTime() + 5 * 60_000) {
    return {
      ok: false,
      code: "invalid_response",
      message: "The CodexBar dashboard timestamp is in the future.",
    };
  }
  const stale = generatedAtMs + staleAfterSeconds * 1_000 < now.getTime();
  const sources = providers.flatMap((provider) => {
    const mapped = mapProviderToCustomSource(provider, generatedAt, stale);
    return mapped ? [mapped] : [];
  });
  if (sources.length !== providers.length) {
    return {
      ok: false,
      code: "invalid_response",
      message: "A CodexBar provider row could not be normalized safely.",
    };
  }

  return {
    ok: true,
    value: {
      schemaVersion: CODEXBAR_DASHBOARD_SCHEMA_VERSION,
      generatedAt,
      staleAfterSeconds,
      stale,
      hostVersion,
      refreshIntervalSeconds,
      sources,
    },
  };
}

async function readBoundedText(
  response: Response,
  maxResponseChars: number,
): Promise<{ ok: true; value: string } | CodexBarDashboardBridgeFailure> {
  const contentLength = Number.parseInt(
    response.headers.get("content-length") ?? "",
    10,
  );
  if (Number.isFinite(contentLength) && contentLength > maxResponseChars) {
    return {
      ok: false,
      code: "response_too_large",
      message: "The CodexBar dashboard response exceeded the size limit.",
    };
  }
  if (!response.body) {
    const body = await response.text();
    return body.length <= maxResponseChars
      ? { ok: true, value: body }
      : {
          ok: false,
          code: "response_too_large",
          message: "The CodexBar dashboard response exceeded the size limit.",
        };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let body = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      body += decoder.decode();
      break;
    }
    body += decoder.decode(value, { stream: true });
    if (body.length > maxResponseChars) {
      await reader.cancel().catch(() => undefined);
      return {
        ok: false,
        code: "response_too_large",
        message: "The CodexBar dashboard response exceeded the size limit.",
      };
    }
  }

  return body.length <= maxResponseChars
    ? { ok: true, value: body }
    : {
        ok: false,
        code: "response_too_large",
        message: "The CodexBar dashboard response exceeded the size limit.",
      };
}

export async function fetchCodexBarDashboardSnapshot(
  endpointUrl: string,
  token: string,
  options: FetchCodexBarDashboardOptions = {},
): Promise<CodexBarDashboardBridgeResult> {
  const endpoint = normalizeCodexBarDashboardEndpoint(endpointUrl);
  if (!endpoint.ok) {
    return endpoint;
  }
  const normalizedToken = normalizeLocalCompanionBearerToken(token);
  if (!normalizedToken) {
    return {
      ok: false,
      code: "invalid_token",
      message: "A strong CodexBar dashboard bearer token is required.",
    };
  }

  const maxResponseChars =
    options.maxResponseChars ?? CODEXBAR_DASHBOARD_MAX_RESPONSE_CHARS;
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(
    () => controller.abort(),
    Math.max(1, options.timeoutMs ?? CODEXBAR_DASHBOARD_FETCH_TIMEOUT_MS),
  );

  try {
    const response = await getFetch(options.fetchImpl)(endpoint.value, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${normalizedToken}`,
      },
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
      referrerPolicy: "no-referrer",
      signal: controller.signal,
    });

    if (!response.ok) {
      const code =
        response.status === 401
          ? "unauthorized"
          : response.status === 429
            ? "rate_limited"
            : "http_error";
      return {
        ok: false,
        code,
        statusCode: response.status,
        message:
          code === "unauthorized"
            ? "CodexBar rejected the dashboard token."
            : code === "rate_limited"
              ? "CodexBar temporarily rate limited the dashboard request."
              : `CodexBar returned HTTP ${response.status}.`,
      };
    }

    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
    if (!contentType.startsWith("application/json")) {
      return {
        ok: false,
        code: "invalid_content_type",
        message: "CodexBar did not return an application/json response.",
      };
    }
    const body = await readBoundedText(response, maxResponseChars);
    if (!body.ok) {
      return body;
    }
    return parseCodexBarDashboardSnapshot(body.value, {
      maxResponseChars,
      now: options.now,
    });
  } catch (error) {
    return {
      ok: false,
      code: isAbortError(error) ? "timeout" : "unavailable",
      message: isAbortError(error)
        ? "The CodexBar dashboard request timed out."
        : "The CodexBar dashboard is unavailable.",
    };
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}
