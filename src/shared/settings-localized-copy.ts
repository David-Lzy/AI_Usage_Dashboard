import type {
  ProviderSourceKind,
  ProviderSourcePreference,
  SettingsUserLevel,
} from "../providers/types";
import type { RuntimeI18n } from "./i18n";
import {
  buildLocalizedSettingsCredentialsSection,
  getSettingsCredentialsCopy,
} from "./settings-credentials-localized-copy";
import {
  getSettingsColorChoiceCopy,
  getSettingsPreferenceGroupsCopy,
} from "./settings-color-choice-localized-copy";
import {
  buildLocalizedSettingsCoreSections,
  getSettingsCoreCopy,
} from "./settings-core-localized-copy";
import { getSettingsConfigurationBackupCopy } from "./settings-configuration-backup-localized-copy";
import {
  buildLocalizedSettingsProgressItemsSection,
  getSettingsProgressItemsCopy,
} from "./settings-progress-items-localized-copy";
import {
  buildLocalizedSettingsProgressAppearanceSection,
  getSettingsProgressAppearanceCopy,
} from "./settings-progress-appearance-localized-copy";
import {
  buildLocalizedSettingsProviderOrderSection,
  getSettingsProviderOrderCopy,
} from "./settings-provider-order-localized-copy";
import {
  buildLocalizedSettingsSourcePermissionsSections,
  getSettingsSourcePermissionsCopy,
} from "./settings-source-permissions-localized-copy";

