import type { RecommendedColorId } from "./color-choices";
import type { ResolvedAppLocale } from "./i18n";

type SettingsColorChoiceCopy = {
  themePresetsLabel: string;
  recommendedColorsLabel: string;
  customLabel: string;
  customHelp: string;
  customHexLabel: string;
  customPickerLabel: string;
  applyCustom: string;
  invalidHex: string;
  colorNames: Record<RecommendedColorId, string>;
};

type SettingsPreferenceGroupsCopy = {
  uiMoreShow: string;
  uiMoreHide: string;
  uiMoreDetail: string;
  providerDisplayShow: string;
  providerDisplayHide: string;
  providerDisplayDetail: string;
};

export const SETTINGS_COLOR_CHOICE_COPY: Record<
  ResolvedAppLocale,
  SettingsColorChoiceCopy
> = {
  en: {
    themePresetsLabel: "Theme presets",
    recommendedColorsLabel: "Recommended colors",
    customLabel: "Custom color",
    customHelp: "Enter a #RRGGBB color or open the color picker.",
    customHexLabel: "Color code",
    customPickerLabel: "Open color picker",
    applyCustom: "Apply custom color",
    invalidHex: "Use a valid #RRGGBB color.",
    colorNames: {
      red: "Red",
      orange: "Orange",
      brown: "Brown",
      amber: "Amber",
      yellow: "Yellow",
      green: "Green",
      teal: "Teal",
      cyan: "Cyan",
      blue: "Blue",
      indigo: "Indigo",
      purple: "Purple",
      pink: "Pink",
      slate: "Slate",
    },
  },
  "zh-CN": {
    themePresetsLabel: "主题预设",
    recommendedColorsLabel: "常用颜色",
    customLabel: "自定义颜色",
    customHelp: "输入 #RRGGBB 颜色，或打开取色板。",
    customHexLabel: "颜色编码",
    customPickerLabel: "打开取色板",
    applyCustom: "应用自定义颜色",
    invalidHex: "请使用有效的 #RRGGBB 颜色。",
    colorNames: {
      red: "红色",
      orange: "橙色",
      brown: "棕色",
      amber: "琥珀色",
      yellow: "黄色",
      green: "绿色",
      teal: "青绿色",
      cyan: "青色",
      blue: "蓝色",
      indigo: "靛蓝",
      purple: "紫色",
      pink: "粉色",
      slate: "石板灰",
    },
  },
  "zh-TW": {
    themePresetsLabel: "主題預設",
    recommendedColorsLabel: "常用色彩",
    customLabel: "自訂色彩",
    customHelp: "輸入 #RRGGBB 色彩，或開啟取色器。",
    customHexLabel: "色彩代碼",
    customPickerLabel: "開啟取色器",
    applyCustom: "套用自訂色彩",
    invalidHex: "請使用有效的 #RRGGBB 色彩。",
    colorNames: {
      red: "紅色",
      orange: "橙色",
      brown: "棕色",
      amber: "琥珀色",
      yellow: "黃色",
      green: "綠色",
      teal: "藍綠色",
      cyan: "青色",
      blue: "藍色",
      indigo: "靛藍",
      purple: "紫色",
      pink: "粉色",
      slate: "石板灰",
    },
  },
  ja: {
    themePresetsLabel: "テーマプリセット",
    recommendedColorsLabel: "おすすめカラー",
    customLabel: "カスタムカラー",
    customHelp: "#RRGGBB の色を入力するか、カラーピッカーを開きます。",
    customHexLabel: "カラーコード",
    customPickerLabel: "カラーピッカーを開く",
    applyCustom: "カスタムカラーを適用",
    invalidHex: "有効な #RRGGBB カラーを使ってください。",
    colorNames: {
      red: "赤",
      orange: "オレンジ",
      brown: "ブラウン",
      amber: "アンバー",
      yellow: "黄",
      green: "緑",
      teal: "ティール",
      cyan: "シアン",
      blue: "青",
      indigo: "インディゴ",
      purple: "紫",
      pink: "ピンク",
      slate: "スレート",
    },
  },
  ko: {
    themePresetsLabel: "테마 프리셋",
    recommendedColorsLabel: "추천 색상",
    customLabel: "사용자 지정 색상",
    customHelp: "#RRGGBB 색상을 입력하거나 색상 선택기를 여세요.",
    customHexLabel: "색상 코드",
    customPickerLabel: "색상 선택기 열기",
    applyCustom: "사용자 지정 색상 적용",
    invalidHex: "유효한 #RRGGBB 색상을 사용하세요.",
    colorNames: {
      red: "빨강",
      orange: "주황",
      brown: "갈색",
      amber: "호박색",
      yellow: "노랑",
      green: "초록",
      teal: "청록",
      cyan: "시안",
      blue: "파랑",
      indigo: "남색",
      purple: "보라",
      pink: "분홍",
      slate: "슬레이트",
    },
  },
  "es-419": {
    themePresetsLabel: "Preajustes de tema",
    recommendedColorsLabel: "Colores recomendados",
    customLabel: "Color personalizado",
    customHelp: "Ingresa un color #RRGGBB o abre el selector de color.",
    customHexLabel: "Código de color",
    customPickerLabel: "Abrir selector de color",
    applyCustom: "Aplicar color personalizado",
    invalidHex: "Usa un color #RRGGBB válido.",
    colorNames: {
      red: "Rojo",
      orange: "Naranja",
      brown: "Marrón",
      amber: "Ámbar",
      yellow: "Amarillo",
      green: "Verde",
      teal: "Verde azulado",
      cyan: "Cian",
      blue: "Azul",
      indigo: "Índigo",
      purple: "Morado",
      pink: "Rosa",
      slate: "Pizarra",
    },
  },
  "pt-BR": {
    themePresetsLabel: "Predefinições de tema",
    recommendedColorsLabel: "Cores recomendadas",
    customLabel: "Cor personalizada",
    customHelp: "Insira uma cor #RRGGBB ou abra o seletor de cor.",
    customHexLabel: "Código da cor",
    customPickerLabel: "Abrir seletor de cor",
    applyCustom: "Aplicar cor personalizada",
    invalidHex: "Use uma cor #RRGGBB válida.",
    colorNames: {
      red: "Vermelho",
      orange: "Laranja",
      brown: "Marrom",
      amber: "Âmbar",
      yellow: "Amarelo",
      green: "Verde",
      teal: "Verde-azulado",
      cyan: "Ciano",
      blue: "Azul",
      indigo: "Índigo",
      purple: "Roxo",
      pink: "Rosa",
      slate: "Ardósia",
    },
  },
  fr: {
    themePresetsLabel: "Préréglages de thème",
    recommendedColorsLabel: "Couleurs recommandées",
    customLabel: "Couleur personnalisée",
    customHelp: "Saisissez une couleur #RRGGBB ou ouvrez le sélecteur.",
    customHexLabel: "Code couleur",
    customPickerLabel: "Ouvrir le sélecteur de couleur",
    applyCustom: "Appliquer la couleur personnalisée",
    invalidHex: "Utilisez une couleur #RRGGBB valide.",
    colorNames: {
      red: "Rouge",
      orange: "Orange",
      brown: "Brun",
      amber: "Ambre",
      yellow: "Jaune",
      green: "Vert",
      teal: "Sarcelle",
      cyan: "Cyan",
      blue: "Bleu",
      indigo: "Indigo",
      purple: "Violet",
      pink: "Rose",
      slate: "Ardoise",
    },
  },
  de: {
    themePresetsLabel: "Design-Voreinstellungen",
    recommendedColorsLabel: "Empfohlene Farben",
    customLabel: "Eigene Farbe",
    customHelp: "Gib eine #RRGGBB-Farbe ein oder öffne den Farbwähler.",
    customHexLabel: "Farbcode",
    customPickerLabel: "Farbwähler öffnen",
    applyCustom: "Eigene Farbe anwenden",
    invalidHex: "Verwende eine gültige #RRGGBB-Farbe.",
    colorNames: {
      red: "Rot",
      orange: "Orange",
      brown: "Braun",
      amber: "Bernstein",
      yellow: "Gelb",
      green: "Grün",
      teal: "Blaugrün",
      cyan: "Cyan",
      blue: "Blau",
      indigo: "Indigo",
      purple: "Violett",
      pink: "Pink",
      slate: "Schiefer",
    },
  },
  it: {
    themePresetsLabel: "Preset tema",
    recommendedColorsLabel: "Colori consigliati",
    customLabel: "Colore personalizzato",
    customHelp: "Inserisci un colore #RRGGBB o apri il selettore colore.",
    customHexLabel: "Codice colore",
    customPickerLabel: "Apri selettore colore",
    applyCustom: "Applica colore personalizzato",
    invalidHex: "Usa un colore #RRGGBB valido.",
    colorNames: {
      red: "Rosso",
      orange: "Arancione",
      brown: "Marrone",
      amber: "Ambra",
      yellow: "Giallo",
      green: "Verde",
      teal: "Verde acqua",
      cyan: "Ciano",
      blue: "Blu",
      indigo: "Indaco",
      purple: "Viola",
      pink: "Rosa",
      slate: "Ardesia",
    },
  },
  ru: {
    themePresetsLabel: "Предустановки темы",
    recommendedColorsLabel: "Рекомендуемые цвета",
    customLabel: "Свой цвет",
    customHelp: "Введите цвет #RRGGBB или откройте палитру.",
    customHexLabel: "Код цвета",
    customPickerLabel: "Открыть палитру",
    applyCustom: "Применить свой цвет",
    invalidHex: "Используйте корректный цвет #RRGGBB.",
    colorNames: {
      red: "Красный",
      orange: "Оранжевый",
      brown: "Коричневый",
      amber: "Янтарный",
      yellow: "Жёлтый",
      green: "Зелёный",
      teal: "Бирюзовый",
      cyan: "Циан",
      blue: "Синий",
      indigo: "Индиго",
      purple: "Фиолетовый",
      pink: "Розовый",
      slate: "Сланцевый",
    },
  },
  ar: {
    themePresetsLabel: "إعدادات السمة",
    recommendedColorsLabel: "ألوان مقترحة",
    customLabel: "لون مخصص",
    customHelp: "أدخل لون #RRGGBB أو افتح منتقي الألوان.",
    customHexLabel: "رمز اللون",
    customPickerLabel: "فتح منتقي الألوان",
    applyCustom: "تطبيق اللون المخصص",
    invalidHex: "استخدم لون #RRGGBB صالحًا.",
    colorNames: {
      red: "أحمر",
      orange: "برتقالي",
      brown: "بني",
      amber: "كهرماني",
      yellow: "أصفر",
      green: "أخضر",
      teal: "أزرق مخضر",
      cyan: "سماوي",
      blue: "أزرق",
      indigo: "نيلي",
      purple: "بنفسجي",
      pink: "وردي",
      slate: "رمادي مزرق",
    },
  },
  hi: {
    themePresetsLabel: "थीम प्रीसेट",
    recommendedColorsLabel: "सुझाए गए रंग",
    customLabel: "कस्टम रंग",
    customHelp: "#RRGGBB रंग दर्ज करें या color picker खोलें।",
    customHexLabel: "रंग कोड",
    customPickerLabel: "Color picker खोलें",
    applyCustom: "कस्टम रंग लागू करें",
    invalidHex: "मान्य #RRGGBB रंग इस्तेमाल करें।",
    colorNames: {
      red: "लाल",
      orange: "नारंगी",
      brown: "भूरा",
      amber: "एम्बर",
      yellow: "पीला",
      green: "हरा",
      teal: "टील",
      cyan: "स्यान",
      blue: "नीला",
      indigo: "इंडिगो",
      purple: "बैंगनी",
      pink: "गुलाबी",
      slate: "स्लेट",
    },
  },
  id: {
    themePresetsLabel: "Preset tema",
    recommendedColorsLabel: "Warna rekomendasi",
    customLabel: "Warna kustom",
    customHelp: "Masukkan warna #RRGGBB atau buka pemilih warna.",
    customHexLabel: "Kode warna",
    customPickerLabel: "Buka pemilih warna",
    applyCustom: "Terapkan warna kustom",
    invalidHex: "Gunakan warna #RRGGBB yang valid.",
    colorNames: {
      red: "Merah",
      orange: "Oranye",
      brown: "Cokelat",
      amber: "Amber",
      yellow: "Kuning",
      green: "Hijau",
      teal: "Teal",
      cyan: "Sian",
      blue: "Biru",
      indigo: "Nila",
      purple: "Ungu",
      pink: "Merah muda",
      slate: "Slate",
    },
  },
};

