import type { ResolvedAppLocale, RuntimeI18n } from "./i18n";

function formatProviderCount(i18n: RuntimeI18n, count: number) {
  if (i18n.resolvedLocale === "zh-CN") {
    return `${i18n.formatNumber(count)} 个 provider`;
  }

  return `${i18n.formatNumber(count)} ${count === 1 ? "provider" : "providers"}`;
}

type PopupFirstRunCopyText = {
  providerCount: (countLabel: string) => string;
  noProvidersLabel: string;
  noProvidersHeadline: string;
  noProvidersDetail: string;
  syncIssueLabel: string;
  mixedStateLabel: string;
  alignedLabel: string;
  alignedSingleDetail: string;
  alignedManyDetail: (countLabel: string) => string;
  mixedDetail: (
    newestProviderLabel: string,
    newestSyncLabel: string,
    oldestProviderLabel: string,
    oldestSyncLabel: string,
  ) => string;
  startHereLabel: string;
  nextStepLabel: string;
  currentContractLabel: string;
  enableProviderHeadline: string;
  enableProviderDetail: string;
  startWithProviderHeadline: (providerLabel: string) => string;
  startWithProviderDetail: (providerLabel: string) => string;
  openQuickSetupAction: string;
  grantAccessSingleHeadline: (providerLabel: string) => string;
  grantAccessManyHeadline: string;
  singleMissingAccessDetail: (providerLabel: string) => string;
  multipleMissingAccessDetail: (countLabel: string) => string;
  addCredentialsSingleHeadline: (providerLabel: string) => string;
  addCredentialsManyHeadline: string;
  singleMissingCredentialDetail: (providerLabel: string) => string;
  multipleMissingCredentialDetail: (countLabel: string) => string;
  reviewProviderHeadline: (providerLabel: string) => string;
  policyOnlyHeadline: string;
  policyOnlyDetail: string;
  openDetail: string;
  reviewDetail: string;
  setupLabel: string;
  liveReadyItemLabel: string;
  hostAccessItemLabel: string;
  credentialsItemLabel: string;
  policyOnlyItemLabel: string;
  statusStartSetup: string;
  statusNeedsSetup: string;
  statusNeedsReview: string;
  statusContractOnly: string;
  statusReady: string;
  noVisibleHeadline: string;
  noVisibleDetail: string;
  noVisibleDetailForProvider: (providerLabel: string) => string;
  visibleProvidersHeadline: (countLabel: string) => string;
  needsSetupDetail: (sentence: string) => string;
  needsReviewDetail: (countLabel: string) => string;
  contractOnlyDetail: string;
  mixedReadyPolicyDetail: (
    liveReadyCountLabel: string,
    policyOnlyCountLabel: string,
  ) => string;
  readyDetail: string;
  setupBlockerAccess: (countLabel: string) => string;
  setupBlockerCredentials: (countLabel: string) => string;
  headerNoVisible: string;
  headerNoVisibleForProvider: (providerLabel: string) => string;
  headerNeedsSetup: string;
  headerContractOnly: string;
  headerNeedsReview: string;
  headerReady: string;
};

type PopupFirstRunLocalizedLocale = Exclude<
  ResolvedAppLocale,
  "en" | "zh-CN"
>;

const POPUP_FIRST_RUN_COPY: Record<
  PopupFirstRunLocalizedLocale,
  PopupFirstRunCopyText
