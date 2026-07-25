import { describe, expect, it } from "vitest";

import type { AppState, ProviderId } from "../providers/types";
import { SAMPLE_APP_STATE } from "./constants";
import {
  DEFAULT_PROVIDER_ACCOUNT_ID,
  addInactiveProviderAccount,
  createOpaqueProviderAccountId,
  getProviderAccountOptions,
  normalizeProviderAccounts,
  selectActiveProviderAccount,
} from "./provider-accounts";

const TEST_PROVIDER_ID: ProviderId = "cursor-team-api";
const TEST_ACCOUNT_ID = "account_12345678";
const supportsTestProvider = (providerId: ProviderId) =>
  providerId === TEST_PROVIDER_ID;

function createTestState(): AppState {
  return structuredClone(SAMPLE_APP_STATE);
}

describe("provider accounts", () => {
  it("migrates every existing source entry to one deterministic default account", () => {
    const accounts = normalizeProviderAccounts(SAMPLE_APP_STATE.providers, undefined);

    for (const provider of SAMPLE_APP_STATE.providers) {
      expect(accounts[provider.providerId]).toMatchObject({
        activeAccountId: DEFAULT_PROVIDER_ACCOUNT_ID,
        accounts: [{ id: DEFAULT_PROVIDER_ACCOUNT_ID }],
        inactiveAccounts: {},
      });
    }
  });

  it("keeps providers without the descriptor capability single-account", () => {
    const source = SAMPLE_APP_STATE.providers.find(
      (provider) => provider.providerId === TEST_PROVIDER_ID,
    )!;
    const accounts = normalizeProviderAccounts(
      [source],
      {
        [TEST_PROVIDER_ID]: {
          activeAccountId: TEST_ACCOUNT_ID,
          accounts: [
            { id: TEST_ACCOUNT_ID, label: "Other", createdAt: null },
          ],
          inactiveAccounts: {},
        },
      },
      () => false,
    );

    expect(accounts[TEST_PROVIDER_ID]).toEqual({
      activeAccountId: DEFAULT_PROVIDER_ACCOUNT_ID,
      accounts: [
        expect.objectContaining({ id: DEFAULT_PROVIDER_ACCOUNT_ID }),
      ],
      inactiveAccounts: {},
    });
  });

  it("creates opaque local ids without embedding account labels", () => {
    expect(
      createOpaqueProviderAccountId(() => "12345678-1234-1234-1234-123456789abc"),
    ).toBe("account_12345678-1234-1234-1234-123456789abc");
  });

  it("switches the active projection without combining account quotas", () => {
    const initial = createTestState();
    const currentSnapshot = initial.providers.find(
      (provider) => provider.providerId === TEST_PROVIDER_ID,
    )!;
    const currentSetting = initial.providerSettings.find(
      (setting) => setting.id === TEST_PROVIDER_ID,
    )!;
    const inactiveSnapshot = {
      ...structuredClone(currentSnapshot),
      used: 73,
      remaining: 27,
      syncedAt: "2026-07-24T10:00:00.000Z",
    };
    const withInactiveAccount = addInactiveProviderAccount(
      initial,
      {
        providerId: TEST_PROVIDER_ID,
        accountId: TEST_ACCOUNT_ID,
        label: "Workspace 2",
        snapshot: inactiveSnapshot,
        setting: { ...structuredClone(currentSetting), displayEnabled: false },
      },
      supportsTestProvider,
    );
    const selected = selectActiveProviderAccount(
      withInactiveAccount,
      TEST_PROVIDER_ID,
      TEST_ACCOUNT_ID,
      supportsTestProvider,
    );

    expect(
      selected.providers.find(
        (provider) => provider.providerId === TEST_PROVIDER_ID,
      ),
    ).toMatchObject({ used: 73, remaining: 27 });
    expect(
      selected.providerSettings.find(
        (setting) => setting.id === TEST_PROVIDER_ID,
      )?.displayEnabled,
    ).toBe(false);
    expect(selected.providerAccounts?.[TEST_PROVIDER_ID]).toMatchObject({
      activeAccountId: TEST_ACCOUNT_ID,
      inactiveAccounts: {
        [DEFAULT_PROVIDER_ACCOUNT_ID]: {
          snapshot: {
            used: currentSnapshot.used,
            remaining: currentSnapshot.remaining,
          },
        },
      },
    });
    expect(selected.providers).toHaveLength(initial.providers.length);
  });

  it("exposes selector options only for capable providers with multiple accounts", () => {
    const initial = createTestState();
    const snapshot = initial.providers.find(
      (provider) => provider.providerId === TEST_PROVIDER_ID,
    )!;
    const setting = initial.providerSettings.find(
      (provider) => provider.id === TEST_PROVIDER_ID,
    )!;
    const state = addInactiveProviderAccount(
      initial,
      {
        providerId: TEST_PROVIDER_ID,
        accountId: TEST_ACCOUNT_ID,
        label: "Workspace 2",
        snapshot,
        setting,
      },
      supportsTestProvider,
    );

    expect(
      getProviderAccountOptions(state, TEST_PROVIDER_ID, supportsTestProvider),
    ).toMatchObject({
      activeAccountId: DEFAULT_PROVIDER_ACCOUNT_ID,
      accounts: [
        { id: DEFAULT_PROVIDER_ACCOUNT_ID },
        { id: TEST_ACCOUNT_ID, label: "Workspace 2" },
      ],
    });
    expect(
      getProviderAccountOptions(state, "codex-personal-page", supportsTestProvider),
    ).toBeNull();
  });

  it("rejects account data crossing a provider source-entry boundary", () => {
    const state = createTestState();
    const snapshot = state.providers.find(
      (provider) => provider.providerId === "codex-enterprise-api",
    )!;
    const setting = state.providerSettings.find(
      (provider) => provider.id === TEST_PROVIDER_ID,
    )!;

    expect(() =>
      addInactiveProviderAccount(
        state,
        {
          providerId: TEST_PROVIDER_ID,
          label: "Invalid",
          snapshot,
          setting,
        },
        supportsTestProvider,
      ),
    ).toThrow(/source-entry boundary/);
  });
});
