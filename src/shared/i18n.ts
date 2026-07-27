import type { AppLocalePreference } from "../providers/types";
import type { ThemeMode } from "../providers/types";
import {
  buildRuntimeMessages,
  getRuntimeMessageFallbackIds,
} from "./runtime-message-catalogs";
import {
  SUPPORTED_APP_LOCALES,
  type ResolvedAppLocale,
  type ResolvedTextDirection,
  DEFAULT_APP_LOCALE_PREFERENCE,
  type AppLocaleMetadata,
  APP_LOCALE_METADATA,
} from "./i18n-locale-metadata";
export {
  SUPPORTED_APP_LOCALES,
  type ResolvedAppLocale,
  type ResolvedTextDirection,
  DEFAULT_APP_LOCALE_PREFERENCE,
  type AppLocaleMetadata,
  APP_LOCALE_METADATA,
} from "./i18n-locale-metadata";

export type RuntimeMessageId =
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
  | "common.actions.sidebar"
  | "common.actions.open_sidebar"
  | "common.actions.save"
  | "provider.account.selector_label"
  | "provider.account.settings_title"
  | "common.theme.toggle_to_dark_label"
  | "common.theme.toggle_to_dark_title"
  | "common.theme.toggle_to_light_label"
  | "common.theme.toggle_to_light_title"
  | "common.theme.toggle_to_system_label"
  | "common.theme.toggle_to_system_title"
  | "common.theme.toggle_to_time_label"
  | "common.theme.toggle_to_time_title"
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
  | "dashboard.empty.action"
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
  | "popup.actions.refresh_title"
  | "popup.actions.refresh_drift_note"
  | "popup.actions.hide_header_actions"
  | "popup.actions.show_header_actions"
  | "popup.actions.hide_footer_info"
  | "popup.actions.show_footer_info"
  | "popup.providers.collapse_card"
  | "popup.providers.expand_card"
  | "popup.providers.previous"
  | "popup.providers.next"
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
  | "settings.actions.back_to_top"
  | "settings.actions.back_to_top_short"
  | "settings.summary.visible"
  | "settings.summary.stored_secrets"
  | "settings.summary.bound_pages"
  | "settings.summary.needs_access"
  | "settings.preferences.eyebrow"
  | "settings.preferences.sync_interval_label"
  | "settings.preferences.seconds"
  | "settings.preferences.warning_threshold_label"
  | "settings.preferences.locale_label"
  | "settings.preferences.theme_mode_label"
  | "settings.preferences.motion_mode_label"
  | "settings.preferences.accent_preset_label"
  | "settings.preferences.popup_progress_style_label"
  | "settings.preferences.popup_circular_row_count_label"
  | "settings.preferences.popup_circular_row_count_helper"
  | "settings.preferences.popup_circular_row_count.one"
  | "settings.preferences.popup_circular_row_count.two"
  | "settings.preferences.popup_circular_row_count.three"
  | "settings.preferences.popup_circular_row_count.four"
  | "settings.preferences.sidebar_progress_style_label"
  | "settings.preferences.full_page_progress_style_label"
  | "settings.preferences.progress_style.line"
  | "settings.preferences.progress_style.circle"
  | "settings.preferences.progress_style.circle_soft"
  | "settings.preferences.progress_style.circle_gauge"
  | "settings.preferences.popup_size_label"
  | "settings.preferences.popup_size.compact"
  | "settings.preferences.popup_size.balanced"
  | "settings.preferences.popup_size.wide"
  | "settings.preferences.popup_provider_browsing_mode_label"
  | "settings.preferences.popup_provider_browsing_mode.collapsible"
  | "settings.preferences.popup_provider_browsing_mode.single"
  | "settings.preferences.popup_provider_browsing_mode.switch"
  | "settings.preferences.popup_provider_browsing_mode.scroll"
  | "settings.preferences.popup_corner_label"
  | "settings.preferences.popup_corner.square"
  | "settings.preferences.popup_corner.soft"
  | "settings.preferences.popup_corner.rounded"
  | "settings.preferences.popup_shadow_label"
  | "settings.preferences.popup_shadow.none"
  | "settings.preferences.popup_shadow.soft"
  | "settings.preferences.popup_shadow.elevated"
  | "settings.preferences.action_badge_label"
  | "settings.preferences.action_badge_helper"
  | "settings.preferences.action_badge_mode_label"
  | "settings.preferences.action_badge_mode_helper"
  | "settings.preferences.action_badge_mode_auto"
  | "settings.preferences.action_badge_mode_manual"
  | "settings.preferences.action_badge_restore_auto"
  | "settings.preferences.action_badge_rotation_label"
  | "settings.preferences.action_badge_rotation_helper"
  | "settings.preferences.action_badge_rotation_menu_button"
  | "settings.preferences.toolbar_icon_label"
  | "settings.preferences.toolbar_icon.default"
  | "settings.preferences.toolbar_icon.match_badge"
  | "settings.preferences.toolbar_icon.provider"
  | "settings.preferences.toolbar_icon.custom"
  | "settings.preferences.toolbar_icon_provider_label"
  | "settings.preferences.toolbar_icon_custom_label"
  | "settings.preferences.toolbar_icon_custom_empty"
  | "settings.preferences.toolbar_icon_custom_selected"
  | "settings.preferences.toolbar_icon_custom_clear"
  | "settings.preferences.ui_font_label"
  | "settings.preferences.ui_font_helper"
  | "settings.preferences.ui_font.default"
  | "settings.preferences.ui_font.system"
  | "settings.preferences.ui_font.serif"
  | "settings.preferences.ui_font.mono"
  | "settings.popup_appearance_preview.eyebrow"
  | "settings.popup_appearance_preview.title"
  | "settings.popup_appearance_preview.detail"
  | "settings.popup_appearance_preview.remaining_label"
  | "settings.popup_appearance_preview.remaining_error"
  | "settings.popup_appearance_preview.open_test_popup"
  | "settings.popup_appearance_preview.close_test_popup"
  | "settings.popup_appearance_preview.drag_test_popup"
  | "settings.popup_appearance_preview.sample_refresh"
  | "settings.popup_appearance_preview.sample_tab"
  | "settings.popup_appearance_preview.sample_provider"
  | "settings.popup_appearance_preview.sample_quota"
  | "settings.preferences.minutes"
  | "settings.preferences.locale.system"
  | "settings.preferences.locale.en"
  | "settings.preferences.locale.zh_cn"
  | "settings.preferences.theme_mode.system"
  | "settings.preferences.theme_mode.light"
  | "settings.preferences.theme_mode.dark"
  | "settings.preferences.theme_mode.time"
  | "settings.preferences.theme_mode_helper"
  | "settings.preferences.motion_mode.system"
  | "settings.preferences.motion_mode.full"
  | "settings.preferences.motion_mode.reduced"
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
  | "settings.visibility.displayEnabled_detail"
  | "settings.visibility.disabled_detail"
  | "settings.credentials.eyebrow"
  | "settings.credentials.title"
  | "settings.credentials.detail"
  | "settings.credentials.codex_session_title"
  | "settings.credentials.codex_session_state"
  | "settings.credentials.codex_session_help"
  | "settings.credentials.codex_session_input"
  | "settings.credentials.codex_session_placeholder"
  | "settings.credentials.codex_session_save"
  | "settings.credentials.codex_session_clear"
  | "settings.credentials.codex_session_footer"
  | "settings.sources.eyebrow"
  | "settings.sources.title"
  | "settings.sources.detail"
  | "settings.permissions.eyebrow"
  | "settings.permissions.title"
  | "settings.permissions.detail"
  | "settings.toast.preferences_saved_title"
  | "settings.toast.preferences_saved_detail";