> = {
  "zh-TW": {
    providerCount: (count) => `${count} 個 provider`,
    noProvidersLabel: "沒有 provider",
    noProvidersHeadline: "沒有可見 provider",
    noProvidersDetail: "尚未有可共享的 popup 快照。先啟用一個 provider，這裡才會開始快取狀態。",
    syncIssueLabel: "同步異常",
    mixedStateLabel: "狀態混合",
    alignedLabel: "已對齊",
    alignedSingleDetail: "目前可見 provider 共用同一個快取快照視窗。",
    alignedManyDetail: (count) => `全部 ${count} 可見 provider 共用同一個快取快照視窗。`,
    mixedDetail: (newestProvider, newestSync, oldestProvider, oldestSync) =>
      `最新可見快照：${newestProvider}（${newestSync}）。最舊可見快照：${oldestProvider}（${oldestSync}）。`,
    startHereLabel: "從這裡開始",
    nextStepLabel: "下一步",
    currentContractLabel: "目前合約",
    enableProviderHeadline: "先在 Settings 啟用一個 provider",
    enableProviderDetail: "至少有一個 provider 可見後，這個 popup 才真正有用。先到 Settings 啟用，再回來做一鍵狀態與注意事項分診。",
    startWithProviderHeadline: (provider) => `先在 Quick Setup 設定 ${provider}`,
    startWithProviderDetail: (provider) =>
      `開啟 Settings > Quick Setup 並啟用 ${provider}。接著完成 browser access 和 usage page 步驟，再回來做狀態分診。`,
    openQuickSetupAction: "開啟 Quick Setup",
    grantAccessSingleHeadline: (provider) => `為 ${provider} 授予 host access`,
    grantAccessManyHeadline: "先在 Settings 授予 host access",
    singleMissingAccessDetail: (provider) => `${provider} 仍缺少 optional host access，所以 popup 還不能顯示健康的 live 狀態。`,
    multipleMissingAccessDetail: (count) => `${count} 仍缺少 optional host access，popup 還不能收斂成對齊且健康的快照。`,
    addCredentialsSingleHeadline: (provider) => `為 ${provider} 補上 credentials`,
    addCredentialsManyHeadline: "先在 Settings 補上 credentials",
    singleMissingCredentialDetail: (provider) => `${provider} 目前路徑仍缺少已儲存 credentials，所以 live sync 還無法啟動。`,
    multipleMissingCredentialDetail: (count) => `${count} 仍依賴缺少的已儲存 credentials，當前 live 路徑還不能穩定執行。`,
    reviewProviderHeadline: (provider) => `檢查 ${provider}`,
    policyOnlyHeadline: "可見 provider 目前都是 policy-only",
    policyOnlyDetail: "popup 仍可彙總共享快取狀態，但這個 profile 中的可見 provider 沒有 live in-browser usage path。開啟 Settings 檢查目前 provider 合約與 source controls。",
    openDetail: "開啟詳細資訊",
    reviewDetail: "檢查詳細資訊",
    setupLabel: "設定覆蓋",
    liveReadyItemLabel: "Live-ready",
    hostAccessItemLabel: "Host access",
    credentialsItemLabel: "Credentials",
    policyOnlyItemLabel: "Policy-only",
    statusStartSetup: "開始設定",
    statusNeedsSetup: "需要設定",
    statusNeedsReview: "需要檢查",
    statusContractOnly: "僅合約",
    statusReady: "已就緒",
    noVisibleHeadline: "尚未設定可見 provider",
    noVisibleDetail: "先在 Settings 啟用一個 provider。之後這張卡會顯示可見 provider 是 live-ready、被設定阻擋，或是 policy-only。",
    noVisibleDetailForProvider: (provider) => `先在 Settings > Quick Setup 啟用 ${provider}。之後這張卡會顯示可見 provider 是 live-ready、被設定阻擋，或是 policy-only。`,
    visibleProvidersHeadline: (count) => `${count} 可見`,
    needsSetupDetail: (sentence) => `把這個 popup 視為 ready 之前，先完成 Settings 設定。${sentence}`,
    needsReviewDetail: (count) => `Settings 設定已清楚，但 ${count} 仍需要產品內檢查。`,
    contractOnlyDetail: "可見 provider 已設定，但目前合約仍是 policy-only，而不是 live in-browser path。",
    mixedReadyPolicyDetail: (liveReady, policyOnly) => `${liveReady} 已 live-ready。${policyOnly} 是 policy-only。`,
    readyDetail: "這裡看不到 Settings 設定阻擋。用下方摘要確認 live-ready 與 policy-only 覆蓋。",
    setupBlockerAccess: (count) => `${count} 還需要 host access。`,
    setupBlockerCredentials: (count) => `${count} 還需要 credentials。`,
    headerNoVisible: "先從 Settings 開始。只要有一個 provider 可見，這個 popup 就會彙總 live readiness 和下一步。",
    headerNoVisibleForProvider: (provider) => `先在 Settings > Quick Setup 從 ${provider} 開始。只要有一個 provider 可見，這個 popup 就會彙總 live readiness 和下一步。`,
    headerNeedsSetup: "用這個 popup 區分設定阻擋與已 ready 的 provider。",
    headerContractOnly: "這個 popup 目前顯示合約脈絡，而不是 live in-browser sync 路徑。",
    headerNeedsReview: "Settings 設定已清楚。用這個 popup 快速檢查 freshness 和 provider 分診。",
    headerReady: "用這個 popup 快速查看 freshness 和 provider 分診，不必重新開啟完整 dashboard。",
  },
  ja: {
    providerCount: (count) => `${count} provider`,
    noProvidersLabel: "provider なし",
    noProvidersHeadline: "表示中の provider がありません",
    noProvidersDetail: "共有できる popup スナップショットはまだありません。まず provider を 1 つ有効にすると、ここで状態のキャッシュが始まります。",
    syncIssueLabel: "sync の問題",
    mixedStateLabel: "混在状態",
    alignedLabel: "整合済み",
    alignedSingleDetail: "表示中の provider は同じキャッシュ済みスナップショット期間を共有しています。",
    alignedManyDetail: (count) => `表示中の ${count} すべてが同じキャッシュ済みスナップショット期間を共有しています。`,
    mixedDetail: (newestProvider, newestSync, oldestProvider, oldestSync) =>
      `最新の表示スナップショット: ${newestProvider} (${newestSync})。最も古い表示スナップショット: ${oldestProvider} (${oldestSync})。`,
    startHereLabel: "ここから開始",
    nextStepLabel: "次の手順",
    currentContractLabel: "現在の contract",
    enableProviderHeadline: "Settings で provider を有効にしてください",
    enableProviderDetail: "少なくとも 1 つの provider が表示されると、この popup が有用になります。Settings で有効にしてから、ここに戻って状態と注意点を確認してください。",
    startWithProviderHeadline: (provider) => `Quick Setup で ${provider} から開始`,
    startWithProviderDetail: (provider) =>
      `Settings > Quick Setup を開いて ${provider} を有効にします。その後 browser access と usage page の手順を完了し、ここに戻って状態を確認してください。`,
    openQuickSetupAction: "Quick Setup を開く",
    grantAccessSingleHeadline: (provider) => `${provider} に host access を付与`,
    grantAccessManyHeadline: "Settings で host access を付与",
    singleMissingAccessDetail: (provider) => `${provider} はまだ optional host access が不足しているため、popup は健全な live 状態を表示できません。`,
    multipleMissingAccessDetail: (count) => `${count} はまだ optional host access が必要です。popup は整合した健全なスナップショットにできません。`,
    addCredentialsSingleHeadline: (provider) => `${provider} の credentials を追加`,
    addCredentialsManyHeadline: "Settings で credentials を追加",
    singleMissingCredentialDetail: (provider) => `${provider} の現在の経路には保存済み credentials がまだ必要なため、live sync を実行できません。`,
    multipleMissingCredentialDetail: (count) => `${count} は不足している保存済み credentials に依存しており、現在の live 経路を安定して実行できません。`,
    reviewProviderHeadline: (provider) => `${provider} を確認`,
    policyOnlyHeadline: "表示中の provider は policy-only です",
    policyOnlyDetail: "popup は共有キャッシュ状態を要約できますが、この profile の表示中 provider は live in-browser usage path を公開していません。Settings で provider contract と source controls を確認してください。",
    openDetail: "詳細を開く",
    reviewDetail: "詳細を確認",
    setupLabel: "設定カバレッジ",
    liveReadyItemLabel: "Live-ready",
    hostAccessItemLabel: "Host access",
    credentialsItemLabel: "Credentials",
    policyOnlyItemLabel: "Policy-only",
    statusStartSetup: "設定を開始",
    statusNeedsSetup: "設定が必要",
    statusNeedsReview: "確認が必要",
    statusContractOnly: "Contract-only",
    statusReady: "準備完了",
    noVisibleHeadline: "表示中の provider は未設定です",
    noVisibleDetail: "まず Settings で provider を 1 つ有効にします。このカードは、その provider が live-ready か、設定でブロックされているか、policy-only かを表示します。",
    noVisibleDetailForProvider: (provider) => `まず Settings > Quick Setup で ${provider} を有効にします。このカードは、その provider が live-ready か、設定でブロックされているか、policy-only かを表示します。`,
    visibleProvidersHeadline: (count) => `${count} 表示中`,
    needsSetupDetail: (sentence) => `この popup を ready とみなす前に Settings の設定を完了してください。${sentence}`,
    needsReviewDetail: (count) => `Settings の設定は明確ですが、${count} は製品内での確認がまだ必要です。`,
    contractOnlyDetail: "表示中の provider は設定済みですが、現在の contract は live in-browser path ではなく policy-only です。",
    mixedReadyPolicyDetail: (liveReady, policyOnly) => `${liveReady} は live-ready。${policyOnly} は policy-only。`,
    readyDetail: "Settings 側の設定ブロックはここにはありません。下の概要で live-ready と policy-only の範囲を確認してください。",
    setupBlockerAccess: (count) => `${count} は host access がまだ必要です。`,
    setupBlockerCredentials: (count) => `${count} は credentials がまだ必要です。`,
    headerNoVisible: "まず Settings から開始します。provider が 1 つ表示されると、この popup が live readiness と次の手順を要約します。",
    headerNoVisibleForProvider: (provider) => `まず Settings > Quick Setup で ${provider} から開始します。provider が 1 つ表示されると、この popup が live readiness と次の手順を要約します。`,
    headerNeedsSetup: "この popup で設定ブロックと ready 済み provider を分けて確認します。",
    headerContractOnly: "この popup は live in-browser sync 経路ではなく、現在の contract context を表示しています。",
    headerNeedsReview: "Settings の設定は明確です。この popup で freshness と provider を素早く確認します。",
    headerReady: "完全な dashboard を開き直さずに、この popup で freshness と provider を素早く確認できます。",
  },
  ko: {
    providerCount: (count) => `${count} provider`,
    noProvidersLabel: "provider 없음",
    noProvidersHeadline: "표시되는 provider 없음",
    noProvidersDetail: "아직 공유할 popup 스냅샷이 없습니다. provider 하나를 활성화하면 여기서 상태 캐시가 시작됩니다.",
    syncIssueLabel: "sync 문제",
    mixedStateLabel: "혼합 상태",
    alignedLabel: "정렬됨",
    alignedSingleDetail: "표시되는 provider가 같은 캐시 스냅샷 창을 공유합니다.",
    alignedManyDetail: (count) => `표시되는 ${count} 모두 같은 캐시 스냅샷 창을 공유합니다.`,
    mixedDetail: (newestProvider, newestSync, oldestProvider, oldestSync) =>
      `최신 표시 스냅샷: ${newestProvider} (${newestSync}). 가장 오래된 표시 스냅샷: ${oldestProvider} (${oldestSync}).`,
    startHereLabel: "여기서 시작",
    nextStepLabel: "다음 단계",
    currentContractLabel: "현재 contract",
    enableProviderHeadline: "Settings에서 provider 활성화",
    enableProviderDetail: "provider가 하나 이상 표시되어야 이 popup이 유용합니다. Settings에서 먼저 활성화한 뒤 돌아와 상태와 주의 항목을 확인하세요.",
    startWithProviderHeadline: (provider) => `Quick Setup에서 ${provider} 시작`,
    startWithProviderDetail: (provider) =>
      `Settings > Quick Setup을 열고 ${provider}를 활성화하세요. 그런 다음 browser access와 usage page 단계를 마치고 돌아와 상태를 확인하세요.`,
    openQuickSetupAction: "Quick Setup 열기",
    grantAccessSingleHeadline: (provider) => `${provider} host access 허용`,
    grantAccessManyHeadline: "Settings에서 host access 허용",
    singleMissingAccessDetail: (provider) => `${provider}에 optional host access가 아직 없어 popup이 건강한 live 상태를 표시할 수 없습니다.`,
    multipleMissingAccessDetail: (count) => `${count}에 optional host access가 아직 필요해 popup이 정렬된 건강한 스냅샷으로 안정화될 수 없습니다.`,
    addCredentialsSingleHeadline: (provider) => `${provider} credentials 추가`,
    addCredentialsManyHeadline: "Settings에서 credentials 추가",
    singleMissingCredentialDetail: (provider) => `${provider}의 현재 경로에는 저장된 credentials가 아직 필요해 live sync를 실행할 수 없습니다.`,
    multipleMissingCredentialDetail: (count) => `${count}는 누락된 저장 credentials에 의존하므로 현재 live 경로를 안정적으로 실행할 수 없습니다.`,
    reviewProviderHeadline: (provider) => `${provider} 검토`,
    policyOnlyHeadline: "표시되는 provider가 policy-only입니다",
    policyOnlyDetail: "popup은 공유 캐시 상태를 요약할 수 있지만, 이 profile의 표시 provider는 live in-browser usage path를 제공하지 않습니다. Settings에서 provider contract와 source controls를 확인하세요.",
    openDetail: "상세 열기",
    reviewDetail: "상세 검토",
    setupLabel: "설정 범위",
    liveReadyItemLabel: "Live-ready",
    hostAccessItemLabel: "Host access",
    credentialsItemLabel: "Credentials",
    policyOnlyItemLabel: "Policy-only",
    statusStartSetup: "설정 시작",
    statusNeedsSetup: "설정 필요",
    statusNeedsReview: "검토 필요",
    statusContractOnly: "Contract-only",
    statusReady: "준비됨",
    noVisibleHeadline: "설정된 표시 provider 없음",
    noVisibleDetail: "먼저 Settings에서 provider 하나를 활성화하세요. 이후 이 카드는 표시 provider가 live-ready인지, 설정에 막혔는지, policy-only인지 보여줍니다.",
    noVisibleDetailForProvider: (provider) => `먼저 Settings > Quick Setup에서 ${provider}를 활성화하세요. 이후 이 카드는 표시 provider가 live-ready인지, 설정에 막혔는지, policy-only인지 보여줍니다.`,
    visibleProvidersHeadline: (count) => `${count} 표시됨`,
    needsSetupDetail: (sentence) => `이 popup을 ready로 보기 전에 Settings 설정을 마치세요. ${sentence}`,
    needsReviewDetail: (count) => `Settings 설정은 명확하지만 ${count}는 제품 안에서 추가 검토가 필요합니다.`,
    contractOnlyDetail: "표시 provider는 설정되었지만 현재 contract는 live in-browser path가 아니라 policy-only입니다.",
    mixedReadyPolicyDetail: (liveReady, policyOnly) => `${liveReady}는 live-ready입니다. ${policyOnly}는 policy-only입니다.`,
    readyDetail: "여기에는 Settings 설정 차단 항목이 보이지 않습니다. 아래 요약으로 live-ready와 policy-only 범위를 확인하세요.",
    setupBlockerAccess: (count) => `${count}에 host access가 아직 필요합니다.`,
    setupBlockerCredentials: (count) => `${count}에 credentials가 아직 필요합니다.`,
    headerNoVisible: "Settings에서 시작하세요. provider 하나가 표시되면 이 popup이 live readiness와 다음 단계를 요약합니다.",
    headerNoVisibleForProvider: (provider) => `Settings > Quick Setup에서 ${provider}로 시작하세요. provider 하나가 표시되면 이 popup이 live readiness와 다음 단계를 요약합니다.`,
    headerNeedsSetup: "이 popup으로 설정 차단 항목과 이미 ready인 provider를 구분하세요.",
    headerContractOnly: "이 popup은 live in-browser sync 경로가 아니라 현재 contract context를 보여줍니다.",
    headerNeedsReview: "Settings 설정은 명확합니다. 이 popup으로 freshness와 provider를 빠르게 검토하세요.",
    headerReady: "전체 dashboard를 다시 열지 않고 이 popup으로 freshness와 provider를 빠르게 확인하세요.",
  },
  "es-419": {
    providerCount: (count) => `${count} provider`,
    noProvidersLabel: "Sin providers",
    noProvidersHeadline: "No hay providers visibles",
    noProvidersDetail:
      "Aún no existe una snapshot compartida del popup. Activa un provider para empezar a guardar estado aquí.",
    syncIssueLabel: "Problema de sync",
    mixedStateLabel: "Estado mixto",
    alignedLabel: "Alineado",
    alignedSingleDetail:
      "El provider visible comparte la misma ventana de snapshot en cache.",
    alignedManyDetail: (count) =>
      `Los ${count} visibles comparten la misma ventana de snapshot en cache.`,
    mixedDetail: (newestProvider, newestSync, oldestProvider, oldestSync) =>
      `Snapshot visible más reciente: ${newestProvider} (${newestSync}). Snapshot visible más antigua: ${oldestProvider} (${oldestSync}).`,
    startHereLabel: "Empieza aquí",
    nextStepLabel: "Siguiente paso",
    currentContractLabel: "Contrato actual",
    enableProviderHeadline: "Activa un provider en Settings",
    enableProviderDetail:
      "El popup solo es útil cuando al menos un provider está visible. Empieza en Settings y vuelve aquí para revisar estado y atención en un clic.",
    startWithProviderHeadline: (provider) =>
      `Empieza con ${provider} en Quick Setup`,
    startWithProviderDetail: (provider) =>
      `Abre Settings > Quick Setup y activa ${provider}. Luego completa los pasos de browser access y usage page antes de volver aquí para revisar el estado.`,
    openQuickSetupAction: "Abrir Quick Setup",
    grantAccessSingleHeadline: (provider) =>
      `Concede host access para ${provider}`,
    grantAccessManyHeadline: "Concede host access en Settings",
    singleMissingAccessDetail: (provider) =>
      `${provider} todavía necesita optional host access, así que el popup aún no puede mostrar un estado live saludable.`,
    multipleMissingAccessDetail: (count) =>
      `${count} todavía necesitan optional host access antes de que el popup pueda quedar en una snapshot alineada y saludable.`,
    addCredentialsSingleHeadline: (provider) =>
      `Agrega credentials para ${provider}`,
    addCredentialsManyHeadline: "Agrega credentials en Settings",
    singleMissingCredentialDetail: (provider) =>
      `${provider} todavía necesita credentials guardadas para que live sync pueda ejecutarse.`,
    multipleMissingCredentialDetail: (count) =>
      `${count} todavía dependen de credentials guardadas faltantes antes de que su ruta live actual pueda ejecutarse bien.`,
    reviewProviderHeadline: (provider) => `Revisa ${provider}`,
    policyOnlyHeadline: "Los providers visibles son policy-only",
    policyOnlyDetail:
      "El popup aún puede resumir el estado compartido en cache, pero estos providers visibles no exponen una live in-browser usage path en este perfil. Abre Settings para revisar los contratos actuales y source controls.",
    openDetail: "Abrir detalle",
    reviewDetail: "Revisar detalle",
    setupLabel: "Cobertura de setup",
    liveReadyItemLabel: "Live-ready",
    hostAccessItemLabel: "Host access",
    credentialsItemLabel: "Credentials",
    policyOnlyItemLabel: "Policy-only",
    statusStartSetup: "Iniciar setup",
    statusNeedsSetup: "Necesita setup",
    statusNeedsReview: "Necesita revisión",
    statusContractOnly: "Solo contrato",
    statusReady: "Listo",
    noVisibleHeadline: "No hay providers visibles configurados",
    noVisibleDetail:
      "Activa primero un provider en Settings. Después esta tarjeta mostrará si los providers visibles están live-ready, bloqueados por setup o policy-only.",
    noVisibleDetailForProvider: (provider) =>
      `Activa primero ${provider} en Settings > Quick Setup. Después esta tarjeta mostrará si los providers visibles están live-ready, bloqueados por setup o policy-only.`,
    visibleProvidersHeadline: (count) => `${count} visibles`,
    needsSetupDetail: (sentence) =>
      `Termina el setup en Settings antes de tratar este popup como ready. ${sentence}`,
    needsReviewDetail: (count) =>
      `El setup en Settings está claro, pero ${count} todavía necesitan revisión dentro del producto.`,
    contractOnlyDetail:
      "Los providers visibles están configurados, pero su contrato actual es policy-only y no una live in-browser path.",
    mixedReadyPolicyDetail: (liveReady, policyOnly) =>
      `${liveReady} están live-ready. ${policyOnly} son policy-only.`,
    readyDetail:
      "Aquí no se ven bloqueos de setup en Settings. Usa el resumen de abajo para confirmar cobertura live-ready y policy-only.",
    setupBlockerAccess: (count) => `${count} todavía necesitan host access.`,
    setupBlockerCredentials: (count) =>
      `${count} todavía necesitan credentials.`,
    headerNoVisible:
      "Empieza en Settings. Cuando un provider esté visible, este popup resumirá live readiness y siguientes pasos.",
    headerNoVisibleForProvider: (provider) =>
      `Empieza con ${provider} en Settings > Quick Setup. Cuando un provider esté visible, este popup resumirá live readiness y siguientes pasos.`,
    headerNeedsSetup:
      "Usa este popup para separar bloqueos de setup de los providers que ya están ready.",
    headerContractOnly:
      "Este popup muestra contexto de contrato actual, no una ruta de live in-browser sync.",
    headerNeedsReview:
      "El setup en Settings está claro. Usa este popup para revisar freshness y providers rápido.",
    headerReady:
      "Usa este popup para revisar freshness y providers sin reabrir el dashboard completo.",
  },
  "pt-BR": {
    providerCount: (count) => `${count} provider`,
    noProvidersLabel: "Sem providers",
    noProvidersHeadline: "Nenhum provider visível",
    noProvidersDetail:
      "Ainda não há snapshot compartilhado do popup. Ative um provider para começar a armazenar estado aqui.",
    syncIssueLabel: "Problema de sync",
    mixedStateLabel: "Estado misto",
    alignedLabel: "Alinhado",
    alignedSingleDetail:
      "O provider visível compartilha a mesma janela de snapshot em cache.",
    alignedManyDetail: (count) =>
      `Todos os ${count} visíveis compartilham a mesma janela de snapshot em cache.`,
    mixedDetail: (newestProvider, newestSync, oldestProvider, oldestSync) =>
      `Snapshot visível mais recente: ${newestProvider} (${newestSync}). Snapshot visível mais antigo: ${oldestProvider} (${oldestSync}).`,
    startHereLabel: "Comece aqui",
    nextStepLabel: "Próximo passo",
    currentContractLabel: "Contrato atual",
    enableProviderHeadline: "Ative um provider em Settings",
    enableProviderDetail:
      "O popup só fica útil depois que pelo menos um provider está visível. Comece em Settings e volte aqui para triagem de status e atenção em um clique.",
    startWithProviderHeadline: (provider) =>
      `Comece com ${provider} no Quick Setup`,
    startWithProviderDetail: (provider) =>
      `Abra Settings > Quick Setup e ative ${provider}. Depois conclua as etapas de browser access e usage page antes de voltar aqui para a triagem de status.`,
    openQuickSetupAction: "Abrir Quick Setup",
    grantAccessSingleHeadline: (provider) =>
      `Conceder host access para ${provider}`,
    grantAccessManyHeadline: "Conceder host access em Settings",
    singleMissingAccessDetail: (provider) =>
      `${provider} ainda precisa de optional host access, então o popup ainda não pode mostrar um estado live saudável.`,
    multipleMissingAccessDetail: (count) =>
      `${count} ainda precisam de optional host access antes que o popup possa chegar a um snapshot alinhado e saudável.`,
    addCredentialsSingleHeadline: (provider) =>
      `Adicionar credentials para ${provider}`,
    addCredentialsManyHeadline: "Adicionar credentials em Settings",
    singleMissingCredentialDetail: (provider) =>
      `${provider} ainda precisa de credentials salvas para que live sync possa rodar.`,
    multipleMissingCredentialDetail: (count) =>
      `${count} ainda dependem de credentials salvas ausentes antes que o caminho live atual rode corretamente.`,
    reviewProviderHeadline: (provider) => `Revisar ${provider}`,
    policyOnlyHeadline: "Os providers visíveis são policy-only",
    policyOnlyDetail:
      "O popup ainda pode resumir o estado compartilhado em cache, mas estes providers visíveis não expõem uma live in-browser usage path neste perfil. Abra Settings para revisar contratos atuais e source controls.",
    openDetail: "Abrir detalhe",
    reviewDetail: "Revisar detalhe",
    setupLabel: "Cobertura de setup",
    liveReadyItemLabel: "Live-ready",
    hostAccessItemLabel: "Host access",
    credentialsItemLabel: "Credentials",
    policyOnlyItemLabel: "Policy-only",
    statusStartSetup: "Iniciar setup",
    statusNeedsSetup: "Precisa de setup",
    statusNeedsReview: "Precisa de revisão",
    statusContractOnly: "Só contrato",
    statusReady: "Pronto",
    noVisibleHeadline: "Nenhum provider visível configurado",
    noVisibleDetail:
      "Ative primeiro um provider em Settings. Depois este cartão mostrará se os providers visíveis estão live-ready, bloqueados por setup ou policy-only.",
    noVisibleDetailForProvider: (provider) =>
      `Ative primeiro ${provider} em Settings > Quick Setup. Depois este cartão mostrará se os providers visíveis estão live-ready, bloqueados por setup ou policy-only.`,
    visibleProvidersHeadline: (count) => `${count} visíveis`,
    needsSetupDetail: (sentence) =>
      `Conclua o setup em Settings antes de tratar este popup como ready. ${sentence}`,
    needsReviewDetail: (count) =>
      `O setup em Settings está claro, mas ${count} ainda precisam de revisão no produto.`,
    contractOnlyDetail:
      "Os providers visíveis estão configurados, mas o contrato atual é policy-only em vez de uma live in-browser path.",
    mixedReadyPolicyDetail: (liveReady, policyOnly) =>
      `${liveReady} estão live-ready. ${policyOnly} são policy-only.`,
    readyDetail:
      "Nenhum bloqueio de setup em Settings aparece aqui. Use o resumo abaixo para confirmar cobertura live-ready e policy-only.",
    setupBlockerAccess: (count) => `${count} ainda precisam de host access.`,
    setupBlockerCredentials: (count) =>
      `${count} ainda precisam de credentials.`,
    headerNoVisible:
      "Comece em Settings. Quando um provider estiver visível, este popup resumirá live readiness e próximos passos.",
    headerNoVisibleForProvider: (provider) =>
      `Comece com ${provider} em Settings > Quick Setup. Quando um provider estiver visível, este popup resumirá live readiness e próximos passos.`,
    headerNeedsSetup:
      "Use este popup para separar bloqueios de setup dos providers que já estão ready.",
    headerContractOnly:
      "Este popup mostra o contexto do contrato atual, não uma rota live in-browser sync.",
    headerNeedsReview:
      "O setup em Settings está claro. Use este popup para revisar freshness e providers rapidamente.",
    headerReady:
      "Use este popup para revisar freshness e providers sem reabrir o dashboard completo.",
  },
  fr: {
    providerCount: (count) => `${count} provider`,
    noProvidersLabel: "Aucun provider",
    noProvidersHeadline: "Aucun provider visible",
    noProvidersDetail:
      "Aucun snapshot partagé du popup n'existe encore. Activez un provider pour commencer à mettre l'état en cache ici.",
    syncIssueLabel: "Problème de sync",
    mixedStateLabel: "État mixte",
    alignedLabel: "Aligné",
    alignedSingleDetail:
      "Le provider visible partage la même fenêtre de snapshot mise en cache.",
    alignedManyDetail: (count) =>
      `Les ${count} visibles partagent la même fenêtre de snapshot mise en cache.`,
    mixedDetail: (newestProvider, newestSync, oldestProvider, oldestSync) =>
      `Snapshot visible le plus récent : ${newestProvider} (${newestSync}). Snapshot visible le plus ancien : ${oldestProvider} (${oldestSync}).`,
    startHereLabel: "Commencer ici",
    nextStepLabel: "Étape suivante",
    currentContractLabel: "Contrat actuel",
    enableProviderHeadline: "Activez un provider dans Settings",
    enableProviderDetail:
      "Le popup devient utile seulement lorsqu'au moins un provider est visible. Commencez dans Settings, puis revenez ici pour trier l'état et l'attention en un clic.",
    startWithProviderHeadline: (provider) =>
      `Commencer avec ${provider} dans Quick Setup`,
    startWithProviderDetail: (provider) =>
      `Ouvrez Settings > Quick Setup et activez ${provider}. Terminez ensuite les étapes browser access et usage page avant de revenir ici pour trier l'état.`,
    openQuickSetupAction: "Ouvrir Quick Setup",
    grantAccessSingleHeadline: (provider) =>
      `Accorder host access pour ${provider}`,
    grantAccessManyHeadline: "Accorder host access dans Settings",
    singleMissingAccessDetail: (provider) =>
      `${provider} a encore besoin de optional host access ; le popup ne peut donc pas afficher un état live sain.`,
    multipleMissingAccessDetail: (count) =>
      `${count} ont encore besoin de optional host access avant que le popup puisse afficher un snapshot aligné et sain.`,
    addCredentialsSingleHeadline: (provider) =>
      `Ajouter credentials pour ${provider}`,
    addCredentialsManyHeadline: "Ajouter credentials dans Settings",
    singleMissingCredentialDetail: (provider) =>
      `${provider} a encore besoin de credentials enregistrées avant que live sync puisse s'exécuter.`,
    multipleMissingCredentialDetail: (count) =>
      `${count} dépendent encore de credentials enregistrées manquantes avant que leur chemin live actuel puisse s'exécuter correctement.`,
    reviewProviderHeadline: (provider) => `Examiner ${provider}`,
    policyOnlyHeadline: "Les providers visibles sont policy-only",
    policyOnlyDetail:
      "Le popup peut toujours résumer l'état partagé en cache, mais ces providers visibles n'exposent pas de live in-browser usage path dans ce profil. Ouvrez Settings pour examiner les contrats actuels et les source controls.",
    openDetail: "Ouvrir le détail",
    reviewDetail: "Examiner le détail",
    setupLabel: "Couverture setup",
    liveReadyItemLabel: "Live-ready",
    hostAccessItemLabel: "Host access",
    credentialsItemLabel: "Credentials",
    policyOnlyItemLabel: "Policy-only",
    statusStartSetup: "Démarrer setup",
    statusNeedsSetup: "Setup requis",
    statusNeedsReview: "Revue requise",
    statusContractOnly: "Contrat seul",
    statusReady: "Prêt",
    noVisibleHeadline: "Aucun provider visible configuré",
    noVisibleDetail:
      "Activez d'abord un provider dans Settings. Cette carte indiquera ensuite si les providers visibles sont live-ready, bloqués par setup ou policy-only.",
    noVisibleDetailForProvider: (provider) =>
      `Activez d'abord ${provider} dans Settings > Quick Setup. Cette carte indiquera ensuite si les providers visibles sont live-ready, bloqués par setup ou policy-only.`,
    visibleProvidersHeadline: (count) => `${count} visibles`,
    needsSetupDetail: (sentence) =>
      `Terminez le setup dans Settings avant de considérer ce popup comme ready. ${sentence}`,
    needsReviewDetail: (count) =>
      `Le setup dans Settings est clair, mais ${count} ont encore besoin d'une revue dans le produit.`,
    contractOnlyDetail:
      "Les providers visibles sont configurés, mais leur contrat actuel est policy-only plutôt qu'une live in-browser path.",
    mixedReadyPolicyDetail: (liveReady, policyOnly) =>
      `${liveReady} sont live-ready. ${policyOnly} sont policy-only.`,
    readyDetail:
      "Aucun blocage de setup Settings n'apparaît ici. Utilisez le résumé ci-dessous pour confirmer la couverture live-ready et policy-only.",
    setupBlockerAccess: (count) => `${count} ont encore besoin de host access.`,
    setupBlockerCredentials: (count) =>
      `${count} ont encore besoin de credentials.`,
    headerNoVisible:
      "Commencez dans Settings. Lorsqu'un provider est visible, ce popup résume live readiness et prochaines étapes.",
    headerNoVisibleForProvider: (provider) =>
      `Commencez avec ${provider} dans Settings > Quick Setup. Lorsqu'un provider est visible, ce popup résume live readiness et prochaines étapes.`,
    headerNeedsSetup:
      "Utilisez ce popup pour séparer les blocages de setup des providers déjà ready.",
    headerContractOnly:
      "Ce popup affiche le contexte du contrat actuel, pas un chemin live in-browser sync.",
    headerNeedsReview:
      "Le setup Settings est clair. Utilisez ce popup pour examiner rapidement freshness et providers.",
    headerReady:
      "Utilisez ce popup pour examiner freshness et providers sans rouvrir le dashboard complet.",
  },
  de: {
    providerCount: (count) => `${count} provider`,
    noProvidersLabel: "Keine provider",
    noProvidersHeadline: "Keine sichtbaren provider",
    noProvidersDetail:
      "Es gibt noch keinen geteilten popup Snapshot. Aktiviere einen provider, damit hier Status gecacht wird.",
    syncIssueLabel: "Sync-Problem",
    mixedStateLabel: "Gemischter Status",
    alignedLabel: "Abgeglichen",
    alignedSingleDetail:
      "Der sichtbare provider nutzt dasselbe gecachte Snapshot-Fenster.",
    alignedManyDetail: (count) =>
      `Alle ${count} sichtbaren provider nutzen dasselbe gecachte Snapshot-Fenster.`,
    mixedDetail: (newestProvider, newestSync, oldestProvider, oldestSync) =>
      `Neuester sichtbarer Snapshot: ${newestProvider} (${newestSync}). Ältester sichtbarer Snapshot: ${oldestProvider} (${oldestSync}).`,
    startHereLabel: "Hier starten",
    nextStepLabel: "Nächster Schritt",
    currentContractLabel: "Aktueller Vertrag",
    enableProviderHeadline: "Einen provider in Settings aktivieren",
    enableProviderDetail:
      "Das popup wird erst nützlich, wenn mindestens ein provider sichtbar ist. Starte in Settings und kehre dann für Status- und Aufmerksamkeitstriage mit einem Klick zurück.",
    startWithProviderHeadline: (provider) =>
      `Mit ${provider} in Quick Setup starten`,
    startWithProviderDetail: (provider) =>
      `Öffne Settings > Quick Setup und aktiviere ${provider}. Schließe danach browser access und usage page ab, bevor du zur Status-Triage zurückkehrst.`,
    openQuickSetupAction: "Quick Setup öffnen",
    grantAccessSingleHeadline: (provider) =>
      `Host access für ${provider} gewähren`,
    grantAccessManyHeadline: "Host access in Settings gewähren",
    singleMissingAccessDetail: (provider) =>
      `${provider} benötigt noch optional host access, daher kann das popup noch keinen gesunden live Status anzeigen.`,
    multipleMissingAccessDetail: (count) =>
      `${count} benötigen noch optional host access, bevor das popup einen abgeglichenen gesunden Snapshot zeigen kann.`,
    addCredentialsSingleHeadline: (provider) =>
      `Credentials für ${provider} hinzufügen`,
    addCredentialsManyHeadline: "Credentials in Settings hinzufügen",
    singleMissingCredentialDetail: (provider) =>
      `${provider} benötigt noch gespeicherte credentials, bevor live sync laufen kann.`,
    multipleMissingCredentialDetail: (count) =>
      `${count} hängen noch von fehlenden gespeicherten credentials ab, bevor ihr aktueller live Pfad sauber laufen kann.`,
    reviewProviderHeadline: (provider) => `${provider} prüfen`,
    policyOnlyHeadline: "Sichtbare provider sind policy-only",
    policyOnlyDetail:
      "Das popup kann den geteilten gecachten Status weiter zusammenfassen, aber diese sichtbaren provider stellen in diesem Profil keine live in-browser usage path bereit. Öffne Settings, um aktuelle provider Verträge und source controls zu prüfen.",
    openDetail: "Detail öffnen",
    reviewDetail: "Detail prüfen",
    setupLabel: "Setup-Abdeckung",
    liveReadyItemLabel: "Live-ready",
    hostAccessItemLabel: "Host access",
    credentialsItemLabel: "Credentials",
    policyOnlyItemLabel: "Policy-only",
    statusStartSetup: "Setup starten",
    statusNeedsSetup: "Setup nötig",
    statusNeedsReview: "Prüfung nötig",
    statusContractOnly: "Nur Vertrag",
    statusReady: "Bereit",
    noVisibleHeadline: "Keine sichtbaren provider konfiguriert",
    noVisibleDetail:
      "Aktiviere zuerst einen provider in Settings. Danach zeigt diese Karte, ob sichtbare provider live-ready, durch setup blockiert oder policy-only sind.",
    noVisibleDetailForProvider: (provider) =>
      `Aktiviere zuerst ${provider} in Settings > Quick Setup. Danach zeigt diese Karte, ob sichtbare provider live-ready, durch setup blockiert oder policy-only sind.`,
    visibleProvidersHeadline: (count) => `${count} sichtbar`,
    needsSetupDetail: (sentence) =>
      `Beende das Setup in Settings, bevor du dieses popup als ready behandelst. ${sentence}`,
    needsReviewDetail: (count) =>
      `Das Setup in Settings ist klar, aber ${count} benötigen noch Prüfung im Produkt.`,
    contractOnlyDetail:
      "Sichtbare provider sind konfiguriert, aber ihr aktueller Vertrag ist policy-only statt einer live in-browser path.",
    mixedReadyPolicyDetail: (liveReady, policyOnly) =>
      `${liveReady} sind live-ready. ${policyOnly} sind policy-only.`,
    readyDetail:
      "Hier sind keine Setup-Blocker aus Settings sichtbar. Nutze die Zusammenfassung unten, um live-ready und policy-only Abdeckung zu prüfen.",
    setupBlockerAccess: (count) => `${count} benötigen noch host access.`,
    setupBlockerCredentials: (count) =>
      `${count} benötigen noch credentials.`,
    headerNoVisible:
      "Starte in Settings. Sobald ein provider sichtbar ist, fasst dieses popup live readiness und nächste Schritte zusammen.",
    headerNoVisibleForProvider: (provider) =>
      `Starte mit ${provider} in Settings > Quick Setup. Sobald ein provider sichtbar ist, fasst dieses popup live readiness und nächste Schritte zusammen.`,
    headerNeedsSetup:
      "Nutze dieses popup, um Setup-Blocker von bereits ready providern zu trennen.",
    headerContractOnly:
      "Dieses popup zeigt aktuellen Vertragskontext statt eines live in-browser sync Pfads.",
    headerNeedsReview:
      "Das Setup in Settings ist klar. Nutze dieses popup für schnelle freshness- und provider-Prüfung.",
    headerReady:
      "Nutze dieses popup für schnelle freshness- und provider-Prüfung, ohne das vollständige dashboard erneut zu öffnen.",
  },
  it: {
    providerCount: (count) => `${count} provider`,
    noProvidersLabel: "Nessun provider",
    noProvidersHeadline: "Nessun provider visibile",
    noProvidersDetail:
      "Non esiste ancora uno snapshot condiviso del popup. Attiva un provider per iniziare a salvare lo stato qui.",
    syncIssueLabel: "Problema di sync",
    mixedStateLabel: "Stato misto",
    alignedLabel: "Allineato",
    alignedSingleDetail:
      "Il provider visibile condivide la stessa finestra di snapshot in cache.",
    alignedManyDetail: (count) =>
      `Tutti i ${count} visibili condividono la stessa finestra di snapshot in cache.`,
    mixedDetail: (newestProvider, newestSync, oldestProvider, oldestSync) =>
      `Snapshot visibile più recente: ${newestProvider} (${newestSync}). Snapshot visibile più vecchio: ${oldestProvider} (${oldestSync}).`,
    startHereLabel: "Inizia qui",
    nextStepLabel: "Passo successivo",
    currentContractLabel: "Contratto attuale",
    enableProviderHeadline: "Attiva un provider in Settings",
    enableProviderDetail:
      "Il popup diventa utile solo quando almeno un provider è visibile. Inizia in Settings, poi torna qui per triage di stato e attenzione in un clic.",
    startWithProviderHeadline: (provider) =>
      `Inizia con ${provider} in Quick Setup`,
    startWithProviderDetail: (provider) =>
      `Apri Settings > Quick Setup e attiva ${provider}. Poi completa browser access e usage page prima di tornare qui per il triage di stato.`,
    openQuickSetupAction: "Apri Quick Setup",
    grantAccessSingleHeadline: (provider) =>
      `Concedi host access per ${provider}`,
    grantAccessManyHeadline: "Concedi host access in Settings",
    singleMissingAccessDetail: (provider) =>
      `${provider} richiede ancora optional host access, quindi il popup non può ancora mostrare uno stato live sano.`,
    multipleMissingAccessDetail: (count) =>
      `${count} richiedono ancora optional host access prima che il popup possa mostrare uno snapshot allineato e sano.`,
    addCredentialsSingleHeadline: (provider) =>
      `Aggiungi credentials per ${provider}`,
    addCredentialsManyHeadline: "Aggiungi credentials in Settings",
    singleMissingCredentialDetail: (provider) =>
      `${provider} richiede ancora credentials salvate prima che live sync possa funzionare.`,
    multipleMissingCredentialDetail: (count) =>
      `${count} dipendono ancora da credentials salvate mancanti prima che il percorso live attuale possa funzionare bene.`,
    reviewProviderHeadline: (provider) => `Rivedi ${provider}`,
    policyOnlyHeadline: "I provider visibili sono policy-only",
    policyOnlyDetail:
      "Il popup può ancora riassumere lo stato condiviso in cache, ma questi provider visibili non espongono una live in-browser usage path in questo profilo. Apri Settings per rivedere contratti provider e source controls correnti.",
    openDetail: "Apri dettaglio",
    reviewDetail: "Rivedi dettaglio",
    setupLabel: "Copertura setup",
    liveReadyItemLabel: "Live-ready",
    hostAccessItemLabel: "Host access",
    credentialsItemLabel: "Credentials",
    policyOnlyItemLabel: "Policy-only",
    statusStartSetup: "Avvia setup",
    statusNeedsSetup: "Setup richiesto",
    statusNeedsReview: "Revisione richiesta",
    statusContractOnly: "Solo contratto",
    statusReady: "Pronto",
    noVisibleHeadline: "Nessun provider visibile configurato",
    noVisibleDetail:
      "Attiva prima un provider in Settings. Poi questa scheda mostrerà se i provider visibili sono live-ready, bloccati dal setup o policy-only.",
    noVisibleDetailForProvider: (provider) =>
      `Attiva prima ${provider} in Settings > Quick Setup. Poi questa scheda mostrerà se i provider visibili sono live-ready, bloccati dal setup o policy-only.`,
    visibleProvidersHeadline: (count) => `${count} visibili`,
    needsSetupDetail: (sentence) =>
      `Completa il setup in Settings prima di considerare questo popup ready. ${sentence}`,
    needsReviewDetail: (count) =>
      `Il setup in Settings è chiaro, ma ${count} richiedono ancora revisione nel prodotto.`,
    contractOnlyDetail:
      "I provider visibili sono configurati, ma il contratto attuale è policy-only invece di una live in-browser path.",
    mixedReadyPolicyDetail: (liveReady, policyOnly) =>
      `${liveReady} sono live-ready. ${policyOnly} sono policy-only.`,
    readyDetail:
      "Qui non sono visibili blocchi di setup da Settings. Usa il riepilogo sotto per confermare copertura live-ready e policy-only.",
    setupBlockerAccess: (count) => `${count} richiedono ancora host access.`,
    setupBlockerCredentials: (count) =>
      `${count} richiedono ancora credentials.`,
    headerNoVisible:
      "Inizia in Settings. Quando un provider è visibile, questo popup riassume live readiness e prossimi passi.",
    headerNoVisibleForProvider: (provider) =>
      `Inizia con ${provider} in Settings > Quick Setup. Quando un provider è visibile, questo popup riassume live readiness e prossimi passi.`,
    headerNeedsSetup:
      "Usa questo popup per separare blocchi di setup dai provider già ready.",
    headerContractOnly:
      "Questo popup mostra il contesto del contratto attuale, non un percorso live in-browser sync.",
    headerNeedsReview:
      "Il setup in Settings è chiaro. Usa questo popup per rivedere rapidamente freshness e provider.",
    headerReady:
      "Usa questo popup per rivedere rapidamente freshness e provider senza riaprire il dashboard completo.",
  },
  ru: {
    providerCount: (count) => `${count} provider`,
    noProvidersLabel: "Нет provider",
    noProvidersHeadline: "Нет видимых provider",
    noProvidersDetail:
      "Общего snapshot для popup пока нет. Включите один provider, чтобы здесь начал кешироваться статус.",
    syncIssueLabel: "Проблема sync",
    mixedStateLabel: "Смешанное состояние",
    alignedLabel: "Согласовано",
    alignedSingleDetail:
      "Видимый provider использует то же кешированное окно snapshot.",
    alignedManyDetail: (count) =>
      `Все ${count} видимых provider используют то же кешированное окно snapshot.`,
    mixedDetail: (newestProvider, newestSync, oldestProvider, oldestSync) =>
      `Самый новый видимый snapshot: ${newestProvider} (${newestSync}). Самый старый видимый snapshot: ${oldestProvider} (${oldestSync}).`,
    startHereLabel: "Начните здесь",
    nextStepLabel: "Следующий шаг",
    currentContractLabel: "Текущий контракт",
    enableProviderHeadline: "Включите provider в Settings",
    enableProviderDetail:
      "popup становится полезным только после появления хотя бы одного provider. Начните в Settings, затем вернитесь сюда для быстрой проверки статуса и внимания.",
    startWithProviderHeadline: (provider) =>
      `Начните с ${provider} в Quick Setup`,
    startWithProviderDetail: (provider) =>
      `Откройте Settings > Quick Setup и включите ${provider}. Затем завершите browser access и usage page перед возвратом к проверке статуса.`,
    openQuickSetupAction: "Открыть Quick Setup",
    grantAccessSingleHeadline: (provider) =>
      `Дать host access для ${provider}`,
    grantAccessManyHeadline: "Дать host access в Settings",
    singleMissingAccessDetail: (provider) =>
      `${provider} все еще требует optional host access, поэтому popup пока не может показать здоровый live статус.`,
    multipleMissingAccessDetail: (count) =>
      `${count} все еще требуют optional host access, прежде чем popup сможет показать согласованный здоровый snapshot.`,
    addCredentialsSingleHeadline: (provider) =>
      `Добавить credentials для ${provider}`,
    addCredentialsManyHeadline: "Добавить credentials в Settings",
    singleMissingCredentialDetail: (provider) =>
      `${provider} все еще требует сохраненные credentials, прежде чем live sync сможет запускаться.`,
    multipleMissingCredentialDetail: (count) =>
      `${count} все еще зависят от отсутствующих сохраненных credentials, прежде чем их текущий live путь сможет работать стабильно.`,
    reviewProviderHeadline: (provider) => `Проверить ${provider}`,
    policyOnlyHeadline: "Видимые provider имеют policy-only",
    policyOnlyDetail:
      "popup все еще может сводить общий кешированный статус, но эти видимые provider не предоставляют live in-browser usage path в этом профиле. Откройте Settings, чтобы проверить текущие контракты provider и source controls.",
    openDetail: "Открыть детали",
    reviewDetail: "Проверить детали",
    setupLabel: "Покрытие setup",
    liveReadyItemLabel: "Live-ready",
    hostAccessItemLabel: "Host access",
    credentialsItemLabel: "Credentials",
    policyOnlyItemLabel: "Policy-only",
    statusStartSetup: "Начать setup",
    statusNeedsSetup: "Нужен setup",
    statusNeedsReview: "Нужна проверка",
    statusContractOnly: "Только контракт",
    statusReady: "Готово",
    noVisibleHeadline: "Нет настроенных видимых provider",
    noVisibleDetail:
      "Сначала включите один provider в Settings. Затем эта карточка покажет, являются ли видимые provider live-ready, заблокированы setup или policy-only.",
    noVisibleDetailForProvider: (provider) =>
      `Сначала включите ${provider} в Settings > Quick Setup. Затем эта карточка покажет, являются ли видимые provider live-ready, заблокированы setup или policy-only.`,
    visibleProvidersHeadline: (count) => `${count} видимых`,
    needsSetupDetail: (sentence) =>
      `Завершите setup в Settings, прежде чем считать этот popup ready. ${sentence}`,
    needsReviewDetail: (count) =>
      `Setup в Settings ясен, но ${count} все еще требуют проверки в продукте.`,
    contractOnlyDetail:
      "Видимые provider настроены, но их текущий контракт policy-only, а не live in-browser path.",
    mixedReadyPolicyDetail: (liveReady, policyOnly) =>
      `${liveReady} имеют live-ready. ${policyOnly} имеют policy-only.`,
    readyDetail:
      "Здесь не видно блокировок setup из Settings. Используйте сводку ниже, чтобы проверить покрытие live-ready и policy-only.",
    setupBlockerAccess: (count) => `${count} все еще требуют host access.`,
    setupBlockerCredentials: (count) =>
      `${count} все еще требуют credentials.`,
    headerNoVisible:
      "Начните в Settings. Когда один provider станет видимым, этот popup покажет live readiness и следующие шаги.",
    headerNoVisibleForProvider: (provider) =>
      `Начните с ${provider} в Settings > Quick Setup. Когда один provider станет видимым, этот popup покажет live readiness и следующие шаги.`,
    headerNeedsSetup:
      "Используйте этот popup, чтобы отделить блокировки setup от уже ready provider.",
    headerContractOnly:
      "Этот popup показывает текущий контекст контракта, а не путь live in-browser sync.",
    headerNeedsReview:
      "Setup в Settings ясен. Используйте этот popup для быстрой проверки freshness и provider.",
    headerReady:
      "Используйте этот popup для быстрой проверки freshness и provider без повторного открытия полного dashboard.",
  },
  ar: {
    providerCount: (count) => `${count} provider`,
    noProvidersLabel: "لا توجد provider",
    noProvidersHeadline: "لا توجد provider مرئية",
    noProvidersDetail:
      "لا توجد snapshot مشتركة في popup بعد. فعّل provider واحدا لبدء تخزين الحالة هنا.",
    syncIssueLabel: "مشكلة sync",
    mixedStateLabel: "حالة مختلطة",
    alignedLabel: "متوافق",
    alignedSingleDetail:
      "الـ provider المرئي يستخدم نافذة snapshot المخزنة نفسها.",
    alignedManyDetail: (count) =>
      `كل ${count} المرئية تستخدم نافذة snapshot المخزنة نفسها.`,
    mixedDetail: (newestProvider, newestSync, oldestProvider, oldestSync) =>
      `أحدث snapshot مرئية: ${newestProvider} (${newestSync}). أقدم snapshot مرئية: ${oldestProvider} (${oldestSync}).`,
    startHereLabel: "ابدأ هنا",
    nextStepLabel: "الخطوة التالية",
    currentContractLabel: "العقد الحالي",
    enableProviderHeadline: "فعّل provider في Settings",
    enableProviderDetail:
      "يصبح popup مفيدا فقط بعد ظهور provider واحد على الأقل. ابدأ من Settings ثم عد إلى هنا لفحص الحالة والتنبيهات بنقرة واحدة.",
    startWithProviderHeadline: (provider) =>
      `ابدأ مع ${provider} في Quick Setup`,
    startWithProviderDetail: (provider) =>
      `افتح Settings > Quick Setup وفعّل ${provider}. ثم أكمل خطوات browser access و usage page قبل العودة لفحص الحالة.`,
    openQuickSetupAction: "فتح Quick Setup",
    grantAccessSingleHeadline: (provider) =>
      `امنح host access لـ ${provider}`,
    grantAccessManyHeadline: "امنح host access في Settings",
    singleMissingAccessDetail: (provider) =>
      `${provider} ما زال يحتاج optional host access، لذلك لا يستطيع popup عرض حالة live سليمة بعد.`,
    multipleMissingAccessDetail: (count) =>
      `${count} ما زالت تحتاج optional host access قبل أن يستقر popup على snapshot متوافقة وسليمة.`,
    addCredentialsSingleHeadline: (provider) =>
      `أضف credentials لـ ${provider}`,
    addCredentialsManyHeadline: "أضف credentials في Settings",
    singleMissingCredentialDetail: (provider) =>
      `${provider} ما زال يحتاج credentials محفوظة قبل أن يعمل live sync.`,
    multipleMissingCredentialDetail: (count) =>
      `${count} ما زالت تعتمد على credentials محفوظة مفقودة قبل أن يعمل مسار live الحالي بثبات.`,
    reviewProviderHeadline: (provider) => `راجع ${provider}`,
    policyOnlyHeadline: "الـ providers المرئية هي policy-only",
    policyOnlyDetail:
      "يمكن لـ popup تلخيص الحالة المشتركة المخزنة، لكن هذه providers المرئية لا تعرض live in-browser usage path في هذا profile. افتح Settings لمراجعة عقود provider الحالية و source controls.",
    openDetail: "فتح التفاصيل",
    reviewDetail: "مراجعة التفاصيل",
    setupLabel: "تغطية setup",
    liveReadyItemLabel: "Live-ready",
    hostAccessItemLabel: "Host access",
    credentialsItemLabel: "Credentials",
    policyOnlyItemLabel: "Policy-only",
    statusStartSetup: "بدء setup",
    statusNeedsSetup: "يحتاج setup",
    statusNeedsReview: "يحتاج مراجعة",
    statusContractOnly: "عقد فقط",
    statusReady: "جاهز",
    noVisibleHeadline: "لا توجد provider مرئية مضبوطة",
    noVisibleDetail:
      "فعّل provider واحدا في Settings أولا. بعدها ستعرض هذه البطاقة هل providers المرئية live-ready أو محجوبة بسبب setup أو policy-only.",
    noVisibleDetailForProvider: (provider) =>
      `فعّل ${provider} أولا في Settings > Quick Setup. بعدها ستعرض هذه البطاقة هل providers المرئية live-ready أو محجوبة بسبب setup أو policy-only.`,
    visibleProvidersHeadline: (count) => `${count} مرئية`,
    needsSetupDetail: (sentence) =>
      `أكمل setup في Settings قبل اعتبار هذا popup ready. ${sentence}`,
    needsReviewDetail: (count) =>
      `إعداد Settings واضح، لكن ${count} ما زالت تحتاج مراجعة داخل المنتج.`,
    contractOnlyDetail:
      "الـ providers المرئية مضبوطة، لكن العقد الحالي policy-only وليس live in-browser path.",
    mixedReadyPolicyDetail: (liveReady, policyOnly) =>
      `${liveReady} live-ready. ${policyOnly} policy-only.`,
    readyDetail:
      "لا تظهر هنا أي عوائق setup من Settings. استخدم الملخص أدناه لتأكيد تغطية live-ready و policy-only.",
    setupBlockerAccess: (count) => `${count} ما زالت تحتاج host access.`,
    setupBlockerCredentials: (count) =>
      `${count} ما زالت تحتاج credentials.`,
    headerNoVisible:
      "ابدأ من Settings. عندما يصبح provider واحد مرئيا، سيلخص هذا popup حالة live readiness والخطوات التالية.",
    headerNoVisibleForProvider: (provider) =>
      `ابدأ مع ${provider} في Settings > Quick Setup. عندما يصبح provider واحد مرئيا، سيلخص هذا popup حالة live readiness والخطوات التالية.`,
    headerNeedsSetup:
      "استخدم هذا popup لفصل عوائق setup عن providers الجاهزة بالفعل.",
    headerContractOnly:
      "يعرض هذا popup سياق العقد الحالي وليس مسار live in-browser sync.",
    headerNeedsReview:
      "إعداد Settings واضح. استخدم هذا popup لمراجعة freshness و provider بسرعة.",
    headerReady:
      "استخدم هذا popup لمراجعة freshness و provider بسرعة دون إعادة فتح dashboard الكامل.",
  },
  hi: {
    providerCount: (count) => `${count} provider`,
    noProvidersLabel: "कोई provider नहीं",
    noProvidersHeadline: "कोई visible provider नहीं",
    noProvidersDetail:
      "अभी कोई साझा popup snapshot मौजूद नहीं है। यहां state cache शुरू करने के लिए एक provider enable करें।",
    syncIssueLabel: "sync समस्या",
    mixedStateLabel: "मिला-जुला state",
    alignedLabel: "Aligned",
    alignedSingleDetail:
      "Visible provider वही cached snapshot window साझा कर रहा है।",
    alignedManyDetail: (count) =>
      `सभी ${count} visible provider वही cached snapshot window साझा कर रहे हैं।`,
    mixedDetail: (newestProvider, newestSync, oldestProvider, oldestSync) =>
      `Newest visible snapshot: ${newestProvider} (${newestSync}). Oldest visible snapshot: ${oldestProvider} (${oldestSync}).`,
    startHereLabel: "यहां शुरू करें",
    nextStepLabel: "अगला step",
    currentContractLabel: "मौजूदा contract",
    enableProviderHeadline: "Settings में एक provider enable करें",
    enableProviderDetail:
      "popup तभी उपयोगी होता है जब कम से कम एक provider visible हो। Settings से शुरू करें, फिर one-click status और attention triage के लिए यहां लौटें।",
    startWithProviderHeadline: (provider) =>
      `Quick Setup में ${provider} से शुरू करें`,
    startWithProviderDetail: (provider) =>
      `Settings > Quick Setup खोलें और ${provider} enable करें। फिर status triage के लिए लौटने से पहले browser access और usage page steps पूरे करें।`,
    openQuickSetupAction: "Quick Setup खोलें",
    grantAccessSingleHeadline: (provider) =>
      `${provider} के लिए host access दें`,
    grantAccessManyHeadline: "Settings में host access दें",
    singleMissingAccessDetail: (provider) =>
      `${provider} को अभी optional host access चाहिए, इसलिए popup healthy live state नहीं दिखा सकता।`,
    multipleMissingAccessDetail: (count) =>
      `${count} को अभी optional host access चाहिए, तभी popup एक aligned healthy snapshot पर आ सकेगा।`,
    addCredentialsSingleHeadline: (provider) =>
      `${provider} के लिए credentials जोड़ें`,
    addCredentialsManyHeadline: "Settings में credentials जोड़ें",
    singleMissingCredentialDetail: (provider) =>
      `${provider} को अभी saved credentials चाहिए, तभी live sync चल सकेगा।`,
    multipleMissingCredentialDetail: (count) =>
      `${count} अभी missing saved credentials पर निर्भर हैं, इसलिए current live path साफ तरह से नहीं चल सकता।`,
    reviewProviderHeadline: (provider) => `${provider} की समीक्षा करें`,
    policyOnlyHeadline: "Visible providers policy-only हैं",
    policyOnlyDetail:
      "popup shared cached state को summarize कर सकता है, लेकिन ये visible providers इस profile में live in-browser usage path expose नहीं करते। Current provider contracts और source controls देखने के लिए Settings खोलें।",
    openDetail: "Detail खोलें",
    reviewDetail: "Detail review करें",
    setupLabel: "Setup coverage",
    liveReadyItemLabel: "Live-ready",
    hostAccessItemLabel: "Host access",
    credentialsItemLabel: "Credentials",
    policyOnlyItemLabel: "Policy-only",
    statusStartSetup: "Setup शुरू करें",
    statusNeedsSetup: "Setup चाहिए",
    statusNeedsReview: "Review चाहिए",
    statusContractOnly: "Contract-only",
    statusReady: "Ready",
    noVisibleHeadline: "कोई visible provider configured नहीं",
    noVisibleDetail:
      "पहले Settings में एक provider enable करें। फिर यह card दिखाएगा कि visible providers live-ready हैं, setup से blocked हैं या policy-only हैं।",
    noVisibleDetailForProvider: (provider) =>
      `पहले Settings > Quick Setup में ${provider} enable करें। फिर यह card दिखाएगा कि visible providers live-ready हैं, setup से blocked हैं या policy-only हैं।`,
    visibleProvidersHeadline: (count) => `${count} visible`,
    needsSetupDetail: (sentence) =>
      `इस popup को ready मानने से पहले Settings setup पूरा करें। ${sentence}`,
    needsReviewDetail: (count) =>
      `Settings setup साफ है, लेकिन ${count} को अभी in-product review चाहिए।`,
    contractOnlyDetail:
      "Visible providers configured हैं, लेकिन उनका current contract live in-browser path के बजाय policy-only है।",
    mixedReadyPolicyDetail: (liveReady, policyOnly) =>
      `${liveReady} live-ready हैं। ${policyOnly} policy-only हैं।`,
    readyDetail:
      "यहां Settings setup blockers नहीं दिख रहे। नीचे summary से live-ready और policy-only coverage confirm करें।",
    setupBlockerAccess: (count) => `${count} को अभी host access चाहिए।`,
    setupBlockerCredentials: (count) => `${count} को अभी credentials चाहिए।`,
    headerNoVisible:
      "Settings से शुरू करें। एक provider visible होते ही यह popup live readiness और next steps summarize करेगा।",
    headerNoVisibleForProvider: (provider) =>
      `Settings > Quick Setup में ${provider} से शुरू करें। एक provider visible होते ही यह popup live readiness और next steps summarize करेगा।`,
    headerNeedsSetup:
      "इस popup से setup blockers और already ready providers को अलग देखें।",
    headerContractOnly:
      "यह popup current contract context दिखा रहा है, live in-browser sync path नहीं।",
    headerNeedsReview:
      "Settings setup साफ है। Freshness और provider triage के लिए यह popup इस्तेमाल करें।",
    headerReady:
      "पूरा dashboard फिर खोले बिना freshness और provider triage के लिए यह popup इस्तेमाल करें।",
  },
  id: {
    providerCount: (count) => `${count} provider`,
    noProvidersLabel: "Tidak ada provider",
    noProvidersHeadline: "Tidak ada provider terlihat",
    noProvidersDetail:
      "Belum ada snapshot popup bersama. Aktifkan satu provider untuk mulai menyimpan state di sini.",
    syncIssueLabel: "Masalah sync",
    mixedStateLabel: "State campuran",
    alignedLabel: "Selaras",
    alignedSingleDetail:
      "Provider yang terlihat memakai jendela snapshot cache yang sama.",
    alignedManyDetail: (count) =>
      `Semua ${count} yang terlihat memakai jendela snapshot cache yang sama.`,
    mixedDetail: (newestProvider, newestSync, oldestProvider, oldestSync) =>
      `Snapshot terlihat terbaru: ${newestProvider} (${newestSync}). Snapshot terlihat terlama: ${oldestProvider} (${oldestSync}).`,
    startHereLabel: "Mulai di sini",
    nextStepLabel: "Langkah berikutnya",
    currentContractLabel: "Kontrak saat ini",
    enableProviderHeadline: "Aktifkan provider di Settings",
    enableProviderDetail:
      "popup baru berguna setelah setidaknya satu provider terlihat. Mulai dari Settings, lalu kembali ke sini untuk triage status dan perhatian sekali klik.",
    startWithProviderHeadline: (provider) =>
      `Mulai dengan ${provider} di Quick Setup`,
    startWithProviderDetail: (provider) =>
      `Buka Settings > Quick Setup dan aktifkan ${provider}. Lalu selesaikan langkah browser access dan usage page sebelum kembali ke sini untuk triage status.`,
    openQuickSetupAction: "Buka Quick Setup",
    grantAccessSingleHeadline: (provider) =>
      `Berikan host access untuk ${provider}`,
    grantAccessManyHeadline: "Berikan host access di Settings",
    singleMissingAccessDetail: (provider) =>
      `${provider} masih memerlukan optional host access, jadi popup belum bisa menampilkan state live yang sehat.`,
    multipleMissingAccessDetail: (count) =>
      `${count} masih memerlukan optional host access sebelum popup bisa menjadi snapshot yang selaras dan sehat.`,
    addCredentialsSingleHeadline: (provider) =>
      `Tambahkan credentials untuk ${provider}`,
    addCredentialsManyHeadline: "Tambahkan credentials di Settings",
    singleMissingCredentialDetail: (provider) =>
      `${provider} masih memerlukan credentials tersimpan sebelum live sync dapat berjalan.`,
    multipleMissingCredentialDetail: (count) =>
      `${count} masih bergantung pada credentials tersimpan yang hilang sebelum jalur live saat ini dapat berjalan bersih.`,
    reviewProviderHeadline: (provider) => `Tinjau ${provider}`,
    policyOnlyHeadline: "Provider terlihat bersifat policy-only",
    policyOnlyDetail:
      "popup masih dapat merangkum state cache bersama, tetapi provider terlihat ini tidak mengekspos live in-browser usage path di profil ini. Buka Settings untuk meninjau kontrak provider saat ini dan source controls.",
    openDetail: "Buka detail",
    reviewDetail: "Tinjau detail",
    setupLabel: "Cakupan setup",
    liveReadyItemLabel: "Live-ready",
    hostAccessItemLabel: "Host access",
    credentialsItemLabel: "Credentials",
    policyOnlyItemLabel: "Policy-only",
    statusStartSetup: "Mulai setup",
    statusNeedsSetup: "Perlu setup",
    statusNeedsReview: "Perlu tinjauan",
    statusContractOnly: "Hanya kontrak",
    statusReady: "Siap",
    noVisibleHeadline: "Belum ada provider terlihat yang dikonfigurasi",
    noVisibleDetail:
      "Aktifkan satu provider di Settings terlebih dahulu. Setelah itu kartu ini akan menunjukkan apakah provider terlihat live-ready, terblokir setup, atau policy-only.",
    noVisibleDetailForProvider: (provider) =>
      `Aktifkan ${provider} di Settings > Quick Setup terlebih dahulu. Setelah itu kartu ini akan menunjukkan apakah provider terlihat live-ready, terblokir setup, atau policy-only.`,
    visibleProvidersHeadline: (count) => `${count} terlihat`,
    needsSetupDetail: (sentence) =>
      `Selesaikan setup di Settings sebelum menganggap popup ini ready. ${sentence}`,
    needsReviewDetail: (count) =>
      `Setup di Settings sudah jelas, tetapi ${count} masih perlu tinjauan di dalam produk.`,
    contractOnlyDetail:
      "Provider terlihat sudah dikonfigurasi, tetapi kontrak saat ini policy-only, bukan live in-browser path.",
    mixedReadyPolicyDetail: (liveReady, policyOnly) =>
      `${liveReady} live-ready. ${policyOnly} policy-only.`,
    readyDetail:
      "Tidak ada blocker setup dari Settings yang terlihat di sini. Gunakan ringkasan di bawah untuk memastikan cakupan live-ready dan policy-only.",
    setupBlockerAccess: (count) => `${count} masih memerlukan host access.`,
    setupBlockerCredentials: (count) =>
      `${count} masih memerlukan credentials.`,
    headerNoVisible:
      "Mulai dari Settings. Setelah satu provider terlihat, popup ini akan merangkum live readiness dan langkah berikutnya.",
    headerNoVisibleForProvider: (provider) =>
      `Mulai dengan ${provider} di Settings > Quick Setup. Setelah satu provider terlihat, popup ini akan merangkum live readiness dan langkah berikutnya.`,
    headerNeedsSetup:
      "Gunakan popup ini untuk memisahkan blocker setup dari provider yang sudah ready.",
    headerContractOnly:
      "popup ini menampilkan konteks kontrak saat ini, bukan jalur live in-browser sync.",
    headerNeedsReview:
      "Setup Settings sudah jelas. Gunakan popup ini untuk meninjau freshness dan provider dengan cepat.",
    headerReady:
      "Gunakan popup ini untuk meninjau freshness dan provider tanpa membuka ulang dashboard lengkap.",
  },
};

