import type { DisplaySurface } from "../providers/types";
import type { ResolvedAppLocale, RuntimeI18n } from "./i18n";
import type {
  ProviderProgressItemAvailability,
  ProviderProgressItemKind,
} from "./provider-progress-items";

type SettingsProgressItemsCopyText = {
  sectionLabel: string;
  title: string;
  detail: string;
  provider: {
    count: (countLabel: string) => string;
    emptyDetail: string;
    emptyBody: string;
  };
  surfaceLabels: Record<DisplaySurface, string>;
  visibleCount: (visibleLabel: string, totalLabel: string) => string;
  kindLabels: Record<ProviderProgressItemKind, string>;
  availabilityLabels: Record<ProviderProgressItemAvailability, string>;
  shown: string;
  hidden: string;
  visibilityAction: (
    nextAction: "hide" | "show",
    itemLabel: string,
    surfaceLabel: string,
  ) => string;
  rowAria: (
    itemLabel: string,
    indexLabel: string,
    totalLabel: string,
    surfaceLabel: string,
  ) => string;
  moveUpAction: (itemLabel: string, surfaceLabel: string) => string;
  moveDownAction: (itemLabel: string, surfaceLabel: string) => string;
  up: string;
  down: string;
  allHidden: string;
};

export const SETTINGS_PROGRESS_ITEMS_COPY: Record<
  ResolvedAppLocale,
  SettingsProgressItemsCopyText
