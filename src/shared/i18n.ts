import type { AppLocalePreference } from "../providers/types";
import type { ResolvedThemeMode } from "./theme";

export type ResolvedAppLocale = "en" | "zh-CN";
export type ResolvedTextDirection = "ltr" | "rtl";

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
  | "common.actions.open_settings_tab"
  | "common.actions.tab"
  | "common.actions.save"
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
  | "popup.summary.policy_only"
  | "settings.topbar.title"
  | "settings.topbar.subtitle"
  | "settings.overview.eyebrow"
  | "settings.overview.title"
  | "settings.overview.detail"
  | "settings.overview.aria"
  | "settings.sections.aria"
  | "settings.sections.preferences"
  | "settings.sections.visibility"
  | "settings.sections.credentials"
  | "settings.sections.sources"
  | "settings.sections.permissions"
  | "settings.summary.visible"
  | "settings.summary.stored_secrets"
  | "settings.summary.bound_pages"
  | "settings.summary.needs_access"
  | "settings.preferences.eyebrow"
  | "settings.preferences.sync_interval_label"
  | "settings.preferences.warning_threshold_label"
  | "settings.preferences.locale_label"
  | "settings.preferences.theme_mode_label"
  | "settings.preferences.accent_preset_label"
  | "settings.preferences.minutes"
  | "settings.preferences.locale.system"
  | "settings.preferences.locale.en"
  | "settings.preferences.locale.zh_cn"
  | "settings.preferences.theme_mode.system"
  | "settings.preferences.theme_mode.light"
  | "settings.preferences.theme_mode.dark"
  | "settings.preferences.theme_preset.default"
  | "settings.preferences.theme_preset.meadow"
  | "settings.preferences.theme_preset.sunset"
  | "settings.preferences.theme_preset.custom"
  | "settings.theme_customization.eyebrow"
  | "settings.theme_customization.title"
  | "settings.theme_customization.detail"
  | "settings.theme_customization.seed_label"
  | "settings.theme_customization.apply"
  | "settings.theme_customization.reset"
  | "settings.theme_customization.preview.aria"
  | "settings.theme_customization.preview.primary"
  | "settings.theme_customization.preview.secondary_container"
  | "settings.theme_customization.preview.tertiary"
  | "settings.visibility.eyebrow"
  | "settings.visibility.enabled_detail"
  | "settings.visibility.disabled_detail"
  | "settings.credentials.eyebrow"
  | "settings.credentials.title"
  | "settings.credentials.detail"
  | "settings.sources.eyebrow"
  | "settings.sources.title"
  | "settings.sources.detail"
  | "settings.permissions.eyebrow"
  | "settings.permissions.title"
  | "settings.permissions.detail"
  | "settings.toast.preferences_saved_title"
  | "settings.toast.preferences_saved_detail";

type RuntimeMessages = Record<RuntimeMessageId, string>;

type LocaleReader = {
  navigator?: { language?: string | undefined } | undefined;
  chrome?: { i18n?: { getUILanguage?: (() => string) | undefined } | undefined } | undefined;
  location?: { search?: string | undefined } | undefined;
};

type RuntimeLocaleAttributeTarget = {
  lang: string;
  dir: string;
  dataset?: DOMStringMap | Record<string, string | undefined> | undefined;
};

