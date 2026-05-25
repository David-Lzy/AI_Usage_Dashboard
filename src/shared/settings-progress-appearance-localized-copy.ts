import type { ResolvedAppLocale, RuntimeI18n } from "./i18n";
import type { ProgressGradientPresetId } from "./progress-appearance";

type SettingsProgressAppearanceCopyText = {
  sectionLabel: string;
  title: string;
  detail: string;
  thickness: {
    label: string;
    unit: string;
    help: string;
  };
  mode?: {
    label: string;
    traditional: string;
    gradient: string;
  };
  colorBands: {
    label: string;
    detail: string;
    fromLabel: string;
    toLabel: string;
    colorLabel: string;
    addBand: string;
    removeBand: string;
    moveUp: string;
    moveDown: string;
    resetToDefault: string;
    validationError: string;
    rangeLabel: (minimumLabel: string, maximumLabel: string) => string;
  };
  gradient?: {
    label: string;
    detail: string;
    trackHelp: string;
    stopHelp: string;
    positionLabel: string;
    colorLabel: string;
    deleteStop: string;
    resetToDefault: string;
    endpointLocked: string;
    minimumStopHelp: string;
    presetsLabel?: string;
    presetsHelp?: string;
    presetNames?: Partial<Record<ProgressGradientPresetId, string>>;
    customSchemeLabel?: string;
    imageGeneratedSchemeLabel?: string;
    imageImportLabel?: string;
    imageImportHelp?: string;
    imageImportAction?: string;
    imageImportBusy?: string;
    imageImportUnsupported?: string;
    imageImportTooLarge?: string;
    imageImportDecodeFailed?: string;
    imageImportCanvasUnavailable?: string;
    stopAriaLabel: (stopNumberLabel: string, positionLabel: string) => string;
  };
};

export type SettingsProgressAppearanceCopy = Omit<
  SettingsProgressAppearanceCopyText,
  "colorBands" | "gradient" | "mode"
> & {
  mode: NonNullable<SettingsProgressAppearanceCopyText["mode"]>;
  colorBands: Omit<
    SettingsProgressAppearanceCopyText["colorBands"],
    "rangeLabel"
  > & {
    rangeLabel: (minimumPercent: number, maximumPercent: number) => string;
  };
  gradient: Omit<
    NonNullable<SettingsProgressAppearanceCopyText["gradient"]>,
    "presetNames" | "presetsHelp" | "presetsLabel" | "stopAriaLabel"
    | "customSchemeLabel"
    | "imageGeneratedSchemeLabel"
    | "imageImportAction"
    | "imageImportBusy"
    | "imageImportCanvasUnavailable"
    | "imageImportDecodeFailed"
    | "imageImportHelp"
    | "imageImportLabel"
    | "imageImportTooLarge"
    | "imageImportUnsupported"
  > & {
    presetsLabel: string;
    presetsHelp: string;
    presetNames: Record<ProgressGradientPresetId, string>;
    customSchemeLabel: string;
    imageGeneratedSchemeLabel: string;
    imageImportLabel: string;
    imageImportHelp: string;
    imageImportAction: string;
    imageImportBusy: string;
    imageImportUnsupported: string;
    imageImportTooLarge: string;
    imageImportDecodeFailed: string;
    imageImportCanvasUnavailable: string;
    stopAriaLabel: (stopNumber: number, positionPercent: number) => string;
  };
};

const DEFAULT_PROGRESS_APPEARANCE_MODE_COPY = {
  label: "Color mode",
  traditional: "Traditional",
  gradient: "Gradient",
};