type PopupFeaturedCopyText = {
  providerTriageLabel: string;
  nothingToTriageHeadline: string;
  actionableAfterVisibleDetail: string;
  noProviderCardsYetHeadline: string;
  enableProviderComeBackDetail: string;
  actionableAfterFirstProviderDetail: (providerLabel: string) => string;
  startFirstProviderComeBackDetail: (providerLabel: string) => string;
  needsAttentionLabel: string;
  featuredProvidersHeadline: string;
  needsAttentionDetail: string;
  currentContractLabel: string;
  policyOnlyProvidersHeadline: string;
  policyOnlyProvidersDetail: string;
  allClearLabel: string;
  healthyProvidersHeadline: string;
  healthyProvidersDetail: string;
  statusNeedsAccess: string;
  statusNeedsSetup: string;
  statusOpenPage: string;
  statusSignIn: string;
  statusReloadPage: string;
  statusNeedsReview: string;
  statusContractOnly: string;
  statusHealthy: string;
  statusWarning: string;
  statusSyncIssue: string;
  primaryBlockedHostAccess: string;
  primaryNeedsCredentials: string;
  primaryNeedsLivePage: string;
  primaryNeedsSignedInPage: string;
  primaryPageUnreadable: string;
  primaryNeedsReview: string;
  primaryPolicyOnly: string;
  primaryLiveReady: string;
  openSourcePageAction: string;
  reviewDetailAction: string;
  openDetailAction: string;
  hideProviderAction: string;
};

