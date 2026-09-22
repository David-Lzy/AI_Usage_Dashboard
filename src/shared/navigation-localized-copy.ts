import type { ResolvedAppLocale, RuntimeI18n } from "./i18n";

type NavigationLocalizedCopyText = {
  dismiss: string;
  carousel: {
    roleDescription: string;
    slideRoleDescription: string;
    previousProvider: string;
    nextProvider: string;
    slides: string;
    status: (current: string, total: string, itemLabel: string) => string;
    slideLabel: (current: string, total: string, itemLabel: string) => string;
    showSlide: (itemLabel: string) => string;
  };
};

export const NAVIGATION_LOCALIZED_COPY: Record<
  ResolvedAppLocale,
  NavigationLocalizedCopyText
> = {
  en: {
    dismiss: "Dismiss",
    carousel: {
      roleDescription: "carousel",
      slideRoleDescription: "slide",
      previousProvider: "Previous provider",
      nextProvider: "Next provider",
      slides: "Provider slides",
      status: (current, total, itemLabel) =>
        `Provider ${current} of ${total}: ${itemLabel}`,
      slideLabel: (current, total, itemLabel) =>
        `Slide ${current} of ${total}: ${itemLabel}`,
      showSlide: (itemLabel) => `Show ${itemLabel}`,
    },
  },
  "zh-CN": {
    dismiss: "关闭",
    carousel: {
      roleDescription: "轮播",
      slideRoleDescription: "幻灯片",
      previousProvider: "上一个 Provider",
      nextProvider: "下一个 Provider",
      slides: "Provider 幻灯片",
      status: (current, total, itemLabel) =>
        `Provider ${current}，共 ${total} 个：${itemLabel}`,
      slideLabel: (current, total, itemLabel) =>
        `第 ${current} 张，共 ${total} 张：${itemLabel}`,
      showSlide: (itemLabel) => `显示 ${itemLabel}`,
    },
  },
  "zh-TW": {
    dismiss: "關閉",
    carousel: {
      roleDescription: "輪播",
      slideRoleDescription: "投影片",
      previousProvider: "上一個 Provider",
      nextProvider: "下一個 Provider",
      slides: "Provider 投影片",
      status: (current, total, itemLabel) =>
        `Provider ${current}，共 ${total} 個：${itemLabel}`,
      slideLabel: (current, total, itemLabel) =>
        `第 ${current} 張，共 ${total} 張：${itemLabel}`,
      showSlide: (itemLabel) => `顯示 ${itemLabel}`,
    },
  },
  ja: {
    dismiss: "閉じる",
    carousel: {
      roleDescription: "カルーセル",
      slideRoleDescription: "スライド",
      previousProvider: "前の Provider",
      nextProvider: "次の Provider",
      slides: "Provider スライド",
      status: (current, total, itemLabel) =>
        `${total} 件中 ${current} 件目の Provider: ${itemLabel}`,
      slideLabel: (current, total, itemLabel) =>
        `${total} 枚中 ${current} 枚目のスライド: ${itemLabel}`,
      showSlide: (itemLabel) => `${itemLabel} を表示`,
    },
  },
  ko: {
    dismiss: "닫기",
    carousel: {
      roleDescription: "캐러셀",
      slideRoleDescription: "슬라이드",
      previousProvider: "이전 Provider",
      nextProvider: "다음 Provider",
      slides: "Provider 슬라이드",
      status: (current, total, itemLabel) =>
        `Provider ${total}개 중 ${current}번째: ${itemLabel}`,
      slideLabel: (current, total, itemLabel) =>
        `슬라이드 ${total}개 중 ${current}번째: ${itemLabel}`,
      showSlide: (itemLabel) => `${itemLabel} 표시`,
    },
  },
  "es-419": {
    dismiss: "Descartar",
    carousel: {
      roleDescription: "carrusel",
      slideRoleDescription: "diapositiva",
      previousProvider: "Provider anterior",
      nextProvider: "Siguiente Provider",
      slides: "Diapositivas de Provider",
      status: (current, total, itemLabel) =>
        `Provider ${current} de ${total}: ${itemLabel}`,
      slideLabel: (current, total, itemLabel) =>
        `Diapositiva ${current} de ${total}: ${itemLabel}`,
      showSlide: (itemLabel) => `Mostrar ${itemLabel}`,
    },
  },
  "pt-BR": {
    dismiss: "Fechar",
    carousel: {
      roleDescription: "carrossel",
      slideRoleDescription: "slide",
      previousProvider: "Provider anterior",
      nextProvider: "Próximo Provider",
      slides: "Slides de Provider",
      status: (current, total, itemLabel) =>
        `Provider ${current} de ${total}: ${itemLabel}`,
      slideLabel: (current, total, itemLabel) =>
        `Slide ${current} de ${total}: ${itemLabel}`,
      showSlide: (itemLabel) => `Mostrar ${itemLabel}`,
    },
  },
  fr: {
    dismiss: "Fermer",
    carousel: {
      roleDescription: "carrousel",
      slideRoleDescription: "diapositive",
      previousProvider: "Provider précédent",
      nextProvider: "Provider suivant",
      slides: "Diapositives de Provider",
      status: (current, total, itemLabel) =>
        `Provider ${current} sur ${total} : ${itemLabel}`,
      slideLabel: (current, total, itemLabel) =>
        `Diapositive ${current} sur ${total} : ${itemLabel}`,
      showSlide: (itemLabel) => `Afficher ${itemLabel}`,
    },
  },
  de: {
    dismiss: "Schließen",
    carousel: {
      roleDescription: "Karussell",
      slideRoleDescription: "Folie",
      previousProvider: "Vorheriger Provider",
      nextProvider: "Nächster Provider",
      slides: "Provider-Folien",
      status: (current, total, itemLabel) =>
        `Provider ${current} von ${total}: ${itemLabel}`,
      slideLabel: (current, total, itemLabel) =>
        `Folie ${current} von ${total}: ${itemLabel}`,
      showSlide: (itemLabel) => `${itemLabel} anzeigen`,
    },
  },
  it: {
    dismiss: "Chiudi",
    carousel: {
      roleDescription: "carosello",
      slideRoleDescription: "scheda",
      previousProvider: "Provider precedente",
      nextProvider: "Provider successivo",
      slides: "Schede Provider",
      status: (current, total, itemLabel) =>
        `Provider ${current} di ${total}: ${itemLabel}`,
      slideLabel: (current, total, itemLabel) =>
        `Scheda ${current} di ${total}: ${itemLabel}`,
      showSlide: (itemLabel) => `Mostra ${itemLabel}`,
    },
  },
  ru: {
    dismiss: "Закрыть",
    carousel: {
      roleDescription: "карусель",
      slideRoleDescription: "слайд",
      previousProvider: "Предыдущий Provider",
      nextProvider: "Следующий Provider",
      slides: "Слайды Provider",
      status: (current, total, itemLabel) =>
        `Provider ${current} из ${total}: ${itemLabel}`,
      slideLabel: (current, total, itemLabel) =>
        `Слайд ${current} из ${total}: ${itemLabel}`,
      showSlide: (itemLabel) => `Показать ${itemLabel}`,
    },
  },
  ar: {
    dismiss: "إغلاق",
    carousel: {
      roleDescription: "عرض دوار",
      slideRoleDescription: "شريحة",
      previousProvider: "Provider السابق",
      nextProvider: "Provider التالي",
      slides: "شرائح Provider",
      status: (current, total, itemLabel) =>
        `Provider ${current} من ${total}: ${itemLabel}`,
      slideLabel: (current, total, itemLabel) =>
        `الشريحة ${current} من ${total}: ${itemLabel}`,
      showSlide: (itemLabel) => `عرض ${itemLabel}`,
    },
  },
  hi: {
    dismiss: "बंद करें",
    carousel: {
      roleDescription: "कैरोसेल",
      slideRoleDescription: "स्लाइड",
      previousProvider: "पिछला Provider",
      nextProvider: "अगला Provider",
      slides: "Provider स्लाइड",
      status: (current, total, itemLabel) =>
        `Provider ${current}, ${total} में से: ${itemLabel}`,
      slideLabel: (current, total, itemLabel) =>
        `स्लाइड ${current}, ${total} में से: ${itemLabel}`,
      showSlide: (itemLabel) => `${itemLabel} दिखाएं`,
    },
  },
  id: {
    dismiss: "Tutup",
    carousel: {
      roleDescription: "korsel",
      slideRoleDescription: "slide",
      previousProvider: "Provider sebelumnya",
      nextProvider: "Provider berikutnya",
      slides: "Slide Provider",
      status: (current, total, itemLabel) =>
        `Provider ${current} dari ${total}: ${itemLabel}`,
      slideLabel: (current, total, itemLabel) =>
        `Slide ${current} dari ${total}: ${itemLabel}`,
      showSlide: (itemLabel) => `Tampilkan ${itemLabel}`,
    },
  },
};

export function buildNavigationLocalizedCopy(i18n: RuntimeI18n) {
  const copy = NAVIGATION_LOCALIZED_COPY[i18n.resolvedLocale];

  return {
    dismiss: copy.dismiss,
    carousel: {
      roleDescription: copy.carousel.roleDescription,
      slideRoleDescription: copy.carousel.slideRoleDescription,
      previousProvider: copy.carousel.previousProvider,
      nextProvider: copy.carousel.nextProvider,
      slides: copy.carousel.slides,
      status: (current: number, total: number, itemLabel: string) =>
        copy.carousel.status(
          i18n.formatNumber(current),
          i18n.formatNumber(total),
          itemLabel,
        ),
      slideLabel: (current: number, total: number, itemLabel: string) =>
        copy.carousel.slideLabel(
          i18n.formatNumber(current),
          i18n.formatNumber(total),
          itemLabel,
        ),
      showSlide: copy.carousel.showSlide,
    },
  } as const;
}
