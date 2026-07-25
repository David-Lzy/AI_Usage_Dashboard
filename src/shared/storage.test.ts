import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AppState } from "../providers/types";
import { buildActionBadgeQuotaCandidates } from "./action-badge-preferences";
import { SAMPLE_APP_STATE } from "./constants";
import {
  clearAppState,
  readAppState,
  seedAppStateIfEmpty,
  updateAppState,
  writeAppState,
} from "./storage";

function createLegacyState(): AppState {
  const {
    locale: _locale,
    userLevel: _userLevel,
    themeMode: _themeMode,
    themePreset: _themePreset,
    themeCustomSeedHex: _themeCustomSeedHex,
    uiFontFamily: _uiFontFamily,
    popupProgressStyle: _popupProgressStyle,
    sidebarProgressStyle: _sidebarProgressStyle,
    fullPageProgressStyle: _fullPageProgressStyle,
    popupSizePreset: _popupSizePreset,
    popupCornerStyle: _popupCornerStyle,
    popupShadowStyle: _popupShadowStyle,
    popupCircularProgressItemsPerRow: _popupCircularProgressItemsPerRow,
    actionBadgeSelectionMode: _actionBadgeSelectionMode,
    actionBadgeSelection: _actionBadgeSelection,
    actionBadgeSelections: _actionBadgeSelections,
    actionBadgeRotationIntervalSeconds: _actionBadgeRotationIntervalSeconds,
    toolbarIconMode: _toolbarIconMode,
    toolbarIconProviderId: _toolbarIconProviderId,
    toolbarIconCustomImageDataUrl: _toolbarIconCustomImageDataUrl,
    providerOrderBySurface: _providerOrderBySurface,
    progressItemsBySurface: _progressItemsBySurface,
    usageHistoryModulesBySurface: _usageHistoryModulesBySurface,
    progressThicknessPx: _progressThicknessPx,
    progressColorBands: _progressColorBands,
    progressColorAppearance: _progressColorAppearance,
    ...legacySettings
  } = SAMPLE_APP_STATE.settings;

  return {
    ...SAMPLE_APP_STATE,
    settings: legacySettings as AppState["settings"],
    providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) => {
      const {
        hostOrigins: _hostOrigins,
        credentialStatus: _credentialStatus,
        sourcePreference: _sourcePreference,
        pageBinding: _pageBinding,
        ...legacyProvider
      } = provider;
      return legacyProvider as AppState["providerSettings"][number];
    }),
  };
}

function createStaleSchemaState(): AppState {
  return {
    ...SAMPLE_APP_STATE,
    providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) => {
      if (provider.id === "cursor-personal-page") {
        return {
          ...provider,
          hostsLabel: "api.cursor.com",
          hostOrigins: ["https://api.cursor.com/*"],
          description: "Needed for Cursor Team Admin API requests.",
        };
      }

      if (provider.id === "codex-personal-page") {
        return {
          ...provider,
          hostsLabel: "api.chatgpt.com",
          hostOrigins: ["https://api.chatgpt.com/*"],
          description:
            "Targets the Codex Enterprise analytics API with a workspace-scoped analytics key and workspace ID.",
        };
      }

      return provider;
    }),
  };
}

function createLegacyBrandLevelState(): AppState {
  const toLegacyProviderSetting = (
    provider: AppState["providerSettings"][number],
  ) => {
    const {
      brandId: _brandId,
      displayEnabled: _displayEnabled,
      sourceKind: _sourceKind,
      connectionMode: _connectionMode,
      ...legacyProvider
    } = provider;
    return legacyProvider;
  };

  return {
    ...SAMPLE_APP_STATE,
    providers: [
      {
        ...SAMPLE_APP_STATE.providers.find(
          (provider) => provider.providerId === "cursor-personal-page",
        )!,
        providerId: "cursor",
        providerLabel: "Cursor",
      },
      {
        ...SAMPLE_APP_STATE.providers.find(
          (provider) => provider.providerId === "claude-code-team-page",
        )!,
        providerId: "claude-code",
        providerLabel: "Claude Code",
      },
      {
        ...SAMPLE_APP_STATE.providers.find(
          (provider) => provider.providerId === "codex-personal-page",
        )!,
        providerId: "codex",
        providerLabel: "Codex",
      },
    ] as unknown as AppState["providers"],
    providerSettings: [
      {
        ...toLegacyProviderSetting(
          SAMPLE_APP_STATE.providerSettings.find(
            (provider) => provider.id === "cursor-personal-page",
          )!,
        ),
        id: "cursor",
        label: "Cursor",
        enabled: true,
        sourcePreference: "official_api",
      },
      {
        ...toLegacyProviderSetting(
          SAMPLE_APP_STATE.providerSettings.find(
            (provider) => provider.id === "claude-code-team-page",
          )!,
        ),
        id: "claude-code",
        label: "Claude Code",
        enabled: true,
      },
      {
        ...toLegacyProviderSetting(
          SAMPLE_APP_STATE.providerSettings.find(
            (provider) => provider.id === "codex-personal-page",
          )!,
        ),
        id: "codex",
        label: "Codex",
        enabled: false,
      },
    ] as unknown as AppState["providerSettings"],
    settings: {
      ...SAMPLE_APP_STATE.settings,
      providerOrderBySurface: {
        popup: ["codex", "claude-code", "cursor"],
        sidebar: ["cursor"],
        fullPage: ["unknown-provider", "codex"],
      },
    } as unknown as AppState["settings"],
  };
}

