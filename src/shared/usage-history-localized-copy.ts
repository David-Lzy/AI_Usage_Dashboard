import type { ResolvedAppLocale } from "./i18n";
import type { UsageHistoryChartCopy } from "./components/UsageHistoryCharts";

const ENGLISH_COPY: UsageHistoryChartCopy = {
  personalUsage: "Personal usage",
  turns: "Turns trend",
  byModel: "By model",
  bySurface: "By surface",
  sevenDays: "7 days",
  oneMonth: "1 month",
  other: "Other",
  noData: "No history data yet",
  hide: "Hide",
  openDetails: "Details",
  capturedAt: "Captured",
  totalTurns: "Total turns",
  percentUnit: "%",
  turnsUnit: "turns",
};

const COPY_OVERRIDES: Partial<Record<ResolvedAppLocale, Partial<UsageHistoryChartCopy>>> = {
  "zh-CN": { personalUsage: "个人使用", turns: "轮次趋势", byModel: "按模型", bySurface: "按使用方式", sevenDays: "7天", oneMonth: "1个月", other: "其他", noData: "暂无历史数据", hide: "隐藏", openDetails: "详情", capturedAt: "采集时间", totalTurns: "总轮次", turnsUnit: "轮次" },
  "zh-TW": { personalUsage: "個人使用", turns: "輪次趨勢", byModel: "依模型", bySurface: "依使用方式", sevenDays: "7 天", oneMonth: "1 個月", other: "其他", noData: "暫無歷史資料", hide: "隱藏", openDetails: "詳情", capturedAt: "擷取時間", totalTurns: "總輪次", turnsUnit: "輪次" },
  ja: { personalUsage: "個人使用", turns: "ターンの推移", byModel: "モデル別", bySurface: "利用方法別", sevenDays: "7日", oneMonth: "1か月", other: "その他", noData: "履歴データはまだありません", hide: "非表示", openDetails: "詳細", capturedAt: "取得日時", totalTurns: "合計ターン", turnsUnit: "ターン" },
  ko: { personalUsage: "개인 사용량", turns: "턴 추이", byModel: "모델별", bySurface: "사용 방식별", sevenDays: "7일", oneMonth: "1개월", other: "기타", noData: "아직 사용 기록이 없습니다", hide: "숨기기", openDetails: "세부정보", capturedAt: "수집 시각", totalTurns: "총 턴", turnsUnit: "턴" },
  "es-419": { personalUsage: "Uso personal", turns: "Tendencia de turnos", byModel: "Por modelo", bySurface: "Por superficie", sevenDays: "7 días", oneMonth: "1 mes", other: "Otros", noData: "Aún no hay historial", hide: "Ocultar", openDetails: "Detalles", capturedAt: "Capturado", totalTurns: "Turnos totales", turnsUnit: "turnos" },
  "pt-BR": { personalUsage: "Uso pessoal", turns: "Tendência de turnos", byModel: "Por modelo", bySurface: "Por superfície", sevenDays: "7 dias", oneMonth: "1 mês", other: "Outros", noData: "Ainda não há histórico", hide: "Ocultar", openDetails: "Detalhes", capturedAt: "Capturado", totalTurns: "Total de turnos", turnsUnit: "turnos" },
  fr: { personalUsage: "Utilisation personnelle", turns: "Tendance des tours", byModel: "Par modèle", bySurface: "Par interface", sevenDays: "7 jours", oneMonth: "1 mois", other: "Autres", noData: "Aucun historique pour le moment", hide: "Masquer", openDetails: "Détails", capturedAt: "Capturé", totalTurns: "Total des tours", turnsUnit: "tours" },
  de: { personalUsage: "Persönliche Nutzung", turns: "Turn-Verlauf", byModel: "Nach Modell", bySurface: "Nach Oberfläche", sevenDays: "7 Tage", oneMonth: "1 Monat", other: "Andere", noData: "Noch keine Verlaufsdaten", hide: "Ausblenden", openDetails: "Details", capturedAt: "Erfasst", totalTurns: "Turns gesamt", turnsUnit: "Turns" },
  it: { personalUsage: "Uso personale", turns: "Andamento turni", byModel: "Per modello", bySurface: "Per superficie", sevenDays: "7 giorni", oneMonth: "1 mese", other: "Altro", noData: "Nessun dato storico", hide: "Nascondi", openDetails: "Dettagli", capturedAt: "Acquisito", totalTurns: "Turni totali", turnsUnit: "turni" },
  ru: { personalUsage: "Личное использование", turns: "Динамика запросов", byModel: "По моделям", bySurface: "По способу использования", sevenDays: "7 дней", oneMonth: "1 месяц", other: "Другое", noData: "История пока недоступна", hide: "Скрыть", openDetails: "Подробнее", capturedAt: "Получено", totalTurns: "Всего запросов", turnsUnit: "запросов" },
  ar: { personalUsage: "الاستخدام الشخصي", turns: "اتجاه الجولات", byModel: "حسب النموذج", bySurface: "حسب الواجهة", sevenDays: "7 أيام", oneMonth: "شهر واحد", other: "أخرى", noData: "لا توجد بيانات سجل بعد", hide: "إخفاء", openDetails: "التفاصيل", capturedAt: "وقت الالتقاط", totalTurns: "إجمالي الجولات", turnsUnit: "جولات" },
  hi: { personalUsage: "व्यक्तिगत उपयोग", turns: "टर्न रुझान", byModel: "मॉडल के अनुसार", bySurface: "सतह के अनुसार", sevenDays: "7 दिन", oneMonth: "1 महीना", other: "अन्य", noData: "अभी कोई इतिहास डेटा नहीं", hide: "छिपाएँ", openDetails: "विवरण", capturedAt: "कैप्चर समय", totalTurns: "कुल टर्न", turnsUnit: "टर्न" },
  id: { personalUsage: "Penggunaan pribadi", turns: "Tren giliran", byModel: "Menurut model", bySurface: "Menurut permukaan", sevenDays: "7 hari", oneMonth: "1 bulan", other: "Lainnya", noData: "Belum ada data riwayat", hide: "Sembunyikan", openDetails: "Detail", capturedAt: "Diambil", totalTurns: "Total giliran", turnsUnit: "giliran" },
};

export function buildUsageHistoryLocalizedCopy(locale: ResolvedAppLocale): UsageHistoryChartCopy {
  return { ...ENGLISH_COPY, ...COPY_OVERRIDES[locale] };
}
