import type {
  ResetTimeDisplayMode,
  ProviderUsageWindow,
} from "../providers/types";
import type { RuntimeI18n } from "./i18n";
import { APP_LOCALE_METADATA, type ResolvedAppLocale } from "./i18n";

export const DEFAULT_RESET_TIME_DISPLAY_MODE: ResetTimeDisplayMode = "date";

export const RESET_TIME_DISPLAY_MODES: readonly ResetTimeDisplayMode[] = [
  "date",
  "weekday",
  "date_and_weekday",
];

export type ResetTimeDisplayCopy = {
  settingLabel: string;
  dateOption: string;
  weekdayOption: string;
  dateAndWeekdayOption: string;
  weeklyLimit: string;
  fiveHourLimit: string;
  usageLimit: string;
  resetText: (formattedTime: string) => string;
};

export type QuotaResetLabelParts = {
  name: string;
  reset: string | null;
};

export function normalizeResetTimeDisplayMode(
  value: unknown,
): ResetTimeDisplayMode {
  return value === "weekday" || value === "date_and_weekday"
    ? value
    : DEFAULT_RESET_TIME_DISPLAY_MODE;
}

export function buildResetTimeDisplayCopy(
  locale: ResolvedAppLocale,
): ResetTimeDisplayCopy {
  switch (locale) {
    case "zh-CN":
      return {
        settingLabel: "重置时间格式",
        dateOption: "日期与时间",
        weekdayOption: "周几与时间",
        dateAndWeekdayOption: "日期、周几与时间",
        weeklyLimit: "每周限额",
        fiveHourLimit: "5 小时限额",
        usageLimit: "使用限额",
        resetText: (value) => `${value} 重置`,
      };
    case "zh-TW":
      return {
        settingLabel: "重設時間格式",
        dateOption: "日期與時間",
        weekdayOption: "星期與時間",
        dateAndWeekdayOption: "日期、星期與時間",
        weeklyLimit: "每週限額",
        fiveHourLimit: "5 小時限額",
        usageLimit: "使用限額",
        resetText: (value) => `${value} 重設`,
      };
    case "ja":
      return {
        settingLabel: "リセット時刻の表示",
        dateOption: "日付と時刻",
        weekdayOption: "曜日と時刻",
        dateAndWeekdayOption: "日付、曜日、時刻",
        weeklyLimit: "週間上限",
        fiveHourLimit: "5 時間上限",
        usageLimit: "使用上限",
        resetText: (value) => `${value} にリセット`,
      };
    case "ko":
      return {
        settingLabel: "재설정 시간 형식",
        dateOption: "날짜 및 시간",
        weekdayOption: "요일 및 시간",
        dateAndWeekdayOption: "날짜, 요일 및 시간",
        weeklyLimit: "주간 한도",
        fiveHourLimit: "5시간 한도",
        usageLimit: "사용 한도",
        resetText: (value) => `${value} 재설정`,
      };
    case "es-419":
      return {
        settingLabel: "Formato de reinicio",
        dateOption: "Fecha y hora",
        weekdayOption: "Día y hora",
        dateAndWeekdayOption: "Fecha, día y hora",
        weeklyLimit: "Límite semanal",
        fiveHourLimit: "Límite de 5 horas",
        usageLimit: "Límite de uso",
        resetText: (value) => `Se reinicia ${value}`,
      };
    case "pt-BR":
      return {
        settingLabel: "Formato de redefinição",
        dateOption: "Data e hora",
        weekdayOption: "Dia da semana e hora",
        dateAndWeekdayOption: "Data, dia e hora",
        weeklyLimit: "Limite semanal",
        fiveHourLimit: "Limite de 5 horas",
        usageLimit: "Limite de uso",
        resetText: (value) => `Redefine ${value}`,
      };
    case "fr":
      return {
        settingLabel: "Format de réinitialisation",
        dateOption: "Date et heure",
        weekdayOption: "Jour et heure",
        dateAndWeekdayOption: "Date, jour et heure",
        weeklyLimit: "Limite hebdomadaire",
        fiveHourLimit: "Limite de 5 heures",
        usageLimit: "Limite d'utilisation",
        resetText: (value) => `Réinitialisation ${value}`,
      };
    case "de":
      return {
        settingLabel: "Format der Rücksetzzeit",
        dateOption: "Datum und Uhrzeit",
        weekdayOption: "Wochentag und Uhrzeit",
        dateAndWeekdayOption: "Datum, Wochentag und Uhrzeit",
        weeklyLimit: "Wochenlimit",
        fiveHourLimit: "5-Stunden-Limit",
        usageLimit: "Nutzungslimit",
        resetText: (value) => `Zurücksetzen ${value}`,
      };
    case "it":
      return {
        settingLabel: "Formato di reimpostazione",
        dateOption: "Data e ora",
        weekdayOption: "Giorno e ora",
        dateAndWeekdayOption: "Data, giorno e ora",
        weeklyLimit: "Limite settimanale",
        fiveHourLimit: "Limite di 5 ore",
        usageLimit: "Limite di utilizzo",
        resetText: (value) => `Reimpostazione ${value}`,
      };
    case "ru":
      return {
        settingLabel: "Формат времени сброса",
        dateOption: "Дата и время",
        weekdayOption: "День недели и время",
        dateAndWeekdayOption: "Дата, день и время",
        weeklyLimit: "Недельный лимит",
        fiveHourLimit: "Лимит на 5 часов",
        usageLimit: "Лимит использования",
        resetText: (value) => `Сброс ${value}`,
      };
    case "ar":
      return {
        settingLabel: "تنسيق وقت إعادة التعيين",
        dateOption: "التاريخ والوقت",
        weekdayOption: "اليوم والوقت",
        dateAndWeekdayOption: "التاريخ واليوم والوقت",
        weeklyLimit: "الحد الأسبوعي",
        fiveHourLimit: "حد 5 ساعات",
        usageLimit: "حد الاستخدام",
        resetText: (value) => `إعادة التعيين ${value}`,
      };
    case "hi":
      return {
        settingLabel: "रीसेट समय प्रारूप",
        dateOption: "दिनांक और समय",
        weekdayOption: "दिन और समय",
        dateAndWeekdayOption: "दिनांक, दिन और समय",
        weeklyLimit: "साप्ताहिक सीमा",
        fiveHourLimit: "5 घंटे की सीमा",
        usageLimit: "उपयोग सीमा",
        resetText: (value) => `${value} रीसेट`,
      };
    case "id":
      return {
        settingLabel: "Format waktu reset",
        dateOption: "Tanggal dan waktu",
        weekdayOption: "Hari dan waktu",
        dateAndWeekdayOption: "Tanggal, hari, dan waktu",
        weeklyLimit: "Batas mingguan",
        fiveHourLimit: "Batas 5 jam",
        usageLimit: "Batas penggunaan",
        resetText: (value) => `Reset ${value}`,
      };
    default:
      return {
        settingLabel: "Reset time format",
        dateOption: "Date and time",
        weekdayOption: "Weekday and time",
        dateAndWeekdayOption: "Date, weekday, and time",
        weeklyLimit: "Weekly limit",
        fiveHourLimit: "5-hour limit",
        usageLimit: "Usage limit",
        resetText: (value) => `Resets ${value}`,
      };
  }
}

