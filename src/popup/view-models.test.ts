import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../shared/constants";
import { createRuntimeI18n } from "../shared/i18n";
import { buildPopupViewModel, localizePopupViewModel } from "./view-models";

describe("popup view models", () => {
  it("prioritizes providers needing attention in the compact popup list", () => {
    const model = buildPopupViewModel(SAMPLE_APP_STATE);

    expect(model.featuredProviders.map((provider) => provider.providerId)).toEqual([
      "claude-code",
      "codex",
      "gemini",
    ]);
    expect(model.featuredSection.label).toBe("Needs attention");
  });

  it("falls back to the first visible providers when everything is healthy", () => {
    const model = buildPopupViewModel({
      ...SAMPLE_APP_STATE,
      providers: SAMPLE_APP_STATE.providers.map((provider) => ({
        ...provider,
        syncStatus: "ok",
        tone: "neutral",
        warningReason: null,
      })),
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) => ({
        ...provider,
        status: "granted",
      })),
    });

    expect(model.featuredProviders.map((provider) => provider.providerId)).toEqual([
      "claude-code",
      "codex",
      "cursor",
    ]);
  });

  it("surfaces mixed cached snapshot freshness in the popup status model", () => {
    const model = buildPopupViewModel(SAMPLE_APP_STATE);

    expect(model.headerDetail).toBe(
      "Use this popup for quick freshness and provider triage without reopening the full dashboard.",
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
        "Newest visible snapshot: Cursor (Synced 2m ago). Oldest visible snapshot: Claude Code (Analytics snapshot 34m ago).",
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
        status: provider.enabled ? "granted" : provider.status,
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
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) => ({
        ...provider,
        enabled: false,
      })),
    });

    expect(model.guidanceCard).toEqual({
      label: "Start here",
      tone: "warning",
      headline: "Enable a provider in settings",
      detail:
        "The popup only becomes useful after at least one provider is visible. Start in settings, then return here for one-click status and attention triage.",
      action: {
        kind: "settings",
        label: "Open settings",
      },
    });
    expect(model.headerDetail).toBe(
      "Start in settings. Once one provider is visible, this popup will summarize live readiness and next steps.",
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
        "This section becomes actionable after at least one provider is visible in settings.",
      emptyStateHeadline: "No provider cards yet",
      emptyStateDetail:
        "Enable one provider in settings, then come back here for one-click provider triage.",
    });
    expect(model.setupCoverage).toEqual({
      label: "Setup coverage",
      statusLabel: "Start setup",
      tone: "warning",
      headline: "No visible providers configured",
      detail:
        "Enable one provider in settings first. Then this card will show whether visible providers are live-ready, blocked on setup, or policy-only.",
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
        "Use settings to enable providers, grant host access, and add credentials. The dashboard becomes useful after at least one provider is visible.",
    });
    expect(model.showSnapshotStatus).toBe(false);
    expect(model.featuredProviders).toEqual([]);
    expect(model.featuredProviderCards).toEqual([]);
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
        enabled: provider.id === "cursor",
        status: provider.id === "cursor" ? "missing" : provider.status,
        credentialStatus:
          provider.id === "cursor" ? "configured" : provider.credentialStatus,
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
    });
  });

  it("surfaces compact setup-coverage counts for live-ready, access, credential, and policy-only states", () => {
    const model = buildPopupViewModel({
      ...SAMPLE_APP_STATE,
      providers: SAMPLE_APP_STATE.providers.map((provider) => {
        if (provider.providerId === "claude-code") {
          return {
            ...provider,
            syncStatus: "error",
            tone: "error",
            warningReason: "Admin API key required before live sync can run.",
          };
        }

        if (provider.providerId === "codex") {
          return {
            ...provider,
            syncStatus: "ok",
            tone: "neutral",
            warningReason: null,
          };
        }

        if (provider.providerId === "cursor") {
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
        if (provider.id === "cursor") {
          return {
            ...provider,
            enabled: true,
            status: "missing",
            credentialStatus: "configured",
          };
        }

        if (provider.id === "claude-code") {
          return {
            ...provider,
            enabled: true,
            status: "granted",
            credentialStatus: "missing",
          };
        }

        if (provider.id === "codex") {
          return {
            ...provider,
            enabled: true,
            status: "granted",
            credentialStatus: "configured",
          };
        }

        if (provider.id === "gemini") {
          return {
            ...provider,
            enabled: true,
            status: "granted",
            credentialStatus: "not_required",
          };
        }

        return {
          ...provider,
          enabled: false,
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
        provider.providerId === "cursor"
          ? {
              ...provider,
              syncStatus: "ok",
              tone: "neutral",
              warningReason: null,
            }
          : provider,
      ),
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) =>
        provider.id === "cursor"
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
        provider.providerId === "claude-code"
          ? {
              ...provider,
              syncStatus: "error",
              tone: "error",
              warningReason: "Admin API key required before live sync can run.",
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
        provider.id === "claude-code"
          ? {
              ...provider,
              credentialStatus: "missing",
            }
          : {
              ...provider,
              enabled: provider.id !== "jetbrains",
              status: provider.enabled ? "granted" : provider.status,
              credentialStatus:
                provider.id === "gemini" ? "not_required" : "configured",
            },
      ),
    });

    expect(model.guidanceCard).toEqual({
      label: "Next step",
      tone: "warning",
      headline: "Add credentials for Claude Code",
      detail: "Admin API key required before live sync can run.",
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
      secondaryDetail: "Admin API key required before live sync can run.",
      action: {
        kind: "settings",
        label: "Open settings",
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
      })),
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) => ({
        ...provider,
        enabled: provider.id !== "jetbrains",
        status: provider.enabled ? "granted" : provider.status,
        credentialStatus:
          provider.id === "gemini" ? "not_required" : "configured",
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
    });
    expect(model.featuredSection).toEqual({
      label: "All clear",
      headline: "Healthy providers",
      detail:
        "No visible provider currently needs setup or review, so this section keeps the top providers visible for current path and freshness at a glance.",
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
      secondaryDetail: model.featuredProviders[0].currentSourceAvailabilitySummary,
      action: {
        kind: "provider-detail",
        label: "Open detail",
        providerId: model.featuredProviders[0].providerId,
      },
    });
  });

  it("compresses structured personal usage context for popup provider cards", () => {
    const longUsageSummary =
      "Visible Codex usage: 5-hour usage window: 100% remaining · Weekly usage window: 32% remaining · GPT-5.3-Codex-Spark 每周使用限额: 100% remaining · Flex credit balance: 0 credits";
    const model = buildPopupViewModel({
      ...SAMPLE_APP_STATE,
      providers: SAMPLE_APP_STATE.providers.map((provider) =>
        provider.providerId === "codex"
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
        enabled: provider.id === "codex",
        status: provider.id === "codex" ? "granted" : provider.status,
        credentialStatus:
          provider.id === "codex" ? "missing" : provider.credentialStatus,
      })),
    });
    const localizedModel = localizePopupViewModel(
      model,
      createRuntimeI18n("zh-CN"),
    );

    expect(model.featuredProviderCards[0]?.secondaryDetail).toBe(
      "Weekly usage window: 32% remaining · Flex credit balance: 0 credits",
    );
    expect(model.featuredProviderCards[0]?.secondaryDetail).not.toBe(
      longUsageSummary,
    );
    expect(localizedModel.featuredProviderCards[0]?.secondaryDetail).toBe(
      "Weekly usage window: 32% 剩余 · Flex credit balance: 0 积分",
    );
  });

  it("keeps summary-only personal usage context visible in popup provider cards", () => {
    const cursorUsageSummary =
      "Visible Cursor usage: Billing period: Mar 23 - Apr 21 · Visible plans: Pro · Pro+ · Ultra · CSV export available";
    const model = buildPopupViewModel({
      ...SAMPLE_APP_STATE,
      providers: SAMPLE_APP_STATE.providers.map((provider) =>
        provider.providerId === "cursor"
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
        enabled: provider.id === "cursor",
        status: provider.id === "cursor" ? "granted" : provider.status,
      })),
    });

    expect(model.featuredProviderCards[0]?.secondaryDetail).toBe(
      cursorUsageSummary,
    );
  });

  it("switches the featured section to policy-only language when every visible provider is policy-only", () => {
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
        enabled: provider.id === "gemini",
        status: provider.id === "gemini" ? "granted" : provider.status,
      })),
    });

    expect(model.guidanceCard).toEqual({
      label: "Current contract",
      tone: "neutral",
      headline: "Visible providers are policy-only",
      detail:
        "The popup can still summarize shared cached state, but these visible providers do not expose one live in-browser usage path in this profile. Use dashboard and settings to review the current provider contracts.",
      action: {
        kind: "dashboard",
        label: "Open dashboard",
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
        "The primary next step is above. Use settings when you need provider toggles, permissions, or stored credentials.",
      actions: [
        {
          kind: "settings",
          label: "Open settings",
        },
      ],
    });
    expect(model.surfaceRolesCard).toEqual({
      label: "Surface roles",
      headline: "Dashboard owns contract review",
      detail:
        "Use dashboard for broader contract context across visible providers. Settings still owns provider controls and stored credentials.",
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
        kind: "dashboard",
        label: "Open dashboard",
      },
    });
  });

  it("marks setup coverage as needs review when setup is clear but one provider still has in-product issues", () => {
    const model = buildPopupViewModel({
      ...SAMPLE_APP_STATE,
      providers: SAMPLE_APP_STATE.providers.map((provider) => {
        if (provider.providerId === "claude-code") {
          return {
            ...provider,
            syncStatus: "error",
            tone: "error",
            warningReason: "Live sync still needs one provider-specific review.",
          };
        }

        return {
          ...provider,
          syncedAt: "2026-04-20 10:42",
          lastSyncLabel: "Synced just now",
          syncStatus: "ok",
          tone: "neutral",
          warningReason: null,
        };
      }),
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) => ({
        ...provider,
        enabled: provider.id !== "jetbrains",
        status: provider.id !== "jetbrains" ? "granted" : provider.status,
        credentialStatus:
          provider.id === "gemini" ? "not_required" : "configured",
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
      headline: "Review Claude Code",
      detail: "Live sync still needs one provider-specific review.",
      action: {
        kind: "provider-detail",
        label: "Open detail",
        providerId: "claude-code",
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
        label: "Review detail",
        providerId: "claude-code",
      },
    });
  });

  it("localizes popup explanatory copy for the zh-CN pilot rollout", () => {
    const i18n = createRuntimeI18n("zh-CN");
    const model = localizePopupViewModel(
      buildPopupViewModel({
        ...SAMPLE_APP_STATE,
        providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) => ({
          ...provider,
          enabled: false,
        })),
      }),
      i18n,
    );

    expect(model.guidanceCard).toEqual({
      label: "从这里开始",
      tone: "warning",
      headline: "先在设置里启用一个 provider",
      detail:
        "至少有一个 provider 可见之后，这个 popup 才真正有用。先去设置里启用，再回来做一键状态检查和分诊。",
      action: {
        kind: "settings",
        label: "打开设置",
      },
    });
    expect(model.setupCoverage).toEqual({
      label: "配置覆盖面",
      statusLabel: "开始配置",
      tone: "warning",
      headline: "还没有可见 provider 已配置",
      detail:
        "先在设置里启用一个 provider。之后这张卡会显示当前可见 provider 是 live-ready、被配置阻塞，还是仅策略。",
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
        "用 settings 启用 provider、授予 host access、补充凭据。至少有一个 provider 可见之后，dashboard 才真正开始有意义。",
    });
    expect(model.featuredSection).toEqual({
      label: "Provider 分诊",
      headline: "还没有可分诊内容",
      detail:
        "至少有一个 provider 在设置里可见之后，这个区域才会变得可操作。",
      emptyStateHeadline: "还没有 provider 卡片",
      emptyStateDetail:
        "先在设置里启用一个 provider，再回来做一键 provider 分诊。",
    });
  });

  it("localizes popup freshness labels for the zh-CN pilot rollout", () => {
    const i18n = createRuntimeI18n("zh-CN");
    const model = localizePopupViewModel(buildPopupViewModel(SAMPLE_APP_STATE), i18n);

    expect(model.snapshotStatus.headline).toBe("2分钟前同步");
    expect(model.snapshotStatus.detail).toContain("34分钟前的分析快照");
    expect(model.featuredProviderCards[0]?.metaChips[1]).toBe("34分钟前的分析快照");
  });
});
