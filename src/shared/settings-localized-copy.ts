import type {
  ProviderSourceKind,
  ProviderSourcePreference,
} from "../providers/types";
import type { RuntimeI18n } from "./i18n";

export function buildSettingsLocalizedCopy(i18n: RuntimeI18n) {
  if (i18n.resolvedLocale === "zh-CN") {
    return {
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
        operationalNoteLabel: "运行说明",
        sessionPageTrackLabel: "Session-page 轨道",
        sessionPageNoteLabel: "Session-page 说明",
        findOrOpenPage: "查找或打开页面",
        useActivePage: "使用当前页面",
        extensionModeOnly: "仅扩展模式",
        disconnectBinding: "断开绑定",
        detailedDiagnostics: "详细诊断",
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
    };
  }

  return {
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
      operationalNoteLabel: "Operational note",
      sessionPageTrackLabel: "Session-page track",
      sessionPageNoteLabel: "Session-page note",
      findOrOpenPage: "Find or open page",
      useActivePage: "Use current page",
      extensionModeOnly: "Extension mode only",
      disconnectBinding: "Disconnect binding",
      detailedDiagnostics: "Detailed diagnostics",
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
