import type {
  ProviderDiagnostic,
  ProviderDiagnosticParams,
  ProviderSourceKind,
  ProviderSourcePreference,
} from "../providers/types";
import type { ResolvedAppLocale, RuntimeI18n } from "./i18n";
import type { ProviderDiagnosticPresentation } from "./provider-diagnostic-presentation";

type SourceDiagnosticCode =
  | "source.auto_selected_official_api"
  | "source.auto_selected_session_page"
  | "source.preference_selected_official_api"
  | "source.preference_selected_session_page"
  | "source.official_api_missing_credential"
  | "source.official_api_failed"
  | "source.session_page_unavailable"
  | "source.no_live_path";

type SourceLabels = {
  sourceKinds: Record<ProviderSourceKind | "current", string>;
  sourcePreferences: Record<ProviderSourcePreference, string>;
  autoSelectedOfficialApi: string;
  autoSelectedSessionPage: string;
  autoFellBackToSessionPage: string;
  preferredOfficialApiSelected: string;
  preferredSessionPageSelected: string;
  officialApiCredentialMissing: string;
  officialApiFailed: string;
  sessionPageUnavailable: string;
  noLiveSourcePath: string;
};

type SourceDiagnosticCopy = SourceLabels & {
  autoSelectedAfterFallback: (selectedKind: string) => string;
  autoSelected: (selectedKind: string) => string;
  preferenceSelected: (preference: string, selectedKind: string) => string;
  officialApiMissingCredentialSummary: string;
  officialApiFailedSummary: string;
  sessionPageUnavailableSummary: string;
  noLivePathWithFailures: (failureCount: string) => string;
  noLivePathFallback: string;
};

function getNumberParam(
  params: ProviderDiagnosticParams | undefined,
  key: string,
): number | null {
  const value = params?.[key];

  return typeof value === "number" ? value : null;
}

function getStringParam(
  params: ProviderDiagnosticParams | undefined,
  key: string,
): string | null {
  const value = params?.[key];
  const normalizedValue = typeof value === "string" ? value.trim() : "";

  return normalizedValue ? normalizedValue : null;
}

