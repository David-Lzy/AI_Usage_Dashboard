import type { ProviderDiagnostic, ProviderDiagnosticParams } from "../providers/types";
import type { ResolvedAppLocale, RuntimeI18n } from "./i18n";
import type { ProviderDiagnosticPresentation } from "./provider-diagnostic-presentation";

type WarningDiagnosticCode =
  | "credential.admin_api_key_missing"
  | "credential.workspace_config_missing"
  | "host_access.missing"
  | "host_access.required_for_live_sync"
  | "page_session.open_page_required"
  | "page_session.logged_out"
  | "page_session.capture_unavailable"
  | "usage.threshold_warning"
  | "usage.overage_detected"
  | "usage.on_demand_off"
  | "policy.live_source_unavailable"
  | "policy.documented_limit_only"
  | "sync.automatic_sync_overdue"
  | "sync.cached_state_stale";

type FixedWarningDiagnosticCopy = {
  label: string;
  summary: string;
};

type WarningDiagnosticCopy = {
  fixed: Record<
    Exclude<
      WarningDiagnosticCode,
      | "usage.threshold_warning"
      | "usage.overage_detected"
      | "sync.automatic_sync_overdue"
      | "sync.cached_state_stale"
    >,
    FixedWarningDiagnosticCopy
  >;
  labels: Pick<
    Record<WarningDiagnosticCode, string>,
    | "usage.threshold_warning"
    | "usage.overage_detected"
    | "sync.automatic_sync_overdue"
    | "sync.cached_state_stale"
  >;
  thresholdWithPercents: (usagePercent: string, thresholdPercent: string) => string;
  thresholdWithUnit: (unitLabel: string) => string;
  thresholdFallback: string;
  overageWithCount: (overageCount: string, unitLabel: string) => string;
  overageFallback: string;
  syncStaleWithMinutes: (ageMinutes: string, staleAfterMinutes: string) => string;
  syncStaleFallback: string;
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

const WARNING_DIAGNOSTIC_COPY: Record<ResolvedAppLocale, WarningDiagnosticCopy> = {
  en: {
    fixed: {
      "credential.admin_api_key_missing": {
        label: "Admin API key missing",
        summary: "Add the required Admin API key before this official source can sync.",
      },
      "credential.workspace_config_missing": {
        label: "Workspace config missing",
        summary:
          "Add both the analytics API key and workspace ID before this workspace source can sync.",
      },
      "host_access.missing": {
        label: "Host access missing",
        summary: "Grant the required provider host access before live sync can run.",
      },
      "host_access.required_for_live_sync": {
        label: "Host access missing",
        summary: "Grant the required provider host access before live sync can run.",
      },
      "page_session.open_page_required": {
        label: "Open page required",
        summary: "Open the logged-in provider usage page before refreshing again.",
      },
      "page_session.logged_out": {
        label: "Page session logged out",
        summary: "Sign back into the provider page before running page-session sync.",
      },
      "page_session.capture_unavailable": {
        label: "Page capture unavailable",
        summary:
          "The current page could not be read by the extension; keep the raw detail for permission, page-state, or route review.",
      },
      "usage.on_demand_off": {
        label: "On-demand usage off",
        summary: "On-demand usage is currently turned off for this provider.",
      },
      "policy.live_source_unavailable": {
        label: "No live source",
        summary:
          "This provider only shows policy information because no stable live usage source is selected.",
      },
      "policy.documented_limit_only": {
        label: "Documented limit only",
        summary: "This state comes from documented quota policy, not live per-user usage.",
      },
    },
    labels: {
      "usage.threshold_warning": "Usage threshold",
      "usage.overage_detected": "Overage detected",
      "sync.automatic_sync_overdue": "Automatic sync overdue",
      "sync.cached_state_stale": "Cached state stale",
    },
    thresholdWithPercents: (usagePercent, thresholdPercent) =>
      `Usage is at ${usagePercent}, reaching the ${thresholdPercent} warning threshold.`,
    thresholdWithUnit: (unitLabel) =>
      `Current ${unitLabel} usage reached the warning threshold.`,
    thresholdFallback: "Current usage reached the warning threshold.",
    overageWithCount: (overageCount, unitLabel) =>
      `${overageCount} overage ${unitLabel} recorded.`,
    overageFallback: "Overage usage is detected.",
    syncStaleWithMinutes: (ageMinutes, staleAfterMinutes) =>
      `Cache age is ${ageMinutes} minutes, above the ${staleAfterMinutes} minute freshness threshold.`,
    syncStaleFallback: "Cached freshness is overdue.",
  },
  "zh-CN": {
    fixed: {
      "credential.admin_api_key_missing": {
        label: "缺少 Admin API key",
        summary: "添加所需 Admin API key 后，这条官方来源才能同步。",
      },
      "credential.workspace_config_missing": {
        label: "缺少 workspace config",
        summary: "添加 analytics API key 和 workspace ID 后，这条 workspace 来源才能同步。",
      },
      "host_access.missing": {
        label: "缺少 host access",
        summary: "授予所需 provider host 权限后，live sync 才能运行。",
      },
      "host_access.required_for_live_sync": {
        label: "缺少 host access",
        summary: "授予所需 provider host 权限后，live sync 才能运行。",
      },
      "page_session.open_page_required": {
        label: "需要打开页面",
        summary: "打开已登录的 provider usage 页面后再刷新。",
      },
      "page_session.logged_out": {
        label: "页面会话未登录",
        summary: "重新登录 provider 页面后再运行 page-session sync。",
      },
      "page_session.capture_unavailable": {
        label: "页面捕获不可用",
        summary:
          "当前页面无法被扩展读取；保留 raw detail 用于权限、页面状态或 route 检查。",
      },
      "usage.on_demand_off": {
        label: "按需用量关闭",
        summary: "当前 provider 的 on-demand 用量开关处于关闭状态。",
      },
      "policy.live_source_unavailable": {
        label: "无 live source",
        summary: "当前 provider 只显示策略信息，没有稳定 live usage source。",
      },
      "policy.documented_limit_only": {
        label: "仅文档化限制",
        summary: "当前状态来自文档化 quota policy，不代表 live per-user usage。",
      },
    },
    labels: {
      "usage.threshold_warning": "用量阈值",
      "usage.overage_detected": "检测到超额",
      "sync.automatic_sync_overdue": "自动同步逾期",
      "sync.cached_state_stale": "缓存状态过期",
    },
    thresholdWithPercents: (usagePercent, thresholdPercent) =>
      `当前用量 ${usagePercent}，已达到 ${thresholdPercent} 告警阈值。`,
    thresholdWithUnit: (unitLabel) => `当前 ${unitLabel} 用量已达到告警阈值。`,
    thresholdFallback: "当前用量已达到告警阈值。",
    overageWithCount: (overageCount, unitLabel) =>
      `已记录 ${overageCount} 个超额 ${unitLabel}。`,
    overageFallback: "已检测到超额用量。",
    syncStaleWithMinutes: (ageMinutes, staleAfterMinutes) =>
      `缓存年龄 ${ageMinutes} 分钟，已超过 ${staleAfterMinutes} 分钟 freshness 阈值。`,
    syncStaleFallback: "缓存 freshness 已过期。",
  },
  "zh-TW": {
    fixed: {
      "credential.admin_api_key_missing": {
        label: "缺少 Admin API key",
        summary: "新增所需 Admin API key 後，這個官方來源才能同步。",
      },
      "credential.workspace_config_missing": {
        label: "缺少 workspace config",
        summary: "新增 analytics API key 和 workspace ID 後，這個 workspace 來源才能同步。",
      },
      "host_access.missing": {
        label: "缺少 host access",
        summary: "授予所需 provider host 權限後，live sync 才能執行。",
      },
      "host_access.required_for_live_sync": {
        label: "缺少 host access",
        summary: "授予所需 provider host 權限後，live sync 才能執行。",
      },
      "page_session.open_page_required": {
        label: "需要開啟頁面",
        summary: "開啟已登入的 provider usage 頁面後再重新整理。",
      },
      "page_session.logged_out": {
        label: "頁面工作階段未登入",
        summary: "重新登入 provider 頁面後再執行 page-session sync。",
      },
      "page_session.capture_unavailable": {
        label: "頁面擷取不可用",
        summary: "目前頁面無法被擴充功能讀取；保留 raw detail 供權限、頁面狀態或 route 檢查。",
      },
      "usage.on_demand_off": {
        label: "按需用量關閉",
        summary: "目前 provider 的 on-demand 用量開關已關閉。",
      },
      "policy.live_source_unavailable": {
        label: "無 live source",
        summary: "目前 provider 只顯示策略資訊，沒有穩定的 live usage source。",
      },
      "policy.documented_limit_only": {
        label: "僅文件化限制",
        summary: "目前狀態來自文件化 quota policy，不代表 live per-user usage。",
      },
    },
    labels: {
      "usage.threshold_warning": "用量閾值",
      "usage.overage_detected": "偵測到超額",
      "sync.automatic_sync_overdue": "自動同步逾期",
      "sync.cached_state_stale": "快取狀態過期",
    },
    thresholdWithPercents: (usagePercent, thresholdPercent) =>
      `目前用量 ${usagePercent}，已達到 ${thresholdPercent} 告警閾值。`,
    thresholdWithUnit: (unitLabel) => `目前 ${unitLabel} 用量已達到告警閾值。`,
    thresholdFallback: "目前用量已達到告警閾值。",
    overageWithCount: (overageCount, unitLabel) =>
      `已記錄 ${overageCount} 個超額 ${unitLabel}。`,
    overageFallback: "已偵測到超額用量。",
    syncStaleWithMinutes: (ageMinutes, staleAfterMinutes) =>
      `快取年齡為 ${ageMinutes} 分鐘，已超過 ${staleAfterMinutes} 分鐘 freshness 閾值。`,
    syncStaleFallback: "快取 freshness 已逾期。",
  },
  ja: {
    fixed: {
      "credential.admin_api_key_missing": {
        label: "Admin API keyがありません",
        summary: "必要なAdmin API keyを追加すると、この公式ソースを同期できます。",
      },
      "credential.workspace_config_missing": {
        label: "workspace configがありません",
        summary:
          "analytics API keyとworkspace IDを追加すると、このworkspaceソースを同期できます。",
      },
      "host_access.missing": {
        label: "host accessがありません",
        summary: "必要なprovider host権限を付与すると、live syncを実行できます。",
      },
      "host_access.required_for_live_sync": {
        label: "host accessがありません",
        summary: "必要なprovider host権限を付与すると、live syncを実行できます。",
      },
      "page_session.open_page_required": {
        label: "ページを開く必要があります",
        summary: "ログイン済みのprovider usageページを開いてから、もう一度更新してください。",
      },
      "page_session.logged_out": {
        label: "ページセッションがログアウトしています",
        summary: "page-session syncを実行する前にproviderページへ再度ログインしてください。",
      },
      "page_session.capture_unavailable": {
        label: "ページキャプチャを利用できません",
        summary:
          "現在のページを拡張機能で読み取れません。権限、ページ状態、route確認のためraw detailを保持します。",
      },
      "usage.on_demand_off": {
        label: "オンデマンド使用量はオフ",
        summary: "このproviderではon-demand使用量が現在オフです。",
      },
      "policy.live_source_unavailable": {
        label: "live sourceなし",
        summary:
          "安定したlive usage sourceが選択されていないため、このproviderはポリシー情報のみを表示します。",
      },
      "policy.documented_limit_only": {
        label: "文書化された制限のみ",
        summary: "この状態は文書化されたquota policyに基づき、live per-user usageではありません。",
      },
    },
    labels: {
      "usage.threshold_warning": "使用量しきい値",
      "usage.overage_detected": "超過を検出",
      "sync.automatic_sync_overdue": "自動同期が期限切れ",
      "sync.cached_state_stale": "キャッシュ状態が古い",
    },
    thresholdWithPercents: (usagePercent, thresholdPercent) =>
      `現在の使用量は${usagePercent}で、${thresholdPercent}の警告しきい値に達しています。`,
    thresholdWithUnit: (unitLabel) =>
      `現在の${unitLabel}使用量が警告しきい値に達しました。`,
    thresholdFallback: "現在の使用量が警告しきい値に達しました。",
    overageWithCount: (overageCount, unitLabel) =>
      `${overageCount}件の超過${unitLabel}を記録しました。`,
    overageFallback: "超過使用量が検出されました。",
    syncStaleWithMinutes: (ageMinutes, staleAfterMinutes) =>
      `キャッシュ年齢は${ageMinutes}分で、${staleAfterMinutes}分のfreshnessしきい値を超えています。`,
    syncStaleFallback: "キャッシュのfreshnessが期限切れです。",
  },
  ko: {
    fixed: {
      "credential.admin_api_key_missing": {
        label: "Admin API key 없음",
        summary: "필요한 Admin API key를 추가해야 이 공식 소스를 동기화할 수 있습니다.",
      },
      "credential.workspace_config_missing": {
        label: "workspace config 없음",
        summary:
          "analytics API key와 workspace ID를 모두 추가해야 이 workspace 소스를 동기화할 수 있습니다.",
      },
      "host_access.missing": {
        label: "host access 없음",
        summary: "필요한 provider host 권한을 부여해야 live sync를 실행할 수 있습니다.",
      },
      "host_access.required_for_live_sync": {
        label: "host access 없음",
        summary: "필요한 provider host 권한을 부여해야 live sync를 실행할 수 있습니다.",
      },
      "page_session.open_page_required": {
        label: "페이지 열기 필요",
        summary: "로그인된 provider usage 페이지를 연 뒤 다시 새로고침하세요.",
      },
      "page_session.logged_out": {
        label: "페이지 세션 로그아웃됨",
        summary: "page-session sync를 실행하기 전에 provider 페이지에 다시 로그인하세요.",
      },
      "page_session.capture_unavailable": {
        label: "페이지 캡처 사용 불가",
        summary:
          "현재 페이지를 확장 프로그램이 읽을 수 없습니다. 권한, 페이지 상태 또는 route 검토를 위해 raw detail을 유지합니다.",
      },
      "usage.on_demand_off": {
        label: "온디맨드 사용량 꺼짐",
        summary: "이 provider의 on-demand 사용량이 현재 꺼져 있습니다.",
      },
      "policy.live_source_unavailable": {
        label: "live source 없음",
        summary:
          "안정적인 live usage source가 선택되지 않아 이 provider는 정책 정보만 표시합니다.",
      },
      "policy.documented_limit_only": {
        label: "문서화된 제한만",
        summary: "이 상태는 문서화된 quota policy에서 온 것이며 live per-user usage가 아닙니다.",
      },
    },
    labels: {
      "usage.threshold_warning": "사용량 임계값",
      "usage.overage_detected": "초과 감지됨",
      "sync.automatic_sync_overdue": "자동 동기화 지연",
      "sync.cached_state_stale": "캐시 상태 오래됨",
    },
    thresholdWithPercents: (usagePercent, thresholdPercent) =>
      `현재 사용량은 ${usagePercent}이며 ${thresholdPercent} 경고 임계값에 도달했습니다.`,
    thresholdWithUnit: (unitLabel) =>
      `현재 ${unitLabel} 사용량이 경고 임계값에 도달했습니다.`,
    thresholdFallback: "현재 사용량이 경고 임계값에 도달했습니다.",
    overageWithCount: (overageCount, unitLabel) =>
      `${overageCount}개의 초과 ${unitLabel}이 기록되었습니다.`,
    overageFallback: "초과 사용량이 감지되었습니다.",
    syncStaleWithMinutes: (ageMinutes, staleAfterMinutes) =>
      `캐시 나이는 ${ageMinutes}분이며 ${staleAfterMinutes}분 freshness 임계값을 초과했습니다.`,
    syncStaleFallback: "캐시 freshness가 지연되었습니다.",
  },
  "es-419": {
    fixed: {
      "credential.admin_api_key_missing": {
        label: "Falta Admin API key",
        summary:
          "Agrega la Admin API key requerida antes de sincronizar esta fuente oficial.",
      },
      "credential.workspace_config_missing": {
        label: "Falta workspace config",
        summary:
          "Agrega la analytics API key y el workspace ID antes de sincronizar esta fuente de workspace.",
      },
      "host_access.missing": {
        label: "Falta host access",
        summary: "Concede el acceso al provider host requerido antes de ejecutar live sync.",
      },
      "host_access.required_for_live_sync": {
        label: "Falta host access",
        summary: "Concede el acceso al provider host requerido antes de ejecutar live sync.",
      },
      "page_session.open_page_required": {
        label: "Se requiere abrir la página",
        summary: "Abre la página de provider usage con sesión iniciada antes de actualizar.",
      },
      "page_session.logged_out": {
        label: "Sesión de página cerrada",
        summary:
          "Vuelve a iniciar sesión en la página del provider antes de ejecutar page-session sync.",
      },
      "page_session.capture_unavailable": {
        label: "Captura de página no disponible",
        summary:
          "La extensión no pudo leer la página actual; conserva el raw detail para revisar permisos, estado de página o route.",
      },
      "usage.on_demand_off": {
        label: "Uso on-demand desactivado",
        summary: "El uso on-demand está desactivado para este provider.",
      },
      "policy.live_source_unavailable": {
        label: "Sin live source",
        summary:
          "Este provider solo muestra información de política porque no hay un live usage source estable seleccionado.",
      },
      "policy.documented_limit_only": {
        label: "Solo límite documentado",
        summary:
          "Este estado viene de una quota policy documentada, no de live per-user usage.",
      },
    },
    labels: {
      "usage.threshold_warning": "Umbral de uso",
      "usage.overage_detected": "Exceso detectado",
      "sync.automatic_sync_overdue": "Sincronización automática vencida",
      "sync.cached_state_stale": "Estado en caché vencido",
    },
    thresholdWithPercents: (usagePercent, thresholdPercent) =>
      `El uso está en ${usagePercent}, alcanzando el umbral de advertencia de ${thresholdPercent}.`,
    thresholdWithUnit: (unitLabel) =>
      `El uso actual de ${unitLabel} alcanzó el umbral de advertencia.`,
    thresholdFallback: "El uso actual alcanzó el umbral de advertencia.",
    overageWithCount: (overageCount, unitLabel) =>
      `Se registraron ${overageCount} ${unitLabel} de exceso.`,
    overageFallback: "Se detectó uso excedente.",
    syncStaleWithMinutes: (ageMinutes, staleAfterMinutes) =>
      `La caché tiene ${ageMinutes} minutos, por encima del umbral de freshness de ${staleAfterMinutes} minutos.`,
    syncStaleFallback: "La freshness de la caché está vencida.",
  },
  "pt-BR": {
    fixed: {
      "credential.admin_api_key_missing": {
        label: "Admin API key ausente",
        summary:
          "Adicione a Admin API key necessária antes de sincronizar esta fonte oficial.",
      },
      "credential.workspace_config_missing": {
        label: "workspace config ausente",
        summary:
          "Adicione a analytics API key e o workspace ID antes de sincronizar esta fonte de workspace.",
      },
      "host_access.missing": {
        label: "host access ausente",
        summary: "Conceda o provider host access necessário antes de executar live sync.",
      },
      "host_access.required_for_live_sync": {
        label: "host access ausente",
        summary: "Conceda o provider host access necessário antes de executar live sync.",
      },
      "page_session.open_page_required": {
        label: "Página aberta necessária",
        summary: "Abra a página de provider usage autenticada antes de atualizar novamente.",
      },
      "page_session.logged_out": {
        label: "Sessão da página desconectada",
        summary:
          "Entre novamente na página do provider antes de executar page-session sync.",
      },
      "page_session.capture_unavailable": {
        label: "Captura de página indisponível",
        summary:
          "A extensão não conseguiu ler a página atual; mantenha o raw detail para revisar permissão, estado da página ou route.",
      },
      "usage.on_demand_off": {
        label: "Uso on-demand desativado",
        summary: "O uso on-demand está desativado para este provider.",
      },
      "policy.live_source_unavailable": {
        label: "Sem live source",
        summary:
          "Este provider mostra apenas informações de política porque nenhum live usage source estável foi selecionado.",
      },
      "policy.documented_limit_only": {
        label: "Somente limite documentado",
        summary:
          "Este estado vem de uma quota policy documentada, não de live per-user usage.",
      },
    },
    labels: {
      "usage.threshold_warning": "Limite de uso",
      "usage.overage_detected": "Excesso detectado",
      "sync.automatic_sync_overdue": "Sincronização automática atrasada",
      "sync.cached_state_stale": "Estado em cache desatualizado",
    },
    thresholdWithPercents: (usagePercent, thresholdPercent) =>
      `O uso está em ${usagePercent}, atingindo o limite de alerta de ${thresholdPercent}.`,
    thresholdWithUnit: (unitLabel) =>
      `O uso atual de ${unitLabel} atingiu o limite de alerta.`,
    thresholdFallback: "O uso atual atingiu o limite de alerta.",
    overageWithCount: (overageCount, unitLabel) =>
      `${overageCount} ${unitLabel} excedente registrado.`,
    overageFallback: "Uso excedente detectado.",
    syncStaleWithMinutes: (ageMinutes, staleAfterMinutes) =>
      `A idade do cache é ${ageMinutes} minutos, acima do limite de freshness de ${staleAfterMinutes} minutos.`,
    syncStaleFallback: "A freshness do cache está atrasada.",
  },
  fr: {
    fixed: {
      "credential.admin_api_key_missing": {
        label: "Admin API key manquante",
        summary:
          "Ajoutez l'Admin API key requise avant de synchroniser cette source officielle.",
      },
      "credential.workspace_config_missing": {
        label: "workspace config manquante",
        summary:
          "Ajoutez l'analytics API key et le workspace ID avant de synchroniser cette source workspace.",
      },
      "host_access.missing": {
        label: "host access manquant",
        summary: "Accordez le provider host access requis avant d'executer live sync.",
      },
      "host_access.required_for_live_sync": {
        label: "host access manquant",
        summary: "Accordez le provider host access requis avant d'executer live sync.",
      },
      "page_session.open_page_required": {
        label: "Page ouverte requise",
        summary: "Ouvrez la page provider usage connectee avant de relancer l'actualisation.",
      },
      "page_session.logged_out": {
        label: "Session de page deconnectee",
        summary:
          "Reconnectez-vous a la page du provider avant d'executer page-session sync.",
      },
      "page_session.capture_unavailable": {
        label: "Capture de page indisponible",
        summary:
          "L'extension n'a pas pu lire la page actuelle; conservez le raw detail pour verifier les permissions, l'etat de page ou la route.",
      },
      "usage.on_demand_off": {
        label: "Usage on-demand desactive",
        summary: "L'usage on-demand est actuellement desactive pour ce provider.",
      },
      "policy.live_source_unavailable": {
        label: "Aucune live source",
        summary:
          "Ce provider affiche seulement les informations de politique, car aucune live usage source stable n'est selectionnee.",
      },
      "policy.documented_limit_only": {
        label: "Limite documentee seulement",
        summary:
          "Cet etat vient d'une quota policy documentee, pas de live per-user usage.",
      },
    },
    labels: {
      "usage.threshold_warning": "Seuil d'usage",
      "usage.overage_detected": "Depassement detecte",
      "sync.automatic_sync_overdue": "Synchronisation automatique en retard",
      "sync.cached_state_stale": "Etat du cache perime",
    },
    thresholdWithPercents: (usagePercent, thresholdPercent) =>
      `L'usage est a ${usagePercent}, ce qui atteint le seuil d'alerte de ${thresholdPercent}.`,
    thresholdWithUnit: (unitLabel) =>
      `L'usage ${unitLabel} actuel a atteint le seuil d'alerte.`,
    thresholdFallback: "L'usage actuel a atteint le seuil d'alerte.",
    overageWithCount: (overageCount, unitLabel) =>
      `${overageCount} ${unitLabel} de depassement enregistres.`,
    overageFallback: "Un usage depasse a ete detecte.",
    syncStaleWithMinutes: (ageMinutes, staleAfterMinutes) =>
      `L'age du cache est de ${ageMinutes} minutes, au-dessus du seuil de freshness de ${staleAfterMinutes} minutes.`,
    syncStaleFallback: "La freshness du cache est en retard.",
  },
  de: {
    fixed: {
      "credential.admin_api_key_missing": {
        label: "Admin API key fehlt",
        summary:
          "Fuge den erforderlichen Admin API key hinzu, bevor diese offizielle Quelle synchronisieren kann.",
      },
      "credential.workspace_config_missing": {
        label: "workspace config fehlt",
        summary:
          "Fuge analytics API key und workspace ID hinzu, bevor diese workspace-Quelle synchronisieren kann.",
      },
      "host_access.missing": {
        label: "host access fehlt",
        summary: "Gewahre den erforderlichen provider host access, bevor live sync laufen kann.",
      },
      "host_access.required_for_live_sync": {
        label: "host access fehlt",
        summary: "Gewahre den erforderlichen provider host access, bevor live sync laufen kann.",
      },
      "page_session.open_page_required": {
        label: "Offene Seite erforderlich",
        summary:
          "Offne die angemeldete provider usage-Seite, bevor du erneut aktualisierst.",
      },
      "page_session.logged_out": {
        label: "Seitensitzung abgemeldet",
        summary:
          "Melde dich wieder auf der provider-Seite an, bevor page-session sync ausgefuhrt wird.",
      },
      "page_session.capture_unavailable": {
        label: "Seitenerfassung nicht verfugbar",
        summary:
          "Die Erweiterung konnte die aktuelle Seite nicht lesen; behalte raw detail fur Berechtigungs-, Seitenstatus- oder route-Prufung.",
      },
      "usage.on_demand_off": {
        label: "On-demand-Nutzung aus",
        summary: "On-demand-Nutzung ist fur diesen provider derzeit deaktiviert.",
      },
      "policy.live_source_unavailable": {
        label: "Keine live source",
        summary:
          "Dieser provider zeigt nur Policy-Informationen, weil keine stabile live usage source ausgewahlt ist.",
      },
      "policy.documented_limit_only": {
        label: "Nur dokumentiertes Limit",
        summary:
          "Dieser Zustand stammt aus dokumentierter quota policy, nicht aus live per-user usage.",
      },
    },
    labels: {
      "usage.threshold_warning": "Nutzungsschwelle",
      "usage.overage_detected": "Uberschreitung erkannt",
      "sync.automatic_sync_overdue": "Automatische Synchronisierung uberfallig",
      "sync.cached_state_stale": "Cache-Zustand veraltet",
    },
    thresholdWithPercents: (usagePercent, thresholdPercent) =>
      `Die Nutzung liegt bei ${usagePercent} und erreicht die Warnschwelle von ${thresholdPercent}.`,
    thresholdWithUnit: (unitLabel) =>
      `Die aktuelle ${unitLabel}-Nutzung hat die Warnschwelle erreicht.`,
    thresholdFallback: "Die aktuelle Nutzung hat die Warnschwelle erreicht.",
    overageWithCount: (overageCount, unitLabel) =>
      `${overageCount} Uberschreitungs-${unitLabel} aufgezeichnet.`,
    overageFallback: "Uberschreitende Nutzung wurde erkannt.",
    syncStaleWithMinutes: (ageMinutes, staleAfterMinutes) =>
      `Das Cache-Alter betragt ${ageMinutes} Minuten und liegt uber der freshness-Schwelle von ${staleAfterMinutes} Minuten.`,
    syncStaleFallback: "Die Cache-freshness ist uberfallig.",
  },
  it: {
    fixed: {
      "credential.admin_api_key_missing": {
        label: "Admin API key mancante",
        summary:
          "Aggiungi l'Admin API key richiesta prima di sincronizzare questa fonte ufficiale.",
      },
      "credential.workspace_config_missing": {
        label: "workspace config mancante",
        summary:
          "Aggiungi analytics API key e workspace ID prima di sincronizzare questa fonte workspace.",
      },
      "host_access.missing": {
        label: "host access mancante",
        summary: "Concedi il provider host access richiesto prima di eseguire live sync.",
      },
      "host_access.required_for_live_sync": {
        label: "host access mancante",
        summary: "Concedi il provider host access richiesto prima di eseguire live sync.",
      },
      "page_session.open_page_required": {
        label: "Pagina aperta richiesta",
        summary: "Apri la pagina provider usage autenticata prima di aggiornare di nuovo.",
      },
      "page_session.logged_out": {
        label: "Sessione pagina disconnessa",
        summary:
          "Accedi di nuovo alla pagina del provider prima di eseguire page-session sync.",
      },
      "page_session.capture_unavailable": {
        label: "Cattura pagina non disponibile",
        summary:
          "L'estensione non ha potuto leggere la pagina corrente; conserva il raw detail per verificare permessi, stato pagina o route.",
      },
      "usage.on_demand_off": {
        label: "Uso on-demand disattivato",
        summary: "L'uso on-demand e attualmente disattivato per questo provider.",
      },
      "policy.live_source_unavailable": {
        label: "Nessuna live source",
        summary:
          "Questo provider mostra solo informazioni di policy perche non e selezionata una live usage source stabile.",
      },
      "policy.documented_limit_only": {
        label: "Solo limite documentato",
        summary:
          "Questo stato deriva da una quota policy documentata, non da live per-user usage.",
      },
    },
    labels: {
      "usage.threshold_warning": "Soglia di utilizzo",
      "usage.overage_detected": "Eccedenza rilevata",
      "sync.automatic_sync_overdue": "Sincronizzazione automatica in ritardo",
      "sync.cached_state_stale": "Stato cache non aggiornato",
    },
    thresholdWithPercents: (usagePercent, thresholdPercent) =>
      `L'utilizzo e al ${usagePercent}, raggiungendo la soglia di avviso del ${thresholdPercent}.`,
    thresholdWithUnit: (unitLabel) =>
      `L'utilizzo ${unitLabel} corrente ha raggiunto la soglia di avviso.`,
    thresholdFallback: "L'utilizzo corrente ha raggiunto la soglia di avviso.",
    overageWithCount: (overageCount, unitLabel) =>
      `${overageCount} ${unitLabel} di eccedenza registrati.`,
    overageFallback: "E stata rilevata eccedenza di utilizzo.",
    syncStaleWithMinutes: (ageMinutes, staleAfterMinutes) =>
      `L'eta della cache e ${ageMinutes} minuti, oltre la soglia di freshness di ${staleAfterMinutes} minuti.`,
    syncStaleFallback: "La freshness della cache e in ritardo.",
  },
  ru: {
    fixed: {
      "credential.admin_api_key_missing": {
        label: "Нет Admin API key",
        summary:
          "Добавьте требуемый Admin API key, прежде чем синхронизировать этот официальный источник.",
      },
      "credential.workspace_config_missing": {
        label: "Нет workspace config",
        summary:
          "Добавьте analytics API key и workspace ID, прежде чем синхронизировать этот workspace-источник.",
      },
      "host_access.missing": {
        label: "Нет host access",
        summary: "Предоставьте нужный provider host access, прежде чем запускать live sync.",
      },
      "host_access.required_for_live_sync": {
        label: "Нет host access",
        summary: "Предоставьте нужный provider host access, прежде чем запускать live sync.",
      },
      "page_session.open_page_required": {
        label: "Нужно открыть страницу",
        summary:
          "Откройте страницу provider usage с выполненным входом перед повторным обновлением.",
      },
      "page_session.logged_out": {
        label: "Сессия страницы вышла",
        summary:
          "Снова войдите на страницу provider перед запуском page-session sync.",
      },
      "page_session.capture_unavailable": {
        label: "Захват страницы недоступен",
        summary:
          "Расширение не смогло прочитать текущую страницу; сохраните raw detail для проверки разрешений, состояния страницы или route.",
      },
      "usage.on_demand_off": {
        label: "On-demand usage выключен",
        summary: "On-demand usage сейчас выключен для этого provider.",
      },
      "policy.live_source_unavailable": {
        label: "Нет live source",
        summary:
          "Этот provider показывает только сведения о политике, потому что стабильный live usage source не выбран.",
      },
      "policy.documented_limit_only": {
        label: "Только документированный лимит",
        summary:
          "Это состояние взято из документированной quota policy, а не из live per-user usage.",
      },
    },
    labels: {
      "usage.threshold_warning": "Порог использования",
      "usage.overage_detected": "Обнаружено превышение",
      "sync.automatic_sync_overdue": "Автосинхронизация просрочена",
      "sync.cached_state_stale": "Кэш устарел",
    },
    thresholdWithPercents: (usagePercent, thresholdPercent) =>
      `Использование составляет ${usagePercent} и достигло порога предупреждения ${thresholdPercent}.`,
    thresholdWithUnit: (unitLabel) =>
      `Текущее использование ${unitLabel} достигло порога предупреждения.`,
    thresholdFallback: "Текущее использование достигло порога предупреждения.",
    overageWithCount: (overageCount, unitLabel) =>
      `Записано превышение: ${overageCount} ${unitLabel}.`,
    overageFallback: "Обнаружено превышение использования.",
    syncStaleWithMinutes: (ageMinutes, staleAfterMinutes) =>
      `Возраст кэша: ${ageMinutes} мин.; это выше порога freshness ${staleAfterMinutes} мин.`,
    syncStaleFallback: "freshness кэша просрочена.",
  },
  ar: {
    fixed: {
      "credential.admin_api_key_missing": {
        label: "مفتاح Admin API مفقود",
        summary: "أضف مفتاح Admin API المطلوب قبل مزامنة هذا المصدر الرسمي.",
      },
      "credential.workspace_config_missing": {
        label: "إعدادات workspace مفقودة",
        summary:
          "أضف analytics API key وworkspace ID قبل مزامنة مصدر workspace هذا.",
      },
      "host_access.missing": {
        label: "صلاحية host access مفقودة",
        summary: "امنح صلاحية provider host المطلوبة قبل تشغيل live sync.",
      },
      "host_access.required_for_live_sync": {
        label: "صلاحية host access مفقودة",
        summary: "امنح صلاحية provider host المطلوبة قبل تشغيل live sync.",
      },
      "page_session.open_page_required": {
        label: "يجب فتح الصفحة",
        summary: "افتح صفحة provider usage بعد تسجيل الدخول قبل التحديث مرة أخرى.",
      },
      "page_session.logged_out": {
        label: "جلسة الصفحة غير مسجلة الدخول",
        summary: "سجل الدخول مجددا إلى صفحة provider قبل تشغيل page-session sync.",
      },
      "page_session.capture_unavailable": {
        label: "التقاط الصفحة غير متاح",
        summary:
          "تعذر على الإضافة قراءة الصفحة الحالية؛ احتفظ بـ raw detail لمراجعة الأذونات أو حالة الصفحة أو route.",
      },
      "usage.on_demand_off": {
        label: "استخدام on-demand متوقف",
        summary: "استخدام on-demand متوقف حاليا لهذا provider.",
      },
      "policy.live_source_unavailable": {
        label: "لا يوجد live source",
        summary:
          "يعرض هذا provider معلومات السياسة فقط لأنه لم يتم اختيار live usage source مستقر.",
      },
      "policy.documented_limit_only": {
        label: "حد موثق فقط",
        summary:
          "تأتي هذه الحالة من quota policy موثقة، وليست من live per-user usage.",
      },
    },
    labels: {
      "usage.threshold_warning": "حد الاستخدام",
      "usage.overage_detected": "تم رصد تجاوز",
      "sync.automatic_sync_overdue": "المزامنة التلقائية متأخرة",
      "sync.cached_state_stale": "حالة التخزين المؤقت قديمة",
    },
    thresholdWithPercents: (usagePercent, thresholdPercent) =>
      `الاستخدام عند ${usagePercent}، وقد بلغ حد التحذير ${thresholdPercent}.`,
    thresholdWithUnit: (unitLabel) =>
      `بلغ استخدام ${unitLabel} الحالي حد التحذير.`,
    thresholdFallback: "بلغ الاستخدام الحالي حد التحذير.",
    overageWithCount: (overageCount, unitLabel) =>
      `تم تسجيل ${overageCount} ${unitLabel} كتجاوز.`,
    overageFallback: "تم رصد استخدام زائد.",
    syncStaleWithMinutes: (ageMinutes, staleAfterMinutes) =>
      `عمر التخزين المؤقت ${ageMinutes} دقيقة، وهو أعلى من حد freshness البالغ ${staleAfterMinutes} دقيقة.`,
    syncStaleFallback: "freshness التخزين المؤقت متأخرة.",
  },
  hi: {
    fixed: {
      "credential.admin_api_key_missing": {
        label: "Admin API key नहीं है",
        summary: "इस official source को sync करने से पहले जरूरी Admin API key जोड़ें.",
      },
      "credential.workspace_config_missing": {
        label: "workspace config नहीं है",
        summary:
          "इस workspace source को sync करने से पहले analytics API key और workspace ID दोनों जोड़ें.",
      },
      "host_access.missing": {
        label: "host access नहीं है",
        summary: "live sync चलाने से पहले जरूरी provider host access दें.",
      },
      "host_access.required_for_live_sync": {
        label: "host access नहीं है",
        summary: "live sync चलाने से पहले जरूरी provider host access दें.",
      },
      "page_session.open_page_required": {
        label: "पेज खोलना जरूरी है",
        summary: "दोबारा refresh करने से पहले login किया हुआ provider usage पेज खोलें.",
      },
      "page_session.logged_out": {
        label: "पेज session logged out है",
        summary: "page-session sync चलाने से पहले provider पेज में फिर से sign in करें.",
      },
      "page_session.capture_unavailable": {
        label: "पेज capture उपलब्ध नहीं",
        summary:
          "extension मौजूदा पेज नहीं पढ़ सका; permission, page-state या route review के लिए raw detail रखें.",
      },
      "usage.on_demand_off": {
        label: "on-demand usage बंद है",
        summary: "इस provider के लिए on-demand usage अभी बंद है.",
      },
      "policy.live_source_unavailable": {
        label: "कोई live source नहीं",
        summary:
          "यह provider केवल policy जानकारी दिखाता है क्योंकि कोई stable live usage source चुना नहीं गया है.",
      },
      "policy.documented_limit_only": {
        label: "केवल documented limit",
        summary: "यह state documented quota policy से आती है, live per-user usage से नहीं.",
      },
    },
    labels: {
      "usage.threshold_warning": "उपयोग सीमा",
      "usage.overage_detected": "अधिक उपयोग मिला",
      "sync.automatic_sync_overdue": "स्वचालित sync overdue है",
      "sync.cached_state_stale": "कैश state पुराना है",
    },
    thresholdWithPercents: (usagePercent, thresholdPercent) =>
      `usage ${usagePercent} पर है, जो ${thresholdPercent} warning threshold तक पहुंच गया है.`,
    thresholdWithUnit: (unitLabel) =>
      `मौजूदा ${unitLabel} usage warning threshold तक पहुंच गया है.`,
    thresholdFallback: "मौजूदा usage warning threshold तक पहुंच गया है.",
    overageWithCount: (overageCount, unitLabel) =>
      `${overageCount} overage ${unitLabel} record हुआ.`,
    overageFallback: "overage usage मिला.",
    syncStaleWithMinutes: (ageMinutes, staleAfterMinutes) =>
      `cache age ${ageMinutes} मिनट है, जो ${staleAfterMinutes} मिनट freshness threshold से ऊपर है.`,
    syncStaleFallback: "cached freshness overdue है.",
  },
  id: {
    fixed: {
      "credential.admin_api_key_missing": {
        label: "Admin API key hilang",
        summary:
          "Tambahkan Admin API key yang diperlukan sebelum source resmi ini bisa disinkronkan.",
      },
      "credential.workspace_config_missing": {
        label: "workspace config hilang",
        summary:
          "Tambahkan analytics API key dan workspace ID sebelum source workspace ini bisa disinkronkan.",
      },
      "host_access.missing": {
        label: "host access hilang",
        summary: "Berikan provider host access yang diperlukan sebelum live sync berjalan.",
      },
      "host_access.required_for_live_sync": {
        label: "host access hilang",
        summary: "Berikan provider host access yang diperlukan sebelum live sync berjalan.",
      },
      "page_session.open_page_required": {
        label: "Perlu membuka halaman",
        summary: "Buka halaman provider usage yang sudah login sebelum refresh lagi.",
      },
      "page_session.logged_out": {
        label: "Sesi halaman logout",
        summary: "Login lagi ke halaman provider sebelum menjalankan page-session sync.",
      },
      "page_session.capture_unavailable": {
        label: "Capture halaman tidak tersedia",
        summary:
          "Extension tidak dapat membaca halaman saat ini; simpan raw detail untuk review permission, page-state, atau route.",
      },
      "usage.on_demand_off": {
        label: "Penggunaan on-demand nonaktif",
        summary: "Penggunaan on-demand saat ini nonaktif untuk provider ini.",
      },
      "policy.live_source_unavailable": {
        label: "Tidak ada live source",
        summary:
          "Provider ini hanya menampilkan informasi policy karena belum ada live usage source stabil yang dipilih.",
      },
      "policy.documented_limit_only": {
        label: "Hanya batas terdokumentasi",
        summary:
          "Status ini berasal dari quota policy terdokumentasi, bukan live per-user usage.",
      },
    },
    labels: {
      "usage.threshold_warning": "Ambang penggunaan",
      "usage.overage_detected": "Overage terdeteksi",
      "sync.automatic_sync_overdue": "Sinkronisasi otomatis terlambat",
      "sync.cached_state_stale": "Status cache kedaluwarsa",
    },
    thresholdWithPercents: (usagePercent, thresholdPercent) =>
      `Penggunaan berada di ${usagePercent}, mencapai ambang peringatan ${thresholdPercent}.`,
    thresholdWithUnit: (unitLabel) =>
      `Penggunaan ${unitLabel} saat ini mencapai ambang peringatan.`,
    thresholdFallback: "Penggunaan saat ini mencapai ambang peringatan.",
    overageWithCount: (overageCount, unitLabel) =>
      `${overageCount} ${unitLabel} overage tercatat.`,
    overageFallback: "Penggunaan overage terdeteksi.",
    syncStaleWithMinutes: (ageMinutes, staleAfterMinutes) =>
      `Usia cache ${ageMinutes} menit, di atas ambang freshness ${staleAfterMinutes} menit.`,
    syncStaleFallback: "Freshness cache terlambat.",
  },
};

function getWarningCopy(i18n: RuntimeI18n): WarningDiagnosticCopy {
  return WARNING_DIAGNOSTIC_COPY[i18n.resolvedLocale];
}

function formatThresholdSummary(
  params: ProviderDiagnosticParams | undefined,
  i18n: RuntimeI18n,
  copy: WarningDiagnosticCopy,
): string {
  const usagePercent = getNumberParam(params, "usagePercent");
  const thresholdPercent = getNumberParam(params, "thresholdPercent");
  const unitLabel = getStringParam(params, "unitLabel");

  if (usagePercent !== null && thresholdPercent !== null) {
    return copy.thresholdWithPercents(
      i18n.formatPercentValue(usagePercent),
      i18n.formatPercentValue(thresholdPercent),
    );
  }

  if (unitLabel) {
    return copy.thresholdWithUnit(unitLabel);
  }

  return copy.thresholdFallback;
}

function formatOverageSummary(
  params: ProviderDiagnosticParams | undefined,
  i18n: RuntimeI18n,
  copy: WarningDiagnosticCopy,
): string {
  const overageCount = getNumberParam(params, "overageCount");
  const unitLabel = getStringParam(params, "unitLabel") ?? "units";

  if (overageCount !== null) {
    return copy.overageWithCount(i18n.formatNumber(overageCount), unitLabel);
  }

  return copy.overageFallback;
}

function formatSyncStaleSummary(
  params: ProviderDiagnosticParams | undefined,
  i18n: RuntimeI18n,
  copy: WarningDiagnosticCopy,
): string {
  const ageMinutes = getNumberParam(params, "ageMinutes");
  const staleAfterMinutes = getNumberParam(params, "staleAfterMinutes");

  if (ageMinutes !== null && staleAfterMinutes !== null) {
    return copy.syncStaleWithMinutes(
      i18n.formatNumber(ageMinutes),
      i18n.formatNumber(staleAfterMinutes),
    );
  }

  return copy.syncStaleFallback;
}

export function getWarningDiagnosticPresentation(
  diagnostic: ProviderDiagnostic,
  i18n: RuntimeI18n,
): ProviderDiagnosticPresentation | null {
  const code = diagnostic.code as WarningDiagnosticCode;
  const copy = getWarningCopy(i18n);
  const fixedCopy = copy.fixed[code as keyof typeof copy.fixed];

  if (fixedCopy) {
    return fixedCopy;
  }

  switch (diagnostic.code) {
    case "usage.threshold_warning":
      return {
        label: copy.labels["usage.threshold_warning"],
        summary: formatThresholdSummary(diagnostic.params, i18n, copy),
      };
    case "usage.overage_detected":
      return {
        label: copy.labels["usage.overage_detected"],
        summary: formatOverageSummary(diagnostic.params, i18n, copy),
      };
    case "sync.automatic_sync_overdue":
      return {
        label: copy.labels["sync.automatic_sync_overdue"],
        summary: formatSyncStaleSummary(diagnostic.params, i18n, copy),
      };
    case "sync.cached_state_stale":
      return {
        label: copy.labels["sync.cached_state_stale"],
        summary: formatSyncStaleSummary(diagnostic.params, i18n, copy),
      };
    default:
      return null;
  }
}
