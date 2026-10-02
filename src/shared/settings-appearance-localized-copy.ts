import type { ResolvedAppLocale } from "./i18n";

type AppearanceGroupCopy = {
  global: string;
  layout: string;
  content: string;
  toolbar: string;
  surface: string;
};

const COPY: Record<
  ResolvedAppLocale,
  readonly [string, string, string, string, string]
> = {
  en: [
    "Global appearance",
    "Surface layout",
    "Visible content",
    "Toolbar",
    "Editing surface",
  ],
  "zh-CN": ["全局外观", "界面布局", "显示内容", "工具栏", "正在编辑的界面"],
  "zh-TW": ["全域外觀", "介面配置", "顯示內容", "工具列", "正在編輯的介面"],
  ja: [
    "全体の外観",
    "画面レイアウト",
    "表示内容",
    "ツールバー",
    "編集する画面",
  ],
  ko: ["전체 모양", "화면 레이아웃", "표시 콘텐츠", "도구 모음", "편집할 화면"],
  "es-419": [
    "Apariencia general",
    "Diseño de la vista",
    "Contenido visible",
    "Barra de herramientas",
    "Vista a editar",
  ],
  "pt-BR": [
    "Aparência geral",
    "Layout da interface",
    "Conteúdo visível",
    "Barra de ferramentas",
    "Interface em edição",
  ],
  fr: [
    "Apparence générale",
    "Disposition",
    "Contenu visible",
    "Barre d’outils",
    "Vue à modifier",
  ],
  de: [
    "Allgemeines Aussehen",
    "Ansichtslayout",
    "Sichtbare Inhalte",
    "Symbolleiste",
    "Bearbeitete Ansicht",
  ],
  it: [
    "Aspetto generale",
    "Layout della vista",
    "Contenuti visibili",
    "Barra degli strumenti",
    "Vista da modificare",
  ],
  ru: [
    "Общий внешний вид",
    "Макет интерфейса",
    "Отображаемое содержимое",
    "Панель инструментов",
    "Редактируемый интерфейс",
  ],
  ar: [
    "المظهر العام",
    "تخطيط الواجهة",
    "المحتوى المرئي",
    "شريط الأدوات",
    "الواجهة المراد تعديلها",
  ],
  hi: [
    "सामान्य रूप",
    "इंटरफ़ेस लेआउट",
    "दिखाई देने वाली सामग्री",
    "टूलबार",
    "संपादन वाला इंटरफ़ेस",
  ],
  id: [
    "Tampilan umum",
    "Tata letak antarmuka",
    "Konten yang terlihat",
    "Bilah alat",
    "Antarmuka yang diedit",
  ],
};

export function getSettingsAppearanceCopy(
  locale: ResolvedAppLocale,
): AppearanceGroupCopy {
  const [global, layout, content, toolbar, surface] = COPY[locale];
  return { global, layout, content, toolbar, surface };
}
