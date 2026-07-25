import { beforeEach, describe, expect, it, vi } from "vitest";

import walletFixture from "../../../fixtures/sub2api/api-key-wallet.fixture.json";
import { SAMPLE_APP_STATE, SAMPLE_PROVIDER_SECRETS } from "../../shared/constants";
import type {
  ProviderAccountMetadata,
  ProviderSetting,
  ProviderSnapshot,
} from "../types";

const fetchSub2ApiUsageMock = vi.hoisted(() => vi.fn());

vi.mock("./client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./client")>();
  return { ...actual, fetchSub2ApiUsage: fetchSub2ApiUsageMock };
});

import { syncSub2ApiProvider } from "./adapter";
import {
  parseSub2ApiUsageResponse,
  Sub2ApiClientError,
} from "./client";

const provider = SAMPLE_APP_STATE.providers.find(
  (candidate) => candidate.providerId === "sub2api-api-key",
) as ProviderSnapshot;
const setting = SAMPLE_APP_STATE.providerSettings.find(
  (candidate) => candidate.id === "sub2api-api-key",
) as ProviderSetting;
const accountMetadata: ProviderAccountMetadata = {
  id: "default",
  label: "ENL HZ",
  createdAt: null,
  lastSuccessAt: null,
  apiGatewayConnection: {
    schemaVersion: 1,
    displayLabel: "ENL HZ",
    baseUrl: "https://gateway.example.test",
    insecureTransportAcknowledged: false,
  },
};
const metering = parseSub2ApiUsageResponse(
  (walletFixture as { response: unknown }).response,
  {
    accountId: "default",
    connection: accountMetadata.apiGatewayConnection!,
    capturedAt: "2026-07-25T03:00:00.000Z",
  },
);

function buildContext(
  overrides: Partial<Parameters<typeof syncSub2ApiProvider>[0]> = {},
): Parameters<typeof syncSub2ApiProvider>[0] {
  return {
    provider,
    setting: {
      ...setting,
      status: "granted",
      credentialStatus: "configured",
      hostsLabel: "https://gateway.example.test",
      hostOrigins: ["https://gateway.example.test/*"],
    },
    secrets: {
      ...SAMPLE_PROVIDER_SECRETS,
      "sub2api-api-key": { apiKey: "local-api-key" },
    },
    accountId: "default",
    accountMetadata,
    now: new Date("2026-07-25T03:05:00.000Z"),
    trigger: "manual",
    ...overrides,
  };
}

describe("Sub2API provider adapter", () => {
  beforeEach(() => {
    fetchSub2ApiUsageMock.mockReset();
  });

  it("requires account-scoped deployment metadata before requesting usage", async () => {
    const outcome = await syncSub2ApiProvider(
      buildContext({ accountMetadata: null }),
    );

    expect(fetchSub2ApiUsageMock).not.toHaveBeenCalled();
    expect(outcome.snapshot).toMatchObject({
      syncStatus: "warning",
      lastSyncLabel: "Sub2API deployment not connected",
    });
  });

  it("requires host access and a local account API key", async () => {
    const hostOutcome = await syncSub2ApiProvider(
      buildContext({ setting: { ...setting, status: "missing" } }),
    );
    const keyOutcome = await syncSub2ApiProvider(
      buildContext({
        secrets: {
          ...SAMPLE_PROVIDER_SECRETS,
          "sub2api-api-key": { apiKey: null },
        },
      }),
    );

    expect(fetchSub2ApiUsageMock).not.toHaveBeenCalled();
    expect(hostOutcome.snapshot.lastSyncLabel).toBe(
      "Sub2API host access required",
    );
    expect(keyOutcome.snapshot.lastSyncLabel).toBe(
      "Sub2API API key required",
    );
  });

  it("stores key-scoped metering without inventing a quota window", async () => {
    fetchSub2ApiUsageMock.mockResolvedValue(metering);

    const outcome = await syncSub2ApiProvider(buildContext());

    expect(fetchSub2ApiUsageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: "default",
        apiKey: "local-api-key",
        connection: accountMetadata.apiGatewayConnection,
      }),
    );
    expect(outcome.snapshot).toMatchObject({
      providerLabel: "Sub2API",
      planName: "Wallet balance",
      used: null,
      remaining: null,
      total: null,
      syncStatus: "ok",
      apiGatewayMetering: { scope: "api_key", billingMode: "wallet" },
    });
    expect(outcome.setting).toMatchObject({
      status: "granted",
      credentialStatus: "configured",
    });
  });

  it("keeps HTTP usable while exposing a transport warning", async () => {
    fetchSub2ApiUsageMock.mockResolvedValue({
      ...metering,
      origin: "http://127.0.0.1:8080",
      transport: "http",
    });

    const outcome = await syncSub2ApiProvider(buildContext());

    expect(outcome.snapshot).toMatchObject({
      syncStatus: "warning",
      warningDiagnostic: {
        code: "adapter.unexpected_error",
        params: expect.objectContaining({ failureCode: "insecure_transport" }),
      },
    });
  });

  it("marks cached metering stale and requires credential repair after 401", async () => {
    fetchSub2ApiUsageMock.mockRejectedValue(
      new Sub2ApiClientError("credential_rejected", "rejected"),
    );

    const outcome = await syncSub2ApiProvider(
      buildContext({ provider: { ...provider, apiGatewayMetering: metering } }),
    );

    expect(outcome.snapshot).toMatchObject({
      syncStatus: "error",
      apiGatewayMetering: { stale: true, balance: metering.balance },
    });
    expect(outcome.setting?.credentialStatus).toBe("missing");
    expect(JSON.stringify(outcome)).not.toContain("local-api-key");
  });

  it("retains cached metering during rate limits", async () => {
    fetchSub2ApiUsageMock.mockRejectedValue(
      new Sub2ApiClientError("rate_limited", "limited", 120_000),
    );

    const outcome = await syncSub2ApiProvider(
      buildContext({ provider: { ...provider, apiGatewayMetering: metering } }),
    );

    expect(outcome.snapshot).toMatchObject({
      syncStatus: "error",
      apiGatewayMetering: { stale: true },
      warningReason: expect.stringContaining("rate-limited"),
    });
  });
});