> = {
  en: {
    sectionLabel: "Quota items",
    title: "Choose visible progress per surface",
    detail:
      "Hide, show, and reorder quota progress items independently for popup, sidebar, and full-page tab. Usage facts and raw diagnostics stay out of this progress list.",
    provider: {
      count: (countLabel) => `${countLabel} configurable quota items`,
      emptyDetail: "No configurable quota progress items yet",
      emptyBody:
        "This provider currently exposes facts, policy text, or raw evidence rather than renderable progress items.",
    },
    surfaceLabels: {
      popup: "Popup",
      sidebar: "Sidebar",
      fullPage: "Full-page tab",
    },
    visibleCount: (visibleLabel, totalLabel) =>
      `${visibleLabel}/${totalLabel} shown`,
    kindLabels: {
      primary_quota: "Primary quota",
      usage_window: "Usage window",
      usage_balance: "Balance",
    },
    availabilityLabels: {
      progress: "Progress",
      value_only: "Value only",
      unavailable: "Unavailable",
    },
    shown: "Shown",
    hidden: "Hidden",
    visibilityAction: (nextAction, itemLabel, surfaceLabel) =>
      `${nextAction === "hide" ? "Hide" : "Show"} ${itemLabel} on ${surfaceLabel}`,
    rowAria: (itemLabel, indexLabel, totalLabel, surfaceLabel) =>
      `${itemLabel}, ${indexLabel} of ${totalLabel} on ${surfaceLabel}`,
    moveUpAction: (itemLabel, surfaceLabel) =>
      `Move ${itemLabel} up on ${surfaceLabel}`,
    moveDownAction: (itemLabel, surfaceLabel) =>
      `Move ${itemLabel} down on ${surfaceLabel}`,
    up: "Up",
    down: "Down",
    allHidden:
      "All progress items are hidden on this surface; later rendering can fall back to provider metadata instead of an empty card.",
  },
  "zh-CN": {
    sectionLabel: "额度项",
    title: "按界面选择可见进度",
    detail:
      "可以分别为 popup、sidebar 和完整页面标签页隐藏、显示并排序额度进度项。使用事实和原始诊断不会进入这个进度列表。",
    provider: {
      count: (countLabel) => `${countLabel} 个可配置额度项`,
      emptyDetail: "暂时没有可配置的额度进度项",
      emptyBody:
        "这个 Provider 目前只暴露事实、策略文本或原始证据，而不是可渲染的进度项。",
    },
    surfaceLabels: {
      popup: "Popup",
      sidebar: "Sidebar",
      fullPage: "完整页面标签页",
    },
    visibleCount: (visibleLabel, totalLabel) =>
      `${visibleLabel}/${totalLabel} 已显示`,
    kindLabels: {
      primary_quota: "主要额度",
      usage_window: "使用窗口",
      usage_balance: "余额",
    },
    availabilityLabels: {
      progress: "进度",
      value_only: "仅数值",
      unavailable: "不可用",
    },
    shown: "已显示",
    hidden: "已隐藏",
    visibilityAction: (nextAction, itemLabel, surfaceLabel) =>
      `${nextAction === "hide" ? "隐藏" : "显示"} ${surfaceLabel} 上的 ${itemLabel}`,
    rowAria: (itemLabel, indexLabel, totalLabel, surfaceLabel) =>
      `${itemLabel}，${surfaceLabel} 上第 ${indexLabel} 项，共 ${totalLabel} 项`,
    moveUpAction: (itemLabel, surfaceLabel) =>
      `在 ${surfaceLabel} 上将 ${itemLabel} 上移`,
    moveDownAction: (itemLabel, surfaceLabel) =>
      `在 ${surfaceLabel} 上将 ${itemLabel} 下移`,
    up: "上移",
    down: "下移",
    allHidden:
      "这个界面上的所有进度项都已隐藏；后续渲染会回退到 Provider 元数据，而不是留下空卡片。",
  },
  "zh-TW": {
    sectionLabel: "額度項目",
    title: "依介面選擇可見進度",
    detail:
      "可分別為 popup、sidebar 和完整頁面分頁隱藏、顯示並排序額度進度項目。使用事實與原始診斷不會進入此進度清單。",
    provider: {
      count: (countLabel) => `${countLabel} 個可設定額度項目`,
      emptyDetail: "尚無可設定的額度進度項目",
      emptyBody:
        "此 Provider 目前只提供事實、策略文字或原始證據，而非可繪製的進度項目。",
    },
    surfaceLabels: {
      popup: "Popup",
      sidebar: "Sidebar",
      fullPage: "完整頁面分頁",
    },
    visibleCount: (visibleLabel, totalLabel) =>
      `${visibleLabel}/${totalLabel} 已顯示`,
    kindLabels: {
      primary_quota: "主要額度",
      usage_window: "使用視窗",
      usage_balance: "餘額",
    },
    availabilityLabels: {
      progress: "進度",
      value_only: "僅數值",
      unavailable: "不可用",
    },
    shown: "已顯示",
    hidden: "已隱藏",
    visibilityAction: (nextAction, itemLabel, surfaceLabel) =>
      `${nextAction === "hide" ? "隱藏" : "顯示"} ${surfaceLabel} 上的 ${itemLabel}`,
    rowAria: (itemLabel, indexLabel, totalLabel, surfaceLabel) =>
      `${itemLabel}，${surfaceLabel} 上第 ${indexLabel} 項，共 ${totalLabel} 項`,
    moveUpAction: (itemLabel, surfaceLabel) =>
      `在 ${surfaceLabel} 上將 ${itemLabel} 上移`,
    moveDownAction: (itemLabel, surfaceLabel) =>
      `在 ${surfaceLabel} 上將 ${itemLabel} 下移`,
    up: "上移",
    down: "下移",
    allHidden:
      "此介面上的所有進度項目都已隱藏；後續渲染會回退到 Provider 中繼資料，而不是空卡片。",
  },
  ja: {
    sectionLabel: "クォータ項目",
    title: "サーフェスごとに表示する進捗を選択",
    detail:
      "popup、sidebar、full-page tab ごとにクォータ進捗項目を非表示、表示、並べ替えできます。使用状況の事実と生の診断はこの進捗リストに入れません。",
    provider: {
      count: (countLabel) => `${countLabel} 件の設定可能なクォータ項目`,
      emptyDetail: "設定可能なクォータ進捗項目はまだありません",
      emptyBody:
        "この Provider は現在、描画可能な進捗項目ではなく、事実、ポリシー文、または生の証拠を公開しています。",
    },
    surfaceLabels: {
      popup: "ポップアップ",
      sidebar: "サイドバー",
      fullPage: "全画面タブ",
    },
    visibleCount: (visibleLabel, totalLabel) =>
      `${visibleLabel}/${totalLabel} 表示中`,
    kindLabels: {
      primary_quota: "主要クォータ",
      usage_window: "使用ウィンドウ",
      usage_balance: "残高",
    },
    availabilityLabels: {
      progress: "進捗",
      value_only: "値のみ",
      unavailable: "利用不可",
    },
    shown: "表示中",
    hidden: "非表示",
    visibilityAction: (nextAction, itemLabel, surfaceLabel) =>
      `${surfaceLabel} の ${itemLabel} を${nextAction === "hide" ? "非表示" : "表示"}`,
    rowAria: (itemLabel, indexLabel, totalLabel, surfaceLabel) =>
      `${itemLabel}、${surfaceLabel} の ${indexLabel}/${totalLabel}`,
    moveUpAction: (itemLabel, surfaceLabel) =>
      `${surfaceLabel} の ${itemLabel} を上へ移動`,
    moveDownAction: (itemLabel, surfaceLabel) =>
      `${surfaceLabel} の ${itemLabel} を下へ移動`,
    up: "上へ",
    down: "下へ",
    allHidden:
      "このサーフェスではすべての進捗項目が非表示です。後続の描画は空カードではなく Provider メタデータへフォールバックできます。",
  },
  ko: {
    sectionLabel: "할당량 항목",
    title: "표면별로 표시할 진행률 선택",
    detail:
      "popup, sidebar, full-page tab 별로 할당량 진행 항목을 숨기고 표시하고 순서를 바꿀 수 있습니다. 사용 사실과 원시 진단은 이 진행 목록에 포함하지 않습니다.",
    provider: {
      count: (countLabel) => `${countLabel}개의 구성 가능한 할당량 항목`,
      emptyDetail: "아직 구성 가능한 할당량 진행 항목이 없습니다",
      emptyBody:
        "이 Provider는 현재 렌더링 가능한 진행 항목이 아니라 사실, 정책 텍스트 또는 원시 증거를 제공합니다.",
    },
    surfaceLabels: {
      popup: "팝업",
      sidebar: "사이드바",
      fullPage: "전체 페이지 탭",
    },
    visibleCount: (visibleLabel, totalLabel) =>
      `${visibleLabel}/${totalLabel} 표시됨`,
    kindLabels: {
      primary_quota: "기본 할당량",
      usage_window: "사용 창",
      usage_balance: "잔액",
    },
    availabilityLabels: {
      progress: "진행률",
      value_only: "값만",
      unavailable: "사용 불가",
    },
    shown: "표시됨",
    hidden: "숨김",
    visibilityAction: (nextAction, itemLabel, surfaceLabel) =>
      `${surfaceLabel}에서 ${itemLabel} ${nextAction === "hide" ? "숨기기" : "표시"}`,
    rowAria: (itemLabel, indexLabel, totalLabel, surfaceLabel) =>
      `${itemLabel}, ${surfaceLabel}에서 ${totalLabel}개 중 ${indexLabel}번째`,
    moveUpAction: (itemLabel, surfaceLabel) =>
      `${surfaceLabel}에서 ${itemLabel} 위로 이동`,
    moveDownAction: (itemLabel, surfaceLabel) =>
      `${surfaceLabel}에서 ${itemLabel} 아래로 이동`,
    up: "위로",
    down: "아래로",
    allHidden:
      "이 표면의 모든 진행 항목이 숨겨져 있습니다. 이후 렌더링은 빈 카드 대신 Provider 메타데이터로 돌아갈 수 있습니다.",
  },
  "es-419": {
    sectionLabel: "Elementos de cuota",
    title: "Elige el progreso visible por superficie",
    detail:
      "Oculta, muestra y reordena elementos de progreso de cuota por separado para popup, sidebar y pestaña de página completa. Los datos de uso y diagnósticos sin procesar quedan fuera de esta lista.",
    provider: {
      count: (countLabel) => `${countLabel} elementos de cuota configurables`,
      emptyDetail: "Aún no hay elementos de progreso de cuota configurables",
      emptyBody:
        "Este provider actualmente expone datos, texto de política o evidencia sin procesar, no elementos de progreso renderizables.",
    },
    surfaceLabels: {
      popup: "Popup",
      sidebar: "Sidebar",
      fullPage: "Pestaña de página completa",
    },
    visibleCount: (visibleLabel, totalLabel) =>
      `${visibleLabel}/${totalLabel} visibles`,
    kindLabels: {
      primary_quota: "Cuota principal",
      usage_window: "Ventana de uso",
      usage_balance: "Saldo",
    },
    availabilityLabels: {
      progress: "Progreso",
      value_only: "Solo valor",
      unavailable: "No disponible",
    },
    shown: "Visible",
    hidden: "Oculto",
    visibilityAction: (nextAction, itemLabel, surfaceLabel) =>
      `${nextAction === "hide" ? "Ocultar" : "Mostrar"} ${itemLabel} en ${surfaceLabel}`,
    rowAria: (itemLabel, indexLabel, totalLabel, surfaceLabel) =>
      `${itemLabel}, ${indexLabel} de ${totalLabel} en ${surfaceLabel}`,
    moveUpAction: (itemLabel, surfaceLabel) =>
      `Mover ${itemLabel} hacia arriba en ${surfaceLabel}`,
    moveDownAction: (itemLabel, surfaceLabel) =>
      `Mover ${itemLabel} hacia abajo en ${surfaceLabel}`,
    up: "Subir",
    down: "Bajar",
    allHidden:
      "Todos los elementos de progreso están ocultos en esta superficie; la renderización puede volver a los metadatos del provider en lugar de una tarjeta vacía.",
  },
  "pt-BR": {
    sectionLabel: "Itens de cota",
    title: "Escolha o progresso visível por superfície",
    detail:
      "Oculte, mostre e reordene itens de progresso de cota separadamente para popup, sidebar e aba de página completa. Fatos de uso e diagnósticos brutos ficam fora desta lista.",
    provider: {
      count: (countLabel) => `${countLabel} itens de cota configuráveis`,
      emptyDetail: "Ainda não há itens de progresso de cota configuráveis",
      emptyBody:
        "Este provider atualmente expõe fatos, texto de política ou evidência bruta, não itens de progresso renderizáveis.",
    },
    surfaceLabels: {
      popup: "Popup",
      sidebar: "Sidebar",
      fullPage: "Aba de página completa",
    },
    visibleCount: (visibleLabel, totalLabel) =>
      `${visibleLabel}/${totalLabel} exibidos`,
    kindLabels: {
      primary_quota: "Cota principal",
      usage_window: "Janela de uso",
      usage_balance: "Saldo",
    },
    availabilityLabels: {
      progress: "Progresso",
      value_only: "Somente valor",
      unavailable: "Indisponível",
    },
    shown: "Exibido",
    hidden: "Oculto",
    visibilityAction: (nextAction, itemLabel, surfaceLabel) =>
      `${nextAction === "hide" ? "Ocultar" : "Mostrar"} ${itemLabel} em ${surfaceLabel}`,
    rowAria: (itemLabel, indexLabel, totalLabel, surfaceLabel) =>
      `${itemLabel}, ${indexLabel} de ${totalLabel} em ${surfaceLabel}`,
    moveUpAction: (itemLabel, surfaceLabel) =>
      `Mover ${itemLabel} para cima em ${surfaceLabel}`,
    moveDownAction: (itemLabel, surfaceLabel) =>
      `Mover ${itemLabel} para baixo em ${surfaceLabel}`,
    up: "Subir",
    down: "Descer",
    allHidden:
      "Todos os itens de progresso estão ocultos nesta superfície; a renderização pode voltar aos metadados do provider em vez de um cartão vazio.",
  },
  fr: {
    sectionLabel: "Elements de quota",
    title: "Choisir les progres visibles par surface",
    detail:
      "Masquez, affichez et reorganisez les elements de progression de quota separement pour le popup, la barre laterale et l'onglet pleine page. Les faits d'utilisation et diagnostics bruts restent hors de cette liste.",
    provider: {
      count: (countLabel) => `${countLabel} elements de quota configurables`,
      emptyDetail: "Aucun element de progression de quota configurable pour l'instant",
      emptyBody:
        "Ce provider expose actuellement des faits, du texte de politique ou des preuves brutes plutot que des elements de progression affichables.",
    },
    surfaceLabels: {
      popup: "Popup",
      sidebar: "Barre laterale",
      fullPage: "Onglet pleine page",
    },
    visibleCount: (visibleLabel, totalLabel) =>
      `${visibleLabel}/${totalLabel} affiches`,
    kindLabels: {
      primary_quota: "Quota principal",
      usage_window: "Fenetre d'utilisation",
      usage_balance: "Solde",
    },
    availabilityLabels: {
      progress: "Progression",
      value_only: "Valeur seule",
      unavailable: "Indisponible",
    },
    shown: "Affiche",
    hidden: "Masque",
    visibilityAction: (nextAction, itemLabel, surfaceLabel) =>
      `${nextAction === "hide" ? "Masquer" : "Afficher"} ${itemLabel} sur ${surfaceLabel}`,
    rowAria: (itemLabel, indexLabel, totalLabel, surfaceLabel) =>
      `${itemLabel}, ${indexLabel} sur ${totalLabel} sur ${surfaceLabel}`,
    moveUpAction: (itemLabel, surfaceLabel) =>
      `Deplacer ${itemLabel} vers le haut sur ${surfaceLabel}`,
    moveDownAction: (itemLabel, surfaceLabel) =>
      `Deplacer ${itemLabel} vers le bas sur ${surfaceLabel}`,
    up: "Monter",
    down: "Descendre",
    allHidden:
      "Tous les elements de progression sont masques sur cette surface; l'affichage peut revenir aux metadonnees du provider au lieu d'une carte vide.",
  },
  de: {
    sectionLabel: "Kontingentelemente",
    title: "Sichtbaren Fortschritt je Oberflaeche waehlen",
    detail:
      "Kontingent-Fortschritte fuer Popup, Sidebar und Vollseiten-Tab separat ausblenden, anzeigen und sortieren. Nutzungsfakten und Rohdiagnosen bleiben ausserhalb dieser Fortschrittsliste.",
    provider: {
      count: (countLabel) => `${countLabel} konfigurierbare Kontingentelemente`,
      emptyDetail: "Noch keine konfigurierbaren Kontingent-Fortschritte",
      emptyBody:
        "Dieser Provider stellt derzeit Fakten, Richtlinientext oder Rohbelege bereit, aber keine renderbaren Fortschrittselemente.",
    },
    surfaceLabels: {
      popup: "Popup",
      sidebar: "Sidebar",
      fullPage: "Vollseiten-Tab",
    },
    visibleCount: (visibleLabel, totalLabel) =>
      `${visibleLabel}/${totalLabel} angezeigt`,
    kindLabels: {
      primary_quota: "Hauptkontingent",
      usage_window: "Nutzungsfenster",
      usage_balance: "Guthaben",
    },
    availabilityLabels: {
      progress: "Fortschritt",
      value_only: "Nur Wert",
      unavailable: "Nicht verfuegbar",
    },
    shown: "Angezeigt",
    hidden: "Ausgeblendet",
    visibilityAction: (nextAction, itemLabel, surfaceLabel) =>
      `${itemLabel} auf ${surfaceLabel} ${nextAction === "hide" ? "ausblenden" : "anzeigen"}`,
    rowAria: (itemLabel, indexLabel, totalLabel, surfaceLabel) =>
      `${itemLabel}, ${indexLabel} von ${totalLabel} auf ${surfaceLabel}`,
    moveUpAction: (itemLabel, surfaceLabel) =>
      `${itemLabel} auf ${surfaceLabel} nach oben verschieben`,
    moveDownAction: (itemLabel, surfaceLabel) =>
      `${itemLabel} auf ${surfaceLabel} nach unten verschieben`,
    up: "Nach oben",
    down: "Nach unten",
    allHidden:
      "Alle Fortschrittselemente sind auf dieser Oberflaeche ausgeblendet; die Darstellung kann auf Provider-Metadaten statt auf eine leere Karte zurueckfallen.",
  },
  it: {
    sectionLabel: "Elementi quota",
    title: "Scegli i progressi visibili per superficie",
    detail:
      "Nascondi, mostra e riordina gli elementi di progresso della quota separatamente per popup, sidebar e scheda a pagina intera. Fatti di utilizzo e diagnostica grezza restano fuori da questo elenco.",
    provider: {
      count: (countLabel) => `${countLabel} elementi quota configurabili`,
      emptyDetail: "Nessun elemento di progresso quota configurabile per ora",
      emptyBody:
        "Questo provider espone attualmente fatti, testo di policy o prove grezze invece di elementi di progresso renderizzabili.",
    },
    surfaceLabels: {
      popup: "Popup",
      sidebar: "Sidebar",
      fullPage: "Scheda a pagina intera",
    },
    visibleCount: (visibleLabel, totalLabel) =>
      `${visibleLabel}/${totalLabel} mostrati`,
    kindLabels: {
      primary_quota: "Quota principale",
      usage_window: "Finestra di utilizzo",
      usage_balance: "Saldo",
    },
    availabilityLabels: {
      progress: "Progresso",
      value_only: "Solo valore",
      unavailable: "Non disponibile",
    },
    shown: "Mostrato",
    hidden: "Nascosto",
    visibilityAction: (nextAction, itemLabel, surfaceLabel) =>
      `${nextAction === "hide" ? "Nascondi" : "Mostra"} ${itemLabel} su ${surfaceLabel}`,
    rowAria: (itemLabel, indexLabel, totalLabel, surfaceLabel) =>
      `${itemLabel}, ${indexLabel} di ${totalLabel} su ${surfaceLabel}`,
    moveUpAction: (itemLabel, surfaceLabel) =>
      `Sposta ${itemLabel} in alto su ${surfaceLabel}`,
    moveDownAction: (itemLabel, surfaceLabel) =>
      `Sposta ${itemLabel} in basso su ${surfaceLabel}`,
    up: "Su",
    down: "Giu",
    allHidden:
      "Tutti gli elementi di progresso sono nascosti su questa superficie; il rendering puo tornare ai metadati del provider invece di una scheda vuota.",
  },
  ru: {
    sectionLabel: "Элементы квоты",
    title: "Выберите видимый прогресс для каждого интерфейса",
    detail:
      "Скрывайте, показывайте и меняйте порядок элементов прогресса квоты отдельно для popup, sidebar и полноэкранной вкладки. Факты использования и сырые диагностики не входят в этот список.",
    provider: {
      count: (countLabel) => `${countLabel} настраиваемых элементов квоты`,
      emptyDetail: "Настраиваемых элементов прогресса квоты пока нет",
      emptyBody:
        "Этот provider сейчас показывает факты, текст политики или сырые доказательства, а не отображаемые элементы прогресса.",
    },
    surfaceLabels: {
      popup: "Popup",
      sidebar: "Sidebar",
      fullPage: "Полноэкранная вкладка",
    },
    visibleCount: (visibleLabel, totalLabel) =>
      `${visibleLabel}/${totalLabel} показано`,
    kindLabels: {
      primary_quota: "Основная квота",
      usage_window: "Окно использования",
      usage_balance: "Баланс",
    },
    availabilityLabels: {
      progress: "Прогресс",
      value_only: "Только значение",
      unavailable: "Недоступно",
    },
    shown: "Показано",
    hidden: "Скрыто",
    visibilityAction: (nextAction, itemLabel, surfaceLabel) =>
      `${nextAction === "hide" ? "Скрыть" : "Показать"} ${itemLabel} в ${surfaceLabel}`,
    rowAria: (itemLabel, indexLabel, totalLabel, surfaceLabel) =>
      `${itemLabel}, ${indexLabel} из ${totalLabel} в ${surfaceLabel}`,
    moveUpAction: (itemLabel, surfaceLabel) =>
      `Переместить ${itemLabel} вверх в ${surfaceLabel}`,
    moveDownAction: (itemLabel, surfaceLabel) =>
      `Переместить ${itemLabel} вниз в ${surfaceLabel}`,
    up: "Вверх",
    down: "Вниз",
    allHidden:
      "Все элементы прогресса скрыты на этом интерфейсе; отображение может вернуться к метаданным provider вместо пустой карточки.",
  },
  ar: {
    sectionLabel: "عناصر الحصة",
    title: "اختر التقدم المرئي لكل سطح",
    detail:
      "يمكنك إخفاء عناصر تقدم الحصة وإظهارها وإعادة ترتيبها بشكل مستقل في popup وsidebar وعلامة تبويب الصفحة الكاملة. تبقى حقائق الاستخدام والتشخيصات الخام خارج هذه القائمة.",
    provider: {
      count: (countLabel) => `${countLabel} عناصر حصة قابلة للضبط`,
      emptyDetail: "لا توجد عناصر تقدم حصة قابلة للضبط بعد",
      emptyBody:
        "يعرض هذا Provider حاليا حقائق أو نص سياسة أو أدلة خاما بدلا من عناصر تقدم قابلة للعرض.",
    },
    surfaceLabels: {
      popup: "Popup",
      sidebar: "Sidebar",
      fullPage: "علامة تبويب صفحة كاملة",
    },
    visibleCount: (visibleLabel, totalLabel) =>
      `${visibleLabel}/${totalLabel} معروضة`,
    kindLabels: {
      primary_quota: "الحصة الرئيسية",
      usage_window: "نافذة الاستخدام",
      usage_balance: "الرصيد",
    },
    availabilityLabels: {
      progress: "تقدم",
      value_only: "قيمة فقط",
      unavailable: "غير متاح",
    },
    shown: "معروض",
    hidden: "مخفي",
    visibilityAction: (nextAction, itemLabel, surfaceLabel) =>
      `${nextAction === "hide" ? "إخفاء" : "إظهار"} ${itemLabel} في ${surfaceLabel}`,
    rowAria: (itemLabel, indexLabel, totalLabel, surfaceLabel) =>
      `${itemLabel}، ${indexLabel} من ${totalLabel} في ${surfaceLabel}`,
    moveUpAction: (itemLabel, surfaceLabel) =>
      `نقل ${itemLabel} إلى أعلى في ${surfaceLabel}`,
    moveDownAction: (itemLabel, surfaceLabel) =>
      `نقل ${itemLabel} إلى أسفل في ${surfaceLabel}`,
    up: "أعلى",
    down: "أسفل",
    allHidden:
      "كل عناصر التقدم مخفية على هذا السطح؛ يمكن أن يعود العرض إلى بيانات Provider الوصفية بدلا من بطاقة فارغة.",
  },
  hi: {
    sectionLabel: "कोटा आइटम",
    title: "हर सतह के लिए दिखने वाली प्रगति चुनें",
    detail:
      "popup, sidebar और full-page tab के लिए कोटा प्रगति आइटम अलग-अलग छिपाएं, दिखाएं और क्रम बदलें। उपयोग तथ्य और raw diagnostics इस प्रगति सूची से बाहर रहते हैं।",
    provider: {
      count: (countLabel) => `${countLabel} कॉन्फ़िगर करने योग्य कोटा आइटम`,
      emptyDetail: "अभी कोई कॉन्फ़िगर करने योग्य कोटा प्रगति आइटम नहीं",
      emptyBody:
        "यह Provider फिलहाल renderable progress items के बजाय facts, policy text या raw evidence दिखाता है।",
    },
    surfaceLabels: {
      popup: "Popup",
      sidebar: "Sidebar",
      fullPage: "Full-page tab",
    },
    visibleCount: (visibleLabel, totalLabel) =>
      `${visibleLabel}/${totalLabel} दिखाए गए`,
    kindLabels: {
      primary_quota: "मुख्य कोटा",
      usage_window: "उपयोग विंडो",
      usage_balance: "बैलेंस",
    },
    availabilityLabels: {
      progress: "प्रगति",
      value_only: "केवल मान",
      unavailable: "उपलब्ध नहीं",
    },
    shown: "दिखाया गया",
    hidden: "छिपा हुआ",
    visibilityAction: (nextAction, itemLabel, surfaceLabel) =>
      `${surfaceLabel} पर ${itemLabel} ${nextAction === "hide" ? "छिपाएं" : "दिखाएं"}`,
    rowAria: (itemLabel, indexLabel, totalLabel, surfaceLabel) =>
      `${itemLabel}, ${surfaceLabel} पर ${totalLabel} में से ${indexLabel}`,
    moveUpAction: (itemLabel, surfaceLabel) =>
      `${surfaceLabel} पर ${itemLabel} ऊपर ले जाएं`,
    moveDownAction: (itemLabel, surfaceLabel) =>
      `${surfaceLabel} पर ${itemLabel} नीचे ले जाएं`,
    up: "ऊपर",
    down: "नीचे",
    allHidden:
      "इस सतह पर सभी progress items छिपे हैं; rendering खाली card के बजाय Provider metadata पर लौट सकती है।",
  },
  id: {
    sectionLabel: "Item kuota",
    title: "Pilih progres yang terlihat per surface",
    detail:
      "Sembunyikan, tampilkan, dan urutkan ulang item progres kuota secara terpisah untuk popup, sidebar, dan tab halaman penuh. Fakta penggunaan dan diagnostik mentah tetap di luar daftar progres ini.",
    provider: {
      count: (countLabel) => `${countLabel} item kuota yang dapat diatur`,
      emptyDetail: "Belum ada item progres kuota yang dapat diatur",
      emptyBody:
        "Provider ini saat ini mengekspos fakta, teks kebijakan, atau bukti mentah, bukan item progres yang dapat dirender.",
    },
    surfaceLabels: {
      popup: "Popup",
      sidebar: "Sidebar",
      fullPage: "Tab halaman penuh",
    },
    visibleCount: (visibleLabel, totalLabel) =>
      `${visibleLabel}/${totalLabel} ditampilkan`,
    kindLabels: {
      primary_quota: "Kuota utama",
      usage_window: "Jendela penggunaan",
      usage_balance: "Saldo",
    },
    availabilityLabels: {
      progress: "Progres",
      value_only: "Hanya nilai",
      unavailable: "Tidak tersedia",
    },
    shown: "Ditampilkan",
    hidden: "Disembunyikan",
    visibilityAction: (nextAction, itemLabel, surfaceLabel) =>
      `${nextAction === "hide" ? "Sembunyikan" : "Tampilkan"} ${itemLabel} di ${surfaceLabel}`,
    rowAria: (itemLabel, indexLabel, totalLabel, surfaceLabel) =>
      `${itemLabel}, ${indexLabel} dari ${totalLabel} di ${surfaceLabel}`,
    moveUpAction: (itemLabel, surfaceLabel) =>
      `Pindahkan ${itemLabel} ke atas di ${surfaceLabel}`,
    moveDownAction: (itemLabel, surfaceLabel) =>
      `Pindahkan ${itemLabel} ke bawah di ${surfaceLabel}`,
    up: "Naik",
    down: "Turun",
    allHidden:
      "Semua item progres disembunyikan pada surface ini; rendering dapat kembali ke metadata provider, bukan kartu kosong.",
  },
};

