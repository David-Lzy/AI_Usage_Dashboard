import type {
  PermissionStatus,
  SyncStatus,
} from "../providers/types";
import type { RuntimeI18n } from "./i18n";
import { getProviderDetailExtendedCopy } from "./provider-detail-extended-localized-copy";

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
        selectionDiagnostic: "选择诊断",
        selectionDiagnosticSummary: "选择摘要",
        fallbackReason: "回退原因",
        fallbackDiagnostic: "回退诊断",
        fallbackDiagnosticSummary: "回退摘要",
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
        usageWindows: "可见额度上下文",
        sourcePageRecovery: "来源页面恢复",
        sourcePageRecoveryDetail:
          "打开或切回这个 provider 的已发布 session-page 来源页，并保存匹配页面绑定。",
        openSourcePageAction: "打开来源页面",
        diagnosticSummary: "诊断摘要",
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

  const extendedCopy = getProviderDetailExtendedCopy(i18n.resolvedLocale);

  if (extendedCopy) {
    return extendedCopy;
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
      selectionDiagnostic: "Selection diagnostic",
      selectionDiagnosticSummary: "Selection summary",
      fallbackReason: "Fallback reason",
      fallbackDiagnostic: "Fallback diagnostic",
      fallbackDiagnosticSummary: "Fallback summary",
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
      usageWindows: "Visible usage context",
      sourcePageRecovery: "Source-page recovery",
      sourcePageRecoveryDetail:
        "Open or focus this provider's shipped session-page source and save the matching page binding.",
      openSourcePageAction: "Open source page",
      diagnosticSummary: "Diagnostic summary",
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
