import type { ResolvedAppLocale } from "./i18n";

const TEST_CONNECTION_LABELS: Record<ResolvedAppLocale, string> = {
  en: "Test",
  "zh-CN": "测试",
  "zh-TW": "測試",
  ja: "テスト",
  ko: "테스트",
  "es-419": "Probar",
  "pt-BR": "Testar",
  fr: "Tester",
  de: "Testen",
  it: "Verifica",
  ru: "Проверить",
  ar: "اختبار",
  hi: "जाँचें",
  id: "Uji",
};

export function getTestConnectionLabel(locale: ResolvedAppLocale): string {
  return TEST_CONNECTION_LABELS[locale];
}