export type RuntimeI18n = {
  localePreference: AppLocalePreference;
  resolvedLocale: ResolvedAppLocale;
  resolvedTextDirection: ResolvedTextDirection;
  t: (id: RuntimeMessageId) => string;
  formatNumber: (value: number) => string;
  formatPercentValue: (value: number) => string;
  formatTemporalValue: (rawValue: string) => string | null;
  localizeRelativeRuntimeLabel: (rawValue: string) => string;
  localizeResetRuntimeLabel: (rawValue: string) => string;
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
    "common.actions.open_settings_tab": "Open settings tab",
    "common.actions.tab": "Tab",
    "common.actions.save": "Save",
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
    "settings.topbar.title": "Settings",
    "settings.topbar.subtitle": "Dashboard preferences and access",
    "settings.overview.eyebrow": "Settings Overview",
    "settings.overview.title": "Control surface summary",
    "settings.overview.detail": "Use this screen to manage visibility, permissions, credentials, and hybrid source controls. Jump directly to the section you need instead of scanning the full page top to bottom.",
    "settings.overview.aria": "Settings overview",
    "settings.sections.aria": "Settings sections",
    "settings.sections.preferences": "Preferences",
    "settings.sections.visibility": "Visibility",
    "settings.sections.credentials": "Credentials",
    "settings.sections.sources": "Sources",
    "settings.sections.permissions": "Permissions",
    "settings.summary.visible": "Visible",
    "settings.summary.stored_secrets": "Stored Secrets",
    "settings.summary.bound_pages": "Bound Pages",
    "settings.summary.needs_access": "Needs Access",
    "settings.preferences.eyebrow": "Global Preferences",
    "settings.preferences.sync_interval_label": "Default sync interval",
    "settings.preferences.warning_threshold_label": "Warning threshold",
    "settings.preferences.locale_label": "App language",
    "settings.preferences.theme_mode_label": "Theme mode",
    "settings.preferences.accent_preset_label": "Accent preset",
    "settings.preferences.minutes": "minutes",
    "settings.preferences.locale.system": "System",
    "settings.preferences.locale.en": "English",
    "settings.preferences.locale.zh_cn": "Simplified Chinese",
    "settings.preferences.theme_mode.system": "System",
    "settings.preferences.theme_mode.light": "Light",
    "settings.preferences.theme_mode.dark": "Dark",
    "settings.preferences.theme_preset.default": "Default Blue",
    "settings.preferences.theme_preset.meadow": "Meadow",
    "settings.preferences.theme_preset.sunset": "Sunset",
    "settings.preferences.theme_preset.custom": "Custom Seed",
    "settings.theme_customization.eyebrow": "Custom Seed",
    "settings.theme_customization.title": "Validated accent seed",
    "settings.theme_customization.detail": "Use one validated #RRGGBB seed instead of editing individual theme tokens. The generated accent roles stay shared across the side panel, popup, and audit hub.",
    "settings.theme_customization.seed_label": "Custom seed color",
    "settings.theme_customization.apply": "Apply custom seed",
    "settings.theme_customization.reset": "Reset to default",
    "settings.theme_customization.preview.aria": "Custom seed preview",
    "settings.theme_customization.preview.primary": "Primary",
    "settings.theme_customization.preview.secondary_container": "Secondary container",
    "settings.theme_customization.preview.tertiary": "Tertiary",
    "settings.visibility.eyebrow": "Provider Visibility",
    "settings.visibility.enabled_detail": "Visible in the dashboard.",
    "settings.visibility.disabled_detail": "Hidden from the dashboard.",
    "settings.credentials.eyebrow": "Credentials",
    "settings.credentials.title": "Stored secrets and workspace config",
    "settings.credentials.detail": "These cards manage extension-local secrets for supported admin and enterprise paths. Personal session-page routes still avoid cookie export and do not ask for manual auth-header paste.",
    "settings.sources.eyebrow": "Source Connections",
    "settings.sources.title": "Hybrid source contracts",
    "settings.sources.detail": "These cards explain whether each provider currently syncs from an official API, a logged-in page session, or documented quota policy, plus the explicit shipped or deferred product contract for each path.",
    "settings.permissions.eyebrow": "Host Access",
    "settings.permissions.title": "Permission controls",
    "settings.permissions.detail": "In extension mode these actions use chrome.permissions. In browser preview mode they fall back to local state simulation.",
    "settings.toast.preferences_saved_title": "Preferences saved",
    "settings.toast.preferences_saved_detail": "Settings are now persisted in local dashboard state for the preview.",
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
    "common.actions.open_settings_tab": "打开设置标签页",
    "common.actions.tab": "标签页",
    "common.actions.save": "保存",
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
    "settings.topbar.title": "设置",
    "settings.topbar.subtitle": "仪表板偏好与访问控制",
    "settings.overview.eyebrow": "设置概览",
    "settings.overview.title": "控制面摘要",
    "settings.overview.detail": "用这个页面管理可见性、权限、凭据和混合 source 控制。直接跳到你需要的部分，而不是从上到下通读整页。",
    "settings.overview.aria": "设置概览",
    "settings.sections.aria": "设置分区",
    "settings.sections.preferences": "偏好",
    "settings.sections.visibility": "可见性",
    "settings.sections.credentials": "凭据",
    "settings.sections.sources": "来源",
    "settings.sections.permissions": "权限",
    "settings.summary.visible": "可见",
    "settings.summary.stored_secrets": "已存密钥",
    "settings.summary.bound_pages": "已绑定页面",
    "settings.summary.needs_access": "需授权",
    "settings.preferences.eyebrow": "全局偏好",
    "settings.preferences.sync_interval_label": "默认同步间隔",
    "settings.preferences.warning_threshold_label": "告警阈值",
    "settings.preferences.locale_label": "应用语言",
    "settings.preferences.theme_mode_label": "主题模式",
    "settings.preferences.accent_preset_label": "强调色预设",
    "settings.preferences.minutes": "分钟",
    "settings.preferences.locale.system": "跟随系统",
    "settings.preferences.locale.en": "英语",
    "settings.preferences.locale.zh_cn": "简体中文",
    "settings.preferences.theme_mode.system": "跟随系统",
    "settings.preferences.theme_mode.light": "白天",
    "settings.preferences.theme_mode.dark": "夜间",
    "settings.preferences.theme_preset.default": "默认蓝",
    "settings.preferences.theme_preset.meadow": "草地",
    "settings.preferences.theme_preset.sunset": "日落",
    "settings.preferences.theme_preset.custom": "自定义种子",
    "settings.theme_customization.eyebrow": "自定义种子",
    "settings.theme_customization.title": "已校验的强调色种子",
    "settings.theme_customization.detail": "使用一个经过校验的 #RRGGBB 种子，而不是直接编辑单个主题 token。生成出的强调色角色会在侧栏、popup 和 audit hub 中共享。",
    "settings.theme_customization.seed_label": "自定义种子颜色",
    "settings.theme_customization.apply": "应用自定义种子",
    "settings.theme_customization.reset": "恢复默认",
    "settings.theme_customization.preview.aria": "自定义种子预览",
    "settings.theme_customization.preview.primary": "主色",
    "settings.theme_customization.preview.secondary_container": "次级容器",
    "settings.theme_customization.preview.tertiary": "第三色",
    "settings.visibility.eyebrow": "Provider 可见性",
    "settings.visibility.enabled_detail": "在仪表板中可见。",
    "settings.visibility.disabled_detail": "已从仪表板隐藏。",
    "settings.credentials.eyebrow": "凭据",
    "settings.credentials.title": "已存密钥与工作区配置",
    "settings.credentials.detail": "这些卡片管理扩展本地保存的 admin 和 enterprise 路径凭据。个人 session-page 路径仍然避免 cookie 导出，也不会要求手动粘贴 auth header。",
    "settings.sources.eyebrow": "来源连接",
    "settings.sources.title": "混合来源合同",
    "settings.sources.detail": "这些卡片说明每个 provider 当前是通过官方 API、已登录页面会话，还是文档化 quota policy 同步，同时明确每条路径当前是 shipped 还是 deferred 的产品合同。",
    "settings.permissions.eyebrow": "Host 访问",
    "settings.permissions.title": "权限控制",
    "settings.permissions.detail": "在扩展模式下，这些操作使用 chrome.permissions；在浏览器预览模式下，它们会回退到本地状态模拟。",
    "settings.toast.preferences_saved_title": "偏好已保存",
    "settings.toast.preferences_saved_detail": "当前预览的设置已经持久化到本地仪表板状态。",
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

type ParsedTemporalValue = {
  date: Date;
  mode: "date" | "date-time";
  utcExplicit: boolean;
};

function buildUtcDate(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0,
): Date {
  return new Date(Date.UTC(year, month - 1, day, hour, minute));
}

function parseTemporalValue(rawValue: string): ParsedTemporalValue | null {
  const normalizedValue = rawValue.trim();
  let match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalizedValue);

  if (match) {
    return {
      date: buildUtcDate(Number(match[1]), Number(match[2]), Number(match[3])),
      mode: "date",
      utcExplicit: false,
    };
  }

  match = /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/.exec(normalizedValue);

  if (match) {
    return {
      date: buildUtcDate(
        Number(match[1]),
        Number(match[2]),
        Number(match[3]),
        Number(match[4]),
        Number(match[5]),
      ),
      mode: "date-time",
      utcExplicit: false,
    };
  }

  match = /^(\d{4})-(\d{2})-(\d{2})\s+UTC$/.exec(normalizedValue);

  if (match) {
    return {
      date: buildUtcDate(Number(match[1]), Number(match[2]), Number(match[3])),
      mode: "date",
      utcExplicit: true,
    };
  }

  match = /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})\s+UTC$/.exec(normalizedValue);

  if (match) {
    return {
      date: buildUtcDate(
        Number(match[1]),
        Number(match[2]),
        Number(match[3]),
        Number(match[4]),
        Number(match[5]),
      ),
      mode: "date-time",
      utcExplicit: true,
    };
  }

  return null;
}

