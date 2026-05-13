export const SUPPORTED_RDP_CAPTURE_LOCALES = Object.freeze([
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
]);

const SUPPORTED_RDP_CAPTURE_LOCALE_SET = new Set(
  SUPPORTED_RDP_CAPTURE_LOCALES,
);

export function isSupportedRdpCaptureLocale(locale) {
  return SUPPORTED_RDP_CAPTURE_LOCALE_SET.has(locale);
}

export function normalizeRdpCaptureLocale(rawLocale) {
  const locale = `${rawLocale ?? ""}`.trim();

  if (locale.length === 0) {
    return "";
  }

  if (isSupportedRdpCaptureLocale(locale)) {
    return locale;
  }

  throw new Error(
    `Unsupported RDP capture locale: ${locale}. Supported locales: ${SUPPORTED_RDP_CAPTURE_LOCALES.join(", ")}`,
  );
}

export function appendLocaleOverride(routePath, rawLocale) {
  const locale = normalizeRdpCaptureLocale(rawLocale);

  if (locale.length === 0) {
    return routePath;
  }

  const [pathAndSearch, hash = ""] = routePath.split("#", 2);
  const separator = pathAndSearch.includes("?") ? "&" : "?";
  const nextPathAndSearch = `${pathAndSearch}${separator}app-locale=${encodeURIComponent(locale)}`;

  return hash.length > 0 ? `${nextPathAndSearch}#${hash}` : nextPathAndSearch;
}
