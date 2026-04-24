import type { PermissionStatus, ProviderTone, SyncStatus } from "../providers/types";
import type { RuntimeI18n } from "./i18n";

function formatProviderCount(i18n: RuntimeI18n, count: number) {
  if (i18n.resolvedLocale === "zh-CN") {
    return `${i18n.formatNumber(count)} 个 provider`;
  }

  return `${i18n.formatNumber(count)} ${count === 1 ? "provider" : "providers"}`;
}

export function buildPopupLocalizedCopy(i18n: RuntimeI18n) {
  if (i18n.resolvedLocale === "zh-CN") {
    return {
      snapshotStatus: {
        noProvidersLabel: "没有 provider",
        noProvidersHeadline: "没有可见 provider",
        noProvidersDetail:
          "这里还没有可共享的 popup 快照。先启用一个 provider，这里才会开始缓存状态。",
        syncIssueLabel: "同步异常",
        mixedStateLabel: "状态混合",
        alignedLabel: "已对齐",
        alignedSingleDetail:
          "当前可见 provider 共享同一个缓存快照窗口。",
        alignedManyDetail: (count: number) =>
          `全部 ${i18n.formatNumber(count)} 个可见 provider 共享同一个缓存快照窗口。`,
        mixedDetail: (
          newestProviderLabel: string,
          newestSyncLabel: string,
          oldestProviderLabel: string,
          oldestSyncLabel: string,
        ) =>
          `最新的可见快照：${newestProviderLabel}（${newestSyncLabel}）。最旧的可见快照：${oldestProviderLabel}（${oldestSyncLabel}）。`,
      },
      guidance: {
        startHereLabel: "从这里开始",
        nextStepLabel: "下一步",
        currentContractLabel: "当前合同",
        enableProviderHeadline: "先在设置里启用一个 provider",
        enableProviderDetail:
          "至少有一个 provider 可见之后，这个 popup 才真正有用。先去设置里启用，再回来做一键状态检查和分诊。",
        grantAccessSingleHeadline: (providerLabel: string) =>
          `为 ${providerLabel} 授权访问`,
        grantAccessManyHeadline: "先在设置里授予 host access",
        singleMissingAccessDetail: (
          providerLabel: string,
          detail: string,
        ) =>
          detail ||
          `${providerLabel} 仍然缺少可选 host access，所以 popup 还不能显示健康的 live 状态。`,
        multipleMissingAccessDetail: (count: number) =>
          `${formatProviderCount(i18n, count)} 仍然缺少可选 host access，popup 还不能收敛到一个健康且对齐的快照。`,
        addCredentialsSingleHeadline: (providerLabel: string) =>
          `为 ${providerLabel} 补充凭据`,
        addCredentialsManyHeadline: "先在设置里补充凭据",
        singleMissingCredentialDetail: (
          providerLabel: string,
          detail: string,
        ) =>
          detail ||
          `${providerLabel} 当前路径仍然缺少已存凭据，所以 live sync 还跑不起来。`,
        multipleMissingCredentialDetail: (count: number) =>
          `${formatProviderCount(i18n, count)} 仍然依赖缺失的已存凭据，它们的当前 live 路径还不能稳定运行。`,
        reviewProviderHeadline: (providerLabel: string) =>
          `复查 ${providerLabel}`,
        policyOnlyHeadline: "当前可见 provider 都是仅策略路径",
        policyOnlyDetail:
          "popup 仍然可以汇总共享缓存状态，但当前 profile 里这些可见 provider 都没有 live in-browser usage path。请到 dashboard 和 settings 查看当前 provider 合同。",
        openDetail: "打开详情",
        reviewDetail: "复查详情",
      },
      featuredSection: {
        providerTriageLabel: "Provider 分诊",
        nothingToTriageHeadline: "还没有可分诊内容",
        actionableAfterVisibleDetail:
          "至少有一个 provider 在设置里可见之后，这个区域才会变得可操作。",
        noProviderCardsYetHeadline: "还没有 provider 卡片",
        enableProviderComeBackDetail:
          "先在设置里启用一个 provider，再回来做一键 provider 分诊。",
        needsAttentionLabel: "需要关注",
        featuredProvidersHeadline: "重点 provider",
        needsAttentionDetail:
          "popup 最多显示 3 个 provider，并优先展示仍需配置或仍需在产品内复查的 provider。",
        currentContractLabel: "当前合同",
        policyOnlyProvidersHeadline: "仅策略 provider",
        policyOnlyProvidersDetail:
          "当前 profile 里没有可见 provider 暴露 live in-browser path，所以这些卡片会更偏向合同说明，而不是动作引导。",
        allClearLabel: "状态正常",
        healthyProvidersHeadline: "健康 provider",
        healthyProvidersDetail:
          "当前没有可见 provider 需要配置或复查，所以这里主要保留顶部 provider 的当前路径和 freshness 上下文。",
      },
      featuredCard: {
        statusNeedsAccess: "需授权",
        statusNeedsSetup: "需配置",
        statusOpenPage: "打开页面",
        statusSignIn: "重新登录",
        statusNeedsReview: "需复查",
        statusContractOnly: "仅合同",
        statusHealthy: "健康",
        statusWarning: "告警",
        statusSyncIssue: "同步异常",
        primaryBlockedHostAccess: "当前路径被 host access 阻塞。",
        primaryNeedsCredentials: "当前路径仍然需要已存凭据。",
        primaryNeedsLivePage: "当前路径仍然需要活跃页面会话。",
        primaryNeedsSignedInPage: "当前路径需要重新拿到已登录页面。",
        primaryNeedsReview: "设置已经就绪，但这个 provider 仍需复查。",
        primaryPolicyOnly: "当前合同在这个 profile 里是仅策略。",
        primaryLiveReady: "当前路径在这个 profile 里已经可以 live-ready。",
        reviewDetailAction: "复查详情",
        openDetailAction: "打开详情",
      },
      setupCoverage: {
        label: "配置覆盖面",
        liveReadyItemLabel: "可实时同步",
        hostAccessItemLabel: "Host access",
        credentialsItemLabel: "凭据",
        policyOnlyItemLabel: "仅策略",
        statusStartSetup: "开始配置",
        statusNeedsSetup: "需要配置",
        statusNeedsReview: "需要复查",
        statusContractOnly: "仅合同",
        statusReady: "已就绪",
        noVisibleHeadline: "还没有可见 provider 已配置",
        noVisibleDetail:
          "先在设置里启用一个 provider。之后这张卡会显示当前可见 provider 是 live-ready、被配置阻塞，还是仅策略。",
        visibleProvidersHeadline: (count: number) =>
          `${formatProviderCount(i18n, count)} 可见`,
        needsSetupDetail: (sentence: string) =>
          `在把这个 popup 当成 ready 之前，先完成设置配置。${sentence}`,
        needsReviewDetail: (count: number) =>
          `设置配置已经清楚，但还有 ${formatProviderCount(i18n, count)} 需要在产品内继续复查。`,
        contractOnlyDetail:
          "可见 provider 已经配置完成，但它们当前的合同仍然是仅策略，而不是 live in-browser path。",
        mixedReadyPolicyDetail: (liveReadyCount: number, policyOnlyCount: number) =>
          `${formatProviderCount(i18n, liveReadyCount)} 已 live-ready。${formatProviderCount(i18n, policyOnlyCount)} 为仅策略。`,
        readyDetail:
          "这里已经看不到设置层面的阻塞。用下面的摘要确认 live-ready 和 policy-only 的覆盖情况。",
        buildSetupBlockerSentence: (
          providersNeedingAccessCount: number,
          providersNeedingCredentialsCount: number,
        ) => {
          const parts: string[] = [];

          if (providersNeedingAccessCount > 0) {
            parts.push(`${formatProviderCount(i18n, providersNeedingAccessCount)} 还需要 host access。`);
          }

          if (providersNeedingCredentialsCount > 0) {
            parts.push(`${formatProviderCount(i18n, providersNeedingCredentialsCount)} 还需要凭据。`);
          }

          return parts.join(" ");
        },
      },
      header: {
        noVisible:
          "先去设置开始。只要有一个 provider 可见，这个 popup 就会开始汇总 live readiness 和下一步。",
        needsSetup:
          "用这个 popup 把配置阻塞和已经 ready 的 provider 分开看。",
        contractOnly:
          "这个 popup 当前展示的是合同上下文，而不是 live in-browser sync 路径。",
        needsReview:
          "设置已经清楚。用这个 popup 做快速 freshness 和 provider 分诊。",
        ready:
          "用这个 popup 快速查看 freshness 和 provider 分诊，不必重新打开完整 dashboard。",
      },
      actionSection: {
        quickActionsLabel: "快捷动作",
        otherRouteLabel: "其他入口",
        secondaryActionsLabel: "次级动作",
        detailDashboardFirst:
          "主要下一步已经在上面。若你想先看更完整的多 provider 视图，再去 dashboard。",
        detailSettingsFirst:
          "主要下一步已经在上面。若你需要 provider 开关、权限或已存凭据，再去 settings。",
        detailBroaderSurface:
          "主要下一步已经在上面。若你需要更大的工作面，再去 dashboard 或 settings。",
      },
      surfaceRoles: {
        label: "Surface roles",
        settingsOwnsSetupHeadline: "Settings 负责配置",
        settingsOwnsSetupNoVisibleDetail:
          "用 settings 启用 provider、授予 host access、补充凭据。至少有一个 provider 可见之后，dashboard 才真正开始有意义。",
        settingsOwnsSetupDetail:
          "把 settings 用在 provider 开关、host access 和已存凭据上。在配置清楚之前，popup 仍然只是快速分诊层。",
        dashboardOwnsContractReviewHeadline: "Dashboard 负责合同复查",
        dashboardOwnsContractReviewDetail:
          "用 dashboard 看跨 provider 的更大合同上下文；settings 仍然负责 provider 控制和已存凭据。",
        providerDetailOwnsReviewHeadline: "Provider detail 负责复查",
        providerDetailOwnsReviewDetail:
          "当设置已经清楚后，用 provider detail 查看单个 provider 的当前路径和健康；dashboard 仍然是更广的多 provider 面。",
        popupQuickGlanceHeadline: "Popup 保持快速概览",
        popupQuickGlanceDetail:
          "dashboard 负责更广的多 provider 上下文，settings 负责控制面，只有在你需要看单个 provider 更深的合同和健康时才进入 provider detail。",
      },
      aria: {
        setupCoverage: "Popup 配置覆盖面",
        featuredProviders: "Popup 重点 provider",
      },
    } as const;
  }

  return {
    snapshotStatus: {
      noProvidersLabel: "No providers",
      noProvidersHeadline: "No visible providers",
      noProvidersDetail:
        "No shared popup snapshot exists yet. Enable one provider to start caching state here.",
      syncIssueLabel: "Sync issue",
      mixedStateLabel: "Mixed state",
      alignedLabel: "Aligned",
      alignedSingleDetail:
        "The visible provider shares the same cached snapshot window.",
      alignedManyDetail: (count: number) =>
        `All ${i18n.formatNumber(count)} visible providers share the same cached snapshot window.`,
      mixedDetail: (
        newestProviderLabel: string,
        newestSyncLabel: string,
        oldestProviderLabel: string,
        oldestSyncLabel: string,
      ) =>
        `Newest visible snapshot: ${newestProviderLabel} (${newestSyncLabel}). Oldest visible snapshot: ${oldestProviderLabel} (${oldestSyncLabel}).`,
    },
    guidance: {
      startHereLabel: "Start here",
      nextStepLabel: "Next step",
      currentContractLabel: "Current contract",
      enableProviderHeadline: "Enable a provider in settings",
      enableProviderDetail:
        "The popup only becomes useful after at least one provider is visible. Start in settings, then return here for one-click status and attention triage.",
      grantAccessSingleHeadline: (providerLabel: string) =>
        `Grant access for ${providerLabel}`,
      grantAccessManyHeadline: "Grant host access in settings",
      singleMissingAccessDetail: (_providerLabel: string, detail: string) =>
        detail,
      multipleMissingAccessDetail: (count: number) =>
        `${formatProviderCount(i18n, count)} still need optional host access before the popup can settle into one aligned healthy snapshot.`,
      addCredentialsSingleHeadline: (providerLabel: string) =>
        `Add credentials for ${providerLabel}`,
      addCredentialsManyHeadline: "Add credentials in settings",
      singleMissingCredentialDetail: (_providerLabel: string, detail: string) =>
        detail,
      multipleMissingCredentialDetail: (count: number) =>
        `${formatProviderCount(i18n, count)} still depend on missing stored credentials before their current live path can run cleanly.`,
      reviewProviderHeadline: (providerLabel: string) =>
        `Review ${providerLabel}`,
      policyOnlyHeadline: "Visible providers are policy-only",
      policyOnlyDetail:
        "The popup can still summarize shared cached state, but these visible providers do not expose one live in-browser usage path in this profile. Use dashboard and settings to review the current provider contracts.",
      openDetail: "Open detail",
      reviewDetail: "Review detail",
    },
    featuredSection: {
      providerTriageLabel: "Provider triage",
      nothingToTriageHeadline: "Nothing to triage yet",
      actionableAfterVisibleDetail:
        "This section becomes actionable after at least one provider is visible in settings.",
      noProviderCardsYetHeadline: "No provider cards yet",
      enableProviderComeBackDetail:
        "Enable one provider in settings, then come back here for one-click provider triage.",
      needsAttentionLabel: "Needs attention",
      featuredProvidersHeadline: "Featured providers",
      needsAttentionDetail:
        "The popup shows up to three providers, preferring the ones that still need setup or in-product review.",
      currentContractLabel: "Current contract",
      policyOnlyProvidersHeadline: "Policy-only providers",
      policyOnlyProvidersDetail:
        "No visible provider exposes one live in-browser path in this profile, so these cards stay contract-focused instead of action-focused.",
      allClearLabel: "All clear",
      healthyProvidersHeadline: "Healthy providers",
      healthyProvidersDetail:
        "No visible provider currently needs setup or review, so this section keeps the top providers visible for current path and freshness at a glance.",
    },
    featuredCard: {
      statusNeedsAccess: "Needs access",
      statusNeedsSetup: "Needs setup",
      statusOpenPage: "Open page",
      statusSignIn: "Sign in",
      statusNeedsReview: "Needs review",
      statusContractOnly: "Contract-only",
      statusHealthy: "Healthy",
      statusWarning: "Warning",
      statusSyncIssue: "Sync issue",
      primaryBlockedHostAccess: "Current path is blocked on host access.",
      primaryNeedsCredentials: "Current path still needs stored credentials.",
      primaryNeedsLivePage: "Current path still needs a live page session.",
      primaryNeedsSignedInPage: "Current path needs the signed-in page again.",
      primaryNeedsReview: "Settings setup is clear, but this provider still needs review.",
      primaryPolicyOnly: "Current contract is policy-only in this profile.",
      primaryLiveReady: "Current path is live-ready in this profile.",
      reviewDetailAction: "Review detail",
      openDetailAction: "Open detail",
    },
    setupCoverage: {
      label: "Setup coverage",
      liveReadyItemLabel: "Live ready",
      hostAccessItemLabel: "Host access",
      credentialsItemLabel: "Credentials",
      policyOnlyItemLabel: "Policy-only",
      statusStartSetup: "Start setup",
      statusNeedsSetup: "Needs setup",
      statusNeedsReview: "Needs review",
      statusContractOnly: "Contract-only",
      statusReady: "Ready",
      noVisibleHeadline: "No visible providers configured",
      noVisibleDetail:
        "Enable one provider in settings first. Then this card will show whether visible providers are live-ready, blocked on setup, or policy-only.",
      visibleProvidersHeadline: (count: number) =>
        `${i18n.formatNumber(count)} visible ${count === 1 ? "provider" : "providers"}`,
      needsSetupDetail: (sentence: string) =>
        `Finish settings setup before treating this popup as ready. ${sentence}`,
      needsReviewDetail: (count: number) =>
        `Settings setup is clear, but ${formatProviderCount(i18n, count)} still need in-product review after setup.`,
      contractOnlyDetail:
        "Visible providers are configured, but their current contract is policy-only rather than one live in-browser path.",
      mixedReadyPolicyDetail: (liveReadyCount: number, policyOnlyCount: number) =>
        `${formatProviderCount(i18n, liveReadyCount)} are live-ready. ${formatProviderCount(i18n, policyOnlyCount)} are policy-only.`,
      readyDetail:
        "No settings setup blockers are visible here. Use the grid below to confirm live-ready versus policy-only coverage.",
      buildSetupBlockerSentence: (
        providersNeedingAccessCount: number,
        providersNeedingCredentialsCount: number,
      ) => {
        const parts: string[] = [];

        if (providersNeedingAccessCount > 0) {
          parts.push(`${formatProviderCount(i18n, providersNeedingAccessCount)} ${providersNeedingAccessCount === 1 ? "needs" : "need"} host access.`);
        }

        if (providersNeedingCredentialsCount > 0) {
          parts.push(`${formatProviderCount(i18n, providersNeedingCredentialsCount)} ${providersNeedingCredentialsCount === 1 ? "needs" : "need"} credentials.`);
        }

        return parts.join(" ");
      },
    },
    header: {
      noVisible:
        "Start in settings. Once one provider is visible, this popup will summarize live readiness and next steps.",
      needsSetup:
        "Use this popup to separate setup blockers from the providers that are already ready.",
      contractOnly:
        "This popup is showing current contract context rather than one live in-browser sync path.",
      needsReview:
        "Settings setup is clear. Use this popup for quick review and freshness triage.",
      ready:
        "Use this popup for quick freshness and provider triage without reopening the full dashboard.",
    },
    actionSection: {
      quickActionsLabel: "Quick Actions",
      otherRouteLabel: "Other route",
      secondaryActionsLabel: "Secondary actions",
      detailDashboardFirst:
        "The primary next step is above. Use dashboard if you want the broader multi-provider view first.",
      detailSettingsFirst:
        "The primary next step is above. Use settings when you need provider toggles, permissions, or stored credentials.",
      detailBroaderSurface:
        "The primary next step is above. Use dashboard or settings if you need a broader surface.",
    },
    surfaceRoles: {
      label: "Surface roles",
      settingsOwnsSetupHeadline: "Settings owns setup",
      settingsOwnsSetupNoVisibleDetail:
        "Use settings to enable providers, grant host access, and add credentials. The dashboard becomes useful after at least one provider is visible.",
      settingsOwnsSetupDetail:
        "Use settings for provider toggles, host access, and stored credentials. The popup stays a quick triage layer until setup is clear.",
      dashboardOwnsContractReviewHeadline: "Dashboard owns contract review",
      dashboardOwnsContractReviewDetail:
        "Use dashboard for broader contract context across visible providers. Settings still owns provider controls and stored credentials.",
      providerDetailOwnsReviewHeadline: "Provider detail owns review",
      providerDetailOwnsReviewDetail:
        "Use provider detail for one provider's current path and health after setup is already clear. Dashboard stays the broader multi-provider surface.",
      popupQuickGlanceHeadline: "Popup stays quick glance",
      popupQuickGlanceDetail:
        "Use dashboard for broader multi-provider context, settings for controls, and provider detail only when you need one provider's deeper contract and health.",
    },
    aria: {
      setupCoverage: "Popup setup coverage",
      featuredProviders: "Popup featured providers",
    },
  };
}

