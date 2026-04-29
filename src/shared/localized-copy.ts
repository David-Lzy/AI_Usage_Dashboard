import type {
  ProviderDiagnostic,
  ProviderDiagnosticParams,
  PermissionStatus,
  ProviderSourceKind,
  ProviderSourcePreference,
  ProviderTone,
  SyncStatus,
} from "../providers/types";
import type { RuntimeI18n } from "./i18n";
import {
  DEFAULT_PROVIDER_SOURCE_DISPLAY_COPY,
  type ProviderSourceDisplayCopy,
} from "./provider-sources";

export type ProviderDiagnosticPresentation = {
  label: string;
  summary: string;
};

function formatProviderCount(i18n: RuntimeI18n, count: number) {
  if (i18n.resolvedLocale === "zh-CN") {
    return `${i18n.formatNumber(count)} 个 provider`;
  }

  return `${i18n.formatNumber(count)} ${count === 1 ? "provider" : "providers"}`;
}

function getNumberParam(
  params: ProviderDiagnosticParams | undefined,
  key: string,
): number | null {
  const value = params?.[key];

  return typeof value === "number" ? value : null;
}

function getStringParam(
  params: ProviderDiagnosticParams | undefined,
  key: string,
): string | null {
  const value = params?.[key];
  const normalizedValue = typeof value === "string" ? value.trim() : "";

  return normalizedValue ? normalizedValue : null;
}

function getBooleanParam(
  params: ProviderDiagnosticParams | undefined,
  key: string,
): boolean | null {
  const value = params?.[key];

  return typeof value === "boolean" ? value : null;
}

function getSourceKindParam(
  params: ProviderDiagnosticParams | undefined,
  key: string,
): ProviderSourceKind | null {
  const value = getStringParam(params, key);

  if (
    value === "official_api" ||
    value === "session_page" ||
    value === "policy_only"
  ) {
    return value;
  }

  return null;
}

function getSourcePreferenceParam(
  params: ProviderDiagnosticParams | undefined,
  key: string,
): ProviderSourcePreference | null {
  const value = getStringParam(params, key);

  if (
    value === "auto" ||
    value === "official_api" ||
    value === "session_page"
  ) {
    return value;
  }

  return null;
}

function formatDiagnosticSourceKindLabel(
  sourceKind: ProviderSourceKind | null,
  i18n: RuntimeI18n,
): string {
  if (i18n.resolvedLocale === "zh-CN") {
    switch (sourceKind) {
      case "official_api":
        return "官方 API";
      case "session_page":
        return "会话页面";
      case "policy_only":
        return "仅策略";
      default:
        return "当前来源";
    }
  }

  switch (sourceKind) {
    case "official_api":
      return "Official API";
    case "session_page":
      return "Session page";
    case "policy_only":
      return "Policy only";
    default:
      return "current source";
  }
}

function formatDiagnosticSourcePreferenceLabel(
  sourcePreference: ProviderSourcePreference | null,
  i18n: RuntimeI18n,
): string {
  if (i18n.resolvedLocale === "zh-CN") {
    switch (sourcePreference) {
      case "official_api":
        return "官方 API";
      case "session_page":
        return "会话页面";
      case "auto":
      default:
        return "自动";
    }
  }

  switch (sourcePreference) {
    case "official_api":
      return "Official API";
    case "session_page":
      return "Session page";
    case "auto":
    default:
      return "Auto";
  }
}

function formatSourceSelectionSummary(
  params: ProviderDiagnosticParams | undefined,
  i18n: RuntimeI18n,
): string {
  const selectedKind = getSourceKindParam(params, "selectedKind");
  const sourcePreference = getSourcePreferenceParam(params, "sourcePreference");
  const hadFallback = getBooleanParam(params, "hadFallback") ?? false;
  const selectedKindLabel = formatDiagnosticSourceKindLabel(selectedKind, i18n);
  const preferenceLabel = formatDiagnosticSourcePreferenceLabel(
    sourcePreference,
    i18n,
  );

  if (i18n.resolvedLocale === "zh-CN") {
    if (sourcePreference === "auto" && hadFallback) {
      return `自动偏好在前置来源不可用后选择了${selectedKindLabel}。`;
    }

    if (sourcePreference === "auto") {
      return `自动偏好选择了${selectedKindLabel}。`;
    }

    return `${preferenceLabel}偏好选择了${selectedKindLabel}。`;
  }

  if (sourcePreference === "auto" && hadFallback) {
    return `Auto preference selected ${selectedKindLabel} after an earlier source failed.`;
  }

  if (sourcePreference === "auto") {
    return `Auto preference selected ${selectedKindLabel}.`;
  }

  return `${preferenceLabel} preference selected ${selectedKindLabel}.`;
}

function formatNoLivePathSummary(
  params: ProviderDiagnosticParams | undefined,
  i18n: RuntimeI18n,
): string {
  const failureCount = getNumberParam(params, "failureCount");

  if (failureCount !== null) {
    return i18n.resolvedLocale === "zh-CN"
      ? `${i18n.formatNumber(failureCount)} 个来源尝试失败；当前没有可用 live source。`
      : `${i18n.formatNumber(failureCount)} source attempts failed; no live source is available.`;
  }

  return i18n.resolvedLocale === "zh-CN"
    ? "当前没有可用 live source。"
    : "No live source is available.";
}

function formatThresholdSummary(
  params: ProviderDiagnosticParams | undefined,
  i18n: RuntimeI18n,
): string {
  const usagePercent = getNumberParam(params, "usagePercent");
  const thresholdPercent = getNumberParam(params, "thresholdPercent");
  const unitLabel = getStringParam(params, "unitLabel");

  if (usagePercent !== null && thresholdPercent !== null) {
    if (i18n.resolvedLocale === "zh-CN") {
      return `当前用量 ${i18n.formatPercentValue(usagePercent)}，已达到 ${i18n.formatPercentValue(thresholdPercent)} 告警阈值。`;
    }

    return `Usage is at ${i18n.formatPercentValue(usagePercent)}, reaching the ${i18n.formatPercentValue(thresholdPercent)} warning threshold.`;
  }

  if (unitLabel) {
    return i18n.resolvedLocale === "zh-CN"
      ? `当前 ${unitLabel} 用量已达到告警阈值。`
      : `Current ${unitLabel} usage reached the warning threshold.`;
  }

  return i18n.resolvedLocale === "zh-CN"
    ? "当前用量已达到告警阈值。"
    : "Current usage reached the warning threshold.";
}

