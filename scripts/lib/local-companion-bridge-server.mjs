import { randomBytes, timingSafeEqual } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";

export const LOCAL_COMPANION_BRIDGE_SCHEMA_V1 =
  "ai-usage-dashboard.local-bridge.v1";
export const CUSTOM_SOURCE_SCHEMA_V1 =
  "ai-usage-dashboard.custom-source.v1";
export const LOCAL_COMPANION_BRIDGE_MAX_SOURCES = 32;
export const LOCAL_COMPANION_BRIDGE_MAX_BODY_BYTES = 8 * 1024;
export const LOCAL_COMPANION_BRIDGE_MAX_SOURCE_BYTES = 128 * 1024;
export const LOCAL_COMPANION_BRIDGE_DEFAULT_REQUEST_TIMEOUT_MS = 5_000;
export const LOCAL_COMPANION_BRIDGE_DEFAULT_REQUESTS_PER_MINUTE = 120;
export const LOCAL_COMPANION_BRIDGE_DEFAULT_PAIR_ATTEMPTS_PER_MINUTE = 5;

const SOURCE_ID_PATTERN = /^custom:[a-z0-9][a-z0-9_-]{0,63}$/u;
const SAFE_TEXT_PATTERN = /^[^<>\u0000-\u001F\u007F]+$/u;
const ALLOWED_ORIGIN_PATTERN = /^(?:chrome|moz)-extension:\/\/[a-z0-9-]+$/iu;
const PAIRING_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeSourceId(value) {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  const sourceId = normalized.startsWith("custom:")
    ? normalized
    : `custom:${normalized}`;
  return SOURCE_ID_PATTERN.test(sourceId) ? sourceId : null;
}

function normalizeLabel(value, fallback) {
  if (typeof value !== "string") {
    return fallback;
  }
  const normalized = value.replace(/\s+/gu, " ").trim();
  return normalized.length > 0 &&
    normalized.length <= 96 &&
    SAFE_TEXT_PATTERN.test(normalized)
    ? normalized
    : fallback;
}

function validateMetric(value) {
  if (!isRecord(value) || typeof value.unit !== "string") {
    return false;
  }
  const numericFields = [value.used, value.remaining, value.total].filter(
    (entry) => entry !== undefined && entry !== null,
  );
  return (
    numericFields.length > 0 &&
    numericFields.every(
      (entry) =>
        typeof entry === "number" && Number.isFinite(entry) && entry >= 0,
    )
  );
}

export function validateCustomSourcePayloadV1(value, expectedSourceId) {
  if (!isRecord(value)) {
    return { ok: false, message: "Source payload must be a JSON object." };
  }
  if (value.schema !== CUSTOM_SOURCE_SCHEMA_V1) {
    return { ok: false, message: "Source payload schema is invalid." };
  }
  const label = normalizeLabel(value.label, "");
  if (!label) {
    return { ok: false, message: "Source payload label is invalid." };
  }
  if (!["ok", "warning", "error"].includes(value.status)) {
    return { ok: false, message: "Source payload status is invalid." };
  }
  if (value.id !== undefined) {
    const payloadId = normalizeSourceId(value.id);
    if (!payloadId || payloadId !== expectedSourceId) {
      return { ok: false, message: "Source payload id does not match its mapping." };
    }
  }

  const arrays = [
    ["windows", 8, validateMetric],
    ["balances", 8, validateMetric],
    [
      "facts",
      16,
      (entry) =>
        isRecord(entry) &&
        normalizeLabel(entry.label, "").length > 0 &&
        (typeof entry.value === "string" || typeof entry.value === "number"),
    ],
  ];
  for (const [key, maxLength, validator] of arrays) {
    const entries = value[key];
    if (
      entries !== undefined &&
      (!Array.isArray(entries) ||
        entries.length > maxLength ||
        !entries.every(validator))
    ) {
      return { ok: false, message: `Source payload ${key} is invalid.` };
    }
  }
  if (value.quota !== undefined && !validateMetric(value.quota)) {
    return { ok: false, message: "Source payload quota is invalid." };
  }
  const hasContent =
    value.quota !== undefined ||
    (Array.isArray(value.windows) && value.windows.length > 0) ||
    (Array.isArray(value.balances) && value.balances.length > 0) ||
    (Array.isArray(value.facts) && value.facts.length > 0);
  return hasContent
    ? { ok: true, value }
    : { ok: false, message: "Source payload is empty." };
}

function createPairingCode(randomBytesImpl) {
  const bytes = randomBytesImpl(8);
  const characters = Array.from(bytes, (byte) =>
    PAIRING_ALPHABET.at(byte % PAIRING_ALPHABET.length),
  ).join("");
  return `${characters.slice(0, 4)}-${characters.slice(4)}`;
}

function createBearerToken(randomBytesImpl) {
  return randomBytesImpl(32).toString("base64url");
}

