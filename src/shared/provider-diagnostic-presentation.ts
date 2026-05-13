import type {
  ProviderDiagnostic,
  ProviderDiagnosticParams,
  ProviderSourceKind,
} from "../providers/types";
import type { RuntimeI18n } from "./i18n";
import { getSourceDiagnosticPresentation } from "./provider-diagnostic-source-copy";
import { getWarningDiagnosticPresentation } from "./provider-diagnostic-warning-copy";

export type ProviderDiagnosticPresentation = {
  label: string;
  summary: string;
};

function getStringParam(
  params: ProviderDiagnosticParams | undefined,
  key: string,
): string | null {
  const value = params?.[key];
  const normalizedValue = typeof value === "string" ? value.trim() : "";

  return normalizedValue ? normalizedValue : null;
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
  const warningPresentation = getWarningDiagnosticPresentation(diagnostic, i18n);
  const sourcePresentation = getSourceDiagnosticPresentation(diagnostic, i18n);

  if (warningPresentation) {
    return warningPresentation;
  }

  if (sourcePresentation) {
    return sourcePresentation;
  }

  switch (diagnostic.code) {
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