function formatOverageSummary(
  params: ProviderDiagnosticParams | undefined,
  i18n: RuntimeI18n,
): string {
  const overageCount = getNumberParam(params, "overageCount");
  const unitLabel = getStringParam(params, "unitLabel") ?? "units";

  if (overageCount !== null) {
    return i18n.resolvedLocale === "zh-CN"
      ? `已记录 ${i18n.formatNumber(overageCount)} 个超额 ${unitLabel}。`
      : `${i18n.formatNumber(overageCount)} overage ${unitLabel} recorded.`;
  }

  return i18n.resolvedLocale === "zh-CN"
    ? "已检测到超额用量。"
    : "Overage usage is detected.";
}

function formatSyncStaleSummary(
  params: ProviderDiagnosticParams | undefined,
  i18n: RuntimeI18n,
): string {
  const ageMinutes = getNumberParam(params, "ageMinutes");
  const staleAfterMinutes = getNumberParam(params, "staleAfterMinutes");

  if (ageMinutes !== null && staleAfterMinutes !== null) {
    return i18n.resolvedLocale === "zh-CN"
      ? `缓存年龄 ${i18n.formatNumber(ageMinutes)} 分钟，已超过 ${i18n.formatNumber(staleAfterMinutes)} 分钟 freshness 阈值。`
      : `Cache age is ${i18n.formatNumber(ageMinutes)} minutes, above the ${i18n.formatNumber(staleAfterMinutes)} minute freshness threshold.`;
  }

  return i18n.resolvedLocale === "zh-CN"
    ? "缓存 freshness 已过期。"
    : "Cached freshness is overdue.";
}

function formatAdapterErrorSummary(
  code: ProviderDiagnostic["code"],
  params: ProviderDiagnosticParams | undefined,
  i18n: RuntimeI18n,
): string {
  const sourceKindLabel = formatDiagnosticSourceKindLabel(
    getSourceKindParam(params, "sourceKind"),
    i18n,
  );

  if (i18n.resolvedLocale === "zh-CN") {
    if (code === "adapter.parse_failed") {
      return `${sourceKindLabel}解析失败；保留 raw diagnostic body 用于 parser 或 route 检查。`;
    }

    if (code === "adapter.unsupported_response") {
      return `${sourceKindLabel}返回了当前适配器不支持的响应；保留 raw diagnostic body 用于兼容性检查。`;
    }

    return `${sourceKindLabel}出现非预期适配器错误；保留 raw diagnostic body 用于排查。`;
  }

  if (code === "adapter.parse_failed") {
    return `${sourceKindLabel} parsing failed; keep the raw diagnostic body for parser or route review.`;
  }

  if (code === "adapter.unsupported_response") {
    return `${sourceKindLabel} returned a response this adapter does not support; keep the raw diagnostic body for compatibility review.`;
  }

  return `${sourceKindLabel} hit an unexpected adapter error; keep the raw diagnostic body for review.`;
}