function secretEquals(left, right) {
  if (typeof left !== "string" || typeof right !== "string") {
    return false;
  }
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function normalizeSourceDefinitions(sources) {
  if (!Array.isArray(sources) || sources.length === 0) {
    throw new Error("At least one explicit source file is required.");
  }
  if (sources.length > LOCAL_COMPANION_BRIDGE_MAX_SOURCES) {
    throw new Error(
      `At most ${LOCAL_COMPANION_BRIDGE_MAX_SOURCES} source files are allowed.`,
    );
  }
  const seen = new Set();
  return sources.map((source) => {
    const sourceId = normalizeSourceId(source?.sourceId);
    if (!sourceId || seen.has(sourceId)) {
      throw new Error("Source ids must be unique custom:<id> values.");
    }
    if (typeof source.filePath !== "string" || source.filePath.length === 0) {
      throw new Error(`Source ${sourceId} requires one explicit file path.`);
    }
    seen.add(sourceId);
    return {
      sourceId,
      label: normalizeLabel(
        source.label,
        sourceId.slice("custom:".length),
      ),
      filePath: source.filePath,
    };
  });
}

function createFixedWindowRateLimiter(limit, now) {
  let windowStart = now();
  let count = 0;
  return {
    take() {
      const current = now();
      if (current - windowStart >= 60_000) {
        windowStart = current;
        count = 0;
      }
      count += 1;
      return count <= limit;
    },
  };
}

function sendJson(response, statusCode, payload, extraHeaders = {}) {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "X-Content-Type-Options": "nosniff",
    ...extraHeaders,
  });
  response.end(body);
}

function getAllowedOriginHeaders(request) {
  const origin = request.headers.origin;
  if (!origin) {
    return { ok: true, headers: {} };
  }
  return ALLOWED_ORIGIN_PATTERN.test(origin)
    ? {
        ok: true,
        headers: {
          "Access-Control-Allow-Origin": origin,
          Vary: "Origin",
        },
      }
    : { ok: false, headers: {} };
}

