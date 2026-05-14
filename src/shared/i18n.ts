import type { AppLocalePreference } from "../providers/types";
import type { ResolvedThemeMode } from "./theme";
import { buildRuntimeMessages } from "./runtime-message-catalogs";

export const SUPPORTED_APP_LOCALES = [
  "en",
  "zh-CN",
  "zh-TW",
  "ja",
  "ko",
  "es-419",
  "pt-BR",
  "fr",
  "de",
  "it",
  "ru",
  "ar",
  "hi",
  "id",
] as const;

export type ResolvedAppLocale = (typeof SUPPORTED_APP_LOCALES)[number];
export type ResolvedTextDirection = "ltr" | "rtl";

export const DEFAULT_APP_LOCALE_PREFERENCE: AppLocalePreference = "system";

export type AppLocaleMetadata = {
  locale: ResolvedAppLocale;
  chromeLocale: string;
  label: string;
  nativeLabel: string;
  intlLocale: string;
  htmlLang: string;
  textDirection: ResolvedTextDirection;
};

export const APP_LOCALE_METADATA: Record<ResolvedAppLocale, AppLocaleMetadata> =
  {
    en: {
      locale: "en",
      chromeLocale: "en",
      label: "English",
      nativeLabel: "English",
      intlLocale: "en",
      htmlLang: "en",
      textDirection: "ltr",
    },
    "zh-CN": {
      locale: "zh-CN",
      chromeLocale: "zh_CN",
      label: "Simplified Chinese",
      nativeLabel: "简体中文",
      intlLocale: "zh-CN",
      htmlLang: "zh-CN",
      textDirection: "ltr",
    },
    "zh-TW": {
      locale: "zh-TW",
      chromeLocale: "zh_TW",
      label: "Traditional Chinese",
      nativeLabel: "繁體中文",
      intlLocale: "zh-TW",
      htmlLang: "zh-TW",
      textDirection: "ltr",
    },
    ja: {
      locale: "ja",
      chromeLocale: "ja",
      label: "Japanese",
      nativeLabel: "日本語",
      intlLocale: "ja",
      htmlLang: "ja",
      textDirection: "ltr",
    },
    ko: {
      locale: "ko",
      chromeLocale: "ko",
      label: "Korean",
      nativeLabel: "한국어",
      intlLocale: "ko",
      htmlLang: "ko",
      textDirection: "ltr",
    },
    "es-419": {
      locale: "es-419",
      chromeLocale: "es_419",
      label: "Spanish (Latin America)",
      nativeLabel: "Español (Latinoamérica)",
      intlLocale: "es-419",
      htmlLang: "es-419",
      textDirection: "ltr",
    },
    "pt-BR": {
      locale: "pt-BR",
      chromeLocale: "pt_BR",
      label: "Portuguese (Brazil)",
      nativeLabel: "Português (Brasil)",
      intlLocale: "pt-BR",
      htmlLang: "pt-BR",
      textDirection: "ltr",
    },
    fr: {
      locale: "fr",
      chromeLocale: "fr",
      label: "French",
      nativeLabel: "Français",
      intlLocale: "fr",
      htmlLang: "fr",
      textDirection: "ltr",
    },
    de: {
      locale: "de",
      chromeLocale: "de",
      label: "German",
      nativeLabel: "Deutsch",
      intlLocale: "de",
      htmlLang: "de",
      textDirection: "ltr",
    },
    it: {
      locale: "it",
      chromeLocale: "it",
      label: "Italian",
      nativeLabel: "Italiano",
      intlLocale: "it",
      htmlLang: "it",
      textDirection: "ltr",
    },
    ru: {
      locale: "ru",
      chromeLocale: "ru",
      label: "Russian",
      nativeLabel: "Русский",
      intlLocale: "ru",
      htmlLang: "ru",
      textDirection: "ltr",
    },
    ar: {
      locale: "ar",
      chromeLocale: "ar",
      label: "Arabic",
      nativeLabel: "العربية",
      intlLocale: "ar",
      htmlLang: "ar",
      textDirection: "rtl",
    },
    hi: {
      locale: "hi",
      chromeLocale: "hi",
      label: "Hindi",
      nativeLabel: "हिन्दी",
      intlLocale: "hi",
      htmlLang: "hi",
      textDirection: "ltr",
    },
    id: {
      locale: "id",
      chromeLocale: "id",
      label: "Indonesian",
      nativeLabel: "Bahasa Indonesia",
      intlLocale: "id",
      htmlLang: "id",
      textDirection: "ltr",
    },
  };

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
  | "settings.preferences.warning_threshold_label"
  | "settings.preferences.locale_label"
  | "settings.preferences.theme_mode_label"
  | "settings.preferences.accent_preset_label"
  | "settings.preferences.popup_progress_style_label"
  | "settings.preferences.popup_circular_row_count_label"
  | "settings.preferences.popup_circular_row_count_helper"
  | "settings.preferences.popup_circular_row_count.one"
  | "settings.preferences.popup_circular_row_count.two"
  | "settings.preferences.popup_circular_row_count.three"
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
  | "settings.preferences.popup_corner_label"
  | "settings.preferences.popup_corner.square"
  | "settings.preferences.popup_corner.soft"
  | "settings.preferences.popup_corner.rounded"
  | "settings.preferences.popup_shadow_label"
  | "settings.preferences.popup_shadow.none"
  | "settings.preferences.popup_shadow.soft"
  | "settings.preferences.popup_shadow.elevated"
  | "settings.preferences.action_badge_label"
  | "settings.preferences.ui_font_label"
  | "settings.preferences.ui_font_helper"
  | "settings.preferences.ui_font.default"
  | "settings.preferences.ui_font.system"
  | "settings.preferences.ui_font.serif"
  | "settings.preferences.ui_font.mono"
  | "settings.popup_appearance_preview.eyebrow"
  | "settings.popup_appearance_preview.title"
  | "settings.popup_appearance_preview.detail"
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