const DEFAULT_PROGRESS_APPEARANCE_GRADIENT_COPY = {
  label: "Remaining gradient",
  detail:
    "Click the bar to add a stop. Select a stop to edit its position and color.",
  trackHelp: "Click to add a gradient stop at that remaining percentage.",
  stopHelp:
    "Select this stop. Use Left and Right arrow keys to move non-endpoint stops.",
  positionLabel: "Position",
  colorLabel: "Color",
  deleteStop: "Delete stop",
  resetToDefault: "Reset gradient",
  endpointLocked: "Endpoint stops stay locked at 0% and 100%.",
  minimumStopHelp: "Keep at least the 0% and 100% stops.",
  presetsLabel: "Gradient scheme",
  presetsHelp: "Choose a local scheme, then adjust stops normally.",
  presetNames: {
    warning: "Warning",
    ocean: "Ocean",
    sunset: "Sunset",
    meadow: "Meadow",
    aurora: "Aurora",
    "calm-blue": "Calm blue",
    fire: "Fire",
    glacier: "Glacier",
    forest: "Forest",
    "rose-gold": "Rose gold",
    violet: "Violet",
    neon: "Neon",
    lake: "Lake",
    citrus: "Citrus",
    berry: "Berry",
    slate: "Slate",
  } satisfies Record<ProgressGradientPresetId, string>,
  customSchemeLabel: "Custom gradient",
  imageGeneratedSchemeLabel: "Generated from image",
  imageImportLabel: "Import image",
  imageImportHelp:
    "PNG, JPEG, and WebP files are processed locally in this browser. The source image is not uploaded or saved; only generated gradient stops are stored.",
  imageImportAction: "Generate from image",
  imageImportBusy: "Processing image...",
  imageImportUnsupported: "Choose a PNG, JPEG, or WebP image.",
  imageImportTooLarge: "Choose an image under 5 MB.",
  imageImportDecodeFailed: "The image could not be decoded.",
  imageImportCanvasUnavailable: "Image processing is not available here.",
  stopAriaLabel: (stopNumberLabel: string, positionLabel: string) =>
    `Gradient stop ${stopNumberLabel}, ${positionLabel}% remaining`,
};

export const SETTINGS_PROGRESS_APPEARANCE_COPY: Record<
  ResolvedAppLocale,
  SettingsProgressAppearanceCopyText