export function buildProviderDetailLocalizedCopy(i18n: RuntimeI18n) {
  if (i18n.resolvedLocale === "zh-CN") {
    return {
      topbarSubtitle: "当前 provider source 快照",
      openDetailTabTitle: (providerLabel: string) => `打开 ${providerLabel} 详情标签页`,
      sections: {
        syncStatus: "同步状态",
        providerDetail: "Provider 详情",
        usage: "用量",
      },
      badges: {
        needsAccess: "需授权",
        healthy: "健康",
        warning: "告警",
        syncIssue: "同步异常",
      },
      fieldLabels: {
        plan: "计划",
        status: "状态",
        quotaModel: "配额模型",
        used: "已用",
        remaining: "剩余",
        resetTime: "重置时间",
        sourcePreference: "来源偏好",
        syncSource: "同步来源",
        productContract: "产品合同",
        sessionPageContract: "Session-page 合同",
        graduationGate: "Graduation gate",
        sessionPageGate: "Session-page gate",
        sourceFidelity: "来源保真度",
        sourceState: "来源状态",
        usedValueFidelity: "已用值保真度",
        remainingValueFidelity: "剩余值保真度",
        resetValueFidelity: "重置值保真度",
        availabilitySummary: "可用性摘要",
        accessModel: "访问模型",
        credentialPersistence: "凭据持久化",
        cookieStorage: "Cookie 存储",
        manualCookieImport: "手动 Cookie 导入",
        hostAccessRequirement: "Host access 要求",
        pageBinding: "页面绑定",
        bindingMode: "绑定模式",
        selectionReason: "选择原因",
        fallbackReason: "回退原因",
        sourceNote: "来源说明",
        lastSync: "最后同步",
        hostAccess: "Host access",
        hosts: "Hosts",
        fallbackPath: "回退路径",
      },
      notes: {
        accessStatus: "访问状态",
        accessStatusDetail:
          "这个 provider 目前缺少 host access。在授予所需 host 权限之前，后续 live sync 可能会失败。",
        sourceState: "来源状态",
        sourceFidelity: "来源保真度",
        productContract: "产品合同",
        graduationGatePrefix: "Graduation gate: ",
        sessionPageTrackPrefix: "Session-page track: ",
        sessionPageGatePrefix: "Session-page gate: ",
        trustBoundary: "信任边界",
        pageBinding: "页面绑定",
        warningReason: "告警原因",
      },
      values: {
        granted: "已授权",
        missing: "缺失",
        unknown: "未知",
        notAvailableFromSource: "当前来源不可用",
        unknownUsageWindowPercentage: "未知 usage-window 百分比",
        usedAndRemaining: (used: string, remaining: string) =>
          `已用 ${used} · 剩余 ${remaining}`,
        usedOnly: (used: string) => `已用 ${used}`,
        remainingOnly: (remaining: string) => `剩余 ${remaining}`,
        tracked: (used: string, quotaUnit: string) => `已跟踪 ${used} ${quotaUnit}`,
        unknownOfTotal: (total: string, quotaUnit: string) => `未知 / ${total} ${quotaUnit}`,
        unknownQuotaUnit: (quotaUnit: string) => `未知 ${quotaUnit}`,
      },
      heroDetail:
        "这个详情页反映的是当前 dashboard 和 refresh flow 正在使用的标准化 provider 快照，包括 side panel 中显示的 source fidelity 和 product-contract 语义。",
      progressLabel: (providerLabel: string) => `${providerLabel} usage ratio`,
    } as const;
  }

  return {
    topbarSubtitle: "Current provider source snapshot",
    openDetailTabTitle: (providerLabel: string) => `Open ${providerLabel} detail tab`,
    sections: {
      syncStatus: "Sync Status",
      providerDetail: "Provider Detail",
      usage: "Usage",
    },
    badges: {
      needsAccess: "Needs access",
      healthy: "Healthy",
      warning: "Warning",
      syncIssue: "Sync issue",
    },
    fieldLabels: {
      plan: "Plan",
      status: "Status",
      quotaModel: "Quota model",
      used: "Used",
      remaining: "Remaining",
      resetTime: "Reset time",
      sourcePreference: "Source preference",
      syncSource: "Sync source",
      productContract: "Product contract",
      sessionPageContract: "Session-page contract",
      graduationGate: "Graduation gate",
      sessionPageGate: "Session-page gate",
      sourceFidelity: "Source fidelity",
      sourceState: "Source state",
      usedValueFidelity: "Used value fidelity",
      remainingValueFidelity: "Remaining value fidelity",
      resetValueFidelity: "Reset value fidelity",
      availabilitySummary: "Availability summary",
      accessModel: "Access model",
      credentialPersistence: "Credential persistence",
      cookieStorage: "Cookie storage",
      manualCookieImport: "Manual cookie import",
      hostAccessRequirement: "Host access requirement",
      pageBinding: "Page binding",
      bindingMode: "Binding mode",
      selectionReason: "Selection reason",
      fallbackReason: "Fallback reason",
      sourceNote: "Source note",
      lastSync: "Last sync",
      hostAccess: "Host access",
      hosts: "Hosts",
      fallbackPath: "Fallback path",
    },
    notes: {
      accessStatus: "Access status",
      accessStatusDetail:
        "Host access is missing for this provider. Future live syncs may fail until the required host permissions are granted.",
      sourceState: "Source state",
      sourceFidelity: "Source fidelity",
      productContract: "Product contract",
      graduationGatePrefix: "Graduation gate: ",
      sessionPageTrackPrefix: "Session-page track: ",
      sessionPageGatePrefix: "Session-page gate: ",
      trustBoundary: "Trust boundary",
      pageBinding: "Page binding",
      warningReason: "Warning reason",
    },
    values: {
      granted: "Granted",
      missing: "Missing",
      unknown: "Unknown",
      notAvailableFromSource: "Not available from this source",
      unknownUsageWindowPercentage: "Unknown usage-window percentage",
      usedAndRemaining: (used: string, remaining: string) => `${used} used · ${remaining} remaining`,
      usedOnly: (used: string) => `${used} used`,
      remainingOnly: (remaining: string) => `${remaining} remaining`,
      tracked: (used: string, quotaUnit: string) => `${used} ${quotaUnit} tracked`,
      unknownOfTotal: (total: string, quotaUnit: string) => `Unknown / ${total} ${quotaUnit}`,
      unknownQuotaUnit: (quotaUnit: string) => `Unknown ${quotaUnit}`,
    },
    heroDetail:
      "This detail view reflects the normalized provider snapshot currently used by the dashboard and refresh flow, including the source fidelity and product-contract semantics shown in the side panel.",
    progressLabel: (providerLabel: string) => `${providerLabel} usage ratio`,
  };
}

export function getProviderDetailStatusBadgeLabel(
  permissionStatus: PermissionStatus,
  displaySyncStatus: SyncStatus,
  copy: ReturnType<typeof buildProviderDetailLocalizedCopy>,
) {
  if (permissionStatus === "missing") {
    return copy.badges.needsAccess;
  }

  if (displaySyncStatus === "ok") {
    return copy.badges.healthy;
  }

  return displaySyncStatus === "warning"
    ? copy.badges.warning
    : copy.badges.syncIssue;
}

export function getPermissionStatusLabel(
  permissionStatus: PermissionStatus,
  copy: ReturnType<typeof buildProviderDetailLocalizedCopy>,
) {
  return permissionStatus === "granted" ? copy.values.granted : copy.values.missing;
}
