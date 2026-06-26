import { describe, expect, it, vi } from "vitest";

import {
  getCustomSourceEndpointOriginPattern,
  hasCustomSourceHostAccess,
  requestCustomSourceHostAccess,
} from "./custom-source-host-access";

describe("custom source host access", () => {
  it("builds minimal http and https origin permission patterns", () => {
    expect(
      getCustomSourceEndpointOriginPattern(
        "http://localhost:4173/custom/quota.json",
      ),
    ).toEqual({
      ok: true,
      value: "http://localhost/*",
    });
    expect(
      getCustomSourceEndpointOriginPattern(
        "https://example.com/path/source.json",
      ),
    ).toEqual({
      ok: true,
      value: "https://example.com/*",
    });
  });

  it("rejects non-network endpoint schemes before permission requests", async () => {
    const permissionsApi = {
      request: vi.fn(async () => true),
      contains: vi.fn(async () => true),
    };

    expect(getCustomSourceEndpointOriginPattern("file:///tmp/source.json")).toMatchObject({
      ok: false,
    });
    await expect(
      requestCustomSourceHostAccess("file:///tmp/source.json", {
        permissionsApi,
      }),
    ).resolves.toBe(false);
    await expect(
      hasCustomSourceHostAccess("javascript:alert(1)", {
        permissionsApi,
      }),
    ).resolves.toBe(false);
    expect(permissionsApi.request).not.toHaveBeenCalled();
    expect(permissionsApi.contains).not.toHaveBeenCalled();
  });

  it("checks and requests custom source endpoint origin access", async () => {
    const permissionsApi = {
      contains: vi.fn(async () => true),
      request: vi.fn(async () => true),
    };

    await expect(
      hasCustomSourceHostAccess("https://example.com/source.json", {
        permissionsApi,
      }),
    ).resolves.toBe(true);
    await expect(
      requestCustomSourceHostAccess("http://localhost:4173/source.json", {
        permissionsApi,
      }),
    ).resolves.toBe(true);
    expect(permissionsApi.contains).toHaveBeenCalledWith({
      origins: ["https://example.com/*"],
    });
    expect(permissionsApi.request).toHaveBeenCalledWith({
      origins: ["http://localhost/*"],
    });
  });
});
