import type { ResolvedAppLocale, RuntimeI18n } from "../shared/i18n";

type PopupHideProviderFeedbackCopyText = {
  undoAction: string;
  settingsAction: string;
  undoMessage: (providerLabel: string, secondsLabel: string) => string;
  noticeMessage: (providerLabel: string) => string;
};

const POPUP_HIDE_PROVIDER_FEEDBACK_COPY: Record<
  ResolvedAppLocale,
  PopupHideProviderFeedbackCopyText
> = {
  en: {
    undoAction: "Undo",
    settingsAction: "Settings",
    undoMessage: (providerLabel, secondsLabel) =>
      `${providerLabel} hidden · ${secondsLabel}s`,
    noticeMessage: (providerLabel) =>
      `${providerLabel} can be shown again from Settings.`,
  },
  "zh-CN": {
    undoAction: "撤销",
    settingsAction: "设置",
    undoMessage: (providerLabel, secondsLabel) =>
      `已隐藏 ${providerLabel} · ${secondsLabel}秒`,
    noticeMessage: (providerLabel) =>
      `${providerLabel} 可在设置里重新勾选“显示到仪表板”。`,
  },
  "zh-TW": {
    undoAction: "復原",
    settingsAction: "設定",
    undoMessage: (providerLabel, secondsLabel) =>
      `已隱藏 ${providerLabel} · ${secondsLabel}秒`,
    noticeMessage: (providerLabel) =>
      `${providerLabel} 可在設定中重新勾選「顯示到儀表板」。`,
  },
  ja: {
    undoAction: "元に戻す",
    settingsAction: "設定",
    undoMessage: (providerLabel, secondsLabel) =>
      `${providerLabel} を非表示 · ${secondsLabel}秒`,
    noticeMessage: (providerLabel) =>
      `${providerLabel} は Settings で再表示できます。`,
  },
  ko: {
    undoAction: "실행 취소",
    settingsAction: "설정",
    undoMessage: (providerLabel, secondsLabel) =>
      `${providerLabel} 숨김 · ${secondsLabel}초`,
    noticeMessage: (providerLabel) =>
      `${providerLabel}는 Settings에서 다시 표시할 수 있습니다.`,
  },
  "es-419": {
    undoAction: "Deshacer",
    settingsAction: "Settings",
    undoMessage: (providerLabel, secondsLabel) =>
      `${providerLabel} oculto · ${secondsLabel}s`,
    noticeMessage: (providerLabel) =>
      `${providerLabel} se puede volver a mostrar desde Settings.`,
  },
  "pt-BR": {
    undoAction: "Desfazer",
    settingsAction: "Settings",
    undoMessage: (providerLabel, secondsLabel) =>
      `${providerLabel} oculto · ${secondsLabel}s`,
    noticeMessage: (providerLabel) =>
      `${providerLabel} pode ser mostrado de novo em Settings.`,
  },
  fr: {
    undoAction: "Annuler",
    settingsAction: "Settings",
    undoMessage: (providerLabel, secondsLabel) =>
      `${providerLabel} masqué · ${secondsLabel}s`,
    noticeMessage: (providerLabel) =>
      `${providerLabel} peut être réaffiché depuis Settings.`,
  },
  de: {
    undoAction: "Rückgängig",
    settingsAction: "Settings",
    undoMessage: (providerLabel, secondsLabel) =>
      `${providerLabel} ausgeblendet · ${secondsLabel}s`,
    noticeMessage: (providerLabel) =>
      `${providerLabel} kann in Settings wieder angezeigt werden.`,
  },
  it: {
    undoAction: "Annulla",
    settingsAction: "Settings",
    undoMessage: (providerLabel, secondsLabel) =>
      `${providerLabel} nascosto · ${secondsLabel}s`,
    noticeMessage: (providerLabel) =>
      `${providerLabel} può essere mostrato di nuovo da Settings.`,
  },
  ru: {
    undoAction: "Отменить",
    settingsAction: "Settings",
    undoMessage: (providerLabel, secondsLabel) =>
      `${providerLabel} скрыт · ${secondsLabel}с`,
    noticeMessage: (providerLabel) =>
      `${providerLabel} можно снова показать в Settings.`,
  },
  ar: {
    undoAction: "تراجع",
    settingsAction: "Settings",
    undoMessage: (providerLabel, secondsLabel) =>
      `تم إخفاء ${providerLabel} · ${secondsLabel}ث`,
    noticeMessage: (providerLabel) =>
      `يمكن إظهار ${providerLabel} مرة أخرى من Settings.`,
  },
  hi: {
    undoAction: "Undo",
    settingsAction: "Settings",
    undoMessage: (providerLabel, secondsLabel) =>
      `${providerLabel} hidden · ${secondsLabel}s`,
    noticeMessage: (providerLabel) =>
      `${providerLabel} को Settings से फिर दिखाया जा सकता है।`,
  },
  id: {
    undoAction: "Urungkan",
    settingsAction: "Settings",
    undoMessage: (providerLabel, secondsLabel) =>
      `${providerLabel} disembunyikan · ${secondsLabel}d`,
    noticeMessage: (providerLabel) =>
      `${providerLabel} dapat ditampilkan lagi dari Settings.`,
  },
};

export function buildPopupHideProviderFeedbackCopy(i18n: RuntimeI18n) {
  const copy = POPUP_HIDE_PROVIDER_FEEDBACK_COPY[i18n.resolvedLocale];

  return {
    ...copy,
    formatSeconds: (seconds: number) => i18n.formatNumber(seconds),
  };
}

export type PopupHideProviderFeedbackCopy = ReturnType<
  typeof buildPopupHideProviderFeedbackCopy
>;
