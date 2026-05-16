import type { AppLocalePreference } from "../providers/types";

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
