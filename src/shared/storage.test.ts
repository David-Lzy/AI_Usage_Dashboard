import { beforeEach, describe, expect, it } from "vitest";

import type { AppState } from "../providers/types";
import { buildActionBadgeQuotaCandidates } from "./action-badge-preferences";
import { SAMPLE_APP_STATE } from "./constants";
import { readAppState, updateAppState, writeAppState } from "./storage";

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
    progressThicknessPx: _progressThicknessPx,
    progressColorBands: _progressColorBands,
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

describe("storage normalization", () => {
  beforeEach(async () => {
    await writeAppState(SAMPLE_APP_STATE);
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
    expect(state?.settings.popupCircularProgressItemsPerRow).toBe(4);
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
      settings: {
        ...SAMPLE_APP_STATE.settings,
        progressItemsBySurface: {
          popup: {
            "jetbrains-org-page": [
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

    expect(state?.settings.progressItemsBySurface.popup["jetbrains-org-page"]).toEqual([
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
    expect(state?.settings.popupCircularProgressItemsPerRow).toBe(4);
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
});
