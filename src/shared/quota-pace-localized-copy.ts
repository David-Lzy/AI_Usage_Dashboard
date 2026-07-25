// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 David-Lzy (https://github.com/David-Lzy). All rights reserved.

import {
  APP_LOCALE_METADATA,
  type ResolvedAppLocale,
} from "./i18n";
import type { QuotaPaceStatus } from "./quota-pace";

export type QuotaPaceLocalizedCopy = {
  settingLabel: string;
  settingDetail: string;
  sectionLabel: string;
  estimateLabel: string;
  status: Record<QuotaPaceStatus, string>;
  comparison: (usedPercent: string, elapsedPercent: string) => string;
  lastsThroughReset: (resetTime: string) => string;
  projectedExhaustion: (exhaustionTime: string) => string;
};

const QUOTA_PACE_COPY: Record<ResolvedAppLocale, QuotaPaceLocalizedCopy> = {
  en: {
    settingLabel: "Quota pace estimate",
    settingDetail:
      "Show a conservative estimate in Provider details for fresh, fixed-duration percentage windows.",
    sectionLabel: "Quota pace",
    estimateLabel: "Estimate",
    status: {
      ahead: "Capacity ahead of schedule",
      on_track: "On track",
      at_risk: "At risk",
    },
    comparison: (used, elapsed) => `${used} used after ${elapsed} of the window`,
    lastsThroughReset: (time) => `Expected to last through the ${time} reset`,
    projectedExhaustion: (time) => `May run out around ${time}`,
  },
  "zh-CN": {
    settingLabel: "额度节奏估算",
    settingDetail: "在 Provider 详情中，为新鲜且周期固定的百分比额度显示保守估算。",
    sectionLabel: "额度节奏",
    estimateLabel: "估算",
    status: { ahead: "余量领先进度", on_track: "进度正常", at_risk: "可能提前用尽" },
    comparison: (used, elapsed) => `周期经过 ${elapsed} 时已使用 ${used}`,
    lastsThroughReset: (time) => `预计可持续到 ${time} 重置`,
    projectedExhaustion: (time) => `可能在 ${time} 左右用尽`,
  },
  "zh-TW": {
    settingLabel: "額度節奏估算",
    settingDetail: "在 Provider 詳情中，為新鮮且週期固定的百分比額度顯示保守估算。",
    sectionLabel: "額度節奏",
    estimateLabel: "估算",
    status: { ahead: "餘量領先進度", on_track: "進度正常", at_risk: "可能提前用盡" },
    comparison: (used, elapsed) => `週期經過 ${elapsed} 時已使用 ${used}`,
    lastsThroughReset: (time) => `預計可持續到 ${time} 重設`,
    projectedExhaustion: (time) => `可能在 ${time} 左右用盡`,
  },
  ja: {
    settingLabel: "使用ペースの推定",
    settingDetail: "Provider 詳細で、最新の固定期間パーセント枠に保守的な推定を表示します。",
    sectionLabel: "使用ペース",
    estimateLabel: "推定",
    status: { ahead: "余裕があります", on_track: "予定どおり", at_risk: "早期消費の可能性" },
    comparison: (used, elapsed) => `期間の ${elapsed} 経過時点で ${used} 使用`,
    lastsThroughReset: (time) => `${time} のリセットまで持つ見込み`,
    projectedExhaustion: (time) => `${time} 頃に使い切る可能性`,
  },
  ko: {
    settingLabel: "한도 속도 추정",
    settingDetail: "Provider 세부정보에서 최신 고정 기간 백분율 한도의 보수적 추정을 표시합니다.",
    sectionLabel: "한도 속도",
    estimateLabel: "추정",
    status: { ahead: "여유 있음", on_track: "정상 속도", at_risk: "조기 소진 위험" },
    comparison: (used, elapsed) => `기간 ${elapsed} 경과 시 ${used} 사용`,
    lastsThroughReset: (time) => `${time} 재설정까지 유지될 것으로 예상`,
    projectedExhaustion: (time) => `${time}경 소진될 수 있음`,
  },
  "es-419": {
    settingLabel: "Estimación del ritmo de cuota",
    settingDetail: "Muestra una estimación conservadora para ventanas porcentuales recientes y de duración fija.",
    sectionLabel: "Ritmo de cuota",
    estimateLabel: "Estimación",
    status: { ahead: "Capacidad adelantada", on_track: "En ritmo", at_risk: "En riesgo" },
    comparison: (used, elapsed) => `${used} usado tras ${elapsed} de la ventana`,
    lastsThroughReset: (time) => `Se espera que dure hasta el reinicio de ${time}`,
    projectedExhaustion: (time) => `Podría agotarse cerca de ${time}`,
  },
  "pt-BR": {
    settingLabel: "Estimativa do ritmo da cota",
    settingDetail: "Mostra uma estimativa conservadora para janelas percentuais recentes e de duração fixa.",
    sectionLabel: "Ritmo da cota",
    estimateLabel: "Estimativa",
    status: { ahead: "Capacidade adiantada", on_track: "No ritmo", at_risk: "Em risco" },
    comparison: (used, elapsed) => `${used} usado após ${elapsed} da janela`,
    lastsThroughReset: (time) => `Deve durar até a redefinição de ${time}`,
    projectedExhaustion: (time) => `Pode acabar perto de ${time}`,
  },
  fr: {
    settingLabel: "Estimation du rythme du quota",
    settingDetail: "Affiche une estimation prudente pour les fenêtres récentes, fixes et en pourcentage.",
    sectionLabel: "Rythme du quota",
    estimateLabel: "Estimation",
    status: { ahead: "Capacité en avance", on_track: "Dans le rythme", at_risk: "À risque" },
    comparison: (used, elapsed) => `${used} utilisés après ${elapsed} de la fenêtre`,
    lastsThroughReset: (time) => `Devrait durer jusqu'à la réinitialisation de ${time}`,
    projectedExhaustion: (time) => `Épuisement possible vers ${time}`,
  },
  de: {
    settingLabel: "Kontingenttempo schätzen",
    settingDetail: "Zeigt eine vorsichtige Schätzung für aktuelle prozentuale Fenster mit fester Dauer.",
    sectionLabel: "Kontingenttempo",
    estimateLabel: "Schätzung",
    status: { ahead: "Kapazität im Vorsprung", on_track: "Im Plan", at_risk: "Gefährdet" },
    comparison: (used, elapsed) => `${used} verbraucht nach ${elapsed} des Fensters`,
    lastsThroughReset: (time) => `Reicht voraussichtlich bis zur Rücksetzung um ${time}`,
    projectedExhaustion: (time) => `Könnte gegen ${time} aufgebraucht sein`,
  },
  it: {
    settingLabel: "Stima del ritmo quota",
    settingDetail: "Mostra una stima prudente per finestre percentuali recenti e di durata fissa.",
    sectionLabel: "Ritmo quota",
    estimateLabel: "Stima",
    status: { ahead: "Capacità in anticipo", on_track: "In linea", at_risk: "A rischio" },
    comparison: (used, elapsed) => `${used} usato dopo ${elapsed} della finestra`,
    lastsThroughReset: (time) => `Dovrebbe durare fino al ripristino di ${time}`,
    projectedExhaustion: (time) => `Potrebbe esaurirsi verso ${time}`,
  },
  ru: {
    settingLabel: "Оценка темпа квоты",
    settingDetail: "Показывает осторожную оценку для свежих процентных окон фиксированной длительности.",
    sectionLabel: "Темп квоты",
    estimateLabel: "Оценка",
    status: { ahead: "Запас опережает график", on_track: "По графику", at_risk: "Есть риск" },
    comparison: (used, elapsed) => `Использовано ${used} после ${elapsed} окна`,
    lastsThroughReset: (time) => `Ожидается запас до сброса ${time}`,
    projectedExhaustion: (time) => `Может закончиться около ${time}`,
  },
  ar: {
    settingLabel: "تقدير وتيرة الحصة",
    settingDetail: "يعرض تقديرًا متحفظًا للنوافذ المئوية الحديثة ذات المدة الثابتة.",
    sectionLabel: "وتيرة الحصة",
    estimateLabel: "تقدير",
    status: { ahead: "السعة متقدمة", on_track: "ضمن الوتيرة", at_risk: "معرّضة للخطر" },
    comparison: (used, elapsed) => `استُخدم ${used} بعد ${elapsed} من النافذة`,
    lastsThroughReset: (time) => `يُتوقع أن تكفي حتى إعادة التعيين في ${time}`,
    projectedExhaustion: (time) => `قد تنفد قرابة ${time}`,
  },
  hi: {
    settingLabel: "कोटा गति अनुमान",
    settingDetail: "ताज़ा, निश्चित अवधि वाली प्रतिशत विंडो के लिए सावधान अनुमान दिखाएँ।",
    sectionLabel: "कोटा गति",
    estimateLabel: "अनुमान",
    status: { ahead: "क्षमता समय से आगे", on_track: "सही गति", at_risk: "जोखिम में" },
    comparison: (used, elapsed) => `विंडो के ${elapsed} बाद ${used} उपयोग`,
    lastsThroughReset: (time) => `${time} रीसेट तक चलने की उम्मीद`,
    projectedExhaustion: (time) => `${time} के आसपास समाप्त हो सकता है`,
  },
  id: {
    settingLabel: "Perkiraan laju kuota",
    settingDetail: "Tampilkan perkiraan konservatif untuk jendela persentase terbaru berdurasi tetap.",
    sectionLabel: "Laju kuota",
    estimateLabel: "Perkiraan",
    status: { ahead: "Kapasitas lebih longgar", on_track: "Sesuai laju", at_risk: "Berisiko" },
    comparison: (used, elapsed) => `${used} terpakai setelah ${elapsed} jendela`,
    lastsThroughReset: (time) => `Diperkirakan cukup hingga reset ${time}`,
    projectedExhaustion: (time) => `Mungkin habis sekitar ${time}`,
  },
};

export function buildQuotaPaceLocalizedCopy(
  locale: ResolvedAppLocale,
): QuotaPaceLocalizedCopy {
  return QUOTA_PACE_COPY[locale] ?? QUOTA_PACE_COPY.en;
}

export function formatQuotaPaceDateTime(
  value: string,
  locale: ResolvedAppLocale,
): string {
  return new Intl.DateTimeFormat(APP_LOCALE_METADATA[locale].intlLocale, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
