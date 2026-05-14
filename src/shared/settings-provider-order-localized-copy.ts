import type { DisplaySurface } from "../providers/types";
import type { ResolvedAppLocale, RuntimeI18n } from "./i18n";

type SettingsProviderOrderCopyText = {
  sectionLabel: string;
  title: string;
  detail: string;
  surfaceLabels: Record<DisplaySurface, string>;
  providerCount: (countLabel: string) => string;
  rowAria: (
    providerLabel: string,
    indexLabel: string,
    totalLabel: string,
    surfaceLabel: string,
  ) => string;
  moveUpAction: (providerLabel: string, surfaceLabel: string) => string;
  moveDownAction: (providerLabel: string, surfaceLabel: string) => string;
  up: string;
  down: string;
};

export const SETTINGS_PROVIDER_ORDER_COPY: Record<
  ResolvedAppLocale,
  SettingsProviderOrderCopyText
> = {
  en: {
    sectionLabel: "Provider order",
    title: "Choose the order per surface",
    detail:
      "Drag providers, use the move buttons, or focus a row and press ArrowUp or ArrowDown. Each surface keeps its own order.",
    surfaceLabels: {
      popup: "Popup",
      sidebar: "Sidebar",
      fullPage: "Full-page tab",
    },
    providerCount: (countLabel) => `${countLabel} providers`,
    rowAria: (providerLabel, indexLabel, totalLabel, surfaceLabel) =>
      `${providerLabel}, ${indexLabel} of ${totalLabel} on ${surfaceLabel}`,
    moveUpAction: (providerLabel, surfaceLabel) =>
      `Move ${providerLabel} up on ${surfaceLabel}`,
    moveDownAction: (providerLabel, surfaceLabel) =>
      `Move ${providerLabel} down on ${surfaceLabel}`,
    up: "Up",
    down: "Down",
  },
  "zh-CN": {
    sectionLabel: "Provider 顺序",
    title: "按界面选择显示顺序",
    detail:
      "可以拖拽 Provider、使用移动按钮，或聚焦某一行后按 ArrowUp / ArrowDown。每个界面会保留自己的顺序。",
    surfaceLabels: {
      popup: "Popup",
      sidebar: "Sidebar",
      fullPage: "完整页面标签页",
    },
    providerCount: (countLabel) => `${countLabel} 个 Provider`,
    rowAria: (providerLabel, indexLabel, totalLabel, surfaceLabel) =>
      `${providerLabel}，${surfaceLabel} 上第 ${indexLabel} 项，共 ${totalLabel} 项`,
    moveUpAction: (providerLabel, surfaceLabel) =>
      `在 ${surfaceLabel} 上将 ${providerLabel} 上移`,
    moveDownAction: (providerLabel, surfaceLabel) =>
      `在 ${surfaceLabel} 上将 ${providerLabel} 下移`,
    up: "上移",
    down: "下移",
  },
  "zh-TW": {
    sectionLabel: "Provider 順序",
    title: "依介面選擇顯示順序",
    detail:
      "可拖曳 Provider、使用移動按鈕，或聚焦某列後按 ArrowUp / ArrowDown。每個介面會保留自己的順序。",
    surfaceLabels: {
      popup: "Popup",
      sidebar: "Sidebar",
      fullPage: "完整頁面分頁",
    },
    providerCount: (countLabel) => `${countLabel} 個 Provider`,
    rowAria: (providerLabel, indexLabel, totalLabel, surfaceLabel) =>
      `${providerLabel}，${surfaceLabel} 上第 ${indexLabel} 項，共 ${totalLabel} 項`,
    moveUpAction: (providerLabel, surfaceLabel) =>
      `在 ${surfaceLabel} 上將 ${providerLabel} 上移`,
    moveDownAction: (providerLabel, surfaceLabel) =>
      `在 ${surfaceLabel} 上將 ${providerLabel} 下移`,
    up: "上移",
    down: "下移",
  },
  ja: {
    sectionLabel: "Provider の順序",
    title: "サーフェスごとに順序を選択",
    detail:
      "Provider をドラッグするか、移動ボタンを使うか、行にフォーカスして ArrowUp / ArrowDown を押します。各サーフェスは独自の順序を保持します。",
    surfaceLabels: {
      popup: "ポップアップ",
      sidebar: "サイドバー",
      fullPage: "全画面タブ",
    },
    providerCount: (countLabel) => `${countLabel} 件の Provider`,
    rowAria: (providerLabel, indexLabel, totalLabel, surfaceLabel) =>
      `${providerLabel}、${surfaceLabel} の ${indexLabel}/${totalLabel}`,
    moveUpAction: (providerLabel, surfaceLabel) =>
      `${surfaceLabel} の ${providerLabel} を上へ移動`,
    moveDownAction: (providerLabel, surfaceLabel) =>
      `${surfaceLabel} の ${providerLabel} を下へ移動`,
    up: "上へ",
    down: "下へ",
  },
  ko: {
    sectionLabel: "Provider 순서",
    title: "표면별 순서 선택",
    detail:
      "Provider를 드래그하거나 이동 버튼을 사용하거나 행에 포커스한 뒤 ArrowUp / ArrowDown을 누릅니다. 각 표면은 별도 순서를 유지합니다.",
    surfaceLabels: {
      popup: "팝업",
      sidebar: "사이드바",
      fullPage: "전체 페이지 탭",
    },
    providerCount: (countLabel) => `${countLabel}개 Provider`,
    rowAria: (providerLabel, indexLabel, totalLabel, surfaceLabel) =>
      `${providerLabel}, ${surfaceLabel}에서 ${totalLabel}개 중 ${indexLabel}번째`,
    moveUpAction: (providerLabel, surfaceLabel) =>
      `${surfaceLabel}에서 ${providerLabel} 위로 이동`,
    moveDownAction: (providerLabel, surfaceLabel) =>
      `${surfaceLabel}에서 ${providerLabel} 아래로 이동`,
    up: "위로",
    down: "아래로",
  },
  "es-419": {
    sectionLabel: "Orden de providers",
    title: "Elige el orden por superficie",
    detail:
      "Arrastra providers, usa los botones de mover o enfoca una fila y presiona ArrowUp o ArrowDown. Cada superficie conserva su propio orden.",
    surfaceLabels: {
      popup: "Popup",
      sidebar: "Sidebar",
      fullPage: "Pestaña de página completa",
    },
    providerCount: (countLabel) => `${countLabel} providers`,
    rowAria: (providerLabel, indexLabel, totalLabel, surfaceLabel) =>
      `${providerLabel}, ${indexLabel} de ${totalLabel} en ${surfaceLabel}`,
    moveUpAction: (providerLabel, surfaceLabel) =>
      `Mover ${providerLabel} hacia arriba en ${surfaceLabel}`,
    moveDownAction: (providerLabel, surfaceLabel) =>
      `Mover ${providerLabel} hacia abajo en ${surfaceLabel}`,
    up: "Subir",
    down: "Bajar",
  },
  "pt-BR": {
    sectionLabel: "Ordem dos providers",
    title: "Escolha a ordem por superfície",
    detail:
      "Arraste providers, use os botões de mover ou foque uma linha e pressione ArrowUp ou ArrowDown. Cada superfície mantém sua própria ordem.",
    surfaceLabels: {
      popup: "Popup",
      sidebar: "Sidebar",
      fullPage: "Aba de página completa",
    },
    providerCount: (countLabel) => `${countLabel} providers`,
    rowAria: (providerLabel, indexLabel, totalLabel, surfaceLabel) =>
      `${providerLabel}, ${indexLabel} de ${totalLabel} em ${surfaceLabel}`,
    moveUpAction: (providerLabel, surfaceLabel) =>
      `Mover ${providerLabel} para cima em ${surfaceLabel}`,
    moveDownAction: (providerLabel, surfaceLabel) =>
      `Mover ${providerLabel} para baixo em ${surfaceLabel}`,
    up: "Subir",
    down: "Descer",
  },
  fr: {
    sectionLabel: "Ordre des providers",
    title: "Choisir l'ordre par surface",
    detail:
      "Faites glisser les providers, utilisez les boutons de déplacement ou focalisez une ligne puis appuyez sur ArrowUp ou ArrowDown. Chaque surface conserve son propre ordre.",
    surfaceLabels: {
      popup: "Popup",
      sidebar: "Barre laterale",
      fullPage: "Onglet pleine page",
    },
    providerCount: (countLabel) => `${countLabel} providers`,
    rowAria: (providerLabel, indexLabel, totalLabel, surfaceLabel) =>
      `${providerLabel}, ${indexLabel} sur ${totalLabel} dans ${surfaceLabel}`,
    moveUpAction: (providerLabel, surfaceLabel) =>
      `Deplacer ${providerLabel} vers le haut dans ${surfaceLabel}`,
    moveDownAction: (providerLabel, surfaceLabel) =>
      `Deplacer ${providerLabel} vers le bas dans ${surfaceLabel}`,
    up: "Monter",
    down: "Descendre",
  },
  de: {
    sectionLabel: "Provider-Reihenfolge",
    title: "Reihenfolge pro Oberflaeche waehlen",
    detail:
      "Ziehe Provider, nutze die Verschieben-Schaltflaechen oder fokussiere eine Zeile und druecke ArrowUp oder ArrowDown. Jede Oberflaeche behaelt ihre eigene Reihenfolge.",
    surfaceLabels: {
      popup: "Popup",
      sidebar: "Sidebar",
      fullPage: "Vollseiten-Tab",
    },
    providerCount: (countLabel) => `${countLabel} Provider`,
    rowAria: (providerLabel, indexLabel, totalLabel, surfaceLabel) =>
      `${providerLabel}, ${indexLabel} von ${totalLabel} auf ${surfaceLabel}`,
    moveUpAction: (providerLabel, surfaceLabel) =>
      `${providerLabel} auf ${surfaceLabel} nach oben verschieben`,
    moveDownAction: (providerLabel, surfaceLabel) =>
      `${providerLabel} auf ${surfaceLabel} nach unten verschieben`,
    up: "Nach oben",
    down: "Nach unten",
  },
  it: {
    sectionLabel: "Ordine dei provider",
    title: "Scegli l'ordine per superficie",
    detail:
      "Trascina i provider, usa i pulsanti di spostamento oppure metti a fuoco una riga e premi ArrowUp o ArrowDown. Ogni superficie mantiene il proprio ordine.",
    surfaceLabels: {
      popup: "Popup",
      sidebar: "Sidebar",
      fullPage: "Scheda a pagina intera",
    },
    providerCount: (countLabel) => `${countLabel} provider`,
    rowAria: (providerLabel, indexLabel, totalLabel, surfaceLabel) =>
      `${providerLabel}, ${indexLabel} di ${totalLabel} su ${surfaceLabel}`,
    moveUpAction: (providerLabel, surfaceLabel) =>
      `Sposta ${providerLabel} in alto su ${surfaceLabel}`,
    moveDownAction: (providerLabel, surfaceLabel) =>
      `Sposta ${providerLabel} in basso su ${surfaceLabel}`,
    up: "Su",
    down: "Giu",
  },
  ru: {
    sectionLabel: "Порядок Provider",
    title: "Выберите порядок для каждой поверхности",
    detail:
      "Перетаскивайте Provider, используйте кнопки перемещения или сфокусируйте строку и нажмите ArrowUp либо ArrowDown. У каждой поверхности свой порядок.",
    surfaceLabels: {
      popup: "Popup",
      sidebar: "Sidebar",
      fullPage: "Полноэкранная вкладка",
    },
    providerCount: (countLabel) => `${countLabel} Provider`,
    rowAria: (providerLabel, indexLabel, totalLabel, surfaceLabel) =>
      `${providerLabel}, ${indexLabel} из ${totalLabel} на ${surfaceLabel}`,
    moveUpAction: (providerLabel, surfaceLabel) =>
      `Переместить ${providerLabel} вверх на ${surfaceLabel}`,
    moveDownAction: (providerLabel, surfaceLabel) =>
      `Переместить ${providerLabel} вниз на ${surfaceLabel}`,
    up: "Вверх",
    down: "Вниз",
  },
  ar: {
    sectionLabel: "ترتيب Provider",
    title: "اختر الترتيب لكل سطح",
    detail:
      "اسحب Provider، أو استخدم أزرار النقل، أو ركز صفا واضغط ArrowUp أو ArrowDown. يحتفظ كل سطح بترتيبه الخاص.",
    surfaceLabels: {
      popup: "Popup",
      sidebar: "Sidebar",
      fullPage: "علامة تبويب صفحة كاملة",
    },
    providerCount: (countLabel) => `${countLabel} Provider`,
    rowAria: (providerLabel, indexLabel, totalLabel, surfaceLabel) =>
      `${providerLabel}، ${indexLabel} من ${totalLabel} على ${surfaceLabel}`,
    moveUpAction: (providerLabel, surfaceLabel) =>
      `نقل ${providerLabel} إلى أعلى على ${surfaceLabel}`,
    moveDownAction: (providerLabel, surfaceLabel) =>
      `نقل ${providerLabel} إلى أسفل على ${surfaceLabel}`,
    up: "أعلى",
    down: "أسفل",
  },
  hi: {
    sectionLabel: "Provider क्रम",
    title: "हर सतह के लिए क्रम चुनें",
    detail:
      "Provider को खींचें, move buttons इस्तेमाल करें, या किसी पंक्ति पर focus करके ArrowUp या ArrowDown दबाएं। हर सतह अपना क्रम रखती है।",
    surfaceLabels: {
      popup: "पॉपअप",
      sidebar: "साइडबार",
      fullPage: "पूर्ण-पृष्ठ टैब",
    },
    providerCount: (countLabel) => `${countLabel} Provider`,
    rowAria: (providerLabel, indexLabel, totalLabel, surfaceLabel) =>
      `${providerLabel}, ${surfaceLabel} पर ${totalLabel} में ${indexLabel}`,
    moveUpAction: (providerLabel, surfaceLabel) =>
      `${surfaceLabel} पर ${providerLabel} को ऊपर ले जाएं`,
    moveDownAction: (providerLabel, surfaceLabel) =>
      `${surfaceLabel} पर ${providerLabel} को नीचे ले जाएं`,
    up: "ऊपर",
    down: "नीचे",
  },
  id: {
    sectionLabel: "Urutan provider",
    title: "Pilih urutan per surface",
    detail:
      "Seret provider, gunakan tombol pindah, atau fokuskan satu baris lalu tekan ArrowUp atau ArrowDown. Setiap surface menyimpan urutannya sendiri.",
    surfaceLabels: {
      popup: "Popup",
      sidebar: "Sidebar",
      fullPage: "Tab halaman penuh",
    },
    providerCount: (countLabel) => `${countLabel} provider`,
    rowAria: (providerLabel, indexLabel, totalLabel, surfaceLabel) =>
      `${providerLabel}, ${indexLabel} dari ${totalLabel} di ${surfaceLabel}`,
    moveUpAction: (providerLabel, surfaceLabel) =>
      `Pindahkan ${providerLabel} ke atas di ${surfaceLabel}`,
    moveDownAction: (providerLabel, surfaceLabel) =>
      `Pindahkan ${providerLabel} ke bawah di ${surfaceLabel}`,
    up: "Naik",
    down: "Turun",
  },
};

export function getSettingsProviderOrderCopy(locale: ResolvedAppLocale) {
  return SETTINGS_PROVIDER_ORDER_COPY[locale];
}

export function buildLocalizedSettingsProviderOrderSection(
  i18n: RuntimeI18n,
  copy: SettingsProviderOrderCopyText,
) {
  return {
    sectionLabel: copy.sectionLabel,
    title: copy.title,
    detail: copy.detail,
    surfaceLabels: copy.surfaceLabels,
    providerCount: (count: number) => copy.providerCount(i18n.formatNumber(count)),
    rowAria: (
      providerLabel: string,
      index: number,
      total: number,
      surfaceLabel: string,
    ) =>
      copy.rowAria(
        providerLabel,
        i18n.formatNumber(index),
        i18n.formatNumber(total),
        surfaceLabel,
      ),
    moveUpAction: copy.moveUpAction,
    moveDownAction: copy.moveDownAction,
    up: copy.up,
    down: copy.down,
  } as const;
}
