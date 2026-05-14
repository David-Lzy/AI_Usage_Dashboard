import { beforeEach, describe, expect, it } from "vitest";

import type { AppState } from "../providers/types";
import { SAMPLE_APP_STATE } from "./constants";
import { readAppState, writeAppState } from "./storage";

function createLegacyState(): AppState {
  const {
    locale: _locale,
    userLevel: _userLevel,
    themeMode: _themeMode,
    themePreset: _themePreset,
    themeCustomSeedHex: _themeCustomSeedHex,
    popupProgressStyle: _popupProgressStyle,
    sidebarProgressStyle: _sidebarProgressStyle,
    fullPageProgressStyle: _fullPageProgressStyle,
    popupSizePreset: _popupSizePreset,
    popupCornerStyle: _popupCornerStyle,
    popupShadowStyle: _popupShadowStyle,
    actionBadgeSelection: _actionBadgeSelection,
    providerOrderBySurface: _providerOrderBySurface,
    progressItemsBySurface: _progressItemsBySurface,
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
      if (provider.id === "cursor") {
        return {
          ...provider,
          hostsLabel: "api.cursor.com",
          hostOrigins: ["https://api.cursor.com/*"],
          description: "Needed for Cursor Team Admin API requests.",
        };
      }

      if (provider.id === "codex") {
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

describe("storage normalization", () => {
  beforeEach(async () => {
    await writeAppState(SAMPLE_APP_STATE);
  });

  it("fills missing provider setting fields from the sample schema", async () => {
    await writeAppState(createLegacyState());

    const state = await readAppState();

    expect(state).not.toBeNull();
    expect(
      state?.providerSettings.find((provider) => provider.id === "cursor")
        ?.credentialStatus,
    ).toBe("missing");
    expect(
      state?.providerSettings.find((provider) => provider.id === "claude-code")
        ?.credentialStatus,
    ).toBe("missing");
    expect(
      state?.providerSettings.find((provider) => provider.id === "codex")
        ?.credentialStatus,
    ).toBe("missing");
    expect(
      state?.providerSettings.find((provider) => provider.id === "jetbrains")
        ?.hostOrigins,
    ).toEqual(["https://account.jetbrains.com/*", "https://*.jetbrains.com/*"]);
    expect(
      state?.providerSettings.find((provider) => provider.id === "gemini")
        ?.hostOrigins,
    ).toEqual([]);
    expect(
      state?.providerSettings.find((provider) => provider.id === "gemini")
        ?.credentialStatus,
    ).toBe("not_required");
    expect(
      state?.providerSettings.find((provider) => provider.id === "cursor")
        ?.sourcePreference,
    ).toBe("auto");
    expect(
      state?.providerSettings.find((provider) => provider.id === "cursor")
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
    expect(state?.settings.popupProgressStyle).toBe("circle-soft");
    expect(state?.settings.sidebarProgressStyle).toBe("line");
    expect(state?.settings.fullPageProgressStyle).toBe("line");
    expect(state?.settings.popupSizePreset).toBe("balanced");
    expect(state?.settings.popupCornerStyle).toBe("rounded");
    expect(state?.settings.popupShadowStyle).toBe("soft");
    expect(state?.settings.actionBadgeSelection).toBe("attention");
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
  });

  it("normalizes display preferences from stale stored state", async () => {
    await writeAppState({
      ...SAMPLE_APP_STATE,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        providerOrderBySurface: {
          popup: ["codex", "unknown-provider", "cursor", "codex"],
          sidebar: "codex",
          fullPage: ["gemini"],
        },
        progressItemsBySurface: {
          popup: {
            codex: [
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
      "codex",
      "cursor",
      "jetbrains",
      "claude-code",
      "gemini",
    ]);
    expect(state?.settings.providerOrderBySurface.sidebar).toEqual([]);
    expect(state?.settings.providerOrderBySurface.fullPage).toEqual([
      "gemini",
      "cursor",
      "jetbrains",
      "claude-code",
      "codex",
    ]);
    expect(state?.settings.progressItemsBySurface).toEqual({
      popup: {},
      sidebar: {},
      fullPage: {},
    });
  });

  it("keeps known progress item preferences and appends newly discovered items", async () => {
    await writeAppState({
      ...SAMPLE_APP_STATE,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        progressItemsBySurface: {
          popup: {
            jetbrains: [
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

    expect(state?.settings.progressItemsBySurface.popup.jetbrains).toEqual([
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
      } as unknown as AppState["settings"],
    });

    const state = await readAppState();

    expect(state?.settings.popupSizePreset).toBe("balanced");
    expect(state?.settings.popupCornerStyle).toBe("rounded");
    expect(state?.settings.popupShadowStyle).toBe("soft");
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
  });

  it("normalizes invalid numeric preference values", async () => {
    await writeAppState({
      ...SAMPLE_APP_STATE,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        syncIntervalMinutes: 2,
        warningThresholdPercent: 100,
      } as unknown as AppState["settings"],
    });

    const state = await readAppState();

    expect(state?.settings.syncIntervalMinutes).toBe(30);
    expect(state?.settings.warningThresholdPercent).toBe(80);
  });

  it("upgrades stale static provider metadata to the current sample schema", async () => {
    await writeAppState(createStaleSchemaState());

    const state = await readAppState();

    expect(state).not.toBeNull();
    expect(
      state?.providerSettings.find((provider) => provider.id === "cursor")
        ?.hostsLabel,
    ).toBe("api.cursor.com · cursor.com");
    expect(
      state?.providerSettings.find((provider) => provider.id === "cursor")
        ?.hostOrigins,
    ).toEqual(["https://api.cursor.com/*", "https://cursor.com/*"]);
    expect(
      state?.providerSettings.find((provider) => provider.id === "cursor")
        ?.description,
    ).toBe(
      "Uses the team Admin API when a key is configured, or the logged-in personal usage page when no key is stored.",
    );
    expect(
      state?.providerSettings.find((provider) => provider.id === "codex")
        ?.hostsLabel,
    ).toBe("api.chatgpt.com + chatgpt.com");
    expect(
      state?.providerSettings.find((provider) => provider.id === "codex")
        ?.hostOrigins,
    ).toEqual(["https://api.chatgpt.com/*", "https://chatgpt.com/*"]);
  });
});