function formatTemporalValue(
  locale: ResolvedAppLocale,
  rawValue: string,
): string | null {
  const parsedValue = parseTemporalValue(rawValue);

  if (!parsedValue) {
    return null;
  }

  const options =
    parsedValue.mode === "date"
      ? {
          dateStyle: "medium" as const,
          timeZone: "UTC",
        }
      : {
          dateStyle: "medium" as const,
          timeStyle: "short" as const,
          timeZone: "UTC",
        };
  const formattedValue = new Intl.DateTimeFormat(locale, options).format(
    parsedValue.date,
  );

  return parsedValue.utcExplicit ? `${formattedValue} UTC` : formattedValue;
}

type DurationUnit = "minute" | "hour" | "day";

type ParsedDurationToken = {
  value: number;
  unit: DurationUnit;
};

function parseDurationToken(rawValue: string): ParsedDurationToken | null {
  const normalizedValue = rawValue.trim();
  let match = /^(\d+)(m|h|d)$/i.exec(normalizedValue);

  if (match) {
    return {
      value: Number(match[1]),
      unit:
        match[2].toLowerCase() === "m"
          ? "minute"
          : match[2].toLowerCase() === "h"
            ? "hour"
            : "day",
    };
  }

  match = /^(\d+)\s+(minute|minutes|hour|hours|day|days)$/i.exec(
    normalizedValue,
  );

  if (!match) {
    return null;
  }

  const unit = match[2].toLowerCase();

  return {
    value: Number(match[1]),
    unit:
      unit.startsWith("minute")
        ? "minute"
        : unit.startsWith("hour")
          ? "hour"
          : "day",
  };
}

