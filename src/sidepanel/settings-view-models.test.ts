import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../shared/constants";
import { buildProviderSourceDisplay } from "../shared/provider-sources";
import {
  buildSettingsSourceCardModel,
  buildSettingsSummaryItems,
} from "./settings-view-models";

describe("settings view models", () => {
  it("builds overview counts for the default settings screen", () => {
    const items = buildSettingsSummaryItems(
      SAMPLE_APP_STATE.providerSettings,
      SAMPLE_APP_STATE.providers,
    );

    expect(items).toEqual([
      { label: "Visible", value: "4", tone: "neutral" },
      { label: "Stored Secrets", value: "0", tone: "neutral" },
      { label: "Bound Pages", value: "0", tone: "neutral" },
      { label: "Needs Access", value: "0", tone: "neutral" },
    ]);
  });

  it("counts only enabled access gaps and configured local secrets", () => {
    const items = buildSettingsSummaryItems(
      SAMPLE_APP_STATE.providerSettings.map((provider) => {
        if (provider.id === "cursor") {
          return {
            ...provider,
            status: "missing" as const,
            pageBinding: {
              mode: "bound" as const,
              status: "bound" as const,
              tabId: 42,
              matchedUrl: "https://cursor.com/dashboard/usage",
              matchedTitle: "Cursor Usage",
              updatedAt: "2026-04-23 03:40",
            },
          };
        }

        if (provider.id === "codex") {
          return {
            ...provider,
            credentialStatus: "configured" as const,
          };
        }

        if (provider.id === "jetbrains") {
          return {
            ...provider,
            enabled: false,
            status: "missing" as const,
          };
        }

        return provider;
      }),
      SAMPLE_APP_STATE.providers,
    );

    expect(items).toEqual([
      { label: "Visible", value: "4", tone: "neutral" },
      { label: "Stored Secrets", value: "1", tone: "neutral" },
      { label: "Bound Pages", value: "1", tone: "neutral" },
      { label: "Needs Access", value: "1", tone: "warning" },
    ]);
  });

  it("splits source-card data into primary summary fields and diagnostics", () => {
    const provider =
      SAMPLE_APP_STATE.providers.find((entry) => entry.providerId === "codex") ??
      null;
    const setting =
      SAMPLE_APP_STATE.providerSettings.find((entry) => entry.id === "codex") ??
      null;

    expect(provider).not.toBeNull();
    expect(setting).not.toBeNull();

    const sourceCardModel = buildSettingsSourceCardModel(
      buildProviderSourceDisplay(provider!, setting!),
    );

    expect(sourceCardModel.primaryFields).toEqual([
      { label: "Access model", value: "Stored credential" },
      {
        label: "Availability summary",
        value: "Used: Analytics · Remaining: Unavailable · Reset: Window only",
      },
      { label: "Fallback", value: "Session page" },
    ]);
    expect(sourceCardModel.summaryNoteLines).toEqual([]);
    expect(sourceCardModel.summaryNoteTone).toBeNull();
    expect(sourceCardModel.sessionTrack?.title).toBe(
      "Codex personal usage pages",
    );
    expect(sourceCardModel.sessionTrack?.chips.map((chip) => chip.label)).toEqual([
      "Shipped",
      "Shipped personal partial",
      "Window-only vendor value",
    ]);
    expect(sourceCardModel.sessionTrack?.fields).toEqual([
      {
        label: "Route",
        value: "https://chatgpt.com/codex/cloud/settings/analytics",
      },
      {
        label: "Availability",
        value: "Used: Window only · Remaining: Exact · Reset: Exact",
      },
    ]);
    expect(
      sourceCardModel.diagnosticGroups.map((group) => group.title),
    ).toEqual(["Source decision", "Value semantics", "Trust boundary"]);
    expect(
      sourceCardModel.diagnosticGroups.some((group) =>
        group.fields.some(
          (field) =>
            field.label === "Selection reason" &&
            field.value === "Auto selected Official API.",
        ),
      ),
    ).toBe(true);
    expect(
      sourceCardModel.diagnosticGroups.some((group) =>
        group.fields.some(
          (field) =>
            field.label === "Host access" && field.value === "Required",
        ),
      ),
    ).toBe(true);
    expect(
      sourceCardModel.diagnosticGroups.some((group) =>
        group.noteLines.some((line) =>
          line.includes("extension-managed local storage"),
        ),
      ),
    ).toBe(true);
    expect(sourceCardModel.diagnosticsCount).toBeGreaterThan(
      sourceCardModel.primaryFields.length,
    );
  });

  it("keeps fallback or warning reasons visible when the summary needs explanation", () => {
    const provider =
      SAMPLE_APP_STATE.providers.find((entry) => entry.providerId === "cursor") ??
      null;
    const setting =
      SAMPLE_APP_STATE.providerSettings.find((entry) => entry.id === "cursor") ??
      null;

    expect(provider).not.toBeNull();
    expect(setting).not.toBeNull();

    const sourceCardModel = buildSettingsSourceCardModel(
      buildProviderSourceDisplay(provider!, setting!),
    );

    expect(sourceCardModel.summaryNoteLines).toEqual([
      "Official API unavailable: no Cursor Admin API key is stored.",
    ]);
    expect(sourceCardModel.summaryNoteTone).toBe("warning");
    expect(
      sourceCardModel.diagnosticGroups.find(
        (group) => group.title === "Source decision",
      )?.fields.some(
        (field) =>
          field.label === "Fallback reason" &&
          field.value ===
            "Official API unavailable: no Cursor Admin API key is stored.",
      ),
    ).toBe(true);
  });

  it("builds a compact deferred session-track model with a graduation gate", () => {
    const provider =
      SAMPLE_APP_STATE.providers.find((entry) => entry.providerId === "gemini") ??
      null;
    const setting =
      SAMPLE_APP_STATE.providerSettings.find((entry) => entry.id === "gemini") ??
      null;

    expect(provider).not.toBeNull();
    expect(setting).not.toBeNull();

    const sourceCardModel = buildSettingsSourceCardModel(
      buildProviderSourceDisplay(provider!, setting!),
    );

    expect(sourceCardModel.sessionTrack?.chips[0]).toEqual({
      label: "Deferred",
      tone: "warning",
    });
    expect(
      sourceCardModel.sessionTrack?.fields.some(
        (field) =>
          field.label === "Graduation gate" &&
          field.value === "Accept project-metrics support",
      ),
    ).toBe(true);
    expect(sourceCardModel.sessionTrack?.noteTone).toBe("warning");
  });
});
