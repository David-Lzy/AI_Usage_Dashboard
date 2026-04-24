import type { AppLocalePreference } from "../providers/types";
import type { ResolvedThemeMode } from "./theme";

export type ResolvedAppLocale = "en" | "zh-CN";

export const DEFAULT_APP_LOCALE_PREFERENCE: AppLocalePreference = "system";

type RuntimeMessageId =
  | "app.loading.eyebrow"
  | "app.loading.title"
  | "app.loading.detail"
  | "app.error.eyebrow"
  | "app.error.title"
  | "app.error.detail_fallback"
  | "common.actions.retry"
  | "common.actions.settings"
  | "common.actions.refresh"
  | "common.actions.refresh_all"
  | "common.actions.back"
  | "common.actions.open_dashboard"
  | "common.actions.open_settings"
  | "common.actions.open_dashboard_tab"
  | "common.actions.tab"
  | "common.theme.toggle_to_dark_label"
  | "common.theme.toggle_to_dark_title"
  | "common.theme.toggle_to_light_label"
  | "common.theme.toggle_to_light_title"
  | "dashboard.topbar.title"
  | "dashboard.topbar.subtitle"
  | "dashboard.hero.eyebrow"
  | "dashboard.hero.title"
  | "dashboard.hero.detail"
  | "dashboard.hero.release_chip"
  | "dashboard.providers.eyebrow"
  | "dashboard.providers.title"
  | "dashboard.providers.detail"
  | "dashboard.providers.aria"
  | "dashboard.empty.eyebrow"
  | "dashboard.empty.detail"
  | "dashboard.summary.aria"
  | "dashboard.summary.visible"
  | "dashboard.summary.healthy"
  | "dashboard.summary.needs_access"
  | "dashboard.summary.needs_attention"
  | "popup.loading.eyebrow"
  | "popup.loading.title"
  | "popup.loading.detail"
  | "popup.error.eyebrow"
  | "popup.error.title"
  | "popup.header.eyebrow"
  | "popup.header.title"
  | "popup.summary.aria"
  | "popup.guidance.eyebrow"
  | "popup.snapshot_status.eyebrow"
  | "popup.actions.eyebrow"
  | "popup.actions.refresh"
  | "popup.actions.refreshing"
  | "popup.featured.eyebrow"
  | "popup.featured.single_eyebrow"
  | "popup.triage.eyebrow"
  | "popup.summary.visible"
  | "popup.summary.live_ready"
  | "popup.summary.setup_blockers"
  | "popup.summary.policy_only";

type RuntimeMessages = Record<RuntimeMessageId, string>;

type LocaleReader = {
  navigator?: { language?: string | undefined } | undefined;
  chrome?: { i18n?: { getUILanguage?: (() => string) | undefined } | undefined } | undefined;
};

export type RuntimeI18n = {
  localePreference: AppLocalePreference;
  resolvedLocale: ResolvedAppLocale;
  t: (id: RuntimeMessageId) => string;
  formatNumber: (value: number) => string;
};

