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
  surfaceLabels: {
    desktop_app: "Desktop App",
    vscode: "Extension",
    exec: "Exec",
    cli: "CLI",
    web: "Cloud",
    github: "GitHub Turn",
    github_code_review: "GitHub Code Review",
    unknown: "Uncategorized",
  },
  chartLegend: "Chart legend",
  dateRange: "Date range",
  grouping: "Grouping",
  settingsSectionLabel: "Usage history",
  settingsTitle: "Show history modules by surface",
  settingsDetail: "Personal usage and turns can be hidden independently on popup, sidebar, and full-page surfaces.",
};

const UI_COPY_OVERRIDES: Partial<Record<ResolvedAppLocale, Partial<UsageHistoryChartCopy>>> = {
  "zh-CN": { chartLegend: "图表图例", dateRange: "日期范围", grouping: "分组方式", settingsSectionLabel: "使用历史", settingsTitle: "按界面显示历史模块", settingsDetail: "个人使用和轮次趋势可以在 Popup、侧栏和完整页面中分别隐藏。" },
  "zh-TW": { chartLegend: "圖表圖例", dateRange: "日期範圍", grouping: "分組方式", settingsSectionLabel: "使用歷史", settingsTitle: "依介面顯示歷史模組", settingsDetail: "個人使用與輪次趨勢可在 Popup、側欄和完整頁面中分別隱藏。" },
  ja: { chartLegend: "グラフの凡例", dateRange: "期間", grouping: "グループ化", settingsSectionLabel: "使用履歴", settingsTitle: "画面ごとの履歴モジュール", settingsDetail: "個人使用とターンの推移は、ポップアップ、サイドバー、全画面で個別に非表示にできます。" },
  ko: { chartLegend: "차트 범례", dateRange: "날짜 범위", grouping: "그룹화", settingsSectionLabel: "사용 기록", settingsTitle: "화면별 기록 모듈 표시", settingsDetail: "개인 사용량과 턴 추이를 팝업, 사이드바, 전체 페이지에서 각각 숨길 수 있습니다." },
  "es-419": { chartLegend: "Leyenda del gráfico", dateRange: "Rango de fechas", grouping: "Agrupación", settingsSectionLabel: "Historial de uso", settingsTitle: "Mostrar módulos por superficie", settingsDetail: "El uso personal y los turnos se pueden ocultar por separado en el popup, la barra lateral y la página completa." },
  "pt-BR": { chartLegend: "Legenda do gráfico", dateRange: "Intervalo de datas", grouping: "Agrupamento", settingsSectionLabel: "Histórico de uso", settingsTitle: "Mostrar módulos por superfície", settingsDetail: "O uso pessoal e os turnos podem ser ocultados separadamente no popup, na barra lateral e na página completa." },
  fr: { chartLegend: "Légende du graphique", dateRange: "Plage de dates", grouping: "Regroupement", settingsSectionLabel: "Historique d’utilisation", settingsTitle: "Afficher les modules par surface", settingsDetail: "L’utilisation personnelle et les tours peuvent être masqués séparément dans le popup, la barre latérale et la page complète." },
  de: { chartLegend: "Diagrammlegende", dateRange: "Datumsbereich", grouping: "Gruppierung", settingsSectionLabel: "Nutzungsverlauf", settingsTitle: "Verlaufsmodule je Oberfläche", settingsDetail: "Persönliche Nutzung und Turns können in Popup, Seitenleiste und Vollbildansicht getrennt ausgeblendet werden." },
  it: { chartLegend: "Legenda del grafico", dateRange: "Intervallo di date", grouping: "Raggruppamento", settingsSectionLabel: "Cronologia utilizzo", settingsTitle: "Mostra moduli per superficie", settingsDetail: "Uso personale e turni possono essere nascosti separatamente nel popup, nella barra laterale e nella pagina completa." },
  ru: { chartLegend: "Легенда графика", dateRange: "Диапазон дат", grouping: "Группировка", settingsSectionLabel: "История использования", settingsTitle: "Модули истории по интерфейсам", settingsDetail: "Личное использование и запросы можно скрывать отдельно во всплывающем окне, боковой панели и полноэкранном режиме." },
  ar: { chartLegend: "وسيلة إيضاح الرسم", dateRange: "نطاق التاريخ", grouping: "التجميع", settingsSectionLabel: "سجل الاستخدام", settingsTitle: "إظهار وحدات السجل حسب الواجهة", settingsDetail: "يمكن إخفاء الاستخدام الشخصي والجولات بشكل مستقل في النافذة المنبثقة والشريط الجانبي والصفحة الكاملة." },
  hi: { chartLegend: "चार्ट संकेत", dateRange: "तारीख सीमा", grouping: "समूहीकरण", settingsSectionLabel: "उपयोग इतिहास", settingsTitle: "सतह के अनुसार इतिहास मॉड्यूल", settingsDetail: "व्यक्तिगत उपयोग और टर्न को पॉपअप, साइडबार और पूरे पेज पर अलग-अलग छिपाया जा सकता है।" },
  id: { chartLegend: "Legenda bagan", dateRange: "Rentang tanggal", grouping: "Pengelompokan", settingsSectionLabel: "Riwayat penggunaan", settingsTitle: "Tampilkan modul menurut permukaan", settingsDetail: "Penggunaan pribadi dan giliran dapat disembunyikan secara terpisah di popup, bilah sisi, dan halaman penuh." },
};

