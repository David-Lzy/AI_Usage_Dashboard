import { describe, expect, it } from "vitest";

import type { AppState } from "../providers/types";
import { SAMPLE_APP_STATE } from "./constants";
import {
  applyConfigurationBackupToState,
  buildConfigurationBackup,
  parseConfigurationBackupJson,
} from "./configuration-backup";

describe("configuration backup", () => {
  it("exports only portable configuration fields", () => {
    const backup = buildConfigurationBackup({
      ...SAMPLE_APP_STATE,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        toolbarIconMode: "custom",
        toolbarIconCustomImageDataUrl:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB",
      },
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) =>
        provider.id === "cursor"
          ? {
              ...provider,
              enabled: false,
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
      id: "cursor",
      enabled: false,
      sourcePreference: "session_page",
    });
    expect(JSON.stringify(backup.payload)).not.toContain("tabId");
    expect(JSON.stringify(backup.payload)).not.toContain("hostOrigins");
    expect(JSON.stringify(backup.payload)).not.toContain("credentialStatus");
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
        provider.id === "cursor"
          ? {
              ...provider,
              enabled: false,
              sourcePreference: "session_page",
            }
          : provider,
      ),
    });
    const currentState: AppState = {
      ...SAMPLE_APP_STATE,
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) =>
        provider.id === "cursor"
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
      (provider) => provider.id === "cursor",
    );

    expect(importedState.settings.locale).toBe("zh-CN");
    expect(importedState.settings.themeMode).toBe("dark");
    expect(cursorSetting?.enabled).toBe(false);
    expect(cursorSetting?.sourcePreference).toBe("session_page");
    expect(cursorSetting?.pageBinding.tabId).toBe(456);
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
