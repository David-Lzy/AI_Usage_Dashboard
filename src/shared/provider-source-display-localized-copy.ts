import type { RuntimeI18n } from "./i18n";
import { getProviderSourceDisplayExtendedCopy } from "./provider-source-display-extended-localized-copy";
import {
  DEFAULT_PROVIDER_SOURCE_DISPLAY_COPY,
  type ProviderSourceDisplayCopy,
} from "./provider-sources";

export function buildProviderSourceDisplayLocalizedCopy(
  i18n: RuntimeI18n,
): ProviderSourceDisplayCopy {
  if (i18n.resolvedLocale !== "zh-CN") {
    return (
      getProviderSourceDisplayExtendedCopy(i18n.resolvedLocale) ??
      DEFAULT_PROVIDER_SOURCE_DISPLAY_COPY
    );
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
      shipped_admin_analytics: "已提供管理员分析",
      shipped_enterprise_analytics: "已提供企业分析",
      shipped_personal_partial: "已提供部分个人数据",
      shipped_policy_only: "仅政策已提供",
      deferred_personal_page: "个人页面已暂缓",
      deferred_project_metrics: "项目指标已暂缓",
      deferred_org_console: "组织控制台路径已暂缓",
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
