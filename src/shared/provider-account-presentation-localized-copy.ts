import type { ResolvedAppLocale } from "./i18n";

export type ProviderAccountPresentationLocalizedCopy = {
  label: string;
  detail: string;
  select: string;
  cycle: string;
  cards: string;
  nextDeployment: string;
};

const COPY: Record<ResolvedAppLocale, ProviderAccountPresentationLocalizedCopy> = {
  en: {
    label: "Popup deployment layout",
    detail: "Choose how multiple deployments of this provider appear in the popup.",
    select: "Dropdown",
    cycle: "Next button",
    cards: "Separate cards",
    nextDeployment: "Show next deployment",
  },
  "zh-CN": {
    label: "Popup 部署显示",
    detail: "选择同一 Provider 的多个部署在 Popup 中如何显示。",
    select: "下拉选择",
    cycle: "按钮轮换",
    cards: "独立卡片",
    nextDeployment: "显示下一个部署",
  },
  "zh-TW": {
    label: "Popup 部署顯示",
    detail: "選擇同一 Provider 的多個部署在 Popup 中如何顯示。",
    select: "下拉選擇",
    cycle: "按鈕輪換",
    cards: "獨立卡片",
    nextDeployment: "顯示下一個部署",
  },
  ja: {
    label: "Popup のデプロイ表示",
    detail: "同じ Provider の複数デプロイを Popup に表示する方法を選びます。",
    select: "ドロップダウン",
    cycle: "次へボタン",
    cards: "個別カード",
    nextDeployment: "次のデプロイを表示",
  },
  ko: {
    label: "Popup 배포 표시",
    detail: "같은 Provider의 여러 배포를 Popup에 표시하는 방식을 선택합니다.",
    select: "드롭다운",
    cycle: "다음 버튼",
    cards: "개별 카드",
    nextDeployment: "다음 배포 표시",
  },
  "es-419": {
    label: "Diseño de implementaciones en Popup",
    detail: "Elige cómo aparecen varias implementaciones del proveedor en el Popup.",
    select: "Lista",
    cycle: "Botón siguiente",
    cards: "Tarjetas separadas",
    nextDeployment: "Mostrar la siguiente implementación",
  },
  "pt-BR": {
    label: "Layout de implantações no Popup",
    detail: "Escolha como várias implantações do provedor aparecem no Popup.",
    select: "Lista",
    cycle: "Botão próximo",
    cards: "Cards separados",
    nextDeployment: "Mostrar próxima implantação",
  },
  fr: {
    label: "Affichage des déploiements dans le Popup",
    detail: "Choisissez comment afficher plusieurs déploiements du fournisseur dans le Popup.",
    select: "Liste",
    cycle: "Bouton suivant",
    cards: "Cartes séparées",
    nextDeployment: "Afficher le déploiement suivant",
  },
  de: {
    label: "Bereitstellungen im Popup",
    detail: "Legt fest, wie mehrere Bereitstellungen dieses Providers im Popup erscheinen.",
    select: "Auswahlliste",
    cycle: "Weiter-Schaltfläche",
    cards: "Separate Karten",
    nextDeployment: "Nächste Bereitstellung anzeigen",
  },
  it: {
    label: "Layout distribuzioni nel Popup",
    detail: "Scegli come mostrare più distribuzioni del provider nel Popup.",
    select: "Elenco",
    cycle: "Pulsante successivo",
    cards: "Schede separate",
    nextDeployment: "Mostra la distribuzione successiva",
  },
  ru: {
    label: "Размещение подключений в Popup",
    detail: "Выберите, как несколько подключений Provider отображаются в Popup.",
    select: "Список",
    cycle: "Кнопка далее",
    cards: "Отдельные карточки",
    nextDeployment: "Показать следующее подключение",
  },
  ar: {
    label: "عرض عمليات النشر في Popup",
    detail: "اختر كيفية عرض عمليات نشر متعددة لموفر واحد في Popup.",
    select: "قائمة منسدلة",
    cycle: "زر التالي",
    cards: "بطاقات منفصلة",
    nextDeployment: "عرض عملية النشر التالية",
  },
  hi: {
    label: "Popup परिनियोजन लेआउट",
    detail: "चुनें कि एक Provider के कई परिनियोजन Popup में कैसे दिखें।",
    select: "ड्रॉपडाउन",
    cycle: "अगला बटन",
    cards: "अलग कार्ड",
    nextDeployment: "अगला परिनियोजन दिखाएं",
  },
  id: {
    label: "Tata letak deployment Popup",
    detail: "Pilih cara beberapa deployment Provider ditampilkan di Popup.",
    select: "Dropdown",
    cycle: "Tombol berikutnya",
    cards: "Kartu terpisah",
    nextDeployment: "Tampilkan deployment berikutnya",
  },
};

export function getProviderAccountPresentationLocalizedCopy(
  locale: ResolvedAppLocale,
): ProviderAccountPresentationLocalizedCopy {
  return COPY[locale];
}
