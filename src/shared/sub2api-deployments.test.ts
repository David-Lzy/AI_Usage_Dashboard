import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "./constants";
import { DEFAULT_PROVIDER_ACCOUNT_ID } from "./provider-accounts";
import {
  disconnectSub2ApiDeployment,
  removeSub2ApiDeployment,
  saveSub2ApiDeployment,
  setSub2ApiMeteringDisplayPreferences,
} from "./sub2api-deployments";

const SECOND_ACCOUNT_ID = "account_12345678";

function connectDefault() {
  return saveSub2ApiDeployment(structuredClone(SAMPLE_APP_STATE), {
    accountId: DEFAULT_PROVIDER_ACCOUNT_ID,
    displayLabel: "Primary gateway",
    baseUrl: "https://primary.example.test",
    apiKey: "unused-by-state-helper",
    insecureTransportAcknowledged: false,
  });
}

describe("Sub2API deployment state", () => {
  it("updates the default account without storing the API key in AppState", () => {
    const result = connectDefault();
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(
      result.state.providerAccounts?.["sub2api-api-key"]?.accounts[0],
    ).toMatchObject({
      id: DEFAULT_PROVIDER_ACCOUNT_ID,
      label: "Primary gateway",
      apiGatewayConnection: {
        baseUrl: "https://primary.example.test",
      },
    });
    expect(JSON.stringify(result.state)).not.toContain("unused-by-state-helper");
  });

  it("creates and selects an isolated deployment with an opaque id", () => {
    const result = saveSub2ApiDeployment(structuredClone(SAMPLE_APP_STATE), {
      accountId: null,
      displayLabel: "Second gateway",
      baseUrl: "https://second.example.test",
      apiKey: "second-secret",
      insecureTransportAcknowledged: false,
    }, {
      createAccountId: () => SECOND_ACCOUNT_ID,
      now: () => "2026-07-25T12:00:00.000Z",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.accountId).toBe(SECOND_ACCOUNT_ID);
    const collection = result.state.providerAccounts?.["sub2api-api-key"];
    expect(collection?.activeAccountId).toBe(SECOND_ACCOUNT_ID);
    expect(collection?.accounts.map((account) => account.id)).toEqual([
      DEFAULT_PROVIDER_ACCOUNT_ID,
      SECOND_ACCOUNT_ID,
    ]);
    expect(
      collection?.accounts.find((account) => account.id === SECOND_ACCOUNT_ID),
    ).toMatchObject({
      label: "Second gateway",
      createdAt: "2026-07-25T12:00:00.000Z",
    });
    expect(JSON.stringify(result.state)).not.toContain("second-secret");
  });

  it("keeps module order and visibility account-local", () => {
    const connected = connectDefault();
    expect(connected.ok).toBe(true);
    if (!connected.ok) return;
    const preferences = {
      popup: [
        { id: "trend" as const, visible: true },
        { id: "summary" as const, visible: false },
        { id: "model_breakdown" as const, visible: true },
        { id: "limit_windows" as const, visible: true },
      ],
      sidebar: [
        { id: "summary" as const, visible: true },
        { id: "trend" as const, visible: true },
        { id: "model_breakdown" as const, visible: true },
        { id: "limit_windows" as const, visible: true },
      ],
      fullPage: [
        { id: "summary" as const, visible: true },
        { id: "trend" as const, visible: true },
        { id: "model_breakdown" as const, visible: true },
        { id: "limit_windows" as const, visible: true },
      ],
    };
    const updated = setSub2ApiMeteringDisplayPreferences(
      connected.state,
      DEFAULT_PROVIDER_ACCOUNT_ID,
      preferences,
    );

    expect(
      updated.providerAccounts?.["sub2api-api-key"]?.accounts[0]
        .apiGatewayMeteringDisplayPreferences?.popup,
    ).toEqual(preferences.popup);
  });

  it("disconnects with an explicit cached-data choice and removes non-default accounts", () => {
    const created = saveSub2ApiDeployment(structuredClone(SAMPLE_APP_STATE), {
      accountId: null,
      displayLabel: "Second gateway",
      baseUrl: "https://second.example.test",
      apiKey: "secret",
      insecureTransportAcknowledged: false,
    }, { createAccountId: () => SECOND_ACCOUNT_ID });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const disconnected = disconnectSub2ApiDeployment(
      created.state,
      SECOND_ACCOUNT_ID,
      false,
    );
    expect(
      disconnected.providerAccounts?.["sub2api-api-key"]?.accounts.find(
        (account) => account.id === SECOND_ACCOUNT_ID,
      ),
    ).not.toHaveProperty("apiGatewayConnection");

    const removed = removeSub2ApiDeployment(disconnected, SECOND_ACCOUNT_ID);
    expect(removed.providerAccounts?.["sub2api-api-key"]).toMatchObject({
      activeAccountId: DEFAULT_PROVIDER_ACCOUNT_ID,
      accounts: [{ id: DEFAULT_PROVIDER_ACCOUNT_ID }],
    });
  });
});
