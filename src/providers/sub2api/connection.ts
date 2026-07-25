import type { ApiGatewayConnectionMetadata } from "../types";
import { getCustomSourceEndpointOriginPattern } from "../../shared/custom-source-host-access";

export type Sub2ApiConnectionIssueCode =
  | "invalid_label"
  | "invalid_url"
  | "unsupported_scheme"
  | "origin_only"
  | "insecure_transport_confirmation_required";

export type Sub2ApiConnectionResult =
  | Readonly<{ ok: true; value: ApiGatewayConnectionMetadata }>
  | Readonly<{ ok: false; code: Sub2ApiConnectionIssueCode; message: string }>;

const UNSAFE_DISPLAY_TEXT_PATTERN = /[<>\u0000-\u001f\u007f]/;

function normalizeDisplayLabel(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim().replace(/\s+/g, " ").slice(0, 64);
  return normalized && !UNSAFE_DISPLAY_TEXT_PATTERN.test(normalized)
    ? normalized
    : null;
}

export function normalizeSub2ApiConnection(
  input: Readonly<{
    displayLabel: unknown;
    baseUrl: unknown;
    insecureTransportAcknowledged?: boolean;
  }>,
): Sub2ApiConnectionResult {
  const displayLabel = normalizeDisplayLabel(input.displayLabel);
  if (!displayLabel) {
    return {
      ok: false,
      code: "invalid_label",
      message: "A short deployment label without markup is required.",
    };
  }
  if (typeof input.baseUrl !== "string" || !input.baseUrl.trim()) {
    return {
      ok: false,
      code: "invalid_url",
      message: "A deployment URL is required.",
    };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(input.baseUrl.trim());
  } catch {
    return {
      ok: false,
      code: "invalid_url",
      message: "The deployment URL is invalid.",
    };
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return {
      ok: false,
      code: "unsupported_scheme",
      message: "Sub2API connections support http:// and https:// only.",
    };
  }
  if (
    parsedUrl.username ||
    parsedUrl.password ||
    parsedUrl.search ||
    parsedUrl.hash ||
    (parsedUrl.pathname !== "/" && parsedUrl.pathname !== "")
  ) {
    return {
      ok: false,
      code: "origin_only",
      message: "Use the deployment origin without credentials, a path, query, or fragment.",
    };
  }
  const insecureTransportAcknowledged =
    input.insecureTransportAcknowledged === true;
  if (parsedUrl.protocol === "http:" && !insecureTransportAcknowledged) {
    return {
      ok: false,
      code: "insecure_transport_confirmation_required",
      message: "HTTP sends the API key without transport encryption and requires confirmation.",
    };
  }

  return {
    ok: true,
    value: {
      schemaVersion: 1,
      displayLabel,
      baseUrl: parsedUrl.origin,
      insecureTransportAcknowledged,
    },
  };
}

export function normalizeStoredSub2ApiConnection(
  value: unknown,
): ApiGatewayConnectionMetadata | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const source = value as Record<string, unknown>;
  if (source.schemaVersion !== 1) {
    return null;
  }
  const result = normalizeSub2ApiConnection({
    displayLabel: source.displayLabel,
    baseUrl: source.baseUrl,
    insecureTransportAcknowledged:
      source.insecureTransportAcknowledged === true,
  });
  return result.ok ? result.value : null;
}

export function getSub2ApiUsageUrl(
  connection: ApiGatewayConnectionMetadata,
  options: Readonly<{ days: number; timezone: string }>,
): string {
  const url = new URL("/v1/usage", connection.baseUrl);
  url.searchParams.set("days", String(Math.min(31, Math.max(1, Math.floor(options.days)))));
  url.searchParams.set("timezone", options.timezone);
  return url.toString();
}

export function getSub2ApiHostOriginPattern(
  connection: ApiGatewayConnectionMetadata,
): string {
  const result = getCustomSourceEndpointOriginPattern(
    `${connection.baseUrl}/v1/usage`,
  );
  if (!result.ok) {
    throw new Error("Invalid Sub2API host origin");
  }
  return result.value;
}
