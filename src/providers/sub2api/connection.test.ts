import { describe, expect, it } from "vitest";
import {
  getSub2ApiHostOriginPattern,
  getSub2ApiUsageUrl,
  isSub2ApiNonLoopbackHttpUrl,
  normalizeStoredSub2ApiConnection,
  normalizeSub2ApiConnection,
} from "./connection";

describe("Sub2API connection metadata", () => {
  it("normalizes an HTTPS deployment to its exact origin", () => {
    const result = normalizeSub2ApiConnection({
      displayLabel: "  ENL   HZ  ",
      baseUrl: "https://sub2api.example.com/",
    });

    expect(result).toEqual({
      ok: true,
      value: {
        schemaVersion: 1,
        displayLabel: "ENL HZ",
        baseUrl: "https://sub2api.example.com",
        insecureTransportAcknowledged: false,
      },
    });
  });

  it("allows loopback HTTP and requires confirmation for remote HTTP", () => {
    expect(
      normalizeSub2ApiConnection({
        displayLabel: "Local",
        baseUrl: "http://127.0.0.1:8080",
      }),
    ).toMatchObject({
      ok: true,
      value: { baseUrl: "http://127.0.0.1:8080" },
    });
    expect(
      normalizeSub2ApiConnection({
        displayLabel: "Remote",
        baseUrl: "http://gateway.example.test",
      }),
    ).toMatchObject({
      ok: false,
      code: "insecure_transport_confirmation_required",
    });
    expect(
      normalizeSub2ApiConnection({
        displayLabel: "Remote",
        baseUrl: "http://gateway.example.test",
        insecureTransportAcknowledged: true,
      }),
    ).toMatchObject({
      ok: true,
      value: { baseUrl: "http://gateway.example.test" },
    });
    expect(isSub2ApiNonLoopbackHttpUrl("http://localhost:8080")).toBe(false);
    expect(isSub2ApiNonLoopbackHttpUrl("http://example.test")).toBe(true);
  });

  it("rejects embedded credentials, paths, markup, and unsupported schemes", () => {
    const cases = [
      { displayLabel: "<b>Gateway</b>", baseUrl: "https://example.com" },
      { displayLabel: "Gateway", baseUrl: "https://user:pass@example.com" },
      { displayLabel: "Gateway", baseUrl: "https://example.com/admin" },
      { displayLabel: "Gateway", baseUrl: "ftp://example.com" },
    ];
    for (const input of cases) {
      expect(normalizeSub2ApiConnection(input).ok).toBe(false);
    }
  });

  it("rejects malformed persisted metadata", () => {
    expect(normalizeStoredSub2ApiConnection({ schemaVersion: 2 })).toBeNull();
    expect(
      normalizeStoredSub2ApiConnection({
        schemaVersion: 1,
        displayLabel: "Unsafe",
        baseUrl: "http://example.com",
        insecureTransportAcknowledged: false,
      }),
    ).toBeNull();
  });

  it("builds a bounded usage endpoint with timezone", () => {
    const url = getSub2ApiUsageUrl(
      {
        schemaVersion: 1,
        displayLabel: "Gateway",
        baseUrl: "https://example.com:8443",
        insecureTransportAcknowledged: false,
      },
      { days: 99, timezone: "Australia/Adelaide" },
    );
    expect(url).toBe(
      "https://example.com:8443/v1/usage?days=31&timezone=Australia%2FAdelaide",
    );
  });

  it("uses the browser's minimal host permission pattern", () => {
    expect(
      getSub2ApiHostOriginPattern({
        schemaVersion: 1,
        displayLabel: "Gateway",
        baseUrl: "https://example.com:8443",
        insecureTransportAcknowledged: false,
      }),
    ).toBe("https://example.com/*");
  });
});