const POPUP_FEATURED_COPY: Record<
  PopupFirstRunLocalizedLocale,
  PopupFeaturedCopyText
> = {
  "zh-TW": {
    providerTriageLabel: "Provider 分診",
    nothingToTriageHeadline: "還沒有可分診內容",
    actionableAfterVisibleDetail:
      "至少有一個 provider 在 Settings 可見後，這個區塊才會變得可操作。",
    noProviderCardsYetHeadline: "還沒有 provider 卡片",
    enableProviderComeBackDetail:
      "先在 Settings 啟用一個 provider，再回來做一鍵 provider 分診。",
    actionableAfterFirstProviderDetail: (provider) =>
      `先在 Settings > Quick Setup 啟用 ${provider}，之後這個區塊才會變得可操作。`,
    startFirstProviderComeBackDetail: (provider) =>
      `先從 ${provider} 開始，再回來做一鍵 provider 分診。`,
    needsAttentionLabel: "需要注意",
    featuredProvidersHeadline: "重點 provider",
    needsAttentionDetail:
      "popup 最多顯示 3 個 provider，優先顯示仍需設定或產品內檢查的 provider。",
    currentContractLabel: "目前合約",
    policyOnlyProvidersHeadline: "Policy-only provider",
    policyOnlyProvidersDetail:
      "這個 profile 沒有可見 provider 暴露 live in-browser path，所以這些卡片會偏向合約說明，而不是動作引導。",
    allClearLabel: "狀態正常",
    healthyProvidersHeadline: "健康 provider",
    healthyProvidersDetail:
      "目前沒有可見 provider 需要設定或檢查，所以這個區塊保留頂部 provider 的目前路徑和 freshness 脈絡。",
    statusNeedsAccess: "需要 host access",
    statusNeedsSetup: "需要設定",
    statusOpenPage: "開啟頁面",
    statusSignIn: "登入",
    statusReloadPage: "重新載入頁面",
    statusNeedsReview: "需要檢查",
    statusContractOnly: "僅合約",
    statusHealthy: "健康",
    statusWarning: "警告",
    statusSyncIssue: "同步異常",
    primaryBlockedHostAccess: "目前路徑被 host access 阻擋。",
    primaryNeedsCredentials: "目前路徑仍需要已儲存 credentials。",
    primaryNeedsLivePage: "目前路徑仍需要 live page session。",
    primaryNeedsSignedInPage: "目前路徑需要再次取得已登入頁面。",
    primaryPageUnreadable: "目前 page session 已開啟，但無法讀取。",
    primaryNeedsReview: "Settings 設定已清楚，但這個 provider 仍需要檢查。",
    primaryPolicyOnly: "目前合約在這個 profile 中是 policy-only。",
    primaryLiveReady: "目前路徑在這個 profile 中已 live-ready。",
    openSourcePageAction: "開啟來源頁面",
    reviewDetailAction: "檢查詳細資訊",
    openDetailAction: "開啟詳細資訊",
    hideProviderAction: "停止顯示",
  },
  ja: {
    providerTriageLabel: "Provider トリアージ",
    nothingToTriageHeadline: "まだトリアージ対象はありません",
    actionableAfterVisibleDetail:
      "少なくとも 1 つの provider が Settings で表示されると、このセクションが操作可能になります。",
    noProviderCardsYetHeadline: "provider カードはまだありません",
    enableProviderComeBackDetail:
      "Settings で provider を 1 つ有効にしてから、ここに戻って provider をワンクリックで確認してください。",
    actionableAfterFirstProviderDetail: (provider) =>
      `まず Settings > Quick Setup で ${provider} を有効にすると、このセクションが操作可能になります。`,
    startFirstProviderComeBackDetail: (provider) =>
      `${provider} から開始し、その後ここに戻って provider をワンクリックで確認してください。`,
    needsAttentionLabel: "注意が必要",
    featuredProvidersHeadline: "注目 provider",
    needsAttentionDetail:
      "popup は最大 3 つの provider を表示し、まだ setup または製品内確認が必要なものを優先します。",
    currentContractLabel: "現在の contract",
    policyOnlyProvidersHeadline: "Policy-only provider",
    policyOnlyProvidersDetail:
      "この profile では表示中の provider が live in-browser path を公開していないため、これらのカードは action より contract に重点を置きます。",
    allClearLabel: "問題なし",
    healthyProvidersHeadline: "健全な provider",
    healthyProvidersDetail:
      "現在、表示中の provider に setup や確認は不要です。このセクションは上位 provider の現在の経路と freshness を一目で残します。",
    statusNeedsAccess: "Host access が必要",
    statusNeedsSetup: "Setup が必要",
    statusOpenPage: "ページを開く",
    statusSignIn: "サインイン",
    statusReloadPage: "ページを再読み込み",
    statusNeedsReview: "確認が必要",
    statusContractOnly: "Contract-only",
    statusHealthy: "健全",
    statusWarning: "警告",
    statusSyncIssue: "sync の問題",
    primaryBlockedHostAccess: "現在の経路は host access でブロックされています。",
    primaryNeedsCredentials: "現在の経路には保存済み credentials がまだ必要です。",
    primaryNeedsLivePage: "現在の経路には live page session がまだ必要です。",
    primaryNeedsSignedInPage: "現在の経路にはサインイン済みページが再度必要です。",
    primaryPageUnreadable: "現在の page session は開いていますが読み取れません。",
    primaryNeedsReview: "Settings setup は明確ですが、この provider はまだ確認が必要です。",
    primaryPolicyOnly: "この profile の現在の contract は policy-only です。",
    primaryLiveReady: "この profile の現在の経路は live-ready です。",
    openSourcePageAction: "ソースページを開く",
    reviewDetailAction: "詳細を確認",
    openDetailAction: "詳細を開く",
    hideProviderAction: "表示を停止",
  },
  ko: {
    providerTriageLabel: "Provider 분류",
    nothingToTriageHeadline: "아직 분류할 항목 없음",
    actionableAfterVisibleDetail:
      "Settings에서 provider가 하나 이상 표시되면 이 섹션을 사용할 수 있습니다.",
    noProviderCardsYetHeadline: "아직 provider 카드 없음",
    enableProviderComeBackDetail:
      "Settings에서 provider 하나를 활성화한 뒤 돌아와 한 번에 provider를 분류하세요.",
    actionableAfterFirstProviderDetail: (provider) =>
      `먼저 Settings > Quick Setup에서 ${provider}를 활성화하면 이 섹션을 사용할 수 있습니다.`,
    startFirstProviderComeBackDetail: (provider) =>
      `${provider}부터 시작한 뒤 돌아와 한 번에 provider를 분류하세요.`,
    needsAttentionLabel: "주의 필요",
    featuredProvidersHeadline: "주요 provider",
    needsAttentionDetail:
      "popup은 최대 3개 provider를 표시하며 아직 setup 또는 제품 내 검토가 필요한 항목을 우선합니다.",
    currentContractLabel: "현재 contract",
    policyOnlyProvidersHeadline: "Policy-only provider",
    policyOnlyProvidersDetail:
      "이 profile에는 live in-browser path를 노출하는 visible provider가 없으므로 이 카드는 action보다 contract 중심으로 유지됩니다.",
    allClearLabel: "문제 없음",
    healthyProvidersHeadline: "정상 provider",
    healthyProvidersDetail:
      "현재 visible provider에 setup이나 검토가 필요하지 않아, 이 섹션은 상위 provider의 현재 경로와 freshness context를 유지합니다.",
    statusNeedsAccess: "Host access 필요",
    statusNeedsSetup: "Setup 필요",
    statusOpenPage: "페이지 열기",
    statusSignIn: "로그인",
    statusReloadPage: "페이지 다시 로드",
    statusNeedsReview: "검토 필요",
    statusContractOnly: "Contract-only",
    statusHealthy: "정상",
    statusWarning: "경고",
    statusSyncIssue: "sync 문제",
    primaryBlockedHostAccess: "현재 경로가 host access에 막혀 있습니다.",
    primaryNeedsCredentials: "현재 경로에는 저장된 credentials가 아직 필요합니다.",
    primaryNeedsLivePage: "현재 경로에는 live page session이 아직 필요합니다.",
    primaryNeedsSignedInPage: "현재 경로에는 로그인된 페이지가 다시 필요합니다.",
    primaryPageUnreadable: "현재 page session은 열려 있지만 읽을 수 없습니다.",
    primaryNeedsReview: "Settings setup은 명확하지만 이 provider는 아직 검토가 필요합니다.",
    primaryPolicyOnly: "이 profile의 현재 contract는 policy-only입니다.",
    primaryLiveReady: "이 profile의 현재 경로는 live-ready입니다.",
    openSourcePageAction: "소스 페이지 열기",
    reviewDetailAction: "상세 검토",
    openDetailAction: "상세 열기",
    hideProviderAction: "표시 중지",
  },
  "es-419": {
    providerTriageLabel: "Triage de provider",
    nothingToTriageHeadline: "Aún no hay nada para revisar",
    actionableAfterVisibleDetail:
      "Esta sección se puede usar cuando al menos un provider está visible en Settings.",
    noProviderCardsYetHeadline: "Aún no hay tarjetas de provider",
    enableProviderComeBackDetail:
      "Activa un provider en Settings y vuelve aquí para triage de provider en un clic.",
    actionableAfterFirstProviderDetail: (provider) =>
      `Activa primero ${provider} en Settings > Quick Setup y esta sección se podrá usar.`,
    startFirstProviderComeBackDetail: (provider) =>
      `Empieza con ${provider} y vuelve aquí para triage de provider en un clic.`,
    needsAttentionLabel: "Requiere atención",
    featuredProvidersHeadline: "Providers destacados",
    needsAttentionDetail:
      "El popup muestra hasta tres providers y prioriza los que aún necesitan setup o revisión dentro del producto.",
    currentContractLabel: "Contrato actual",
    policyOnlyProvidersHeadline: "Providers policy-only",
    policyOnlyProvidersDetail:
      "Ningún provider visible expone una live in-browser path en este profile, así que estas tarjetas se enfocan en contrato en vez de acciones.",
    allClearLabel: "Todo correcto",
    healthyProvidersHeadline: "Providers saludables",
    healthyProvidersDetail:
      "Ningún provider visible necesita setup o revisión, así que esta sección mantiene los providers principales visibles con ruta actual y freshness.",
    statusNeedsAccess: "Necesita host access",
    statusNeedsSetup: "Necesita setup",
    statusOpenPage: "Abrir página",
    statusSignIn: "Iniciar sesión",
    statusReloadPage: "Recargar página",
    statusNeedsReview: "Necesita revisión",
    statusContractOnly: "Solo contrato",
    statusHealthy: "Saludable",
    statusWarning: "Advertencia",
    statusSyncIssue: "Problema de sync",
    primaryBlockedHostAccess: "La ruta actual está bloqueada por host access.",
    primaryNeedsCredentials: "La ruta actual aún necesita credentials guardadas.",
    primaryNeedsLivePage: "La ruta actual aún necesita una live page session.",
    primaryNeedsSignedInPage: "La ruta actual necesita de nuevo la página con sesión iniciada.",
    primaryPageUnreadable: "La page session actual está abierta, pero no se puede leer.",
    primaryNeedsReview: "El setup en Settings está claro, pero este provider todavía necesita revisión.",
    primaryPolicyOnly: "El contrato actual es policy-only en este profile.",
    primaryLiveReady: "La ruta actual está live-ready en este profile.",
    openSourcePageAction: "Abrir página fuente",
    reviewDetailAction: "Revisar detalle",
    openDetailAction: "Abrir detalle",
    hideProviderAction: "Dejar de mostrar",
  },
  "pt-BR": {
    providerTriageLabel: "Triagem de provider",
    nothingToTriageHeadline: "Ainda não há nada para triagem",
    actionableAfterVisibleDetail:
      "Esta seção fica acionável depois que pelo menos um provider está visível em Settings.",
    noProviderCardsYetHeadline: "Ainda não há cartões de provider",
    enableProviderComeBackDetail:
      "Ative um provider em Settings e volte aqui para triagem de provider em um clique.",
    actionableAfterFirstProviderDetail: (provider) =>
      `Ative ${provider} primeiro em Settings > Quick Setup e esta seção ficará acionável.`,
    startFirstProviderComeBackDetail: (provider) =>
      `Comece com ${provider} e volte aqui para triagem de provider em um clique.`,
    needsAttentionLabel: "Precisa de atenção",
    featuredProvidersHeadline: "Providers em destaque",
    needsAttentionDetail:
      "O popup mostra até três providers, priorizando os que ainda precisam de setup ou revisão no produto.",
    currentContractLabel: "Contrato atual",
    policyOnlyProvidersHeadline: "Providers policy-only",
    policyOnlyProvidersDetail:
      "Nenhum provider visível expõe uma live in-browser path neste profile, então estes cartões ficam focados em contrato em vez de ação.",
    allClearLabel: "Tudo certo",
    healthyProvidersHeadline: "Providers saudáveis",
    healthyProvidersDetail:
      "Nenhum provider visível precisa de setup ou revisão, então esta seção mantém os providers principais visíveis com rota atual e freshness.",
    statusNeedsAccess: "Precisa de host access",
    statusNeedsSetup: "Precisa de setup",
    statusOpenPage: "Abrir página",
    statusSignIn: "Entrar",
    statusReloadPage: "Recarregar página",
    statusNeedsReview: "Precisa de revisão",
    statusContractOnly: "Só contrato",
    statusHealthy: "Saudável",
    statusWarning: "Aviso",
    statusSyncIssue: "Problema de sync",
    primaryBlockedHostAccess: "A rota atual está bloqueada por host access.",
    primaryNeedsCredentials: "A rota atual ainda precisa de credentials salvas.",
    primaryNeedsLivePage: "A rota atual ainda precisa de uma live page session.",
    primaryNeedsSignedInPage: "A rota atual precisa da página logada novamente.",
    primaryPageUnreadable: "A page session atual está aberta, mas não pode ser lida.",
    primaryNeedsReview: "O setup em Settings está claro, mas este provider ainda precisa de revisão.",
    primaryPolicyOnly: "O contrato atual é policy-only neste profile.",
    primaryLiveReady: "A rota atual está live-ready neste profile.",
    openSourcePageAction: "Abrir página fonte",
    reviewDetailAction: "Revisar detalhe",
    openDetailAction: "Abrir detalhe",
    hideProviderAction: "Parar de mostrar",
  },
  fr: {
    providerTriageLabel: "Triage provider",
    nothingToTriageHeadline: "Rien à trier pour l'instant",
    actionableAfterVisibleDetail:
      "Cette section devient actionnable lorsqu'au moins un provider est visible dans Settings.",
    noProviderCardsYetHeadline: "Aucune carte provider pour l'instant",
    enableProviderComeBackDetail:
      "Activez un provider dans Settings, puis revenez ici pour un triage provider en un clic.",
    actionableAfterFirstProviderDetail: (provider) =>
      `Activez d'abord ${provider} dans Settings > Quick Setup, puis cette section devient actionnable.`,
    startFirstProviderComeBackDetail: (provider) =>
      `Commencez avec ${provider}, puis revenez ici pour un triage provider en un clic.`,
    needsAttentionLabel: "Attention requise",
    featuredProvidersHeadline: "Providers en avant",
    needsAttentionDetail:
      "Le popup affiche jusqu'à trois providers, en priorisant ceux qui ont encore besoin de setup ou d'une revue dans le produit.",
    currentContractLabel: "Contrat actuel",
    policyOnlyProvidersHeadline: "Providers policy-only",
    policyOnlyProvidersDetail:
      "Aucun provider visible n'expose de live in-browser path dans ce profile, donc ces cartes restent centrées sur le contrat plutôt que sur l'action.",
    allClearLabel: "Tout est clair",
    healthyProvidersHeadline: "Providers sains",
    healthyProvidersDetail:
      "Aucun provider visible n'a besoin de setup ou de revue, donc cette section garde les principaux providers visibles avec route actuelle et freshness.",
    statusNeedsAccess: "Host access requis",
    statusNeedsSetup: "Setup requis",
    statusOpenPage: "Ouvrir la page",
    statusSignIn: "Se connecter",
    statusReloadPage: "Recharger la page",
    statusNeedsReview: "Revue requise",
    statusContractOnly: "Contrat seul",
    statusHealthy: "Sain",
    statusWarning: "Avertissement",
    statusSyncIssue: "Problème de sync",
    primaryBlockedHostAccess: "La route actuelle est bloquée par host access.",
    primaryNeedsCredentials: "La route actuelle a encore besoin de credentials enregistrées.",
    primaryNeedsLivePage: "La route actuelle a encore besoin d'une live page session.",
    primaryNeedsSignedInPage: "La route actuelle a de nouveau besoin de la page connectée.",
    primaryPageUnreadable: "La page session actuelle est ouverte, mais ne peut pas être lue.",
    primaryNeedsReview: "Le setup Settings est clair, mais ce provider a encore besoin d'une revue.",
    primaryPolicyOnly: "Le contrat actuel est policy-only dans ce profile.",
    primaryLiveReady: "La route actuelle est live-ready dans ce profile.",
    openSourcePageAction: "Ouvrir la page source",
    reviewDetailAction: "Examiner le détail",
    openDetailAction: "Ouvrir le détail",
    hideProviderAction: "Ne plus afficher",
  },
  de: {
    providerTriageLabel: "Provider-Triage",
    nothingToTriageHeadline: "Noch nichts zu prüfen",
    actionableAfterVisibleDetail:
      "Dieser Abschnitt wird nutzbar, sobald mindestens ein provider in Settings sichtbar ist.",
    noProviderCardsYetHeadline: "Noch keine provider Karten",
    enableProviderComeBackDetail:
      "Aktiviere einen provider in Settings und kehre dann für provider-Triage mit einem Klick zurück.",
    actionableAfterFirstProviderDetail: (provider) =>
      `Aktiviere zuerst ${provider} in Settings > Quick Setup, dann wird dieser Abschnitt nutzbar.`,
    startFirstProviderComeBackDetail: (provider) =>
      `Starte mit ${provider} und kehre dann für provider-Triage mit einem Klick zurück.`,
    needsAttentionLabel: "Benötigt Aufmerksamkeit",
    featuredProvidersHeadline: "Hervorgehobene provider",
    needsAttentionDetail:
      "Das popup zeigt bis zu drei provider und bevorzugt diejenigen, die noch setup oder Prüfung im Produkt benötigen.",
    currentContractLabel: "Aktueller Vertrag",
    policyOnlyProvidersHeadline: "Policy-only provider",
    policyOnlyProvidersDetail:
      "Kein sichtbarer provider stellt in diesem profile eine live in-browser path bereit, daher bleiben diese Karten vertragsorientiert statt aktionsorientiert.",
    allClearLabel: "Alles klar",
    healthyProvidersHeadline: "Gesunde provider",
    healthyProvidersDetail:
      "Kein sichtbarer provider benötigt aktuell setup oder Prüfung, daher hält dieser Abschnitt die wichtigsten provider mit aktuellem Pfad und freshness sichtbar.",
    statusNeedsAccess: "Host access nötig",
    statusNeedsSetup: "Setup nötig",
    statusOpenPage: "Seite öffnen",
    statusSignIn: "Anmelden",
    statusReloadPage: "Seite neu laden",
    statusNeedsReview: "Prüfung nötig",
    statusContractOnly: "Nur Vertrag",
    statusHealthy: "Gesund",
    statusWarning: "Warnung",
    statusSyncIssue: "Sync-Problem",
    primaryBlockedHostAccess: "Der aktuelle Pfad ist durch host access blockiert.",
    primaryNeedsCredentials: "Der aktuelle Pfad benötigt noch gespeicherte credentials.",
    primaryNeedsLivePage: "Der aktuelle Pfad benötigt noch eine live page session.",
    primaryNeedsSignedInPage: "Der aktuelle Pfad benötigt die angemeldete Seite erneut.",
    primaryPageUnreadable: "Die aktuelle page session ist geöffnet, kann aber nicht gelesen werden.",
    primaryNeedsReview: "Das Settings setup ist klar, aber dieser provider benötigt noch Prüfung.",
    primaryPolicyOnly: "Der aktuelle Vertrag ist in diesem profile policy-only.",
    primaryLiveReady: "Der aktuelle Pfad ist in diesem profile live-ready.",
    openSourcePageAction: "Quellseite öffnen",
    reviewDetailAction: "Detail prüfen",
    openDetailAction: "Detail öffnen",
    hideProviderAction: "Nicht mehr anzeigen",
  },
  it: {
    providerTriageLabel: "Triage provider",
    nothingToTriageHeadline: "Ancora niente da valutare",
    actionableAfterVisibleDetail:
      "Questa sezione diventa utilizzabile dopo che almeno un provider è visibile in Settings.",
    noProviderCardsYetHeadline: "Ancora nessuna scheda provider",
    enableProviderComeBackDetail:
      "Attiva un provider in Settings, poi torna qui per triage provider in un clic.",
    actionableAfterFirstProviderDetail: (provider) =>
      `Attiva prima ${provider} in Settings > Quick Setup, poi questa sezione diventa utilizzabile.`,
    startFirstProviderComeBackDetail: (provider) =>
      `Inizia con ${provider}, poi torna qui per triage provider in un clic.`,
    needsAttentionLabel: "Richiede attenzione",
    featuredProvidersHeadline: "Provider in evidenza",
    needsAttentionDetail:
      "Il popup mostra fino a tre provider, dando priorità a quelli che richiedono ancora setup o revisione nel prodotto.",
    currentContractLabel: "Contratto attuale",
    policyOnlyProvidersHeadline: "Provider policy-only",
    policyOnlyProvidersDetail:
      "Nessun provider visibile espone una live in-browser path in questo profile, quindi queste schede restano focalizzate sul contratto invece che sulle azioni.",
    allClearLabel: "Tutto a posto",
    healthyProvidersHeadline: "Provider sani",
    healthyProvidersDetail:
      "Nessun provider visibile richiede setup o revisione, quindi questa sezione mantiene visibili i provider principali con percorso attuale e freshness.",
    statusNeedsAccess: "Richiede host access",
    statusNeedsSetup: "Richiede setup",
    statusOpenPage: "Apri pagina",
    statusSignIn: "Accedi",
    statusReloadPage: "Ricarica pagina",
    statusNeedsReview: "Richiede revisione",
    statusContractOnly: "Solo contratto",
    statusHealthy: "Sano",
    statusWarning: "Avviso",
    statusSyncIssue: "Problema di sync",
    primaryBlockedHostAccess: "Il percorso attuale è bloccato da host access.",
    primaryNeedsCredentials: "Il percorso attuale richiede ancora credentials salvate.",
    primaryNeedsLivePage: "Il percorso attuale richiede ancora una live page session.",
    primaryNeedsSignedInPage: "Il percorso attuale richiede di nuovo la pagina con accesso.",
    primaryPageUnreadable: "La page session attuale è aperta ma non può essere letta.",
    primaryNeedsReview: "Il setup in Settings è chiaro, ma questo provider richiede ancora revisione.",
    primaryPolicyOnly: "Il contratto attuale è policy-only in questo profile.",
    primaryLiveReady: "Il percorso attuale è live-ready in questo profile.",
    openSourcePageAction: "Apri pagina sorgente",
    reviewDetailAction: "Rivedi dettaglio",
    openDetailAction: "Apri dettaglio",
    hideProviderAction: "Smetti di mostrare",
  },
  ru: {
    providerTriageLabel: "Триаж provider",
    nothingToTriageHeadline: "Пока нечего проверять",
    actionableAfterVisibleDetail:
      "Этот раздел станет доступен, когда хотя бы один provider будет видим в Settings.",
    noProviderCardsYetHeadline: "Карточек provider пока нет",
    enableProviderComeBackDetail:
      "Включите один provider в Settings, затем вернитесь сюда для triage provider в один клик.",
    actionableAfterFirstProviderDetail: (provider) =>
      `Сначала включите ${provider} в Settings > Quick Setup, затем этот раздел станет доступен.`,
    startFirstProviderComeBackDetail: (provider) =>
      `Начните с ${provider}, затем вернитесь сюда для triage provider в один клик.`,
    needsAttentionLabel: "Требует внимания",
    featuredProvidersHeadline: "Избранные provider",
    needsAttentionDetail:
      "popup показывает до трех provider, отдавая приоритет тем, которым еще нужны setup или проверка в продукте.",
    currentContractLabel: "Текущий контракт",
    policyOnlyProvidersHeadline: "Provider policy-only",
    policyOnlyProvidersDetail:
      "Ни один видимый provider не предоставляет live in-browser path в этом profile, поэтому эти карточки сосредоточены на контракте, а не на действиях.",
    allClearLabel: "Все чисто",
    healthyProvidersHeadline: "Здоровые provider",
    healthyProvidersDetail:
      "Видимым provider сейчас не нужны setup или проверка, поэтому этот раздел оставляет верхние provider видимыми с текущим путем и freshness.",
    statusNeedsAccess: "Нужен host access",
    statusNeedsSetup: "Нужен setup",
    statusOpenPage: "Открыть страницу",
    statusSignIn: "Войти",
    statusReloadPage: "Перезагрузить страницу",
    statusNeedsReview: "Нужна проверка",
    statusContractOnly: "Только контракт",
    statusHealthy: "Здорово",
    statusWarning: "Предупреждение",
    statusSyncIssue: "Проблема sync",
    primaryBlockedHostAccess: "Текущий путь заблокирован host access.",
    primaryNeedsCredentials: "Текущему пути все еще нужны сохраненные credentials.",
    primaryNeedsLivePage: "Текущему пути все еще нужна live page session.",
    primaryNeedsSignedInPage: "Текущему пути снова нужна страница с выполненным входом.",
    primaryPageUnreadable: "Текущая page session открыта, но не может быть прочитана.",
    primaryNeedsReview: "Setup в Settings ясен, но этот provider все еще требует проверки.",
    primaryPolicyOnly: "Текущий контракт policy-only в этом profile.",
    primaryLiveReady: "Текущий путь live-ready в этом profile.",
    openSourcePageAction: "Открыть исходную страницу",
    reviewDetailAction: "Проверить детали",
    openDetailAction: "Открыть детали",
    hideProviderAction: "Не показывать",
  },
  ar: {
    providerTriageLabel: "فرز provider",
    nothingToTriageHeadline: "لا يوجد ما يحتاج فرزا بعد",
    actionableAfterVisibleDetail:
      "يصبح هذا القسم قابلا للاستخدام بعد ظهور provider واحد على الأقل في Settings.",
    noProviderCardsYetHeadline: "لا توجد بطاقات provider بعد",
    enableProviderComeBackDetail:
      "فعّل provider واحدا في Settings، ثم عد هنا لفرز provider بنقرة واحدة.",
    actionableAfterFirstProviderDetail: (provider) =>
      `فعّل ${provider} أولا في Settings > Quick Setup، ثم يصبح هذا القسم قابلا للاستخدام.`,
    startFirstProviderComeBackDetail: (provider) =>
      `ابدأ مع ${provider}، ثم عد هنا لفرز provider بنقرة واحدة.`,
    needsAttentionLabel: "يحتاج انتباها",
    featuredProvidersHeadline: "Providers بارزة",
    needsAttentionDetail:
      "يعرض popup حتى ثلاثة providers، مع أولوية لمن لا يزال يحتاج setup أو مراجعة داخل المنتج.",
    currentContractLabel: "العقد الحالي",
    policyOnlyProvidersHeadline: "Providers policy-only",
    policyOnlyProvidersDetail:
      "لا يعرض أي provider مرئي live in-browser path في هذا profile، لذلك تبقى هذه البطاقات مركزة على العقد بدلا من الإجراءات.",
    allClearLabel: "كل شيء واضح",
    healthyProvidersHeadline: "Providers سليمة",
    healthyProvidersDetail:
      "لا يحتاج أي provider مرئي حاليا إلى setup أو مراجعة، لذلك يبقي هذا القسم أهم providers مرئية مع المسار الحالي و freshness.",
    statusNeedsAccess: "يحتاج host access",
    statusNeedsSetup: "يحتاج setup",
    statusOpenPage: "فتح الصفحة",
    statusSignIn: "تسجيل الدخول",
    statusReloadPage: "إعادة تحميل الصفحة",
    statusNeedsReview: "يحتاج مراجعة",
    statusContractOnly: "عقد فقط",
    statusHealthy: "سليم",
    statusWarning: "تحذير",
    statusSyncIssue: "مشكلة sync",
    primaryBlockedHostAccess: "المسار الحالي محجوب بسبب host access.",
    primaryNeedsCredentials: "المسار الحالي ما زال يحتاج credentials محفوظة.",
    primaryNeedsLivePage: "المسار الحالي ما زال يحتاج live page session.",
    primaryNeedsSignedInPage: "المسار الحالي يحتاج الصفحة المسجلة الدخول مرة أخرى.",
    primaryPageUnreadable: "الـ page session الحالية مفتوحة لكن لا يمكن قراءتها.",
    primaryNeedsReview: "إعداد Settings واضح، لكن هذا provider ما زال يحتاج مراجعة.",
    primaryPolicyOnly: "العقد الحالي policy-only في هذا profile.",
    primaryLiveReady: "المسار الحالي live-ready في هذا profile.",
    openSourcePageAction: "فتح صفحة المصدر",
    reviewDetailAction: "مراجعة التفاصيل",
    openDetailAction: "فتح التفاصيل",
    hideProviderAction: "إيقاف العرض",
  },
  hi: {
    providerTriageLabel: "Provider triage",
    nothingToTriageHeadline: "अभी triage के लिए कुछ नहीं",
    actionableAfterVisibleDetail:
      "Settings में कम से कम एक provider visible होने के बाद यह section actionable होगा।",
    noProviderCardsYetHeadline: "अभी कोई provider card नहीं",
    enableProviderComeBackDetail:
      "Settings में एक provider enable करें, फिर one-click provider triage के लिए यहां लौटें।",
    actionableAfterFirstProviderDetail: (provider) =>
      `पहले Settings > Quick Setup में ${provider} enable करें, फिर यह section actionable होगा।`,
    startFirstProviderComeBackDetail: (provider) =>
      `${provider} से शुरू करें, फिर one-click provider triage के लिए यहां लौटें।`,
    needsAttentionLabel: "ध्यान चाहिए",
    featuredProvidersHeadline: "Featured providers",
    needsAttentionDetail:
      "popup तीन तक providers दिखाता है और उन providers को प्राथमिकता देता है जिन्हें अभी setup या in-product review चाहिए।",
    currentContractLabel: "मौजूदा contract",
    policyOnlyProvidersHeadline: "Policy-only providers",
    policyOnlyProvidersDetail:
      "इस profile में कोई visible provider live in-browser path expose नहीं करता, इसलिए ये cards action-focused के बजाय contract-focused रहते हैं।",
    allClearLabel: "सब ठीक",
    healthyProvidersHeadline: "Healthy providers",
    healthyProvidersDetail:
      "अभी कोई visible provider setup या review नहीं मांगता, इसलिए यह section current path और freshness context के लिए top providers दिखाए रखता है।",
    statusNeedsAccess: "Host access चाहिए",
    statusNeedsSetup: "Setup चाहिए",
    statusOpenPage: "Page खोलें",
    statusSignIn: "Sign in",
    statusReloadPage: "Page reload करें",
    statusNeedsReview: "Review चाहिए",
    statusContractOnly: "Contract-only",
    statusHealthy: "Healthy",
    statusWarning: "Warning",
    statusSyncIssue: "sync समस्या",
    primaryBlockedHostAccess: "Current path host access पर blocked है।",
    primaryNeedsCredentials: "Current path को अभी stored credentials चाहिए।",
    primaryNeedsLivePage: "Current path को अभी live page session चाहिए।",
    primaryNeedsSignedInPage: "Current path को signed-in page फिर चाहिए।",
    primaryPageUnreadable: "Current page session खुला है, लेकिन पढ़ा नहीं जा सकता।",
    primaryNeedsReview: "Settings setup साफ है, लेकिन इस provider को अभी review चाहिए।",
    primaryPolicyOnly: "इस profile में current contract policy-only है।",
    primaryLiveReady: "इस profile में current path live-ready है।",
    openSourcePageAction: "Source page खोलें",
    reviewDetailAction: "Detail review करें",
    openDetailAction: "Detail खोलें",
    hideProviderAction: "दिखाना बंद करें",
  },
  id: {
    providerTriageLabel: "Triage provider",
    nothingToTriageHeadline: "Belum ada yang perlu ditriage",
    actionableAfterVisibleDetail:
      "Bagian ini dapat digunakan setelah setidaknya satu provider terlihat di Settings.",
    noProviderCardsYetHeadline: "Belum ada kartu provider",
    enableProviderComeBackDetail:
      "Aktifkan satu provider di Settings, lalu kembali ke sini untuk triage provider sekali klik.",
    actionableAfterFirstProviderDetail: (provider) =>
      `Aktifkan ${provider} di Settings > Quick Setup terlebih dahulu, lalu bagian ini dapat digunakan.`,
    startFirstProviderComeBackDetail: (provider) =>
      `Mulai dengan ${provider}, lalu kembali ke sini untuk triage provider sekali klik.`,
    needsAttentionLabel: "Perlu perhatian",
    featuredProvidersHeadline: "Provider unggulan",
    needsAttentionDetail:
      "popup menampilkan hingga tiga provider, memprioritaskan yang masih perlu setup atau tinjauan di dalam produk.",
    currentContractLabel: "Kontrak saat ini",
    policyOnlyProvidersHeadline: "Provider policy-only",
    policyOnlyProvidersDetail:
      "Tidak ada provider terlihat yang mengekspos live in-browser path di profile ini, jadi kartu ini tetap berfokus pada kontrak, bukan aksi.",
    allClearLabel: "Semua jelas",
    healthyProvidersHeadline: "Provider sehat",
    healthyProvidersDetail:
      "Tidak ada provider terlihat yang perlu setup atau tinjauan, jadi bagian ini menjaga provider teratas tetap terlihat untuk jalur saat ini dan freshness.",
    statusNeedsAccess: "Perlu host access",
    statusNeedsSetup: "Perlu setup",
    statusOpenPage: "Buka halaman",
    statusSignIn: "Masuk",
    statusReloadPage: "Muat ulang halaman",
    statusNeedsReview: "Perlu tinjauan",
    statusContractOnly: "Hanya kontrak",
    statusHealthy: "Sehat",
    statusWarning: "Peringatan",
    statusSyncIssue: "Masalah sync",
    primaryBlockedHostAccess: "Jalur saat ini terblokir oleh host access.",
    primaryNeedsCredentials: "Jalur saat ini masih memerlukan credentials tersimpan.",
    primaryNeedsLivePage: "Jalur saat ini masih memerlukan live page session.",
    primaryNeedsSignedInPage: "Jalur saat ini memerlukan halaman yang sudah masuk lagi.",
    primaryPageUnreadable: "page session saat ini terbuka tetapi tidak dapat dibaca.",
    primaryNeedsReview: "Setup Settings sudah jelas, tetapi provider ini masih perlu tinjauan.",
    primaryPolicyOnly: "Kontrak saat ini policy-only di profile ini.",
    primaryLiveReady: "Jalur saat ini live-ready di profile ini.",
    openSourcePageAction: "Buka halaman sumber",
    reviewDetailAction: "Tinjau detail",
    openDetailAction: "Buka detail",
    hideProviderAction: "Berhenti tampilkan",
  },
};