function parseResetDate(rawValue: string, now: Date): Date | null {
  const value = rawValue.trim();
  const localDateTime =
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2})(?:\s+(UTC))?$/i.exec(
      value,
    );

  if (localDateTime) {
    const [, year, month, day, hour, minute, utc] = localDateTime;
    const parts = [year, month, day, hour, minute].map((part) => Number(part));
    const [yearValue, monthValue, dayValue, hourValue, minuteValue] = parts;

    if (
      yearValue === undefined ||
      monthValue === undefined ||
      dayValue === undefined ||
      hourValue === undefined ||
      minuteValue === undefined
    ) {
      return null;
    }

    const date = utc
      ? new Date(
          Date.UTC(
            yearValue,
            monthValue - 1,
            dayValue,
            hourValue,
            minuteValue,
          ),
        )
      : new Date(
          yearValue,
          monthValue - 1,
          dayValue,
          hourValue,
          minuteValue,
        );

    return Number.isNaN(date.getTime()) ? null : date;
  }

  const weekdayTime =
    /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(
      value,
    );

  if (weekdayTime) {
    const weekdayIndex = [
      "sun",
      "mon",
      "tue",
      "wed",
      "thu",
      "fri",
      "sat",
    ].indexOf((weekdayTime[1] ?? "").toLowerCase().slice(0, 3));

    if (weekdayIndex < 0) {
      return null;
    }
    let hour = Number(weekdayTime[2]);
    const minute = Number(weekdayTime[3]);
    const meridiem = weekdayTime[4]?.toLowerCase();

    if (meridiem === "pm" && hour < 12) hour += 12;
    if (meridiem === "am" && hour === 12) hour = 0;

    const next = new Date(now);
    next.setHours(hour, minute, 0, 0);
    let dayOffset = (weekdayIndex - next.getDay() + 7) % 7;

    if (dayOffset === 0 && next.getTime() <= now.getTime()) {
      dayOffset = 7;
    }

    next.setDate(next.getDate() + dayOffset);
    return next;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp) : null;
}