function getBooleanParam(
  params: ProviderDiagnosticParams | undefined,
  key: string,
): boolean | null {
  const value = params?.[key];

  return typeof value === "boolean" ? value : null;
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

function getSourcePreferenceParam(
  params: ProviderDiagnosticParams | undefined,
  key: string,
): ProviderSourcePreference | null {
  const value = getStringParam(params, key);

  if (
    value === "auto" ||
    value === "official_api" ||
    value === "session_page"
  ) {
    return value;
  }

  return null;
}

const SOURCE_DIAGNOSTIC_COPY: Record<ResolvedAppLocale, SourceDiagnosticCopy> = {
  en: {
    sourceKinds: {
      official_api: "Official API",
      session_page: "Session page",
      policy_only: "Policy only",
      current: "current source",
    },
    sourcePreferences: {
      auto: "Auto",
      official_api: "Official API",
      session_page: "Session page",
    },
    autoSelectedOfficialApi: "Auto selected Official API",
    autoSelectedSessionPage: "Auto selected Session page",
    autoFellBackToSessionPage: "Auto fell back to Session page",
    preferredOfficialApiSelected: "Preferred Official API selected",
    preferredSessionPageSelected: "Preferred Session page selected",
    officialApiCredentialMissing: "Official API credential missing",
    officialApiFailed: "Official API failed",
    sessionPageUnavailable: "Session page unavailable",
    noLiveSourcePath: "No live source path",
    autoSelectedAfterFallback: (selectedKind) =>
      `Auto preference selected ${selectedKind} after an earlier source failed.`,
    autoSelected: (selectedKind) => `Auto preference selected ${selectedKind}.`,
    preferenceSelected: (preference, selectedKind) =>
      `${preference} preference selected ${selectedKind}.`,
    officialApiMissingCredentialSummary:
      "The Official API source could not run because its required credential is missing.",
    officialApiFailedSummary:
      "The Official API source failed; keep the raw fallback reason for evidence review.",
    sessionPageUnavailableSummary:
      "The logged-in session-page source could not provide a usable snapshot.",
    noLivePathWithFailures: (failureCount) =>
      `${failureCount} source attempts failed; no live source is available.`,
    noLivePathFallback: "No live source is available.",
  },
  "zh-CN": {
    sourceKinds: {
      official_api: "官方 API",
      session_page: "会话页面",
      policy_only: "仅策略",
      current: "当前来源",
    },
    sourcePreferences: {
      auto: "自动",
      official_api: "官方 API",
      session_page: "会话页面",
    },
    autoSelectedOfficialApi: "自动选择官方 API",
    autoSelectedSessionPage: "自动选择会话页面",
    autoFellBackToSessionPage: "自动回退到会话页面",
    preferredOfficialApiSelected: "偏好选择官方 API",
    preferredSessionPageSelected: "偏好选择会话页面",
    officialApiCredentialMissing: "官方 API 缺少凭据",
    officialApiFailed: "官方 API 失败",
    sessionPageUnavailable: "会话页面不可用",
    noLiveSourcePath: "无 live source path",
    autoSelectedAfterFallback: (selectedKind) =>
      `自动偏好在前置来源不可用后选择了${selectedKind}。`,
    autoSelected: (selectedKind) => `自动偏好选择了${selectedKind}。`,
    preferenceSelected: (preference, selectedKind) =>
      `${preference}偏好选择了${selectedKind}。`,
    officialApiMissingCredentialSummary: "官方 API 来源缺少所需凭据，无法运行。",
    officialApiFailedSummary:
      "官方 API 来源失败；保留 raw fallback reason 用于证据检查。",
    sessionPageUnavailableSummary: "已登录会话页面来源无法提供可用快照。",
    noLivePathWithFailures: (failureCount) =>
      `${failureCount} 个来源尝试失败；当前没有可用 live source。`,
    noLivePathFallback: "当前没有可用 live source。",
  },
  "zh-TW": {
    sourceKinds: {
      official_api: "官方 API",
      session_page: "會話頁面",
      policy_only: "僅策略",
      current: "目前來源",
    },
    sourcePreferences: {
      auto: "自動",
      official_api: "官方 API",
      session_page: "會話頁面",
    },
    autoSelectedOfficialApi: "自動選擇官方 API",
    autoSelectedSessionPage: "自動選擇會話頁面",
    autoFellBackToSessionPage: "自動回退到會話頁面",
    preferredOfficialApiSelected: "偏好選擇官方 API",
    preferredSessionPageSelected: "偏好選擇會話頁面",
    officialApiCredentialMissing: "官方 API 缺少憑據",
    officialApiFailed: "官方 API 失敗",
    sessionPageUnavailable: "會話頁面不可用",
    noLiveSourcePath: "無 live source path",
    autoSelectedAfterFallback: (selectedKind) =>
      `自動偏好在前一個來源不可用後選擇了${selectedKind}。`,
    autoSelected: (selectedKind) => `自動偏好選擇了${selectedKind}。`,
    preferenceSelected: (preference, selectedKind) =>
      `${preference}偏好選擇了${selectedKind}。`,
    officialApiMissingCredentialSummary: "官方 API 來源缺少必要憑據，無法執行。",
    officialApiFailedSummary:
      "官方 API 來源失敗；保留 raw fallback reason 供證據檢查。",
    sessionPageUnavailableSummary: "已登入的會話頁面來源無法提供可用快照。",
    noLivePathWithFailures: (failureCount) =>
      `${failureCount} 個來源嘗試失敗；目前沒有可用 live source。`,
    noLivePathFallback: "目前沒有可用 live source。",
  },
  ja: {
    sourceKinds: {
      official_api: "公式API",
      session_page: "セッションページ",
      policy_only: "ポリシーのみ",
      current: "現在のソース",
    },
    sourcePreferences: {
      auto: "自動",
      official_api: "公式API",
      session_page: "セッションページ",
    },
    autoSelectedOfficialApi: "自動で公式APIを選択",
    autoSelectedSessionPage: "自動でセッションページを選択",
    autoFellBackToSessionPage: "自動でセッションページへフォールバック",
    preferredOfficialApiSelected: "優先設定で公式APIを選択",
    preferredSessionPageSelected: "優先設定でセッションページを選択",
    officialApiCredentialMissing: "公式APIの認証情報がありません",
    officialApiFailed: "公式APIが失敗",
    sessionPageUnavailable: "セッションページを利用できません",
    noLiveSourcePath: "live source pathなし",
    autoSelectedAfterFallback: (selectedKind) =>
      `前のソースが利用できないため、自動設定は${selectedKind}を選択しました。`,
    autoSelected: (selectedKind) => `自動設定は${selectedKind}を選択しました。`,
    preferenceSelected: (preference, selectedKind) =>
      `${preference}設定は${selectedKind}を選択しました。`,
    officialApiMissingCredentialSummary:
      "公式APIソースは必要な認証情報がないため実行できませんでした。",
    officialApiFailedSummary:
      "公式APIソースが失敗しました。証拠確認のためraw fallback reasonを保持します。",
    sessionPageUnavailableSummary:
      "ログイン済みセッションページソースは利用可能なスナップショットを提供できませんでした。",
    noLivePathWithFailures: (failureCount) =>
      `${failureCount}件のソース試行が失敗しました。利用可能なlive sourceはありません。`,
    noLivePathFallback: "利用可能なlive sourceはありません。",
  },
  ko: {
    sourceKinds: {
      official_api: "공식 API",
      session_page: "세션 페이지",
      policy_only: "정책만",
      current: "현재 소스",
    },
    sourcePreferences: {
      auto: "자동",
      official_api: "공식 API",
      session_page: "세션 페이지",
    },
    autoSelectedOfficialApi: "자동으로 공식 API 선택",
    autoSelectedSessionPage: "자동으로 세션 페이지 선택",
    autoFellBackToSessionPage: "자동으로 세션 페이지로 fallback",
    preferredOfficialApiSelected: "선호 설정으로 공식 API 선택",
    preferredSessionPageSelected: "선호 설정으로 세션 페이지 선택",
    officialApiCredentialMissing: "공식 API credential 없음",
    officialApiFailed: "공식 API 실패",
    sessionPageUnavailable: "세션 페이지 사용 불가",
    noLiveSourcePath: "live source path 없음",
    autoSelectedAfterFallback: (selectedKind) =>
      `이전 소스를 사용할 수 없어 자동 선호가 ${selectedKind}을(를) 선택했습니다.`,
    autoSelected: (selectedKind) => `자동 선호가 ${selectedKind}을(를) 선택했습니다.`,
    preferenceSelected: (preference, selectedKind) =>
      `${preference} 선호가 ${selectedKind}을(를) 선택했습니다.`,
    officialApiMissingCredentialSummary:
      "공식 API 소스는 필요한 credential이 없어 실행할 수 없습니다.",
    officialApiFailedSummary:
      "공식 API 소스가 실패했습니다. 증거 검토를 위해 raw fallback reason을 유지합니다.",
    sessionPageUnavailableSummary:
      "로그인된 세션 페이지 소스가 사용 가능한 스냅샷을 제공하지 못했습니다.",
    noLivePathWithFailures: (failureCount) =>
      `${failureCount}개의 소스 시도가 실패했습니다. 사용할 수 있는 live source가 없습니다.`,
    noLivePathFallback: "사용할 수 있는 live source가 없습니다.",
  },
  "es-419": {
    sourceKinds: {
      official_api: "API oficial",
      session_page: "Página de sesión",
      policy_only: "Solo política",
      current: "fuente actual",
    },
    sourcePreferences: {
      auto: "Auto",
      official_api: "API oficial",
      session_page: "Página de sesión",
    },
    autoSelectedOfficialApi: "Auto seleccionó API oficial",
    autoSelectedSessionPage: "Auto seleccionó página de sesión",
    autoFellBackToSessionPage: "Auto volvió a página de sesión",
    preferredOfficialApiSelected: "API oficial preferida seleccionada",
    preferredSessionPageSelected: "Página de sesión preferida seleccionada",
    officialApiCredentialMissing: "Falta credencial de API oficial",
    officialApiFailed: "Falló la API oficial",
    sessionPageUnavailable: "Página de sesión no disponible",
    noLiveSourcePath: "Sin live source path",
    autoSelectedAfterFallback: (selectedKind) =>
      `La preferencia Auto seleccionó ${selectedKind} después de que falló una fuente anterior.`,
    autoSelected: (selectedKind) =>
      `La preferencia Auto seleccionó ${selectedKind}.`,
    preferenceSelected: (preference, selectedKind) =>
      `La preferencia ${preference} seleccionó ${selectedKind}.`,
    officialApiMissingCredentialSummary:
      "La fuente de API oficial no pudo ejecutarse porque falta la credencial requerida.",
    officialApiFailedSummary:
      "La fuente de API oficial falló; conserva el raw fallback reason para revisar evidencia.",
    sessionPageUnavailableSummary:
      "La fuente de página de sesión con sesión iniciada no pudo entregar un snapshot usable.",
    noLivePathWithFailures: (failureCount) =>
      `${failureCount} intentos de fuente fallaron; no hay live source disponible.`,
    noLivePathFallback: "No hay live source disponible.",
  },
  "pt-BR": {
    sourceKinds: {
      official_api: "API oficial",
      session_page: "Página de sessão",
      policy_only: "Somente política",
      current: "fonte atual",
    },
    sourcePreferences: {
      auto: "Auto",
      official_api: "API oficial",
      session_page: "Página de sessão",
    },
    autoSelectedOfficialApi: "Auto selecionou API oficial",
    autoSelectedSessionPage: "Auto selecionou página de sessão",
    autoFellBackToSessionPage: "Auto voltou para página de sessão",
    preferredOfficialApiSelected: "API oficial preferida selecionada",
    preferredSessionPageSelected: "Página de sessão preferida selecionada",
    officialApiCredentialMissing: "Credencial da API oficial ausente",
    officialApiFailed: "API oficial falhou",
    sessionPageUnavailable: "Página de sessão indisponível",
    noLiveSourcePath: "Sem live source path",
    autoSelectedAfterFallback: (selectedKind) =>
      `A preferência Auto selecionou ${selectedKind} depois que uma fonte anterior falhou.`,
    autoSelected: (selectedKind) => `A preferência Auto selecionou ${selectedKind}.`,
    preferenceSelected: (preference, selectedKind) =>
      `A preferência ${preference} selecionou ${selectedKind}.`,
    officialApiMissingCredentialSummary:
      "A fonte de API oficial não pôde executar porque a credencial necessária está ausente.",
    officialApiFailedSummary:
      "A fonte de API oficial falhou; mantenha o raw fallback reason para revisão de evidências.",
    sessionPageUnavailableSummary:
      "A fonte de página de sessão autenticada não pôde fornecer um snapshot utilizável.",
    noLivePathWithFailures: (failureCount) =>
      `${failureCount} tentativas de fonte falharam; nenhum live source está disponível.`,
    noLivePathFallback: "Nenhum live source está disponível.",
  },
  fr: {
    sourceKinds: {
      official_api: "API officielle",
      session_page: "Page de session",
      policy_only: "Politique seulement",
      current: "source actuelle",
    },
    sourcePreferences: {
      auto: "Auto",
      official_api: "API officielle",
      session_page: "Page de session",
    },
    autoSelectedOfficialApi: "Auto a sélectionné l'API officielle",
    autoSelectedSessionPage: "Auto a sélectionné la page de session",
    autoFellBackToSessionPage: "Auto est revenu à la page de session",
    preferredOfficialApiSelected: "API officielle préférée sélectionnée",
    preferredSessionPageSelected: "Page de session préférée sélectionnée",
    officialApiCredentialMissing: "Identifiant d'API officielle manquant",
    officialApiFailed: "Échec de l'API officielle",
    sessionPageUnavailable: "Page de session indisponible",
    noLiveSourcePath: "Aucun live source path",
    autoSelectedAfterFallback: (selectedKind) =>
      `La préférence Auto a sélectionné ${selectedKind} après l'échec d'une source précédente.`,
    autoSelected: (selectedKind) =>
      `La préférence Auto a sélectionné ${selectedKind}.`,
    preferenceSelected: (preference, selectedKind) =>
      `La préférence ${preference} a sélectionné ${selectedKind}.`,
    officialApiMissingCredentialSummary:
      "La source d'API officielle n'a pas pu s'exécuter car l'identifiant requis est manquant.",
    officialApiFailedSummary:
      "La source d'API officielle a échoué; conservez le raw fallback reason pour vérifier les preuves.",
    sessionPageUnavailableSummary:
      "La source de page de session connectée n'a pas pu fournir de snapshot utilisable.",
    noLivePathWithFailures: (failureCount) =>
      `${failureCount} tentatives de source ont échoué; aucun live source n'est disponible.`,
    noLivePathFallback: "Aucun live source n'est disponible.",
  },
  de: {
    sourceKinds: {
      official_api: "Offizielle API",
      session_page: "Sitzungsseite",
      policy_only: "Nur Richtlinie",
      current: "aktuelle Quelle",
    },
    sourcePreferences: {
      auto: "Auto",
      official_api: "Offizielle API",
      session_page: "Sitzungsseite",
    },
    autoSelectedOfficialApi: "Auto wählte offizielle API",
    autoSelectedSessionPage: "Auto wählte Sitzungsseite",
    autoFellBackToSessionPage: "Auto fiel auf Sitzungsseite zurück",
    preferredOfficialApiSelected: "Bevorzugte offizielle API ausgewählt",
    preferredSessionPageSelected: "Bevorzugte Sitzungsseite ausgewählt",
    officialApiCredentialMissing: "Credential für offizielle API fehlt",
    officialApiFailed: "Offizielle API fehlgeschlagen",
    sessionPageUnavailable: "Sitzungsseite nicht verfügbar",
    noLiveSourcePath: "Kein live source path",
    autoSelectedAfterFallback: (selectedKind) =>
      `Auto-Präferenz wählte ${selectedKind}, nachdem eine frühere Quelle fehlgeschlagen war.`,
    autoSelected: (selectedKind) => `Auto-Präferenz wählte ${selectedKind}.`,
    preferenceSelected: (preference, selectedKind) =>
      `${preference}-Präferenz wählte ${selectedKind}.`,
    officialApiMissingCredentialSummary:
      "Die offizielle API-Quelle konnte nicht laufen, weil das erforderliche Credential fehlt.",
    officialApiFailedSummary:
      "Die offizielle API-Quelle ist fehlgeschlagen; behalte den raw fallback reason für die Evidenzprüfung.",
    sessionPageUnavailableSummary:
      "Die angemeldete Sitzungsseiten-Quelle konnte keinen nutzbaren Snapshot liefern.",
    noLivePathWithFailures: (failureCount) =>
      `${failureCount} Quellenversuche sind fehlgeschlagen; kein live source ist verfügbar.`,
    noLivePathFallback: "Kein live source ist verfügbar.",
  },
  it: {
    sourceKinds: {
      official_api: "API ufficiale",
      session_page: "Pagina di sessione",
      policy_only: "Solo policy",
      current: "fonte corrente",
    },
    sourcePreferences: {
      auto: "Auto",
      official_api: "API ufficiale",
      session_page: "Pagina di sessione",
    },
    autoSelectedOfficialApi: "Auto ha selezionato l'API ufficiale",
    autoSelectedSessionPage: "Auto ha selezionato la pagina di sessione",
    autoFellBackToSessionPage: "Auto è tornato alla pagina di sessione",
    preferredOfficialApiSelected: "API ufficiale preferita selezionata",
    preferredSessionPageSelected: "Pagina di sessione preferita selezionata",
    officialApiCredentialMissing: "Credenziale API ufficiale mancante",
    officialApiFailed: "API ufficiale non riuscita",
    sessionPageUnavailable: "Pagina di sessione non disponibile",
    noLiveSourcePath: "Nessun live source path",
    autoSelectedAfterFallback: (selectedKind) =>
      `La preferenza Auto ha selezionato ${selectedKind} dopo il fallimento di una fonte precedente.`,
    autoSelected: (selectedKind) =>
      `La preferenza Auto ha selezionato ${selectedKind}.`,
    preferenceSelected: (preference, selectedKind) =>
      `La preferenza ${preference} ha selezionato ${selectedKind}.`,
    officialApiMissingCredentialSummary:
      "La fonte API ufficiale non ha potuto funzionare perché manca la credenziale richiesta.",
    officialApiFailedSummary:
      "La fonte API ufficiale non è riuscita; conserva il raw fallback reason per la revisione delle prove.",
    sessionPageUnavailableSummary:
      "La fonte pagina di sessione autenticata non ha potuto fornire uno snapshot utilizzabile.",
    noLivePathWithFailures: (failureCount) =>
      `${failureCount} tentativi di fonte non riusciti; nessun live source è disponibile.`,
    noLivePathFallback: "Nessun live source è disponibile.",
  },
  ru: {
    sourceKinds: {
      official_api: "Официальный API",
      session_page: "Страница сессии",
      policy_only: "Только политика",
      current: "текущий источник",
    },
    sourcePreferences: {
      auto: "Авто",
      official_api: "Официальный API",
      session_page: "Страница сессии",
    },
    autoSelectedOfficialApi: "Авто выбрало официальный API",
    autoSelectedSessionPage: "Авто выбрало страницу сессии",
    autoFellBackToSessionPage: "Авто переключилось на страницу сессии",
    preferredOfficialApiSelected: "Выбран предпочитаемый официальный API",
    preferredSessionPageSelected: "Выбрана предпочитаемая страница сессии",
    officialApiCredentialMissing: "Нет учетных данных официального API",
    officialApiFailed: "Официальный API не сработал",
    sessionPageUnavailable: "Страница сессии недоступна",
    noLiveSourcePath: "Нет live source path",
    autoSelectedAfterFallback: (selectedKind) =>
      `Авто-предпочтение выбрало ${selectedKind} после сбоя предыдущего источника.`,
    autoSelected: (selectedKind) => `Авто-предпочтение выбрало ${selectedKind}.`,
    preferenceSelected: (preference, selectedKind) =>
      `Предпочтение ${preference} выбрало ${selectedKind}.`,
    officialApiMissingCredentialSummary:
      "Официальный API-источник не смог запуститься, потому что нет нужных учетных данных.",
    officialApiFailedSummary:
      "Официальный API-источник завершился с ошибкой; сохраните raw fallback reason для проверки доказательств.",
    sessionPageUnavailableSummary:
      "Источник страницы сессии с выполненным входом не смог предоставить пригодный snapshot.",
    noLivePathWithFailures: (failureCount) =>
      `${failureCount} попыток источника завершились сбоем; live source недоступен.`,
    noLivePathFallback: "live source недоступен.",
  },
  ar: {
    sourceKinds: {
      official_api: "واجهة API الرسمية",
      session_page: "صفحة الجلسة",
      policy_only: "سياسة فقط",
      current: "المصدر الحالي",
    },
    sourcePreferences: {
      auto: "تلقائي",
      official_api: "واجهة API الرسمية",
      session_page: "صفحة الجلسة",
    },
    autoSelectedOfficialApi: "اختيار واجهة API الرسمية تلقائيا",
    autoSelectedSessionPage: "اختيار صفحة الجلسة تلقائيا",
    autoFellBackToSessionPage: "رجوع تلقائي إلى صفحة الجلسة",
    preferredOfficialApiSelected: "تم اختيار واجهة API الرسمية المفضلة",
    preferredSessionPageSelected: "تم اختيار صفحة الجلسة المفضلة",
    officialApiCredentialMissing: "بيانات اعتماد واجهة API الرسمية مفقودة",
    officialApiFailed: "فشلت واجهة API الرسمية",
    sessionPageUnavailable: "صفحة الجلسة غير متاحة",
    noLiveSourcePath: "لا يوجد live source path",
    autoSelectedAfterFallback: (selectedKind) =>
      `اختار التفضيل التلقائي ${selectedKind} بعد فشل مصدر سابق.`,
    autoSelected: (selectedKind) => `اختار التفضيل التلقائي ${selectedKind}.`,
    preferenceSelected: (preference, selectedKind) =>
      `اختار تفضيل ${preference} ${selectedKind}.`,
    officialApiMissingCredentialSummary:
      "تعذر تشغيل مصدر واجهة API الرسمية لأن بيانات الاعتماد المطلوبة مفقودة.",
    officialApiFailedSummary:
      "فشل مصدر واجهة API الرسمية؛ احتفظ بـ raw fallback reason لمراجعة الأدلة.",
    sessionPageUnavailableSummary:
      "تعذر على مصدر صفحة الجلسة المسجلة الدخول توفير snapshot صالح.",
    noLivePathWithFailures: (failureCount) =>
      `فشلت ${failureCount} محاولات مصدر؛ لا يوجد live source متاح.`,
    noLivePathFallback: "لا يوجد live source متاح.",
  },
  hi: {
    sourceKinds: {
      official_api: "आधिकारिक API",
      session_page: "सेशन पेज",
      policy_only: "केवल policy",
      current: "मौजूदा source",
    },
    sourcePreferences: {
      auto: "Auto",
      official_api: "आधिकारिक API",
      session_page: "सेशन पेज",
    },
    autoSelectedOfficialApi: "Auto ने आधिकारिक API चुना",
    autoSelectedSessionPage: "Auto ने सेशन पेज चुना",
    autoFellBackToSessionPage: "Auto सेशन पेज पर fallback हुआ",
    preferredOfficialApiSelected: "पसंदीदा आधिकारिक API चुना गया",
    preferredSessionPageSelected: "पसंदीदा सेशन पेज चुना गया",
    officialApiCredentialMissing: "आधिकारिक API credential नहीं है",
    officialApiFailed: "आधिकारिक API विफल",
    sessionPageUnavailable: "सेशन पेज उपलब्ध नहीं",
    noLiveSourcePath: "कोई live source path नहीं",
    autoSelectedAfterFallback: (selectedKind) =>
      `पहला source विफल होने के बाद Auto preference ने ${selectedKind} चुना.`,
    autoSelected: (selectedKind) => `Auto preference ने ${selectedKind} चुना.`,
    preferenceSelected: (preference, selectedKind) =>
      `${preference} preference ने ${selectedKind} चुना.`,
    officialApiMissingCredentialSummary:
      "आधिकारिक API source जरूरी credential न होने के कारण चल नहीं सका.",
    officialApiFailedSummary:
      "आधिकारिक API source विफल हुआ; evidence review के लिए raw fallback reason रखें.",
    sessionPageUnavailableSummary:
      "login किया हुआ session-page source usable snapshot नहीं दे सका.",
    noLivePathWithFailures: (failureCount) =>
      `${failureCount} source attempts विफल हुए; कोई live source उपलब्ध नहीं है.`,
    noLivePathFallback: "कोई live source उपलब्ध नहीं है.",
  },
  id: {
    sourceKinds: {
      official_api: "API resmi",
      session_page: "Halaman sesi",
      policy_only: "Hanya policy",
      current: "source saat ini",
    },
    sourcePreferences: {
      auto: "Auto",
      official_api: "API resmi",
      session_page: "Halaman sesi",
    },
    autoSelectedOfficialApi: "Auto memilih API resmi",
    autoSelectedSessionPage: "Auto memilih halaman sesi",
    autoFellBackToSessionPage: "Auto fallback ke halaman sesi",
    preferredOfficialApiSelected: "API resmi pilihan dipilih",
    preferredSessionPageSelected: "Halaman sesi pilihan dipilih",
    officialApiCredentialMissing: "Credential API resmi hilang",
    officialApiFailed: "API resmi gagal",
    sessionPageUnavailable: "Halaman sesi tidak tersedia",
    noLiveSourcePath: "Tidak ada live source path",
    autoSelectedAfterFallback: (selectedKind) =>
      `Preferensi Auto memilih ${selectedKind} setelah source sebelumnya gagal.`,
    autoSelected: (selectedKind) => `Preferensi Auto memilih ${selectedKind}.`,
    preferenceSelected: (preference, selectedKind) =>
      `Preferensi ${preference} memilih ${selectedKind}.`,
    officialApiMissingCredentialSummary:
      "Source API resmi tidak dapat berjalan karena credential yang diperlukan hilang.",
    officialApiFailedSummary:
      "Source API resmi gagal; simpan raw fallback reason untuk review bukti.",
    sessionPageUnavailableSummary:
      "Source halaman sesi yang sudah login tidak dapat menyediakan snapshot yang bisa dipakai.",
    noLivePathWithFailures: (failureCount) =>
      `${failureCount} percobaan source gagal; tidak ada live source yang tersedia.`,
    noLivePathFallback: "Tidak ada live source yang tersedia.",
  },
};

function getCopy(i18n: RuntimeI18n): SourceDiagnosticCopy {
  return SOURCE_DIAGNOSTIC_COPY[i18n.resolvedLocale];
}

function formatSourceKindLabel(
  sourceKind: ProviderSourceKind | null,
  copy: SourceLabels,
): string {
  return sourceKind ? copy.sourceKinds[sourceKind] : copy.sourceKinds.current;
}

function formatSourcePreferenceLabel(
  sourcePreference: ProviderSourcePreference | null,
  copy: SourceLabels,
): string {
  return sourcePreference
    ? copy.sourcePreferences[sourcePreference]
    : copy.sourcePreferences.auto;
}

function formatSourceSelectionSummary(
  params: ProviderDiagnosticParams | undefined,
  i18n: RuntimeI18n,
  copy: SourceDiagnosticCopy,
): string {
  const selectedKind = getSourceKindParam(params, "selectedKind");
  const sourcePreference = getSourcePreferenceParam(params, "sourcePreference");
  const hadFallback = getBooleanParam(params, "hadFallback") ?? false;
  const selectedKindLabel = formatSourceKindLabel(selectedKind, copy);
  const preferenceLabel = formatSourcePreferenceLabel(sourcePreference, copy);

  if (sourcePreference === "auto" && hadFallback) {
    return copy.autoSelectedAfterFallback(selectedKindLabel);
  }

  if (sourcePreference === "auto") {
    return copy.autoSelected(selectedKindLabel);
  }

  return copy.preferenceSelected(preferenceLabel, selectedKindLabel);
}

function formatNoLivePathSummary(
  params: ProviderDiagnosticParams | undefined,
  i18n: RuntimeI18n,
  copy: SourceDiagnosticCopy,
): string {
  const failureCount = getNumberParam(params, "failureCount");

  if (failureCount !== null) {
    return copy.noLivePathWithFailures(i18n.formatNumber(failureCount));
  }

  return copy.noLivePathFallback;
}

export function getSourceDiagnosticPresentation(
  diagnostic: ProviderDiagnostic,
  i18n: RuntimeI18n,
): ProviderDiagnosticPresentation | null {
  const copy = getCopy(i18n);

  switch (diagnostic.code as SourceDiagnosticCode) {
    case "source.auto_selected_official_api":
      return {
        label: copy.autoSelectedOfficialApi,
        summary: formatSourceSelectionSummary(diagnostic.params, i18n, copy),
      };
    case "source.auto_selected_session_page": {
      const hadFallback =
        getBooleanParam(diagnostic.params, "hadFallback") ?? false;

      return {
        label: hadFallback
          ? copy.autoFellBackToSessionPage
          : copy.autoSelectedSessionPage,
        summary: formatSourceSelectionSummary(diagnostic.params, i18n, copy),
      };
    }
    case "source.preference_selected_official_api":
      return {
        label: copy.preferredOfficialApiSelected,
        summary: formatSourceSelectionSummary(diagnostic.params, i18n, copy),
      };
    case "source.preference_selected_session_page":
      return {
        label: copy.preferredSessionPageSelected,
        summary: formatSourceSelectionSummary(diagnostic.params, i18n, copy),
      };
    case "source.official_api_missing_credential":
      return {
        label: copy.officialApiCredentialMissing,
        summary: copy.officialApiMissingCredentialSummary,
      };
    case "source.official_api_failed":
      return {
        label: copy.officialApiFailed,
        summary: copy.officialApiFailedSummary,
      };
    case "source.session_page_unavailable":
      return {
        label: copy.sessionPageUnavailable,
        summary: copy.sessionPageUnavailableSummary,
      };
    case "source.no_live_path":
      return {
        label: copy.noLiveSourcePath,
        summary: formatNoLivePathSummary(diagnostic.params, i18n, copy),
      };
    default:
      return null;
  }
}