function getPopupFirstRunCopy(
  locale: ResolvedAppLocale,
): PopupFirstRunCopyText | null {
  if (locale === "en" || locale === "zh-CN") {
    return null;
  }

  return POPUP_FIRST_RUN_COPY[locale];
}

function getPopupFeaturedCopy(
  locale: ResolvedAppLocale,
): PopupFeaturedCopyText | null {
  if (locale === "en" || locale === "zh-CN") {
    return null;
  }

  return POPUP_FEATURED_COPY[locale];
}

function formatLocalizedProviderCount(
  i18n: RuntimeI18n,
  copy: PopupFirstRunCopyText,
  count: number,
) {
  return copy.providerCount(i18n.formatNumber(count));
}

function buildLocalizedFirstRunPopupSections(
  i18n: RuntimeI18n,
  copy: PopupFirstRunCopyText,
) {
  return {
    snapshotStatus: {
      noProvidersLabel: copy.noProvidersLabel,
      noProvidersHeadline: copy.noProvidersHeadline,
      noProvidersDetail: copy.noProvidersDetail,
      syncIssueLabel: copy.syncIssueLabel,
      mixedStateLabel: copy.mixedStateLabel,
      alignedLabel: copy.alignedLabel,
      alignedSingleDetail: copy.alignedSingleDetail,
      alignedManyDetail: (count: number) =>
        copy.alignedManyDetail(formatLocalizedProviderCount(i18n, copy, count)),
      mixedDetail: (
        newestProviderLabel: string,
        newestSyncLabel: string,
        oldestProviderLabel: string,
        oldestSyncLabel: string,
      ) =>
        copy.mixedDetail(
          newestProviderLabel,
          newestSyncLabel,
          oldestProviderLabel,
          oldestSyncLabel,
        ),
    },
    guidance: {
      startHereLabel: copy.startHereLabel,
      nextStepLabel: copy.nextStepLabel,
      currentContractLabel: copy.currentContractLabel,
      enableProviderHeadline: copy.enableProviderHeadline,
      enableProviderDetail: copy.enableProviderDetail,
      startWithProviderHeadline: (providerLabel: string) =>
        copy.startWithProviderHeadline(providerLabel),
      startWithProviderDetail: (providerLabel: string) =>
        copy.startWithProviderDetail(providerLabel),
      openQuickSetupAction: copy.openQuickSetupAction,
      grantAccessSingleHeadline: (providerLabel: string) =>
        copy.grantAccessSingleHeadline(providerLabel),
      grantAccessManyHeadline: copy.grantAccessManyHeadline,
      singleMissingAccessDetail: (providerLabel: string, detail: string) =>
        detail || copy.singleMissingAccessDetail(providerLabel),
      multipleMissingAccessDetail: (count: number) =>
        copy.multipleMissingAccessDetail(
          formatLocalizedProviderCount(i18n, copy, count),
        ),
      addCredentialsSingleHeadline: (providerLabel: string) =>
        copy.addCredentialsSingleHeadline(providerLabel),
      addCredentialsManyHeadline: copy.addCredentialsManyHeadline,
      singleMissingCredentialDetail: (providerLabel: string, detail: string) =>
        detail || copy.singleMissingCredentialDetail(providerLabel),
      multipleMissingCredentialDetail: (count: number) =>
        copy.multipleMissingCredentialDetail(
          formatLocalizedProviderCount(i18n, copy, count),
        ),
      reviewProviderHeadline: (providerLabel: string) =>
        copy.reviewProviderHeadline(providerLabel),
      policyOnlyHeadline: copy.policyOnlyHeadline,
      policyOnlyDetail: copy.policyOnlyDetail,
      openDetail: copy.openDetail,
      reviewDetail: copy.reviewDetail,
    },
    setupCoverage: {
      label: copy.setupLabel,
      liveReadyItemLabel: copy.liveReadyItemLabel,
      hostAccessItemLabel: copy.hostAccessItemLabel,
      credentialsItemLabel: copy.credentialsItemLabel,
      policyOnlyItemLabel: copy.policyOnlyItemLabel,
      statusStartSetup: copy.statusStartSetup,
      statusNeedsSetup: copy.statusNeedsSetup,
      statusNeedsReview: copy.statusNeedsReview,
      statusContractOnly: copy.statusContractOnly,
      statusReady: copy.statusReady,
      noVisibleHeadline: copy.noVisibleHeadline,
      noVisibleDetail: copy.noVisibleDetail,
      noVisibleDetailForProvider: (providerLabel: string) =>
        copy.noVisibleDetailForProvider(providerLabel),
      visibleProvidersHeadline: (count: number) =>
        copy.visibleProvidersHeadline(
          formatLocalizedProviderCount(i18n, copy, count),
        ),
      needsSetupDetail: (sentence: string) =>
        copy.needsSetupDetail(sentence),
      needsReviewDetail: (count: number) =>
        copy.needsReviewDetail(formatLocalizedProviderCount(i18n, copy, count)),
      contractOnlyDetail: copy.contractOnlyDetail,
      mixedReadyPolicyDetail: (
        liveReadyCount: number,
        policyOnlyCount: number,
      ) =>
        copy.mixedReadyPolicyDetail(
          formatLocalizedProviderCount(i18n, copy, liveReadyCount),
          formatLocalizedProviderCount(i18n, copy, policyOnlyCount),
        ),
      readyDetail: copy.readyDetail,
      buildSetupBlockerSentence: (
        providersNeedingAccessCount: number,
        providersNeedingCredentialsCount: number,
      ) => {
        const parts: string[] = [];

        if (providersNeedingAccessCount > 0) {
          parts.push(
            copy.setupBlockerAccess(
              formatLocalizedProviderCount(
                i18n,
                copy,
                providersNeedingAccessCount,
              ),
            ),
          );
        }

        if (providersNeedingCredentialsCount > 0) {
          parts.push(
            copy.setupBlockerCredentials(
              formatLocalizedProviderCount(
                i18n,
                copy,
                providersNeedingCredentialsCount,
              ),
            ),
          );
        }

        return parts.join(" ");
      },
    },
    header: {
      noVisible: copy.headerNoVisible,
      noVisibleForProvider: (providerLabel: string) =>
        copy.headerNoVisibleForProvider(providerLabel),
      needsSetup: copy.headerNeedsSetup,
      contractOnly: copy.headerContractOnly,
      needsReview: copy.headerNeedsReview,
      ready: copy.headerReady,
    },
  } as const;
}

