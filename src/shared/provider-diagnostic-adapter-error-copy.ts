import type {
  ProviderDiagnostic,
  ProviderDiagnosticParams,
  ProviderSourceKind,
} from "../providers/types";
import type { ResolvedAppLocale, RuntimeI18n } from "./i18n";
import type { ProviderDiagnosticPresentation } from "./provider-diagnostic-presentation";

type AdapterErrorDiagnosticCode =
  | "adapter.unexpected_error"
  | "adapter.unsupported_response"
  | "adapter.parse_failed";

type AdapterErrorDiagnosticCopy = {
  sourceKinds: Record<ProviderSourceKind | "current", string>;
  labels: Record<AdapterErrorDiagnosticCode, string>;
  parseFailedSummary: (sourceKind: string) => string;
  unsupportedResponseSummary: (sourceKind: string) => string;
  unexpectedErrorSummary: (sourceKind: string) => string;
};

function getStringParam(
  params: ProviderDiagnosticParams | undefined,
  key: string,
): string | null {
  const value = params?.[key];
  const normalizedValue = typeof value === "string" ? value.trim() : "";

  return normalizedValue ? normalizedValue : null;
}

function getSourceKindParam(
  params: ProviderDiagnosticParams | undefined,
  key: string,
): ProviderSourceKind | null {
  const value = getStringParam(params, key);

  if (
    value === "official_api" ||
    value === "session_page" ||
    value === "policy_only"
  ) {
    return value;
  }

  return null;
}

