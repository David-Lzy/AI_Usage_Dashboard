import { describe, expect, it } from "vitest";

import type { WebStorageLike } from "./local-storage";
import {
  readApiGatewayModuleCollapsed,
  readApiGatewayTrendMetric,
  readApiGatewayTrendRangeDays,
  writeApiGatewayModuleCollapsed,
  writeApiGatewayTrendMetric,
  writeApiGatewayTrendRangeDays,
} from "./api-gateway-metering-ui-preferences";

function createMemoryStorage(): WebStorageLike {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
}

function createThrowingStorage(): WebStorageLike {
  return {
    getItem: () => {
      throw new Error("getItem failed");
    },
    removeItem: () => {
      throw new Error("removeItem failed");
    },
    setItem: () => {
      throw new Error("setItem failed");
    },
  };
}

const providerId = "sub2api-api-key" as const;
const accountId = "account_12345678";

describe("API gateway metering UI preferences", () => {
  it("persists collapse state independently by surface and module", () => {
    const storage = createMemoryStorage();

    expect(
      readApiGatewayModuleCollapsed(
        providerId,
        accountId,
        "popup",
        "summary",
        { storage },
      ),
    ).toBe(false);

    writeApiGatewayModuleCollapsed(
      providerId,
      accountId,
      "popup",
      "summary",
      true,
      { storage },
    );

    expect(
      readApiGatewayModuleCollapsed(
        providerId,
        accountId,
        "popup",
        "summary",
        { storage },
      ),
    ).toBe(true);
    expect(
      readApiGatewayModuleCollapsed(
        providerId,
        accountId,
        "sidebar",
        "summary",
        { storage },
      ),
    ).toBe(false);
    expect(
      readApiGatewayModuleCollapsed(
        providerId,
        accountId,
        "popup",
        "trend",
        { storage },
      ),
    ).toBe(false);
  });

  it("persists the selected range and metric with safe defaults", () => {
    const storage = createMemoryStorage();

    expect(
      readApiGatewayTrendRangeDays(providerId, accountId, "popup", { storage }),
    ).toBe(7);
    expect(
      readApiGatewayTrendMetric(providerId, accountId, "popup", { storage }),
    ).toBe("actual_spend");

    writeApiGatewayTrendRangeDays(providerId, accountId, "popup", 30, {
      storage,
    });
    writeApiGatewayTrendMetric(providerId, accountId, "popup", "tokens", {
      storage,
    });

    expect(
      readApiGatewayTrendRangeDays(providerId, accountId, "popup", { storage }),
    ).toBe(30);
    expect(
      readApiGatewayTrendMetric(providerId, accountId, "popup", { storage }),
    ).toBe("tokens");
  });

  it("silently falls back when local storage is unavailable", () => {
    const storage = createThrowingStorage();

    expect(
      readApiGatewayTrendRangeDays(providerId, accountId, "popup", { storage }),
    ).toBe(7);
    expect(
      readApiGatewayTrendMetric(providerId, accountId, "popup", { storage }),
    ).toBe("actual_spend");
    expect(() =>
      writeApiGatewayModuleCollapsed(
        providerId,
        accountId,
        "popup",
        "summary",
        true,
        { storage },
      ),
    ).not.toThrow();
  });
});
