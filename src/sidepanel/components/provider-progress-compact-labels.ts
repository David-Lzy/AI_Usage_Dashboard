import type { RuntimeI18n } from "../../shared/i18n";
import type { ProviderProgressItem } from "../../shared/provider-progress-items";

type CompactProgressWindowKind =
  | "rolling_5h"
  | "weekly"
  | "model_rolling_5h"
  | "model_weekly"
  | "daily"
  | "monthly"
  | "session"
  | "flex_credit_balance"
  | "unknown";

type CompactProgressCopy = {
  colon: string;
  comma: string;
  day: string;
  dailyRoutines: string;
  fiveHour: string;
  flexCredits: string;
  month: string;
  reset: string;
  session: string;
  week: string;
};

function buildCompactProgressCopy(i18n: RuntimeI18n): CompactProgressCopy {
  switch (i18n.resolvedLocale) {
    case "zh-CN":
      return {
        colon: "：",
        comma: "，",
        day: "日额度",
        dailyRoutines: "每日例行",
        fiveHour: "5小时",
        flexCredits: "Flex 积分",
        month: "月额度",
        reset: "重置",
        session: "会话",
        week: "周额度",
      };
    case "zh-TW":
      return {
        colon: "：",
        comma: "，",
        day: "日額度",
        dailyRoutines: "每日例行",
        fiveHour: "5小時",
        flexCredits: "Flex 點數",
        month: "月額度",
        reset: "重設",
        session: "工作階段",
        week: "週額度",
      };
    case "ja":
      return {
        colon: "：",
        comma: "、",
        day: "日次",
        dailyRoutines: "日次実行",
        fiveHour: "5時間",
        flexCredits: "Flex クレジット",
        month: "月次",
        reset: "リセット",
        session: "セッション",
        week: "週次",
      };
    case "ko":
      return {
        colon: ":",
        comma: ", ",
        day: "일일",
        dailyRoutines: "일일 실행",
        fiveHour: "5시간",
        flexCredits: "Flex 크레딧",
        month: "월간",
        reset: "리셋",
        session: "세션",
        week: "주간",
      };
    case "es-419":
      return {
        colon: ":",
        comma: ", ",
        day: "día",
        dailyRoutines: "rutinas diarias",
        fiveHour: "5 h",
        flexCredits: "créditos Flex",
        month: "mes",
        reset: "reinicio",
        session: "sesión",
        week: "semana",
      };
    case "pt-BR":
      return {
        colon: ":",
        comma: ", ",
        day: "dia",
        dailyRoutines: "rotinas diárias",
        fiveHour: "5 h",
        flexCredits: "créditos Flex",
        month: "mês",
        reset: "reinicia",
        session: "sessão",
        week: "semana",
      };
    case "fr":
      return {
        colon: ":",
        comma: ", ",
        day: "jour",
        dailyRoutines: "routines jour",
        fiveHour: "5 h",
        flexCredits: "crédits Flex",
        month: "mois",
        reset: "réinit.",
        session: "session",
        week: "semaine",
      };
    case "de":
      return {
        colon: ":",
        comma: ", ",
        day: "Tag",
        dailyRoutines: "Tagesroutinen",
        fiveHour: "5 h",
        flexCredits: "Flex-Credits",
        month: "Monat",
        reset: "Reset",
        session: "Sitzung",
        week: "Woche",
      };
    case "it":
      return {
        colon: ":",
        comma: ", ",
        day: "giorno",
        dailyRoutines: "routine giorno",
        fiveHour: "5 h",
        flexCredits: "crediti Flex",
        month: "mese",
        reset: "reset",
        session: "sessione",
        week: "settimana",
      };
    case "ru":
      return {
        colon: ":",
        comma: ", ",
        day: "день",
        dailyRoutines: "дневные запуски",
        fiveHour: "5 ч",
        flexCredits: "Flex-кредиты",
        month: "месяц",
        reset: "сброс",
        session: "сессия",
        week: "неделя",
      };
    case "ar":
      return {
        colon: ":",
        comma: "، ",
        day: "يومي",
        dailyRoutines: "تشغيل يومي",
        fiveHour: "5 س",
        flexCredits: "أرصدة Flex",
        month: "شهري",
        reset: "إعادة",
        session: "جلسة",
        week: "أسبوعي",
      };
    case "hi":
      return {
        colon: ":",
        comma: ", ",
        day: "दिन",
        dailyRoutines: "दैनिक रन",
        fiveHour: "5 घं",
        flexCredits: "Flex क्रेडिट",
        month: "माह",
        reset: "रीसेट",
        session: "सत्र",
        week: "सप्ताह",
      };
    case "id":
      return {
        colon: ":",
        comma: ", ",
        day: "hari",
        dailyRoutines: "rutin harian",
        fiveHour: "5 j",
        flexCredits: "kredit Flex",
        month: "bulan",
        reset: "reset",
        session: "sesi",
        week: "minggu",
      };
    default:
      return {
        colon: ":",
        comma: ", ",
        day: "day",
        dailyRoutines: "daily routines",
        fiveHour: "5h",
        flexCredits: "Flex credits",
        month: "month",
        reset: "reset",
        session: "session",
        week: "week",
      };
  }
}