const ADAPTER_ERROR_COPY: Record<ResolvedAppLocale, AdapterErrorDiagnosticCopy> = {
  en: {
    sourceKinds: {
      official_api: "Official API",
      session_page: "Session page",
      policy_only: "Policy only",
      current: "current source",
    },
    labels: {
      "adapter.unexpected_error": "Adapter unexpected error",
      "adapter.unsupported_response": "Unsupported adapter response",
      "adapter.parse_failed": "Adapter parse failed",
    },
    parseFailedSummary: (sourceKind) =>
      `${sourceKind} parsing failed; keep the raw diagnostic body for parser or route review.`,
    unsupportedResponseSummary: (sourceKind) =>
      `${sourceKind} returned a response this adapter does not support; keep the raw diagnostic body for compatibility review.`,
    unexpectedErrorSummary: (sourceKind) =>
      `${sourceKind} hit an unexpected adapter error; keep the raw diagnostic body for review.`,
  },
  "zh-CN": {
    sourceKinds: {
      official_api: "官方 API",
      session_page: "会话页面",
      policy_only: "仅策略",
      current: "当前来源",
    },
    labels: {
      "adapter.unexpected_error": "适配器意外错误",
      "adapter.unsupported_response": "不支持的适配器响应",
      "adapter.parse_failed": "适配器解析失败",
    },
    parseFailedSummary: (sourceKind) =>
      `${sourceKind}解析失败；保留 raw diagnostic body 用于 parser 或 route 检查。`,
    unsupportedResponseSummary: (sourceKind) =>
      `${sourceKind}返回了当前适配器不支持的响应；保留 raw diagnostic body 用于兼容性检查。`,
    unexpectedErrorSummary: (sourceKind) =>
      `${sourceKind}出现非预期适配器错误；保留 raw diagnostic body 用于排查。`,
  },
  "zh-TW": {
    sourceKinds: {
      official_api: "官方 API",
      session_page: "會話頁面",
      policy_only: "僅策略",
      current: "目前來源",
    },
    labels: {
      "adapter.unexpected_error": "適配器意外錯誤",
      "adapter.unsupported_response": "不支援的適配器回應",
      "adapter.parse_failed": "適配器解析失敗",
    },
    parseFailedSummary: (sourceKind) =>
      `${sourceKind}解析失敗；保留 raw diagnostic body 供 parser 或 route 檢查。`,
    unsupportedResponseSummary: (sourceKind) =>
      `${sourceKind}回傳了目前適配器不支援的回應；保留 raw diagnostic body 供相容性檢查。`,
    unexpectedErrorSummary: (sourceKind) =>
      `${sourceKind}發生非預期適配器錯誤；保留 raw diagnostic body 供排查。`,
  },
  ja: {
    sourceKinds: {
      official_api: "公式API",
      session_page: "セッションページ",
      policy_only: "ポリシーのみ",
      current: "現在のソース",
    },
    labels: {
      "adapter.unexpected_error": "アダプターの予期しないエラー",
      "adapter.unsupported_response": "未対応のアダプター応答",
      "adapter.parse_failed": "アダプター解析失敗",
    },
    parseFailedSummary: (sourceKind) =>
      `${sourceKind}の解析に失敗しました。parserまたはroute確認のためraw diagnostic bodyを保持します。`,
    unsupportedResponseSummary: (sourceKind) =>
      `${sourceKind}はこのアダプターが対応していない応答を返しました。互換性確認のためraw diagnostic bodyを保持します。`,
    unexpectedErrorSummary: (sourceKind) =>
      `${sourceKind}で予期しないアダプターエラーが発生しました。確認のためraw diagnostic bodyを保持します。`,
  },
  ko: {
    sourceKinds: {
      official_api: "공식 API",
      session_page: "세션 페이지",
      policy_only: "정책만",
      current: "현재 소스",
    },
    labels: {
      "adapter.unexpected_error": "어댑터 예상치 못한 오류",
      "adapter.unsupported_response": "지원되지 않는 어댑터 응답",
      "adapter.parse_failed": "어댑터 파싱 실패",
    },
    parseFailedSummary: (sourceKind) =>
      `${sourceKind} 파싱에 실패했습니다. parser 또는 route 검토를 위해 raw diagnostic body를 유지합니다.`,
    unsupportedResponseSummary: (sourceKind) =>
      `${sourceKind}이(가) 이 어댑터가 지원하지 않는 응답을 반환했습니다. 호환성 검토를 위해 raw diagnostic body를 유지합니다.`,
    unexpectedErrorSummary: (sourceKind) =>
      `${sourceKind}에서 예상치 못한 어댑터 오류가 발생했습니다. 검토를 위해 raw diagnostic body를 유지합니다.`,
  },
  "es-419": {
    sourceKinds: {
      official_api: "API oficial",
      session_page: "Página de sesión",
      policy_only: "Solo política",
      current: "fuente actual",
    },
    labels: {
      "adapter.unexpected_error": "Error inesperado del adaptador",
      "adapter.unsupported_response": "Respuesta de adaptador no compatible",
      "adapter.parse_failed": "Error de parseo del adaptador",
    },
    parseFailedSummary: (sourceKind) =>
      `Falló el parseo de ${sourceKind}; conserva el raw diagnostic body para revisar parser o route.`,
    unsupportedResponseSummary: (sourceKind) =>
      `${sourceKind} devolvió una respuesta que este adaptador no soporta; conserva el raw diagnostic body para revisar compatibilidad.`,
    unexpectedErrorSummary: (sourceKind) =>
      `${sourceKind} encontró un error inesperado del adaptador; conserva el raw diagnostic body para revisión.`,
  },
  "pt-BR": {
    sourceKinds: {
      official_api: "API oficial",
      session_page: "Página de sessão",
      policy_only: "Somente política",
      current: "fonte atual",
    },
    labels: {
      "adapter.unexpected_error": "Erro inesperado do adaptador",
      "adapter.unsupported_response": "Resposta do adaptador sem suporte",
      "adapter.parse_failed": "Falha de parsing do adaptador",
    },
    parseFailedSummary: (sourceKind) =>
      `O parsing de ${sourceKind} falhou; mantenha o raw diagnostic body para revisar parser ou route.`,
    unsupportedResponseSummary: (sourceKind) =>
      `${sourceKind} retornou uma resposta que este adaptador não suporta; mantenha o raw diagnostic body para revisão de compatibilidade.`,
    unexpectedErrorSummary: (sourceKind) =>
      `${sourceKind} encontrou um erro inesperado do adaptador; mantenha o raw diagnostic body para revisão.`,
  },
  fr: {
    sourceKinds: {
      official_api: "API officielle",
      session_page: "Page de session",
      policy_only: "Politique seulement",
      current: "source actuelle",
    },
    labels: {
      "adapter.unexpected_error": "Erreur inattendue de l'adaptateur",
      "adapter.unsupported_response": "Réponse d'adaptateur non prise en charge",
      "adapter.parse_failed": "Échec de parsing de l'adaptateur",
    },
    parseFailedSummary: (sourceKind) =>
      `Le parsing de ${sourceKind} a échoué; conservez le raw diagnostic body pour vérifier le parser ou la route.`,
    unsupportedResponseSummary: (sourceKind) =>
      `${sourceKind} a renvoyé une réponse non prise en charge par cet adaptateur; conservez le raw diagnostic body pour vérifier la compatibilité.`,
    unexpectedErrorSummary: (sourceKind) =>
      `${sourceKind} a rencontré une erreur inattendue de l'adaptateur; conservez le raw diagnostic body pour vérification.`,
  },
  de: {
    sourceKinds: {
      official_api: "Offizielle API",
      session_page: "Sitzungsseite",
      policy_only: "Nur Richtlinie",
      current: "aktuelle Quelle",
    },
    labels: {
      "adapter.unexpected_error": "Unerwarteter Adapterfehler",
      "adapter.unsupported_response": "Nicht unterstützte Adapterantwort",
      "adapter.parse_failed": "Adapter-Parsing fehlgeschlagen",
    },
    parseFailedSummary: (sourceKind) =>
      `${sourceKind}-Parsing ist fehlgeschlagen; behalte den raw diagnostic body für Parser- oder route-Prüfung.`,
    unsupportedResponseSummary: (sourceKind) =>
      `${sourceKind} gab eine Antwort zurück, die dieser Adapter nicht unterstützt; behalte den raw diagnostic body für Kompatibilitätsprüfung.`,
    unexpectedErrorSummary: (sourceKind) =>
      `${sourceKind} hatte einen unerwarteten Adapterfehler; behalte den raw diagnostic body für die Prüfung.`,
  },
  it: {
    sourceKinds: {
      official_api: "API ufficiale",
      session_page: "Pagina di sessione",
      policy_only: "Solo policy",
      current: "fonte corrente",
    },
    labels: {
      "adapter.unexpected_error": "Errore inatteso dell'adapter",
      "adapter.unsupported_response": "Risposta adapter non supportata",
      "adapter.parse_failed": "Parsing dell'adapter non riuscito",
    },
    parseFailedSummary: (sourceKind) =>
      `Il parsing di ${sourceKind} non è riuscito; conserva il raw diagnostic body per verificare parser o route.`,
    unsupportedResponseSummary: (sourceKind) =>
      `${sourceKind} ha restituito una risposta non supportata da questo adapter; conserva il raw diagnostic body per la revisione di compatibilità.`,
    unexpectedErrorSummary: (sourceKind) =>
      `${sourceKind} ha incontrato un errore inatteso dell'adapter; conserva il raw diagnostic body per la revisione.`,
  },
  ru: {
    sourceKinds: {
      official_api: "Официальный API",
      session_page: "Страница сессии",
      policy_only: "Только политика",
      current: "текущий источник",
    },
    labels: {
      "adapter.unexpected_error": "Неожиданная ошибка адаптера",
      "adapter.unsupported_response": "Неподдерживаемый ответ адаптера",
      "adapter.parse_failed": "Ошибка парсинга адаптера",
    },
    parseFailedSummary: (sourceKind) =>
      `Парсинг ${sourceKind} не удался; сохраните raw diagnostic body для проверки parser или route.`,
    unsupportedResponseSummary: (sourceKind) =>
      `${sourceKind} вернул ответ, который этот адаптер не поддерживает; сохраните raw diagnostic body для проверки совместимости.`,
    unexpectedErrorSummary: (sourceKind) =>
      `${sourceKind} столкнулся с неожиданной ошибкой адаптера; сохраните raw diagnostic body для проверки.`,
  },
  ar: {
    sourceKinds: {
      official_api: "واجهة API الرسمية",
      session_page: "صفحة الجلسة",
      policy_only: "سياسة فقط",
      current: "المصدر الحالي",
    },
    labels: {
      "adapter.unexpected_error": "خطأ غير متوقع في المحول",
      "adapter.unsupported_response": "استجابة محول غير مدعومة",
      "adapter.parse_failed": "فشل تحليل المحول",
    },
    parseFailedSummary: (sourceKind) =>
      `فشل تحليل ${sourceKind}؛ احتفظ بـ raw diagnostic body لمراجعة parser أو route.`,
    unsupportedResponseSummary: (sourceKind) =>
      `أرجع ${sourceKind} استجابة لا يدعمها هذا المحول؛ احتفظ بـ raw diagnostic body لمراجعة التوافق.`,
    unexpectedErrorSummary: (sourceKind) =>
      `واجه ${sourceKind} خطأ غير متوقع في المحول؛ احتفظ بـ raw diagnostic body للمراجعة.`,
  },
  hi: {
    sourceKinds: {
      official_api: "आधिकारिक API",
      session_page: "सेशन पेज",
      policy_only: "केवल policy",
      current: "मौजूदा source",
    },
    labels: {
      "adapter.unexpected_error": "Adapter में अनपेक्षित त्रुटि",
      "adapter.unsupported_response": "असमर्थित adapter response",
      "adapter.parse_failed": "Adapter parsing विफल",
    },
    parseFailedSummary: (sourceKind) =>
      `${sourceKind} parsing विफल हुआ; parser या route review के लिए raw diagnostic body रखें.`,
    unsupportedResponseSummary: (sourceKind) =>
      `${sourceKind} ने ऐसा response लौटाया जिसे यह adapter support नहीं करता; compatibility review के लिए raw diagnostic body रखें.`,
    unexpectedErrorSummary: (sourceKind) =>
      `${sourceKind} में unexpected adapter error आया; review के लिए raw diagnostic body रखें.`,
  },
  id: {
    sourceKinds: {
      official_api: "API resmi",
      session_page: "Halaman sesi",
      policy_only: "Hanya policy",
      current: "source saat ini",
    },
    labels: {
      "adapter.unexpected_error": "Error adapter tidak terduga",
      "adapter.unsupported_response": "Respons adapter tidak didukung",
      "adapter.parse_failed": "Parsing adapter gagal",
    },
    parseFailedSummary: (sourceKind) =>
      `Parsing ${sourceKind} gagal; simpan raw diagnostic body untuk review parser atau route.`,
    unsupportedResponseSummary: (sourceKind) =>
      `${sourceKind} mengembalikan respons yang tidak didukung adapter ini; simpan raw diagnostic body untuk review kompatibilitas.`,
    unexpectedErrorSummary: (sourceKind) =>
      `${sourceKind} mengalami error adapter tidak terduga; simpan raw diagnostic body untuk review.`,
  },
};

