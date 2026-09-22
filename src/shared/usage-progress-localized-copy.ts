import type { ResolvedAppLocale } from "./i18n";

export type UsageProgressLocalizedCopy = {
  percentageUnavailable: string;
  unknown: string;
  unavailable: string;
  remainingValue: (value: string) => string;
  usedValue: (value: string) => string;
  trackedValue: (value: string) => string;
  totalValue: (value: string) => string;
};

const COPY_BY_LOCALE: Record<ResolvedAppLocale, UsageProgressLocalizedCopy> = {
  en: {
    percentageUnavailable: "Usage percentage unavailable",
    unknown: "Unknown",
    unavailable: "Unavailable",
    remainingValue: (value) => `${value} remaining`,
    usedValue: (value) => `${value} used`,
    trackedValue: (value) => `${value} tracked`,
    totalValue: (value) => `${value} total`,
  },
  "zh-CN": {
    percentageUnavailable: "使用百分比不可用",
    unknown: "未知",
    unavailable: "不可用",
    remainingValue: (value) => `剩余${value}`,
    usedValue: (value) => `已用${value}`,
    trackedValue: (value) => `已跟踪${value}`,
    totalValue: (value) => `总计${value}`,
  },
  "zh-TW": {
    percentageUnavailable: "使用百分比無法取得",
    unknown: "未知",
    unavailable: "無法使用",
    remainingValue: (value) => `剩餘${value}`,
    usedValue: (value) => `已用${value}`,
    trackedValue: (value) => `已追蹤${value}`,
    totalValue: (value) => `總計${value}`,
  },
  ja: {
    percentageUnavailable: "使用率を取得できません",
    unknown: "不明",
    unavailable: "利用不可",
    remainingValue: (value) => `${value} 残り`,
    usedValue: (value) => `${value} 使用済み`,
    trackedValue: (value) => `${value} 記録済み`,
    totalValue: (value) => `${value} 合計`,
  },
  ko: {
    percentageUnavailable: "사용률을 확인할 수 없음",
    unknown: "알 수 없음",
    unavailable: "사용할 수 없음",
    remainingValue: (value) => `${value} 남음`,
    usedValue: (value) => `${value} 사용됨`,
    trackedValue: (value) => `${value} 추적됨`,
    totalValue: (value) => `${value} 합계`,
  },
  "es-419": {
    percentageUnavailable: "El porcentaje de uso no está disponible",
    unknown: "Desconocido",
    unavailable: "No disponible",
    remainingValue: (value) => `${value} restante`,
    usedValue: (value) => `${value} usado`,
    trackedValue: (value) => `${value} registrado`,
    totalValue: (value) => `${value} total`,
  },
  "pt-BR": {
    percentageUnavailable: "A porcentagem de uso não está disponível",
    unknown: "Desconhecido",
    unavailable: "Indisponível",
    remainingValue: (value) => `${value} restante`,
    usedValue: (value) => `${value} usado`,
    trackedValue: (value) => `${value} rastreado`,
    totalValue: (value) => `${value} total`,
  },
  fr: {
    percentageUnavailable: "Le pourcentage d'utilisation n'est pas disponible",
    unknown: "Inconnu",
    unavailable: "Indisponible",
    remainingValue: (value) => `${value} restant`,
    usedValue: (value) => `${value} utilisé`,
    trackedValue: (value) => `${value} suivi`,
    totalValue: (value) => `${value} au total`,
  },
  de: {
    percentageUnavailable: "Nutzungsprozentsatz nicht verfügbar",
    unknown: "Unbekannt",
    unavailable: "Nicht verfügbar",
    remainingValue: (value) => `${value} verbleibend`,
    usedValue: (value) => `${value} verwendet`,
    trackedValue: (value) => `${value} erfasst`,
    totalValue: (value) => `${value} insgesamt`,
  },
  it: {
    percentageUnavailable: "Percentuale di utilizzo non disponibile",
    unknown: "Sconosciuto",
    unavailable: "Non disponibile",
    remainingValue: (value) => `${value} rimanente`,
    usedValue: (value) => `${value} utilizzato`,
    trackedValue: (value) => `${value} monitorato`,
    totalValue: (value) => `${value} totale`,
  },
  ru: {
    percentageUnavailable: "Процент использования недоступен",
    unknown: "Неизвестно",
    unavailable: "Недоступно",
    remainingValue: (value) => `Осталось ${value}`,
    usedValue: (value) => `Использовано ${value}`,
    trackedValue: (value) => `Отслеживается ${value}`,
    totalValue: (value) => `Всего ${value}`,
  },
  ar: {
    percentageUnavailable: "نسبة الاستخدام غير متاحة",
    unknown: "غير معروف",
    unavailable: "غير متاح",
    remainingValue: (value) => `${value} متبقٍ`,
    usedValue: (value) => `${value} مستخدم`,
    trackedValue: (value) => `${value} تم تتبعه`,
    totalValue: (value) => `${value} إجمالي`,
  },
  hi: {
    percentageUnavailable: "उपयोग प्रतिशत उपलब्ध नहीं है",
    unknown: "अज्ञात",
    unavailable: "अनुपलब्ध",
    remainingValue: (value) => `${value} शेष`,
    usedValue: (value) => `${value} उपयोग किया गया`,
    trackedValue: (value) => `${value} ट्रैक किया गया`,
    totalValue: (value) => `${value} कुल`,
  },
  id: {
    percentageUnavailable: "Persentase penggunaan tidak tersedia",
    unknown: "Tidak diketahui",
    unavailable: "Tidak tersedia",
    remainingValue: (value) => `${value} tersisa`,
    usedValue: (value) => `${value} digunakan`,
    trackedValue: (value) => `${value} dilacak`,
    totalValue: (value) => `${value} total`,
  },
};

export function buildUsageProgressLocalizedCopy(
  locale: ResolvedAppLocale,
): UsageProgressLocalizedCopy {
  return {
    ...COPY_BY_LOCALE[locale],
  };
}