export const SETTINGS_PREFERENCE_GROUPS_COPY: Record<
  ResolvedAppLocale,
  SettingsPreferenceGroupsCopy
> = {
  en: {
    uiMoreShow: "More UI controls",
    uiMoreHide: "Hide UI controls",
    uiMoreDetail:
      "Popup shape, progress style, progress appearance, and accent colors live here.",
    providerDisplayShow: "Provider display controls",
    providerDisplayHide: "Hide provider display controls",
    providerDisplayDetail:
      "Manage provider order and visible quota progress items separately for each surface.",
  },
  "zh-CN": {
    uiMoreShow: "UI 下的更多",
    uiMoreHide: "收起 UI 更多",
    uiMoreDetail:
      "Popup 形态、额度样式、进度外观和强调色都放在这里。",
    providerDisplayShow: "Provider 顺序与可见进度",
    providerDisplayHide: "收起 Provider 显示设置",
    providerDisplayDetail:
      "按 popup、sidebar 和完整页面分别管理 Provider 顺序和可见额度进度项。",
  },
  "zh-TW": {
    uiMoreShow: "UI 的更多設定",
    uiMoreHide: "收起 UI 更多設定",
    uiMoreDetail: "Popup 形態、額度樣式、進度外觀和強調色都在這裡。",
    providerDisplayShow: "Provider 順序與可見進度",
    providerDisplayHide: "收起 Provider 顯示設定",
    providerDisplayDetail:
      "依 popup、sidebar 和完整頁面分別管理 Provider 順序與可見額度進度項目。",
  },
  ja: {
    uiMoreShow: "UI の詳細設定",
    uiMoreHide: "UI の詳細設定を閉じる",
    uiMoreDetail: "ポップアップ形状、進捗スタイル、進捗の外観、アクセント色を設定します。",
    providerDisplayShow: "Provider 表示設定",
    providerDisplayHide: "Provider 表示設定を閉じる",
    providerDisplayDetail:
      "サーフェスごとに Provider の順序と表示するクォータ進捗項目を管理します。",
  },
  ko: {
    uiMoreShow: "UI 추가 설정",
    uiMoreHide: "UI 추가 설정 닫기",
    uiMoreDetail: "팝업 모양, 진행률 스타일, 진행률 모양, 강조 색상을 설정합니다.",
    providerDisplayShow: "Provider 표시 설정",
    providerDisplayHide: "Provider 표시 설정 닫기",
    providerDisplayDetail:
      "표면별 Provider 순서와 표시할 할당량 진행률 항목을 관리합니다.",
  },
  "es-419": {
    uiMoreShow: "Más controles de UI",
    uiMoreHide: "Ocultar controles de UI",
    uiMoreDetail:
      "Configura forma del popup, estilo de progreso, apariencia del progreso y colores de acento.",
    providerDisplayShow: "Controles de visualización de providers",
    providerDisplayHide: "Ocultar controles de visualización",
    providerDisplayDetail:
      "Administra el orden de providers y los elementos de progreso visibles por superficie.",
  },
  "pt-BR": {
    uiMoreShow: "Mais controles de UI",
    uiMoreHide: "Ocultar controles de UI",
    uiMoreDetail:
      "Configure formato do popup, estilo de progresso, aparência do progresso e cores de destaque.",
    providerDisplayShow: "Controles de exibição de providers",
    providerDisplayHide: "Ocultar controles de exibição",
    providerDisplayDetail:
      "Gerencie a ordem dos providers e os itens de progresso visíveis por superfície.",
  },
  fr: {
    uiMoreShow: "Plus de contrôles UI",
    uiMoreHide: "Masquer les contrôles UI",
    uiMoreDetail:
      "Réglez la forme du popup, le style et l'apparence de progression, et les couleurs d'accent.",
    providerDisplayShow: "Contrôles d'affichage des providers",
    providerDisplayHide: "Masquer les contrôles d'affichage",
    providerDisplayDetail:
      "Gérez l'ordre des providers et les éléments de progression visibles par surface.",
  },
  de: {
    uiMoreShow: "Weitere UI-Steuerungen",
    uiMoreHide: "UI-Steuerungen ausblenden",
    uiMoreDetail:
      "Popup-Form, Fortschrittsstil, Fortschrittsdarstellung und Akzentfarben einstellen.",
    providerDisplayShow: "Provider-Anzeige steuern",
    providerDisplayHide: "Provider-Anzeige ausblenden",
    providerDisplayDetail:
      "Provider-Reihenfolge und sichtbare Fortschrittselemente pro Oberfläche verwalten.",
  },
  it: {
    uiMoreShow: "Altri controlli UI",
    uiMoreHide: "Nascondi controlli UI",
    uiMoreDetail:
      "Regola forma popup, stile progresso, aspetto progresso e colori accento.",
    providerDisplayShow: "Controlli visualizzazione provider",
    providerDisplayHide: "Nascondi controlli visualizzazione",
    providerDisplayDetail:
      "Gestisci ordine provider e elementi di progresso visibili per superficie.",
  },
  ru: {
    uiMoreShow: "Дополнительные настройки UI",
    uiMoreHide: "Скрыть настройки UI",
    uiMoreDetail:
      "Настройте форму popup, стиль прогресса, внешний вид прогресса и акцентные цвета.",
    providerDisplayShow: "Настройки отображения providers",
    providerDisplayHide: "Скрыть настройки отображения",
    providerDisplayDetail:
      "Управляйте порядком providers и видимыми элементами прогресса по поверхностям.",
  },
  ar: {
    uiMoreShow: "مزيد من عناصر UI",
    uiMoreHide: "إخفاء عناصر UI",
    uiMoreDetail:
      "اضبط شكل popup ونمط التقدم ومظهره وألوان التمييز.",
    providerDisplayShow: "إعدادات عرض Provider",
    providerDisplayHide: "إخفاء إعدادات العرض",
    providerDisplayDetail:
      "أدر ترتيب Providers وعناصر تقدم الحصة المرئية لكل سطح.",
  },
  hi: {
    uiMoreShow: "अधिक UI controls",
    uiMoreHide: "UI controls छिपाएँ",
    uiMoreDetail:
      "Popup shape, progress style, progress appearance और accent colors सेट करें।",
    providerDisplayShow: "Provider display controls",
    providerDisplayHide: "Provider display controls छिपाएँ",
    providerDisplayDetail:
      "हर surface के लिए provider order और visible quota progress items प्रबंधित करें।",
  },
  id: {
    uiMoreShow: "Kontrol UI lainnya",
    uiMoreHide: "Sembunyikan kontrol UI",
    uiMoreDetail:
      "Atur bentuk popup, gaya progress, tampilan progress, dan warna aksen.",
    providerDisplayShow: "Kontrol tampilan provider",
    providerDisplayHide: "Sembunyikan kontrol tampilan",
    providerDisplayDetail:
      "Kelola urutan provider dan item progress kuota yang terlihat per surface.",
  },
};

export function getSettingsColorChoiceCopy(locale: ResolvedAppLocale) {
  return SETTINGS_COLOR_CHOICE_COPY[locale];
}

export function getSettingsPreferenceGroupsCopy(locale: ResolvedAppLocale) {
  return SETTINGS_PREFERENCE_GROUPS_COPY[locale];
}