const RUNTIME_MESSAGES: Record<ResolvedAppLocale, RuntimeMessages> = {
  en: {
    "app.loading.eyebrow": "Loading",
    "app.loading.title": "Preparing dashboard state",
    "app.loading.detail": "Initializing the dashboard store and message bus.",
    "app.error.eyebrow": "State Unavailable",
    "app.error.title": "Initialization did not complete",
    "app.error.detail_fallback": "The app state could not be loaded from extension storage or local preview storage.",
    "common.actions.retry": "Retry",
    "common.actions.settings": "Settings",
    "common.actions.refresh": "Refresh",
    "common.actions.refresh_all": "Refresh All",
    "common.actions.back": "Back",
    "common.actions.open_dashboard": "Open dashboard",
    "common.actions.open_settings": "Open settings",
    "common.actions.open_dashboard_tab": "Open dashboard tab",
    "common.actions.tab": "Tab",
    "common.theme.toggle_to_dark_label": "Dark",
    "common.theme.toggle_to_dark_title": "Switch to dark mode",
    "common.theme.toggle_to_light_label": "Light",
    "common.theme.toggle_to_light_title": "Switch to light mode",
    "dashboard.topbar.title": "AI Usage Dashboard",
    "dashboard.topbar.subtitle": "Usage, credits, and sync health",
    "dashboard.hero.eyebrow": "Overview",
    "dashboard.hero.title": "One panel for AI coding quotas",
    "dashboard.hero.detail": "Official APIs, documented quota policies, and guarded page-parse sources are collected into one release-ready dashboard for refreshes, settings, and provider drill-downs.",
    "dashboard.hero.release_chip": "Material 3 · Release Candidate",
    "dashboard.providers.eyebrow": "Providers",
    "dashboard.providers.title": "Provider cards",
    "dashboard.providers.detail": "Cards are ordered by severity first, then current access gaps, so the highest-risk providers stay at the top of the dashboard while still exposing the current product contract at a glance.",
    "dashboard.providers.aria": "Provider cards",
    "dashboard.empty.eyebrow": "No Visible Providers",
    "dashboard.empty.detail": "Enable at least one provider in Settings to restore the dashboard feed.",
    "dashboard.summary.aria": "Dashboard summary",
    "dashboard.summary.visible": "Visible",
    "dashboard.summary.healthy": "Healthy",
    "dashboard.summary.needs_access": "Needs Access",
    "dashboard.summary.needs_attention": "Needs Attention",
    "popup.loading.eyebrow": "Toolbar Popup",
    "popup.loading.title": "Loading cached dashboard state",
    "popup.loading.detail": "Preparing the shared quota snapshot for this browser profile.",
    "popup.error.eyebrow": "Toolbar Popup",
    "popup.error.title": "Popup load failed",
    "popup.header.eyebrow": "Toolbar Popup",
    "popup.header.title": "Quick glance",
    "popup.summary.aria": "Popup top summary",
    "popup.guidance.eyebrow": "Popup Guidance",
    "popup.snapshot_status.eyebrow": "Snapshot Status",
    "popup.actions.eyebrow": "Other route",
    "popup.actions.refresh": "Refresh",
    "popup.actions.refreshing": "Refreshing",
    "popup.featured.eyebrow": "Featured providers",
    "popup.featured.single_eyebrow": "Featured provider",
    "popup.triage.eyebrow": "Popup Triage",
    "popup.summary.visible": "Visible",
    "popup.summary.live_ready": "Live ready",
    "popup.summary.setup_blockers": "Setup blockers",
    "popup.summary.policy_only": "Policy-only",
  },
  "zh-CN": {
    "app.loading.eyebrow": "加载中",
    "app.loading.title": "正在准备仪表板状态",
    "app.loading.detail": "正在初始化仪表板存储和消息总线。",
    "app.error.eyebrow": "状态不可用",
    "app.error.title": "初始化未完成",
    "app.error.detail_fallback": "无法从扩展存储或本地预览存储加载应用状态。",
    "common.actions.retry": "重试",
    "common.actions.settings": "设置",
    "common.actions.refresh": "刷新",
    "common.actions.refresh_all": "全部刷新",
    "common.actions.back": "返回",
    "common.actions.open_dashboard": "打开仪表板",
    "common.actions.open_settings": "打开设置",
    "common.actions.open_dashboard_tab": "打开仪表板标签页",
    "common.actions.tab": "标签页",
    "common.theme.toggle_to_dark_label": "夜间",
    "common.theme.toggle_to_dark_title": "切换到夜间模式",
    "common.theme.toggle_to_light_label": "白天",
    "common.theme.toggle_to_light_title": "切换到白天模式",
    "dashboard.topbar.title": "AI 用量仪表板",
    "dashboard.topbar.subtitle": "用量、额度与同步健康",
    "dashboard.hero.eyebrow": "概览",
    "dashboard.hero.title": "一个面板掌握 AI 编码配额",
    "dashboard.hero.detail": "官方 API、文档化配额策略与受控页面解析路径，被收敛到一个可发布的仪表板里，用于刷新、设置和 Provider 深入查看。",
    "dashboard.hero.release_chip": "Material 3 · 发布候选",
    "dashboard.providers.eyebrow": "Provider",
    "dashboard.providers.title": "Provider 卡片",
    "dashboard.providers.detail": "卡片先按严重程度排序，再按当前访问缺口排序，让高风险 provider 保持在顶部，同时保留当前产品合同的一眼可见性。",
    "dashboard.providers.aria": "Provider 卡片",
    "dashboard.empty.eyebrow": "没有可见 Provider",
    "dashboard.empty.detail": "请先在设置中启用至少一个 Provider，恢复仪表板内容流。",
    "dashboard.summary.aria": "仪表板摘要",
    "dashboard.summary.visible": "可见",
    "dashboard.summary.healthy": "健康",
    "dashboard.summary.needs_access": "需授权",
    "dashboard.summary.needs_attention": "需关注",
    "popup.loading.eyebrow": "工具栏弹窗",
    "popup.loading.title": "正在加载缓存的仪表板状态",
    "popup.loading.detail": "正在为此浏览器配置文件准备共享配额快照。",
    "popup.error.eyebrow": "工具栏弹窗",
    "popup.error.title": "弹窗加载失败",
    "popup.header.eyebrow": "工具栏弹窗",
    "popup.header.title": "快速概览",
    "popup.summary.aria": "弹窗顶部摘要",
    "popup.guidance.eyebrow": "弹窗引导",
    "popup.snapshot_status.eyebrow": "快照状态",
    "popup.actions.eyebrow": "其他入口",
    "popup.actions.refresh": "刷新",
    "popup.actions.refreshing": "刷新中",
    "popup.featured.eyebrow": "重点 Provider",
    "popup.featured.single_eyebrow": "重点 Provider",
    "popup.triage.eyebrow": "弹窗分诊",
    "popup.summary.visible": "可见",
    "popup.summary.live_ready": "可实时同步",
    "popup.summary.setup_blockers": "配置阻塞",
    "popup.summary.policy_only": "仅策略",
  },
};

