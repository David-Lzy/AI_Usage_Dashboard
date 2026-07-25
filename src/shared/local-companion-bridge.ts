import {
  CUSTOM_SOURCE_RESPONSE_MAX_CHARS,
  isCustomSourceId,
  parseCustomSourceResponseJson,
  toCustomSourceId,
  type CustomSourceId,
  type CustomSourceSnapshot,
  type CustomSourceValidationIssue,
} from "./custom-sources";

export const LOCAL_COMPANION_BRIDGE_SCHEMA_V1 =
  "ai-usage-dashboard.local-bridge.v1" as const;
export const LOCAL_COMPANION_BRIDGE_DEFAULT_PORT = 47_831;
export const LOCAL_COMPANION_BRIDGE_FETCH_TIMEOUT_MS = 5_000;
export const LOCAL_COMPANION_BRIDGE_MAX_INDEX_ENTRIES = 32;
export const LOCAL_COMPANION_BRIDGE_MAX_RESPONSE_CHARS =
  CUSTOM_SOURCE_RESPONSE_MAX_CHARS + 4_096;

export const LOCAL_COMPANION_BRIDGE_PATHS = {
  health: "/v1/health",
  pair: "/v1/pair",
  revoke: "/v1/revoke",
  sources: "/v1/sources",
} as const;

const PAIRING_CODE_PATTERN = /^[A-Z0-9]{4}-[A-Z0-9]{4}$/u;
const BEARER_TOKEN_PATTERN = /^[\x21-\x7E]{32,256}$/u;
const SAFE_LABEL_PATTERN = /^[^<>\u0000-\u001F\u007F]{1,96}$/u;

export type LocalCompanionBridgeSourceIndexEntry = {
  sourceId: CustomSourceId;
  label: string;
};

export type LocalCompanionBridgeHealth = {
  schema: typeof LOCAL_COMPANION_BRIDGE_SCHEMA_V1;
  status: "ok";
  bridgeVersion: string;
  sourceCount: number;
};

export type LocalCompanionBridgeSourceIndex = {
  schema: typeof LOCAL_COMPANION_BRIDGE_SCHEMA_V1;
  sources: LocalCompanionBridgeSourceIndexEntry[];
};

export type LocalCompanionBridgeFailureCode =
  | "invalid_base_url"
  | "invalid_pairing_code"
  | "invalid_token"
  | "unavailable"
  | "timeout"
  | "unauthorized"
  | "rate_limited"
  | "http_error"
  | "response_too_large"
  | "invalid_response";

export type LocalCompanionBridgeResult<T> =
  | { ok: true; value: T }
  | {
      ok: false;
      code: LocalCompanionBridgeFailureCode;
      message: string;
      statusCode?: number;
      issues?: CustomSourceValidationIssue[];
    };

type FetchLike = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

type LocalCompanionRequestOptions = {
  fetchImpl?: FetchLike;
  timeoutMs?: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export function normalizeLocalCompanionBridgeBaseUrl(
  value: unknown,
): LocalCompanionBridgeResult<string> {
  if (typeof value !== "string" || value.trim().length === 0) {
    return {
      ok: false,
      code: "invalid_base_url",
      message: "A loopback bridge URL is required.",
    };
  }

  try {
    const url = new URL(value.trim());
    const isLoopback =
      url.hostname === "127.0.0.1" ||
      url.hostname === "[::1]" ||
      url.hostname === "::1";
    const port = Number.parseInt(url.port, 10);

    if (
      url.protocol !== "http:" ||
      !isLoopback ||
      !Number.isInteger(port) ||
      port < 1 ||
      port > 65_535 ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      (url.pathname !== "/" && url.pathname !== "")
    ) {
      return {
        ok: false,
        code: "invalid_base_url",
        message:
          "The bridge must use an explicit http://127.0.0.1 or http://[::1] port.",
      };
    }

    return { ok: true, value: url.origin };
  } catch {
    return {
      ok: false,
      code: "invalid_base_url",
      message: "The loopback bridge URL is invalid.",
    };
  }
}

export function normalizeLocalCompanionPairingCode(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim().toUpperCase();
  return PAIRING_CODE_PATTERN.test(normalized) ? normalized : null;
}

export function normalizeLocalCompanionBearerToken(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim();
  return BEARER_TOKEN_PATTERN.test(normalized) ? normalized : null;
}

function buildBridgeUrl(baseUrl: string, path: string): string {
  return new URL(path, `${baseUrl}/`).toString();
}

async function readBoundedResponseText(
  response: Response,
): Promise<LocalCompanionBridgeResult<string>> {
  const contentLength = Number.parseInt(
    response.headers.get("content-length") ?? "",
    10,
  );
  if (
    Number.isFinite(contentLength) &&
    contentLength > LOCAL_COMPANION_BRIDGE_MAX_RESPONSE_CHARS
  ) {
    return {
      ok: false,
      code: "response_too_large",
      message: "The local companion response exceeded the size limit.",
    };
  }

  const text = await response.text();
  return text.length <= LOCAL_COMPANION_BRIDGE_MAX_RESPONSE_CHARS
    ? { ok: true, value: text }
    : {
        ok: false,
        code: "response_too_large",
        message: "The local companion response exceeded the size limit.",
      };
}

async function requestLocalCompanion(
  baseUrl: string,
  path: string,
  init: RequestInit,
  options: LocalCompanionRequestOptions,
): Promise<LocalCompanionBridgeResult<string>> {
  const normalizedBaseUrl = normalizeLocalCompanionBridgeBaseUrl(baseUrl);
  if (!normalizedBaseUrl.ok) {
    return normalizedBaseUrl;
  }

  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(
    () => controller.abort(),
    Math.max(1, options.timeoutMs ?? LOCAL_COMPANION_BRIDGE_FETCH_TIMEOUT_MS),
  );

  try {
    const response = await getFetch(options.fetchImpl)(
      buildBridgeUrl(normalizedBaseUrl.value, path),
      {
        ...init,
        cache: "no-store",
        credentials: "omit",
        signal: controller.signal,
      },
    );

    const body = await readBoundedResponseText(response);
    if (!body.ok) {
      return body;
    }
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
            ? "The local companion pairing is missing or no longer valid."
            : code === "rate_limited"
              ? "The local companion request limit was reached."
              : `The local companion returned HTTP ${response.status}.`,
      };
    }

    return body;
  } catch (error) {
    return {
      ok: false,
      code: isAbortError(error) ? "timeout" : "unavailable",
      message: isAbortError(error)
        ? "The local companion request timed out."
        : "The local companion is unavailable.",
    };
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}