function getCopy(i18n: RuntimeI18n): AdapterErrorDiagnosticCopy {
  return ADAPTER_ERROR_COPY[i18n.resolvedLocale];
}

function formatSourceKindLabel(
  sourceKind: ProviderSourceKind | null,
  copy: AdapterErrorDiagnosticCopy,
): string {
  return sourceKind ? copy.sourceKinds[sourceKind] : copy.sourceKinds.current;
}

export function getAdapterErrorDiagnosticPresentation(
  diagnostic: ProviderDiagnostic,
  i18n: RuntimeI18n,
): ProviderDiagnosticPresentation | null {
  const copy = getCopy(i18n);
  const sourceKindLabel = formatSourceKindLabel(
    getSourceKindParam(diagnostic.params, "sourceKind"),
    copy,
  );

  switch (diagnostic.code as AdapterErrorDiagnosticCode) {
    case "adapter.parse_failed":
      return {
        label: copy.labels["adapter.parse_failed"],
        summary: copy.parseFailedSummary(sourceKindLabel),
      };
    case "adapter.unsupported_response":
      return {
        label: copy.labels["adapter.unsupported_response"],
        summary: copy.unsupportedResponseSummary(sourceKindLabel),
      };
    case "adapter.unexpected_error":
      return {
        label: copy.labels["adapter.unexpected_error"],
        summary: copy.unexpectedErrorSummary(sourceKindLabel),
      };
    default:
      return null;
  }
}