function readRequestBody(request, { maxBytes, timeoutMs }) {
  return new Promise((resolve, reject) => {
    let bytes = 0;
    const chunks = [];
    const timeout = setTimeout(() => {
      request.destroy();
      reject(new Error("request_timeout"));
    }, timeoutMs);

    request.on("data", (chunk) => {
      bytes += chunk.length;
      if (bytes > maxBytes) {
        clearTimeout(timeout);
        request.destroy();
        reject(new Error("request_too_large"));
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => {
      clearTimeout(timeout);
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    request.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

async function readValidatedSource(source) {
  const metadata = await stat(source.filePath);
  if (!metadata.isFile()) {
    return { ok: false, statusCode: 422, message: "Configured source is not a file." };
  }
  if (metadata.size > LOCAL_COMPANION_BRIDGE_MAX_SOURCE_BYTES) {
    return { ok: false, statusCode: 413, message: "Configured source file is too large." };
  }
  const text = await readFile(source.filePath, "utf8");
  if (Buffer.byteLength(text) > LOCAL_COMPANION_BRIDGE_MAX_SOURCE_BYTES) {
    return { ok: false, statusCode: 413, message: "Configured source file is too large." };
  }
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, statusCode: 422, message: "Configured source is not valid JSON." };
  }
  const validated = validateCustomSourcePayloadV1(parsed, source.sourceId);
  return validated.ok
    ? { ok: true, value: validated.value }
    : { ok: false, statusCode: 422, message: validated.message };
}

function extractBearerToken(request) {
  const header = request.headers.authorization;
  return typeof header === "string" && header.startsWith("Bearer ")
    ? header.slice("Bearer ".length)
    : null;
}

export function createLocalCompanionBridge(options) {
  const host = options.host ?? "127.0.0.1";
  if (host !== "127.0.0.1" && host !== "::1") {
    throw new Error("Local companion bridge host must be 127.0.0.1 or ::1.");
  }
  const port = options.port ?? 47_831;
  if (!Number.isInteger(port) || port < 0 || port > 65_535) {
    throw new Error("Local companion bridge port is invalid.");
  }
  const sources = normalizeSourceDefinitions(options.sources);
  const sourcesById = new Map(sources.map((source) => [source.sourceId, source]));
  const randomBytesImpl = options.randomBytesImpl ?? randomBytes;
  const now = options.now ?? Date.now;
  const requestTimeoutMs =
    options.requestTimeoutMs ?? LOCAL_COMPANION_BRIDGE_DEFAULT_REQUEST_TIMEOUT_MS;
  const requestLimiter = createFixedWindowRateLimiter(
    options.requestsPerMinute ??
      LOCAL_COMPANION_BRIDGE_DEFAULT_REQUESTS_PER_MINUTE,
    now,
  );
  const pairLimiter = createFixedWindowRateLimiter(
    options.pairAttemptsPerMinute ??
      LOCAL_COMPANION_BRIDGE_DEFAULT_PAIR_ATTEMPTS_PER_MINUTE,
    now,
  );

  let bearerToken = null;
  let pairingCode = createPairingCode(randomBytesImpl);
  let startedAddress = null;

  const rotatePairingCode = () => {
    pairingCode = createPairingCode(randomBytesImpl);
    options.onPairingCode?.(pairingCode);
  };

  const server = createServer(async (request, response) => {
    const origin = getAllowedOriginHeaders(request);
    if (!origin.ok) {
      sendJson(response, 403, { error: "origin_not_allowed" });
      return;
    }
    if (request.method === "OPTIONS") {
      sendJson(
        response,
        204,
        {},
        {
          ...origin.headers,
          "Access-Control-Allow-Headers": "Authorization, Content-Type",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Max-Age": "600",
        },
      );
      return;
    }

    const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
    if (
      request.method === "POST" &&
      requestUrl.pathname === "/v1/pair"
    ) {
      if (!pairLimiter.take()) {
        sendJson(response, 429, { error: "pair_rate_limited" }, origin.headers);
        return;
      }
      if (bearerToken || !pairingCode) {
        sendJson(response, 409, { error: "already_paired" }, origin.headers);
        return;
      }
      try {
        const body = await readRequestBody(request, {
          maxBytes: LOCAL_COMPANION_BRIDGE_MAX_BODY_BYTES,
          timeoutMs: requestTimeoutMs,
        });
        const parsed = JSON.parse(body);
        if (!secretEquals(parsed?.code, pairingCode)) {
          sendJson(response, 401, { error: "invalid_pairing_code" }, origin.headers);
          return;
        }
        bearerToken = createBearerToken(randomBytesImpl);
        pairingCode = null;
        sendJson(
          response,
          200,
          { schema: LOCAL_COMPANION_BRIDGE_SCHEMA_V1, token: bearerToken },
          origin.headers,
        );
      } catch (error) {
        const statusCode = error?.message === "request_too_large" ? 413 : 400;
        if (!response.headersSent) {
          sendJson(response, statusCode, { error: "invalid_pair_request" }, origin.headers);
        }
      }
      return;
    }

    if (!requestLimiter.take()) {
      sendJson(response, 429, { error: "request_rate_limited" }, origin.headers);
      return;
    }
    if (!bearerToken || !secretEquals(extractBearerToken(request), bearerToken)) {
      sendJson(response, 401, { error: "unauthorized" }, origin.headers);
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/v1/health") {
      sendJson(
        response,
        200,
        {
          schema: LOCAL_COMPANION_BRIDGE_SCHEMA_V1,
          status: "ok",
          bridgeVersion: "0.1.0-experimental",
          sourceCount: sources.length,
        },
        origin.headers,
      );
      return;
    }
    if (request.method === "GET" && requestUrl.pathname === "/v1/sources") {
      sendJson(
        response,
        200,
        {
          schema: LOCAL_COMPANION_BRIDGE_SCHEMA_V1,
          sources: sources.map(({ sourceId, label }) => ({ sourceId, label })),
        },
        origin.headers,
      );
      return;
    }
    if (
      request.method === "GET" &&
      requestUrl.pathname.startsWith("/v1/sources/")
    ) {
      const sourceId = decodeURIComponent(
        requestUrl.pathname.slice("/v1/sources/".length),
      );
      const source = sourcesById.get(sourceId);
      if (!source) {
        sendJson(response, 404, { error: "source_not_found" }, origin.headers);
        return;
      }
      try {
        const result = await readValidatedSource(source);
        sendJson(
          response,
          result.ok ? 200 : result.statusCode,
          result.ok ? result.value : { error: result.message },
          origin.headers,
        );
      } catch {
        sendJson(response, 503, { error: "source_unavailable" }, origin.headers);
      }
      return;
    }
    if (request.method === "POST" && requestUrl.pathname === "/v1/revoke") {
      bearerToken = null;
      rotatePairingCode();
      sendJson(
        response,
        200,
        { schema: LOCAL_COMPANION_BRIDGE_SCHEMA_V1, status: "revoked" },
        origin.headers,
      );
      return;
    }

    sendJson(response, 404, { error: "not_found" }, origin.headers);
  });
  server.requestTimeout = requestTimeoutMs;
  server.headersTimeout = requestTimeoutMs;

  return {
    getPairingCode: () => pairingCode,
    async start() {
      if (startedAddress) {
        return startedAddress;
      }
      await new Promise((resolve, reject) => {
        const onError = (error) => {
          server.off("listening", onListening);
          reject(error);
        };
        const onListening = () => {
          server.off("error", onError);
          resolve();
        };
        server.once("error", onError);
        server.once("listening", onListening);
        server.listen(port, host);
      });
      const address = server.address();
      if (!address || typeof address === "string") {
        throw new Error("Local companion bridge did not expose a TCP address.");
      }
      const hostname = host === "::1" ? "[::1]" : host;
      startedAddress = {
        baseUrl: `http://${hostname}:${address.port}`,
        pairingCode,
      };
      return startedAddress;
    },
    async stop() {
      if (!server.listening) {
        startedAddress = null;
        return;
      }
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
        server.closeAllConnections?.();
      });
      startedAddress = null;
    },
  };
}