function formatDurationToken(
  locale: ResolvedAppLocale,
  duration: ParsedDurationToken,
): string {
  const formattedNumber = new Intl.NumberFormat(locale).format(duration.value);

  if (locale === "zh-CN") {
    const unitLabel =
      duration.unit === "minute"
        ? "分钟"
        : duration.unit === "hour"
          ? "小时"
          : "天";

    return `${formattedNumber}${unitLabel}`;
  }

  const singularLabel =
    duration.unit === "minute"
      ? "minute"
      : duration.unit === "hour"
        ? "hour"
        : "day";
  const pluralLabel =
    duration.unit === "minute"
      ? "minutes"
      : duration.unit === "hour"
        ? "hours"
        : "days";

  return `${formattedNumber} ${duration.value === 1 ? singularLabel : pluralLabel}`;
}

function localizeRelativeRuntimeLabel(
  locale: ResolvedAppLocale,
  rawValue: string,
): string {
  const normalizedValue = rawValue.trim();

  if (normalizedValue.length === 0 || locale === "en") {
    return normalizedValue;
  }

  if (normalizedValue === "Synced just now") {
    return "刚刚同步";
  }

  let match = /^Synced (\d+[mhd]) ago$/i.exec(normalizedValue);

  if (match) {
    const duration = parseDurationToken(match[1]);

    return duration ? `${formatDurationToken(locale, duration)}前同步` : normalizedValue;
  }

  match = /^Analytics snapshot (\d+[mhd]) ago$/i.exec(normalizedValue);

  if (match) {
    const duration = parseDurationToken(match[1]);

    return duration
      ? `${formatDurationToken(locale, duration)}前的分析快照`
      : normalizedValue;
  }

  match = /^Documented quota snapshot (\d+[mhd]) ago$/i.exec(normalizedValue);

  if (match) {
    const duration = parseDurationToken(match[1]);

    return duration
      ? `${formatDurationToken(locale, duration)}前的文档配额快照`
      : normalizedValue;
  }

  match = /^Last failed sync (\d+[mhd]) ago$/i.exec(normalizedValue);

  if (match) {
    const duration = parseDurationToken(match[1]);

    return duration
      ? `上次失败同步于${formatDurationToken(locale, duration)}前`
      : normalizedValue;
  }

  match = /^Cached snapshot stale by (\d+[mhd])$/i.exec(normalizedValue);

  if (match) {
    const duration = parseDurationToken(match[1]);

    return duration
      ? `缓存快照已滞后${formatDurationToken(locale, duration)}`
      : normalizedValue;
  }

  return normalizedValue;
}

