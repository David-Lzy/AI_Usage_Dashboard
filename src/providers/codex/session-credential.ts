export type CodexSessionCredential = {
  accessToken: string;
  accountId: string | null;
  expiresAt: number | null;
  source: "web_session" | "observed_request" | "manual_session";
};

export const CODEX_CREDENTIAL_EXPIRY_SKEW_MS = 60_000;

export type CodexManualTokenValidationCode =
  | "ok"
  | "empty"
  | "authorization_header"
  | "cookie"
  | "auth_json"
  | "refresh_token"
  | "invalid_whitespace";

export function validateCodexManualSessionToken(
  accessToken: string,
): CodexManualTokenValidationCode {
  const normalizedToken = accessToken.trim();

  if (!normalizedToken) {
    return "empty";
  }
  if (/^(?:authorization\s*:|bearer\s+)/i.test(normalizedToken)) {
    return "authorization_header";
  }
  if (
    /^[\[{]/.test(normalizedToken) ||
    /["'](?:access[_-]?token|account|user|session)["']\s*:/i.test(
      normalizedToken,
    )
  ) {
    return "auth_json";
  }
  if (
    /(?:^|;)\s*(?:__secure-|__host-|cf_clearance|session|cookie)[^=]*=/i.test(
      normalizedToken,
    ) ||
    (/;/.test(normalizedToken) && /=/.test(normalizedToken))
  ) {
    return "cookie";
  }
  if (/^(?:refresh[_-]?token|refresh\.)/i.test(normalizedToken)) {
    return "refresh_token";
  }
  if (/\s/.test(normalizedToken)) {
    return "invalid_whitespace";
  }

  return "ok";
}

function decodeBase64Url(value: string): string | null {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

  try {
    return atob(padded);
  } catch {
    return null;
  }
}

export function readCodexJwtExpiryMs(accessToken: string): number | null {
  const payload = accessToken.split(".")[1];

  if (!payload) {
    return null;
  }

  const decoded = decodeBase64Url(payload);

  if (!decoded) {
    return null;
  }

  try {
    const value = JSON.parse(decoded) as { exp?: unknown };
    const expirySeconds = value.exp;

    return typeof expirySeconds === "number" &&
      Number.isFinite(expirySeconds) &&
      expirySeconds > 0
      ? expirySeconds * 1_000
      : null;
  } catch {
    return null;
  }
}

export function buildCodexSessionCredential({
  accessToken,
  accountId = null,
  source,
}: {
  accessToken: string;
  accountId?: string | null;
  source: CodexSessionCredential["source"];
}): CodexSessionCredential | null {
  const normalizedToken = accessToken.trim();

  if (
    !normalizedToken ||
    (source === "manual_session" &&
      validateCodexManualSessionToken(normalizedToken) !== "ok") ||
    /\s/.test(normalizedToken)
  ) {
    return null;
  }

  return {
    accessToken: normalizedToken,
    accountId: accountId?.trim() || null,
    expiresAt: readCodexJwtExpiryMs(normalizedToken),
    source,
  };
}

export function isCodexSessionCredentialUsable(
  credential: CodexSessionCredential | null | undefined,
  nowMs = Date.now(),
  expirySkewMs = CODEX_CREDENTIAL_EXPIRY_SKEW_MS,
): credential is CodexSessionCredential {
  if (!credential?.accessToken) {
    return false;
  }

  return (
    credential.expiresAt === null ||
    credential.expiresAt > nowMs + Math.max(0, expirySkewMs)
  );
}
