import type { ResolvedAppLocale } from "./i18n";

export type GatewayComparisonReason =
  | "one_account"
  | "missing"
  | "partial"
  | "time_basis"
  | "stale"
  | "currency"
  | "scope"
  | "open_day"
  | "range";

export type AggregateUsageLocalizedCopy = {
  eyebrow: string;
  title: string;
  detail: string;
  startDate: string;
  endDate: string;
  invalidRange: string;
  tableLabel: string;
  deployment: string;
  requests: string;
  totalTokens: string;
  actualCost: string;
  referenceCost: string;
  coverage: string;
  captured: string;
  freshness: string;
  refresh: string;
  refreshTitle: (label: string) => string;
  refreshingTitle: (label: string) => string;
  refreshDisconnected: string;
  refreshFailed: string;
  unavailable: string;
  empty: string;
  coverageValue: (observedDays: number, selectedDays: number) => string;
  freshnessValues: Record<"fresh" | "stale" | "unknown", string>;
  timezoneKnown: (timezone: string) => string;
  timezoneUnknown: string;
  reasons: Record<GatewayComparisonReason, string>;
};

const COPY: Record<ResolvedAppLocale, AggregateUsageLocalizedCopy> = {
  en: {
    eyebrow: "Deployment comparison",
    title: "Saved deployment usage",
    detail: "Daily source totals for the selected dates.",
    startDate: "Start date",
    endDate: "End date",
    invalidRange: "Choose an end date on or after the start date.",
    tableLabel: "Deployment comparison table",
    deployment: "Deployment",
    requests: "Requests",
    totalTokens: "Total tokens",
    actualCost: "Actual cost",
    referenceCost: "Reference cost",
    coverage: "Coverage",
    captured: "Captured",
    freshness: "Freshness",
    refresh: "Refresh deployment",
    refreshTitle: (label) => `Refresh ${label}`,
    refreshingTitle: (label) => `Refreshing ${label}`,
    refreshDisconnected: "Refresh unavailable while disconnected",
    refreshFailed: "Refresh failed",
    unavailable: "Unavailable",
    empty: "No saved deployments are available for comparison.",
    coverageValue: (observed, selected) => `${observed} of ${selected} days`,
    freshnessValues: { fresh: "Fresh", stale: "Stale", unknown: "Unknown" },
    timezoneKnown: (timezone) => `Time basis: ${timezone}`,
    timezoneUnknown: "Time basis: unknown",
    reasons: {
      one_account: "One deployment",
      missing: "Missing data",
      partial: "Partial coverage",
      time_basis: "Time basis differs or is unknown",
      stale: "Stale data",
      currency: "Currency differs",
      scope: "Scope differs",
      open_day: "Open day",
      range: "Invalid range",
    },
  },
  "zh-CN": {
    eyebrow: "部署对比", title: "已保存部署用量", detail: "所选日期的每日来源总计。", startDate: "开始日期", endDate: "结束日期", invalidRange: "结束日期必须不早于开始日期。", tableLabel: "部署对比表", deployment: "部署", requests: "请求", totalTokens: "总 Token", actualCost: "实际成本", referenceCost: "参考成本", coverage: "覆盖范围", captured: "采集时间", freshness: "新鲜度", refresh: "刷新部署", refreshTitle: (label) => `刷新 ${label}`, refreshingTitle: (label) => `正在刷新 ${label}`, refreshDisconnected: "断开连接时无法刷新", refreshFailed: "刷新失败", unavailable: "不可用", empty: "没有可用于对比的已保存部署。", coverageValue: (observed, selected) => `${selected} 天中的 ${observed} 天`, freshnessValues: { fresh: "最新", stale: "过期", unknown: "未知" }, timezoneKnown: (timezone) => `时间依据：${timezone}`, timezoneUnknown: "时间依据：未知", reasons: { one_account: "只有一个部署", missing: "缺少数据", partial: "覆盖不完整", time_basis: "时间依据不同或未知", stale: "数据过期", currency: "货币不同", scope: "范围不同", open_day: "当天尚未结束", range: "日期范围无效" },
  },
  "zh-TW": {
    eyebrow: "部署比較", title: "已儲存部署用量", detail: "所選日期的每日來源總計。", startDate: "開始日期", endDate: "結束日期", invalidRange: "結束日期必須不早於開始日期。", tableLabel: "部署比較表", deployment: "部署", requests: "請求", totalTokens: "總 Token", actualCost: "實際成本", referenceCost: "參考成本", coverage: "涵蓋範圍", captured: "擷取時間", freshness: "新鮮度", refresh: "重新整理部署", refreshTitle: (label) => `重新整理 ${label}`, refreshingTitle: (label) => `正在重新整理 ${label}`, refreshDisconnected: "中斷連線時無法重新整理", refreshFailed: "重新整理失敗", unavailable: "無法使用", empty: "沒有可供比較的已儲存部署。", coverageValue: (observed, selected) => `${selected} 天中的 ${observed} 天`, freshnessValues: { fresh: "最新", stale: "過期", unknown: "未知" }, timezoneKnown: (timezone) => `時間依據：${timezone}`, timezoneUnknown: "時間依據：未知", reasons: { one_account: "只有一個部署", missing: "缺少資料", partial: "涵蓋不完整", time_basis: "時間依據不同或未知", stale: "資料過期", currency: "貨幣不同", scope: "範圍不同", open_day: "當日尚未結束", range: "日期範圍無效" },
  },
  ja: {
    eyebrow: "デプロイ比較", title: "保存済みデプロイの使用量", detail: "選択した日付のソース日次合計です。", startDate: "開始日", endDate: "終了日", invalidRange: "終了日は開始日以降にしてください。", tableLabel: "デプロイ比較表", deployment: "デプロイ", requests: "リクエスト", totalTokens: "合計トークン", actualCost: "実費", referenceCost: "参照コスト", coverage: "カバレッジ", captured: "取得時刻", freshness: "鮮度", refresh: "デプロイを更新", refreshTitle: (label) => `${label} を更新`, refreshingTitle: (label) => `${label} を更新中`, refreshDisconnected: "切断中は更新できません", refreshFailed: "更新に失敗しました", unavailable: "利用不可", empty: "比較できる保存済みデプロイはありません。", coverageValue: (observed, selected) => `${selected} 日中 ${observed} 日`, freshnessValues: { fresh: "最新", stale: "古い", unknown: "不明" }, timezoneKnown: (timezone) => `時間基準: ${timezone}`, timezoneUnknown: "時間基準: 不明", reasons: { one_account: "デプロイが 1 件", missing: "データ不足", partial: "一部のみ", time_basis: "時間基準が異なるか不明", stale: "古いデータ", currency: "通貨が異なる", scope: "スコープが異なる", open_day: "進行中の日", range: "無効な期間" },
  },
  ko: {
    eyebrow: "배포 비교", title: "저장된 배포 사용량", detail: "선택한 날짜의 일별 소스 합계입니다.", startDate: "시작일", endDate: "종료일", invalidRange: "종료일은 시작일 이후여야 합니다.", tableLabel: "배포 비교 표", deployment: "배포", requests: "요청", totalTokens: "총 토큰", actualCost: "실제 비용", referenceCost: "참조 비용", coverage: "적용 범위", captured: "수집됨", freshness: "신선도", refresh: "배포 새로고침", refreshTitle: (label) => `${label} 새로고침`, refreshingTitle: (label) => `${label} 새로고침 중`, refreshDisconnected: "연결이 끊어진 동안 새로고침할 수 없음", refreshFailed: "새로고침 실패", unavailable: "사용할 수 없음", empty: "비교할 저장된 배포가 없습니다.", coverageValue: (observed, selected) => `${selected}일 중 ${observed}일`, freshnessValues: { fresh: "최신", stale: "오래됨", unknown: "알 수 없음" }, timezoneKnown: (timezone) => `시간 기준: ${timezone}`, timezoneUnknown: "시간 기준: 알 수 없음", reasons: { one_account: "배포 하나", missing: "데이터 누락", partial: "부분 적용", time_basis: "시간 기준이 다르거나 알 수 없음", stale: "오래된 데이터", currency: "통화가 다름", scope: "범위가 다름", open_day: "진행 중인 날", range: "잘못된 기간" },
  },
  "es-419": {
    eyebrow: "Comparación de implementaciones", title: "Uso de implementaciones guardadas", detail: "Totales diarios de origen para las fechas seleccionadas.", startDate: "Fecha inicial", endDate: "Fecha final", invalidRange: "El final debe ser igual o posterior al inicio.", tableLabel: "Tabla de comparación de implementaciones", deployment: "Implementación", requests: "Solicitudes", totalTokens: "Tokens totales", actualCost: "Costo real", referenceCost: "Costo de referencia", coverage: "Cobertura", captured: "Capturado", freshness: "Actualidad", refresh: "Actualizar implementación", refreshTitle: (label) => `Actualizar ${label}`, refreshingTitle: (label) => `Actualizando ${label}`, refreshDisconnected: "No se puede actualizar mientras está desconectada", refreshFailed: "Error al actualizar", unavailable: "No disponible", empty: "No hay implementaciones guardadas para comparar.", coverageValue: (observed, selected) => `${observed} de ${selected} días`, freshnessValues: { fresh: "Actual", stale: "Desactualizado", unknown: "Desconocido" }, timezoneKnown: (timezone) => `Base horaria: ${timezone}`, timezoneUnknown: "Base horaria: desconocida", reasons: { one_account: "Una implementación", missing: "Datos faltantes", partial: "Cobertura parcial", time_basis: "Base horaria distinta o desconocida", stale: "Datos desactualizados", currency: "Moneda distinta", scope: "Alcance distinto", open_day: "Día abierto", range: "Rango no válido" },
  },
  "pt-BR": {
    eyebrow: "Comparação de implantações", title: "Uso de implantações salvas", detail: "Totais diários da origem para as datas selecionadas.", startDate: "Data inicial", endDate: "Data final", invalidRange: "A data final deve ser igual ou posterior à inicial.", tableLabel: "Tabela de comparação de implantações", deployment: "Implantação", requests: "Solicitações", totalTokens: "Total de tokens", actualCost: "Custo real", referenceCost: "Custo de referência", coverage: "Cobertura", captured: "Capturado", freshness: "Atualidade", refresh: "Atualizar implantação", refreshTitle: (label) => `Atualizar ${label}`, refreshingTitle: (label) => `Atualizando ${label}`, refreshDisconnected: "Não é possível atualizar enquanto estiver desconectada", refreshFailed: "Falha ao atualizar", unavailable: "Indisponível", empty: "Não há implantações salvas para comparar.", coverageValue: (observed, selected) => `${observed} de ${selected} dias`, freshnessValues: { fresh: "Atual", stale: "Desatualizado", unknown: "Desconhecido" }, timezoneKnown: (timezone) => `Base temporal: ${timezone}`, timezoneUnknown: "Base temporal: desconhecida", reasons: { one_account: "Uma implantação", missing: "Dados ausentes", partial: "Cobertura parcial", time_basis: "Base temporal diferente ou desconhecida", stale: "Dados desatualizados", currency: "Moeda diferente", scope: "Escopo diferente", open_day: "Dia em aberto", range: "Intervalo inválido" },
  },
  fr: {
    eyebrow: "Comparaison des déploiements", title: "Utilisation des déploiements enregistrés", detail: "Totaux quotidiens de la source pour les dates sélectionnées.", startDate: "Date de début", endDate: "Date de fin", invalidRange: "La fin doit être postérieure ou égale au début.", tableLabel: "Tableau de comparaison des déploiements", deployment: "Déploiement", requests: "Requêtes", totalTokens: "Jetons totaux", actualCost: "Coût réel", referenceCost: "Coût de référence", coverage: "Couverture", captured: "Capturé", freshness: "Actualité", refresh: "Actualiser le déploiement", refreshTitle: (label) => `Actualiser ${label}`, refreshingTitle: (label) => `Actualisation de ${label}`, refreshDisconnected: "Actualisation indisponible hors connexion", refreshFailed: "Échec de l’actualisation", unavailable: "Indisponible", empty: "Aucun déploiement enregistré à comparer.", coverageValue: (observed, selected) => `${observed} jours sur ${selected}`, freshnessValues: { fresh: "Récent", stale: "Obsolète", unknown: "Inconnu" }, timezoneKnown: (timezone) => `Base horaire : ${timezone}`, timezoneUnknown: "Base horaire : inconnue", reasons: { one_account: "Un déploiement", missing: "Données manquantes", partial: "Couverture partielle", time_basis: "Base horaire différente ou inconnue", stale: "Données obsolètes", currency: "Devise différente", scope: "Portée différente", open_day: "Jour ouvert", range: "Plage non valide" },
  },
  de: {
    eyebrow: "Bereitstellungsvergleich", title: "Nutzung gespeicherter Bereitstellungen", detail: "Tägliche Quellsummen für die ausgewählten Daten.", startDate: "Startdatum", endDate: "Enddatum", invalidRange: "Das Enddatum muss am oder nach dem Startdatum liegen.", tableLabel: "Tabelle zum Bereitstellungsvergleich", deployment: "Bereitstellung", requests: "Anfragen", totalTokens: "Token gesamt", actualCost: "Tatsächliche Kosten", referenceCost: "Referenzkosten", coverage: "Abdeckung", captured: "Erfasst", freshness: "Aktualität", refresh: "Bereitstellung aktualisieren", refreshTitle: (label) => `${label} aktualisieren`, refreshingTitle: (label) => `${label} wird aktualisiert`, refreshDisconnected: "Aktualisierung ist getrennt nicht verfügbar", refreshFailed: "Aktualisierung fehlgeschlagen", unavailable: "Nicht verfügbar", empty: "Keine gespeicherten Bereitstellungen zum Vergleichen verfügbar.", coverageValue: (observed, selected) => `${observed} von ${selected} Tagen`, freshnessValues: { fresh: "Aktuell", stale: "Veraltet", unknown: "Unbekannt" }, timezoneKnown: (timezone) => `Zeitbasis: ${timezone}`, timezoneUnknown: "Zeitbasis: unbekannt", reasons: { one_account: "Eine Bereitstellung", missing: "Fehlende Daten", partial: "Teilweise Abdeckung", time_basis: "Zeitbasis abweichend oder unbekannt", stale: "Veraltete Daten", currency: "Währung abweichend", scope: "Geltungsbereich abweichend", open_day: "Offener Tag", range: "Ungültiger Zeitraum" },
  },
  it: {
    eyebrow: "Confronto distribuzioni", title: "Utilizzo delle distribuzioni salvate", detail: "Totali giornalieri della fonte per le date selezionate.", startDate: "Data iniziale", endDate: "Data finale", invalidRange: "La data finale deve essere uguale o successiva a quella iniziale.", tableLabel: "Tabella di confronto delle distribuzioni", deployment: "Distribuzione", requests: "Richieste", totalTokens: "Token totali", actualCost: "Costo effettivo", referenceCost: "Costo di riferimento", coverage: "Copertura", captured: "Acquisito", freshness: "Aggiornamento", refresh: "Aggiorna distribuzione", refreshTitle: (label) => `Aggiorna ${label}`, refreshingTitle: (label) => `Aggiornamento di ${label}`, refreshDisconnected: "Aggiornamento non disponibile quando disconnessa", refreshFailed: "Aggiornamento non riuscito", unavailable: "Non disponibile", empty: "Non sono disponibili distribuzioni salvate da confrontare.", coverageValue: (observed, selected) => `${observed} di ${selected} giorni`, freshnessValues: { fresh: "Recente", stale: "Obsoleto", unknown: "Sconosciuto" }, timezoneKnown: (timezone) => `Base temporale: ${timezone}`, timezoneUnknown: "Base temporale: sconosciuta", reasons: { one_account: "Una distribuzione", missing: "Dati mancanti", partial: "Copertura parziale", time_basis: "Base temporale diversa o sconosciuta", stale: "Dati obsoleti", currency: "Valuta diversa", scope: "Ambito diverso", open_day: "Giorno aperto", range: "Intervallo non valido" },
  },
  ru: {
    eyebrow: "Сравнение развертываний", title: "Использование сохраненных развертываний", detail: "Дневные итоги источника за выбранные даты.", startDate: "Дата начала", endDate: "Дата окончания", invalidRange: "Дата окончания должна быть не раньше даты начала.", tableLabel: "Таблица сравнения развертываний", deployment: "Развертывание", requests: "Запросы", totalTokens: "Всего токенов", actualCost: "Фактическая стоимость", referenceCost: "Справочная стоимость", coverage: "Покрытие", captured: "Получено", freshness: "Актуальность", refresh: "Обновить развертывание", refreshTitle: (label) => `Обновить ${label}`, refreshingTitle: (label) => `Обновление ${label}`, refreshDisconnected: "Обновление недоступно без подключения", refreshFailed: "Не удалось обновить", unavailable: "Недоступно", empty: "Нет сохраненных развертываний для сравнения.", coverageValue: (observed, selected) => `${observed} из ${selected} дней`, freshnessValues: { fresh: "Свежее", stale: "Устарело", unknown: "Неизвестно" }, timezoneKnown: (timezone) => `Основа времени: ${timezone}`, timezoneUnknown: "Основа времени: неизвестна", reasons: { one_account: "Одно развертывание", missing: "Нет данных", partial: "Частичное покрытие", time_basis: "Основа времени отличается или неизвестна", stale: "Устаревшие данные", currency: "Валюта отличается", scope: "Область отличается", open_day: "Незакрытый день", range: "Неверный диапазон" },
  },
  ar: {
    eyebrow: "مقارنة عمليات النشر", title: "استخدام عمليات النشر المحفوظة", detail: "إجماليات المصدر اليومية للتواريخ المحددة.", startDate: "تاريخ البدء", endDate: "تاريخ الانتهاء", invalidRange: "يجب أن يكون تاريخ الانتهاء في تاريخ البدء أو بعده.", tableLabel: "جدول مقارنة عمليات النشر", deployment: "النشر", requests: "الطلبات", totalTokens: "إجمالي الرموز", actualCost: "التكلفة الفعلية", referenceCost: "التكلفة المرجعية", coverage: "التغطية", captured: "وقت الالتقاط", freshness: "الحداثة", refresh: "تحديث النشر", refreshTitle: (label) => `تحديث ${label}`, refreshingTitle: (label) => `جارٍ تحديث ${label}`, refreshDisconnected: "التحديث غير متاح عند انقطاع الاتصال", refreshFailed: "فشل التحديث", unavailable: "غير متاح", empty: "لا توجد عمليات نشر محفوظة للمقارنة.", coverageValue: (observed, selected) => `${observed} من ${selected} يومًا`, freshnessValues: { fresh: "حديث", stale: "قديم", unknown: "غير معروف" }, timezoneKnown: (timezone) => `أساس الوقت: ${timezone}`, timezoneUnknown: "أساس الوقت: غير معروف", reasons: { one_account: "عملية نشر واحدة", missing: "بيانات مفقودة", partial: "تغطية جزئية", time_basis: "أساس الوقت مختلف أو غير معروف", stale: "بيانات قديمة", currency: "العملة مختلفة", scope: "النطاق مختلف", open_day: "يوم مفتوح", range: "نطاق غير صالح" },
  },
  hi: {
    eyebrow: "परिनियोजन तुलना", title: "सहेजे गए परिनियोजन का उपयोग", detail: "चुनी गई तारीखों के दैनिक स्रोत योग।", startDate: "आरंभ तिथि", endDate: "समाप्ति तिथि", invalidRange: "समाप्ति तिथि आरंभ तिथि के बराबर या बाद की होनी चाहिए।", tableLabel: "परिनियोजन तुलना तालिका", deployment: "परिनियोजन", requests: "अनुरोध", totalTokens: "कुल टोकन", actualCost: "वास्तविक लागत", referenceCost: "संदर्भ लागत", coverage: "कवरेज", captured: "कैप्चर किया गया", freshness: "ताज़गी", refresh: "परिनियोजन रीफ्रेश करें", refreshTitle: (label) => `${label} रीफ्रेश करें`, refreshingTitle: (label) => `${label} रीफ्रेश हो रहा है`, refreshDisconnected: "डिस्कनेक्ट होने पर रीफ्रेश उपलब्ध नहीं है", refreshFailed: "रीफ्रेश विफल", unavailable: "उपलब्ध नहीं", empty: "तुलना के लिए कोई सहेजा गया परिनियोजन उपलब्ध नहीं है।", coverageValue: (observed, selected) => `${selected} में से ${observed} दिन`, freshnessValues: { fresh: "ताज़ा", stale: "पुराना", unknown: "अज्ञात" }, timezoneKnown: (timezone) => `समय आधार: ${timezone}`, timezoneUnknown: "समय आधार: अज्ञात", reasons: { one_account: "एक परिनियोजन", missing: "डेटा अनुपलब्ध", partial: "आंशिक कवरेज", time_basis: "समय आधार अलग या अज्ञात", stale: "पुराना डेटा", currency: "मुद्रा अलग", scope: "दायरा अलग", open_day: "खुला दिन", range: "अमान्य सीमा" },
  },
  id: {
    eyebrow: "Perbandingan penerapan", title: "Penggunaan penerapan tersimpan", detail: "Total sumber harian untuk tanggal yang dipilih.", startDate: "Tanggal mulai", endDate: "Tanggal akhir", invalidRange: "Tanggal akhir harus sama dengan atau setelah tanggal mulai.", tableLabel: "Tabel perbandingan penerapan", deployment: "Penerapan", requests: "Permintaan", totalTokens: "Total token", actualCost: "Biaya aktual", referenceCost: "Biaya referensi", coverage: "Cakupan", captured: "Diambil", freshness: "Kesegaran", refresh: "Segarkan penerapan", refreshTitle: (label) => `Segarkan ${label}`, refreshingTitle: (label) => `Menyegarkan ${label}`, refreshDisconnected: "Penyegaran tidak tersedia saat terputus", refreshFailed: "Penyegaran gagal", unavailable: "Tidak tersedia", empty: "Tidak ada penerapan tersimpan untuk dibandingkan.", coverageValue: (observed, selected) => `${observed} dari ${selected} hari`, freshnessValues: { fresh: "Baru", stale: "Usang", unknown: "Tidak diketahui" }, timezoneKnown: (timezone) => `Dasar waktu: ${timezone}`, timezoneUnknown: "Dasar waktu: tidak diketahui", reasons: { one_account: "Satu penerapan", missing: "Data tidak ada", partial: "Cakupan sebagian", time_basis: "Dasar waktu berbeda atau tidak diketahui", stale: "Data usang", currency: "Mata uang berbeda", scope: "Cakupan berbeda", open_day: "Hari terbuka", range: "Rentang tidak valid" },
  },
};

const RANGE_LIMIT_COPY: Record<ResolvedAppLocale, string> = {
  en: "Use no more than 366 days.",
  "zh-CN": "范围不得超过 366 天。",
  "zh-TW": "範圍不得超過 366 天。",
  ja: "期間は 366 日以内にしてください。",
  ko: "기간은 366일 이하여야 합니다.",
  "es-419": "Usa un máximo de 366 días.",
  "pt-BR": "Use no máximo 366 dias.",
  fr: "Utilisez au maximum 366 jours.",
  de: "Verwenden Sie höchstens 366 Tage.",
  it: "Usa al massimo 366 giorni.",
  ru: "Используйте не более 366 дней.",
  ar: "استخدم مدة لا تزيد على 366 يومًا.",
  hi: "अधिकतम 366 दिनों का उपयोग करें।",
  id: "Gunakan paling banyak 366 hari.",
};

export function buildAggregateUsageLocalizedCopy(
  locale: ResolvedAppLocale,
): AggregateUsageLocalizedCopy {
  const copy = COPY[locale];
  return {
    ...copy,
    invalidRange: `${copy.invalidRange} ${RANGE_LIMIT_COPY[locale]}`,
  };
}
