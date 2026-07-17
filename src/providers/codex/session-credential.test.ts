import { describe, expect, it } from "vitest";

import {
  buildCodexSessionCredential,
  isCodexSessionCredentialUsable,
  readCodexJwtExpiryMs,
} from "./session-credential";

function encodeBase64Url(value: string): string {
  return btoa(value).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function buildJwt(payload: Record<string, unknown>): string {
  return `${encodeBase64Url(JSON.stringify({ alg: "none" }))}.${encodeBase64Url(
    JSON.stringify(payload),
  )}.signature`;
}

describe("Codex session credential", () => {
  it("reads only the JWT expiry timestamp", () => {
    const token = buildJwt({ exp: 1_800_000_000, email: "not-returned@example.com" });

    expect(readCodexJwtExpiryMs(token)).toBe(1_800_000_000_000);
  });

  it("uses a sixty-second expiry skew", () => {
    const token = buildJwt({ exp: 2_000 });
    const credential = buildCodexSessionCredential({
      accessToken: token,
      source: "web_session",
    });

    expect(isCodexSessionCredentialUsable(credential, 1_939_000)).toBe(true);
    expect(isCodexSessionCredentialUsable(credential, 1_940_000)).toBe(false);
  });

  it("accepts opaque temporary tokens but rejects whitespace and empty values", () => {
    expect(
      buildCodexSessionCredential({
        accessToken: "opaque-session-token",
        source: "manual_session",
      }),
    ).toMatchObject({ expiresAt: null, source: "manual_session" });
    expect(
      buildCodexSessionCredential({
        accessToken: "Bearer token with spaces",
        source: "manual_session",
      }),
    ).toBeNull();
    expect(
      buildCodexSessionCredential({
        accessToken: " ",
        source: "manual_session",
      }),
    ).toBeNull();
  });
});