function mapLanguageToLocale(language: string | null | undefined): ResolvedAppLocale {
  return typeof language === "string" && language.toLowerCase().startsWith("zh")
    ? "zh-CN"
    : "en";
}

function readUiLanguage(reader?: LocaleReader): string | undefined {
  const readerUiLanguage = reader?.chrome?.i18n?.getUILanguage?.();

  if (typeof readerUiLanguage === "string" && readerUiLanguage.trim().length > 0) {
    return readerUiLanguage;
  }

  if (typeof chrome !== "undefined" && typeof chrome.i18n?.getUILanguage === "function") {
    const chromeUiLanguage = chrome.i18n.getUILanguage();

    if (typeof chromeUiLanguage === "string" && chromeUiLanguage.trim().length > 0) {
      return chromeUiLanguage;
    }
  }

  return reader?.navigator?.language ?? (typeof navigator !== "undefined" ? navigator.language : undefined);
}

export function normalizeAppLocalePreference(value: unknown): AppLocalePreference {
  return value === "system" || value === "en" || value === "zh-CN"
    ? value
    : DEFAULT_APP_LOCALE_PREFERENCE;
}

export function resolveAppLocale(
  localePreference: AppLocalePreference,
  reader?: LocaleReader,
): ResolvedAppLocale {
  const normalizedPreference = normalizeAppLocalePreference(localePreference);

  if (normalizedPreference !== "system") {
    return normalizedPreference;
  }

  return mapLanguageToLocale(readUiLanguage(reader));
}

export function createRuntimeI18n(
  localePreference: AppLocalePreference,
  reader?: LocaleReader,
): RuntimeI18n {
  const normalizedPreference = normalizeAppLocalePreference(localePreference);
  const resolvedLocale = resolveAppLocale(normalizedPreference, reader);

  return {
    localePreference: normalizedPreference,
    resolvedLocale,
    t: (id) => RUNTIME_MESSAGES[resolvedLocale][id] ?? RUNTIME_MESSAGES.en[id],
    formatNumber: (value) => new Intl.NumberFormat(resolvedLocale).format(value),
  };
}

export function buildDashboardSummaryLabels(i18n: RuntimeI18n) {
  return {
    visible: i18n.t("dashboard.summary.visible"),
    healthy: i18n.t("dashboard.summary.healthy"),
    needsAccess: i18n.t("dashboard.summary.needs_access"),
    needsAttention: i18n.t("dashboard.summary.needs_attention"),
  } as const;
}

export function buildPopupSummaryLabels(i18n: RuntimeI18n) {
  return {
    visible: i18n.t("popup.summary.visible"),
    liveReady: i18n.t("popup.summary.live_ready"),
    setupBlockers: i18n.t("popup.summary.setup_blockers"),
    policyOnly: i18n.t("popup.summary.policy_only"),
  } as const;
}

export function getQuickThemeToggleCopy(
  nextMode: ResolvedThemeMode,
  i18n: RuntimeI18n,
) {
  return nextMode === "dark"
    ? {
        label: i18n.t("common.theme.toggle_to_dark_label"),
        title: i18n.t("common.theme.toggle_to_dark_title"),
      }
    : {
        label: i18n.t("common.theme.toggle_to_light_label"),
        title: i18n.t("common.theme.toggle_to_light_title"),
      };
}