const SURFACE_LABEL_OVERRIDES: Partial<Record<ResolvedAppLocale, Record<string, string>>> = {
  "zh-CN": { desktop_app: "桌面应用", vscode: "扩展", exec: "执行", cli: "命令行", web: "云端", github: "GitHub 任务", github_code_review: "GitHub 代码审查", unknown: "未分类" },
  "zh-TW": { desktop_app: "桌面應用程式", vscode: "擴充功能", exec: "執行", cli: "命令列", web: "雲端", github: "GitHub 任務", github_code_review: "GitHub 程式碼審查", unknown: "未分類" },
  ja: { desktop_app: "デスクトップアプリ", vscode: "拡張機能", exec: "実行", cli: "CLI", web: "クラウド", github: "GitHub ターン", github_code_review: "GitHub コードレビュー", unknown: "未分類" },
  ko: { desktop_app: "데스크톱 앱", vscode: "확장 프로그램", exec: "실행", cli: "CLI", web: "클라우드", github: "GitHub 턴", github_code_review: "GitHub 코드 검토", unknown: "분류되지 않음" },
  "es-419": { desktop_app: "App de escritorio", vscode: "Extensión", exec: "Ejecución", cli: "CLI", web: "Nube", github: "Turno de GitHub", github_code_review: "Revisión de código de GitHub", unknown: "Sin categoría" },
  "pt-BR": { desktop_app: "App para desktop", vscode: "Extensão", exec: "Execução", cli: "CLI", web: "Nuvem", github: "Turno do GitHub", github_code_review: "Revisão de código do GitHub", unknown: "Sem categoria" },
  fr: { desktop_app: "Application de bureau", vscode: "Extension", exec: "Exécution", cli: "CLI", web: "Cloud", github: "Tour GitHub", github_code_review: "Revue de code GitHub", unknown: "Non classé" },
  de: { desktop_app: "Desktop-App", vscode: "Erweiterung", exec: "Ausführung", cli: "CLI", web: "Cloud", github: "GitHub-Turn", github_code_review: "GitHub-Codeüberprüfung", unknown: "Nicht kategorisiert" },
  it: { desktop_app: "App desktop", vscode: "Estensione", exec: "Esecuzione", cli: "CLI", web: "Cloud", github: "Turno GitHub", github_code_review: "Revisione codice GitHub", unknown: "Senza categoria" },
  ru: { desktop_app: "Настольное приложение", vscode: "Расширение", exec: "Выполнение", cli: "CLI", web: "Облако", github: "Запрос GitHub", github_code_review: "Проверка кода GitHub", unknown: "Без категории" },
  ar: { desktop_app: "تطبيق سطح المكتب", vscode: "الإضافة", exec: "التنفيذ", cli: "واجهة الأوامر", web: "السحابة", github: "جولة GitHub", github_code_review: "مراجعة كود GitHub", unknown: "غير مصنف" },
  hi: { desktop_app: "डेस्कटॉप ऐप", vscode: "एक्सटेंशन", exec: "निष्पादन", cli: "CLI", web: "क्लाउड", github: "GitHub टर्न", github_code_review: "GitHub कोड समीक्षा", unknown: "अवर्गीकृत" },
  id: { desktop_app: "Aplikasi desktop", vscode: "Ekstensi", exec: "Eksekusi", cli: "CLI", web: "Cloud", github: "Giliran GitHub", github_code_review: "Tinjauan kode GitHub", unknown: "Tanpa kategori" },
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
  return {
    ...ENGLISH_COPY,
    ...COPY_OVERRIDES[locale],
    ...UI_COPY_OVERRIDES[locale],
    surfaceLabels: {
      ...ENGLISH_COPY.surfaceLabels,
      ...SURFACE_LABEL_OVERRIDES[locale],
    },
  };
}
