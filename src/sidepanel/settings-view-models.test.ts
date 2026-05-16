import { describe, expect, it } from "vitest";

import {
  createPageSessionDiagnostic,
  createSourceFallbackDiagnostic,
  createSourceSelectionDiagnostic,
  createUsageThresholdDiagnostic,
} from "../providers/diagnostics";
import type { ProviderDiagnostic } from "../providers/types";
import { SAMPLE_APP_STATE } from "../shared/constants";
import { createRuntimeI18n } from "../shared/i18n";
import {
  buildProviderSourceDisplayLocalizedCopy,
  buildSettingsLocalizedCopy,
  getProviderDiagnosticPresentation,
} from "../shared/localized-copy";
import { buildProviderSourceDisplay } from "../shared/provider-sources";
import {
  buildSettingsQuickSetupCardModel,
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
      { label: "Enabled", value: "4", tone: "neutral" },
      { label: "Connected", value: "2", tone: "neutral" },
      { label: "Needs action", value: "1", tone: "warning" },
    ]);
  });

  it("accepts localized labels and formatted values for the settings summary", () => {
    const items = buildSettingsSummaryItems(
      SAMPLE_APP_STATE.providerSettings,
      SAMPLE_APP_STATE.providers,
      "developer",
      {
        enabled: "已启用",
        connected: "已连接",
        needsAction: "待处理",
        storedSecrets: "已存密钥",
        boundPages: "已绑定页面",
      },
      (value: number) => `#${value}`,
    );

    expect(items).toEqual([
      { label: "已启用", value: "#4", tone: "neutral" },
      { label: "已连接", value: "#2", tone: "neutral" },
      { label: "待处理", value: "#1", tone: "warning" },
      { label: "已存密钥", value: "#0", tone: "neutral" },
      { label: "已绑定页面", value: "#0", tone: "neutral" },
    ]);
  });

  it("counts only enabled access gaps and configured local secrets", () => {
    const items = buildSettingsSummaryItems(
      SAMPLE_APP_STATE.providerSettings.map((provider) => {
        if (provider.id === "cursor-personal-page") {
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

        if (provider.id === "codex-personal-page") {
          return {
            ...provider,
            credentialStatus: "configured" as const,
          };
        }

        if (provider.id === "jetbrains-org-page") {
          return {
            ...provider,
            displayEnabled: false,
            status: "missing" as const,
          };
        }

        return provider;
      }),
      SAMPLE_APP_STATE.providers,
      "debug",
    );

    expect(items).toEqual([
      { label: "Enabled", value: "4", tone: "neutral" },
      { label: "Connected", value: "1", tone: "neutral" },
      { label: "Needs action", value: "2", tone: "warning" },
      { label: "Stored Secrets", value: "1", tone: "neutral" },
      { label: "Bound Pages", value: "1", tone: "neutral" },
    ]);
  });

  it("builds a quick-setup model for page-backed providers that are ready", () => {
    const provider =
      SAMPLE_APP_STATE.providerSettings.find((entry) => entry.id === "cursor-personal-page") ??
      null;
    const snapshot =
      SAMPLE_APP_STATE.providers.find(
        (entry) => entry.providerId === "cursor-personal-page",
      ) ?? null;
    const settingsCopy = buildSettingsLocalizedCopy(createRuntimeI18n("en"));

    expect(provider).not.toBeNull();
    expect(snapshot).not.toBeNull();

    const quickSetupModel = buildSettingsQuickSetupCardModel(
      provider!,
      snapshot!,
      settingsCopy,
      "basic",
    );

    expect(quickSetupModel.statusLabel).toBe("Ready to sync");
    expect(quickSetupModel.currentSetupValue).toBe("Signed-in usage page");
    expect(quickSetupModel.sourcePreferenceValue).toBe("Session page");
    expect(quickSetupModel.sourceModes.map((mode) => mode.id)).toEqual([
      "session_page",
    ]);
    expect(
      quickSetupModel.sourceModes.find((mode) => mode.id === "session_page"),
    ).toMatchObject({
      isCurrent: true,
      label: "Cursor personal dashboard usage page",
    });
    expect(
      quickSetupModel.sourceModes.find((mode) => mode.id === "session_page")
        ?.chips.map((chip) => chip.label),
    ).toEqual(["Session page", "Shipped", "Logged-in page session"]);
    expect(quickSetupModel.primaryAction).toBeNull();
    expect(
      quickSetupModel.secondaryActions.some(
        (action) => action.id === "open_source_page",
      ),
    ).toBe(true);
  });

  it("maps missing host access to a grant-access quick-setup action", () => {
    const provider =
      SAMPLE_APP_STATE.providerSettings.find((entry) => entry.id === "cursor-personal-page") ??
      null;
    const snapshot =
      SAMPLE_APP_STATE.providers.find(
        (entry) => entry.providerId === "cursor-personal-page",
      ) ?? null;
    const settingsCopy = buildSettingsLocalizedCopy(createRuntimeI18n("en"));

    expect(provider).not.toBeNull();
    expect(snapshot).not.toBeNull();

    const quickSetupModel = buildSettingsQuickSetupCardModel(
      {
        ...provider!,
        status: "missing",
      },
      {
        ...snapshot!,
        warningReason: "Grant host access before live sync can continue.",
      },
      settingsCopy,
      "advanced",
    );

    expect(quickSetupModel.primaryAction).toEqual({
      id: "grant_access",
      label: "Grant access",
    });
    expect(quickSetupModel.nextStepValue).toBe("Grant access");
  });

  it("maps open-page-required and logged-out states to the correct page actions", () => {
    const provider =
      SAMPLE_APP_STATE.providerSettings.find(
        (entry) => entry.id === "claude-code-team-page",
      ) ?? null;
    const snapshot =
      SAMPLE_APP_STATE.providers.find(
        (entry) => entry.providerId === "claude-code-team-page",
      ) ?? null;
    const settingsCopy = buildSettingsLocalizedCopy(createRuntimeI18n("en"));

    expect(provider).not.toBeNull();
    expect(snapshot).not.toBeNull();

    const openPageModel = buildSettingsQuickSetupCardModel(
      provider!,
      {
        ...snapshot!,
        syncSource: "page_parse",
        warningReason: "Open the required logged-in provider page, then refresh again.",
        warningDiagnostic: createPageSessionDiagnostic({
          providerId: "claude-code-team-page",
          pageSessionKind: "open_page_required",
          rawMessage:
            "Open the required logged-in provider page, then refresh again.",
        }),
      },
      settingsCopy,
      "basic",
    );
    const loggedOutModel = buildSettingsQuickSetupCardModel(
      provider!,
      {
        ...snapshot!,
        syncSource: "page_parse",
        warningReason: "Log in on the provider page again before refreshing the dashboard.",
        warningDiagnostic: createPageSessionDiagnostic({
          providerId: "claude-code-team-page",
          pageSessionKind: "logged_out",
          rawMessage:
            "Log in on the provider page again before refreshing the dashboard.",
        }),
      },
      settingsCopy,
      "basic",
    );

    expect(openPageModel.primaryAction).toEqual({
      id: "open_usage_page",
      label: "Open usage page",
    });
    expect(loggedOutModel.primaryAction).toEqual({
      id: "open_page_and_sign_in",
      label: "Open page and sign in",
    });
  });

  it("keeps source-mode cards available for disabled quick-setup providers", () => {
    const provider =
      SAMPLE_APP_STATE.providerSettings.find((entry) => entry.id === "gemini-policy") ??
      null;
    const snapshot =
      SAMPLE_APP_STATE.providers.find(
        (entry) => entry.providerId === "gemini-policy",
      ) ?? null;
    const settingsCopy = buildSettingsLocalizedCopy(createRuntimeI18n("zh-CN"));
    const sourceDisplayCopy = buildProviderSourceDisplayLocalizedCopy(
      createRuntimeI18n("zh-CN"),
    );

    expect(provider).not.toBeNull();
    expect(snapshot).not.toBeNull();

    const quickSetupModel = buildSettingsQuickSetupCardModel(
      {
        ...provider!,
        displayEnabled: false,
      },
      snapshot!,
      settingsCopy,
      "basic",
      sourceDisplayCopy,
    );

    expect(quickSetupModel.displayEnabled).toBe(false);
    expect(quickSetupModel.sourcePreferenceValue).toBe("自动");
    expect(quickSetupModel.sourceModes.map((mode) => mode.id)).toEqual([
      "policy_only",
    ]);
    expect(quickSetupModel.sourceModes[0]).toMatchObject({
      isCurrent: false,
      label: "Documented Gemini quota policy",
    });
    expect(quickSetupModel.sourceModes[0]?.chips.map((chip) => chip.label)).toEqual([
      "仅策略",
      "已发布",
      "无 live 连接",
    ]);
  });

  it("splits source-card data into primary summary fields and diagnostics", () => {
    const provider =
      SAMPLE_APP_STATE.providers.find((entry) => entry.providerId === "codex-personal-page") ??
      null;
    const setting =
      SAMPLE_APP_STATE.providerSettings.find((entry) => entry.id === "codex-personal-page") ??
      null;

    expect(provider).not.toBeNull();
    expect(setting).not.toBeNull();

    const sourceCardModel = buildSettingsSourceCardModel(
      buildProviderSourceDisplay(provider!, setting!),
    );

    expect(sourceCardModel.primaryFields).toEqual([
      { label: "Access model", value: "Logged-in page session" },
      {
        label: "Availability summary",
        value: "Used: Window only · Remaining: Exact · Reset: Exact",
      },
      { label: "Fallback", value: "None" },
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
            field.value === "Session page selected.",
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
      SAMPLE_APP_STATE.providers.find((entry) => entry.providerId === "cursor-personal-page") ??
      null;
    const setting =
      SAMPLE_APP_STATE.providerSettings.find((entry) => entry.id === "cursor-personal-page") ??
      null;

    expect(provider).not.toBeNull();
    expect(setting).not.toBeNull();

    const fallbackReason =
      "Session page unavailable: no readable Cursor usage page is attached.";
    const sourceCardModel = buildSettingsSourceCardModel(
      buildProviderSourceDisplay(
        {
          ...provider!,
          sourceFallbackReason: fallbackReason,
        },
        setting!,
      ),
    );

    expect(sourceCardModel.summaryNoteLines).toEqual([
      fallbackReason,
    ]);
    expect(sourceCardModel.summaryNoteTone).toBe("warning");
    expect(
      sourceCardModel.diagnosticGroups.find(
        (group) => group.title === "Source decision",
      )?.fields.some(
        (field) =>
          field.label === "Fallback reason" &&
          field.value === fallbackReason,
      ),
    ).toBe(true);
  });

  it("adds localized typed diagnostic presentation without hiding raw diagnostics", () => {
    const provider =
      SAMPLE_APP_STATE.providers.find((entry) => entry.providerId === "codex-personal-page") ??
      null;
    const setting =
      SAMPLE_APP_STATE.providerSettings.find((entry) => entry.id === "codex-personal-page") ??
      null;

    expect(provider).not.toBeNull();
    expect(setting).not.toBeNull();

    const i18n = createRuntimeI18n("zh-CN");
    const settingsCopy = buildSettingsLocalizedCopy(i18n);
    const diagnostic = createUsageThresholdDiagnostic({
      providerId: "codex-personal-page",
      usageThresholdKind: "threshold_warning",
      rawMessage: "5-hour usage window: 7% remaining",
      usagePercent: 93,
      thresholdPercent: 80,
      unitLabel: "percent",
    });
    const sourceCardModel = buildSettingsSourceCardModel(
      buildProviderSourceDisplay(
        {
          ...provider!,
          warningReason: diagnostic.rawMessage,
          warningDiagnostic: diagnostic,
        },
        setting!,
        buildProviderSourceDisplayLocalizedCopy(i18n),
      ),
      {
        ...settingsCopy.sources.cardLabels,
        sourceKindLabels: settingsCopy.sources.sourceKindLabels,
        routeFallback: settingsCopy.sources.routeFallback,
      },
      getProviderDiagnosticPresentation(diagnostic, i18n),
    );
    const sourceDecisionGroup = sourceCardModel.diagnosticGroups.find(
      (group) => group.title === "来源决策",
    );

    expect(sourceDecisionGroup?.fields).toEqual(
      expect.arrayContaining([
        { label: "诊断", value: "用量阈值" },
        {
          label: "诊断摘要",
          value: "当前用量 93%，已达到 80% 告警阈值。",
        },
        {
          label: "就绪详情",
          value:
            "Shipped personal-user path. The 2026-04-21 live-tab capture matched chatgpt.com/codex/cloud/settings/analytics#usage and exposed exact remaining percentages plus reset times in DOM. The extension attaches to the already-running logged-in ChatGPT tab and does not export cookies.",
        },
      ]),
    );
  });

  it("adds localized source diagnostic presentation without hiding raw source reasons", () => {
    const provider =
      SAMPLE_APP_STATE.providers.find((entry) => entry.providerId === "cursor-personal-page") ??
      null;
    const setting =
      SAMPLE_APP_STATE.providerSettings.find((entry) => entry.id === "cursor-personal-page") ??
      null;

    expect(provider).not.toBeNull();
    expect(setting).not.toBeNull();

    const i18n = createRuntimeI18n("zh-CN");
    const settingsCopy = buildSettingsLocalizedCopy(i18n);
    const sourceSelectionDiagnostic = createSourceSelectionDiagnostic({
      providerId: "cursor-personal-page",
      sourcePreference: "auto",
      selectedKind: "session_page",
      hadFallback: true,
      rawMessage: "Auto fell back to Session page.",
    });
    const sourceFallbackDiagnostic = createSourceFallbackDiagnostic({
      providerId: "cursor-personal-page",
      sourcePreference: "auto",
      failure: {
        kind: "official_api",
        code: "credential_missing",
        detail: "No Cursor Admin API key is stored.",
      },
      rawMessage: "Official API unavailable: no Cursor Admin API key is stored.",
    });

    expect(sourceSelectionDiagnostic).not.toBeNull();

    const sourceCardModel = buildSettingsSourceCardModel(
      buildProviderSourceDisplay(
        {
          ...provider!,
          sourceSelectionReason: sourceSelectionDiagnostic!.rawMessage,
          sourceFallbackReason: sourceFallbackDiagnostic.rawMessage,
          sourceSelectionDiagnostic,
          sourceFallbackDiagnostic,
        },
        setting!,
        buildProviderSourceDisplayLocalizedCopy(i18n),
      ),
      {
        ...settingsCopy.sources.cardLabels,
        sourceKindLabels: settingsCopy.sources.sourceKindLabels,
        routeFallback: settingsCopy.sources.routeFallback,
      },
      null,
      getProviderDiagnosticPresentation(sourceSelectionDiagnostic, i18n),
      getProviderDiagnosticPresentation(sourceFallbackDiagnostic, i18n),
    );
    const sourceDecisionGroup = sourceCardModel.diagnosticGroups.find(
      (group) => group.title === "来源决策",
    );

    expect(sourceDecisionGroup?.fields).toEqual(
      expect.arrayContaining([
        { label: "选择原因", value: "Auto fell back to Session page." },
        { label: "选择诊断", value: "自动回退到会话页面" },
        {
          label: "选择摘要",
          value: "自动偏好在前置来源不可用后选择了会话页面。",
        },
        {
          label: "回退原因",
          value: "Official API unavailable: no Cursor Admin API key is stored.",
        },
        { label: "回退诊断", value: "官方 API 缺少凭据" },
        {
          label: "回退摘要",
          value: "官方 API 来源缺少所需凭据，无法运行。",
        },
      ]),
    );
  });

  it("keeps raw settings evidence visible when typed diagnostic presentation is absent", () => {
    const provider =
      SAMPLE_APP_STATE.providers.find((entry) => entry.providerId === "cursor-personal-page") ??
      null;
    const setting =
      SAMPLE_APP_STATE.providerSettings.find((entry) => entry.id === "cursor-personal-page") ??
      null;

    expect(provider).not.toBeNull();
    expect(setting).not.toBeNull();

    const rawWarningReason =
      "No Cursor Admin API key is stored; add an API key before official sync can run.";
    const rawSelectionReason =
      "Auto selected Session page after an unavailable official source.";
    const rawFallbackReason =
      "Official API unavailable: no Cursor Admin API key is stored.";
    const unknownWarningDiagnostic: ProviderDiagnostic = {
      code: "future.cursor_credential_hint",
      category: "adapter_error",
      severity: "warning",
      rawMessage: rawWarningReason,
    };
    const unknownSelectionDiagnostic: ProviderDiagnostic = {
      code: "future.cursor_selection_hint",
      category: "source_selection",
      severity: "info",
      rawMessage: rawSelectionReason,
    };
    const unknownFallbackDiagnostic: ProviderDiagnostic = {
      code: "future.cursor_fallback_hint",
      category: "source_fallback",
      severity: "warning",
      rawMessage: rawFallbackReason,
    };
    const i18n = createRuntimeI18n("zh-CN");
    const settingsCopy = buildSettingsLocalizedCopy(i18n);
    const sourceCardModel = buildSettingsSourceCardModel(
      buildProviderSourceDisplay(
        {
          ...provider!,
          warningReason: rawWarningReason,
          warningDiagnostic: unknownWarningDiagnostic,
          sourceSelectionReason: rawSelectionReason,
          sourceSelectionDiagnostic: unknownSelectionDiagnostic,
          sourceFallbackReason: rawFallbackReason,
          sourceFallbackDiagnostic: unknownFallbackDiagnostic,
        },
        setting!,
        buildProviderSourceDisplayLocalizedCopy(i18n),
      ),
      {
        ...settingsCopy.sources.cardLabels,
        sourceKindLabels: settingsCopy.sources.sourceKindLabels,
        routeFallback: settingsCopy.sources.routeFallback,
      },
    );
    const sourceDecisionGroup = sourceCardModel.diagnosticGroups.find(
      (group) => group.title === "来源决策",
    );

    expect(sourceCardModel.summaryNoteLines).toEqual([
      rawFallbackReason,
      rawWarningReason,
    ]);
    expect(sourceDecisionGroup?.fields).toEqual(
      expect.arrayContaining([
        { label: "选择原因", value: rawSelectionReason },
        { label: "回退原因", value: rawFallbackReason },
        { label: "就绪详情", value: rawWarningReason },
      ]),
    );
    expect(
      sourceDecisionGroup?.fields.some((field) => field.label === "选择诊断"),
    ).toBe(false);
    expect(
      sourceDecisionGroup?.fields.some((field) => field.label === "回退诊断"),
    ).toBe(false);
  });

  it("builds a compact deferred session-track model with a graduation gate", () => {
    const provider =
      SAMPLE_APP_STATE.providers.find((entry) => entry.providerId === "jetbrains-org-page") ??
      null;
    const setting =
      SAMPLE_APP_STATE.providerSettings.find((entry) => entry.id === "jetbrains-org-page") ??
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
          field.value === "Reverify org-visible Console session",
      ),
    ).toBe(true);
    expect(sourceCardModel.sessionTrack?.noteTone).toBe("warning");
  });
  it("accepts localized labels for deeper settings helper copy", () => {
    const provider =
      SAMPLE_APP_STATE.providers.find((entry) => entry.providerId === "codex-personal-page") ??
      null;
    const setting =
      SAMPLE_APP_STATE.providerSettings.find((entry) => entry.id === "codex-personal-page") ??
      null;

    expect(provider).not.toBeNull();
    expect(setting).not.toBeNull();

    const settingsCopy = buildSettingsLocalizedCopy(createRuntimeI18n("zh-CN"));
    const providerSourceDisplayCopy = buildProviderSourceDisplayLocalizedCopy(
      createRuntimeI18n("zh-CN"),
    );
    const sourceCardModel = buildSettingsSourceCardModel(
      buildProviderSourceDisplay(provider!, setting!, providerSourceDisplayCopy),
      {
        ...settingsCopy.sources.cardLabels,
        sourceKindLabels: settingsCopy.sources.sourceKindLabels,
        routeFallback: settingsCopy.sources.routeFallback,
      },
    );

    expect(sourceCardModel.primaryFields[0]).toEqual({
      label: "访问模型",
      value: "已登录页面会话",
    });
    expect(sourceCardModel.primaryFields[1]).toEqual({
      label: "可用性摘要",
      value: "已用：仅窗口 · 剩余：精确 · 重置：精确",
    });
    expect(sourceCardModel.primaryFields[2]).toEqual({
      label: "回退",
      value: "无",
    });
    expect(sourceCardModel.sessionTrack?.chips.map((chip) => chip.label)).toEqual([
      "已发布",
      "已发布 personal partial",
      "仅窗口供应商值",
    ]);
    expect(
      sourceCardModel.diagnosticGroups.map((group) => group.title),
    ).toEqual(["来源决策", "值语义", "信任边界"]);
  });

});
