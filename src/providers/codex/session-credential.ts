export type CodexSessionCredential = {
  accessToken: string;
  accountId: string | null;
  expiresAt: number | null;
  source: "web_session" | "observed_request" | "manual_session";
};

export const CODEX_CREDENTIAL_EXPIRY_SKEW_MS = 60_000;

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

  if (!normalizedToken || /\s/.test(normalizedToken)) {
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