export function getSettingsProgressItemsCopy(locale: ResolvedAppLocale) {
  return SETTINGS_PROGRESS_ITEMS_COPY[locale];
}

export function buildLocalizedSettingsProgressItemsSection(
  i18n: RuntimeI18n,
  copy: SettingsProgressItemsCopyText,
) {
  return {
    sectionLabel: copy.sectionLabel,
    title: copy.title,
    detail: copy.detail,
    provider: {
      emptyDetail: copy.provider.emptyDetail,
      emptyBody: copy.provider.emptyBody,
      count: (count: number) => copy.provider.count(i18n.formatNumber(count)),
    },
    surfaceLabels: copy.surfaceLabels,
    visibleCount: (visible: number, total: number) =>
      copy.visibleCount(i18n.formatNumber(visible), i18n.formatNumber(total)),
    kindLabels: copy.kindLabels,
    availabilityLabels: copy.availabilityLabels,
    shown: copy.shown,
    hidden: copy.hidden,
    visibilityAction: (
      nextAction: "hide" | "show",
      itemLabel: string,
      surfaceLabel: string,
    ) => copy.visibilityAction(nextAction, itemLabel, surfaceLabel),
    rowAria: (
      itemLabel: string,
      index: number,
      total: number,
      surfaceLabel: string,
    ) =>
      copy.rowAria(
        itemLabel,
        i18n.formatNumber(index),
        i18n.formatNumber(total),
        surfaceLabel,
      ),
    moveUpAction: copy.moveUpAction,
    moveDownAction: copy.moveDownAction,
    up: copy.up,
    down: copy.down,
    allHidden: copy.allHidden,
  } as const;
}
