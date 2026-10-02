import type { ResolvedAppLocale } from "./i18n";

const COPY: Record<
  ResolvedAppLocale,
  readonly [string, string, string, string, string]
> = {
  en: [
    "Quota & reset",
    "Trends & statistics",
    "Comparison & export",
    "Source & diagnostics",
    "Last successful capture",
  ],
  "zh-CN": [
    "额度与重置",
    "趋势与统计",
    "比较与导出",
    "来源与诊断",
    "上次成功采集",
  ],
  "zh-TW": [
    "額度與重設",
    "趨勢與統計",
    "比較與匯出",
    "來源與診斷",
    "上次成功擷取",
  ],
  ja: [
    "利用枠とリセット",
    "傾向と統計",
    "比較とエクスポート",
    "取得元と診断",
    "最終取得成功日時",
  ],
  ko: [
    "할당량 및 재설정",
    "추세 및 통계",
    "비교 및 내보내기",
    "데이터 소스 및 진단",
    "마지막 수집 성공",
  ],
  "es-419": [
    "Cuota y restablecimiento",
    "Tendencias y estadísticas",
    "Comparación y exportación",
    "Fuente y diagnóstico",
    "Última captura correcta",
  ],
  "pt-BR": [
    "Cota e redefinição",
    "Tendências e estatísticas",
    "Comparação e exportação",
    "Fonte e diagnóstico",
    "Última coleta bem-sucedida",
  ],
  fr: [
    "Quota et réinitialisation",
    "Tendances et statistiques",
    "Comparaison et export",
    "Source et diagnostic",
    "Dernière collecte réussie",
  ],
  de: [
    "Kontingent und Zurücksetzung",
    "Trends und Statistiken",
    "Vergleich und Export",
    "Quelle und Diagnose",
    "Letzte erfolgreiche Erfassung",
  ],
  it: [
    "Quota e ripristino",
    "Tendenze e statistiche",
    "Confronto ed esportazione",
    "Origine e diagnostica",
    "Ultima acquisizione riuscita",
  ],
  ru: [
    "Квота и сброс",
    "Тенденции и статистика",
    "Сравнение и экспорт",
    "Источник и диагностика",
    "Последний успешный сбор",
  ],
  ar: [
    "الحصة وإعادة التعيين",
    "الاتجاهات والإحصاءات",
    "المقارنة والتصدير",
    "المصدر والتشخيص",
    "آخر جمع ناجح للبيانات",
  ],
  hi: [
    "कोटा और रीसेट",
    "रुझान और आँकड़े",
    "तुलना और निर्यात",
    "स्रोत और निदान",
    "पिछला सफल संग्रह",
  ],
  id: [
    "Kuota dan pengaturan ulang",
    "Tren dan statistik",
    "Perbandingan dan ekspor",
    "Sumber dan diagnostik",
    "Pengambilan terakhir berhasil",
  ],
};

export function getProviderDetailGroupsCopy(locale: ResolvedAppLocale) {
  const [quota, trends, exports, source, captured] = COPY[locale];
  return { quota, trends, exports, source, captured };
}