> = {
  en: {
    sectionLabel: "Progress appearance",
    title: "Tune thickness and remaining-color bands",
    detail:
      "These controls only change progress visuals. Provider warnings, diagnostics, and badge counts still use the separate warning threshold.",
    thickness: {
      label: "Progress thickness",
      unit: "px",
      help: "One global stroke weight is shared by line and ring progress styles.",
    },
    mode: DEFAULT_PROGRESS_APPEARANCE_MODE_COPY,
    colorBands: {
      label: "Remaining color bands",
      detail:
        "Keep ranges contiguous from 0 to 100. Colors use #RRGGBB values and are based on remaining percent.",
      fromLabel: "From",
      toLabel: "To",
      colorLabel: "Color",
      addBand: "Add band",
      removeBand: "Remove",
      moveUp: "Up",
      moveDown: "Down",
      resetToDefault: "Reset colors",
      validationError:
        "Use valid #RRGGBB colors and non-overlapping ranges that cover 0-100.",
      rangeLabel: (minimumLabel, maximumLabel) =>
        `${minimumLabel}-${maximumLabel}% remaining`,
    },
    gradient: DEFAULT_PROGRESS_APPEARANCE_GRADIENT_COPY,
  },
  "zh-CN": {
    sectionLabel: "进度外观",
    title: "调整粗细和剩余颜色区间",
    detail:
      "这些控件只改变进度视觉。Provider 警告、诊断和工具栏 badge 仍使用独立的警告阈值。",
    thickness: {
      label: "进度条粗细",
      unit: "px",
      help: "直线和圆环进度样式共用一个全局描边粗细。",
    },
    mode: {
      label: "颜色模式",
      traditional: "传统",
      gradient: "渐变",
    },
    colorBands: {
      label: "剩余颜色区间",
      detail:
        "区间需要从 0 到 100 连续覆盖。颜色使用 #RRGGBB，并按剩余百分比选择。",
      fromLabel: "从",
      toLabel: "到",
      colorLabel: "颜色",
      addBand: "新增区间",
      removeBand: "删除",
      moveUp: "上移",
      moveDown: "下移",
      resetToDefault: "重置颜色",
      validationError:
        "请使用有效的 #RRGGBB 颜色，并保持区间不重叠且覆盖 0-100。",
      rangeLabel: (minimumLabel, maximumLabel) =>
        `剩余 ${minimumLabel}-${maximumLabel}%`,
    },
    gradient: {
      label: "剩余渐变",
      detail: "点击颜色条可新增停止点。选中停止点后可编辑位置和颜色。",
      trackHelp: "点击即可在对应剩余百分比处新增渐变停止点。",
      stopHelp: "选中该停止点。非端点可用左右方向键移动。",
      positionLabel: "位置",
      colorLabel: "颜色",
      deleteStop: "删除停止点",
      resetToDefault: "重置渐变",
      endpointLocked: "端点停止点固定在 0% 和 100%。",
      minimumStopHelp: "至少保留 0% 和 100% 两个停止点。",
      presetsLabel: "渐变方案",
      presetsHelp: "选择本地方案后，仍可像普通停止点一样调整。",
      presetNames: {
        warning: "警示",
        ocean: "海洋",
        sunset: "日落",
        meadow: "草地",
        aurora: "极光",
        "calm-blue": "静蓝",
        fire: "火焰",
        glacier: "冰川",
        forest: "森林",
        "rose-gold": "玫瑰金",
        violet: "紫霞",
        neon: "霓虹",
        lake: "湖蓝",
        citrus: "沙金",
        berry: "莓果",
        slate: "石青",
      },
      customSchemeLabel: "自定义渐变",
      imageGeneratedSchemeLabel: "图片生成",
      imageImportLabel: "导入图片",
      imageImportHelp:
        "PNG、JPEG 和 WebP 会在当前浏览器本地处理。原图不会上传或保存，只会保存生成后的渐变停止点。",
      imageImportAction: "从图片生成",
      imageImportBusy: "正在处理图片...",
      imageImportUnsupported: "请选择 PNG、JPEG 或 WebP 图片。",
      imageImportTooLarge: "请选择小于 5 MB 的图片。",
      imageImportDecodeFailed: "无法解析这张图片。",
      imageImportCanvasUnavailable: "当前环境无法处理图片。",
      stopAriaLabel: (stopNumberLabel, positionLabel) =>
        `渐变停止点 ${stopNumberLabel}，剩余 ${positionLabel}%`,
    },
  },
  "zh-TW": {
    sectionLabel: "進度外觀",
    title: "調整粗細與剩餘色彩區間",
    detail:
      "這些控制項只改變進度視覺。Provider 警告、診斷與工具列 badge 仍使用獨立的警告門檻。",
    thickness: {
      label: "進度條粗細",
      unit: "px",
      help: "直線與圓環進度樣式共用一個全域描邊粗細。",
    },
    mode: {
      label: "色彩模式",
      traditional: "傳統",
      gradient: "漸層",
    },
    colorBands: {
      label: "剩餘色彩區間",
      detail:
        "區間需從 0 到 100 連續覆蓋。顏色使用 #RRGGBB，並依剩餘百分比選擇。",
      fromLabel: "從",
      toLabel: "到",
      colorLabel: "顏色",
      addBand: "新增區間",
      removeBand: "刪除",
      moveUp: "上移",
      moveDown: "下移",
      resetToDefault: "重設顏色",
      validationError:
        "請使用有效的 #RRGGBB 顏色，並保持區間不重疊且覆蓋 0-100。",
      rangeLabel: (minimumLabel, maximumLabel) =>
        `剩餘 ${minimumLabel}-${maximumLabel}%`,
    },
    gradient: {
      label: "剩餘漸層",
      detail: "點擊色條可新增停止點。選取停止點後可編輯位置與色彩。",
      trackHelp: "點擊即可在對應剩餘百分比新增漸層停止點。",
      stopHelp: "選取此停止點。非端點可用左右方向鍵移動。",
      positionLabel: "位置",
      colorLabel: "色彩",
      deleteStop: "刪除停止點",
      resetToDefault: "重設漸層",
      endpointLocked: "端點停止點固定在 0% 與 100%。",
      minimumStopHelp: "至少保留 0% 與 100% 兩個停止點。",
      presetsLabel: "漸層方案",
      presetsHelp: "選擇本機方案後，仍可像一般停止點一樣調整。",
      presetNames: {
        warning: "警示",
        ocean: "海洋",
        sunset: "日落",
        meadow: "草地",
        aurora: "極光",
        "calm-blue": "靜藍",
        fire: "火焰",
        glacier: "冰川",
        forest: "森林",
        "rose-gold": "玫瑰金",
        violet: "紫霞",
        neon: "霓虹",
        lake: "湖藍",
        citrus: "沙金",
        berry: "莓果",
        slate: "石青",
      },
      customSchemeLabel: "自訂漸層",
      imageGeneratedSchemeLabel: "圖片產生",
      imageImportLabel: "匯入圖片",
      imageImportHelp:
        "PNG、JPEG 與 WebP 會在目前瀏覽器本機處理。原圖不會上傳或儲存，只會保存產生的漸層停止點。",
      imageImportAction: "從圖片產生",
      imageImportBusy: "正在處理圖片...",
      imageImportUnsupported: "請選擇 PNG、JPEG 或 WebP 圖片。",
      imageImportTooLarge: "請選擇小於 5 MB 的圖片。",
      imageImportDecodeFailed: "無法解析這張圖片。",
      imageImportCanvasUnavailable: "目前環境無法處理圖片。",
      stopAriaLabel: (stopNumberLabel, positionLabel) =>
        `漸層停止點 ${stopNumberLabel}，剩餘 ${positionLabel}%`,
    },
  },
  ja: {
    sectionLabel: "進捗の外観",
    title: "太さと残量カラー帯を調整",
    detail:
      "この設定は進捗の見た目だけを変更します。Provider の警告、診断、バッジ数は別の警告しきい値を使います。",
    thickness: {
      label: "進捗の太さ",
      unit: "px",
      help: "ラインとリングの進捗スタイルで共通のストローク幅を使います。",
    },
    colorBands: {
      label: "残量カラー帯",
      detail:
        "範囲は 0 から 100 まで連続させます。色は #RRGGBB で、残量パーセントに基づきます。",
      fromLabel: "開始",
      toLabel: "終了",
      colorLabel: "色",
      addBand: "帯を追加",
      removeBand: "削除",
      moveUp: "上へ",
      moveDown: "下へ",
      resetToDefault: "色をリセット",
      validationError:
        "有効な #RRGGBB 色と、0-100 を覆う重複しない範囲を使ってください。",
      rangeLabel: (minimumLabel, maximumLabel) =>
        `残量 ${minimumLabel}-${maximumLabel}%`,
    },
  },
  ko: {
    sectionLabel: "진행률 모양",
    title: "두께와 남은 비율 색상 구간 조정",
    detail:
      "이 설정은 진행률 시각 요소만 바꿉니다. Provider 경고, 진단, 배지 수는 별도의 경고 임계값을 계속 사용합니다.",
    thickness: {
      label: "진행률 두께",
      unit: "px",
      help: "선형 및 원형 진행률 스타일이 하나의 전역 스트로크 두께를 공유합니다.",
    },
    colorBands: {
      label: "남은 비율 색상 구간",
      detail:
        "범위는 0부터 100까지 끊기지 않아야 합니다. 색상은 #RRGGBB 값을 사용하고 남은 비율을 기준으로 합니다.",
      fromLabel: "시작",
      toLabel: "끝",
      colorLabel: "색상",
      addBand: "구간 추가",
      removeBand: "삭제",
      moveUp: "위로",
      moveDown: "아래로",
      resetToDefault: "색상 초기화",
      validationError:
        "유효한 #RRGGBB 색상과 0-100을 덮는 겹치지 않는 범위를 사용하세요.",
      rangeLabel: (minimumLabel, maximumLabel) =>
        `남은 비율 ${minimumLabel}-${maximumLabel}%`,
    },
  },
  "es-419": {
    sectionLabel: "Apariencia del progreso",
    title: "Ajusta grosor y bandas de color restante",
    detail:
      "Estos controles solo cambian lo visual. Las alertas, diagnósticos y conteos del badge siguen usando el umbral de advertencia separado.",
    thickness: {
      label: "Grosor del progreso",
      unit: "px",
      help: "Los estilos de línea y anillo comparten un grosor global.",
    },
    colorBands: {
      label: "Bandas de color restante",
      detail:
        "Mantén rangos continuos de 0 a 100. Los colores usan #RRGGBB y dependen del porcentaje restante.",
      fromLabel: "Desde",
      toLabel: "Hasta",
      colorLabel: "Color",
      addBand: "Agregar banda",
      removeBand: "Quitar",
      moveUp: "Subir",
      moveDown: "Bajar",
      resetToDefault: "Restablecer colores",
      validationError:
        "Usa colores #RRGGBB válidos y rangos sin solaparse que cubran 0-100.",
      rangeLabel: (minimumLabel, maximumLabel) =>
        `${minimumLabel}-${maximumLabel}% restante`,
    },
  },
  "pt-BR": {
    sectionLabel: "Aparência do progresso",
    title: "Ajuste espessura e faixas de cor restante",
    detail:
      "Estes controles mudam apenas o visual. Alertas, diagnósticos e contagens do badge continuam usando o limite de aviso separado.",
    thickness: {
      label: "Espessura do progresso",
      unit: "px",
      help: "Os estilos de linha e anel compartilham uma espessura global.",
    },
    colorBands: {
      label: "Faixas de cor restante",
      detail:
        "Mantenha faixas contínuas de 0 a 100. As cores usam #RRGGBB e dependem do percentual restante.",
      fromLabel: "De",
      toLabel: "Até",
      colorLabel: "Cor",
      addBand: "Adicionar faixa",
      removeBand: "Remover",
      moveUp: "Subir",
      moveDown: "Descer",
      resetToDefault: "Redefinir cores",
      validationError:
        "Use cores #RRGGBB válidas e faixas sem sobreposição que cubram 0-100.",
      rangeLabel: (minimumLabel, maximumLabel) =>
        `${minimumLabel}-${maximumLabel}% restante`,
    },
  },
  fr: {
    sectionLabel: "Apparence de la progression",
    title: "Ajuster l'epaisseur et les plages de couleur",
    detail:
      "Ces controles ne changent que l'affichage. Les alertes Provider, diagnostics et compteurs de badge gardent le seuil d'avertissement separe.",
    thickness: {
      label: "Epaisseur de progression",
      unit: "px",
      help: "Les styles ligne et anneau partagent une epaisseur globale.",
    },
    colorBands: {
      label: "Plages de couleur restante",
      detail:
        "Gardez des plages continues de 0 a 100. Les couleurs utilisent #RRGGBB et suivent le pourcentage restant.",
      fromLabel: "De",
      toLabel: "A",
      colorLabel: "Couleur",
      addBand: "Ajouter",
      removeBand: "Supprimer",
      moveUp: "Monter",
      moveDown: "Descendre",
      resetToDefault: "Reinitialiser",
      validationError:
        "Utilisez des couleurs #RRGGBB valides et des plages sans chevauchement couvrant 0-100.",
      rangeLabel: (minimumLabel, maximumLabel) =>
        `${minimumLabel}-${maximumLabel}% restant`,
    },
  },
  de: {
    sectionLabel: "Fortschrittsdarstellung",
    title: "Dicke und Restfarben-Bereiche anpassen",
    detail:
      "Diese Steuerung andert nur die Darstellung. Provider-Warnungen, Diagnosen und Badge-Zahlen nutzen weiter den separaten Warnschwellwert.",
    thickness: {
      label: "Fortschrittsdicke",
      unit: "px",
      help: "Linien- und Ringstile teilen sich eine globale Strichdicke.",
    },
    colorBands: {
      label: "Restfarben-Bereiche",
      detail:
        "Bereiche mussen 0 bis 100 luckenlos abdecken. Farben nutzen #RRGGBB und basieren auf dem Restprozentsatz.",
      fromLabel: "Von",
      toLabel: "Bis",
      colorLabel: "Farbe",
      addBand: "Bereich hinzufugen",
      removeBand: "Entfernen",
      moveUp: "Nach oben",
      moveDown: "Nach unten",
      resetToDefault: "Farben zurucksetzen",
      validationError:
        "Nutze gultige #RRGGBB-Farben und nicht uberlappende Bereiche fur 0-100.",
      rangeLabel: (minimumLabel, maximumLabel) =>
        `${minimumLabel}-${maximumLabel}% verbleibend`,
    },
  },
  it: {
    sectionLabel: "Aspetto avanzamento",
    title: "Regola spessore e fasce colore residue",
    detail:
      "Questi controlli cambiano solo l'aspetto. Avvisi Provider, diagnostica e conteggi badge usano ancora la soglia di avviso separata.",
    thickness: {
      label: "Spessore avanzamento",
      unit: "px",
      help: "Gli stili linea e anello condividono uno spessore globale.",
    },
    colorBands: {
      label: "Fasce colore residuo",
      detail:
        "Mantieni intervalli continui da 0 a 100. I colori usano #RRGGBB e dipendono dalla percentuale residua.",
      fromLabel: "Da",
      toLabel: "A",
      colorLabel: "Colore",
      addBand: "Aggiungi fascia",
      removeBand: "Rimuovi",
      moveUp: "Su",
      moveDown: "Giu",
      resetToDefault: "Reimposta colori",
      validationError:
        "Usa colori #RRGGBB validi e intervalli non sovrapposti che coprono 0-100.",
      rangeLabel: (minimumLabel, maximumLabel) =>
        `${minimumLabel}-${maximumLabel}% residuo`,
    },
  },
  ru: {
    sectionLabel: "Вид прогресса",
    title: "Настройте толщину и цветовые диапазоны остатка",
    detail:
      "Эти настройки меняют только визуальный вид. Предупреждения Provider, диагностика и badge по-прежнему используют отдельный порог.",
    thickness: {
      label: "Толщина прогресса",
      unit: "px",
      help: "Линейный и кольцевой стили используют одну общую толщину.",
    },
    colorBands: {
      label: "Цветовые диапазоны остатка",
      detail:
        "Диапазоны должны непрерывно покрывать 0-100. Цвета задаются #RRGGBB и зависят от процента остатка.",
      fromLabel: "От",
      toLabel: "До",
      colorLabel: "Цвет",
      addBand: "Добавить диапазон",
      removeBand: "Удалить",
      moveUp: "Вверх",
      moveDown: "Вниз",
      resetToDefault: "Сбросить цвета",
      validationError:
        "Используйте корректные цвета #RRGGBB и непересекающиеся диапазоны 0-100.",
      rangeLabel: (minimumLabel, maximumLabel) =>
        `${minimumLabel}-${maximumLabel}% осталось`,
    },
  },
  ar: {
    sectionLabel: "مظهر التقدم",
    title: "اضبط السماكة ونطاقات لون المتبقي",
    detail:
      "هذه الخيارات تغير العرض فقط. تحذيرات Provider والتشخيصات وعدد الشارة تبقى على عتبة التحذير المنفصلة.",
    thickness: {
      label: "سماكة التقدم",
      unit: "px",
      help: "أنماط الخط والحلقة تستخدم سماكة عامة واحدة.",
    },
    colorBands: {
      label: "نطاقات لون المتبقي",
      detail:
        "اجعل النطاقات متصلة من 0 إلى 100. تستخدم الألوان #RRGGBB وتعتمد على نسبة المتبقي.",
      fromLabel: "من",
      toLabel: "إلى",
      colorLabel: "اللون",
      addBand: "إضافة نطاق",
      removeBand: "إزالة",
      moveUp: "أعلى",
      moveDown: "أسفل",
      resetToDefault: "إعادة ضبط الألوان",
      validationError:
        "استخدم ألوان #RRGGBB صحيحة ونطاقات غير متداخلة تغطي 0-100.",
      rangeLabel: (minimumLabel, maximumLabel) =>
        `${minimumLabel}-${maximumLabel}% متبق`,
    },
  },
  hi: {
    sectionLabel: "प्रगति रूप",
    title: "मोटाई और शेष रंग बैंड समायोजित करें",
    detail:
      "ये नियंत्रण केवल दृश्य रूप बदलते हैं। Provider चेतावनियां, निदान और badge गिनती अलग चेतावनी सीमा का उपयोग करती रहती हैं।",
    thickness: {
      label: "प्रगति मोटाई",
      unit: "px",
      help: "लाइन और रिंग प्रगति शैली एक वैश्विक स्ट्रोक मोटाई साझा करती हैं।",
    },
    colorBands: {
      label: "शेष रंग बैंड",
      detail:
        "रेंज 0 से 100 तक लगातार रखें। रंग #RRGGBB हैं और शेष प्रतिशत पर आधारित हैं।",
      fromLabel: "से",
      toLabel: "तक",
      colorLabel: "रंग",
      addBand: "बैंड जोड़ें",
      removeBand: "हटाएं",
      moveUp: "ऊपर",
      moveDown: "नीचे",
      resetToDefault: "रंग रीसेट करें",
      validationError:
        "मान्य #RRGGBB रंग और 0-100 को ढकने वाली बिना ओवरलैप रेंज का उपयोग करें।",
      rangeLabel: (minimumLabel, maximumLabel) =>
        `${minimumLabel}-${maximumLabel}% शेष`,
    },
  },
  id: {
    sectionLabel: "Tampilan progres",
    title: "Atur ketebalan dan pita warna sisa",
    detail:
      "Kontrol ini hanya mengubah visual. Peringatan Provider, diagnostik, dan jumlah badge tetap memakai ambang peringatan terpisah.",
    thickness: {
      label: "Ketebalan progres",
      unit: "px",
      help: "Gaya garis dan cincin memakai satu ketebalan global.",
    },
    colorBands: {
      label: "Pita warna sisa",
      detail:
        "Jaga rentang tetap tersambung dari 0 sampai 100. Warna memakai #RRGGBB dan berdasarkan persen tersisa.",
      fromLabel: "Dari",
      toLabel: "Ke",
      colorLabel: "Warna",
      addBand: "Tambah pita",
      removeBand: "Hapus",
      moveUp: "Naik",
      moveDown: "Turun",
      resetToDefault: "Reset warna",
      validationError:
        "Gunakan warna #RRGGBB yang valid dan rentang tanpa tumpang tindih yang mencakup 0-100.",
      rangeLabel: (minimumLabel, maximumLabel) =>
        `${minimumLabel}-${maximumLabel}% tersisa`,
    },
  },
};