export function formatResetTimeValue(
  rawValue: string,
  mode: ResetTimeDisplayMode,
  i18n: RuntimeI18n,
  now = new Date(),
): string | null {
  const date = parseResetDate(rawValue, now);

  if (!date) {
    return null;
  }

  const includesDate = mode !== "weekday";
  const includesWeekday = mode !== "date";
  const options: Intl.DateTimeFormatOptions = {
    ...(includesDate ? { month: "short", day: "numeric" } : {}),
    ...(includesWeekday ? { weekday: "short" } : {}),
    hour: "numeric",
    minute: "2-digit",
  };

  return new Intl.DateTimeFormat(
    APP_LOCALE_METADATA[i18n.resolvedLocale].intlLocale,
    options,
  ).format(date);
}

function getWindowKind(itemId: string): ProviderUsageWindow["kind"] | null {
  if (!itemId.startsWith("window:")) {
    return null;
  }

  const encodedKind = itemId.split(":")[1];

  try {
    const kind = decodeURIComponent(encodedKind ?? "");
    return kind === "rolling_5h" ||
      kind === "weekly" ||
      kind === "model_rolling_5h" ||
      kind === "model_weekly" ||
      kind === "unknown"
      ? kind
      : null;
  } catch {
    return null;
  }
}

function inferLegacyWindowKind(
  label: string,
): ProviderUsageWindow["kind"] | null {
  if (/5\s*[- ]?\s*(?:hour|h)|5\s*(?:小时|小時|時間|시간)/i.test(label)) {
    return "rolling_5h";
  }

  if (/week|weekly|每周|每週|周|週/i.test(label)) {
    return "weekly";
  }

  return null;
}

export function buildQuotaResetLabelParts(
  item: {
    id: string;
    kind: "primary_quota" | "usage_window" | "usage_balance";
    label: string;
    detail: string | null;
    resetAt: string | null;
    resetLabel: string | null;
  },
  mode: ResetTimeDisplayMode,
  i18n: RuntimeI18n,
  now = new Date(),
): QuotaResetLabelParts {
  const copy = buildResetTimeDisplayCopy(i18n.resolvedLocale);
  const windowKind = getWindowKind(item.id) ?? inferLegacyWindowKind(item.label);
  const isModelWindow =
    windowKind === "model_rolling_5h" ||
    windowKind === "model_weekly" ||
    (item.kind === "usage_window" && Boolean(item.detail));
  const isGenericUnknownWindow =
    windowKind === "unknown" &&
    /^(?:provider\s+)?(?:unknown\s+)?usage(?:\s+(?:window|limit))?$/i.test(
      item.label.trim(),
    );
  const name = isModelWindow
    ? item.detail || item.label
    : windowKind === "weekly"
      ? copy.weeklyLimit
      : windowKind === "rolling_5h"
        ? copy.fiveHourLimit
        : isGenericUnknownWindow
          ? copy.usageLimit
          : item.label;
  const formattedReset = item.resetAt
    ? formatResetTimeValue(item.resetAt, mode, i18n, now)
    : null;
  const reset = formattedReset
    ? copy.resetText(formattedReset)
    : item.resetLabel
      ? i18n.localizeResetRuntimeLabel(item.resetLabel)
      : null;

  return { name, reset };
}
