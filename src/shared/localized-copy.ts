import type {
  ProviderDiagnostic,
  ProviderDiagnosticParams,
  ProviderSourceKind,
  ProviderSourcePreference,
} from "../providers/types";
import type { RuntimeI18n } from "./i18n";
export { buildOperatorWorkspaceLocalizedCopy } from "./operator-workspace-localized-copy";
export { buildPopupLocalizedCopy } from "./popup-localized-copy";
export {
  buildProviderDetailLocalizedCopy,
  getPermissionStatusLabel,
  getProviderDetailStatusBadgeLabel,
} from "./provider-detail-localized-copy";
export { buildProviderSourceDisplayLocalizedCopy } from "./provider-source-display-localized-copy";
export {
  buildSettingsLocalizedCopy,
  getSettingsSourceKindLabel,
  getSettingsSourcePreferenceLabel,
} from "./settings-localized-copy";
export { buildStoreWorkflowLocalizedCopy } from "./store-workflow-localized-copy";

export type ProviderDiagnosticPresentation = {
  label: string;
  summary: string;
};

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
