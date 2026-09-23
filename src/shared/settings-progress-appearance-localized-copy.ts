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
  mode: {
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
  gradient: {
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
    | "customSchemeLabel" | "imageGeneratedSchemeLabel" | "imageImportAction"
    | "imageImportBusy" | "imageImportCanvasUnavailable"
    | "imageImportDecodeFailed" | "imageImportHelp" | "imageImportLabel"
    | "imageImportTooLarge" | "imageImportUnsupported"
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
    mode: {
      label: "カラーモード",
      traditional: "従来",
      gradient: "グラデーション",
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
    gradient: {
      label: "残量グラデーション",
      detail: "バーをクリックして停止点を追加します。停止点を選ぶと位置と色を編集できます。",
      trackHelp: "クリックした残量パーセントにグラデーション停止点を追加します。",
      stopHelp: "この停止点を選択します。端点以外は左右の矢印キーで移動できます。",
      positionLabel: "位置",
      colorLabel: "色",
      deleteStop: "停止点を削除",
      resetToDefault: "グラデーションをリセット",
      endpointLocked: "端点の停止点は 0% と 100% に固定されます。",
      minimumStopHelp: "0% と 100% の停止点を少なくとも残してください。",
      presetsLabel: "グラデーションスキーム",
      presetsHelp: "ローカルスキームを選択した後も、停止点を通常どおり調整できます。",
      presetNames: {
        warning: "警告", ocean: "海", sunset: "夕日", meadow: "草原", aurora: "オーロラ",
        "calm-blue": "穏やかな青", fire: "炎", glacier: "氷河", forest: "森",
        "rose-gold": "ローズゴールド", violet: "紫", neon: "ネオン", lake: "湖",
        citrus: "シトラス", berry: "ベリー", slate: "スレート",
      },
      customSchemeLabel: "カスタムグラデーション",
      imageGeneratedSchemeLabel: "画像から生成",
      imageImportLabel: "画像をインポート",
      imageImportHelp: "PNG、JPEG、WebP はこのブラウザ内でローカル処理されます。元の画像はアップロードも保存もされず、生成されたグラデーション停止点だけが保存されます。",
      imageImportAction: "画像から生成",
      imageImportBusy: "画像を処理しています...",
      imageImportUnsupported: "PNG、JPEG、または WebP 画像を選択してください。",
      imageImportTooLarge: "5 MB 未満の画像を選択してください。",
      imageImportDecodeFailed: "画像をデコードできませんでした。",
      imageImportCanvasUnavailable: "ここでは画像処理を利用できません。",
      stopAriaLabel: (stopNumberLabel, positionLabel) =>
        `グラデーション停止点 ${stopNumberLabel}、残量 ${positionLabel}%`,
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
    mode: {
      label: "색상 모드",
      traditional: "기본",
      gradient: "그라데이션",
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
    gradient: {
      label: "남은 비율 그라데이션",
      detail: "막대를 클릭해 중지점을 추가하세요. 중지점을 선택하면 위치와 색상을 편집할 수 있습니다.",
      trackHelp: "클릭한 남은 비율에 그라데이션 중지점을 추가합니다.",
      stopHelp: "이 중지점을 선택합니다. 끝점이 아닌 중지점은 왼쪽과 오른쪽 화살표 키로 이동할 수 있습니다.",
      positionLabel: "위치",
      colorLabel: "색상",
      deleteStop: "중지점 삭제",
      resetToDefault: "그라데이션 초기화",
      endpointLocked: "끝점 중지점은 0%와 100%에 고정됩니다.",
      minimumStopHelp: "0%와 100% 중지점을 최소한 유지하세요.",
      presetsLabel: "그라데이션 구성",
      presetsHelp: "로컬 구성을 선택한 뒤에도 중지점을 일반적으로 조정할 수 있습니다.",
      presetNames: {
        warning: "경고", ocean: "바다", sunset: "노을", meadow: "초원", aurora: "오로라",
        "calm-blue": "차분한 파랑", fire: "불꽃", glacier: "빙하", forest: "숲",
        "rose-gold": "로즈 골드", violet: "보라", neon: "네온", lake: "호수",
        citrus: "시트러스", berry: "베리", slate: "슬레이트",
      },
      customSchemeLabel: "사용자 지정 그라데이션",
      imageGeneratedSchemeLabel: "이미지에서 생성됨",
      imageImportLabel: "이미지 가져오기",
      imageImportHelp: "PNG, JPEG, WebP 파일은 이 브라우저에서 로컬로 처리됩니다. 원본 이미지는 업로드하거나 저장하지 않으며 생성된 그라데이션 중지점만 저장됩니다.",
      imageImportAction: "이미지에서 생성",
      imageImportBusy: "이미지 처리 중...",
      imageImportUnsupported: "PNG, JPEG 또는 WebP 이미지를 선택하세요.",
      imageImportTooLarge: "5 MB 미만의 이미지를 선택하세요.",
      imageImportDecodeFailed: "이미지를 디코드할 수 없습니다.",
      imageImportCanvasUnavailable: "여기에서는 이미지 처리를 사용할 수 없습니다.",
      stopAriaLabel: (stopNumberLabel, positionLabel) =>
        `그라데이션 중지점 ${stopNumberLabel}, 남은 비율 ${positionLabel}%`,
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
    mode: { label: "Modo de color", traditional: "Tradicional", gradient: "Degradado" },
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
    gradient: {
      label: "Degradado restante", detail: "Haz clic en la barra para agregar un punto. Selecciona un punto para editar su posición y color.",
      trackHelp: "Haz clic para agregar un punto de degradado en ese porcentaje restante.",
      stopHelp: "Selecciona este punto. Usa las flechas izquierda y derecha para mover puntos que no sean extremos.",
      positionLabel: "Posición", colorLabel: "Color", deleteStop: "Eliminar punto", resetToDefault: "Restablecer degradado",
      endpointLocked: "Los puntos de los extremos permanecen fijos en 0% y 100%.", minimumStopHelp: "Mantén al menos los puntos de 0% y 100%.",
      presetsLabel: "Esquema de degradado", presetsHelp: "Elige un esquema local y luego ajusta los puntos normalmente.",
      presetNames: { warning: "Advertencia", ocean: "Océano", sunset: "Atardecer", meadow: "Pradera", aurora: "Aurora", "calm-blue": "Azul sereno", fire: "Fuego", glacier: "Glaciar", forest: "Bosque", "rose-gold": "Oro rosa", violet: "Violeta", neon: "Neón", lake: "Lago", citrus: "Cítrico", berry: "Baya", slate: "Pizarra" },
      customSchemeLabel: "Degradado personalizado", imageGeneratedSchemeLabel: "Generado desde imagen", imageImportLabel: "Importar imagen",
      imageImportHelp: "Los archivos PNG, JPEG y WebP se procesan localmente en este navegador. La imagen de origen no se carga ni se guarda; solo se guardan los puntos de degradado generados.",
      imageImportAction: "Generar desde imagen", imageImportBusy: "Procesando imagen...", imageImportUnsupported: "Elige una imagen PNG, JPEG o WebP.", imageImportTooLarge: "Elige una imagen de menos de 5 MB.", imageImportDecodeFailed: "No se pudo decodificar la imagen.", imageImportCanvasUnavailable: "El procesamiento de imágenes no está disponible aquí.",
      stopAriaLabel: (stopNumberLabel, positionLabel) => `Punto de degradado ${stopNumberLabel}, ${positionLabel}% restante`,
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
    mode: { label: "Modo de cor", traditional: "Tradicional", gradient: "Gradiente" },
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
    gradient: {
      label: "Gradiente restante", detail: "Clique na barra para adicionar uma parada. Selecione uma parada para editar sua posição e cor.",
      trackHelp: "Clique para adicionar uma parada de gradiente nessa porcentagem restante.",
      stopHelp: "Selecione esta parada. Use as setas para a esquerda e direita para mover paradas que não sejam extremidades.",
      positionLabel: "Posição", colorLabel: "Cor", deleteStop: "Excluir parada", resetToDefault: "Redefinir gradiente",
      endpointLocked: "As paradas das extremidades permanecem fixas em 0% e 100%.", minimumStopHelp: "Mantenha pelo menos as paradas de 0% e 100%.",
      presetsLabel: "Esquema de gradiente", presetsHelp: "Escolha um esquema local e ajuste as paradas normalmente.",
      presetNames: { warning: "Aviso", ocean: "Oceano", sunset: "Pôr do sol", meadow: "Prado", aurora: "Aurora", "calm-blue": "Azul calmo", fire: "Fogo", glacier: "Geleira", forest: "Floresta", "rose-gold": "Ouro rosé", violet: "Violeta", neon: "Néon", lake: "Lago", citrus: "Cítrico", berry: "Fruta vermelha", slate: "Ardósia" },
      customSchemeLabel: "Gradiente personalizado", imageGeneratedSchemeLabel: "Gerado da imagem", imageImportLabel: "Importar imagem",
      imageImportHelp: "Arquivos PNG, JPEG e WebP são processados localmente neste navegador. A imagem de origem não é enviada nem salva; apenas as paradas de gradiente geradas são armazenadas.",
      imageImportAction: "Gerar da imagem", imageImportBusy: "Processando imagem...", imageImportUnsupported: "Escolha uma imagem PNG, JPEG ou WebP.", imageImportTooLarge: "Escolha uma imagem com menos de 5 MB.", imageImportDecodeFailed: "Não foi possível decodificar a imagem.", imageImportCanvasUnavailable: "O processamento de imagens não está disponível aqui.",
      stopAriaLabel: (stopNumberLabel, positionLabel) => `Parada de gradiente ${stopNumberLabel}, ${positionLabel}% restante`,
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
    mode: { label: "Mode de couleur", traditional: "Traditionnel", gradient: "Dégradé" },
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
    gradient: {
      label: "Dégradé restant", detail: "Cliquez sur la barre pour ajouter un point d'arrêt. Sélectionnez un point pour modifier sa position et sa couleur.",
      trackHelp: "Cliquez pour ajouter un point d'arrêt au pourcentage restant indiqué.",
      stopHelp: "Sélectionnez ce point d'arrêt. Utilisez les flèches gauche et droite pour déplacer les points non terminaux.",
      positionLabel: "Position", colorLabel: "Couleur", deleteStop: "Supprimer le point", resetToDefault: "Réinitialiser le dégradé",
      endpointLocked: "Les points d'extrémité restent verrouillés à 0 % et 100 %.", minimumStopHelp: "Conservez au moins les points à 0 % et 100 %.",
      presetsLabel: "Palette de dégradé", presetsHelp: "Choisissez une palette locale, puis ajustez les points normalement.",
      presetNames: { warning: "Avertissement", ocean: "Océan", sunset: "Coucher de soleil", meadow: "Prairie", aurora: "Aurore", "calm-blue": "Bleu calme", fire: "Feu", glacier: "Glacier", forest: "Forêt", "rose-gold": "Or rose", violet: "Violet", neon: "Néon", lake: "Lac", citrus: "Agrumes", berry: "Baie", slate: "Ardoise" },
      customSchemeLabel: "Dégradé personnalisé", imageGeneratedSchemeLabel: "Généré depuis l'image", imageImportLabel: "Importer une image",
      imageImportHelp: "Les fichiers PNG, JPEG et WebP sont traités localement dans ce navigateur. L'image source n'est ni envoyée ni enregistrée ; seuls les points de dégradé générés sont stockés.",
      imageImportAction: "Générer depuis l'image", imageImportBusy: "Traitement de l'image...", imageImportUnsupported: "Choisissez une image PNG, JPEG ou WebP.", imageImportTooLarge: "Choisissez une image de moins de 5 Mo.", imageImportDecodeFailed: "L'image n'a pas pu être décodée.", imageImportCanvasUnavailable: "Le traitement d'image n'est pas disponible ici.",
      stopAriaLabel: (stopNumberLabel, positionLabel) => `Point d'arrêt ${stopNumberLabel}, ${positionLabel}% restant`,
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
    mode: { label: "Farbmodus", traditional: "Traditionell", gradient: "Farbverlauf" },
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
    gradient: {
      label: "Verbleibender Farbverlauf", detail: "Klicken Sie auf die Leiste, um einen Stopp hinzuzufügen. Wählen Sie einen Stopp, um Position und Farbe zu bearbeiten.",
      trackHelp: "Klicken Sie, um bei diesem verbleibenden Prozentsatz einen Farbverlaufsstopp hinzuzufügen.",
      stopHelp: "Wählen Sie diesen Stopp. Nicht-Endpunkte lassen sich mit der linken und rechten Pfeiltaste verschieben.",
      positionLabel: "Position", colorLabel: "Farbe", deleteStop: "Stopp löschen", resetToDefault: "Farbverlauf zurücksetzen",
      endpointLocked: "Endpunktstopps bleiben bei 0 % und 100 % gesperrt.", minimumStopHelp: "Behalten Sie mindestens die Stopps bei 0 % und 100 %.",
      presetsLabel: "Farbverlaufschema", presetsHelp: "Wählen Sie ein lokales Schema und passen Sie die Stopps anschließend normal an.",
      presetNames: { warning: "Warnung", ocean: "Ozean", sunset: "Sonnenuntergang", meadow: "Wiese", aurora: "Aurora", "calm-blue": "Ruhiges Blau", fire: "Feuer", glacier: "Gletscher", forest: "Wald", "rose-gold": "Roségold", violet: "Violett", neon: "Neon", lake: "See", citrus: "Zitrus", berry: "Beere", slate: "Schiefer" },
      customSchemeLabel: "Benutzerdefinierter Farbverlauf", imageGeneratedSchemeLabel: "Aus Bild generiert", imageImportLabel: "Bild importieren",
      imageImportHelp: "PNG-, JPEG- und WebP-Dateien werden lokal in diesem Browser verarbeitet. Das Quellbild wird weder hochgeladen noch gespeichert; nur die erzeugten Farbverlaufsstopps werden gespeichert.",
      imageImportAction: "Aus Bild generieren", imageImportBusy: "Bild wird verarbeitet...", imageImportUnsupported: "Wählen Sie ein PNG-, JPEG- oder WebP-Bild.", imageImportTooLarge: "Wählen Sie ein Bild unter 5 MB.", imageImportDecodeFailed: "Das Bild konnte nicht decodiert werden.", imageImportCanvasUnavailable: "Die Bildverarbeitung ist hier nicht verfügbar.",
      stopAriaLabel: (stopNumberLabel, positionLabel) => `Farbverlaufsstopp ${stopNumberLabel}, ${positionLabel}% verbleibend`,
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
    mode: { label: "Modalità colore", traditional: "Tradizionale", gradient: "Sfumatura" },
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
    gradient: {
      label: "Sfumatura rimanente", detail: "Fai clic sulla barra per aggiungere un punto. Seleziona un punto per modificarne posizione e colore.",
      trackHelp: "Fai clic per aggiungere un punto della sfumatura a quella percentuale rimanente.",
      stopHelp: "Seleziona questo punto. Usa i tasti freccia sinistra e destra per spostare i punti non terminali.",
      positionLabel: "Posizione", colorLabel: "Colore", deleteStop: "Elimina punto", resetToDefault: "Reimposta sfumatura",
      endpointLocked: "I punti terminali restano bloccati a 0% e 100%.", minimumStopHelp: "Mantieni almeno i punti a 0% e 100%.",
      presetsLabel: "Schema sfumatura", presetsHelp: "Scegli uno schema locale, quindi regola normalmente i punti.",
      presetNames: { warning: "Avviso", ocean: "Oceano", sunset: "Tramonto", meadow: "Prato", aurora: "Aurora", "calm-blue": "Blu calmo", fire: "Fuoco", glacier: "Ghiacciaio", forest: "Foresta", "rose-gold": "Oro rosa", violet: "Viola", neon: "Neon", lake: "Lago", citrus: "Agrumi", berry: "Bacca", slate: "Ardesia" },
      customSchemeLabel: "Sfumatura personalizzata", imageGeneratedSchemeLabel: "Generata dall'immagine", imageImportLabel: "Importa immagine",
      imageImportHelp: "I file PNG, JPEG e WebP vengono elaborati localmente in questo browser. L'immagine di origine non viene caricata né salvata; vengono memorizzati solo i punti della sfumatura generati.",
      imageImportAction: "Genera dall'immagine", imageImportBusy: "Elaborazione immagine...", imageImportUnsupported: "Scegli un'immagine PNG, JPEG o WebP.", imageImportTooLarge: "Scegli un'immagine inferiore a 5 MB.", imageImportDecodeFailed: "Non è stato possibile decodificare l'immagine.", imageImportCanvasUnavailable: "L'elaborazione delle immagini non è disponibile qui.",
      stopAriaLabel: (stopNumberLabel, positionLabel) => `Punto della sfumatura ${stopNumberLabel}, ${positionLabel}% residuo`,
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
    mode: { label: "Режим цвета", traditional: "Обычный", gradient: "Градиент" },
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
    gradient: {
      label: "Градиент остатка", detail: "Нажмите на полосу, чтобы добавить точку. Выберите точку для изменения ее позиции и цвета.",
      trackHelp: "Нажмите, чтобы добавить точку градиента на этом проценте остатка.",
      stopHelp: "Выберите эту точку. Используйте клавиши со стрелками влево и вправо для перемещения точек, не являющихся конечными.",
      positionLabel: "Позиция", colorLabel: "Цвет", deleteStop: "Удалить точку", resetToDefault: "Сбросить градиент",
      endpointLocked: "Конечные точки остаются заблокированными на 0% и 100%.", minimumStopHelp: "Сохраните как минимум точки 0% и 100%.",
      presetsLabel: "Схема градиента", presetsHelp: "Выберите локальную схему, затем обычным образом настройте точки.",
      presetNames: { warning: "Предупреждение", ocean: "Океан", sunset: "Закат", meadow: "Луг", aurora: "Аврора", "calm-blue": "Спокойный синий", fire: "Огонь", glacier: "Ледник", forest: "Лес", "rose-gold": "Розовое золото", violet: "Фиолетовый", neon: "Неон", lake: "Озеро", citrus: "Цитрус", berry: "Ягода", slate: "Сланец" },
      customSchemeLabel: "Пользовательский градиент", imageGeneratedSchemeLabel: "Создано из изображения", imageImportLabel: "Импортировать изображение",
      imageImportHelp: "Файлы PNG, JPEG и WebP обрабатываются локально в этом браузере. Исходное изображение не загружается и не сохраняется; сохраняются только созданные точки градиента.",
      imageImportAction: "Создать из изображения", imageImportBusy: "Обработка изображения...", imageImportUnsupported: "Выберите изображение PNG, JPEG или WebP.", imageImportTooLarge: "Выберите изображение меньше 5 МБ.", imageImportDecodeFailed: "Не удалось декодировать изображение.", imageImportCanvasUnavailable: "Обработка изображений здесь недоступна.",
      stopAriaLabel: (stopNumberLabel, positionLabel) => `Точка градиента ${stopNumberLabel}, осталось ${positionLabel}%`,
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
    mode: { label: "وضع اللون", traditional: "تقليدي", gradient: "تدرج" },
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
    gradient: {
      label: "تدرج المتبقي", detail: "انقر على الشريط لإضافة نقطة توقف. حدد نقطة توقف لتعديل موضعها ولونها.",
      trackHelp: "انقر لإضافة نقطة توقف للتدرج عند نسبة المتبقي هذه.",
      stopHelp: "حدد نقطة التوقف هذه. استخدم مفتاحي السهمين الأيسر والأيمن لتحريك نقاط التوقف غير الطرفية.",
      positionLabel: "الموضع", colorLabel: "اللون", deleteStop: "حذف نقطة التوقف", resetToDefault: "إعادة ضبط التدرج",
      endpointLocked: "تبقى نقاط التوقف الطرفية مقفلة عند 0% و100%.", minimumStopHelp: "احتفظ على الأقل بنقطتي التوقف 0% و100%.",
      presetsLabel: "نظام التدرج", presetsHelp: "اختر نظاماً محلياً ثم اضبط نقاط التوقف كالمعتاد.",
      presetNames: { warning: "تحذير", ocean: "محيط", sunset: "غروب", meadow: "مرج", aurora: "شفق", "calm-blue": "أزرق هادئ", fire: "نار", glacier: "نهر جليدي", forest: "غابة", "rose-gold": "ذهب وردي", violet: "بنفسجي", neon: "نيون", lake: "بحيرة", citrus: "حمضيات", berry: "توت", slate: "أردواز" },
      customSchemeLabel: "تدرج مخصص", imageGeneratedSchemeLabel: "مولد من صورة", imageImportLabel: "استيراد صورة",
      imageImportHelp: "تتم معالجة ملفات PNG وJPEG وWebP محلياً في هذا المتصفح. لا يتم رفع الصورة المصدر أو حفظها؛ لا تُحفظ سوى نقاط التدرج المُنشأة.",
      imageImportAction: "إنشاء من صورة", imageImportBusy: "تجري معالجة الصورة...", imageImportUnsupported: "اختر صورة PNG أو JPEG أو WebP.", imageImportTooLarge: "اختر صورة أصغر من 5 ميغابايت.", imageImportDecodeFailed: "تعذر فك ترميز الصورة.", imageImportCanvasUnavailable: "معالجة الصور غير متاحة هنا.",
      stopAriaLabel: (stopNumberLabel, positionLabel) => `نقطة توقف التدرج ${stopNumberLabel}، المتبقي ${positionLabel}%`,
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
    mode: { label: "रंग मोड", traditional: "पारंपरिक", gradient: "ग्रेडिएंट" },
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
    gradient: {
      label: "शेष ग्रेडिएंट", detail: "स्टॉप जोड़ने के लिए बार पर क्लिक करें। उसकी स्थिति और रंग संपादित करने के लिए स्टॉप चुनें।",
      trackHelp: "उस शेष प्रतिशत पर ग्रेडिएंट स्टॉप जोड़ने के लिए क्लिक करें।",
      stopHelp: "यह स्टॉप चुनें। गैर-छोर स्टॉप को स्थानांतरित करने के लिए बाएं और दाएं तीर कुंजियों का उपयोग करें।",
      positionLabel: "स्थिति", colorLabel: "रंग", deleteStop: "स्टॉप हटाएं", resetToDefault: "ग्रेडिएंट रीसेट करें",
      endpointLocked: "छोर वाले स्टॉप 0% और 100% पर लॉक रहते हैं।", minimumStopHelp: "कम से कम 0% और 100% वाले स्टॉप रखें।",
      presetsLabel: "ग्रेडिएंट योजना", presetsHelp: "स्थानीय योजना चुनें, फिर स्टॉप को सामान्य रूप से समायोजित करें।",
      presetNames: { warning: "चेतावनी", ocean: "महासागर", sunset: "सूर्यास्त", meadow: "घास का मैदान", aurora: "ऑरोरा", "calm-blue": "शांत नीला", fire: "अग्नि", glacier: "हिमनद", forest: "जंगल", "rose-gold": "रोज़ गोल्ड", violet: "बैंगनी", neon: "नियॉन", lake: "झील", citrus: "खट्टे फल", berry: "बेरी", slate: "स्लेट" },
      customSchemeLabel: "कस्टम ग्रेडिएंट", imageGeneratedSchemeLabel: "छवि से बनाया गया", imageImportLabel: "छवि आयात करें",
      imageImportHelp: "PNG, JPEG और WebP फ़ाइलें इस ब्राउज़र में स्थानीय रूप से संसाधित होती हैं। स्रोत छवि अपलोड या सहेजी नहीं जाती; केवल बनाए गए ग्रेडिएंट स्टॉप सहेजे जाते हैं।",
      imageImportAction: "छवि से बनाएं", imageImportBusy: "छवि संसाधित हो रही है...", imageImportUnsupported: "PNG, JPEG या WebP छवि चुनें।", imageImportTooLarge: "5 MB से छोटी छवि चुनें।", imageImportDecodeFailed: "छवि को डिकोड नहीं किया जा सका।", imageImportCanvasUnavailable: "यहां छवि संसाधन उपलब्ध नहीं है।",
      stopAriaLabel: (stopNumberLabel, positionLabel) => `ग्रेडिएंट स्टॉप ${stopNumberLabel}, ${positionLabel}% शेष`,
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
    mode: { label: "Mode warna", traditional: "Tradisional", gradient: "Gradien" },
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
    gradient: {
      label: "Gradien tersisa", detail: "Klik bilah untuk menambahkan titik henti. Pilih titik henti untuk mengubah posisi dan warnanya.",
      trackHelp: "Klik untuk menambahkan titik henti gradien pada persentase tersisa tersebut.",
      stopHelp: "Pilih titik henti ini. Gunakan tombol panah kiri dan kanan untuk memindahkan titik henti yang bukan ujung.",
      positionLabel: "Posisi", colorLabel: "Warna", deleteStop: "Hapus titik henti", resetToDefault: "Atur ulang gradien",
      endpointLocked: "Titik henti ujung tetap terkunci pada 0% dan 100%.", minimumStopHelp: "Pertahankan setidaknya titik henti 0% dan 100%.",
      presetsLabel: "Skema gradien", presetsHelp: "Pilih skema lokal, lalu sesuaikan titik henti seperti biasa.",
      presetNames: { warning: "Peringatan", ocean: "Samudra", sunset: "Matahari terbenam", meadow: "Padang rumput", aurora: "Aurora", "calm-blue": "Biru tenang", fire: "Api", glacier: "Gletser", forest: "Hutan", "rose-gold": "Emas mawar", violet: "Ungu", neon: "Neon", lake: "Danau", citrus: "Jeruk", berry: "Beri", slate: "Batu tulis" },
      customSchemeLabel: "Gradien kustom", imageGeneratedSchemeLabel: "Dihasilkan dari gambar", imageImportLabel: "Impor gambar",
      imageImportHelp: "File PNG, JPEG, dan WebP diproses secara lokal di browser ini. Gambar sumber tidak diunggah atau disimpan; hanya titik henti gradien yang dihasilkan yang disimpan.",
      imageImportAction: "Buat dari gambar", imageImportBusy: "Memproses gambar...", imageImportUnsupported: "Pilih gambar PNG, JPEG, atau WebP.", imageImportTooLarge: "Pilih gambar di bawah 5 MB.", imageImportDecodeFailed: "Gambar tidak dapat didekode.", imageImportCanvasUnavailable: "Pemrosesan gambar tidak tersedia di sini.",
      stopAriaLabel: (stopNumberLabel, positionLabel) => `Titik henti gradien ${stopNumberLabel}, ${positionLabel}% tersisa`,
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
    mode: copy.mode,
    colorBands: {
      ...copy.colorBands,
      rangeLabel: (minimumPercent, maximumPercent) =>
        copy.colorBands.rangeLabel(
          i18n.formatNumber(minimumPercent),
          i18n.formatNumber(maximumPercent),
        ),
    },
    gradient: {
      ...copy.gradient,
      stopAriaLabel: (stopNumber, positionPercent) =>
        copy.gradient.stopAriaLabel(
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