function decodeProgressItemPart(value: string | undefined): string {
  if (!value) {
    return "";
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function getCompactProgressWindowKind(
  item: ProviderProgressItem,
): CompactProgressWindowKind {
  const [category, rawKind] = item.id.split(":");
  const idKind = decodeProgressItemPart(rawKind).toLowerCase();
  const lowerLabel = item.label.toLowerCase();
  const lowerDetail = item.detail?.toLowerCase() ?? "";
  const isSpark = lowerLabel.includes("spark") || lowerDetail.includes("spark");

  if (category === "window") {
    switch (idKind) {
      case "rolling_5h":
      case "model_rolling_5h":
      case "weekly":
      case "model_weekly":
        return idKind;
      default:
        break;
    }
  }

  if (category === "balance" && idKind === "flex_credit_balance") {
    return "flex_credit_balance";
  }

  if (/5\s*[- ]?\s*(?:hour|h)|5\s*(?:小时|小時|時間|시간)/i.test(item.label)) {
    return isSpark ? "model_rolling_5h" : "rolling_5h";
  }

  if (/week|weekly|每周|每週|周|週/i.test(item.label)) {
    return isSpark ? "model_weekly" : "weekly";
  }

  if (/month|monthly|每月|月/i.test(item.label)) {
    return "monthly";
  }

  if (/daily|day|每日|日/i.test(item.label)) {
    return "daily";
  }

  if (/current session|session|当前会话|目前工作階段/i.test(item.label)) {
    return "session";
  }

  return "unknown";
}

function getShortModelLabel(item: ProviderProgressItem): string | null {
  const source = item.detail ?? item.label;

  if (/spark/i.test(source)) {
    return "Spark";
  }

  if (/claude\s+design/i.test(source)) {
    return "Claude Design";
  }

  if (/all\s+models/i.test(source)) {
    return "All models";
  }

  if (!item.detail) {
    return null;
  }

  return item.detail
    .replace(/^GPT-[\w.-]+-Codex-/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatCompactProgressBaseLabel(
  item: ProviderProgressItem,
  i18n: RuntimeI18n,
): string {
  const copy = buildCompactProgressCopy(i18n);
  const windowKind = getCompactProgressWindowKind(item);
  const shortModelLabel = getShortModelLabel(item);

  switch (windowKind) {
    case "rolling_5h":
      return copy.fiveHour;
    case "weekly":
      return /all\s+models/i.test(item.label)
        ? `${copy.week} · ${shortModelLabel ?? "All models"}`
        : copy.week;
    case "model_rolling_5h":
      return shortModelLabel ? `${shortModelLabel} ${copy.fiveHour}` : copy.fiveHour;
    case "model_weekly":
      return shortModelLabel ? `${shortModelLabel} ${copy.week}` : copy.week;
    case "daily":
      return /routine/i.test(item.label) ? copy.dailyRoutines : copy.day;
    case "monthly":
      return copy.month;
    case "session":
      return copy.session;
    case "flex_credit_balance":
      return copy.flexCredits;
    default:
      return item.label
        .replace(/\s+usage\s+window\b/gi, "")
        .replace(/\s+usage\s+limit\b/gi, "")
        .replace(/\s+使用限额\b/g, "")
        .trim();
  }
}

function shouldUseDateResetLabel(windowKind: CompactProgressWindowKind): boolean {
  return (
    windowKind === "weekly" ||
    windowKind === "model_weekly" ||
    windowKind === "monthly" ||
    windowKind === "daily"
  );
}

function formatCompactMonthDay(
  i18n: RuntimeI18n,
  month: string,
  day: string,
): string {
  if (
    i18n.resolvedLocale === "zh-CN" ||
    i18n.resolvedLocale === "zh-TW" ||
    i18n.resolvedLocale === "ja" ||
    i18n.resolvedLocale === "ko"
  ) {
    return `${month}/${day}`;
  }

  return `${day}/${month}`;
}

function formatCompactResetAt(
  item: ProviderProgressItem,
  i18n: RuntimeI18n,
): string | null {
  if (!item.resetAt) {
    return null;
  }

  const resetAt = item.resetAt.trim();
  const windowKind = getCompactProgressWindowKind(item);
  const dateTimeMatch =
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?:\s+UTC)?$/i.exec(
      resetAt,
    );

  if (dateTimeMatch) {
    return shouldUseDateResetLabel(windowKind)
      ? formatCompactMonthDay(i18n, dateTimeMatch[2], dateTimeMatch[3])
      : `${dateTimeMatch[4]}:${dateTimeMatch[5]}`;
  }

  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})(?:\s+UTC)?$/i.exec(resetAt);

  if (dateMatch) {
    return formatCompactMonthDay(i18n, dateMatch[2], dateMatch[3]);
  }

  const timeMatch = /\b(\d{1,2}:\d{2}\s*(?:AM|PM)?)\b/i.exec(resetAt);

  if (timeMatch && !shouldUseDateResetLabel(windowKind)) {
    return timeMatch[1].replace(/\s+/g, " ");
  }

  return i18n.localizeResetRuntimeLabel(resetAt);
}

export function formatPopupProgressItemLabel(
  item: ProviderProgressItem,
  i18n: RuntimeI18n,
): string {
  const copy = buildCompactProgressCopy(i18n);
  const baseLabel = formatCompactProgressBaseLabel(item, i18n);
  const resetAt = formatCompactResetAt(item, i18n);
  const colonSpace = copy.colon === "：" ? "" : " ";

  return resetAt
    ? `${baseLabel}${copy.comma}${copy.reset}${copy.colon}${colonSpace}${resetAt}`
    : baseLabel;
}

export function formatPopupPreviewQuotaLabel(i18n: RuntimeI18n): string {
  switch (i18n.resolvedLocale) {
    case "zh-CN":
      return "周额度，重置：05/19";
    case "zh-TW":
      return "週額度，重設：05/19";
    case "ja":
      return "週次、リセット：05/19";
    case "ko":
      return "주간, 리셋: 05/19";
    case "ar":
      return "أسبوعي، إعادة: 19/05";
    default:
      return "week, reset: 19/05";
  }
}
