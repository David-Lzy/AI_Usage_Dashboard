import { describe, expect, it } from "vitest";

import type { AppState } from "../providers/types";
import { SAMPLE_APP_STATE } from "./constants";
import {
  applyConfigurationBackupToState,
  buildConfigurationBackup,
  parseConfigurationBackupJson,
} from "./configuration-backup";
import { readAppState, writeAppState } from "./storage";

describe("configuration backup", () => {
  it("exports only portable configuration fields", () => {
    const backup = buildConfigurationBackup({
      ...SAMPLE_APP_STATE,
      customSources: [
        {
          id: "custom:build_quota",
          label: "Build Quota",
          description: "Internal build minutes",
          endpointUrl: "https://example.com/quota.json",
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
          lastFailureReason: "raw server detail",
          stale: false,
        },
      ],
      settings: {
        ...SAMPLE_APP_STATE.settings,
        toolbarIconMode: "custom",
        toolbarIconCustomImageDataUrl:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB",
      },
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) =>
        provider.id === "cursor-personal-page"
          ? {
              ...provider,
              displayEnabled: false,
              sourcePreference: "session_page",
              status: "granted",
              pageBinding: {
                mode: "bound",
                status: "bound",
                tabId: 123,
                matchedUrl: "https://cursor.com/dashboard/usage",
                matchedTitle: "Cursor Usage",
                updatedAt: "2026-05-15T00:00:00.000Z",
              },
            }
          : provider,
      ),
    });

    expect(backup.payload.settings.toolbarIconMode).toBe("custom");
    expect(backup.payload.settings.toolbarIconCustomImageDataUrl).toContain(
      "data:image/png",
    );
    expect(backup.payload.providerSettings).toContainEqual({
      id: "cursor-personal-page",
      displayEnabled: false,
      sourcePreference: "session_page",
    });
    expect(JSON.stringify(backup.payload)).not.toContain("tabId");
    expect(JSON.stringify(backup.payload)).not.toContain("hostOrigins");
    expect(JSON.stringify(backup.payload)).not.toContain("credentialStatus");
    expect(backup.payload.customSources).toEqual([
      {
        id: "custom:build_quota",
        label: "Build Quota",
        description: "Internal build minutes",
        endpointUrl: "https://example.com/quota.json",
        displayEnabled: true,
        refreshIntervalMinutes: 30,
        createdAt: "2026-06-26T00:00:00.000Z",
        updatedAt: "2026-06-26T01:00:00.000Z",
      },
    ]);
    expect(JSON.stringify(backup.payload)).not.toContain("raw server detail");
    expect(JSON.stringify(backup.payload)).not.toContain("customSourceStates");
    expect(backup.excludedFields).toContain("customSourceStates");
    expect(backup.excludedFields).toContain("customSources.headers");
  });

  it("excludes local-only custom icon data from Chrome Sync backups", () => {
    const backup = buildConfigurationBackup(
      {
        ...SAMPLE_APP_STATE,
        settings: {
          ...SAMPLE_APP_STATE.settings,
          toolbarIconMode: "custom",
          toolbarIconCustomImageDataUrl:
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB",
        },
      },
      { includeCustomToolbarIconImage: false },
    );

    expect(backup.payload.settings.toolbarIconMode).toBe("default");
    expect(backup.payload.settings.toolbarIconCustomImageDataUrl).toBeNull();
    expect(backup.excludedFields).toContain(
      "settings.toolbarIconCustomImageDataUrl",
    );
  });

  it("imports settings and portable provider preferences without local bindings", () => {
    const backup = buildConfigurationBackup({
      ...SAMPLE_APP_STATE,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        locale: "zh-CN",
        themeMode: "dark",
      },
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) =>
        provider.id === "cursor-personal-page"
          ? {
              ...provider,
              displayEnabled: false,
              sourcePreference: "session_page",
            }
          : provider,
      ),
    });
    const currentState: AppState = {
      ...SAMPLE_APP_STATE,
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) =>
        provider.id === "cursor-personal-page"
          ? {
              ...provider,
              pageBinding: {
                mode: "bound",
                status: "bound",
                tabId: 456,
                matchedUrl: "https://cursor.com/dashboard/usage",
                matchedTitle: "Cursor Usage",
                updatedAt: "2026-05-15T00:00:00.000Z",
              },
            }
          : provider,
      ),
    };
    const importedState = applyConfigurationBackupToState(currentState, backup);
    const cursorSetting = importedState.providerSettings.find(
      (provider) => provider.id === "cursor-personal-page",
    );

    expect(importedState.settings.locale).toBe("zh-CN");
    expect(importedState.settings.themeMode).toBe("dark");
    expect(cursorSetting?.displayEnabled).toBe(false);
    expect(cursorSetting?.sourcePreference).toBe("session_page");
    expect(cursorSetting?.pageBinding.tabId).toBe(456);
  });

  it("imports valid custom source configs and drops invalid custom source entries", async () => {
    const backup = buildConfigurationBackup({
      ...SAMPLE_APP_STATE,
      customSources: [
        {
          id: "custom:build_quota",
          label: "Build Quota",
          description: "Internal build minutes",
          endpointUrl: "https://example.com/quota.json",
          displayEnabled: true,
          refreshIntervalMinutes: 30,
          createdAt: "2026-06-26T00:00:00.000Z",
          updatedAt: "2026-06-26T01:00:00.000Z",
        },
      ],
    });
    const rawBackup = JSON.parse(JSON.stringify(backup)) as typeof backup & {
      payload: {
        customSources: Array<Record<string, unknown>>;
      };
    };
    rawBackup.payload.customSources.push({
      id: "custom:bad",
      label: "Bad",
      description: null,
      endpointUrl: "file:///tmp/source.json",
      displayEnabled: true,
      refreshIntervalMinutes: 30,
      headers: {
        Authorization: "Bearer secret",
      },
    });
    const importedState = applyConfigurationBackupToState(
      {
        ...SAMPLE_APP_STATE,
        customSources: [],
        customSourceStates: [
          {
            sourceId: "custom:old",
            status: "ok",
            snapshot: null,
            lastAttemptAt: "2026-06-26T02:00:00.000Z",
            lastSuccessAt: "2026-06-26T02:00:00.000Z",
            lastFailureAt: null,
            lastFailureReason: null,
            stale: false,
          },
        ],
      },
      rawBackup,
    );

    await writeAppState(importedState);

    const storedState = await readAppState();

    expect(storedState?.customSources).toEqual([
      {
        id: "custom:build_quota",
        label: "Build Quota",
        description: "Internal build minutes",
        endpointUrl: "https://example.com/quota.json",
        displayEnabled: true,
        refreshIntervalMinutes: 30,
        createdAt: "2026-06-26T00:00:00.000Z",
        updatedAt: "2026-06-26T01:00:00.000Z",
      },
    ]);
    expect(JSON.stringify(storedState?.customSources)).not.toContain(
      "Authorization",
    );
    expect(storedState?.customSourceStates).toEqual([]);
  });

  it("imports legacy progress color bands as traditional color appearance", async () => {
    const backup = buildConfigurationBackup({
      ...SAMPLE_APP_STATE,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        progressColorBands: [
          {
            id: "all",
            minimumPercent: 0,
            maximumPercent: 100,
            colorHex: "#146C2E",
          },
        ],
      },
    });
    const {
      progressColorAppearance: _progressColorAppearance,
      ...legacySettings
    } = backup.payload.settings;
    const legacyBackup = {
      ...backup,
      payload: {
        ...backup.payload,
        settings: legacySettings as AppState["settings"],
      },
    };
    const importedState = applyConfigurationBackupToState(
      SAMPLE_APP_STATE,
      legacyBackup,
    );

    await writeAppState(importedState);

    const storedState = await readAppState();

    expect(storedState?.settings.progressColorAppearance).toEqual({
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

  it("keeps imported provider source preferences after storage normalization", async () => {
    const backup = buildConfigurationBackup({
      ...SAMPLE_APP_STATE,
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) =>
        provider.id === "cursor-personal-page"
          ? {
              ...provider,
              displayEnabled: true,
              sourcePreference: "session_page",
            }
          : provider.id === "cursor-team-api"
            ? {
                ...provider,
                displayEnabled: true,
                sourcePreference: "official_api",
              }
            : provider,
      ),
    });
    const importedState = applyConfigurationBackupToState(
      SAMPLE_APP_STATE,
      backup,
    );

    await writeAppState(importedState);

    const storedState = await readAppState();

    expect(
      storedState?.providerSettings.find(
        (provider) => provider.id === "cursor-personal-page",
      )?.sourcePreference,
    ).toBe("session_page");
    expect(
      storedState?.providerSettings.find(
        (provider) => provider.id === "cursor-team-api",
      )?.sourcePreference,
    ).toBe("official_api");
  });

  it("stores only generated gradient stops after image import", () => {
    const backup = buildConfigurationBackup({
      ...SAMPLE_APP_STATE,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        progressColorAppearance: {
          mode: "gradient",
          stops: [
            {
              id: "image-1",
              positionPercent: 0,
              colorHex: "#800080",
            },
            {
              id: "image-2",
              positionPercent: 100,
              colorHex: "#80FF80",
            },
          ],
        },
      },
    });
    const serializedSettings = JSON.stringify(backup.payload.settings);

    expect(serializedSettings).toContain("image-1");
    expect(serializedSettings).toContain("#80FF80");
    expect(serializedSettings).not.toContain("data:image");
    expect(serializedSettings).not.toContain("sample.png");
    expect(serializedSettings).not.toContain("base64");
  });

  it("rejects malformed backup JSON", () => {
    expect(parseConfigurationBackupJson("{")).toEqual({
      ok: false,
      error: "Configuration JSON could not be parsed.",
    });
    expect(parseConfigurationBackupJson(JSON.stringify({ format: "other" }))).toEqual({
      ok: false,
      error: "Configuration JSON does not match the expected backup format.",
    });
  });
});