function createThrowingStorage(): Storage {
  return {
    get length() {
      return 0;
    },
    clear() {},
    getItem() {
      throw new Error("getItem failed");
    },
    key() {
      return null;
    },
    removeItem() {
      throw new Error("removeItem failed");
    },
    setItem() {
      throw new Error("setItem failed");
    },
  };
}

describe("storage normalization", () => {
  beforeEach(async () => {
    vi.unstubAllGlobals();
    await clearAppState();
    await writeAppState(SAMPLE_APP_STATE);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("seeds first-run state without sample provider usage values", async () => {
    await clearAppState();

    const state = await seedAppStateIfEmpty();
    const codexProvider = state.providers.find(
      (provider) => provider.providerId === "codex-personal-page",
    );
    const codexSetting = state.providerSettings.find(
      (provider) => provider.id === "codex-personal-page",
    );

    expect(codexProvider?.used).toBeNull();
    expect(codexProvider?.remaining).toBeNull();
    expect(codexProvider?.total).toBeNull();
    expect(codexProvider?.usageWindows).toEqual([]);
    expect(codexProvider?.lastSyncLabel).toBe("Not synced yet");
    expect(codexProvider?.warningDiagnostic?.category).toBe("page_session");
    expect(codexSetting?.status).toBe("missing");
    expect(state.settings.popupCircularProgressItemsPerRow).toBe(2);
  });

  it("fills missing provider setting fields from the sample schema", async () => {
    await writeAppState(createLegacyState());

    const state = await readAppState();

    expect(state).not.toBeNull();
    expect(
      state?.providerSettings.find((provider) => provider.id === "cursor-personal-page")
        ?.credentialStatus,
    ).toBe("not_required");
    expect(
      state?.providerSettings.find((provider) => provider.id === "claude-code-team-page")
        ?.credentialStatus,
    ).toBe("not_required");
    expect(
      state?.providerSettings.find((provider) => provider.id === "codex-personal-page")
        ?.credentialStatus,
    ).toBe("not_required");
    expect(
      state?.providerSettings.find((provider) => provider.id === "jetbrains-org-page")
        ?.hostOrigins,
    ).toEqual(["https://account.jetbrains.com/*", "https://*.jetbrains.com/*"]);
    expect(
      state?.providerSettings.find((provider) => provider.id === "gemini-policy")
        ?.hostOrigins,
    ).toEqual([]);
    expect(
      state?.providerSettings.find((provider) => provider.id === "gemini-policy")
        ?.credentialStatus,
    ).toBe("not_required");
    expect(
      state?.providerSettings.find((provider) => provider.id === "cursor-personal-page")
        ?.sourcePreference,
    ).toBe("session_page");
    expect(
      state?.providerSettings.find((provider) => provider.id === "cursor-personal-page")
        ?.pageBinding,
    ).toEqual({
      mode: "auto",
      status: "unbound",
      tabId: null,
      matchedUrl: null,
      matchedTitle: null,
      updatedAt: null,
    });
    expect(state?.settings.locale).toBe("system");
    expect(state?.settings.userLevel).toBe("basic");
    expect(state?.settings.themeMode).toBe("system");
    expect(state?.settings.themePreset).toBe("default");
    expect(state?.settings.themeCustomSeedHex).toBeNull();
    expect(state?.settings.uiFontFamily).toBe("default");
    expect(state?.settings.motionMode).toBe("full");
    expect(state?.settings.popupProgressStyle).toBe("circle-soft");
    expect(state?.settings.sidebarProgressStyle).toBe("line");
    expect(state?.settings.fullPageProgressStyle).toBe("line");
    expect(state?.settings.popupSizePreset).toBe("balanced");
    expect(state?.settings.popupCornerStyle).toBe("rounded");
    expect(state?.settings.popupShadowStyle).toBe("soft");
    expect(state?.settings.popupCircularProgressItemsPerRow).toBe(2);
    expect(state?.settings.actionBadgeSelectionMode).toBe("auto");
    expect(state?.settings.actionBadgeSelection).toBe("attention");
    expect(state?.settings.actionBadgeSelections).toEqual(["attention"]);
    expect(state?.settings.actionBadgeRotationIntervalSeconds).toBe(60);
    expect(state?.settings.toolbarIconMode).toBe("match-badge");
    expect(state?.settings.toolbarIconProviderId).toBeNull();
    expect(state?.settings.toolbarIconCustomImageDataUrl).toBeNull();
    expect(state?.settings.providerOrderBySurface).toEqual({
      popup: [],
      sidebar: [],
      fullPage: [],
    });
    expect(state?.settings.progressItemsBySurface).toEqual({
      popup: {},
      sidebar: {},
      fullPage: {},
    });
    expect(state?.settings.usageHistoryModulesBySurface).toEqual({
      popup: {},
      sidebar: {},
      fullPage: {},
    });
    expect(state?.settings.progressThicknessPx).toBe(10);
    expect(state?.settings.progressColorBands).toEqual([
      {
        id: "low",
        minimumPercent: 0,
        maximumPercent: 20,
        colorHex: "#B3261E",
      },
      {
        id: "medium",
        minimumPercent: 21,
        maximumPercent: 49,
        colorHex: "#8A4B00",
      },
      {
        id: "high",
        minimumPercent: 50,
        maximumPercent: 100,
        colorHex: "#146C2E",
      },
    ]);
    expect(state?.settings.progressColorAppearance).toEqual({
      mode: "traditional",
      bands: SAMPLE_APP_STATE.settings.progressColorBands,
    });
  });

  it("migrates the stale Claude Team label without changing stored personal-source settings", async () => {
    const oldState: AppState = {
      ...SAMPLE_APP_STATE,
      providers: SAMPLE_APP_STATE.providers.map((provider) =>
        provider.providerId === "claude-code-team-page"
          ? {
              ...provider,
              providerLabel: "Claude Team",
              planName: "Claude Team usage page",
            }
          : provider,
      ),
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((setting) =>
        setting.id === "claude-code-team-page"
          ? {
              ...setting,
              displayEnabled: false,
              pageBinding: {
                mode: "bound",
                status: "bound",
                tabId: 321,
                matchedUrl: "https://claude.ai/settings/usage",
                matchedTitle: "Claude",
                updatedAt: "2026-07-20T00:00:00.000Z",
              },
            }
          : setting,
      ),
      settings: {
        ...SAMPLE_APP_STATE.settings,
        providerOrderBySurface: {
          ...SAMPLE_APP_STATE.settings.providerOrderBySurface,
          popup: [
            "claude-code-team-page",
            ...SAMPLE_APP_STATE.settings.providerOrderBySurface.popup.filter(
              (providerId) => providerId !== "claude-code-team-page",
            ),
          ],
        },
      },
    };

    await writeAppState(oldState);
    const state = await readAppState();
    const provider = state?.providers.find(
      (entry) => entry.providerId === "claude-code-team-page",
    );
    const setting = state?.providerSettings.find(
      (entry) => entry.id === "claude-code-team-page",
    );

    expect(provider).toMatchObject({
      providerId: "claude-code-team-page",
      providerLabel: "Claude Personal",
    });
    expect(setting).toMatchObject({
      id: "claude-code-team-page",
      displayEnabled: false,
      pageBinding: {
        mode: "bound",
        status: "bound",
        tabId: 321,
      },
    });
    expect(state?.settings.providerOrderBySurface.popup[0]).toBe(
      "claude-code-team-page",
    );
  });

  it("preserves valid Cursor usage summaries and removes malformed ones", async () => {
    const cursorProvider = SAMPLE_APP_STATE.providers.find(
      (provider) => provider.providerId === "cursor-personal-page",
    )!;
    const validCursorUsage = {
      capturedAt: "2026-07-15T00:00:00.000Z",
      billingCapturedAt: "2026-07-15T00:00:00.000Z",
      historyCapturedAt: null,
      billingCycleStart: "2026-07-01T00:00:00.000Z",
      billingCycleEnd: "2026-08-01T00:00:00.000Z",
      membershipType: "pro",
      limitType: "plan",
      isUnlimited: false,
      currency: "USD" as const,
      planName: "Pro",
      planIncludedAmountCents: 10000,
      planPriceLabel: "$20",
      planOwner: "individual",
      plan: {
        enabled: true,
        usedCents: 4200,
        limitCents: 10000,
        remainingCents: 5800,
        includedUsageCents: 4000,
        bonusUsageCents: 200,
        totalUsageCents: 4200,
        autoPercentUsed: 18,
        apiPercentUsed: 24,
        totalPercentUsed: 42,
      },
      onDemand: null,
      noUsageBasedAllowed: false,
      history: null,
    };

    await writeAppState({
      ...SAMPLE_APP_STATE,
      providers: SAMPLE_APP_STATE.providers.map((provider) =>
        provider.providerId === cursorProvider.providerId
          ? { ...provider, cursorUsage: validCursorUsage }
          : provider,
      ),
    });

    expect(
      (await readAppState())?.providers.find(
        (provider) => provider.providerId === cursorProvider.providerId,
      )?.cursorUsage,
    ).toEqual(validCursorUsage);

    await writeAppState({
      ...SAMPLE_APP_STATE,
      providers: SAMPLE_APP_STATE.providers.map((provider) =>
        provider.providerId === cursorProvider.providerId
          ? {
              ...provider,
              cursorUsage: {
                ...validCursorUsage,
                currency: "EUR",
              },
            }
          : provider,
      ) as AppState["providers"],
    });

    expect(
      (await readAppState())?.providers.find(
        (provider) => provider.providerId === cursorProvider.providerId,
      )?.cursorUsage,
    ).toBeUndefined();
  });

  it("normalizes unsupported UI font preferences to the default", async () => {
    await writeAppState({
      ...SAMPLE_APP_STATE,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        uiFontFamily: "not-a-font",
      } as unknown as AppState["settings"],
    });

    const state = await readAppState();

    expect(state?.settings.uiFontFamily).toBe("default");
  });

  it("normalizes and preserves the reset time display preference", async () => {
    await writeAppState({
      ...SAMPLE_APP_STATE,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        resetTimeDisplayMode: "date_and_weekday",
      },
    });

    expect((await readAppState())?.settings.resetTimeDisplayMode).toBe(
      "date_and_weekday",
    );

    await writeAppState({
      ...SAMPLE_APP_STATE,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        resetTimeDisplayMode: "timestamp",
      } as unknown as AppState["settings"],
    });

    expect((await readAppState())?.settings.resetTimeDisplayMode).toBe("date");
  });

  it("preserves stored provider source preferences across normalized writes", async () => {
    await writeAppState({
      ...SAMPLE_APP_STATE,
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) =>
        provider.id === "cursor-personal-page"
          ? {
              ...provider,
              sourcePreference: "session_page",
            }
          : provider.id === "cursor-team-api"
            ? {
                ...provider,
                sourcePreference: "official_api",
              }
            : provider,
      ),
    });

    const writtenState = await readAppState();

    expect(
      writtenState?.providerSettings.find(
        (provider) => provider.id === "cursor-personal-page",
      )?.sourcePreference,
    ).toBe("session_page");
    expect(
      writtenState?.providerSettings.find(
        (provider) => provider.id === "cursor-team-api",
      )?.sourcePreference,
    ).toBe("official_api");

    const updatedState = await updateAppState((current) => ({
      ...current,
      settings: {
        ...current.settings,
        warningThresholdPercent: 81,
      },
    }));

    expect(
      updatedState.providerSettings.find(
        (provider) => provider.id === "cursor-personal-page",
      )?.sourcePreference,
    ).toBe("session_page");
    expect(
      updatedState.providerSettings.find(
        (provider) => provider.id === "cursor-team-api",
      )?.sourcePreference,
    ).toBe("official_api");
  });

  it("normalizes display preferences from stale stored state", async () => {
    await writeAppState({
      ...SAMPLE_APP_STATE,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        providerOrderBySurface: {
          popup: ["codex-personal-page", "unknown-provider", "cursor-personal-page", "codex-personal-page"],
          sidebar: "codex-personal-page",
          fullPage: ["gemini-policy"],
        },
        progressItemsBySurface: {
          popup: {
            "codex-personal-page": [
              { id: "unknown-window", visible: false },
              { id: 42, visible: true },
            ],
            "unknown-provider": [{ id: "primary", visible: true }],
          },
        },
      } as unknown as AppState["settings"],
    });

    const state = await readAppState();

    expect(state?.settings.providerOrderBySurface.popup).toEqual([
      "codex-personal-page",
      "cursor-personal-page",
      "cursor-team-api",
      "jetbrains-org-page",
      "claude-code-team-page",
      "claude-code-admin-api",
      "gemini-policy",
      "codex-enterprise-api",
    ]);
    expect(state?.settings.providerOrderBySurface.sidebar).toEqual([]);
    expect(state?.settings.providerOrderBySurface.fullPage).toEqual([
      "gemini-policy",
      "cursor-personal-page",
      "cursor-team-api",
      "jetbrains-org-page",
      "claude-code-team-page",
      "claude-code-admin-api",
      "codex-personal-page",
      "codex-enterprise-api",
    ]);
    expect(state?.settings.progressItemsBySurface).toEqual({
      popup: {},
      sidebar: {},
      fullPage: {},
    });
  });

  it("normalizes custom source configs, snapshots, order, and progress visibility", async () => {
    await writeAppState({
      ...SAMPLE_APP_STATE,
      customSources: [
        {
          id: "custom:Build_Quota",
          label: "Build Quota",
          description: "Internal build minutes",
          endpointUrl: "http://localhost:4173/quota.json",
          displayEnabled: true,
          refreshIntervalMinutes: 30,
          createdAt: "2026-06-26T00:00:00.000Z",
          updatedAt: "2026-06-26T01:00:00.000Z",
        },
        {
          id: "custom:bad",
          label: "Bad",
          description: null,
          endpointUrl: "file:///tmp/source.json",
          displayEnabled: true,
          refreshIntervalMinutes: 30,
          createdAt: "2026-06-26T00:00:00.000Z",
          updatedAt: "2026-06-26T01:00:00.000Z",
        },
      ],
      customSourceStates: [
        {
          sourceId: "custom:build_quota",
          status: "ok",
          snapshot: null,
          lastAttemptAt: "2026-06-26T02:00:00.000Z",
          lastSuccessAt: "2026-06-26T02:00:00.000Z",
          lastFailureAt: null,
          lastFailureReason: null,
          stale: false,
        },
        {
          sourceId: "custom:orphan",
          status: "ok",
          snapshot: null,
          lastAttemptAt: "2026-06-26T02:00:00.000Z",
          lastSuccessAt: "2026-06-26T02:00:00.000Z",
          lastFailureAt: null,
          lastFailureReason: null,
          stale: false,
        },
      ],
      settings: {
        ...SAMPLE_APP_STATE.settings,
        providerOrderBySurface: {
          popup: ["custom:Build_Quota", "codex-personal-page"],
          sidebar: [],
          fullPage: [],
        },
        progressItemsBySurface: {
          popup: {
            "custom:Build_Quota": [{ id: "primary", visible: false }],
          },
          sidebar: {},
          fullPage: {},
        },
      } as unknown as AppState["settings"],
    } as unknown as AppState);

    const state = await readAppState();

    expect(state?.customSources).toEqual([
      {
        id: "custom:build_quota",
        label: "Build Quota",
        description: "Internal build minutes",
        endpointUrl: "http://localhost:4173/quota.json",
        displayEnabled: true,
        refreshIntervalMinutes: 30,
        createdAt: "2026-06-26T00:00:00.000Z",
        updatedAt: "2026-06-26T01:00:00.000Z",
      },
    ]);
    expect(state?.customSourceStates).toEqual([
      {
        sourceId: "custom:build_quota",
        status: "ok",
        snapshot: null,
        lastAttemptAt: "2026-06-26T02:00:00.000Z",
        lastSuccessAt: "2026-06-26T02:00:00.000Z",
        lastFailureAt: null,
        lastFailureReason: null,
        stale: false,
      },
    ]);
    expect(state?.settings.providerOrderBySurface.popup.slice(0, 2)).toEqual([
      "custom:build_quota",
      "codex-personal-page",
    ]);
    expect(
      state?.settings.progressItemsBySurface.popup["custom:build_quota"],
    ).toEqual([{ id: "primary", visible: false }]);
  });

  it("migrates legacy brand-level providers without keeping stale extra entries", async () => {
    await writeAppState(createLegacyBrandLevelState());

    const state = await readAppState();

    expect(state).not.toBeNull();
    expect(state?.providers.map((provider) => provider.providerId)).toEqual(
      SAMPLE_APP_STATE.providers.map((provider) => provider.providerId),
    );
    expect(state?.providerSettings.map((provider) => provider.id)).toEqual(
      SAMPLE_APP_STATE.providerSettings.map((provider) => provider.id),
    );
    expect(
      state?.providerSettings.find(
        (provider) => provider.id === "cursor-personal-page",
      )?.displayEnabled,
    ).toBe(true);
    expect(
      state?.providerSettings.find(
        (provider) => provider.id === "cursor-team-api",
      )?.displayEnabled,
    ).toBe(true);
    expect(
      state?.providerSettings.find(
        (provider) => provider.id === "codex-personal-page",
      )?.displayEnabled,
    ).toBe(false);
    expect(state?.settings.providerOrderBySurface.popup.slice(0, 3)).toEqual([
      "codex-personal-page",
      "claude-code-team-page",
      "cursor-personal-page",
    ]);
  });

  it("keeps known progress item preferences and appends newly discovered items", async () => {
    await writeAppState({
      ...SAMPLE_APP_STATE,
      providers: SAMPLE_APP_STATE.providers.map((provider) =>
        provider.providerId === "cursor-team-api"
          ? {
              ...provider,
              quotaUnit: "credits" as const,
              quotaWindow: "monthly" as const,
              used: 16,
              remaining: 4,
              total: 20,
            }
          : provider,
      ),
      settings: {
        ...SAMPLE_APP_STATE.settings,
        progressItemsBySurface: {
          popup: {
            "cursor-team-api": [
              { id: "primary", visible: false },
              { id: "unknown", visible: true },
            ],
          },
          sidebar: {},
          fullPage: {},
        },
      } as unknown as AppState["settings"],
    });

    const state = await readAppState();

    expect(state?.settings.progressItemsBySurface.popup["cursor-team-api"]).toEqual([
      { id: "primary", visible: false },
    ]);
  });

  it("normalizes invalid popup appearance preferences", async () => {
    await writeAppState({
      ...SAMPLE_APP_STATE,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        popupSizePreset: "maximized",
        popupCornerStyle: "pill",
        popupShadowStyle: "heavy",
        popupCircularProgressItemsPerRow: 9,
      } as unknown as AppState["settings"],
    });

    const state = await readAppState();

    expect(state?.settings.popupSizePreset).toBe("balanced");
    expect(state?.settings.popupCornerStyle).toBe("rounded");
    expect(state?.settings.popupShadowStyle).toBe("soft");
    expect(state?.settings.popupCircularProgressItemsPerRow).toBe(2);
  });

  it("normalizes invalid action badge preferences", async () => {
    await writeAppState({
      ...SAMPLE_APP_STATE,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        actionBadgeSelection: "codex-weekly",
      } as unknown as AppState["settings"],
    });

    const state = await readAppState();

    expect(state?.settings.actionBadgeSelection).toBe("attention");
    expect(state?.settings.actionBadgeSelections).toEqual(["attention"]);
    expect(state?.settings.actionBadgeRotationIntervalSeconds).toBe(60);
  });

  it("normalizes action badge multi-selection preferences", async () => {
    const stateWithCodexRemaining: AppState = {
      ...SAMPLE_APP_STATE,
      providers: SAMPLE_APP_STATE.providers.map((provider) =>
        provider.providerId === "codex-personal-page"
          ? {
              ...provider,
              remaining: 51,
              quotaUnit: "percent",
            }
          : provider,
      ),
    };
    const codexCandidate = buildActionBadgeQuotaCandidates(
      stateWithCodexRemaining,
    ).find(
      (candidate) => candidate.providerId === "codex-personal-page",
    );

    expect(codexCandidate).toBeDefined();

    await writeAppState({
      ...stateWithCodexRemaining,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        actionBadgeSelections: [
          "attention",
          codexCandidate?.value ?? "attention",
          "unknown",
          "attention",
        ],
        actionBadgeRotationIntervalSeconds: 30,
      } as unknown as AppState["settings"],
    });

    const state = await readAppState();

    expect(state?.settings.actionBadgeSelections).toEqual([
      "attention",
      codexCandidate?.value ?? "attention",
    ]);
    expect(state?.settings.actionBadgeRotationIntervalSeconds).toBe(30);
  });

  it("normalizes toolbar icon preferences", async () => {
    await writeAppState({
      ...SAMPLE_APP_STATE,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        toolbarIconMode: "provider",
        toolbarIconProviderId: "codex-personal-page",
        toolbarIconCustomImageDataUrl:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB",
      } as unknown as AppState["settings"],
    });

    const validState = await readAppState();

    expect(validState?.settings.toolbarIconMode).toBe("provider");
    expect(validState?.settings.toolbarIconProviderId).toBe("codex-personal-page");
    expect(validState?.settings.toolbarIconCustomImageDataUrl).toBe(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB",
    );

    await writeAppState({
      ...SAMPLE_APP_STATE,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        toolbarIconMode: "provider-site",
        toolbarIconProviderId: "unknown-provider",
        toolbarIconCustomImageDataUrl: "data:text/plain;base64,SGVsbG8=",
      } as unknown as AppState["settings"],
    });

    const invalidState = await readAppState();

    expect(invalidState?.settings.toolbarIconMode).toBe("match-badge");
    expect(invalidState?.settings.toolbarIconProviderId).toBeNull();
    expect(invalidState?.settings.toolbarIconCustomImageDataUrl).toBeNull();
  });

  it("normalizes invalid numeric preference values", async () => {
    await writeAppState({
      ...SAMPLE_APP_STATE,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        syncIntervalMinutes: 2,
        warningThresholdPercent: 100,
        progressThicknessPx: 99,
      } as unknown as AppState["settings"],
    });

    const state = await readAppState();

    expect(state?.settings.syncIntervalMinutes).toBe(3);
    expect(state?.settings.warningThresholdPercent).toBe(80);
    expect(state?.settings.progressThicknessPx).toBe(10);
  });

  it("preserves unrelated settings during partial state updates", async () => {
    await writeAppState({
      ...SAMPLE_APP_STATE,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        locale: "zh-CN",
        themeMode: "dark",
        motionMode: "reduced",
        syncIntervalMinutes: 15,
        popupProgressStyle: "circle-gauge",
        popupCircularProgressItemsPerRow: 3,
        progressThicknessPx: 7,
        toolbarIconMode: "provider",
        toolbarIconProviderId: "codex-personal-page",
        actionBadgeSelectionMode: "manual",
        actionBadgeSelection: "attention",
        actionBadgeSelections: ["attention"],
      },
    });

    await updateAppState((current) => ({
      ...current,
      settings: {
        ...current.settings,
        warningThresholdPercent: 90,
      },
    }));

    const state = await readAppState();

    expect(state?.settings.warningThresholdPercent).toBe(90);
    expect(state?.settings.locale).toBe("zh-CN");
    expect(state?.settings.themeMode).toBe("dark");
    expect(state?.settings.motionMode).toBe("reduced");
    expect(state?.settings.syncIntervalMinutes).toBe(15);
    expect(state?.settings.popupProgressStyle).toBe("circle-gauge");
    expect(state?.settings.popupCircularProgressItemsPerRow).toBe(3);
    expect(state?.settings.progressThicknessPx).toBe(7);
    expect(state?.settings.toolbarIconMode).toBe("provider");
    expect(state?.settings.toolbarIconProviderId).toBe("codex-personal-page");
    expect(state?.settings.actionBadgeSelectionMode).toBe("manual");
    expect(state?.settings.actionBadgeSelections).toEqual(["attention"]);
  });

  it("normalizes progress color bands independently from the warning threshold", async () => {
    await writeAppState({
      ...SAMPLE_APP_STATE,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        warningThresholdPercent: 90,
        progressColorBands: [
          {
            id: "healthy",
            minimumPercent: 50,
            maximumPercent: 100,
            colorHex: "#146c2e",
          },
          {
            id: "danger",
            minimumPercent: 0,
            maximumPercent: 20,
            colorHex: "#b3261e",
          },
          {
            id: "middle",
            minimumPercent: 21,
            maximumPercent: 49,
            colorHex: "#8a4b00",
          },
        ],
      } as unknown as AppState["settings"],
    });

    const state = await readAppState();

    expect(state?.settings.warningThresholdPercent).toBe(90);
    expect(state?.settings.progressColorBands).toEqual([
      {
        id: "healthy",
        minimumPercent: 50,
        maximumPercent: 100,
        colorHex: "#146C2E",
      },
      {
        id: "danger",
        minimumPercent: 0,
        maximumPercent: 20,
        colorHex: "#B3261E",
      },
      {
        id: "middle",
        minimumPercent: 21,
        maximumPercent: 49,
        colorHex: "#8A4B00",
      },
    ]);
  });

  it("upgrades legacy progress color bands into traditional color appearance", async () => {
    const progressColorBands = [
      {
        id: "all",
        minimumPercent: 0,
        maximumPercent: 100,
        colorHex: "#146c2e",
      },
    ];
    const {
      progressColorAppearance: _progressColorAppearance,
      ...legacySettings
    } = {
      ...SAMPLE_APP_STATE.settings,
      progressColorBands,
    };

    await writeAppState({
      ...SAMPLE_APP_STATE,
      settings: legacySettings as AppState["settings"],
    });

    const state = await readAppState();

    expect(state?.settings.progressColorBands).toEqual([
      {
        id: "all",
        minimumPercent: 0,
        maximumPercent: 100,
        colorHex: "#146C2E",
      },
    ]);
    expect(state?.settings.progressColorAppearance).toEqual({
      mode: "traditional",
      bands: [
        {
          id: "all",
          minimumPercent: 0,
          maximumPercent: 100,
          colorHex: "#146C2E",
        },
      ],
    });
  });

  it("normalizes stored gradient progress color appearance", async () => {
    await writeAppState({
      ...SAMPLE_APP_STATE,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        progressColorAppearance: {
          mode: "gradient",
          stops: [
            {
              id: "full",
              positionPercent: 100,
              colorHex: "#ffffff",
            },
            {
              id: "empty",
              positionPercent: 0,
              colorHex: "#000000",
            },
          ],
        },
      } as unknown as AppState["settings"],
    });

    const state = await readAppState();

    expect(state?.settings.progressColorAppearance).toEqual({
      mode: "gradient",
      stops: [
        {
          id: "empty",
          positionPercent: 0,
          colorHex: "#000000",
        },
        {
          id: "full",
          positionPercent: 100,
          colorHex: "#FFFFFF",
        },
      ],
    });
  });

  it("falls back invalid progress color bands to the default bands", async () => {
    await writeAppState({
      ...SAMPLE_APP_STATE,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        progressColorBands: [
          {
            id: "overlap-a",
            minimumPercent: 0,
            maximumPercent: 60,
            colorHex: "#B3261E",
          },
          {
            id: "overlap-b",
            minimumPercent: 60,
            maximumPercent: 100,
            colorHex: "#146C2E",
          },
        ],
      } as unknown as AppState["settings"],
    });

    const state = await readAppState();

    expect(state?.settings.progressColorBands).toEqual(
      SAMPLE_APP_STATE.settings.progressColorBands,
    );
  });

  it("upgrades stale static provider metadata to the current sample schema", async () => {
    await writeAppState(createStaleSchemaState());

    const state = await readAppState();

    expect(state).not.toBeNull();
    expect(
      state?.providerSettings.find((provider) => provider.id === "cursor-personal-page")
        ?.hostsLabel,
    ).toBe("cursor.com");
    expect(
      state?.providerSettings.find((provider) => provider.id === "cursor-personal-page")
        ?.hostOrigins,
    ).toEqual(["https://cursor.com/*"]);
    expect(
      state?.providerSettings.find((provider) => provider.id === "cursor-personal-page")
        ?.description,
    ).toBe(
      "Uses the logged-in Cursor personal usage page. Display is independent from browser access.",
    );
    expect(
      state?.providerSettings.find((provider) => provider.id === "codex-personal-page")
        ?.hostsLabel,
    ).toBe("chatgpt.com");
    expect(
      state?.providerSettings.find((provider) => provider.id === "codex-personal-page")
        ?.hostOrigins,
    ).toEqual(["https://chatgpt.com/*"]);
  });

  it("falls back to memory when localStorage operations throw", async () => {
    vi.stubGlobal("window", {
      localStorage: createThrowingStorage(),
    });

    await writeAppState({
      ...SAMPLE_APP_STATE,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        locale: "zh-CN",
      },
    });

    await expect(readAppState()).resolves.toMatchObject({
      settings: {
        locale: "zh-CN",
      },
    });

    await expect(clearAppState()).resolves.toBeUndefined();
    await expect(readAppState()).resolves.toBeNull();
  });
});