function localizeResetRuntimeLabel(
  locale: ResolvedAppLocale,
  rawValue: string,
): string {
  const normalizedValue = rawValue.trim();

  if (normalizedValue.length === 0 || locale === "en") {
    return normalizedValue;
  }

  let match = /^Resets in (\d+)\s+(minutes?|hours?|days?)$/i.exec(
    normalizedValue,
  );

  if (match) {
    const duration = parseDurationToken(`${match[1]} ${match[2]}`);

    return duration
      ? `${formatDurationToken(locale, duration)}后重置`
      : normalizedValue;
  }

  match = /^Monthly AI quota renews every (\d+)\s+(minutes?|hours?|days?)$/i.exec(
    normalizedValue,
  );

  if (match) {
    const duration = parseDurationToken(`${match[1]} ${match[2]}`);

    return duration
      ? `Monthly AI 配额每${formatDurationToken(locale, duration)}续期一次`
      : normalizedValue;
  }

  return normalizedValue;
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

function readDirectionOverride(
  reader?: LocaleReader,
): ResolvedTextDirection | null {
  const search = reader?.location?.search;

  if (typeof search !== "string" || search.length === 0) {
    return null;
  }

  const appDirection = new URLSearchParams(search).get("app-dir");

  return appDirection === "rtl" || appDirection === "ltr"
    ? appDirection
    : null;
}

function mapLocaleToTextDirection(
  _locale: ResolvedAppLocale,
): ResolvedTextDirection {
  return "ltr";
}

export function resolveAppTextDirection(
  localePreference: AppLocalePreference,
  reader?: LocaleReader,
): ResolvedTextDirection {
  const directionOverride = readDirectionOverride(reader);

  if (directionOverride) {
    return directionOverride;
  }

  return mapLocaleToTextDirection(resolveAppLocale(localePreference, reader));
}

export function createRuntimeI18n(
  localePreference: AppLocalePreference,
  reader?: LocaleReader,
): RuntimeI18n {
  const normalizedPreference = normalizeAppLocalePreference(localePreference);
  const resolvedLocale = resolveAppLocale(normalizedPreference, reader);
  const resolvedTextDirection = resolveAppTextDirection(
    normalizedPreference,
    reader,
  );

  return {
    localePreference: normalizedPreference,
    resolvedLocale,
    resolvedTextDirection,
    t: (id) => RUNTIME_MESSAGES[resolvedLocale][id] ?? RUNTIME_MESSAGES.en[id],
    formatNumber: (value) => new Intl.NumberFormat(resolvedLocale).format(value),
    formatPercentValue: (value) =>
      new Intl.NumberFormat(resolvedLocale, {
        style: "percent",
        maximumFractionDigits: 0,
      }).format(value / 100),
    formatTemporalValue: (rawValue) => formatTemporalValue(resolvedLocale, rawValue),
    localizeRelativeRuntimeLabel: (rawValue) =>
      localizeRelativeRuntimeLabel(resolvedLocale, rawValue),
    localizeResetRuntimeLabel: (rawValue) =>
      localizeResetRuntimeLabel(resolvedLocale, rawValue),
  };
}

export function syncRuntimeLocaleAttributes(
  i18n: RuntimeI18n,
  root?: RuntimeLocaleAttributeTarget | null,
  body?: RuntimeLocaleAttributeTarget | null,
) {
  const resolvedLang = i18n.resolvedLocale === "zh-CN" ? "zh-CN" : "en";

  for (const target of [root, body]) {
    if (!target) {
      continue;
    }

    target.lang = resolvedLang;
    target.dir = i18n.resolvedTextDirection;

    if (target.dataset) {
      target.dataset.appLocale = i18n.resolvedLocale;
      target.dataset.appDirection = i18n.resolvedTextDirection;
    }
  }
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

export function buildSettingsSummaryLabels(i18n: RuntimeI18n) {
  return {
    visible: i18n.t("settings.summary.visible"),
    storedSecrets: i18n.t("settings.summary.stored_secrets"),
    boundPages: i18n.t("settings.summary.bound_pages"),
    needsAccess: i18n.t("settings.summary.needs_access"),
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