function bearerHeaders(token: string): HeadersInit {
  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function parseJsonObject(
  rawText: string,
): LocalCompanionBridgeResult<Record<string, unknown>> {
  try {
    const parsed = JSON.parse(rawText) as unknown;
    return isRecord(parsed)
      ? { ok: true, value: parsed }
      : {
          ok: false,
          code: "invalid_response",
          message: "The local companion response must be a JSON object.",
        };
  } catch {
    return {
      ok: false,
      code: "invalid_response",
      message: "The local companion response was not valid JSON.",
    };
  }
}

export async function pairLocalCompanionBridge(
  baseUrl: string,
  pairingCode: string,
  options: LocalCompanionRequestOptions = {},
): Promise<LocalCompanionBridgeResult<string>> {
  const normalizedCode = normalizeLocalCompanionPairingCode(pairingCode);
  if (!normalizedCode) {
    return {
      ok: false,
      code: "invalid_pairing_code",
      message: "The pairing code must use the XXXX-XXXX format.",
    };
  }

  const response = await requestLocalCompanion(
    baseUrl,
    LOCAL_COMPANION_BRIDGE_PATHS.pair,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ code: normalizedCode }),
    },
    options,
  );
  if (!response.ok) {
    return response;
  }

  const parsed = parseJsonObject(response.value);
  if (!parsed.ok) {
    return parsed;
  }
  const token = normalizeLocalCompanionBearerToken(parsed.value.token);
  return parsed.value.schema === LOCAL_COMPANION_BRIDGE_SCHEMA_V1 && token
    ? { ok: true, value: token }
    : {
        ok: false,
        code: "invalid_response",
        message: "The local companion returned an invalid pairing response.",
      };
}

export async function fetchLocalCompanionBridgeHealth(
  baseUrl: string,
  token: string,
  options: LocalCompanionRequestOptions = {},
): Promise<LocalCompanionBridgeResult<LocalCompanionBridgeHealth>> {
  const normalizedToken = normalizeLocalCompanionBearerToken(token);
  if (!normalizedToken) {
    return {
      ok: false,
      code: "invalid_token",
      message: "The local companion token is invalid.",
    };
  }

  const response = await requestLocalCompanion(
    baseUrl,
    LOCAL_COMPANION_BRIDGE_PATHS.health,
    { headers: bearerHeaders(normalizedToken) },
    options,
  );
  if (!response.ok) {
    return response;
  }
  const parsed = parseJsonObject(response.value);
  if (!parsed.ok) {
    return parsed;
  }

  const { schema, status, bridgeVersion, sourceCount } = parsed.value;
  return schema === LOCAL_COMPANION_BRIDGE_SCHEMA_V1 &&
    status === "ok" &&
    typeof bridgeVersion === "string" &&
    bridgeVersion.length > 0 &&
    bridgeVersion.length <= 32 &&
    Number.isInteger(sourceCount) &&
    Number(sourceCount) >= 0 &&
    Number(sourceCount) <= LOCAL_COMPANION_BRIDGE_MAX_INDEX_ENTRIES
    ? {
        ok: true,
        value: {
          schema,
          status,
          bridgeVersion,
          sourceCount: Number(sourceCount),
        },
      }
    : {
        ok: false,
        code: "invalid_response",
        message: "The local companion returned an invalid health response.",
      };
}