export function buildLocalizedSettingsProgressAppearanceSection(
  i18n: RuntimeI18n,
  copy: SettingsProgressAppearanceCopyText,
): SettingsProgressAppearanceCopy {
  return {
    sectionLabel: copy.sectionLabel,
    title: copy.title,
    detail: copy.detail,
    thickness: copy.thickness,
    mode: {
      ...DEFAULT_PROGRESS_APPEARANCE_MODE_COPY,
      ...copy.mode,
    },
    colorBands: {
      ...copy.colorBands,
      rangeLabel: (minimumPercent, maximumPercent) =>
        copy.colorBands.rangeLabel(
          i18n.formatNumber(minimumPercent),
          i18n.formatNumber(maximumPercent),
        ),
    },
    gradient: {
      ...DEFAULT_PROGRESS_APPEARANCE_GRADIENT_COPY,
      ...copy.gradient,
      presetNames: {
        ...DEFAULT_PROGRESS_APPEARANCE_GRADIENT_COPY.presetNames,
        ...copy.gradient?.presetNames,
      },
      stopAriaLabel: (stopNumber, positionPercent) =>
        (
          copy.gradient?.stopAriaLabel ??
          DEFAULT_PROGRESS_APPEARANCE_GRADIENT_COPY.stopAriaLabel
        )(
          i18n.formatNumber(stopNumber),
          i18n.formatNumber(positionPercent),
        ),
    },
  };
}

export function getSettingsProgressAppearanceCopy(
  locale: ResolvedAppLocale,
): SettingsProgressAppearanceCopyText {
  return SETTINGS_PROGRESS_APPEARANCE_COPY[locale];
}
