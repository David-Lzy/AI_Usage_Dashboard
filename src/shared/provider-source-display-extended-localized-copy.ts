import type { ResolvedAppLocale } from "./i18n";
import type { ProviderSourceDisplayCopy } from "./provider-sources";
import { SETTINGS_SOURCE_PERMISSIONS_COPY } from "./settings-source-permissions-localized-copy";

type ProviderSourceDisplayExtendedLocale = Exclude<
  ResolvedAppLocale,
  "en" | "zh-CN"
>;

type SourceDisplayPhrases = Omit<
  ProviderSourceDisplayCopy,
  "sourceKindLabels" | "sourcePreferenceLabels"
>;

function buildCopy(
  locale: ProviderSourceDisplayExtendedLocale,
  phrases: SourceDisplayPhrases,
): ProviderSourceDisplayCopy {
  const settingsSourceCopy = SETTINGS_SOURCE_PERMISSIONS_COPY[locale].sources;

  return {
    sourceKindLabels: settingsSourceCopy.sourceKindLabels,
    sourcePreferenceLabels: settingsSourceCopy.sourcePreferenceLabels,
    ...phrases,
  };
}

export const PROVIDER_SOURCE_DISPLAY_EXTENDED_COPY: Record<
  ProviderSourceDisplayExtendedLocale,
  ProviderSourceDisplayCopy