export type RuntimeMessages = Record<RuntimeMessageId, string>;

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
  fallbackMessageIds: readonly RuntimeMessageId[];
  t: (id: RuntimeMessageId) => string;
  formatNumber: (value: number) => string;
  formatPercentValue: (value: number) => string;
  formatTemporalValue: (rawValue: string) => string | null;
  localizeRelativeRuntimeLabel: (rawValue: string) => string;
  localizeResetRuntimeLabel: (rawValue: string) => string;
};

export const RUNTIME_MESSAGES = buildRuntimeMessages(SUPPORTED_APP_LOCALES);

export function getRuntimeMessageCatalog(
  locale: ResolvedAppLocale,
): RuntimeMessages {
  return RUNTIME_MESSAGES[locale];
}

function normalizeLanguageTag(language: string | null | undefined): string {
  return typeof language === "string"
    ? language.trim().replace(/_/g, "-").toLowerCase()
    : "";
}

export function isResolvedAppLocale(value: unknown): value is ResolvedAppLocale {
  return (
    typeof value === "string" &&
    SUPPORTED_APP_LOCALES.includes(value as ResolvedAppLocale)
  );
}

function mapLanguageToLocale(language: string | null | undefined): ResolvedAppLocale {
  const normalizedLanguage = normalizeLanguageTag(language);

  if (normalizedLanguage.length === 0) {
    return "en";
  }

  if (
    normalizedLanguage === "zh-tw" ||
    normalizedLanguage === "zh-hk" ||
    normalizedLanguage === "zh-mo" ||
    normalizedLanguage.startsWith("zh-hant")
  ) {
    return "zh-TW";
  }

  if (normalizedLanguage === "zh" || normalizedLanguage.startsWith("zh-")) {
    return "zh-CN";
  }

  if (normalizedLanguage === "pt" || normalizedLanguage.startsWith("pt-")) {
    return "pt-BR";
  }

  if (normalizedLanguage === "es" || normalizedLanguage.startsWith("es-")) {
    return "es-419";
  }

  for (const locale of SUPPORTED_APP_LOCALES) {
    const normalizedLocale = normalizeLanguageTag(locale);

    if (
      normalizedLanguage === normalizedLocale ||
      normalizedLanguage.startsWith(`${normalizedLocale}-`)
    ) {
      return locale;
    }
  }

  return "en";
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
  const formattedValue = new Intl.DateTimeFormat(
    APP_LOCALE_METADATA[locale].intlLocale,
    options,
  ).format(parsedValue.date);

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
  const formattedNumber = new Intl.NumberFormat(
    APP_LOCALE_METADATA[locale].intlLocale,
  ).format(duration.value);

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

  if (normalizedValue.length === 0 || locale !== "zh-CN") {
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

  if (normalizedValue.length === 0 || locale !== "zh-CN") {
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
  return value === "system" || isResolvedAppLocale(value)
    ? value
    : DEFAULT_APP_LOCALE_PREFERENCE;
}

function readLocaleOverride(reader?: LocaleReader): ResolvedAppLocale | null {
  const search = reader?.location?.search;

  if (typeof search !== "string" || search.length === 0) {
    return null;
  }

  const appLocale = new URLSearchParams(search).get("app-locale");

  return isResolvedAppLocale(appLocale) ? appLocale : null;
}

export function resolveAppLocale(
  localePreference: AppLocalePreference,
  reader?: LocaleReader,
): ResolvedAppLocale {
  const localeOverride = readLocaleOverride(reader);

  if (localeOverride) {
    return localeOverride;
  }

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
  locale: ResolvedAppLocale,
): ResolvedTextDirection {
  return APP_LOCALE_METADATA[locale].textDirection;
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
    fallbackMessageIds: getRuntimeMessageFallbackIds(resolvedLocale),
    t: (id) => RUNTIME_MESSAGES[resolvedLocale][id] ?? RUNTIME_MESSAGES.en[id],
    formatNumber: (value) =>
      new Intl.NumberFormat(APP_LOCALE_METADATA[resolvedLocale].intlLocale).format(
        value,
      ),
    formatPercentValue: (value) =>
      new Intl.NumberFormat(APP_LOCALE_METADATA[resolvedLocale].intlLocale, {
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
  const resolvedLang = APP_LOCALE_METADATA[i18n.resolvedLocale].htmlLang;

  for (const target of [root, body]) {
    if (!target) {
      continue;
    }

    target.lang = resolvedLang;
    target.dir = i18n.resolvedTextDirection;

    if (target.dataset) {
      target.dataset.appLocale = i18n.resolvedLocale;
      target.dataset.appDirection = i18n.resolvedTextDirection;
      target.dataset.appLocaleFallbackCount = `${i18n.fallbackMessageIds.length}`;
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

export function buildRuntimeCommonCopy(i18n: RuntimeI18n) {
  const zh = i18n.resolvedLocale === "zh-CN";

  return {
    remaining: zh ? "剩余" : "remaining",
    reset: zh ? "重置" : "resets",
    visibleUsageContext: zh ? "可见使用上下文" : "Visible usage context",
    needsAttentionCount: zh ? "异常数量" : "Needs attention count",
    syncIntervalMenuButton: zh
      ? "展开默认同步间隔预设"
      : "Show default sync interval presets",
    warningThresholdMenuButton: zh
      ? "展开告警阈值预设"
      : "Show warning threshold presets",
    quotaUnitLabel: (quotaUnit: string) => {
      if (!zh) {
        return quotaUnit;
      }

      switch (quotaUnit) {
        case "credits":
          return "积分";
        case "requests":
          return "请求";
        case "sessions":
          return "会话";
        default:
          return quotaUnit;
      }
    },
    quotaUnitRemainingLabel: (quotaUnit: string) => {
      if (!zh) {
        return `${quotaUnit} remaining`;
      }

      switch (quotaUnit) {
        case "credits":
          return "积分剩余";
        case "requests":
          return "请求剩余";
        case "sessions":
          return "会话剩余";
        default:
          return "剩余";
      }
    },
    syncIntervalRangeError: (min: number, max: number, unitLabel: string) =>
      zh
        ? `请输入 ${i18n.formatNumber(min)}-${i18n.formatNumber(max)} ${unitLabel}。`
        : `Enter ${i18n.formatNumber(min)}-${i18n.formatNumber(max)} ${unitLabel}.`,
    warningThresholdRangeError: (min: number, max: number) =>
      zh
        ? `请输入 ${i18n.formatNumber(min)}-${i18n.formatNumber(max)}%。`
        : `Enter ${i18n.formatNumber(min)}-${i18n.formatNumber(max)}%.`,
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
  nextMode: ThemeMode,
  i18n: RuntimeI18n,
) {
  if (nextMode === "dark") {
    return {
      label: i18n.t("common.theme.toggle_to_dark_label"),
      title: i18n.t("common.theme.toggle_to_dark_title"),
    };
  }
  if (nextMode === "light") {
    return {
      label: i18n.t("common.theme.toggle_to_light_label"),
      title: i18n.t("common.theme.toggle_to_light_title"),
    };
  }
  if (nextMode === "system") {
    return {
      label: i18n.t("common.theme.toggle_to_system_label"),
      title: i18n.t("common.theme.toggle_to_system_title"),
    };
  }
  return {
    label: i18n.t("common.theme.toggle_to_time_label"),
    title: i18n.t("common.theme.toggle_to_time_title"),
  };
}