export async function fetchLocalCompanionBridgeSourceIndex(
  baseUrl: string,
  token: string,
  options: LocalCompanionRequestOptions = {},
): Promise<LocalCompanionBridgeResult<LocalCompanionBridgeSourceIndex>> {
  const normalizedToken = normalizeLocalCompanionBearerToken(token);
  if (!normalizedToken) {
    return {
      ok: false,
      code: "invalid_token",
      message: "The local companion token is invalid.",
    };
  }
  const response = await requestLocalCompanion(
    baseUrl,
    LOCAL_COMPANION_BRIDGE_PATHS.sources,
    { headers: bearerHeaders(normalizedToken) },
    options,
  );
  if (!response.ok) {
    return response;
  }
  const parsed = parseJsonObject(response.value);
  if (!parsed.ok) {
    return parsed;
  }
  if (
    parsed.value.schema !== LOCAL_COMPANION_BRIDGE_SCHEMA_V1 ||
    !Array.isArray(parsed.value.sources) ||
    parsed.value.sources.length > LOCAL_COMPANION_BRIDGE_MAX_INDEX_ENTRIES
  ) {
    return {
      ok: false,
      code: "invalid_response",
      message: "The local companion returned an invalid source index.",
    };
  }

  const seen = new Set<CustomSourceId>();
  const sources = parsed.value.sources.flatMap((entry) => {
    if (!isRecord(entry)) {
      return [];
    }
    const sourceId = isCustomSourceId(entry.sourceId) ? entry.sourceId : null;
    const label = typeof entry.label === "string" ? entry.label.trim() : "";
    if (!sourceId || seen.has(sourceId) || !SAFE_LABEL_PATTERN.test(label)) {
      return [];
    }
    seen.add(sourceId);
    return [{ sourceId, label }];
  });

  if (sources.length !== parsed.value.sources.length) {
    return {
      ok: false,
      code: "invalid_response",
      message: "The local companion source index contains invalid entries.",
    };
  }

  return {
    ok: true,
    value: { schema: LOCAL_COMPANION_BRIDGE_SCHEMA_V1, sources },
  };
}

export async function fetchLocalCompanionBridgeSource(
  baseUrl: string,
  token: string,
  sourceId: CustomSourceId,
  options: LocalCompanionRequestOptions & { now?: Date } = {},
): Promise<LocalCompanionBridgeResult<CustomSourceSnapshot>> {
  const normalizedToken = normalizeLocalCompanionBearerToken(token);
  const normalizedSourceId = toCustomSourceId(sourceId);
  if (!normalizedToken) {
    return {
      ok: false,
      code: "invalid_token",
      message: "The local companion token is invalid.",
    };
  }
  if (!normalizedSourceId || normalizedSourceId !== sourceId) {
    return {
      ok: false,
      code: "invalid_response",
      message: "The requested local companion source id is invalid.",
    };
  }

  const response = await requestLocalCompanion(
    baseUrl,
    `${LOCAL_COMPANION_BRIDGE_PATHS.sources}/${encodeURIComponent(sourceId)}`,
    { headers: bearerHeaders(normalizedToken) },
    options,
  );
  if (!response.ok) {
    return response;
  }

  const parsed = parseCustomSourceResponseJson(response.value, {
    sourceId,
    fetchedAt: options.now?.toISOString(),
  });
  return parsed.ok
    ? { ok: true, value: parsed.value }
    : {
        ok: false,
        code: "invalid_response",
        message: "The local companion source payload failed schema validation.",
        issues: parsed.issues,
      };
}

export async function revokeLocalCompanionBridgePairing(
  baseUrl: string,
  token: string,
  options: LocalCompanionRequestOptions = {},
): Promise<LocalCompanionBridgeResult<true>> {
  const normalizedToken = normalizeLocalCompanionBearerToken(token);
  if (!normalizedToken) {
    return {
      ok: false,
      code: "invalid_token",
      message: "The local companion token is invalid.",
    };
  }
  const response = await requestLocalCompanion(
    baseUrl,
    LOCAL_COMPANION_BRIDGE_PATHS.revoke,
    { method: "POST", headers: bearerHeaders(normalizedToken) },
    options,
  );
  return response.ok ? { ok: true, value: true } : response;
}