> = {
  "zh-TW": buildCopy("zh-TW", {
    rolloutStageLabels: {
      shipped: "已發布",
      planned: "計畫中",
      deferred: "已暫緩",
    },
    fieldAvailabilityLabels: {
      exact: "精確",
      window_only: "僅窗口",
      analytics_only: "分析",
      documented_policy: "Policy",
      unavailable: "不可用",
    },
    sourceFidelity: {
      exact: {
        label: "供應商精確值",
        detail:
          "此路徑會直接暴露供應商回報的 tracked usage 與 remaining balance。",
      },
      window_only: {
        label: "僅窗口供應商值",
        detail:
          "此路徑只暴露目前窗口或局部上下文中的供應商回報值，不是一個絕對 remaining balance。",
      },
      analytics_only: {
        label: "Analytics snapshot",
        detail:
          "此路徑暴露彙總 analytics 或 snapshot 值，不是即時 remaining counter。",
      },
      policy_only: {
        label: "已記錄 policy",
        detail:
          "此路徑只來自已記錄 policy。目前沒有選中的 live page session 或 live API source。",
      },
      local_estimate: {
        label: "本機估算",
        detail:
          "此路徑會依賴本機推斷 counter，而不是供應商回報的 live usage。",
      },
    },
    connectionMode: {
      credential: {
        label: "已存 credential",
        detail:
          "此路徑由 extension 使用保存在 extension-managed local storage 的 credential 執行。",
      },
      page_session: {
        label: "已登入 page session",
        detail:
          "此路徑會附著到已登入的瀏覽器分頁，並在目前 session 中讀取標準化頁面資料。",
      },
      none: {
        label: "沒有 live 連線",
        detail:
          "此路徑不使用 live credential 或 page session。extension 只顯示已記錄 policy。",
      },
    },
    sourceContractLabels: {
      shipped_admin_analytics: "已發布 admin analytics",
      shipped_enterprise_analytics: "已發布 enterprise analytics",
      shipped_personal_partial: "已發布 personal partial",
      shipped_policy_only: "已發布 policy only",
      deferred_personal_page: "已暫緩 personal page",
      deferred_project_metrics: "已暫緩 project metrics",
      deferred_org_console: "已暫緩 org console path",
    },
    credentialPersistence: {
      extensionLocalOnlyLabel: "僅 extension 本機",
      extensionLocalOnlyDetail:
        "任何已設定 credential 只會保存在目前 browser profile 的 extension-managed local storage。",
      notApplicableLabel: "不適用",
      notApplicableDetail: "此 provider 的已發布合約不儲存 credential。",
    },
    cookiePolicy: {
      forbiddenLabel: "禁止",
      forbiddenDetail: "Raw cookies 不會持久化到 extension storage。",
    },
    manualCookieImport: {
      forbiddenLabel: "禁止",
      forbiddenDetail:
        "產品不會要求使用者把 cookies 或 auth headers 貼到 extension settings。",
    },
    hostAccess: {
      notRequiredLabel: "不需要",
      notRequiredDetail:
        "此 provider 的已發布合約不需要 optional host permission。",
      requiredLabel: "需要",
      requiredDetail: (hosts) =>
        `Live access 依賴 ${hosts} 的 Chrome host permission。`,
    },
    sourceState: {
      readyLabel: "可同步",
      policyOnlyLabel: "沒有 live sync",
      hostAccessMissingLabel: "缺少 host access",
      hostAccessMissingFallbackDetail:
        "必須先授予所需 host access，live sync 才能執行。",
      credentialMissingLabel: "缺少 credential",
      credentialMissingFallbackDetail:
        "必須先新增所需 provider credential，live sync 才能執行。",
      loggedOutLabel: "頁面已登出",
      loggedOutFallbackDetail:
        "請重新登入 provider 頁面，再刷新 dashboard。",
      openPageRequiredLabel: "需要打開頁面",
      openPageRequiredFallbackDetail:
        "請先打開所需已登入 provider 頁面，再刷新。",
      captureUnavailableLabel: "頁面擷取不可用",
      captureUnavailableFallbackDetail:
        "請重新載入已打開的 provider 頁面，再刷新。",
      syncErrorLabel: "Sync 問題",
      syncErrorFallbackDetail: "目前 provider source 在刷新時意外失敗。",
    },
    pageBinding: {
      boundTabLabel: "綁定分頁",
      autoReconnectLabel: "自動重連",
      targetFallback: "上次匹配的 provider 頁面",
      lastAttachedSuffix: (updatedAt) => `上次附著 ${updatedAt}。`,
      attachedLabel: "已附著",
      attachedDetail: (mode, target, suffix) =>
        `${mode} 目前正在追蹤 ${target}。${suffix ? ` ${suffix}` : ""}`,
      staleLabel: "綁定已過期",
      staleDetail: (mode, target, suffix) =>
        `${mode} 上次指向 ${target}，但目前 session 已無法在那裡暴露可用頁面。${
          suffix ? ` ${suffix}` : ""
        }`,
      notBoundLabel: "未綁定",
      notBoundDetail:
        "尚未固定 provider 頁面。自動探索仍可搜尋目前分頁，也可用尋找或打開頁面明確附著。",
    },
    availabilitySummary: (used, remaining, reset) =>
      `已用：${used} · 剩餘：${remaining} · 重置：${reset}`,
  }),
  ja: buildCopy("ja", {
    rolloutStageLabels: {
      shipped: "出荷済み",
      planned: "計画中",
      deferred: "延期",
    },
    fieldAvailabilityLabels: {
      exact: "正確",
      window_only: "ウィンドウのみ",
      analytics_only: "分析",
      documented_policy: "ポリシー",
      unavailable: "利用不可",
    },
    sourceFidelity: {
      exact: {
        label: "ベンダー正確値",
        detail:
          "この経路は tracked usage と remaining balance について、ベンダー報告値を直接表示します。",
      },
      window_only: {
        label: "ウィンドウ限定ベンダー値",
        detail:
          "この経路は現在のウィンドウまたは部分コンテキストのベンダー報告値だけを表示し、絶対的な remaining balance ではありません。",
      },
      analytics_only: {
        label: "分析スナップショット",
        detail:
          "この経路は集計 analytics または snapshot 値を表示し、ライブ remaining counter ではありません。",
      },
      policy_only: {
        label: "文書化ポリシー",
        detail:
          "この経路は文書化ポリシーのみです。live page session または live API source は選択されていません。",
      },
      local_estimate: {
        label: "ローカル推定",
        detail:
          "この経路はベンダー報告の live usage ではなく、ローカル推定 counter に依存します。",
      },
    },
    connectionMode: {
      credential: {
        label: "保存済み credential",
        detail:
          "この経路は extension-managed local storage に保存された credential を使って extension から実行されます。",
      },
      page_session: {
        label: "ログイン済み page session",
        detail:
          "この経路はログイン済み browser tab に接続し、現在の session 内で正規化されたページデータを読み取ります。",
      },
      none: {
        label: "live 接続なし",
        detail:
          "この経路は live credential も page session も使いません。extension は文書化ポリシーのみ表示します。",
      },
    },
    sourceContractLabels: {
      shipped_admin_analytics: "出荷済み admin analytics",
      shipped_enterprise_analytics: "出荷済み enterprise analytics",
      shipped_personal_partial: "出荷済み personal partial",
      shipped_policy_only: "出荷済み policy only",
      deferred_personal_page: "延期 personal page",
      deferred_project_metrics: "延期 project metrics",
      deferred_org_console: "延期 org console path",
    },
    credentialPersistence: {
      extensionLocalOnlyLabel: "extension ローカルのみ",
      extensionLocalOnlyDetail:
        "設定済み credential は、この browser profile の extension-managed local storage にのみ残ります。",
      notApplicableLabel: "該当なし",
      notApplicableDetail:
        "この provider の出荷済み contract では credential は保存されません。",
    },
    cookiePolicy: {
      forbiddenLabel: "禁止",
      forbiddenDetail: "Raw cookies は extension storage に永続化されません。",
    },
    manualCookieImport: {
      forbiddenLabel: "禁止",
      forbiddenDetail:
        "製品は cookies や auth headers を extension settings に貼り付けるよう求めません。",
    },
    hostAccess: {
      notRequiredLabel: "不要",
      notRequiredDetail:
        "この provider の出荷済み contract では optional host permission は不要です。",
      requiredLabel: "必要",
      requiredDetail: (hosts) =>
        `Live access には ${hosts} の Chrome host permission が必要です。`,
    },
    sourceState: {
      readyLabel: "同期可能",
      policyOnlyLabel: "live sync なし",
      hostAccessMissingLabel: "host access 不足",
      hostAccessMissingFallbackDetail:
        "live sync を実行する前に必要な host access を付与してください。",
      credentialMissingLabel: "credential 不足",
      credentialMissingFallbackDetail:
        "live sync を実行する前に必要な provider credential を追加してください。",
      loggedOutLabel: "ログアウト済みページ",
      loggedOutFallbackDetail:
        "dashboard を更新する前に provider ページへ再ログインしてください。",
      openPageRequiredLabel: "ページを開く必要あり",
      openPageRequiredFallbackDetail:
        "必要なログイン済み provider ページを開いてから再更新してください。",
      captureUnavailableLabel: "ページキャプチャ不可",
      captureUnavailableFallbackDetail:
        "開いている provider ページを再読み込みしてから再更新してください。",
      syncErrorLabel: "Sync 問題",
      syncErrorFallbackDetail:
        "現在の provider source は refresh 中に予期せず失敗しました。",
    },
    pageBinding: {
      boundTabLabel: "固定タブ",
      autoReconnectLabel: "自動再接続",
      targetFallback: "最後に一致した provider ページ",
      lastAttachedSuffix: (updatedAt) => `最後の接続 ${updatedAt}。`,
      attachedLabel: "接続済み",
      attachedDetail: (mode, target, suffix) =>
        `${mode} は現在 ${target} を追跡しています。${suffix ? ` ${suffix}` : ""}`,
      staleLabel: "古い binding",
      staleDetail: (mode, target, suffix) =>
        `${mode} は最後に ${target} を指していましたが、現在の session ではそこに利用可能なページを公開していません。${
          suffix ? ` ${suffix}` : ""
        }`,
      notBoundLabel: "未固定",
      notBoundDetail:
        "provider ページはまだ固定されていません。自動探索は現在のタブを検索でき、Find or open page で明示的に接続することもできます。",
    },
    availabilitySummary: (used, remaining, reset) =>
      `使用済み: ${used} · 残り: ${remaining} · リセット: ${reset}`,
  }),
  ko: buildCopy("ko", {
    rolloutStageLabels: {
      shipped: "출시됨",
      planned: "계획됨",
      deferred: "보류됨",
    },
    fieldAvailabilityLabels: {
      exact: "정확",
      window_only: "창 한정",
      analytics_only: "분석",
      documented_policy: "정책",
      unavailable: "사용 불가",
    },
    sourceFidelity: {
      exact: {
        label: "벤더 정확 값",
        detail:
          "이 경로는 tracked usage와 remaining balance에 대해 벤더가 보고한 값을 직접 표시합니다.",
      },
      window_only: {
        label: "창 한정 벤더 값",
        detail:
          "이 경로는 현재 창 또는 부분 컨텍스트의 벤더 보고 값만 표시하며, 절대 remaining balance가 아닙니다.",
      },
      analytics_only: {
        label: "분석 스냅샷",
        detail:
          "이 경로는 집계 analytics 또는 snapshot 값을 표시하며 live remaining counter가 아닙니다.",
      },
      policy_only: {
        label: "문서화된 정책",
        detail:
          "이 경로는 문서화된 정책 전용입니다. live page session 또는 live API source가 선택되지 않았습니다.",
      },
      local_estimate: {
        label: "로컬 추정",
        detail:
          "이 경로는 벤더 보고 live usage 대신 로컬 추정 counter에 의존합니다.",
      },
    },
    connectionMode: {
      credential: {
        label: "저장된 credential",
        detail:
          "이 경로는 extension-managed local storage에 저장된 credential을 사용해 extension에서 실행됩니다.",
      },
      page_session: {
        label: "로그인된 page session",
        detail:
          "이 경로는 이미 로그인된 browser tab에 연결하고 현재 session 안에서 정규화된 page data를 읽습니다.",
      },
      none: {
        label: "live 연결 없음",
        detail:
          "이 경로는 live credential 또는 page session을 사용하지 않습니다. extension은 문서화된 정책만 표시합니다.",
      },
    },
    sourceContractLabels: {
      shipped_admin_analytics: "출시된 admin analytics",
      shipped_enterprise_analytics: "출시된 enterprise analytics",
      shipped_personal_partial: "출시된 personal partial",
      shipped_policy_only: "출시된 policy only",
      deferred_personal_page: "보류된 personal page",
      deferred_project_metrics: "보류된 project metrics",
      deferred_org_console: "보류된 org console path",
    },
    credentialPersistence: {
      extensionLocalOnlyLabel: "extension 로컬 전용",
      extensionLocalOnlyDetail:
        "설정된 credential은 현재 browser profile의 extension-managed local storage에만 남습니다.",
      notApplicableLabel: "해당 없음",
      notApplicableDetail:
        "이 provider의 출시된 contract에서는 credential을 저장하지 않습니다.",
    },
    cookiePolicy: {
      forbiddenLabel: "금지",
      forbiddenDetail: "Raw cookies는 extension storage에 영구 저장되지 않습니다.",
    },
    manualCookieImport: {
      forbiddenLabel: "금지",
      forbiddenDetail:
        "제품은 cookies 또는 auth headers를 extension settings에 붙여넣도록 요구하지 않습니다.",
    },
    hostAccess: {
      notRequiredLabel: "필요 없음",
      notRequiredDetail:
        "이 provider의 출시된 contract에는 optional host permission이 필요하지 않습니다.",
      requiredLabel: "필요",
      requiredDetail: (hosts) =>
        `Live access는 ${hosts}에 대한 Chrome host permission에 의존합니다.`,
    },
    sourceState: {
      readyLabel: "동기화 가능",
      policyOnlyLabel: "live sync 없음",
      hostAccessMissingLabel: "host access 없음",
      hostAccessMissingFallbackDetail:
        "live sync를 실행하기 전에 필요한 host access를 허용하세요.",
      credentialMissingLabel: "credential 없음",
      credentialMissingFallbackDetail:
        "live sync를 실행하기 전에 필요한 provider credential을 추가하세요.",
      loggedOutLabel: "로그아웃된 페이지",
      loggedOutFallbackDetail:
        "dashboard를 새로고침하기 전에 provider 페이지에 다시 로그인하세요.",
      openPageRequiredLabel: "페이지 열기 필요",
      openPageRequiredFallbackDetail:
        "필요한 로그인된 provider 페이지를 연 다음 다시 새로고침하세요.",
      captureUnavailableLabel: "페이지 캡처 불가",
      captureUnavailableFallbackDetail:
        "열려 있는 provider 페이지를 다시 로드한 다음 새로고침하세요.",
      syncErrorLabel: "Sync 문제",
      syncErrorFallbackDetail:
        "현재 provider source가 refresh 중 예기치 않게 실패했습니다.",
    },
    pageBinding: {
      boundTabLabel: "고정 탭",
      autoReconnectLabel: "자동 재연결",
      targetFallback: "마지막으로 일치한 provider 페이지",
      lastAttachedSuffix: (updatedAt) => `마지막 연결 ${updatedAt}.`,
      attachedLabel: "연결됨",
      attachedDetail: (mode, target, suffix) =>
        `${mode}이(가) 현재 ${target}을(를) 추적합니다.${suffix ? ` ${suffix}` : ""}`,
      staleLabel: "오래된 binding",
      staleDetail: (mode, target, suffix) =>
        `${mode}은(는) 마지막으로 ${target}을(를) 가리켰지만 현재 session에서는 그곳의 사용 가능한 페이지를 더 이상 노출하지 않습니다.${
          suffix ? ` ${suffix}` : ""
        }`,
      notBoundLabel: "고정되지 않음",
      notBoundDetail:
        "아직 provider 페이지가 고정되지 않았습니다. 자동 탐색이 현재 탭을 계속 검색하거나 Find or open page로 명시적으로 연결할 수 있습니다.",
    },
    availabilitySummary: (used, remaining, reset) =>
      `사용됨: ${used} · 남음: ${remaining} · 리셋: ${reset}`,
  }),
  "es-419": buildCopy("es-419", {
    rolloutStageLabels: {
      shipped: "Publicado",
      planned: "Planificado",
      deferred: "Diferido",
    },
    fieldAvailabilityLabels: {
      exact: "Exacto",
      window_only: "Solo ventana",
      analytics_only: "Analytics",
      documented_policy: "Policy",
      unavailable: "No disponible",
    },
    sourceFidelity: {
      exact: {
        label: "Valor exacto del proveedor",
        detail:
          "Esta ruta expone directamente los valores reportados por el proveedor para tracked usage y remaining balance.",
      },
      window_only: {
        label: "Valor del proveedor solo de ventana",
        detail:
          "Esta ruta expone valores reportados por el proveedor para la ventana activa o un contexto parcial, no un remaining balance absoluto.",
      },
      analytics_only: {
        label: "Snapshot de analytics",
        detail:
          "Esta ruta expone valores agregados de analytics o snapshot, no un remaining counter en vivo.",
      },
      policy_only: {
        label: "Policy documentada",
        detail:
          "Esta ruta es solo policy documentada. No hay live page session ni live API source seleccionado.",
      },
      local_estimate: {
        label: "Estimacion local",
        detail:
          "Esta ruta dependeria de counters inferidos localmente en vez de live usage reportado por el proveedor.",
      },
    },
    connectionMode: {
      credential: {
        label: "Credential guardada",
        detail:
          "Esta ruta corre desde la extension usando una credential guardada en extension-managed local storage.",
      },
      page_session: {
        label: "Page session iniciada",
        detail:
          "Esta ruta se conecta a una pestana ya autenticada y lee datos de pagina normalizados dentro de la sesion actual.",
      },
      none: {
        label: "Sin conexion live",
        detail:
          "Esta ruta no usa live credential ni page session. La extension solo muestra policy documentada.",
      },
    },
    sourceContractLabels: {
      shipped_admin_analytics: "Admin analytics publicado",
      shipped_enterprise_analytics: "Enterprise analytics publicado",
      shipped_personal_partial: "Personal partial publicado",
      shipped_policy_only: "Policy only publicado",
      deferred_personal_page: "Personal page diferido",
      deferred_project_metrics: "Project metrics diferido",
      deferred_org_console: "Org console path diferido",
    },
    credentialPersistence: {
      extensionLocalOnlyLabel: "Solo local de extension",
      extensionLocalOnlyDetail:
        "Toda credential configurada queda solo en extension-managed local storage de este browser profile.",
      notApplicableLabel: "No aplica",
      notApplicableDetail:
        "No se guarda ninguna credential para el contrato publicado de este proveedor.",
    },
    cookiePolicy: {
      forbiddenLabel: "Prohibido",
      forbiddenDetail: "Raw cookies no se persisten en extension storage.",
    },
    manualCookieImport: {
      forbiddenLabel: "Prohibido",
      forbiddenDetail:
        "El producto no pide al usuario pegar cookies ni auth headers en extension settings.",
    },
    hostAccess: {
      notRequiredLabel: "No requerido",
      notRequiredDetail:
        "El contrato publicado de este proveedor no requiere optional host permission.",
      requiredLabel: "Requerido",
      requiredDetail: (hosts) =>
        `Live access depende del Chrome host permission para ${hosts}.`,
    },
    sourceState: {
      readyLabel: "Listo para sync",
      policyOnlyLabel: "Sin live sync",
      hostAccessMissingLabel: "Falta host access",
      hostAccessMissingFallbackDetail:
        "Concede el host access requerido antes de que live sync pueda correr.",
      credentialMissingLabel: "Falta credential",
      credentialMissingFallbackDetail:
        "Agrega la credential requerida del proveedor antes de que live sync pueda correr.",
      loggedOutLabel: "Pagina sin sesion",
      loggedOutFallbackDetail:
        "Inicia sesion otra vez en la pagina del proveedor antes de refrescar el dashboard.",
      openPageRequiredLabel: "Hay que abrir la pagina",
      openPageRequiredFallbackDetail:
        "Abre la pagina requerida del proveedor con sesion iniciada y luego refresca otra vez.",
      captureUnavailableLabel: "Captura de pagina no disponible",
      captureUnavailableFallbackDetail:
        "Recarga la pagina abierta del proveedor y luego refresca otra vez.",
      syncErrorLabel: "Problema de sync",
      syncErrorFallbackDetail:
        "El provider source actual fallo inesperadamente durante el refresh.",
    },
    pageBinding: {
      boundTabLabel: "Pestana vinculada",
      autoReconnectLabel: "Reconectar automaticamente",
      targetFallback: "la ultima pagina de proveedor coincidente",
      lastAttachedSuffix: (updatedAt) => `Ultimo enlace ${updatedAt}.`,
      attachedLabel: "Conectado",
      attachedDetail: (mode, target, suffix) =>
        `${mode} esta siguiendo ${target}.${suffix ? ` ${suffix}` : ""}`,
      staleLabel: "Binding vencido",
      staleDetail: (mode, target, suffix) =>
        `${mode} apuntaba a ${target}, pero la sesion actual ya no expone una pagina util alli.${
          suffix ? ` ${suffix}` : ""
        }`,
      notBoundLabel: "No vinculado",
      notBoundDetail:
        "Aun no hay una pagina de proveedor fijada. Auto discovery puede buscar en las pestanas actuales, o puedes usar Find or open page para adjuntar una explicitamente.",
    },
    availabilitySummary: (used, remaining, reset) =>
      `Usado: ${used} · Restante: ${remaining} · Reset: ${reset}`,
  }),
  "pt-BR": buildCopy("pt-BR", {
    rolloutStageLabels: {
      shipped: "Publicado",
      planned: "Planejado",
      deferred: "Adiado",
    },
    fieldAvailabilityLabels: {
      exact: "Exato",
      window_only: "Somente janela",
      analytics_only: "Analytics",
      documented_policy: "Policy",
      unavailable: "Indisponivel",
    },
    sourceFidelity: {
      exact: {
        label: "Valor exato do provider",
        detail:
          "Este caminho expoe diretamente os valores reportados pelo provider para tracked usage e remaining balance.",
      },
      window_only: {
        label: "Valor do provider somente da janela",
        detail:
          "Este caminho expoe valores reportados pelo provider para a janela ativa ou contexto parcial, nao um remaining balance absoluto.",
      },
      analytics_only: {
        label: "Snapshot de analytics",
        detail:
          "Este caminho expoe valores agregados de analytics ou snapshot, nao um remaining counter live.",
      },
      policy_only: {
        label: "Policy documentada",
        detail:
          "Este caminho e somente policy documentada. Nenhum live page session ou live API source esta selecionado.",
      },
      local_estimate: {
        label: "Estimativa local",
        detail:
          "Este caminho dependeria de counters inferidos localmente em vez de live usage reportado pelo provider.",
      },
    },
    connectionMode: {
      credential: {
        label: "Credential salva",
        detail:
          "Este caminho roda a partir da extensao usando uma credential salva em extension-managed local storage.",
      },
      page_session: {
        label: "Page session logada",
        detail:
          "Este caminho se conecta a uma aba ja logada e le dados de pagina normalizados na session atual.",
      },
      none: {
        label: "Sem conexao live",
        detail:
          "Este caminho nao usa live credential nem page session. A extensao mostra apenas policy documentada.",
      },
    },
    sourceContractLabels: {
      shipped_admin_analytics: "Admin analytics publicado",
      shipped_enterprise_analytics: "Enterprise analytics publicado",
      shipped_personal_partial: "Personal partial publicado",
      shipped_policy_only: "Policy only publicado",
      deferred_personal_page: "Personal page adiado",
      deferred_project_metrics: "Project metrics adiado",
      deferred_org_console: "Org console path adiado",
    },
    credentialPersistence: {
      extensionLocalOnlyLabel: "Somente local da extensao",
      extensionLocalOnlyDetail:
        "Qualquer credential configurada fica apenas no extension-managed local storage deste browser profile.",
      notApplicableLabel: "Nao aplicavel",
      notApplicableDetail:
        "Nenhuma credential e armazenada para o contrato publicado deste provider.",
    },
    cookiePolicy: {
      forbiddenLabel: "Proibido",
      forbiddenDetail: "Raw cookies nao sao persistidos no extension storage.",
    },
    manualCookieImport: {
      forbiddenLabel: "Proibido",
      forbiddenDetail:
        "O produto nao pede que o usuario cole cookies ou auth headers nas extension settings.",
    },
    hostAccess: {
      notRequiredLabel: "Nao requerido",
      notRequiredDetail:
        "O contrato publicado deste provider nao requer optional host permission.",
      requiredLabel: "Requerido",
      requiredDetail: (hosts) =>
        `Live access depende da Chrome host permission para ${hosts}.`,
    },
    sourceState: {
      readyLabel: "Pronto para sync",
      policyOnlyLabel: "Sem live sync",
      hostAccessMissingLabel: "Host access ausente",
      hostAccessMissingFallbackDetail:
        "Conceda o host access requerido antes que live sync possa rodar.",
      credentialMissingLabel: "Credential ausente",
      credentialMissingFallbackDetail:
        "Adicione a credential requerida do provider antes que live sync possa rodar.",
      loggedOutLabel: "Pagina deslogada",
      loggedOutFallbackDetail:
        "Faca login novamente na pagina do provider antes de atualizar o dashboard.",
      openPageRequiredLabel: "E preciso abrir a pagina",
      openPageRequiredFallbackDetail:
        "Abra a pagina requerida do provider ja logada e atualize novamente.",
      captureUnavailableLabel: "Captura da pagina indisponivel",
      captureUnavailableFallbackDetail:
        "Recarregue a pagina aberta do provider e atualize novamente.",
      syncErrorLabel: "Problema de sync",
      syncErrorFallbackDetail:
        "O provider source atual falhou inesperadamente durante o refresh.",
    },
    pageBinding: {
      boundTabLabel: "Aba vinculada",
      autoReconnectLabel: "Reconectar automaticamente",
      targetFallback: "a ultima pagina de provider correspondente",
      lastAttachedSuffix: (updatedAt) => `Ultima conexao ${updatedAt}.`,
      attachedLabel: "Conectado",
      attachedDetail: (mode, target, suffix) =>
        `${mode} esta acompanhando ${target}.${suffix ? ` ${suffix}` : ""}`,
      staleLabel: "Binding antigo",
      staleDetail: (mode, target, suffix) =>
        `${mode} apontava para ${target}, mas a session atual nao expoe mais uma pagina utilizavel ali.${
          suffix ? ` ${suffix}` : ""
        }`,
      notBoundLabel: "Nao vinculado",
      notBoundDetail:
        "Nenhuma pagina de provider esta fixada ainda. Auto discovery ainda pode buscar abas atuais, ou use Find or open page para anexar explicitamente.",
    },
    availabilitySummary: (used, remaining, reset) =>
      `Usado: ${used} · Restante: ${remaining} · Reset: ${reset}`,
  }),
  fr: buildCopy("fr", {
    rolloutStageLabels: {
      shipped: "Livre",
      planned: "Planifie",
      deferred: "Reporte",
    },
    fieldAvailabilityLabels: {
      exact: "Exact",
      window_only: "Fenetre seulement",
      analytics_only: "Analytics",
      documented_policy: "Policy",
      unavailable: "Indisponible",
    },
    sourceFidelity: {
      exact: {
        label: "Valeur exacte du provider",
        detail:
          "Ce chemin expose directement les valeurs rapportees par le provider pour tracked usage et remaining balance.",
      },
      window_only: {
        label: "Valeur provider limitee a la fenetre",
        detail:
          "Ce chemin expose les valeurs rapportees par le provider pour la fenetre active ou un contexte partiel, pas un remaining balance absolu.",
      },
      analytics_only: {
        label: "Snapshot analytics",
        detail:
          "Ce chemin expose des valeurs analytics agregees ou snapshot, pas un remaining counter live.",
      },
      policy_only: {
        label: "Policy documentee",
        detail:
          "Ce chemin est uniquement une policy documentee. Aucun live page session ni live API source n'est selectionne.",
      },
      local_estimate: {
        label: "Estimation locale",
        detail:
          "Ce chemin dependrait de counters deduits localement au lieu d'un live usage rapporte par le provider.",
      },
    },
    connectionMode: {
      credential: {
        label: "Credential enregistree",
        detail:
          "Ce chemin s'execute depuis l'extension avec une credential enregistree dans extension-managed local storage.",
      },
      page_session: {
        label: "Page session connectee",
        detail:
          "Ce chemin s'attache a un onglet deja connecte et lit des donnees de page normalisees dans la session actuelle.",
      },
      none: {
        label: "Aucune connexion live",
        detail:
          "Ce chemin n'utilise ni live credential ni page session. L'extension affiche uniquement la policy documentee.",
      },
    },
    sourceContractLabels: {
      shipped_admin_analytics: "Admin analytics livre",
      shipped_enterprise_analytics: "Enterprise analytics livre",
      shipped_personal_partial: "Personal partial livre",
      shipped_policy_only: "Policy only livre",
      deferred_personal_page: "Personal page reporte",
      deferred_project_metrics: "Project metrics reporte",
      deferred_org_console: "Org console path reporte",
    },
    credentialPersistence: {
      extensionLocalOnlyLabel: "Extension locale seulement",
      extensionLocalOnlyDetail:
        "Toute credential configuree reste uniquement dans extension-managed local storage de ce browser profile.",
      notApplicableLabel: "Non applicable",
      notApplicableDetail:
        "Aucune credential n'est stockee pour le contrat livre de ce provider.",
    },
    cookiePolicy: {
      forbiddenLabel: "Interdit",
      forbiddenDetail: "Les raw cookies ne sont pas conserves dans extension storage.",
    },
    manualCookieImport: {
      forbiddenLabel: "Interdit",
      forbiddenDetail:
        "Le produit ne demande pas a l'utilisateur de coller cookies ou auth headers dans extension settings.",
    },
    hostAccess: {
      notRequiredLabel: "Non requis",
      notRequiredDetail:
        "Le contrat livre de ce provider ne requiert pas optional host permission.",
      requiredLabel: "Requis",
      requiredDetail: (hosts) =>
        `Live access depend de Chrome host permission pour ${hosts}.`,
    },
    sourceState: {
      readyLabel: "Pret pour sync",
      policyOnlyLabel: "Aucun live sync",
      hostAccessMissingLabel: "Host access manquant",
      hostAccessMissingFallbackDetail:
        "Accordez le host access requis avant que live sync puisse s'executer.",
      credentialMissingLabel: "Credential manquante",
      credentialMissingFallbackDetail:
        "Ajoutez la provider credential requise avant que live sync puisse s'executer.",
      loggedOutLabel: "Page deconnectee",
      loggedOutFallbackDetail:
        "Reconnectez-vous sur la page provider avant de rafraichir le dashboard.",
      openPageRequiredLabel: "Page a ouvrir requise",
      openPageRequiredFallbackDetail:
        "Ouvrez la page provider connectee requise, puis rafraichissez a nouveau.",
      captureUnavailableLabel: "Capture de page indisponible",
      captureUnavailableFallbackDetail:
        "Rechargez la page provider ouverte, puis rafraichissez a nouveau.",
      syncErrorLabel: "Probleme de sync",
      syncErrorFallbackDetail:
        "Le provider source actuel a echoue de facon inattendue pendant le refresh.",
    },
    pageBinding: {
      boundTabLabel: "Onglet lie",
      autoReconnectLabel: "Reconnexion automatique",
      targetFallback: "la derniere page provider correspondante",
      lastAttachedSuffix: (updatedAt) => `Dernier attachement ${updatedAt}.`,
      attachedLabel: "Attache",
      attachedDetail: (mode, target, suffix) =>
        `${mode} suit actuellement ${target}.${suffix ? ` ${suffix}` : ""}`,
      staleLabel: "Binding obsolete",
      staleDetail: (mode, target, suffix) =>
        `${mode} pointait vers ${target}, mais la session actuelle n'y expose plus de page utilisable.${
          suffix ? ` ${suffix}` : ""
        }`,
      notBoundLabel: "Non lie",
      notBoundDetail:
        "Aucune page provider n'est encore epinglee. Auto discovery peut toujours chercher dans les onglets actuels, ou vous pouvez utiliser Find or open page pour en attacher une explicitement.",
    },
    availabilitySummary: (used, remaining, reset) =>
      `Utilise: ${used} · Restant: ${remaining} · Reset: ${reset}`,
  }),
  de: buildCopy("de", {
    rolloutStageLabels: {
      shipped: "Ausgeliefert",
      planned: "Geplant",
      deferred: "Zuruckgestellt",
    },
    fieldAvailabilityLabels: {
      exact: "Exakt",
      window_only: "Nur Fenster",
      analytics_only: "Analytics",
      documented_policy: "Policy",
      unavailable: "Nicht verfugbar",
    },
    sourceFidelity: {
      exact: {
        label: "Exakter Anbieterwert",
        detail:
          "Dieser Pfad zeigt anbieterberichtete Werte fur tracked usage und remaining balance direkt an.",
      },
      window_only: {
        label: "Fensterbegrenzter Anbieterwert",
        detail:
          "Dieser Pfad zeigt anbieterberichtete Werte fur das aktive Fenster oder einen Teilkontext, nicht eine absolute remaining balance.",
      },
      analytics_only: {
        label: "Analytics-Snapshot",
        detail:
          "Dieser Pfad zeigt aggregierte analytics- oder snapshot-Werte, keinen live remaining counter.",
      },
      policy_only: {
        label: "Dokumentierte policy",
        detail:
          "Dieser Pfad ist nur dokumentierte policy. Es ist keine live page session oder live API source ausgewahlt.",
      },
      local_estimate: {
        label: "Lokale Schatzung",
        detail:
          "Dieser Pfad wurde lokal abgeleitete counters statt anbieterberichteter live usage verwenden.",
      },
    },
    connectionMode: {
      credential: {
        label: "Gespeicherte credential",
        detail:
          "Dieser Pfad lauft aus der extension mit einer credential in extension-managed local storage.",
      },
      page_session: {
        label: "Angemeldete page session",
        detail:
          "Dieser Pfad hangt sich an einen bereits angemeldeten browser tab und liest normalisierte Seitendaten in der aktuellen session.",
      },
      none: {
        label: "Keine live Verbindung",
        detail:
          "Dieser Pfad verwendet keine live credential und keine page session. Die extension zeigt nur dokumentierte policy.",
      },
    },
    sourceContractLabels: {
      shipped_admin_analytics: "Ausgelieferte admin analytics",
      shipped_enterprise_analytics: "Ausgelieferte enterprise analytics",
      shipped_personal_partial: "Ausgelieferte personal partial",
      shipped_policy_only: "Ausgelieferte policy only",
      deferred_personal_page: "Zuruckgestellte personal page",
      deferred_project_metrics: "Zuruckgestellte project metrics",
      deferred_org_console: "Zuruckgestellter org console path",
    },
    credentialPersistence: {
      extensionLocalOnlyLabel: "Nur extension lokal",
      extensionLocalOnlyDetail:
        "Jede konfigurierte credential bleibt nur im extension-managed local storage dieses browser profiles.",
      notApplicableLabel: "Nicht zutreffend",
      notApplicableDetail:
        "Fur den ausgelieferten Vertrag dieses providers wird keine credential gespeichert.",
    },
    cookiePolicy: {
      forbiddenLabel: "Verboten",
      forbiddenDetail: "Raw cookies werden nicht in extension storage persistiert.",
    },
    manualCookieImport: {
      forbiddenLabel: "Verboten",
      forbiddenDetail:
        "Das Produkt fordert Nutzer nicht auf, cookies oder auth headers in extension settings einzufugen.",
    },
    hostAccess: {
      notRequiredLabel: "Nicht erforderlich",
      notRequiredDetail:
        "Der ausgelieferte Vertrag dieses providers benotigt keine optional host permission.",
      requiredLabel: "Erforderlich",
      requiredDetail: (hosts) =>
        `Live access hangt von Chrome host permission fur ${hosts} ab.`,
    },
    sourceState: {
      readyLabel: "Bereit fur sync",
      policyOnlyLabel: "Kein live sync",
      hostAccessMissingLabel: "Host access fehlt",
      hostAccessMissingFallbackDetail:
        "Gewahre den erforderlichen host access, bevor live sync laufen kann.",
      credentialMissingLabel: "Credential fehlt",
      credentialMissingFallbackDetail:
        "Fuge die erforderliche provider credential hinzu, bevor live sync laufen kann.",
      loggedOutLabel: "Abgemeldete Seite",
      loggedOutFallbackDetail:
        "Melde dich erneut auf der provider-Seite an, bevor du das dashboard aktualisierst.",
      openPageRequiredLabel: "Seite muss geoffnet werden",
      openPageRequiredFallbackDetail:
        "Offne die erforderliche angemeldete provider-Seite und aktualisiere erneut.",
      captureUnavailableLabel: "Seitenerfassung nicht verfugbar",
      captureUnavailableFallbackDetail:
        "Lade die geoffnete provider-Seite neu und aktualisiere erneut.",
      syncErrorLabel: "Sync-Problem",
      syncErrorFallbackDetail:
        "Die aktuelle provider source ist wahrend refresh unerwartet fehlgeschlagen.",
    },
    pageBinding: {
      boundTabLabel: "Gebundener Tab",
      autoReconnectLabel: "Automatisch verbinden",
      targetFallback: "die zuletzt passende provider-Seite",
      lastAttachedSuffix: (updatedAt) => `Zuletzt verbunden ${updatedAt}.`,
      attachedLabel: "Verbunden",
      attachedDetail: (mode, target, suffix) =>
        `${mode} verfolgt derzeit ${target}.${suffix ? ` ${suffix}` : ""}`,
      staleLabel: "Veraltetes binding",
      staleDetail: (mode, target, suffix) =>
        `${mode} zeigte zuletzt auf ${target}, aber die aktuelle session gibt dort keine nutzbare Seite mehr frei.${
          suffix ? ` ${suffix}` : ""
        }`,
      notBoundLabel: "Nicht gebunden",
      notBoundDetail:
        "Noch keine provider-Seite ist fixiert. Auto discovery kann weiterhin aktuelle Tabs durchsuchen, oder Find or open page kann explizit verbinden.",
    },
    availabilitySummary: (used, remaining, reset) =>
      `Genutzt: ${used} · Ubrig: ${remaining} · Reset: ${reset}`,
  }),
  it: buildCopy("it", {
    rolloutStageLabels: {
      shipped: "Distribuito",
      planned: "Pianificato",
      deferred: "Rinviato",
    },
    fieldAvailabilityLabels: {
      exact: "Esatto",
      window_only: "Solo finestra",
      analytics_only: "Analytics",
      documented_policy: "Policy",
      unavailable: "Non disponibile",
    },
    sourceFidelity: {
      exact: {
        label: "Valore esatto del provider",
        detail:
          "Questo percorso espone direttamente i valori riportati dal provider per tracked usage e remaining balance.",
      },
      window_only: {
        label: "Valore provider solo finestra",
        detail:
          "Questo percorso espone valori riportati dal provider per la finestra attiva o un contesto parziale, non un remaining balance assoluto.",
      },
      analytics_only: {
        label: "Snapshot analytics",
        detail:
          "Questo percorso espone valori analytics aggregati o snapshot, non un live remaining counter.",
      },
      policy_only: {
        label: "Policy documentata",
        detail:
          "Questo percorso e solo policy documentata. Non e selezionata alcuna live page session o live API source.",
      },
      local_estimate: {
        label: "Stima locale",
        detail:
          "Questo percorso dipenderebbe da counters inferiti localmente invece che da live usage riportato dal provider.",
      },
    },
    connectionMode: {
      credential: {
        label: "Credential salvata",
        detail:
          "Questo percorso gira dall'extension usando una credential salvata in extension-managed local storage.",
      },
      page_session: {
        label: "Page session con login",
        detail:
          "Questo percorso si collega a una scheda browser gia autenticata e legge dati pagina normalizzati nella session corrente.",
      },
      none: {
        label: "Nessuna connessione live",
        detail:
          "Questo percorso non usa live credential o page session. L'extension mostra solo policy documentata.",
      },
    },
    sourceContractLabels: {
      shipped_admin_analytics: "Admin analytics distribuito",
      shipped_enterprise_analytics: "Enterprise analytics distribuito",
      shipped_personal_partial: "Personal partial distribuito",
      shipped_policy_only: "Policy only distribuito",
      deferred_personal_page: "Personal page rinviato",
      deferred_project_metrics: "Project metrics rinviato",
      deferred_org_console: "Org console path rinviato",
    },
    credentialPersistence: {
      extensionLocalOnlyLabel: "Solo locale extension",
      extensionLocalOnlyDetail:
        "Ogni credential configurata resta solo in extension-managed local storage su questo browser profile.",
      notApplicableLabel: "Non applicabile",
      notApplicableDetail:
        "Nessuna credential viene salvata per il contratto distribuito di questo provider.",
    },
    cookiePolicy: {
      forbiddenLabel: "Vietato",
      forbiddenDetail: "I raw cookies non vengono persistiti in extension storage.",
    },
    manualCookieImport: {
      forbiddenLabel: "Vietato",
      forbiddenDetail:
        "Il prodotto non chiede all'utente di incollare cookies o auth headers nelle extension settings.",
    },
    hostAccess: {
      notRequiredLabel: "Non richiesto",
      notRequiredDetail:
        "Il contratto distribuito di questo provider non richiede optional host permission.",
      requiredLabel: "Richiesto",
      requiredDetail: (hosts) =>
        `Live access dipende dalla Chrome host permission per ${hosts}.`,
    },
    sourceState: {
      readyLabel: "Pronto per sync",
      policyOnlyLabel: "Nessun live sync",
      hostAccessMissingLabel: "Host access mancante",
      hostAccessMissingFallbackDetail:
        "Concedi il host access richiesto prima che live sync possa girare.",
      credentialMissingLabel: "Credential mancante",
      credentialMissingFallbackDetail:
        "Aggiungi la provider credential richiesta prima che live sync possa girare.",
      loggedOutLabel: "Pagina disconnessa",
      loggedOutFallbackDetail:
        "Accedi di nuovo alla pagina provider prima di aggiornare il dashboard.",
      openPageRequiredLabel: "Pagina da aprire richiesta",
      openPageRequiredFallbackDetail:
        "Apri la pagina provider autenticata richiesta, poi aggiorna di nuovo.",
      captureUnavailableLabel: "Cattura pagina non disponibile",
      captureUnavailableFallbackDetail:
        "Ricarica la pagina provider aperta, poi aggiorna di nuovo.",
      syncErrorLabel: "Problema sync",
      syncErrorFallbackDetail:
        "Il provider source corrente e fallito in modo inatteso durante il refresh.",
    },
    pageBinding: {
      boundTabLabel: "Scheda collegata",
      autoReconnectLabel: "Riconnessione automatica",
      targetFallback: "l'ultima pagina provider corrispondente",
      lastAttachedSuffix: (updatedAt) => `Ultimo collegamento ${updatedAt}.`,
      attachedLabel: "Collegato",
      attachedDetail: (mode, target, suffix) =>
        `${mode} sta tracciando ${target}.${suffix ? ` ${suffix}` : ""}`,
      staleLabel: "Binding obsoleto",
      staleDetail: (mode, target, suffix) =>
        `${mode} puntava a ${target}, ma la session corrente non espone piu una pagina utilizzabile li.${
          suffix ? ` ${suffix}` : ""
        }`,
      notBoundLabel: "Non collegato",
      notBoundDetail:
        "Nessuna pagina provider e ancora fissata. Auto discovery puo ancora cercare nelle schede correnti, oppure Find or open page puo collegarne una esplicitamente.",
    },
    availabilitySummary: (used, remaining, reset) =>
      `Usato: ${used} · Restante: ${remaining} · Reset: ${reset}`,
  }),
  ru: buildCopy("ru", {
    rolloutStageLabels: {
      shipped: "Выпущено",
      planned: "Запланировано",
      deferred: "Отложено",
    },
    fieldAvailabilityLabels: {
      exact: "Точно",
      window_only: "Только окно",
      analytics_only: "Аналитика",
      documented_policy: "Policy",
      unavailable: "Недоступно",
    },
    sourceFidelity: {
      exact: {
        label: "Точное значение провайдера",
        detail:
          "Этот путь напрямую показывает значения, сообщенные провайдером, для tracked usage и remaining balance.",
      },
      window_only: {
        label: "Значение провайдера только для окна",
        detail:
          "Этот путь показывает значения провайдера для активного окна или частичного контекста, а не абсолютный remaining balance.",
      },
      analytics_only: {
        label: "Снимок аналитики",
        detail:
          "Этот путь показывает агрегированные analytics или snapshot значения, а не live remaining counter.",
      },
      policy_only: {
        label: "Документированная policy",
        detail:
          "Этот путь содержит только документированную policy. Live page session или live API source не выбраны.",
      },
      local_estimate: {
        label: "Локальная оценка",
        detail:
          "Этот путь полагался бы на локально выведенные counters, а не на live usage от провайдера.",
      },
    },
    connectionMode: {
      credential: {
        label: "Сохраненная credential",
        detail:
          "Этот путь выполняется расширением с credential, сохраненной в extension-managed local storage.",
      },
      page_session: {
        label: "Авторизованная page session",
        detail:
          "Этот путь подключается к уже авторизованной вкладке браузера и читает нормализованные данные страницы в текущей session.",
      },
      none: {
        label: "Нет live соединения",
        detail:
          "Этот путь не использует live credential или page session. Расширение показывает только документированную policy.",
      },
    },
    sourceContractLabels: {
      shipped_admin_analytics: "Выпущенная admin analytics",
      shipped_enterprise_analytics: "Выпущенная enterprise analytics",
      shipped_personal_partial: "Выпущенная personal partial",
      shipped_policy_only: "Выпущенная policy only",
      deferred_personal_page: "Отложенная personal page",
      deferred_project_metrics: "Отложенные project metrics",
      deferred_org_console: "Отложенный org console path",
    },
    credentialPersistence: {
      extensionLocalOnlyLabel: "Только локально в extension",
      extensionLocalOnlyDetail:
        "Любая настроенная credential остается только в extension-managed local storage этого browser profile.",
      notApplicableLabel: "Не применимо",
      notApplicableDetail:
        "Для выпущенного contract этого provider credential не сохраняется.",
    },
    cookiePolicy: {
      forbiddenLabel: "Запрещено",
      forbiddenDetail: "Raw cookies не сохраняются в extension storage.",
    },
    manualCookieImport: {
      forbiddenLabel: "Запрещено",
      forbiddenDetail:
        "Продукт не просит пользователя вставлять cookies или auth headers в extension settings.",
    },
    hostAccess: {
      notRequiredLabel: "Не требуется",
      notRequiredDetail:
        "Выпущенный contract этого provider не требует optional host permission.",
      requiredLabel: "Требуется",
      requiredDetail: (hosts) =>
        `Live access зависит от Chrome host permission для ${hosts}.`,
    },
    sourceState: {
      readyLabel: "Готово к sync",
      policyOnlyLabel: "Нет live sync",
      hostAccessMissingLabel: "Host access отсутствует",
      hostAccessMissingFallbackDetail:
        "Предоставьте требуемый host access, прежде чем live sync сможет работать.",
      credentialMissingLabel: "Credential отсутствует",
      credentialMissingFallbackDetail:
        "Добавьте требуемую provider credential, прежде чем live sync сможет работать.",
      loggedOutLabel: "Страница без входа",
      loggedOutFallbackDetail:
        "Снова войдите на странице provider перед обновлением dashboard.",
      openPageRequiredLabel: "Нужно открыть страницу",
      openPageRequiredFallbackDetail:
        "Откройте требуемую авторизованную страницу provider, затем обновите снова.",
      captureUnavailableLabel: "Захват страницы недоступен",
      captureUnavailableFallbackDetail:
        "Перезагрузите открытую страницу provider, затем обновите снова.",
      syncErrorLabel: "Проблема sync",
      syncErrorFallbackDetail:
        "Текущий provider source неожиданно завершился ошибкой во время refresh.",
    },
    pageBinding: {
      boundTabLabel: "Привязанная вкладка",
      autoReconnectLabel: "Автоподключение",
      targetFallback: "последняя совпавшая страница provider",
      lastAttachedSuffix: (updatedAt) => `Последнее подключение ${updatedAt}.`,
      attachedLabel: "Подключено",
      attachedDetail: (mode, target, suffix) =>
        `${mode} сейчас отслеживает ${target}.${suffix ? ` ${suffix}` : ""}`,
      staleLabel: "Устаревший binding",
      staleDetail: (mode, target, suffix) =>
        `${mode} ранее указывал на ${target}, но текущая session больше не показывает там пригодную страницу.${
          suffix ? ` ${suffix}` : ""
        }`,
      notBoundLabel: "Не привязано",
      notBoundDetail:
        "Страница provider еще не закреплена. Auto discovery может искать текущие вкладки, или можно использовать Find or open page для явного подключения.",
    },
    availabilitySummary: (used, remaining, reset) =>
      `Использовано: ${used} · Осталось: ${remaining} · Сброс: ${reset}`,
  }),
  ar: buildCopy("ar", {
    rolloutStageLabels: {
      shipped: "تم الشحن",
      planned: "مخطط",
      deferred: "مؤجل",
    },
    fieldAvailabilityLabels: {
      exact: "دقيق",
      window_only: "النافذة فقط",
      analytics_only: "تحليلات",
      documented_policy: "Policy",
      unavailable: "غير متاح",
    },
    sourceFidelity: {
      exact: {
        label: "قيمة provider دقيقة",
        detail:
          "يعرض هذا المسار القيم التي يبلغها provider مباشرة للـ tracked usage و remaining balance.",
      },
      window_only: {
        label: "قيمة provider للنافذة فقط",
        detail:
          "يعرض هذا المسار قيم provider للنافذة النشطة أو سياق جزئي، وليس remaining balance مطلقا.",
      },
      analytics_only: {
        label: "لقطة analytics",
        detail:
          "يعرض هذا المسار قيم analytics أو snapshot مجمعة، وليس live remaining counter.",
      },
      policy_only: {
        label: "Policy موثقة",
        detail:
          "هذا المسار policy موثقة فقط. لم يتم اختيار live page session أو live API source.",
      },
      local_estimate: {
        label: "تقدير محلي",
        detail:
          "سيعتمد هذا المسار على counters مستنتجة محليا بدلا من live usage المبلغ من provider.",
      },
    },
    connectionMode: {
      credential: {
        label: "Credential محفوظة",
        detail:
          "يعمل هذا المسار من extension باستخدام credential محفوظة في extension-managed local storage.",
      },
      page_session: {
        label: "Page session مسجلة الدخول",
        detail:
          "يتصل هذا المسار بتبويب browser مسجل الدخول ويقرأ بيانات صفحة موحدة داخل session الحالية.",
      },
      none: {
        label: "لا اتصال live",
        detail:
          "لا يستخدم هذا المسار live credential أو page session. يعرض extension policy موثقة فقط.",
      },
    },
    sourceContractLabels: {
      shipped_admin_analytics: "Admin analytics مشحونة",
      shipped_enterprise_analytics: "Enterprise analytics مشحونة",
      shipped_personal_partial: "Personal partial مشحون",
      shipped_policy_only: "Policy only مشحون",
      deferred_personal_page: "Personal page مؤجل",
      deferred_project_metrics: "Project metrics مؤجلة",
      deferred_org_console: "Org console path مؤجل",
    },
    credentialPersistence: {
      extensionLocalOnlyLabel: "محلي في extension فقط",
      extensionLocalOnlyDetail:
        "تبقى أي credential معدة فقط في extension-managed local storage لهذا browser profile.",
      notApplicableLabel: "غير منطبق",
      notApplicableDetail:
        "لا يتم تخزين credential لعقد هذا provider المشحون.",
    },
    cookiePolicy: {
      forbiddenLabel: "ممنوع",
      forbiddenDetail: "لا يتم حفظ raw cookies في extension storage.",
    },
    manualCookieImport: {
      forbiddenLabel: "ممنوع",
      forbiddenDetail:
        "لا يطلب المنتج من المستخدم لصق cookies أو auth headers في extension settings.",
    },
    hostAccess: {
      notRequiredLabel: "غير مطلوب",
      notRequiredDetail:
        "لا يتطلب عقد هذا provider المشحون optional host permission.",
      requiredLabel: "مطلوب",
      requiredDetail: (hosts) =>
        `يعتمد Live access على Chrome host permission لـ ${hosts}.`,
    },
    sourceState: {
      readyLabel: "جاهز للمزامنة",
      policyOnlyLabel: "لا live sync",
      hostAccessMissingLabel: "host access مفقود",
      hostAccessMissingFallbackDetail:
        "امنح host access المطلوب قبل تشغيل live sync.",
      credentialMissingLabel: "credential مفقودة",
      credentialMissingFallbackDetail:
        "أضف provider credential المطلوبة قبل تشغيل live sync.",
      loggedOutLabel: "صفحة غير مسجلة الدخول",
      loggedOutFallbackDetail:
        "سجل الدخول مرة أخرى في صفحة provider قبل تحديث dashboard.",
      openPageRequiredLabel: "يجب فتح الصفحة",
      openPageRequiredFallbackDetail:
        "افتح صفحة provider المطلوبة وهي مسجلة الدخول، ثم حدث مرة أخرى.",
      captureUnavailableLabel: "تعذر التقاط الصفحة",
      captureUnavailableFallbackDetail:
        "أعد تحميل صفحة provider المفتوحة، ثم حدث مرة أخرى.",
      syncErrorLabel: "مشكلة sync",
      syncErrorFallbackDetail:
        "فشل provider source الحالي بشكل غير متوقع أثناء refresh.",
    },
    pageBinding: {
      boundTabLabel: "تبويب مربوط",
      autoReconnectLabel: "إعادة اتصال تلقائية",
      targetFallback: "آخر صفحة provider مطابقة",
      lastAttachedSuffix: (updatedAt) => `آخر اتصال ${updatedAt}.`,
      attachedLabel: "متصل",
      attachedDetail: (mode, target, suffix) =>
        `${mode} يتتبع حاليا ${target}.${suffix ? ` ${suffix}` : ""}`,
      staleLabel: "Binding قديم",
      staleDetail: (mode, target, suffix) =>
        `${mode} كان يشير آخر مرة إلى ${target}، لكن session الحالية لم تعد تعرض صفحة قابلة للاستخدام هناك.${
          suffix ? ` ${suffix}` : ""
        }`,
      notBoundLabel: "غير مربوط",
      notBoundDetail:
        "لم يتم تثبيت صفحة provider بعد. ما زال auto discovery يستطيع البحث في التبويبات الحالية، أو يمكن استخدام Find or open page للربط صراحة.",
    },
    availabilitySummary: (used, remaining, reset) =>
      `المستخدم: ${used} · المتبقي: ${remaining} · إعادة الضبط: ${reset}`,
  }),
  hi: buildCopy("hi", {
    rolloutStageLabels: {
      shipped: "शिप किया गया",
      planned: "योजित",
      deferred: "टाला गया",
    },
    fieldAvailabilityLabels: {
      exact: "सटीक",
      window_only: "सिर्फ window",
      analytics_only: "Analytics",
      documented_policy: "Policy",
      unavailable: "उपलब्ध नहीं",
    },
    sourceFidelity: {
      exact: {
        label: "Provider का सटीक value",
        detail:
          "यह path tracked usage और remaining balance के लिए provider-reported values सीधे दिखाता है।",
      },
      window_only: {
        label: "Window-only provider value",
        detail:
          "यह path active window या partial context के provider-reported values दिखाता है, absolute remaining balance नहीं।",
      },
      analytics_only: {
        label: "Analytics snapshot",
        detail:
          "यह path aggregated analytics या snapshot values दिखाता है, live remaining counter नहीं।",
      },
      policy_only: {
        label: "Documented policy",
        detail:
          "यह path सिर्फ documented policy है। कोई live page session या live API source selected नहीं है।",
      },
      local_estimate: {
        label: "Local estimate",
        detail:
          "यह path provider-reported live usage की जगह locally inferred counters पर निर्भर होगा।",
      },
    },
    connectionMode: {
      credential: {
        label: "Saved credential",
        detail:
          "यह path extension-managed local storage में saved credential का उपयोग करके extension से चलता है।",
      },
      page_session: {
        label: "Signed-in page session",
        detail:
          "यह path पहले से signed-in browser tab से जुड़ता है और current session में normalized page data पढ़ता है।",
      },
      none: {
        label: "Live connection नहीं",
        detail:
          "यह path live credential या page session का उपयोग नहीं करता। extension सिर्फ documented policy दिखाता है।",
      },
    },
    sourceContractLabels: {
      shipped_admin_analytics: "Shipped admin analytics",
      shipped_enterprise_analytics: "Shipped enterprise analytics",
      shipped_personal_partial: "Shipped personal partial",
      shipped_policy_only: "Shipped policy only",
      deferred_personal_page: "Deferred personal page",
      deferred_project_metrics: "Deferred project metrics",
      deferred_org_console: "Deferred org console path",
    },
    credentialPersistence: {
      extensionLocalOnlyLabel: "सिर्फ extension local",
      extensionLocalOnlyDetail:
        "कोई भी configured credential सिर्फ इस browser profile के extension-managed local storage में रहती है।",
      notApplicableLabel: "लागू नहीं",
      notApplicableDetail:
        "इस provider के shipped contract के लिए कोई credential stored नहीं होती।",
    },
    cookiePolicy: {
      forbiddenLabel: "निषिद्ध",
      forbiddenDetail: "Raw cookies extension storage में persist नहीं होतीं।",
    },
    manualCookieImport: {
      forbiddenLabel: "निषिद्ध",
      forbiddenDetail:
        "Product user से cookies या auth headers को extension settings में paste करने को नहीं कहता।",
    },
    hostAccess: {
      notRequiredLabel: "जरूरी नहीं",
      notRequiredDetail:
        "इस provider के shipped contract को optional host permission की जरूरत नहीं है।",
      requiredLabel: "जरूरी",
      requiredDetail: (hosts) =>
        `Live access ${hosts} के Chrome host permission पर निर्भर है।`,
    },
    sourceState: {
      readyLabel: "Sync के लिए ready",
      policyOnlyLabel: "Live sync नहीं",
      hostAccessMissingLabel: "host access गायब",
      hostAccessMissingFallbackDetail:
        "live sync चलने से पहले required host access दें।",
      credentialMissingLabel: "credential गायब",
      credentialMissingFallbackDetail:
        "live sync चलने से पहले required provider credential जोड़ें।",
      loggedOutLabel: "Logged-out page",
      loggedOutFallbackDetail:
        "dashboard refresh करने से पहले provider page में फिर login करें।",
      openPageRequiredLabel: "Page खोलना जरूरी",
      openPageRequiredFallbackDetail:
        "required signed-in provider page खोलें, फिर दोबारा refresh करें।",
      captureUnavailableLabel: "Page capture unavailable",
      captureUnavailableFallbackDetail:
        "open provider page reload करें, फिर दोबारा refresh करें।",
      syncErrorLabel: "Sync issue",
      syncErrorFallbackDetail:
        "Current provider source refresh के दौरान unexpected तरीके से fail हुआ।",
    },
    pageBinding: {
      boundTabLabel: "Bound tab",
      autoReconnectLabel: "Auto reconnect",
      targetFallback: "आखिरी matched provider page",
      lastAttachedSuffix: (updatedAt) => `Last attached ${updatedAt}.`,
      attachedLabel: "Attached",
      attachedDetail: (mode, target, suffix) =>
        `${mode} अभी ${target} track कर रहा है.${suffix ? ` ${suffix}` : ""}`,
      staleLabel: "Stale binding",
      staleDetail: (mode, target, suffix) =>
        `${mode} ने last time ${target} point किया था, लेकिन current session वहां usable page expose नहीं कर रही है.${
          suffix ? ` ${suffix}` : ""
        }`,
      notBoundLabel: "Bound नहीं",
      notBoundDetail:
        "अभी कोई provider page pinned नहीं है। Auto discovery current tabs खोज सकता है, या Find or open page से explicit attach कर सकते हैं।",
    },
    availabilitySummary: (used, remaining, reset) =>
      `इस्तेमाल: ${used} · शेष: ${remaining} · Reset: ${reset}`,
  }),
  id: buildCopy("id", {
    rolloutStageLabels: {
      shipped: "Dikirim",
      planned: "Direncanakan",
      deferred: "Ditunda",
    },
    fieldAvailabilityLabels: {
      exact: "Akurat",
      window_only: "Hanya window",
      analytics_only: "Analytics",
      documented_policy: "Policy",
      unavailable: "Tidak tersedia",
    },
    sourceFidelity: {
      exact: {
        label: "Nilai provider akurat",
        detail:
          "Jalur ini menampilkan langsung nilai yang dilaporkan provider untuk tracked usage dan remaining balance.",
      },
      window_only: {
        label: "Nilai provider hanya window",
        detail:
          "Jalur ini menampilkan nilai provider untuk window aktif atau konteks parsial, bukan remaining balance absolut.",
      },
      analytics_only: {
        label: "Snapshot analytics",
        detail:
          "Jalur ini menampilkan nilai analytics agregat atau snapshot, bukan live remaining counter.",
      },
      policy_only: {
        label: "Policy terdokumentasi",
        detail:
          "Jalur ini hanya policy terdokumentasi. Tidak ada live page session atau live API source yang dipilih.",
      },
      local_estimate: {
        label: "Estimasi lokal",
        detail:
          "Jalur ini akan bergantung pada counters yang disimpulkan lokal, bukan live usage yang dilaporkan provider.",
      },
    },
    connectionMode: {
      credential: {
        label: "Credential tersimpan",
        detail:
          "Jalur ini berjalan dari extension memakai credential yang disimpan di extension-managed local storage.",
      },
      page_session: {
        label: "Page session sudah login",
        detail:
          "Jalur ini menempel ke browser tab yang sudah login dan membaca data halaman ternormalisasi di session saat ini.",
      },
      none: {
        label: "Tanpa koneksi live",
        detail:
          "Jalur ini tidak memakai live credential atau page session. Extension hanya menampilkan policy terdokumentasi.",
      },
    },
    sourceContractLabels: {
      shipped_admin_analytics: "Admin analytics dikirim",
      shipped_enterprise_analytics: "Enterprise analytics dikirim",
      shipped_personal_partial: "Personal partial dikirim",
      shipped_policy_only: "Policy only dikirim",
      deferred_personal_page: "Personal page ditunda",
      deferred_project_metrics: "Project metrics ditunda",
      deferred_org_console: "Org console path ditunda",
    },
    credentialPersistence: {
      extensionLocalOnlyLabel: "Hanya lokal extension",
      extensionLocalOnlyDetail:
        "Setiap credential yang dikonfigurasi hanya berada di extension-managed local storage pada browser profile ini.",
      notApplicableLabel: "Tidak berlaku",
      notApplicableDetail:
        "Tidak ada credential yang disimpan untuk kontrak terkirim provider ini.",
    },
    cookiePolicy: {
      forbiddenLabel: "Dilarang",
      forbiddenDetail: "Raw cookies tidak disimpan permanen di extension storage.",
    },
    manualCookieImport: {
      forbiddenLabel: "Dilarang",
      forbiddenDetail:
        "Produk tidak meminta user menempelkan cookies atau auth headers ke extension settings.",
    },
    hostAccess: {
      notRequiredLabel: "Tidak diperlukan",
      notRequiredDetail:
        "Kontrak terkirim provider ini tidak memerlukan optional host permission.",
      requiredLabel: "Diperlukan",
      requiredDetail: (hosts) =>
        `Live access bergantung pada Chrome host permission untuk ${hosts}.`,
    },
    sourceState: {
      readyLabel: "Siap sync",
      policyOnlyLabel: "Tanpa live sync",
      hostAccessMissingLabel: "Host access belum ada",
      hostAccessMissingFallbackDetail:
        "Berikan host access yang diperlukan sebelum live sync bisa berjalan.",
      credentialMissingLabel: "Credential belum ada",
      credentialMissingFallbackDetail:
        "Tambahkan provider credential yang diperlukan sebelum live sync bisa berjalan.",
      loggedOutLabel: "Halaman logout",
      loggedOutFallbackDetail:
        "Login lagi di halaman provider sebelum me-refresh dashboard.",
      openPageRequiredLabel: "Perlu membuka halaman",
      openPageRequiredFallbackDetail:
        "Buka halaman provider yang diperlukan dan sudah login, lalu refresh lagi.",
      captureUnavailableLabel: "Capture halaman tidak tersedia",
      captureUnavailableFallbackDetail:
        "Reload halaman provider yang terbuka, lalu refresh lagi.",
      syncErrorLabel: "Masalah sync",
      syncErrorFallbackDetail:
        "Provider source saat ini gagal secara tidak terduga saat refresh.",
    },
    pageBinding: {
      boundTabLabel: "Tab terikat",
      autoReconnectLabel: "Reconnect otomatis",
      targetFallback: "halaman provider terakhir yang cocok",
      lastAttachedSuffix: (updatedAt) => `Terakhir attach ${updatedAt}.`,
      attachedLabel: "Terhubung",
      attachedDetail: (mode, target, suffix) =>
        `${mode} sedang melacak ${target}.${suffix ? ` ${suffix}` : ""}`,
      staleLabel: "Binding usang",
      staleDetail: (mode, target, suffix) =>
        `${mode} terakhir menunjuk ke ${target}, tetapi session saat ini tidak lagi mengekspos halaman yang bisa digunakan di sana.${
          suffix ? ` ${suffix}` : ""
        }`,
      notBoundLabel: "Belum terikat",
      notBoundDetail:
        "Belum ada halaman provider yang dipin. Auto discovery masih bisa mencari tab saat ini, atau gunakan Find or open page untuk attach secara eksplisit.",
    },
    availabilitySummary: (used, remaining, reset) =>
      `Terpakai: ${used} · Tersisa: ${remaining} · Reset: ${reset}`,
  }),
};

export function getProviderSourceDisplayExtendedCopy(
  locale: ResolvedAppLocale,
): ProviderSourceDisplayCopy | null {
  if (locale === "en" || locale === "zh-CN") {
    return null;
  }

  return PROVIDER_SOURCE_DISPLAY_EXTENDED_COPY[locale];
}