export function getProviderDiagnosticPresentation(
  diagnostic: ProviderDiagnostic | null | undefined,
  i18n: RuntimeI18n,
): ProviderDiagnosticPresentation | null {
  if (!diagnostic) {
    return null;
  }

  const zh = i18n.resolvedLocale === "zh-CN";

  switch (diagnostic.code) {
    case "source.auto_selected_official_api":
      return {
        label: zh ? "自动选择官方 API" : "Auto selected Official API",
        summary: formatSourceSelectionSummary(diagnostic.params, i18n),
      };
    case "source.auto_selected_session_page": {
      const hadFallback =
        getBooleanParam(diagnostic.params, "hadFallback") ?? false;

      return {
        label: zh
          ? hadFallback
            ? "自动回退到会话页面"
            : "自动选择会话页面"
          : hadFallback
            ? "Auto fell back to Session page"
            : "Auto selected Session page",
        summary: formatSourceSelectionSummary(diagnostic.params, i18n),
      };
    }
    case "source.preference_selected_official_api":
      return {
        label: zh ? "偏好选择官方 API" : "Preferred Official API selected",
        summary: formatSourceSelectionSummary(diagnostic.params, i18n),
      };
    case "source.preference_selected_session_page":
      return {
        label: zh ? "偏好选择会话页面" : "Preferred Session page selected",
        summary: formatSourceSelectionSummary(diagnostic.params, i18n),
      };
    case "source.official_api_missing_credential":
      return {
        label: zh ? "官方 API 缺少凭据" : "Official API credential missing",
        summary: zh
          ? "官方 API 来源缺少所需凭据，无法运行。"
          : "The Official API source could not run because its required credential is missing.",
      };
    case "source.official_api_failed":
      return {
        label: zh ? "官方 API 失败" : "Official API failed",
        summary: zh
          ? "官方 API 来源失败；保留 raw fallback reason 用于证据检查。"
          : "The Official API source failed; keep the raw fallback reason for evidence review.",
      };
    case "source.session_page_unavailable":
      return {
        label: zh ? "会话页面不可用" : "Session page unavailable",
        summary: zh
          ? "已登录会话页面来源无法提供可用快照。"
          : "The logged-in session-page source could not provide a usable snapshot.",
      };
    case "source.no_live_path":
      return {
        label: zh ? "无 live source path" : "No live source path",
        summary: formatNoLivePathSummary(diagnostic.params, i18n),
      };
    case "credential.admin_api_key_missing":
      return {
        label: zh ? "缺少 Admin API key" : "Admin API key missing",
        summary: zh
          ? "添加所需 Admin API key 后，这条官方来源才能同步。"
          : "Add the required Admin API key before this official source can sync.",
      };
    case "credential.workspace_config_missing":
      return {
        label: zh ? "缺少 workspace config" : "Workspace config missing",
        summary: zh
          ? "添加 analytics API key 和 workspace ID 后，这条 workspace 来源才能同步。"
          : "Add both the analytics API key and workspace ID before this workspace source can sync.",
      };
    case "host_access.missing":
    case "host_access.required_for_live_sync":
      return {
        label: zh ? "缺少 host access" : "Host access missing",
        summary: zh
          ? "授予所需 provider host 权限后，live sync 才能运行。"
          : "Grant the required provider host access before live sync can run.",
      };
    case "page_session.open_page_required":
      return {
        label: zh ? "需要打开页面" : "Open page required",
        summary: zh
          ? "打开已登录的 provider usage 页面后再刷新。"
          : "Open the logged-in provider usage page before refreshing again.",
      };
    case "page_session.logged_out":
      return {
        label: zh ? "页面会话未登录" : "Page session logged out",
        summary: zh
          ? "重新登录 provider 页面后再运行 page-session sync。"
          : "Sign back into the provider page before running page-session sync.",
      };
    case "page_session.capture_unavailable":
      return {
        label: zh ? "页面捕获不可用" : "Page capture unavailable",
        summary: zh
          ? "当前页面无法被扩展读取；保留 raw detail 用于权限、页面状态或 route 检查。"
          : "The current page could not be read by the extension; keep the raw detail for permission, page-state, or route review.",
      };
    case "usage.threshold_warning":
      return {
        label: zh ? "用量阈值" : "Usage threshold",
        summary: formatThresholdSummary(diagnostic.params, i18n),
      };
    case "usage.overage_detected":
      return {
        label: zh ? "检测到超额" : "Overage detected",
        summary: formatOverageSummary(diagnostic.params, i18n),
      };
    case "usage.on_demand_off":
      return {
        label: zh ? "按需用量关闭" : "On-demand usage off",
        summary: zh
          ? "当前 provider 的 on-demand 用量开关处于关闭状态。"
          : "On-demand usage is currently turned off for this provider.",
      };
    case "policy.live_source_unavailable":
      return {
        label: zh ? "无 live source" : "No live source",
        summary: zh
          ? "当前 provider 只显示策略信息，没有稳定 live usage source。"
          : "This provider only shows policy information because no stable live usage source is selected.",
      };
    case "policy.documented_limit_only":
      return {
        label: zh ? "仅文档化限制" : "Documented limit only",
        summary: zh
          ? "当前状态来自文档化 quota policy，不代表 live per-user usage。"
          : "This state comes from documented quota policy, not live per-user usage.",
      };
    case "sync.automatic_sync_overdue":
      return {
        label: zh ? "自动同步逾期" : "Automatic sync overdue",
        summary: formatSyncStaleSummary(diagnostic.params, i18n),
      };
    case "sync.cached_state_stale":
      return {
        label: zh ? "缓存状态过期" : "Cached state stale",
        summary: formatSyncStaleSummary(diagnostic.params, i18n),
      };
    case "adapter.unexpected_error":
      return {
        label: zh ? "适配器意外错误" : "Adapter unexpected error",
        summary: formatAdapterErrorSummary(
          diagnostic.code,
          diagnostic.params,
          i18n,
        ),
      };
    case "adapter.unsupported_response":
      return {
        label: zh ? "不支持的适配器响应" : "Unsupported adapter response",
        summary: formatAdapterErrorSummary(
          diagnostic.code,
          diagnostic.params,
          i18n,
        ),
      };
    case "adapter.parse_failed":
      return {
        label: zh ? "适配器解析失败" : "Adapter parse failed",
        summary: formatAdapterErrorSummary(
          diagnostic.code,
          diagnostic.params,
          i18n,
        ),
      };
    default:
      return null;
  }
}