function buildLocalizedFeaturedPopupSections(copy: PopupFeaturedCopyText) {
  return {
    featuredSection: {
      providerTriageLabel: copy.providerTriageLabel,
      nothingToTriageHeadline: copy.nothingToTriageHeadline,
      actionableAfterVisibleDetail: copy.actionableAfterVisibleDetail,
      noProviderCardsYetHeadline: copy.noProviderCardsYetHeadline,
      enableProviderComeBackDetail: copy.enableProviderComeBackDetail,
      actionableAfterFirstProviderDetail: (providerLabel: string) =>
        copy.actionableAfterFirstProviderDetail(providerLabel),
      startFirstProviderComeBackDetail: (providerLabel: string) =>
        copy.startFirstProviderComeBackDetail(providerLabel),
      needsAttentionLabel: copy.needsAttentionLabel,
      featuredProvidersHeadline: copy.featuredProvidersHeadline,
      needsAttentionDetail: copy.needsAttentionDetail,
      currentContractLabel: copy.currentContractLabel,
      policyOnlyProvidersHeadline: copy.policyOnlyProvidersHeadline,
      policyOnlyProvidersDetail: copy.policyOnlyProvidersDetail,
      allClearLabel: copy.allClearLabel,
      healthyProvidersHeadline: copy.healthyProvidersHeadline,
      healthyProvidersDetail: copy.healthyProvidersDetail,
    },
    featuredCard: {
      statusNeedsAccess: copy.statusNeedsAccess,
      statusNeedsSetup: copy.statusNeedsSetup,
      statusOpenPage: copy.statusOpenPage,
      statusSignIn: copy.statusSignIn,
      statusReloadPage: copy.statusReloadPage,
      statusNeedsReview: copy.statusNeedsReview,
      statusContractOnly: copy.statusContractOnly,
      statusHealthy: copy.statusHealthy,
      statusWarning: copy.statusWarning,
      statusSyncIssue: copy.statusSyncIssue,
      primaryBlockedHostAccess: copy.primaryBlockedHostAccess,
      primaryNeedsCredentials: copy.primaryNeedsCredentials,
      primaryNeedsLivePage: copy.primaryNeedsLivePage,
      primaryNeedsSignedInPage: copy.primaryNeedsSignedInPage,
      primaryPageUnreadable: copy.primaryPageUnreadable,
      primaryNeedsReview: copy.primaryNeedsReview,
      primaryPolicyOnly: copy.primaryPolicyOnly,
      primaryLiveReady: copy.primaryLiveReady,
      openSourcePageAction: copy.openSourcePageAction,
      reviewDetailAction: copy.reviewDetailAction,
      openDetailAction: copy.openDetailAction,
      hideProviderAction: copy.hideProviderAction,
    },
  } as const;
}

