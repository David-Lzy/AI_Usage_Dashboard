import { describe, expect, it } from "vitest";

import {
  createPageSessionDiagnostic,
  createUsageThresholdDiagnostic,
} from "../providers/diagnostics";
import type { AppState } from "../providers/types";
import { SAMPLE_APP_STATE } from "../shared/constants";
import { createRuntimeI18n } from "../shared/i18n";
import { buildPopupViewModel, localizePopupViewModel } from "./view-models";

function createState(overrides?: Partial<AppState>): AppState {
  return {
    ...SAMPLE_APP_STATE,
    ...overrides,
    providers: overrides?.providers ?? SAMPLE_APP_STATE.providers,
    providerSettings:
      overrides?.providerSettings ?? SAMPLE_APP_STATE.providerSettings,
    settings: overrides?.settings ?? SAMPLE_APP_STATE.settings,
  };
}

describe("popup view models", () => {
  it("keeps every visible provider in popup order even when one needs attention", () => {
    const model = buildPopupViewModel(SAMPLE_APP_STATE);

    expect(model.featuredProviders.map((provider) => provider.providerId)).toEqual([
      "claude-code-team-page",
      "codex-personal-page",
      "cursor-personal-page",
      "gemini-policy",
    ]);
    expect(model.featuredSection.label).toBe("Needs attention");
  });

  it("uses the popup provider order preference for every featured provider", () => {
    const model = buildPopupViewModel({
      ...SAMPLE_APP_STATE,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        providerOrderBySurface: {
          ...SAMPLE_APP_STATE.settings.providerOrderBySurface,
          popup: ["gemini-policy", "codex-personal-page", "claude-code-team-page", "cursor-personal-page", "jetbrains-org-page"],
        },
      },
    });

    expect(model.visibleProviders.map((provider) => provider.providerId)).toEqual([
      "gemini-policy",
      "codex-personal-page",
      "claude-code-team-page",
      "cursor-personal-page",
    ]);
    expect(model.featuredProviders.map((provider) => provider.providerId)).toEqual([
      "gemini-policy",
      "codex-personal-page",
      "claude-code-team-page",
      "cursor-personal-page",
    ]);
  });

  it("aligns popup provider candidates with dashboard visibility toggles", () => {
    const model = buildPopupViewModel({
      ...SAMPLE_APP_STATE,
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) => ({
        ...provider,
        displayEnabled: provider.id === "codex-personal-page",
      })),
    });

    expect(model.visibleProviders.map((provider) => provider.providerId)).toEqual([
      "codex-personal-page",
    ]);
  });

  it("falls back to the first visible providers when everything is healthy", () => {
    const model = buildPopupViewModel({
      ...SAMPLE_APP_STATE,
      providers: SAMPLE_APP_STATE.providers.map((provider) => ({
        ...provider,
        syncStatus: "ok",
        tone: "neutral",
        warningReason: null,
        warningDiagnostic: null,
      })),
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) => ({
        ...provider,
        status: "granted",
      })),
    });

    expect(model.featuredProviders.map((provider) => provider.providerId)).toEqual([
      "codex-personal-page",
      "claude-code-team-page",
      "cursor-personal-page",
      "gemini-policy",
    ]);
  });

  it("keeps low-quota warnings as user status without turning the provider into a product issue", () => {
    const model = buildPopupViewModel({
      ...SAMPLE_APP_STATE,
      providers: SAMPLE_APP_STATE.providers.map((provider) => {
        const baseProvider = {
          ...provider,
          syncedAt: "2026-04-20 10:42",
          lastSyncLabel: "Synced just now",
          syncStatus: "ok" as const,
          tone: "neutral" as const,
          warningReason: null,
          warningDiagnostic: null,
        };

        if (provider.providerId !== "codex-personal-page") {
          return baseProvider;
        }

        return {
          ...baseProvider,
          syncStatus: "warning" as const,
          tone: "warning" as const,
          warningReason: "Weekly usage window is nearly exhausted.",
          warningDiagnostic: createUsageThresholdDiagnostic({
            providerId: "codex-personal-page",
            usageThresholdKind: "threshold_warning",
            rawMessage: "Weekly usage window is nearly exhausted.",
            usagePercent: 96,
            thresholdPercent: 80,
            unitLabel: "percent",
          }),
        };
      }),
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) => ({
        ...provider,
        displayEnabled: [
          "cursor-personal-page",
          "claude-code-team-page",
          "gemini-policy",
          "codex-personal-page",
        ].includes(provider.id),
        status: [
          "cursor-personal-page",
          "claude-code-team-page",
          "gemini-policy",
          "codex-personal-page",
        ].includes(provider.id)
          ? "granted"
          : provider.status,
        credentialStatus:
          provider.id === "gemini-policy" ? "not_required" : "configured",
      })),
    });
    const codexCard = model.featuredProviderCards.find(
      (card) => card.provider.providerId === "codex-personal-page",
    );

    expect(model.featuredSection.label).toBe("All clear");
    expect(model.featuredProviders.map((provider) => provider.providerId)).toEqual([
      "codex-personal-page",
      "claude-code-team-page",
      "cursor-personal-page",
      "gemini-policy",
    ]);
    expect(codexCard).toMatchObject({
      statusLabel: "Warning",
      action: {
        kind: "provider-detail",
        label: "Details",
        providerId: "codex-personal-page",
      },
    });
  });

  it("surfaces mixed cached snapshot freshness in the popup status model", () => {
    const model = buildPopupViewModel(SAMPLE_APP_STATE);

    expect(model.headerDetail).toBe(
      "Settings setup is clear. Use this popup for quick review and freshness triage.",
    );
    expect(model.summaryItems.map((item) => item.label)).toEqual([
      "Visible",
      "Live ready",
      "Setup blockers",
      "Policy-only",
    ]);
    expect(model.snapshotStatus).toMatchObject({
      label: "Mixed state",
      tone: "warning",
      headline: "Synced 2m ago",
      detail:
        "Newest visible snapshot: Cursor Personal (Synced 2m ago). Oldest visible snapshot: Claude Team (Usage page needed).",
    });
    expect(model.showSnapshotStatus).toBe(true);
  });


  it("applies localized summary labels and custom formatting to popup counts", () => {
    const model = buildPopupViewModel(
      SAMPLE_APP_STATE,
      {
        visible: "可见",
        liveReady: "可实时同步",
        setupBlockers: "配置阻塞",
        policyOnly: "仅策略",
      },
      (value) => `#${value}`,
    );

    expect(model.summaryItems.map((item) => item.label)).toEqual([
      "可见",
      "可实时同步",
      "配置阻塞",
      "仅策略",
    ]);
    expect(model.summaryItems.every((item) => item.value.startsWith("#"))).toBe(true);
    expect(model.setupCoverage.items.every((item) => item.value.startsWith("#"))).toBe(true);
  });

  it("marks aligned popup snapshots when visible providers share one fresh state", () => {
    const model = buildPopupViewModel({
      ...SAMPLE_APP_STATE,
      providers: SAMPLE_APP_STATE.providers.map((provider) => ({
        ...provider,
        syncedAt: "2026-04-20 10:42",
        lastSyncLabel: "Synced just now",
        syncStatus: "ok",
        tone: "neutral",
        warningReason: null,
      })),
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) => ({
        ...provider,
        status: provider.displayEnabled ? "granted" : provider.status,
      })),
    });

    expect(model.snapshotStatus).toEqual({
      label: "Aligned",
      tone: "neutral",
      headline: "Synced just now",
      detail: "All 4 visible providers share the same cached snapshot window.",
    });
    expect(model.showSnapshotStatus).toBe(true);
  });

  it("surfaces a start-here guidance card when no visible providers are enabled", () => {
    const model = buildPopupViewModel({
      ...SAMPLE_APP_STATE,
      providers: [],
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) => ({
        ...provider,
        displayEnabled: false,
      })),
    });

    expect(model.guidanceCard).toEqual({
      label: "Start here",
      tone: "warning",
      headline: "Start with Codex in Quick Setup",
      detail:
        "Open Settings > Quick Setup and enable Codex. Then follow the browser-access and usage-page steps before returning here for status triage.",
      action: {
        kind: "settings",
        label: "Open Quick Setup",
        providerId: "codex-personal-page",
      },
    });
    expect(model.firstSetupProvider).toEqual({
      providerId: "codex-personal-page",
      providerLabel: "Codex",
    });
    expect(model.headerDetail).toBe(
      "Start in Settings > Quick Setup with Codex. Once one provider is visible, this popup will summarize live readiness and next steps.",
    );
    expect(model.summaryItems).toEqual([
      {
        label: "Visible",
        value: "0",
        tone: "neutral",
      },
      {
        label: "Live ready",
        value: "0",
        tone: "neutral",
      },
      {
        label: "Setup blockers",
        value: "0",
        tone: "neutral",
      },
      {
        label: "Policy-only",
        value: "0",
        tone: "neutral",
      },
    ]);
    expect(model.featuredSection).toEqual({
      label: "Provider triage",
      headline: "Nothing to triage yet",
      detail:
        "Enable Codex in Settings > Quick Setup first, then this section becomes actionable.",
      emptyStateHeadline: "No provider cards yet",
      emptyStateDetail:
        "Start with Codex, then come back here for one-click provider triage.",
    });
    expect(model.setupCoverage).toEqual({
      label: "Setup coverage",
      statusLabel: "Start setup",
      tone: "warning",
      headline: "No visible providers configured",
      detail:
        "Enable Codex in Settings > Quick Setup first. Then this card will show whether visible providers are live-ready, blocked on setup, or policy-only.",
      items: [
        {
          label: "Live ready",
          value: "0",
          tone: "neutral",
        },
        {
          label: "Host access",
          value: "0",
          tone: "neutral",
        },
        {
          label: "Credentials",
          value: "0",
          tone: "neutral",
        },
        {
          label: "Policy-only",
          value: "0",
          tone: "neutral",
        },
      ],
      action: {
        kind: "settings",
        label: "Open Quick Setup",
        providerId: "codex-personal-page",
      },
    });
    expect(model.actionSection).toEqual({
      label: "Other route",
      detail:
        "The primary next step is above. Use dashboard if you want the broader multi-provider view first.",
      actions: [
        {
          kind: "dashboard",
          label: "Open dashboard",
        },
      ],
    });
    expect(model.surfaceRolesCard).toEqual({
      label: "Surface roles",
      headline: "Settings owns setup",
      detail:
        "Use Settings > Quick Setup to enable Codex, grant host access, and open the usage page. The dashboard becomes useful after at least one provider is visible.",
    });
    expect(model.showSnapshotStatus).toBe(false);
    expect(model.featuredProviders).toEqual([]);
    expect(model.featuredProviderCards).toEqual([]);
  });

  it("keeps the setup-coverage start action localized for no-provider popup states", () => {
    const model = localizePopupViewModel(
      buildPopupViewModel({
        ...SAMPLE_APP_STATE,
        providers: [],
        providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) => ({
          ...provider,
          displayEnabled: false,
        })),
      }),
      createRuntimeI18n("zh-CN"),
    );

    expect(model.setupCoverage.action).toEqual({
      kind: "settings",
      label: "打开快速设置",
      providerId: "codex-personal-page",
    });
    expect(model.setupCoverage.statusLabel).toBe("开始配置");
  });

  it("uses popup-specific featured-card copy when a visible provider still needs host access", () => {
    const model = buildPopupViewModel({
      ...SAMPLE_APP_STATE,
      providers: SAMPLE_APP_STATE.providers.map((provider) => ({
        ...provider,
        syncedAt: "2026-04-20 10:42",
        lastSyncLabel: "Synced just now",
        syncStatus: "ok",
        tone: "neutral",
        warningReason: null,
      })),
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) => ({
        ...provider,
        displayEnabled: provider.id === "cursor-personal-page",
        status: provider.id === "cursor-personal-page" ? "missing" : provider.status,
        credentialStatus:
          provider.id === "cursor-personal-page" ? "configured" : provider.credentialStatus,
      })),
    });

    expect(model.featuredProviderCards[0]).toMatchObject({
      statusLabel: "Needs access",
      metaChips: [
        model.featuredProviders[0].currentSourceContractLabel,
        model.featuredProviders[0].lastSyncLabel,
      ],
      primaryDetail: "Current path is blocked on host access.",
      secondaryDetail: model.featuredProviders[0].hostAccessRequirementDetail,
      action: {
        kind: "settings",
        label: "Open settings",
      },
      secondaryAction: {
        kind: "hide-provider",
        label: "Hide",
        providerId: "cursor-personal-page",
      },
    });
  });

  it("uses direct source-page recovery for shipped session-page source states", () => {
    const warningReason =
      "The open Codex usage page could not be read by the extension. Reload the page, confirm host access, then refresh again.";
    const state = createState({
      providers: SAMPLE_APP_STATE.providers.map((provider) =>
        provider.providerId === "codex-personal-page"
          ? {
              ...provider,
              planName: "Codex Personal Usage Page",
              syncSource: "page_parse",
              syncStatus: "error",
              tone: "error",
              warningReason,
              warningDiagnostic: createPageSessionDiagnostic({
                providerId: "codex-personal-page",
                pageSessionKind: "capture_unavailable",
                rawMessage: warningReason,
              }),
              sourceFallbackReason:
                "Official API unavailable: Codex analytics API key and workspace ID are not both configured.",
              usageWindows: undefined,
              usageBalances: undefined,
              usageSummary: null,
            }
          : provider,
      ),
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) => ({
        ...provider,
        displayEnabled: provider.id === "codex-personal-page",
        status: provider.id === "codex-personal-page" ? "granted" : provider.status,
        sourcePreference:
          provider.id === "codex-personal-page" ? "session_page" : provider.sourcePreference,
      })),
    });
    const model = buildPopupViewModel(state);

    expect(model.featuredProviderCards[0]).toMatchObject({
      statusLabel: "Reload page",
      primaryDetail: "Current page session is open but cannot be read.",
      secondaryDetail: warningReason,
      action: {
        kind: "source-page",
        label: "Open source page",
        providerId: "codex-personal-page",
        sourceStateKind: "capture_unavailable",
      },
    });

    const localizedModel = localizePopupViewModel(
      buildPopupViewModel(state),
      createRuntimeI18n("zh-CN"),
    );

    expect(localizedModel.featuredProviderCards[0]?.action).toEqual({
      kind: "source-page",
      label: "打开来源页面",
      providerId: "codex-personal-page",
      sourceStateKind: "capture_unavailable",
    });
    expect(localizedModel.featuredProviderCards[0]?.secondaryAction).toEqual({
      kind: "hide-provider",
      label: "隐藏",
      providerId: "codex-personal-page",
    });
  });

  it("surfaces compact setup-coverage counts for live-ready, access, credential, and policy-only states", () => {
    const model = buildPopupViewModel({
      ...SAMPLE_APP_STATE,
      providers: SAMPLE_APP_STATE.providers.map((provider) => {
        if (provider.providerId === "claude-code-admin-api") {
          return {
            ...provider,
            syncStatus: "error",
            tone: "error",
            warningReason: "Admin API key required before live sync can run.",
          };
        }

        if (provider.providerId === "codex-personal-page") {
          return {
            ...provider,
            syncStatus: "ok",
            tone: "neutral",
            warningReason: null,
          };
        }

        if (provider.providerId === "cursor-personal-page") {
          return {
            ...provider,
            syncStatus: "ok",
            tone: "neutral",
            warningReason: null,
          };
        }

        return provider;
      }),
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) => {
        if (provider.id === "cursor-personal-page") {
          return {
            ...provider,
            displayEnabled: true,
            status: "missing",
            credentialStatus: "configured",
          };
        }

        if (provider.id === "claude-code-admin-api") {
          return {
            ...provider,
            displayEnabled: true,
            status: "granted",
            credentialStatus: "missing",
          };
        }

        if (provider.id === "codex-personal-page") {
          return {
            ...provider,
            displayEnabled: true,
            status: "granted",
            credentialStatus: "configured",
          };
        }

        if (provider.id === "gemini-policy") {
          return {
            ...provider,
            displayEnabled: true,
            status: "granted",
            credentialStatus: "not_required",
          };
        }

        return {
          ...provider,
          displayEnabled: false,
        };
      }),
    });

    expect(model.setupCoverage).toEqual({
      label: "Setup coverage",
      statusLabel: "Needs setup",
      tone: "warning",
      headline: "4 visible providers",
      detail:
        "Finish settings setup before treating this popup as ready. 1 provider needs host access. 1 provider needs credentials.",
      items: [
        {
          label: "Live ready",
          value: "1",
          tone: "neutral",
        },
        {
          label: "Host access",
          value: "1",
          tone: "warning",
        },
        {
          label: "Credentials",
          value: "1",
          tone: "warning",
        },
        {
          label: "Policy-only",
          value: "1",
          tone: "neutral",
        },
      ],
      action: null,
    });
    expect(model.actionSection).toEqual({
      label: "Other route",
      detail:
        "The primary next step is above. Use dashboard if you want the broader multi-provider view first.",
      actions: [
        {
          kind: "dashboard",
          label: "Open dashboard",
        },
      ],
    });
    expect(model.surfaceRolesCard).toEqual({
      label: "Surface roles",
      headline: "Settings owns setup",
      detail:
        "Use settings for provider toggles, host access, and stored credentials. The popup stays a quick triage layer until setup is clear.",
    });
    expect(model.headerDetail).toBe(
      "Use this popup to separate setup blockers from the providers that are already ready.",
    );
    expect(model.summaryItems).toEqual([
      {
        label: "Visible",
        value: "4",
        tone: "neutral",
      },
      {
        label: "Live ready",
        value: "1",
        tone: "neutral",
      },
      {
        label: "Setup blockers",
        value: "2",
        tone: "warning",
      },
      {
        label: "Policy-only",
        value: "1",
        tone: "neutral",
      },
    ]);
  });

  it("surfaces settings guidance when one visible provider is missing host access", () => {
    const model = buildPopupViewModel({
      ...SAMPLE_APP_STATE,
      providers: SAMPLE_APP_STATE.providers.map((provider) =>
        provider.providerId === "cursor-personal-page"
          ? {
              ...provider,
              syncStatus: "ok",
              tone: "neutral",
              warningReason: null,
            }
          : provider,
      ),
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) =>
        provider.id === "cursor-personal-page"
          ? {
              ...provider,
              status: "missing",
            }
          : provider,
      ),
    });

    expect(model.guidanceCard?.action).toEqual({
      kind: "settings",
      label: "Open settings",
    });
    expect(model.guidanceCard?.headline).toContain("Grant access");
    expect(model.guidanceCard?.tone).toBe("warning");
    expect(model.actionSection).toEqual({
      label: "Other route",
      detail:
        "The primary next step is above. Use dashboard if you want the broader multi-provider view first.",
      actions: [
        {
          kind: "dashboard",
          label: "Open dashboard",
        },
      ],
    });
  });

  it("surfaces settings guidance when one visible provider is blocked on a missing credential", () => {
    const model = buildPopupViewModel({
      ...SAMPLE_APP_STATE,
      providers: SAMPLE_APP_STATE.providers.map((provider) =>
        provider.providerId === "cursor-team-api"
          ? {
              ...provider,
              syncStatus: "error",
              tone: "error",
              warningReason: "Add the required provider credential before live sync can run.",
            }
          : {
              ...provider,
              syncedAt: "2026-04-20 10:42",
              lastSyncLabel: "Synced just now",
              syncStatus: "ok",
              tone: "neutral",
              warningReason: null,
            },
      ),
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) =>
        provider.id === "cursor-team-api"
          ? {
              ...provider,
              displayEnabled: true,
              status: "granted",
              credentialStatus: "missing",
            }
          : {
              ...provider,
              displayEnabled: false,
              status: provider.displayEnabled ? "granted" : provider.status,
              credentialStatus:
                provider.id === "gemini-policy" ? "not_required" : "configured",
            },
      ),
    });

    expect(model.guidanceCard).toEqual({
      label: "Next step",
      tone: "warning",
      headline: "Add credentials for Cursor Team API",
      detail: "Add the required provider credential before live sync can run.",
      action: {
        kind: "settings",
        label: "Open settings",
      },
    });
    expect(model.featuredSection.label).toBe("Needs attention");
    expect(model.actionSection).toEqual({
      label: "Other route",
      detail:
        "The primary next step is above. Use dashboard if you want the broader multi-provider view first.",
      actions: [
        {
          kind: "dashboard",
          label: "Open dashboard",
        },
      ],
    });
    expect(model.surfaceRolesCard).toEqual({
      label: "Surface roles",
      headline: "Settings owns setup",
      detail:
        "Use settings for provider toggles, host access, and stored credentials. The popup stays a quick triage layer until setup is clear.",
    });
    expect(model.featuredProviderCards[0]).toMatchObject({
      statusLabel: "Needs setup",
      metaChips: [
        model.featuredProviders[0].currentSourceContractLabel,
        model.featuredProviders[0].lastSyncLabel,
      ],
      primaryDetail: "Current path still needs stored credentials.",
      secondaryDetail: "Add the required provider credential before live sync can run.",
      action: {
        kind: "settings",
        label: "Open settings",
      },
      secondaryAction: {
        kind: "hide-provider",
        label: "Hide",
        providerId: "cursor-team-api",
      },
    });
  });

  it("omits extra guidance when visible providers are already healthy and actionable", () => {
    const model = buildPopupViewModel({
      ...SAMPLE_APP_STATE,
      providers: SAMPLE_APP_STATE.providers.map((provider) => ({
        ...provider,
        syncedAt: "2026-04-20 10:42",
        lastSyncLabel: "Synced just now",
        syncStatus: "ok",
        tone: "neutral",
        warningReason: null,
        warningDiagnostic: null,
      })),
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) => ({
        ...provider,
        displayEnabled: [
          "cursor-personal-page",
          "claude-code-team-page",
          "gemini-policy",
          "codex-personal-page",
        ].includes(provider.id),
        status: [
          "cursor-personal-page",
          "claude-code-team-page",
          "gemini-policy",
          "codex-personal-page",
        ].includes(provider.id)
          ? "granted"
          : provider.status,
        credentialStatus:
          provider.id === "gemini-policy" ? "not_required" : "configured",
      })),
    });

    expect(model.guidanceCard).toBeNull();
    expect(model.headerDetail).toBe(
      "Use this popup for quick freshness and provider triage without reopening the full dashboard.",
    );
    expect(model.summaryItems).toEqual([
      {
        label: "Visible",
        value: "4",
        tone: "neutral",
      },
      {
        label: "Live ready",
        value: "3",
        tone: "neutral",
      },
      {
        label: "Setup blockers",
        value: "0",
        tone: "neutral",
      },
      {
        label: "Policy-only",
        value: "1",
        tone: "neutral",
      },
    ]);
    expect(model.actionSection).toEqual({
      label: "Quick Actions",
      detail:
        "Open the dashboard for the full multi-provider overview, or jump into settings when you need provider toggles, permissions, or source controls.",
      actions: [
        {
          kind: "dashboard",
          label: "Open dashboard",
        },
        {
          kind: "settings",
          label: "Open settings",
        },
      ],
    });
    expect(model.surfaceRolesCard).toEqual({
      label: "Surface roles",
      headline: "Popup stays quick glance",
      detail:
        "Use dashboard for broader multi-provider context, settings for controls, and provider detail only when you need one provider's deeper contract and health.",
    });
    expect(model.setupCoverage).toEqual({
      label: "Setup coverage",
      statusLabel: "Ready",
      tone: "neutral",
      headline: "4 visible providers",
      detail: "3 providers are live-ready. 1 provider is policy-only.",
      items: [
        {
          label: "Live ready",
          value: "3",
          tone: "neutral",
        },
        {
          label: "Host access",
          value: "0",
          tone: "neutral",
        },
        {
          label: "Credentials",
          value: "0",
          tone: "neutral",
        },
        {
          label: "Policy-only",
          value: "1",
          tone: "neutral",
        },
      ],
      action: null,
    });
    expect(model.featuredSection).toEqual({
      label: "All clear",
      headline: "Healthy providers",
      detail:
        "No visible provider currently needs setup or review, so this section keeps visible providers available for current path and freshness at a glance.",
      emptyStateHeadline: null,
      emptyStateDetail: null,
    });
    expect(model.featuredProviderCards[0]).toMatchObject({
      statusLabel: "Healthy",
      metaChips: [
        model.featuredProviders[0].currentSourceContractLabel,
        model.featuredProviders[0].lastSyncLabel,
      ],
      primaryDetail: "Current path is live-ready in this profile.",
      secondaryDetail: "Weekly usage window: 41% remaining",
      action: {
        kind: "provider-detail",
        label: "Details",
        providerId: model.featuredProviders[0].providerId,
      },
    });
  });

  it("builds circular usage progress for structured popup provider cards", () => {
    const longUsageSummary =
      "Visible Codex usage: 5-hour usage window: 100% remaining · Weekly usage window: 32% remaining · GPT-5.3-Codex-Spark 每周使用限额: 100% remaining · Flex credit balance: 0 credits";
    const model = buildPopupViewModel(
      {
        ...SAMPLE_APP_STATE,
        providers: SAMPLE_APP_STATE.providers.map((provider) =>
          provider.providerId === "codex-personal-page"
            ? {
              ...provider,
              planName: "Codex Personal Usage Page (Weekly usage window)",
              quotaUnit: "percent" as const,
              quotaWindow: "rolling" as const,
              used: 68,
              remaining: 32,
              total: 100,
              resetAt: "2026-04-29 04:00",
              resetLabel: "Resets in 4 days",
              syncSource: "page_parse" as const,
              syncStatus: "ok" as const,
              tone: "neutral" as const,
              warningReason: null,
              lastSyncLabel: "Synced just now",
              usageSummary: longUsageSummary,
              usageWindows: [
                {
                  label: "5-hour usage window",
                  normalizedLabel: "5-hour usage window",
                  kind: "rolling_5h" as const,
                  modelLabel: null,
                  quotaUnit: "percent" as const,
                  used: 0,
                  remaining: 100,
                  total: 100,
                  resetAt: "2026-04-25 17:00",
                  resetLabel: "Resets soon",
                },
                {
                  label: "Weekly usage window",
                  normalizedLabel: "Weekly usage window",
                  kind: "weekly" as const,
                  modelLabel: null,
                  quotaUnit: "percent" as const,
                  used: 68,
                  remaining: 32,
                  total: 100,
                  resetAt: "2026-04-29 04:00",
                  resetLabel: "Resets in 4 days",
                },
              ],
              usageBalances: [
                {
                  label: "Flex credit balance",
                  normalizedLabel: "Flex credit balance",
                  kind: "flex_credit_balance" as const,
                  quotaUnit: "credits" as const,
                  remaining: 0,
                  total: null,
                  detail: null,
                },
              ],
              }
            : provider,
        ),
        providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) => ({
          ...provider,
          displayEnabled: provider.id === "codex-personal-page",
          status: provider.id === "codex-personal-page" ? "granted" : provider.status,
          credentialStatus:
            provider.id === "codex-personal-page" ? "missing" : provider.credentialStatus,
        })),
        settings: {
          ...SAMPLE_APP_STATE.settings,
          providerOrderBySurface: {
            ...SAMPLE_APP_STATE.settings.providerOrderBySurface,
            popup: ["codex-personal-page", "claude-code-team-page", "gemini-policy", "cursor-personal-page", "jetbrains-org-page"],
          },
        },
      },
      undefined,
      undefined,
      undefined,
      ["claude-code-team-page", "gemini-policy", "cursor-personal-page"],
    );
    const localizedModel = localizePopupViewModel(
      model,
      createRuntimeI18n("zh-CN"),
    );

    const codexCard = model.featuredProviderCards.find(
      (card) => card.provider.providerId === "codex-personal-page",
    );
    const localizedCodexCard = localizedModel.featuredProviderCards.find(
      (card) => card.provider.providerId === "codex-personal-page",
    );

    expect(codexCard?.usageProgressCircles).toEqual([
      {
        label: "5-hour usage window",
        valueLabel: "100%",
        ariaLabel: "5-hour usage window: 100% remaining",
        remainingPercent: 100,
        tone: "neutral",
      },
      {
        label: "Weekly usage window",
        valueLabel: "32%",
        ariaLabel: "Weekly usage window: 32% remaining",
        remainingPercent: 32,
        tone: "warning",
      },
    ]);
    expect(codexCard?.secondaryDetail).not.toBe(
      longUsageSummary,
    );
    expect(localizedCodexCard?.usageProgressCircles[1]).toEqual(
      {
        label: "Weekly usage window",
        valueLabel: "32%",
        ariaLabel: "Weekly usage window: 32% 剩余",
        remainingPercent: 32,
        tone: "warning",
      },
    );
  });

  it("keeps summary-only personal usage context visible in popup provider cards", () => {
    const cursorUsageSummary =
      "Visible Cursor usage: Billing period: Mar 23 - Apr 21 · Visible plans: Pro · Pro+ · Ultra · CSV export available";
    const model = buildPopupViewModel(
      {
        ...SAMPLE_APP_STATE,
        providers: SAMPLE_APP_STATE.providers.map((provider) =>
          provider.providerId === "cursor-personal-page"
            ? {
              ...provider,
              syncStatus: "ok" as const,
              tone: "neutral" as const,
              warningReason: null,
              usageWindows: undefined,
              usageBalances: undefined,
              usageSummary: cursorUsageSummary,
              }
            : provider,
        ),
        providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) => ({
          ...provider,
          displayEnabled: provider.id === "cursor-personal-page",
          status: provider.id === "cursor-personal-page" ? "granted" : provider.status,
        })),
        settings: {
          ...SAMPLE_APP_STATE.settings,
          providerOrderBySurface: {
            ...SAMPLE_APP_STATE.settings.providerOrderBySurface,
            popup: ["cursor-personal-page", "claude-code-team-page", "codex-personal-page", "gemini-policy", "jetbrains-org-page"],
          },
        },
      },
      undefined,
      undefined,
      undefined,
      ["claude-code-team-page", "codex-personal-page", "gemini-policy"],
    );

    const cursorCard = model.featuredProviderCards.find(
      (card) => card.provider.providerId === "cursor-personal-page",
    );

    expect(cursorCard?.secondaryDetail).toBe(
      cursorUsageSummary,
    );
  });

  it("switches the featured section to policy-only language when every visible provider is policy-only", () => {
    const model = buildPopupViewModel({
      ...SAMPLE_APP_STATE,
      providers: SAMPLE_APP_STATE.providers
        .filter((provider) => provider.providerId === "gemini-policy")
        .map((provider) => ({
          ...provider,
          syncedAt: "2026-04-20 10:42",
          lastSyncLabel: "Synced just now",
          syncStatus: "ok",
          tone: "neutral",
          warningReason: null,
        })),
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) => ({
        ...provider,
        displayEnabled: provider.id === "gemini-policy",
        status: provider.id === "gemini-policy" ? "granted" : provider.status,
      })),
    });

    expect(model.guidanceCard).toEqual({
      label: "Current contract",
      tone: "neutral",
      headline: "Visible providers are policy-only",
      detail:
        "The popup can still summarize shared cached state, but these visible providers do not expose one live in-browser usage path in this profile. Open settings to review the current provider contracts and source controls.",
      action: {
        kind: "settings",
        label: "Open settings",
      },
    });
    expect(model.headerDetail).toBe(
      "This popup is showing current contract context rather than one live in-browser sync path.",
    );
    expect(model.summaryItems).toEqual([
      {
        label: "Visible",
        value: "1",
        tone: "neutral",
      },
      {
        label: "Live ready",
        value: "0",
        tone: "neutral",
      },
      {
        label: "Setup blockers",
        value: "0",
        tone: "neutral",
      },
      {
        label: "Policy-only",
        value: "1",
        tone: "neutral",
      },
    ]);
    expect(model.actionSection).toEqual({
      label: "Other route",
      detail:
        "The primary next step is above. Use dashboard if you want the broader multi-provider view first.",
      actions: [
        {
          kind: "dashboard",
          label: "Open dashboard",
        },
      ],
    });
    expect(model.surfaceRolesCard).toEqual({
      label: "Surface roles",
      headline: "Settings owns contract controls",
      detail:
        "Use settings to review provider contracts, source preference, and page-source controls. Dashboard stays the broader multi-provider context.",
    });
    expect(model.showSnapshotStatus).toBe(true);
    expect(model.snapshotStatus).toEqual({
      label: "Aligned",
      tone: "neutral",
      headline: "Synced just now",
      detail: "The visible provider shares the same cached snapshot window.",
    });
    expect(model.setupCoverage).toEqual({
      label: "Setup coverage",
      statusLabel: "Contract-only",
      tone: "neutral",
      headline: "1 visible provider",
      detail:
        "Visible providers are configured, but their current contract is policy-only rather than one live in-browser path.",
      items: [
        {
          label: "Live ready",
          value: "0",
          tone: "warning",
        },
        {
          label: "Host access",
          value: "0",
          tone: "neutral",
        },
        {
          label: "Credentials",
          value: "0",
          tone: "neutral",
        },
        {
          label: "Policy-only",
          value: "1",
          tone: "neutral",
        },
      ],
      action: null,
    });
    expect(model.featuredSection).toEqual({
      label: "Current contract",
      headline: "Policy-only providers",
      detail:
        "No visible provider exposes one live in-browser path in this profile, so these cards stay contract-focused instead of action-focused.",
      emptyStateHeadline: null,
      emptyStateDetail: null,
    });
    expect(model.featuredProviderCards[0]).toMatchObject({
      statusLabel: "Contract-only",
      metaChips: [
        model.featuredProviders[0].currentSourceContractLabel,
        model.featuredProviders[0].lastSyncLabel,
      ],
      primaryDetail: "Current contract is policy-only in this profile.",
      secondaryDetail: model.featuredProviders[0].currentSourceAvailabilitySummary,
      action: {
        kind: "settings",
        label: "Open settings",
      },
      secondaryAction: {
        kind: "hide-provider",
        label: "Hide",
        providerId: "gemini-policy",
      },
    });
  });

  it("marks setup coverage as needs review when setup is clear but one provider still has in-product issues", () => {
    const model = buildPopupViewModel({
      ...SAMPLE_APP_STATE,
      providers: SAMPLE_APP_STATE.providers.map((provider) => {
        if (provider.providerId === "claude-code-team-page") {
          return {
            ...provider,
            syncStatus: "error",
            tone: "error",
            warningReason: "Live sync still needs one provider-specific review.",
            warningDiagnostic: null,
          };
        }

        return {
          ...provider,
          syncedAt: "2026-04-20 10:42",
          lastSyncLabel: "Synced just now",
          syncStatus: "ok",
          tone: "neutral",
          warningReason: null,
          warningDiagnostic: null,
        };
      }),
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) => ({
        ...provider,
        displayEnabled: [
          "cursor-personal-page",
          "claude-code-team-page",
          "gemini-policy",
          "codex-personal-page",
        ].includes(provider.id),
        status: [
          "cursor-personal-page",
          "claude-code-team-page",
          "gemini-policy",
          "codex-personal-page",
        ].includes(provider.id)
          ? "granted"
          : provider.status,
        credentialStatus:
          provider.id === "gemini-policy" ? "not_required" : "configured",
      })),
    });

    expect(model.setupCoverage).toEqual({
      label: "Setup coverage",
      statusLabel: "Needs review",
      tone: "error",
      headline: "4 visible providers",
      detail:
        "Settings setup is clear, but 1 provider still needs in-product review after setup.",
      items: [
        {
          label: "Live ready",
          value: "2",
          tone: "neutral",
        },
        {
          label: "Host access",
          value: "0",
          tone: "neutral",
        },
        {
          label: "Credentials",
          value: "0",
          tone: "neutral",
        },
        {
          label: "Policy-only",
          value: "1",
          tone: "neutral",
        },
      ],
      action: null,
    });
    expect(model.headerDetail).toBe(
      "Settings setup is clear. Use this popup for quick review and freshness triage.",
    );
    expect(model.summaryItems).toEqual([
      {
        label: "Visible",
        value: "4",
        tone: "neutral",
      },
      {
        label: "Live ready",
        value: "2",
        tone: "neutral",
      },
      {
        label: "Setup blockers",
        value: "0",
        tone: "neutral",
      },
      {
        label: "Policy-only",
        value: "1",
        tone: "neutral",
      },
    ]);
    expect(model.guidanceCard).toEqual({
      label: "Next step",
      tone: "error",
      headline: "Review Claude Team",
      detail: "Live sync still needs one provider-specific review.",
      action: {
        kind: "provider-detail",
        label: "Open detail",
        providerId: "claude-code-team-page",
      },
    });
    expect(model.actionSection).toEqual({
      label: "Secondary actions",
      detail:
        "The primary next step is above. Use dashboard or settings if you need a broader surface.",
      actions: [
        {
          kind: "dashboard",
          label: "Open dashboard",
        },
        {
          kind: "settings",
          label: "Open settings",
        },
      ],
    });
    expect(model.surfaceRolesCard).toEqual({
      label: "Surface roles",
      headline: "Provider detail owns review",
      detail:
        "Use provider detail for one provider's current path and health after setup is already clear. Dashboard stays the broader multi-provider surface.",
    });
    expect(model.featuredProviderCards[0]).toMatchObject({
      statusLabel: "Needs review",
      metaChips: [
        model.featuredProviders[0].currentSourceContractLabel,
        model.featuredProviders[0].lastSyncLabel,
      ],
      primaryDetail:
        "Settings setup is clear, but this provider still needs review.",
      secondaryDetail: "Live sync still needs one provider-specific review.",
      action: {
        kind: "provider-detail",
        label: "Review",
        providerId: "claude-code-team-page",
      },
      secondaryAction: {
        kind: "hide-provider",
        label: "Hide",
        providerId: "claude-code-team-page",
      },
    });
  });

  it("localizes popup explanatory copy for the zh-CN pilot rollout", () => {
    const i18n = createRuntimeI18n("zh-CN");
    const model = localizePopupViewModel(
      buildPopupViewModel({
        ...SAMPLE_APP_STATE,
        providers: [],
        providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) => ({
          ...provider,
          displayEnabled: false,
        })),
      }),
      i18n,
    );

    expect(model.guidanceCard).toEqual({
      label: "从这里开始",
      tone: "warning",
      headline: "先在快速设置里配置 Codex",
      detail:
        "打开 Settings > 快速设置，先启用 Codex。之后按提示完成浏览器授权和使用页面，再回来做状态分诊。",
      action: {
        kind: "settings",
        label: "打开快速设置",
        providerId: "codex-personal-page",
      },
    });
    expect(model.setupCoverage).toEqual({
      label: "配置覆盖面",
      statusLabel: "开始配置",
      tone: "warning",
      headline: "还没有可见 provider 已配置",
      detail:
        "先在 Settings > 快速设置里启用 Codex。之后这张卡会显示当前可见 provider 是 live-ready、被配置阻塞，还是仅策略。",
      items: [
        {
          label: "可实时同步",
          value: "0",
          tone: "neutral",
        },
        {
          label: "Host access",
          value: "0",
          tone: "neutral",
        },
        {
          label: "凭据",
          value: "0",
          tone: "neutral",
        },
        {
          label: "仅策略",
          value: "0",
          tone: "neutral",
        },
      ],
      action: {
        kind: "settings",
        label: "打开快速设置",
        providerId: "codex-personal-page",
      },
    });
    expect(model.actionSection).toEqual({
      label: "其他入口",
      detail:
        "主要下一步已经在上面。若你想先看更完整的多 provider 视图，再去 dashboard。",
      actions: [
        {
          kind: "dashboard",
          label: "打开仪表板",
        },
      ],
    });
    expect(model.surfaceRolesCard).toEqual({
      label: "Surface roles",
      headline: "Settings 负责配置",
      detail:
        "用 Settings > 快速设置启用 Codex、授予 host access、打开使用页面。至少有一个 provider 可见之后，dashboard 才真正开始有意义。",
    });
    expect(model.featuredSection).toEqual({
      label: "Provider 分诊",
      headline: "还没有可分诊内容",
      detail:
        "先在 Settings > 快速设置里启用 Codex，之后这里才会变得可操作。",
      emptyStateHeadline: "还没有 provider 卡片",
      emptyStateDetail:
        "先从 Codex 开始，再回来做一键 provider 分诊。",
    });
  });

  it("localizes popup freshness labels for the zh-CN pilot rollout", () => {
    const i18n = createRuntimeI18n("zh-CN");
    const model = localizePopupViewModel(buildPopupViewModel(SAMPLE_APP_STATE), i18n);

    expect(model.snapshotStatus.headline).toBe("2分钟前同步");
    expect(model.snapshotStatus.detail).toContain("Usage page needed");
    expect(model.featuredProviderCards[0]?.metaChips[1]).toBe("Usage page needed");
  });
});