export function buildSettingsLocalizedCopy(i18n: RuntimeI18n) {
  const progressItems = buildLocalizedSettingsProgressItemsSection(
    i18n,
    getSettingsProgressItemsCopy(i18n.resolvedLocale),
  );
  const progressAppearance = buildLocalizedSettingsProgressAppearanceSection(
    i18n,
    getSettingsProgressAppearanceCopy(i18n.resolvedLocale),
  );
  const providerOrder = buildLocalizedSettingsProviderOrderSection(
    i18n,
    getSettingsProviderOrderCopy(i18n.resolvedLocale),
  );
  const colorChoices = getSettingsColorChoiceCopy(i18n.resolvedLocale);
  const preferenceGroups = getSettingsPreferenceGroupsCopy(i18n.resolvedLocale);
  const configurationBackup = getSettingsConfigurationBackupCopy(
    i18n.resolvedLocale,
  );

  if (i18n.resolvedLocale === "zh-CN") {
    return {
      layout: {
        sectionsAria: "设置分区",
        sections: {
          overview: "概览",
          quickSetup: "快速设置",
          appearance: "外观与同步",
          advanced: "高级",
        },
        overview: {
          aria: "设置概览",
          eyebrow: "设置概览",
          title: "先完成个人账户的常用设置",
          detail:
            "大多数个人用户只需要快速设置、语言/主题和同步频率。切换下面的模式，可以决定这里展示多少高级配置与诊断信息。",
        },
        summary: {
          enabled: "已启用",
          connected: "已连接",
          needsAction: "待处理",
          storedSecrets: "已存密钥",
          boundPages: "已绑定页面",
        },
        userLevel: {
          label: "显示级别",
          helpText:
            "普通模式只显示常用设置。高级、开发者和 Debug 会逐步展示团队/API 配置、来源控制和更深的诊断信息。",
          options: {
            basic: "普通",
            advanced: "高级",
            developer: "开发者",
            debug: "Debug",
          } as Record<SettingsUserLevel, string>,
        },
        advanced: {
          eyebrow: "高级",
          title: "团队 / API / 来源控制",
          detail:
            "只在你需要团队或企业配置、来源偏好和页面绑定管理时再展开这里。",
          show: "展开高级设置",
          hide: "收起高级设置",
          itemCount: (count: number) => `${i18n.formatNumber(count)} 组`,
        },
      },
      quickSetup: {
        eyebrow: "快速设置",
        title: "按 Provider 完成常用连接",
        detail:
          "这里优先处理个人账户最常见的动作：启用 Provider、授予浏览器访问、打开使用页面，以及确认当前是否已经连通。",
        currentSetupLabel: "当前方式",
        nextStepLabel: "推荐下一步",
        visibilityLabel: "显示到仪表板",
        pageStatusLabel: "页面状态",
        noActionNeeded: "当前不需要额外操作",
        disabledProvidersSummary: (count: number) =>
          `更多 Provider（${i18n.formatNumber(count)}）`,
        hideDisabledProviders: "收起更多 Provider",
        showTeamApiProviders: "显示团队 / API Provider",
        hideTeamApiProviders: "隐藏团队 / API Provider",
        firstProvider: {
          eyebrow: "建议第一步",
          statusLabel: "推荐",
          title: (providerLabel: string) => `先配置 ${providerLabel}`,
          detail: (providerLabel: string) =>
            `先启用 ${providerLabel}。之后这里会继续引导浏览器授权、打开使用页面，以及确认是否已经连通。也可以在下方更多 Provider 里选择别的。`,
          action: (providerLabel: string) => `启用 ${providerLabel}`,
          moreHint: "想换一个工具？展开下方更多 Provider。",
        },
        currentSetup: {
          disabled: "已关闭",
          sessionPage: "已登录使用页面",
          savedConnection: "已存团队 / API 配置",
          policyOnly: "仅文档化策略",
        },
        helperText: {
          disabled: "启用后，这个 Provider 才会回到仪表板和刷新流程里。",
          readySessionPage:
            "这个 Provider 会使用当前浏览器里已登录的使用页面做同步。",
          readyCredential:
            "这个 Provider 会使用当前浏览器 profile 里保存的团队或企业配置做同步。",
          policyOnly:
            "这个 Provider 当前只展示文档化限制，不会假装提供实时个人用量。",
          hostAccessMissing: (hostsLabel: string) =>
            `继续之前，需要允许扩展访问 ${hostsLabel}。`,
          credentialMissingBasic:
            "如果你确实需要团队或企业 API 路径，请先切到高级模式再配置。",
          credentialMissingAdvanced:
            "如果你需要团队或企业 API 路径，请在下面的高级配置里补齐凭据。",
          openPageRequired: "先打开这个 Provider 的使用页面，再回来刷新。",
          loggedOut: "先打开这个 Provider 的使用页面并重新登录。",
          captureUnavailable:
            "页面已经打开，但当前会话无法读取，先重开页面再试一次。",
          syncError: "上一次同步没有成功，建议先回到来源页面重试。",
        },
        actions: {
          enableProvider: "启用 Provider",
          disableProvider: "隐藏 Provider",
          grantAccess: "授予访问",
          openUsagePage: "打开使用页面",
          openAndSignIn: "打开页面并登录",
          retryPage: "重试当前页面",
          openSourcePage: "打开来源页面",
          useCurrentPage: "使用当前页面",
          disconnectPage: "断开页面",
        },
      },
      preferences: {
        showMore: "更多",
        hideMore: "收起更多",
        detail:
          "应用语言、Popup 形态和各个 surface 的额度样式都收在这里，需要时再展开。",
      },
      configurationBackup,
      themeCustomization: {
        previewingSeed: (seed: string, mode: "light" | "dark") =>
          `正在为当前${mode === "dark" ? "夜间" : "白天"}配色预览 ${seed}。应用之后会把 accent preset 切到 Custom Seed。`,
        customSeedMissing:
          "当前已选 Custom Seed，但还没有可用的已存 seed。在你应用有效的 #RRGGBB 之前，默认 accent roles 会继续生效。",
        enterValidSeed:
          "输入有效的 #RRGGBB 值，即可生成自定义 accent 配色，无需进入原始 token 编辑。",
      },
      credentials: {
        sectionLabel: "Provider 凭据",
        configured: "已配置",
        missing: "缺失",
        saveKey: "保存密钥",
        clearStoredKey: "清除已存密钥",
        saveConfig: "保存配置",
        clearStoredConfig: "清除已存配置",
        adminApiKeyLabel: "管理 API 密钥",
        analyticsApiKeyLabel: "Analytics API 密钥",
        workspaceIdLabel: "Workspace ID",
        cursorTitle: "Cursor Team Admin API key",
        cursorHelpText:
          "只会保存在当前浏览器 profile 的扩展本地存储里。可选：如果你要走 team-admin API path 就配置它；如果你只打算用已登录的 personal usage page，也可以留空。",
        cursorFooterText:
          "仅限 team-admin scope。配置后，请求会从 background worker 发往 `https://api.cursor.com` 并使用 Basic auth。personal usage-page sync 不需要这个 key。",
        cursorPlaceholderMissing: "粘贴 Cursor Admin API key",
        cursorPlaceholderConfigured: "已在本地配置。输入新的 key 可替换旧值。",
        claudeTitle: "Claude Code Analytics Admin API key",
        claudeHelpText:
          "只会保存在当前浏览器 profile 的扩展本地存储里。当前支持的 v1 Claude organization analytics path 需要它。",
        claudeFooterText:
          "仅限 Admin API scope。请求会从 background worker 发往 `https://api.anthropic.com/v1/organizations/usage_report/claude_code`，并携带 `x-api-key` 与 `anthropic-version` headers。",
        claudePlaceholderMissing: "粘贴 Anthropic Admin API key",
        claudePlaceholderConfigured: "已在本地配置。输入新的 key 可替换旧值。",
        codexTitle: "Codex Enterprise analytics 配置",
        codexHelpText:
          "只会保存在当前浏览器 profile 的扩展本地存储里。这是可选项，只在你需要 Enterprise analytics path 时才需要。personal Codex usage-page sync 不需要 analytics key 或 workspace ID。",
        codexFooterText:
          "只有在你要使用 Enterprise workspace path 时，才需要配置面向 Codex analytics 的 Platform API key 和 ChatGPT admin console 里的 workspace ID。请求会发往 `https://api.chatgpt.com/v1/analytics/codex`。",
        codexAnalyticsPlaceholderMissing: "粘贴 Codex analytics API key",
        codexAnalyticsPlaceholderConfigured:
          "已在本地配置。输入新的 analytics key 可替换旧值。",
        codexWorkspacePlaceholderMissing: "粘贴 Codex workspace ID",
        codexWorkspacePlaceholderConfigured:
          "已在本地配置。输入新的 workspace ID 可替换旧值。",
      },
      sources: {
        preferenceLabel: "偏好",
        operationalNoteLabel: "你需要知道",
        sessionPageTrackLabel: "Session-page 轨道",
        sessionPageNoteLabel: "Session-page 说明",
        findOrOpenPage: "查找或打开页面",
        useActivePage: "使用当前页面",
        extensionModeOnly: "仅扩展模式",
        disconnectBinding: "断开绑定",
        detailedDiagnostics: "详细诊断",
        compactFields: {
          currentSetup: "当前方式",
          setupStatus: "状态",
          pageStatus: "页面状态",
          pageRoute: "页面入口",
        },
        compactCurrentSetup: {
          sessionPage: "已登录使用页面",
          savedConnection: "已存团队 / API 配置",
          policyOnly: "仅文档化策略",
        },
        itemCount: (count: number) => `${i18n.formatNumber(count)} 项`,
        routeFallback: "从 provider settings 打开",
        sourcePreferenceLabels: {
          auto: "自动",
          official_api: "官方 API",
          session_page: "会话页面",
        } as Record<ProviderSourcePreference, string>,
        sourceKindLabels: {
          official_api: "官方 API",
          session_page: "会话页面",
          policy_only: "仅策略",
        } as Record<ProviderSourceKind, string>,
        cardLabels: {
          primary: {
            accessModel: "访问模型",
            availabilitySummary: "可用性摘要",
            fallback: "回退",
            noneFallback: "无",
            route: "Route",
            availability: "可用性",
            graduationGate: "Graduation gate",
            selectionReason: "选择原因",
            fallbackReason: "回退原因",
            selectionDiagnostic: "选择诊断",
            selectionDiagnosticSummary: "选择摘要",
            fallbackDiagnostic: "回退诊断",
            fallbackDiagnosticSummary: "回退摘要",
            diagnostic: "诊断",
            diagnosticSummary: "诊断摘要",
            readinessDetail: "就绪详情",
            fidelityDetail: "保真度详情",
            usedValue: "已用值",
            remainingValue: "剩余值",
            resetValue: "重置值",
            credentialPersistence: "凭据持久化",
            cookieStorage: "Cookie 存储",
            manualCookieImport: "手动 Cookie 导入",
            hostAccess: "Host access",
            pageBinding: "页面绑定",
            bindingMode: "绑定模式",
            bindingDetail: "绑定详情",
          },
          groups: {
            sourceDecision: "来源决策",
            valueSemantics: "值语义",
            trustBoundary: "信任边界",
          },
          notes: {
            graduationGatePrefix: "Graduation gate: ",
          },
        },
      },
      permissions: {
        noHostAccessRequired: "无需 host access",
        hostAccessGranted: "Host access 已授权",
        hostAccessMissing: "缺少 host access",
        noActionNeeded: "无需操作",
        removeAccess: "移除授权",
        requestAccess: "请求授权",
      },
      providerOrder,
      progressItems,
      progressAppearance,
      colorChoices,
      preferenceGroups,
    };
  }

  const englishCopy = {
    layout: {
      sectionsAria: "Settings sections",
      sections: {
        overview: "Overview",
        quickSetup: "Quick Setup",
        appearance: "Appearance & Sync",
        advanced: "Advanced",
      },
      overview: {
        aria: "Settings overview",
        eyebrow: "Settings overview",
        title: "Start with the personal-account path",
        detail:
          "Most personal users only need Quick Setup, language/theme, and sync controls. Switch the mode below to decide how much team/API setup and diagnostics are shown.",
      },
      summary: {
        enabled: "Enabled",
        connected: "Connected",
        needsAction: "Needs action",
        storedSecrets: "Stored secrets",
        boundPages: "Bound pages",
      },
        userLevel: {
          label: "Display level",
          helpText:
            "Basic mode keeps Settings focused on the common path. Advanced, Developer, and Debug progressively reveal team/API setup, source controls, and deeper diagnostics.",
          options: {
            basic: "Basic",
            advanced: "Advanced",
            developer: "Developer",
            debug: "Debug",
          } as Record<SettingsUserLevel, string>,
        },
      advanced: {
        eyebrow: "Advanced",
        title: "Team / API / source controls",
        detail:
          "Open this only when you need team or enterprise configuration, source preference changes, or page-binding management.",
        show: "Show advanced settings",
        hide: "Hide advanced settings",
        itemCount: (count: number) => `${i18n.formatNumber(count)} groups`,
      },
    },
    quickSetup: {
      eyebrow: "Quick setup",
      title: "Set up providers the normal-user way",
      detail:
        "This section focuses on the common personal-account tasks: enabling a provider, granting browser access, opening the usage page, and checking whether the provider is already connected.",
      currentSetupLabel: "Current setup",
      nextStepLabel: "Recommended next step",
      visibilityLabel: "Show on dashboard",
      pageStatusLabel: "Page status",
      noActionNeeded: "No extra action needed right now",
      disabledProvidersSummary: (count: number) =>
        `More providers (${i18n.formatNumber(count)})`,
      hideDisabledProviders: "Hide more providers",
      showTeamApiProviders: "Show team/API providers",
      hideTeamApiProviders: "Hide team/API providers",
      firstProvider: {
        eyebrow: "Suggested first step",
        statusLabel: "Recommended",
        title: (providerLabel: string) => `Start with ${providerLabel}`,
        detail: (providerLabel: string) =>
          `Enable ${providerLabel} first. Quick Setup will then walk through browser access, the usage page, and whether the provider is connected. You can choose a different provider under More providers.`,
        action: (providerLabel: string) => `Enable ${providerLabel}`,
        moreHint: "Prefer another tool? Open More providers below.",
      },
      currentSetup: {
        disabled: "Turned off",
        sessionPage: "Signed-in usage page",
        savedConnection: "Saved team / API config",
        policyOnly: "Documented policy only",
      },
      helperText: {
        disabled:
          "Turn this provider on when you want it back in the dashboard and refresh flow.",
        readySessionPage:
          "This provider syncs from a usage page that is already signed in on this browser.",
        readyCredential:
          "This provider syncs from team or enterprise configuration saved on this browser profile.",
        policyOnly:
          "This provider currently shows documented limits only and does not pretend to have live personal usage.",
        hostAccessMissing: (hostsLabel: string) =>
          `Browser access to ${hostsLabel} is required before live sync can continue.`,
        credentialMissingBasic:
          "If you really need the team or enterprise API path, switch to Advanced mode first.",
        credentialMissingAdvanced:
          "If you need the team or enterprise API path, finish the credential setup in Advanced.",
        openPageRequired:
          "Open the provider usage page first, then come back and refresh.",
        loggedOut:
          "Open the provider usage page and sign in again before retrying.",
        captureUnavailable:
          "The page is open, but the current session cannot be read. Reopen the page and retry.",
        syncError:
          "The last sync did not complete successfully. Start by reopening the source page or checking the advanced source controls.",
      },
      actions: {
        enableProvider: "Enable provider",
        disableProvider: "Hide provider",
        grantAccess: "Grant access",
        openUsagePage: "Open usage page",
        openAndSignIn: "Open page and sign in",
        retryPage: "Retry page",
        openSourcePage: "Open source page",
        useCurrentPage: "Use current page",
        disconnectPage: "Disconnect page",
      },
    },
    preferences: {
      showMore: "More",
      hideMore: "Less",
      detail:
        "App language, popup shape, and per-surface quota styling live here when you need them.",
    },
    configurationBackup,
    themeCustomization: {
      previewingSeed: (seed: string, mode: "light" | "dark") =>
        `Previewing ${seed} for the current ${mode} palette. Apply it to switch the accent preset to Custom Seed.`,
      customSeedMissing:
        "Custom Seed is selected, but no valid saved seed is available yet. The default accent roles stay active until you apply a valid #RRGGBB value.",
      enterValidSeed:
        "Enter a valid #RRGGBB value to generate a custom accent palette without opening raw token editing.",
    },
    credentials: {
      sectionLabel: "Provider credential",
      configured: "Configured",
      missing: "Missing",
      saveKey: "Save key",
      clearStoredKey: "Clear stored key",
      saveConfig: "Save config",
      clearStoredConfig: "Clear stored config",
      adminApiKeyLabel: "Admin API key",
      analyticsApiKeyLabel: "Analytics API key",
      workspaceIdLabel: "Workspace ID",
      cursorTitle: "Cursor Team Admin API key",
      cursorHelpText:
        "Stored only in extension-managed local storage on this browser profile. Optional: use it for the team-admin API path, or leave it empty and use the logged-in personal usage page instead.",
      cursorFooterText:
        "Team-admin scope only. When configured, requests are sent from the background worker to `https://api.cursor.com` with Basic auth. Personal usage-page sync does not require this key.",
      cursorPlaceholderMissing: "Paste a Cursor Admin API key",
      cursorPlaceholderConfigured:
        "Configured locally. Enter a new key to replace it.",
      claudeTitle: "Claude Code Analytics Admin API key",
      claudeHelpText:
        "Stored only in extension-managed local storage on this browser profile. Required for the supported v1 Claude organization analytics path.",
      claudeFooterText:
        "Admin API scope only. Requests are sent from the background worker to `https://api.anthropic.com/v1/organizations/usage_report/claude_code` with `x-api-key` and `anthropic-version` headers.",
      claudePlaceholderMissing: "Paste an Anthropic Admin API key",
      claudePlaceholderConfigured:
        "Configured locally. Enter a new key to replace it.",
      codexTitle: "Codex Enterprise analytics config",
      codexHelpText:
        "Stored only in extension-managed local storage on this browser profile. This is optional and only needed for the Enterprise analytics path. Personal Codex usage-page sync does not require an analytics key or workspace ID.",
      codexFooterText:
        "Use a Platform API key scoped for Codex analytics and the workspace ID from the ChatGPT admin console only if you want the Enterprise workspace path. Requests go to `https://api.chatgpt.com/v1/analytics/codex`.",
      codexAnalyticsPlaceholderMissing: "Paste a Codex analytics API key",
      codexAnalyticsPlaceholderConfigured:
        "Configured locally. Enter a new analytics key to replace it.",
      codexWorkspacePlaceholderMissing: "Paste the Codex workspace ID",
      codexWorkspacePlaceholderConfigured:
        "Configured locally. Enter a new workspace ID to replace it.",
    },
    sources: {
      preferenceLabel: "Preference",
      operationalNoteLabel: "What to know",
      sessionPageTrackLabel: "Session-page track",
      sessionPageNoteLabel: "Session-page note",
      findOrOpenPage: "Find or open page",
      useActivePage: "Use current page",
      extensionModeOnly: "Extension mode only",
      disconnectBinding: "Disconnect binding",
      detailedDiagnostics: "Detailed diagnostics",
      compactFields: {
        currentSetup: "Current setup",
        setupStatus: "Status",
        pageStatus: "Page status",
        pageRoute: "Page route",
      },
      compactCurrentSetup: {
        sessionPage: "Signed-in usage page",
        savedConnection: "Saved team / API config",
        policyOnly: "Documented policy only",
      },
      itemCount: (count: number) => `${i18n.formatNumber(count)} items`,
      routeFallback: "Open from provider settings",
      sourcePreferenceLabels: {
        auto: "Auto",
        official_api: "Official API",
        session_page: "Session page",
      } as Record<ProviderSourcePreference, string>,
      sourceKindLabels: {
        official_api: "Official API",
        session_page: "Session page",
        policy_only: "Policy only",
      } as Record<ProviderSourceKind, string>,
      cardLabels: {
        primary: {
          accessModel: "Access model",
          availabilitySummary: "Availability summary",
          fallback: "Fallback",
          noneFallback: "None",
          route: "Route",
          availability: "Availability",
          graduationGate: "Graduation gate",
          selectionReason: "Selection reason",
          fallbackReason: "Fallback reason",
          selectionDiagnostic: "Selection diagnostic",
          selectionDiagnosticSummary: "Selection summary",
          fallbackDiagnostic: "Fallback diagnostic",
          fallbackDiagnosticSummary: "Fallback summary",
          diagnostic: "Diagnostic",
          diagnosticSummary: "Diagnostic summary",
          readinessDetail: "Readiness detail",
          fidelityDetail: "Fidelity detail",
          usedValue: "Used value",
          remainingValue: "Remaining value",
          resetValue: "Reset value",
          credentialPersistence: "Credential persistence",
          cookieStorage: "Cookie storage",
          manualCookieImport: "Manual cookie import",
          hostAccess: "Host access",
          pageBinding: "Page binding",
          bindingMode: "Binding mode",
          bindingDetail: "Binding detail",
        },
        groups: {
          sourceDecision: "Source decision",
          valueSemantics: "Value semantics",
          trustBoundary: "Trust boundary",
        },
        notes: {
          graduationGatePrefix: "Graduation gate: ",
        },
      },
    },
    permissions: {
      noHostAccessRequired: "No host access required",
      hostAccessGranted: "Host access granted",
      hostAccessMissing: "Host access missing",
      noActionNeeded: "No action needed",
      removeAccess: "Remove access",
      requestAccess: "Request access",
    },
    providerOrder,
    progressItems,
    progressAppearance,
    colorChoices,
    preferenceGroups,
  };

  const coreCopy = getSettingsCoreCopy(i18n.resolvedLocale);
  const credentialsCopy = getSettingsCredentialsCopy(i18n.resolvedLocale);
  const sourcePermissionsCopy = getSettingsSourcePermissionsCopy(
    i18n.resolvedLocale,
  );

  if (!coreCopy && !credentialsCopy && !sourcePermissionsCopy) {
    return englishCopy;
  }

  return {
    ...englishCopy,
    ...(coreCopy ? buildLocalizedSettingsCoreSections(i18n, coreCopy) : {}),
    ...(credentialsCopy
      ? buildLocalizedSettingsCredentialsSection(credentialsCopy)
      : {}),
    ...(sourcePermissionsCopy
      ? buildLocalizedSettingsSourcePermissionsSections(
          i18n,
          sourcePermissionsCopy,
        )
      : {}),
    providerOrder,
    progressItems,
    progressAppearance,
    colorChoices,
    preferenceGroups,
  };
}

export function getSettingsSourcePreferenceLabel(
  preference: ProviderSourcePreference,
  copy: ReturnType<typeof buildSettingsLocalizedCopy>,
) {
  return copy.sources.sourcePreferenceLabels[preference];
}

export function getSettingsSourceKindLabel(
  kind: ProviderSourceKind,
  copy: ReturnType<typeof buildSettingsLocalizedCopy>,
) {
  return copy.sources.sourceKindLabels[kind];
}
