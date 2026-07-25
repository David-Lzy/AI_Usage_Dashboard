import { describe, expect, it, vi } from "vitest";

import {
  getProviderServiceStatusOriginPattern,
  hasProviderServiceStatusHostAccess,
  requestProviderServiceStatusHostAccess,
} from "./provider-service-status-host-access";

describe("provider service status host access", () => {
  it("uses the exact approved optional origins", () => {
    expect(getProviderServiceStatusOriginPattern("openai")).toBe(
      "https://status.openai.com/*",
    );
    expect(getProviderServiceStatusOriginPattern("anthropic")).toBe(
      "https://status.claude.com/*",
    );
    expect(getProviderServiceStatusOriginPattern("cursor")).toBe(
      "https://status.cursor.com/*",
    );
  });

  it("checks and requests only the selected vendor origin", async () => {
    const permissionsApi = {
      contains: vi.fn(async () => true),
      request: vi.fn(async () => true),
    };

    await expect(
      hasProviderServiceStatusHostAccess("openai", { permissionsApi }),
    ).resolves.toBe(true);
    await expect(
      requestProviderServiceStatusHostAccess("cursor", { permissionsApi }),
    ).resolves.toBe(true);
    expect(permissionsApi.contains).toHaveBeenCalledWith({
      origins: ["https://status.openai.com/*"],
    });
    expect(permissionsApi.request).toHaveBeenCalledWith({
      origins: ["https://status.cursor.com/*"],
    });
  });

  it("fails closed when the extension permissions API is unavailable", async () => {
    await expect(
      hasProviderServiceStatusHostAccess("anthropic", { permissionsApi: {} }),
    ).resolves.toBe(false);
    await expect(
      requestProviderServiceStatusHostAccess("anthropic", {
        permissionsApi: {},
      }),
    ).resolves.toBe(false);
  });
});