export function buildPopupLocalizedCopy(i18n: RuntimeI18n) {
  if (i18n.resolvedLocale === "zh-CN") {
    return {
      snapshotStatus: {
        noProvidersLabel: "没有 provider",
        noProvidersHeadline: "没有可见 provider",
        noProvidersDetail:
          "这里还没有可共享的 popup 快照。先启用一个 provider，这里才会开始缓存状态。",
        syncIssueLabel: "同步异常",
        mixedStateLabel: "状态混合",
        alignedLabel: "已对齐",
        alignedSingleDetail:
          "当前可见 provider 共享同一个缓存快照窗口。",
        alignedManyDetail: (count: number) =>
          `全部 ${i18n.formatNumber(count)} 个可见 provider 共享同一个缓存快照窗口。`,
        mixedDetail: (
          newestProviderLabel: string,
          newestSyncLabel: string,
          oldestProviderLabel: string,
          oldestSyncLabel: string,
        ) =>
          `最新的可见快照：${newestProviderLabel}（${newestSyncLabel}）。最旧的可见快照：${oldestProviderLabel}（${oldestSyncLabel}）。`,
      },
      guidance: {
        startHereLabel: "从这里开始",
        nextStepLabel: "下一步",
        currentContractLabel: "当前合同",
        enableProviderHeadline: "先在设置里启用一个 provider",
        enableProviderDetail:
          "至少有一个 provider 可见之后，这个 popup 才真正有用。先去设置里启用，再回来做一键状态检查和分诊。",
        startWithProviderHeadline: (providerLabel: string) =>
          `先在快速设置里配置 ${providerLabel}`,
        startWithProviderDetail: (providerLabel: string) =>
          `打开 Settings > 快速设置，先启用 ${providerLabel}。之后按提示完成浏览器授权和使用页面，再回来做状态分诊。`,
        openQuickSetupAction: "打开快速设置",
        grantAccessSingleHeadline: (providerLabel: string) =>
          `为 ${providerLabel} 授权访问`,
        grantAccessManyHeadline: "先在设置里授予 host access",
        singleMissingAccessDetail: (
          providerLabel: string,
          detail: string,
        ) =>
          detail ||
          `${providerLabel} 仍然缺少可选 host access，所以 popup 还不能显示健康的 live 状态。`,
        multipleMissingAccessDetail: (count: number) =>
          `${formatProviderCount(i18n, count)} 仍然缺少可选 host access，popup 还不能收敛到一个健康且对齐的快照。`,
        addCredentialsSingleHeadline: (providerLabel: string) =>
          `为 ${providerLabel} 补充凭据`,
        addCredentialsManyHeadline: "先在设置里补充凭据",
        singleMissingCredentialDetail: (
          providerLabel: string,
          detail: string,
        ) =>
          detail ||
          `${providerLabel} 当前路径仍然缺少已存凭据，所以 live sync 还跑不起来。`,
        multipleMissingCredentialDetail: (count: number) =>
          `${formatProviderCount(i18n, count)} 仍然依赖缺失的已存凭据，它们的当前 live 路径还不能稳定运行。`,
        reviewProviderHeadline: (providerLabel: string) =>
          `复查 ${providerLabel}`,
        policyOnlyHeadline: "当前可见 provider 都是仅策略路径",
        policyOnlyDetail:
          "popup 仍然可以汇总共享缓存状态，但当前 profile 里这些可见 provider 都没有 live in-browser usage path。打开 settings 查看当前 provider 合同和 source controls。",
        openDetail: "打开详情",
        reviewDetail: "复查详情",
      },
      featuredSection: {
        providerTriageLabel: "Provider 分诊",
        nothingToTriageHeadline: "还没有可分诊内容",
        actionableAfterVisibleDetail:
          "至少有一个 provider 在设置里可见之后，这个区域才会变得可操作。",
        noProviderCardsYetHeadline: "还没有 provider 卡片",
        enableProviderComeBackDetail:
          "先在设置里启用一个 provider，再回来做一键 provider 分诊。",
        actionableAfterFirstProviderDetail: (providerLabel: string) =>
          `先在 Settings > 快速设置里启用 ${providerLabel}，之后这里才会变得可操作。`,
        startFirstProviderComeBackDetail: (providerLabel: string) =>
          `先从 ${providerLabel} 开始，再回来做一键 provider 分诊。`,
        needsAttentionLabel: "需要关注",
        featuredProvidersHeadline: "重点 provider",
        needsAttentionDetail:
          "popup 最多显示 3 个 provider，并优先展示仍需配置或仍需在产品内复查的 provider。",
        currentContractLabel: "当前合同",
        policyOnlyProvidersHeadline: "仅策略 provider",
        policyOnlyProvidersDetail:
          "当前 profile 里没有可见 provider 暴露 live in-browser path，所以这些卡片会更偏向合同说明，而不是动作引导。",
        allClearLabel: "状态正常",
        healthyProvidersHeadline: "健康 provider",
        healthyProvidersDetail:
          "当前没有可见 provider 需要配置或复查，所以这里主要保留顶部 provider 的当前路径和 freshness 上下文。",
      },
      featuredCard: {
        statusNeedsAccess: "需授权",
        statusNeedsSetup: "需配置",
        statusOpenPage: "打开页面",
        statusSignIn: "重新登录",
        statusReloadPage: "重新加载",
        statusNeedsReview: "需复查",
        statusContractOnly: "仅合同",
        statusHealthy: "健康",
        statusWarning: "告警",
        statusSyncIssue: "同步异常",
        primaryBlockedHostAccess: "当前路径被 host access 阻塞。",
        primaryNeedsCredentials: "当前路径仍然需要已存凭据。",
        primaryNeedsLivePage: "当前路径仍然需要活跃页面会话。",
        primaryNeedsSignedInPage: "当前路径需要重新拿到已登录页面。",
        primaryPageUnreadable: "当前页面会话已经打开，但扩展无法读取。",
        primaryNeedsReview: "设置已经就绪，但这个 provider 仍需复查。",
        primaryPolicyOnly: "当前合同在这个 profile 里是仅策略。",
        primaryLiveReady: "当前路径在这个 profile 里已经可以 live-ready。",
        openSourcePageAction: "打开来源页面",
        reviewDetailAction: "复查详情",
        openDetailAction: "打开详情",
        hideProviderAction: "暂不显示",
      },
      setupCoverage: {
        label: "配置覆盖面",
        liveReadyItemLabel: "可实时同步",
        hostAccessItemLabel: "Host access",
        credentialsItemLabel: "凭据",
        policyOnlyItemLabel: "仅策略",
        statusStartSetup: "开始配置",
        statusNeedsSetup: "需要配置",
        statusNeedsReview: "需要复查",
        statusContractOnly: "仅合同",
        statusReady: "已就绪",
        noVisibleHeadline: "还没有可见 provider 已配置",
        noVisibleDetail:
          "先在设置里启用一个 provider。之后这张卡会显示当前可见 provider 是 live-ready、被配置阻塞，还是仅策略。",
        noVisibleDetailForProvider: (providerLabel: string) =>
          `先在 Settings > 快速设置里启用 ${providerLabel}。之后这张卡会显示当前可见 provider 是 live-ready、被配置阻塞，还是仅策略。`,
        visibleProvidersHeadline: (count: number) =>
          `${formatProviderCount(i18n, count)} 可见`,
        needsSetupDetail: (sentence: string) =>
          `在把这个 popup 当成 ready 之前，先完成设置配置。${sentence}`,
        needsReviewDetail: (count: number) =>
          `设置配置已经清楚，但还有 ${formatProviderCount(i18n, count)} 需要在产品内继续复查。`,
        contractOnlyDetail:
          "可见 provider 已经配置完成，但它们当前的合同仍然是仅策略，而不是 live in-browser path。",
        mixedReadyPolicyDetail: (liveReadyCount: number, policyOnlyCount: number) =>
          `${formatProviderCount(i18n, liveReadyCount)} 已 live-ready。${formatProviderCount(i18n, policyOnlyCount)} 为仅策略。`,
        readyDetail:
          "这里已经看不到设置层面的阻塞。用下面的摘要确认 live-ready 和 policy-only 的覆盖情况。",
        buildSetupBlockerSentence: (
          providersNeedingAccessCount: number,
          providersNeedingCredentialsCount: number,
        ) => {
          const parts: string[] = [];

          if (providersNeedingAccessCount > 0) {
            parts.push(`${formatProviderCount(i18n, providersNeedingAccessCount)} 还需要 host access。`);
          }

          if (providersNeedingCredentialsCount > 0) {
            parts.push(`${formatProviderCount(i18n, providersNeedingCredentialsCount)} 还需要凭据。`);
          }

          return parts.join(" ");
        },
      },
      header: {
        noVisible:
          "先去设置开始。只要有一个 provider 可见，这个 popup 就会开始汇总 live readiness 和下一步。",
        noVisibleForProvider: (providerLabel: string) =>
          `先在 Settings > 快速设置里从 ${providerLabel} 开始。只要有一个 provider 可见，这个 popup 就会开始汇总 live readiness 和下一步。`,
        needsSetup:
          "用这个 popup 把配置阻塞和已经 ready 的 provider 分开看。",
        contractOnly:
          "这个 popup 当前展示的是合同上下文，而不是 live in-browser sync 路径。",
        needsReview:
          "设置已经清楚。用这个 popup 做快速 freshness 和 provider 分诊。",
        ready:
          "用这个 popup 快速查看 freshness 和 provider 分诊，不必重新打开完整 dashboard。",
      },
      actionSection: {
        quickActionsLabel: "快捷动作",
        otherRouteLabel: "其他入口",
        secondaryActionsLabel: "次级动作",
        detailDashboardFirst:
          "主要下一步已经在上面。若你想先看更完整的多 provider 视图，再去 dashboard。",
        detailSettingsFirst:
          "主要下一步已经在上面。若你需要 provider 开关、权限或已存凭据，再去 settings。",
        detailBroaderSurface:
          "主要下一步已经在上面。若你需要更大的工作面，再去 dashboard 或 settings。",
      },
      surfaceRoles: {
        label: "Surface roles",
        settingsOwnsSetupHeadline: "Settings 负责配置",
        settingsOwnsSetupNoVisibleDetail:
          "用 settings 启用 provider、授予 host access、补充凭据。至少有一个 provider 可见之后，dashboard 才真正开始有意义。",
        settingsOwnsFirstProviderSetupDetail: (providerLabel: string) =>
          `用 Settings > 快速设置启用 ${providerLabel}、授予 host access、打开使用页面。至少有一个 provider 可见之后，dashboard 才真正开始有意义。`,
        settingsOwnsSetupDetail:
          "把 settings 用在 provider 开关、host access 和已存凭据上。在配置清楚之前，popup 仍然只是快速分诊层。",
        settingsOwnsContractControlsHeadline: "Settings 负责合同控制",
        settingsOwnsContractControlsDetail:
          "用 settings 复查 provider 合同、source preference 和 page-source controls；dashboard 仍然保留更广的多 provider 上下文。",
        dashboardOwnsContractReviewHeadline: "Dashboard 负责合同复查",
        dashboardOwnsContractReviewDetail:
          "用 dashboard 看跨 provider 的更大合同上下文；settings 仍然负责 provider 控制和已存凭据。",
        providerDetailOwnsReviewHeadline: "Provider detail 负责复查",
        providerDetailOwnsReviewDetail:
          "当设置已经清楚后，用 provider detail 查看单个 provider 的当前路径和健康；dashboard 仍然是更广的多 provider 面。",
        popupQuickGlanceHeadline: "Popup 保持快速概览",
        popupQuickGlanceDetail:
          "dashboard 负责更广的多 provider 上下文，settings 负责控制面，只有在你需要看单个 provider 更深的合同和健康时才进入 provider detail。",
      },
      aria: {
        setupCoverage: "Popup 配置覆盖面",
        featuredProviders: "Popup 重点 provider",
      },
    } as const;
  }

  const englishCopy = {
    snapshotStatus: {
      noProvidersLabel: "No providers",
      noProvidersHeadline: "No visible providers",
      noProvidersDetail:
        "No shared popup snapshot exists yet. Enable one provider to start caching state here.",
      syncIssueLabel: "Sync issue",
      mixedStateLabel: "Mixed state",
      alignedLabel: "Aligned",
      alignedSingleDetail:
        "The visible provider shares the same cached snapshot window.",
      alignedManyDetail: (count: number) =>
        `All ${i18n.formatNumber(count)} visible providers share the same cached snapshot window.`,
      mixedDetail: (
        newestProviderLabel: string,
        newestSyncLabel: string,
        oldestProviderLabel: string,
        oldestSyncLabel: string,
      ) =>
        `Newest visible snapshot: ${newestProviderLabel} (${newestSyncLabel}). Oldest visible snapshot: ${oldestProviderLabel} (${oldestSyncLabel}).`,
    },
    guidance: {
      startHereLabel: "Start here",
      nextStepLabel: "Next step",
      currentContractLabel: "Current contract",
      enableProviderHeadline: "Enable a provider in settings",
      enableProviderDetail:
        "The popup only becomes useful after at least one provider is visible. Start in settings, then return here for one-click status and attention triage.",
      startWithProviderHeadline: (providerLabel: string) =>
        `Start with ${providerLabel} in Quick Setup`,
      startWithProviderDetail: (providerLabel: string) =>
        `Open Settings > Quick Setup and enable ${providerLabel}. Then follow the browser-access and usage-page steps before returning here for status triage.`,
      openQuickSetupAction: "Open Quick Setup",
      grantAccessSingleHeadline: (providerLabel: string) =>
        `Grant access for ${providerLabel}`,
      grantAccessManyHeadline: "Grant host access in settings",
      singleMissingAccessDetail: (_providerLabel: string, detail: string) =>
        detail,
      multipleMissingAccessDetail: (count: number) =>
        `${formatProviderCount(i18n, count)} still need optional host access before the popup can settle into one aligned healthy snapshot.`,
      addCredentialsSingleHeadline: (providerLabel: string) =>
        `Add credentials for ${providerLabel}`,
      addCredentialsManyHeadline: "Add credentials in settings",
      singleMissingCredentialDetail: (_providerLabel: string, detail: string) =>
        detail,
      multipleMissingCredentialDetail: (count: number) =>
        `${formatProviderCount(i18n, count)} still depend on missing stored credentials before their current live path can run cleanly.`,
      reviewProviderHeadline: (providerLabel: string) =>
        `Review ${providerLabel}`,
      policyOnlyHeadline: "Visible providers are policy-only",
      policyOnlyDetail:
        "The popup can still summarize shared cached state, but these visible providers do not expose one live in-browser usage path in this profile. Open settings to review the current provider contracts and source controls.",
      openDetail: "Open detail",
      reviewDetail: "Review detail",
    },
    featuredSection: {
      providerTriageLabel: "Provider triage",
      nothingToTriageHeadline: "Nothing to triage yet",
      actionableAfterVisibleDetail:
        "This section becomes actionable after at least one provider is visible in settings.",
      noProviderCardsYetHeadline: "No provider cards yet",
      enableProviderComeBackDetail:
        "Enable one provider in settings, then come back here for one-click provider triage.",
      actionableAfterFirstProviderDetail: (providerLabel: string) =>
        `Enable ${providerLabel} in Settings > Quick Setup first, then this section becomes actionable.`,
      startFirstProviderComeBackDetail: (providerLabel: string) =>
        `Start with ${providerLabel}, then come back here for one-click provider triage.`,
      needsAttentionLabel: "Needs attention",
      featuredProvidersHeadline: "Featured providers",
      needsAttentionDetail:
        "The popup shows up to three providers, preferring the ones that still need setup or in-product review.",
      currentContractLabel: "Current contract",
      policyOnlyProvidersHeadline: "Policy-only providers",
      policyOnlyProvidersDetail:
        "No visible provider exposes one live in-browser path in this profile, so these cards stay contract-focused instead of action-focused.",
      allClearLabel: "All clear",
      healthyProvidersHeadline: "Healthy providers",
      healthyProvidersDetail:
        "No visible provider currently needs setup or review, so this section keeps the top providers visible for current path and freshness at a glance.",
    },
      featuredCard: {
        statusNeedsAccess: "Needs access",
        statusNeedsSetup: "Needs setup",
      statusOpenPage: "Open page",
      statusSignIn: "Sign in",
      statusReloadPage: "Reload page",
      statusNeedsReview: "Needs review",
      statusContractOnly: "Contract-only",
      statusHealthy: "Healthy",
      statusWarning: "Warning",
      statusSyncIssue: "Sync issue",
      primaryBlockedHostAccess: "Current path is blocked on host access.",
      primaryNeedsCredentials: "Current path still needs stored credentials.",
      primaryNeedsLivePage: "Current path still needs a live page session.",
      primaryNeedsSignedInPage: "Current path needs the signed-in page again.",
      primaryPageUnreadable:
        "Current page session is open but cannot be read.",
        primaryNeedsReview: "Settings setup is clear, but this provider still needs review.",
        primaryPolicyOnly: "Current contract is policy-only in this profile.",
        primaryLiveReady: "Current path is live-ready in this profile.",
        openSourcePageAction: "Open source page",
        reviewDetailAction: "Review detail",
        openDetailAction: "Open detail",
        hideProviderAction: "Stop showing",
      },
    setupCoverage: {
      label: "Setup coverage",
      liveReadyItemLabel: "Live ready",
      hostAccessItemLabel: "Host access",
      credentialsItemLabel: "Credentials",
      policyOnlyItemLabel: "Policy-only",
      statusStartSetup: "Start setup",
      statusNeedsSetup: "Needs setup",
      statusNeedsReview: "Needs review",
      statusContractOnly: "Contract-only",
      statusReady: "Ready",
      noVisibleHeadline: "No visible providers configured",
      noVisibleDetail:
        "Enable one provider in settings first. Then this card will show whether visible providers are live-ready, blocked on setup, or policy-only.",
      noVisibleDetailForProvider: (providerLabel: string) =>
        `Enable ${providerLabel} in Settings > Quick Setup first. Then this card will show whether visible providers are live-ready, blocked on setup, or policy-only.`,
      visibleProvidersHeadline: (count: number) =>
        `${i18n.formatNumber(count)} visible ${count === 1 ? "provider" : "providers"}`,
      needsSetupDetail: (sentence: string) =>
        `Finish settings setup before treating this popup as ready. ${sentence}`,
      needsReviewDetail: (count: number) =>
        `Settings setup is clear, but ${formatProviderCount(i18n, count)} still need in-product review after setup.`,
      contractOnlyDetail:
        "Visible providers are configured, but their current contract is policy-only rather than one live in-browser path.",
      mixedReadyPolicyDetail: (liveReadyCount: number, policyOnlyCount: number) =>
        `${formatProviderCount(i18n, liveReadyCount)} are live-ready. ${formatProviderCount(i18n, policyOnlyCount)} are policy-only.`,
      readyDetail:
        "No settings setup blockers are visible here. Use the grid below to confirm live-ready versus policy-only coverage.",
      buildSetupBlockerSentence: (
        providersNeedingAccessCount: number,
        providersNeedingCredentialsCount: number,
      ) => {
        const parts: string[] = [];

        if (providersNeedingAccessCount > 0) {
          parts.push(`${formatProviderCount(i18n, providersNeedingAccessCount)} ${providersNeedingAccessCount === 1 ? "needs" : "need"} host access.`);
        }

        if (providersNeedingCredentialsCount > 0) {
          parts.push(`${formatProviderCount(i18n, providersNeedingCredentialsCount)} ${providersNeedingCredentialsCount === 1 ? "needs" : "need"} credentials.`);
        }

        return parts.join(" ");
      },
    },
    header: {
      noVisible:
        "Start in settings. Once one provider is visible, this popup will summarize live readiness and next steps.",
      noVisibleForProvider: (providerLabel: string) =>
        `Start in Settings > Quick Setup with ${providerLabel}. Once one provider is visible, this popup will summarize live readiness and next steps.`,
      needsSetup:
        "Use this popup to separate setup blockers from the providers that are already ready.",
      contractOnly:
        "This popup is showing current contract context rather than one live in-browser sync path.",
      needsReview:
        "Settings setup is clear. Use this popup for quick review and freshness triage.",
      ready:
        "Use this popup for quick freshness and provider triage without reopening the full dashboard.",
    },
    actionSection: {
      quickActionsLabel: "Quick Actions",
      otherRouteLabel: "Other route",
      secondaryActionsLabel: "Secondary actions",
      detailDashboardFirst:
        "The primary next step is above. Use dashboard if you want the broader multi-provider view first.",
      detailSettingsFirst:
        "The primary next step is above. Use settings when you need provider toggles, permissions, or stored credentials.",
      detailBroaderSurface:
        "The primary next step is above. Use dashboard or settings if you need a broader surface.",
    },
    surfaceRoles: {
      label: "Surface roles",
      settingsOwnsSetupHeadline: "Settings owns setup",
      settingsOwnsSetupNoVisibleDetail:
        "Use settings to enable providers, grant host access, and add credentials. The dashboard becomes useful after at least one provider is visible.",
      settingsOwnsFirstProviderSetupDetail: (providerLabel: string) =>
        `Use Settings > Quick Setup to enable ${providerLabel}, grant host access, and open the usage page. The dashboard becomes useful after at least one provider is visible.`,
      settingsOwnsSetupDetail:
        "Use settings for provider toggles, host access, and stored credentials. The popup stays a quick triage layer until setup is clear.",
      settingsOwnsContractControlsHeadline: "Settings owns contract controls",
      settingsOwnsContractControlsDetail:
        "Use settings to review provider contracts, source preference, and page-source controls. Dashboard stays the broader multi-provider context.",
      dashboardOwnsContractReviewHeadline: "Dashboard owns contract review",
      dashboardOwnsContractReviewDetail:
        "Use dashboard for broader contract context across visible providers. Settings still owns provider controls and stored credentials.",
      providerDetailOwnsReviewHeadline: "Provider detail owns review",
      providerDetailOwnsReviewDetail:
        "Use provider detail for one provider's current path and health after setup is already clear. Dashboard stays the broader multi-provider surface.",
      popupQuickGlanceHeadline: "Popup stays quick glance",
      popupQuickGlanceDetail:
        "Use dashboard for broader multi-provider context, settings for controls, and provider detail only when you need one provider's deeper contract and health.",
    },
    aria: {
      setupCoverage: "Popup setup coverage",
      featuredProviders: "Popup featured providers",
    },
  };
  const firstRunCopy = getPopupFirstRunCopy(i18n.resolvedLocale);

  if (!firstRunCopy) {
    return englishCopy;
  }

  const featuredCopy = getPopupFeaturedCopy(i18n.resolvedLocale);

  return {
    ...englishCopy,
    ...buildLocalizedFirstRunPopupSections(i18n, firstRunCopy),
    ...(featuredCopy ? buildLocalizedFeaturedPopupSections(featuredCopy) : {}),
  };
}