export function buildProviderSourceDisplayLocalizedCopy(
  i18n: RuntimeI18n,
): ProviderSourceDisplayCopy {
  if (i18n.resolvedLocale !== "zh-CN") {
    return DEFAULT_PROVIDER_SOURCE_DISPLAY_COPY;
  }

  return {
    ...DEFAULT_PROVIDER_SOURCE_DISPLAY_COPY,
    sourceKindLabels: {
      official_api: "官方 API",
      session_page: "会话页面",
      policy_only: "仅策略",
    },
    sourcePreferenceLabels: {
      auto: "自动",
      official_api: "官方 API",
      session_page: "会话页面",
    },
    rolloutStageLabels: {
      shipped: "已发布",
      planned: "计划中",
      deferred: "已暂缓",
    },
    fieldAvailabilityLabels: {
      exact: "精确",
      window_only: "仅窗口",
      analytics_only: "分析",
      documented_policy: "策略",
      unavailable: "不可用",
    },
    sourceFidelity: {
      exact: {
        label: "供应商精确值",
        detail:
          "这条路径会直接暴露供应商报告的 tracked usage 和 remaining balance。",
      },
      window_only: {
        label: "仅窗口供应商值",
        detail:
          "这条路径只暴露当前窗口或局部上下文里的供应商报告值，而不是一个绝对 remaining balance。",
      },
      analytics_only: {
        label: "分析快照",
        detail:
          "这条路径暴露聚合 analytics 或 snapshot 值，不是实时 remaining counter。",
      },
      policy_only: {
        label: "已记录策略",
        detail:
          "这条路径仅来自已记录策略。当前没有选中 live page session 或 live API source。",
      },
      local_estimate: {
        label: "本地估算",
        detail:
          "这条路径会依赖本地推断 counter，而不是供应商报告的 live usage。",
      },
    },
    connectionMode: {
      credential: {
        label: "已存凭据",
        detail:
          "这条路径由扩展使用保存在 extension-managed local storage 中的凭据运行。",
      },
      page_session: {
        label: "已登录页面会话",
        detail:
          "这条路径会附着到已经登录的浏览器标签页，并在当前 session 中读取规范化页面数据。",
      },
      none: {
        label: "无 live 连接",
        detail:
          "这条路径不使用 live credential 或 page session。扩展只展示已记录策略。",
      },
    },
    sourceContractLabels: {
      shipped_admin_analytics: "已发布 admin analytics",
      shipped_enterprise_analytics: "已发布 enterprise analytics",
      shipped_personal_partial: "已发布 personal partial",
      shipped_policy_only: "已发布 policy only",
      deferred_personal_page: "暂缓 personal page",
      deferred_project_metrics: "暂缓 project metrics",
      deferred_org_console: "暂缓 org console path",
    },
    credentialPersistence: {
      extensionLocalOnlyLabel: "仅扩展本地",
      extensionLocalOnlyDetail:
        "任何已配置凭据只保存在当前浏览器 profile 的 extension-managed local storage 中。",
      notApplicableLabel: "不适用",
      notApplicableDetail: "这个 provider 的已发布合同不存储凭据。",
    },
    cookiePolicy: {
      forbiddenLabel: "禁止",
      forbiddenDetail: "原始 cookies 不会持久化到扩展存储中。",
    },
    manualCookieImport: {
      forbiddenLabel: "禁止",
      forbiddenDetail:
        "产品不会要求用户把 cookies 或 auth headers 粘贴到扩展设置里。",
    },
    hostAccess: {
      notRequiredLabel: "不需要",
      notRequiredDetail:
        "这个 provider 的已发布合同不需要可选 host permission。",
      requiredLabel: "需要",
      requiredDetail: (hostsLabel: string) =>
        `Live access 依赖 ${hostsLabel} 的 Chrome host permission。`,
    },
    sourceState: {
      readyLabel: "可同步",
      policyOnlyLabel: "无 live sync",
      hostAccessMissingLabel: "缺少 host access",
      hostAccessMissingFallbackDetail:
        "必须先授予所需 host access，live sync 才能运行。",
      credentialMissingLabel: "缺少凭据",
      credentialMissingFallbackDetail:
        "必须先添加所需 provider 凭据，live sync 才能运行。",
      loggedOutLabel: "页面已登出",
      loggedOutFallbackDetail:
        "请重新登录 provider 页面，然后再刷新 dashboard。",
      openPageRequiredLabel: "需要打开页面",
      openPageRequiredFallbackDetail:
        "请打开所需的已登录 provider 页面，然后再刷新。",
      captureUnavailableLabel: "页面捕获不可用",
      captureUnavailableFallbackDetail:
        "请重新加载已打开的 provider 页面，然后再刷新。",
      syncErrorLabel: "同步问题",
      syncErrorFallbackDetail:
        "当前 provider source 在刷新过程中意外失败。",
    },
    pageBinding: {
      boundTabLabel: "绑定标签页",
      autoReconnectLabel: "自动重连",
      targetFallback: "上一次匹配的 provider 页面",
      lastAttachedSuffix: (updatedAt: string) => `上次附着 ${updatedAt}。`,
      attachedLabel: "已附着",
      attachedDetail: (
        modeLabel: string,
        targetLabel: string,
        lastSeenSuffix: string,
      ) =>
        `${modeLabel} 当前正在跟踪 ${targetLabel}。${
          lastSeenSuffix ? ` ${lastSeenSuffix}` : ""
        }`,
      staleLabel: "绑定已过期",
      staleDetail: (
        modeLabel: string,
        targetLabel: string,
        lastSeenSuffix: string,
      ) =>
        `${modeLabel} 上次指向 ${targetLabel}，但当前 session 已经不能在这里暴露可用页面。${
          lastSeenSuffix ? ` ${lastSeenSuffix}` : ""
        }`,
      notBoundLabel: "未绑定",
      notBoundDetail:
        "尚未固定 provider 页面。自动发现仍可搜索当前标签页，也可以使用查找或打开页面显式附着。",
    },
    availabilitySummary: (used: string, remaining: string, reset: string) =>
      `已用：${used} · 剩余：${remaining} · 重置：${reset}`,
  };
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
        statusReloadPage: "重新加载",
        statusNeedsReview: "需复查",
        statusContractOnly: "仅合同",
        statusHealthy: "健康",
        statusWarning: "告警",
        statusSyncIssue: "同步异常",
        primaryBlockedHostAccess: "当前路径被 host access 阻塞。",
        primaryNeedsCredentials: "当前路径仍然需要已存凭据。",
        primaryNeedsLivePage: "当前路径仍然需要活跃页面会话。",
        primaryNeedsSignedInPage: "当前路径需要重新拿到已登录页面。",
        primaryPageUnreadable: "当前页面会话已经打开，但扩展无法读取。",
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
      statusReloadPage: "Reload page",
      statusNeedsReview: "Needs review",
      statusContractOnly: "Contract-only",
      statusHealthy: "Healthy",
      statusWarning: "Warning",
      statusSyncIssue: "Sync issue",
      primaryBlockedHostAccess: "Current path is blocked on host access.",
      primaryNeedsCredentials: "Current path still needs stored credentials.",
      primaryNeedsLivePage: "Current path still needs a live page session.",
      primaryNeedsSignedInPage: "Current path needs the signed-in page again.",
      primaryPageUnreadable:
        "Current page session is open but cannot be read.",
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

export function buildOperatorWorkspaceLocalizedCopy(i18n: RuntimeI18n) {
  if (i18n.resolvedLocale === "zh-CN") {
    return {
      interactionAudit: {
        topbar: {
          title: "交互审计",
          subtitle: "真实浏览器 QA 工作台",
          openDashboard: "打开 dashboard",
          openSettings: "打开设置",
        },
        hero: {
          eyebrow: "审计中心",
          title: "不用反复调整窗口的手动交互复查",
          detail:
            "这个页面把真实发布的 dashboard、settings、provider detail 和 popup 放进固定宽度 frame，让真实浏览器复查聚焦 hover、focus、pressed 和紧凑宽度行为，而不是反复重新打开路由。审计中心会跟随 side panel 与 popup 的共享主题偏好。",
          chip: "手动 QA · 固定宽度 frame",
        },
        guidance: {
          eyebrow: "使用方式",
          title: "复查指引",
          detail:
            "当自动化复查脚本之后还需要人工确认时，在普通浏览器标签页或扩展页面打开这个路由。即使外层浏览器窗口更大，内嵌 frame 仍会保留代表性宽度。",
          checks: [
            "悬停交互控件，并确认跨页面的状态层仍然一致。",
            "用键盘 tab 穿过内嵌 surface，并确认 focus 可见性仍然明确。",
            "使用下方 preset actions 打开 disclosure、聚焦控件或露出更低层 detail note，再签核一个 UI slice。",
          ],
          openDashboard: "打开 dashboard",
          openSettings: "打开设置",
          openPopup: "打开 popup",
        },
        signoff: {
          eyebrow: "签核工作台",
          title: "当前 operator 草稿",
          detail:
            "使用每个审计 surface 内的控件记录检查进度、reviewer notes，以及 pass 或 follow-up 状态。下面的草稿会跟随当前工作台状态实时更新。",
          reviewedSurfaces: "已复查 surface",
          pass: "通过",
          followUp: "待跟进",
          completedChecks: "已完成检查",
          reviewerName: "Reviewer 名称",
          reviewerPlaceholder: "记录 reviewer 或 operator 名称。",
          sessionLabel: "Session 标签",
          sessionPlaceholder: "标记这次复查，例如 Compact QA Pass。",
          reviewedAt: "复查时间",
          reviewedAtPlaceholder: "使用 ISO-8601 时间，或盖上当前复查时间。",
          stampCurrentTime: "填入当前时间",
          reviewSession: "Review session",
          reviewerPrefix: "Reviewer",
          sessionPrefix: "Session",
          reviewedAtPrefix: "Reviewed at",
          notSet: "未设置",
          requestBindingPrefix: "Request binding",
          requestRevisionPrefix: "Request revision",
          requestScope: "请求范围",
          boundRequestDetail:
            "这个工作台绑定到一个 repo-backed pending request。请针对该请求执行 preflight 和 completion，而不是使用 ad-hoc archive path。",
          adHocDetail:
            "这个工作台没有绑定 repo-backed request。除非先导入 pending request template，否则请使用 archive path。",
          repoBackedRequest: "Repo-backed request",
          adHocWorkspace: "Ad-hoc audit workspace",
          binding: "绑定",
          requestRevision: "Request revision",
          downloadIdentity: "下载身份",
          downloadsBound:
            "下载内容会包含绑定的 request id 和 request revision。",
          downloadsAdHoc: "下载内容仅保留当前 session scope。",
        },
      },
      themeRecovery: {
        topbar: {
          title: "主题恢复审核",
          subtitle: "Operator 工作台",
          refresh: "刷新",
          openSettings: "打开设置",
        },
        hero: {
          eyebrow: "真实 session 跟进",
          title: "集中执行 native prompt 与真实 session 恢复检查",
          detail:
            "这个路由不会声称 native host prompt 或真实 vendor session 已经通过。它会收集当前主题状态、恢复状态、快速链接和可复制证据，让下一次 operator pass 保持真实且可重复。",
          chip: "主题 QA · 恢复跟进",
        },
        loading: {
          title: "正在加载当前审核状态...",
          detail:
            "正在读取当前 app state 和 action badge，让这个工作台能反映与已发布 surface 相同的主题和 provider 状态。",
        },
        error: {
          title: "无法加载审核状态",
        },
        currentTruth: {
          eyebrow: "当前真值",
          title: "此刻的恢复状态",
          reviewStage: "复查阶段",
          popupSnapshot: "Popup 快照",
          actionBadge: "Action badge",
        },
        themeState: {
          eyebrow: "主题状态",
          title: "共享运行时状态",
          detail:
            "这个工作台读取 side panel、popup 和 audit hub 使用的同一份已保存主题设置。Operator pass 应在恢复 provider access 时保持当前 custom-seed 状态固定。",
          themeMode: "Theme mode",
          resolvedMode: "Resolved mode",
          accentPreset: "Accent preset",
          customSeed: "Custom seed",
          scopeIsolation: "Scope isolation",
          liveBadgeSource: "Live badge source",
          notSet: "未设置",
          computedBadgeSource: "由当前 app state 计算",
          scopeNote: "Scope note",
          popupSnapshotPrefix: "Popup 快照",
          actionBadgeTitlePrefix: "Action badge 标题",
        },
        requestScope: {
          eyebrow: "请求范围",
          title: "Repo-backed request 绑定",
          detail:
            "这个工作台绑定到一个 pending theme-recovery request。Summary 和 JSON export 必须保留该请求身份，避免 completion 意外履行另一个请求。",
          requestId: "Request id",
          createdAt: "Created at",
          boundWorkspaceRoute: "绑定的工作台路由",
          adHocTitle: "Ad-hoc 工作台",
          adHocDetail:
            "这个 review route 当前没有绑定 repo-backed request。它的 export 仍可用于本地检查，但不应拿来履行 pending request。",
        },
        workflow: {
          eyebrow: "Operator workflow",
          title: "真实 session 跟进步骤",
          detail:
            "在 Settings、popup 和目标 vendor 页面之间切换时保持这个页面打开。用下方链接在独立标签页打开准确的已发布 surface，且不丢失当前工作台。",
          steps: [
            "固定当前 custom seed，并确认工作台仍报告预期的 theme mode、resolved mode、preset 和 seed。",
            "在信任 popup alignment 与 action badge 之前，用 Settings 保持只有 Cursor 和 Codex 可见。",
            "先捕获 degraded state：缺少 host access 或真实 session 被阻塞时，这个页面应保持 warning 状态。",
            "通过 native prompt 授予 host access，或恢复真实 vendor session；随后刷新此页面，并确认 review stage 回到 recovered。",
            "真实 pass 之后复制 summary 或 JSON export，让结果可附加到后续 repo-backed archive 或 operator note。",
          ],
          extensionSurfaces: "扩展 surface",
          vendorSessionPages: "Vendor session 页面",
        },
        links: {
          sidePanel: {
            settings: "打开设置",
            dashboard: "打开 dashboard",
            "cursor-detail": "打开 Cursor 详情",
            "codex-detail": "打开 Codex 详情",
            popup: "打开 popup",
          },
          vendor: {
            "cursor-session-page": "打开 Cursor usage 页面",
            "codex-session-page": "打开 Codex analytics 页面",
          },
        },
        outputs: {
          eyebrow: "可复制输出",
          title: "Summary 与 JSON 证据",
          detail:
            "这些输出保持只读。它们会准确反映上方显示的当前工作台状态，并可在手动 extension-mode 或真实 session pass 之后复制。",
          copySummary: "复制 summary",
          downloadSummary: "下载 summary",
          copyJson: "复制 JSON",
          downloadJson: "下载 JSON",
          openSettingsTab: "在新标签页打开设置",
          summaryDraft: "Summary 草稿",
          jsonExport: "JSON export",
          copiedSummary: "已复制当前主题恢复 summary。",
          downloadedSummary: "已下载当前主题恢复 summary。",
          copiedJson: "已复制当前主题恢复 JSON export。",
          downloadedJson: "已下载当前主题恢复 JSON export。",
          clipboardUnavailable: "当前上下文无法访问 clipboard。",
          downloadUnavailable: "当前上下文无法直接下载。",
          workspaceNote: "工作台备注",
        },
      },
    } as const;
  }

  return {
    interactionAudit: {
      topbar: {
        title: "Interaction Audit",
        subtitle: "Real-browser QA hub",
        openDashboard: "Open dashboard",
        openSettings: "Open settings",
      },
      hero: {
        eyebrow: "Audit Hub",
        title: "Manual interaction review without repeated resizing",
        detail:
          "This page embeds the real shipped dashboard, settings, provider-detail, and popup surfaces inside fixed-width frames so real-browser review can focus on hover, focus, pressed, and compact-width behavior instead of repeatedly reopening routes. The audit hub now follows the same shared theme preferences as the shipped side panel and popup.",
        chip: "Manual QA · Fixed-width frames",
      },
      guidance: {
        eyebrow: "How To Use",
        title: "Review guidance",
        detail:
          "Open this route in a normal browser tab or extension page when you want a human pass after the automated review scripts. The embedded frames preserve representative widths even when the outer browser window is larger.",
        checks: [
          "Hover interactive controls and confirm the state layer still feels coherent across pages.",
          "Use keyboard tab focus across the embedded surfaces and confirm focus visibility stays explicit.",
          "Use the preset actions below to open disclosures, focus controls, or reveal lower detail notes before signing off a UI slice.",
        ],
        openDashboard: "Open dashboard",
        openSettings: "Open settings",
        openPopup: "Open popup",
      },
      signoff: {
        eyebrow: "Signoff Workspace",
        title: "Current operator draft",
        detail:
          "Use the controls inside each audit surface to record check progress, reviewer notes, and pass-versus-follow-up state. The draft below updates live from the current workspace state.",
        reviewedSurfaces: "Reviewed surfaces",
        pass: "Pass",
        followUp: "Follow-up",
        completedChecks: "Completed checks",
        reviewerName: "Reviewer name",
        reviewerPlaceholder: "Record the reviewer or operator name.",
        sessionLabel: "Session label",
        sessionPlaceholder: "Label this pass, for example Compact QA Pass.",
        reviewedAt: "Reviewed at",
        reviewedAtPlaceholder: "Use ISO-8601 time or stamp the current review moment.",
        stampCurrentTime: "Stamp current time",
        reviewSession: "Review session",
        reviewerPrefix: "Reviewer",
        sessionPrefix: "Session",
        reviewedAtPrefix: "Reviewed at",
        notSet: "not set",
        requestBindingPrefix: "Request binding",
        requestRevisionPrefix: "Request revision",
        requestScope: "Request Scope",
        boundRequestDetail:
          "This workspace is bound to one repo-backed pending request. Use preflight and completion against that request instead of the ad-hoc archive path.",
        adHocDetail:
          "This workspace is not bound to a repo-backed request. Use the archive path unless a pending request template is imported first.",
        repoBackedRequest: "Repo-backed request",
        adHocWorkspace: "Ad-hoc audit workspace",
        binding: "Binding",
        requestRevision: "Request revision",
        downloadIdentity: "Download identity",
        downloadsBound:
          "Downloads include the bound request id and request revision.",
        downloadsAdHoc: "Downloads stay session-scoped only.",
      },
    },
    themeRecovery: {
      topbar: {
        title: "Theme Recovery Review",
        subtitle: "Operator workspace",
        refresh: "Refresh",
        openSettings: "Open settings",
      },
      hero: {
        eyebrow: "Real-session follow-up",
        title: "One place to stage native-prompt and real-session recovery checks",
        detail:
          "This route does not claim that the native host prompt or a real vendor session already passed. It collects the current theme state, recovery state, quick links, and copyable evidence so the next operator pass can stay truthful and repeatable.",
        chip: "Theme QA · Recovery follow-up",
      },
      loading: {
        title: "Loading current review state...",
        detail:
          "Reading the current app state and action badge so this workspace can reflect the same theme and provider state as the shipped surfaces.",
      },
      error: {
        title: "Could not load review state",
      },
      currentTruth: {
        eyebrow: "Current truth",
        title: "Recovery status right now",
        reviewStage: "Review stage",
        popupSnapshot: "Popup snapshot",
        actionBadge: "Action badge",
      },
      themeState: {
        eyebrow: "Theme state",
        title: "Shared runtime state",
        detail:
          "This workspace reads the same saved theme settings used by the side panel, popup, and audit hub. The operator pass should keep the current custom-seed state fixed while recovering provider access.",
        themeMode: "Theme mode",
        resolvedMode: "Resolved mode",
        accentPreset: "Accent preset",
        customSeed: "Custom seed",
        scopeIsolation: "Scope isolation",
        liveBadgeSource: "Live badge source",
        notSet: "Not set",
        computedBadgeSource: "Computed from current app state",
        scopeNote: "Scope note",
        popupSnapshotPrefix: "Popup snapshot",
        actionBadgeTitlePrefix: "Action badge title",
      },
      requestScope: {
        eyebrow: "Request scope",
        title: "Repo-backed request binding",
        detail:
          "This workspace is bound to one pending theme-recovery request. Summary and JSON exports should preserve this request identity so completion cannot accidentally fulfill a different request.",
        requestId: "Request id",
        createdAt: "Created at",
        boundWorkspaceRoute: "Bound workspace route",
        adHocTitle: "Ad-hoc workspace",
        adHocDetail:
          "This review route is not currently bound to a repo-backed request. Its exports are still useful for local inspection, but they should not be used to fulfill a pending request.",
      },
      workflow: {
        eyebrow: "Operator workflow",
        title: "Real-session follow-up steps",
        detail:
          "Keep this page open while switching between Settings, popup, and the target vendor pages. Use the links below to open the exact shipped surfaces in separate tabs without losing this workspace.",
        steps: [
          "Keep the current custom seed fixed and confirm the workspace still reports the expected theme mode, resolved mode, preset, and seed.",
          "Use Settings to keep only Cursor and Codex visible before trusting popup alignment and the action badge.",
          "Capture the degraded state first: missing host access or a blocked real session should keep this page in a warning state.",
          "Grant host access through the native prompt or restore the real vendor session, then refresh this page and confirm the review stage returns to recovered.",
          "Copy the summary or JSON export after the real pass so the result can be attached to a later repo-backed archive or operator note.",
        ],
        extensionSurfaces: "Extension surfaces",
        vendorSessionPages: "Vendor session pages",
      },
      links: {
        sidePanel: {
          settings: "Open settings",
          dashboard: "Open dashboard",
          "cursor-detail": "Open Cursor detail",
          "codex-detail": "Open Codex detail",
          popup: "Open popup",
        },
        vendor: {
          "cursor-session-page": "Open Cursor usage page",
          "codex-session-page": "Open Codex analytics page",
        },
      },
      outputs: {
        eyebrow: "Copyable outputs",
        title: "Summary and JSON evidence",
        detail:
          "These outputs stay read-only. They reflect the current workspace state exactly as shown above and can be copied after a manual extension-mode or real-session pass.",
        copySummary: "Copy summary",
        downloadSummary: "Download summary",
        copyJson: "Copy JSON",
        downloadJson: "Download JSON",
        openSettingsTab: "Open settings in new tab",
        summaryDraft: "Summary draft",
        jsonExport: "JSON export",
        copiedSummary: "Copied the current theme recovery summary.",
        downloadedSummary: "Downloaded the current theme recovery summary.",
        copiedJson: "Copied the current theme recovery JSON export.",
        downloadedJson: "Downloaded the current theme recovery JSON export.",
        clipboardUnavailable: "Clipboard access is not available in this context.",
        downloadUnavailable: "Direct download is not available in this context.",
        workspaceNote: "Workspace note",
      },
    },
  };
}

export function buildStoreWorkflowLocalizedCopy(i18n: RuntimeI18n) {
  if (i18n.resolvedLocale === "zh-CN") {
    const presetHeadlines: Record<string, string> = {
      "toolbar-first-quick-glance": "Toolbar-first 快速概览 seed 已应用",
      "setup-guidance": "Setup guidance seed 已应用",
      "honest-contract-or-policy-only": "Contract-only seed 已应用",
      "settings-and-setup-depth": "Settings depth seed 已应用",
      "provider-or-dashboard-depth": "Provider depth seed 已应用",
      unlock: "截图 seed lock 已清除",
    };
    const presetDetails: Record<string, string> = {
      "toolbar-first-quick-glance":
        "Cursor、Claude Code 和 Codex 会在一个健康、以 popup 为中心的运行时状态里可见，用于第一张 storyboard 截图。",
      "setup-guidance":
        "Cursor 缺少 host access，Codex 缺少 workspace credentials，因此 popup 可以真实展示 setup guidance。",
      "honest-contract-or-policy-only":
        "Gemini 是唯一可见 provider，因此 popup 会真实展示 policy-only 覆盖面，而不是伪造 live precision。",
      "settings-and-setup-depth":
        "同一组混合 setup blockers 会被保留，让 Settings 承担 setup story，而不是让 popup 承担。",
      "provider-or-dashboard-depth":
        "Codex 会以 warning 但真实的详情复查状态可见，让 side panel 证明更深的 contract context。",
      unlock:
        "临时 store-screenshot seed lock 已移除。下一次正常打开 side panel 会回到常规 init flow。",
    };
    const submissionCaptions: Record<string, string> = {
      "toolbar-first-quick-glance":
        "在一个快速 popup 概览中查看可见 AI 工具状态。",
      "setup-guidance":
        "当访问权限或凭据缺失时，明确下一步配置动作。",
      "honest-contract-or-policy-only":
        "真实展示 provider 覆盖范围，不伪造不支持的 live usage。",
      "settings-and-setup-depth":
        "用 side panel 承担配置所有权和更深控制。",
      "provider-or-dashboard-depth":
        "当 popup 需要更多上下文时，打开更深的 provider 复查。",
    };

    return {
      screenshotSeed: {
        sectionLabel: "Store Screenshot 调试路由",
        applyingTitle: "正在应用截图 preset",
        failedTitle: "截图 preset 失败",
        applyingDetail: (preset: string) =>
          `扩展正在把 request-bound 截图 preset \`${preset}\` 应用到真实运行时存储。`,
        routeContractLabel: "路由合同",
        seedRouteFailedTitle: "Seed route 失败",
        internalToolingOnlyTitle: "仅限内部工具",
        contractDetail:
          "这个页面只用于在捕获 popup 或 side-panel 截图之前，seed 真实 extension-mode 运行时状态。它本身不是 store-facing 截图 surface。",
        temporaryLockActiveDetail:
          "临时 side-panel seed lock 会保持启用，直到 unlock preset 运行。",
        unlockRestoredDetail:
          "截图 seed lock 已清除，之前的扩展运行时状态也已恢复。",
        unlockNoBackupDetail:
          "临时 store-screenshot seed lock 已移除，但没有可恢复的 pre-seed 运行时状态，因此只清除了临时 lock。",
        submissionCaptionLabel: "提交支撑 caption",
        submissionCaptionDetail:
          "这个 caption 只帮助操作员确认当前 preset 对应的 store-listing story；它不会被注入最终 popup、side panel 或 full-page 截图。",
        presetHeadline: (preset: string, fallback: string) =>
          presetHeadlines[preset] ?? fallback,
        presetDetail: (preset: string, fallback: string) =>
          presetDetails[preset] ?? fallback,
        submissionCaption: (preset: string) =>
          submissionCaptions[preset] ?? "",
        routeFailedFallback: "截图 seed route 意外失败。",
      },
      nativePopupProbe: {
        sectionLabel: "Store Screenshot 调试路由",
        openingTitle: "正在打开原生 toolbar popup",
        requestedTitle: "已请求原生 popup",
        failedTitle: "原生 popup probe 失败",
        openingDetail:
          "这个辅助页面会要求 background service worker 调用 chrome.action.openPopup，让 RDP Chrome 暴露真实 toolbar bubble，而不是 popup app-window smoke helper。",
        acceptedMessage:
          "Chrome 已接受原生 toolbar action-popup 请求。只需让这个 probe 窗口保持打开到 RDP helper 检测并捕获 popup 为止。",
        routeContractLabel: "路由合同",
        didNotOpenTitle: "原生 popup 未打开",
        internalToolingOnlyTitle: "仅限内部工具",
        contractDetail:
          "这个页面只用于真实 RDP Chrome popup probing。它本身不是 store-facing 截图 surface，并且应在原生 toolbar bubble 被捕获或判定失败后关闭。",
      },
    } as const;
  }

  const presetHeadlines: Record<string, string> = {
    "toolbar-first-quick-glance": "Toolbar-first quick glance seed applied",
    "setup-guidance": "Setup guidance seed applied",
    "honest-contract-or-policy-only": "Contract-only seed applied",
    "settings-and-setup-depth": "Settings depth seed applied",
    "provider-or-dashboard-depth": "Provider depth seed applied",
    unlock: "Screenshot seed lock cleared",
  };
  const presetDetails: Record<string, string> = {
    "toolbar-first-quick-glance":
      "Cursor, Claude Code, and Codex are visible in one healthy popup-focused runtime state for the first storyboard screenshot.",
    "setup-guidance":
      "Cursor is missing host access and Codex is missing workspace credentials so the popup can truthfully show setup guidance.",
    "honest-contract-or-policy-only":
      "Gemini is the only visible provider so the popup truthfully shows policy-only coverage without faking live precision.",
    "settings-and-setup-depth":
      "The same mixed setup blockers are preserved so Settings can own the setup story instead of the popup.",
    "provider-or-dashboard-depth":
      "Codex is visible in a warning but truthful detail-review state so the side panel can prove deeper contract context.",
    unlock:
      "The temporary store-screenshot seed lock was removed. The next normal side-panel open will re-enter the regular init flow.",
  };
  const submissionCaptions: Record<string, string> = {
    "toolbar-first-quick-glance":
      "Check visible AI tool status in one quick popup glance.",
    "setup-guidance":
      "Know the next setup step when access or credentials are missing.",
    "honest-contract-or-policy-only":
      "See honest provider coverage without faking unsupported live usage.",
    "settings-and-setup-depth":
      "Use the side panel for setup ownership and deeper controls.",
    "provider-or-dashboard-depth":
      "Open deeper provider review when the popup needs more context.",
  };

  return {
    screenshotSeed: {
      sectionLabel: "Store Screenshot Debug Route",
      applyingTitle: "Applying screenshot preset",
      failedTitle: "Screenshot preset failed",
      applyingDetail: (preset: string) =>
        `The extension is applying the request-bound screenshot preset \`${preset}\` to real runtime storage now.`,
      routeContractLabel: "Route Contract",
      seedRouteFailedTitle: "Seed route failed",
      internalToolingOnlyTitle: "Internal tooling only",
      contractDetail:
        "This page exists only to seed truthful extension-mode runtime states before capturing popup or side-panel screenshots. It is not itself a store-facing screenshot surface.",
      temporaryLockActiveDetail:
        "The temporary side-panel seed lock is active until the unlock preset runs.",
      unlockRestoredDetail:
        "The screenshot seed lock was cleared and the previous extension runtime state was restored.",
      unlockNoBackupDetail:
        "The temporary store-screenshot seed lock was removed. No stored pre-seed runtime state was available to restore, so only the temporary lock was cleared.",
      submissionCaptionLabel: "Submission-support caption",
      submissionCaptionDetail:
        "This caption only helps the operator match the current preset to the store-listing story. It is not injected into the final popup, side-panel, or full-page screenshot.",
      presetHeadline: (preset: string, fallback: string) =>
        presetHeadlines[preset] ?? fallback,
      presetDetail: (preset: string, fallback: string) =>
        presetDetails[preset] ?? fallback,
      submissionCaption: (preset: string) =>
        submissionCaptions[preset] ?? "",
      routeFailedFallback: "The screenshot seed route failed unexpectedly.",
    },
    nativePopupProbe: {
      sectionLabel: "Store Screenshot Debug Route",
      openingTitle: "Opening native toolbar popup",
      requestedTitle: "Native popup requested",
      failedTitle: "Native popup probe failed",
      openingDetail:
        "This helper page asks the background service worker to call chrome.action.openPopup so RDP Chrome can expose the real toolbar bubble instead of the popup app-window smoke helper.",
      acceptedMessage:
        "Chrome accepted the native toolbar action-popup request. Keep this probe window open only long enough for the RDP helper to detect and capture the popup.",
      routeContractLabel: "Route Contract",
      didNotOpenTitle: "Native popup did not open",
      internalToolingOnlyTitle: "Internal tooling only",
      contractDetail:
        "This page exists only for truthful RDP Chrome popup probing. It is not itself a store-facing screenshot surface and should be closed once the native toolbar bubble is captured or rejected.",
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
