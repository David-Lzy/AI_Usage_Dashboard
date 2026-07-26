import type { ResolvedAppLocale } from "./i18n";

export type Sub2ApiSettingsLocalizedCopy = {
  eyebrow: string;
  title: string;
  detail: string;
  deployment: string;
  addDeployment: string;
  cancel: string;
  displayLabel: string;
  baseUrl: string;
  connectionMode: string;
  connectionModeValue: string;
  apiKey: string;
  apiKeyPlaceholder: string;
  apiKeyPreserved: string;
  save: string;
  disconnect: string;
  remove: string;
  retainCachedSummary: string;
  trustTitle: string;
  trustDetail: string;
  insecureTitle: string;
  insecureDetail: string;
  acknowledgeInsecure: string;
  lastSync: string;
  sourceScope: string;
  scopeApiKey: string;
  scopeAccount: string;
  scopeUnknown: string;
  neverSynced: string;
  protocolTitle: string;
  protocolDetail: string;
  protocolExcluded: string;
  modulesEyebrow: string;
  modulesTitle: string;
  modulesDetail: string;
  shown: string;
  hidden: string;
  moduleLabels: Record<
    "summary" | "trend" | "model_breakdown" | "limit_windows",
    string
  >;
};

const ENGLISH_COPY: Sub2ApiSettingsLocalizedCopy = {
  eyebrow: "API gateway deployments",
  title: "Sub2API connections",
  detail:
    "Connect one or more independently operated Sub2API deployments. Each deployment keeps its credential, snapshot, and display choices isolated.",
  deployment: "Active deployment",
  addDeployment: "Add deployment",
  cancel: "Cancel",
  displayLabel: "Deployment label",
  baseUrl: "Deployment origin",
  connectionMode: "Connection mode",
  connectionModeValue: "API key · GET /v1/usage",
  apiKey: "API key",
  apiKeyPlaceholder: "Enter an account-scoped API key",
  apiKeyPreserved: "Leave blank to keep the saved key.",
  save: "Save",
  disconnect: "Disconnect",
  remove: "Remove deployment",
  retainCachedSummary: "Keep the last nonsecret summary after disconnecting",
  trustTitle: "Verify the deployment operator",
  trustDetail:
    "A Sub2API-compatible URL is not proof that Sub2API or this extension operates it. Only connect an origin whose operator and privacy policy you trust.",
  insecureTitle: "Unencrypted remote connection",
  insecureDetail:
    "This non-loopback HTTP origin receives the API key without transport encryption. HTTPS is strongly recommended.",
  acknowledgeInsecure: "I understand and still want to use this HTTP origin",
  lastSync: "Last successful sync",
  sourceScope: "Returned scope",
  scopeApiKey: "API key",
  scopeAccount: "Account",
  scopeUnknown: "Not reported",
  neverSynced: "Never",
  protocolTitle: "Supported usage contract",
  protocolDetail:
    "The extension requests GET /v1/usage with a 1-31 day range and timezone, then imports bounded account or API-key aggregates for spend, requests, tokens, models, trends, and returned limit windows.",
  protocolExcluded:
    "It does not import request bodies, prompts, responses, user identities, API-key lists, raw logs, or individual usage records.",
  modulesEyebrow: "Gateway modules",
  modulesTitle: "Choose and order metering modules",
  modulesDetail:
    "Visibility and order are stored for this deployment separately on Popup, Sidebar, and Full-page surfaces.",
  shown: "Shown",
  hidden: "Hidden",
  moduleLabels: {
    summary: "Usage summary",
    trend: "Usage trend",
    model_breakdown: "Leading models",
    limit_windows: "Limit windows",
  },
};

const COPY_OVERRIDES: Record<
  Exclude<ResolvedAppLocale, "en">,
  Sub2ApiSettingsLocalizedCopy
> = {
  "zh-CN": {
    eyebrow: "API 网关部署",
    title: "Sub2API 连接",
    detail:
      "连接一个或多个独立运营的 Sub2API 部署。每个部署的凭据、快照和显示偏好相互隔离。",
    deployment: "当前部署",
    addDeployment: "新增部署",
    cancel: "取消",
    displayLabel: "部署名称",
    baseUrl: "部署地址",
    connectionMode: "连接方式",
    connectionModeValue: "API 密钥 · GET /v1/usage",
    apiKey: "API 密钥",
    apiKeyPlaceholder: "输入账户范围的 API 密钥",
    apiKeyPreserved: "留空会保留已经保存的密钥。",
    save: "保存",
    disconnect: "断开连接",
    remove: "删除部署",
    retainCachedSummary: "断开后保留上次非敏感汇总",
    trustTitle: "请核实部署运营方",
    trustDetail:
      "兼容 Sub2API 的 URL 并不代表它由 Sub2API 或本扩展运营。请只连接你信任其运营方和隐私政策的 Origin。",
    insecureTitle: "未加密的远程连接",
    insecureDetail:
      "这个非 loopback HTTP Origin 会在没有传输加密的情况下接收 API 密钥，强烈建议改用 HTTPS。",
    acknowledgeInsecure: "我了解风险，仍要使用这个 HTTP Origin",
    lastSync: "上次成功同步",
    sourceScope: "来源数据范围",
    scopeApiKey: "API 密钥",
    scopeAccount: "账户",
    scopeUnknown: "未返回",
    neverSynced: "从未同步",
    protocolTitle: "支持的用量协议",
    protocolDetail:
      "扩展请求 GET /v1/usage，并携带 1-31 天范围和时区；只导入有界的账户或 API 密钥汇总，包括支出、请求、Token、模型、趋势与来源返回的额度窗口。",
    protocolExcluded:
      "不会导入请求正文、提示词、回复、用户身份、API 密钥列表、原始日志或逐条用量记录。",
    modulesEyebrow: "网关模块",
    modulesTitle: "选择并排列计量模块",
    modulesDetail:
      "Popup、侧栏与完整页面的可见性和顺序分别保存，并且只作用于当前部署。",
    shown: "显示",
    hidden: "隐藏",
    moduleLabels: {
      summary: "用量摘要",
      trend: "用量趋势",
      model_breakdown: "主要模型",
      limit_windows: "额度窗口",
    },
  },
  "zh-TW": {
    eyebrow: "API 閘道部署",
    title: "Sub2API 連線",
    detail:
      "連線一個或多個獨立營運的 Sub2API 部署。每個部署的憑證、快照與顯示偏好彼此隔離。",
    deployment: "目前部署",
    addDeployment: "新增部署",
    cancel: "取消",
    displayLabel: "部署名稱",
    baseUrl: "部署來源",
    connectionMode: "連線方式",
    connectionModeValue: "API 金鑰 · GET /v1/usage",
    apiKey: "API 金鑰",
    apiKeyPlaceholder: "輸入帳戶範圍的 API 金鑰",
    apiKeyPreserved: "留空會保留已儲存的金鑰。",
    save: "儲存",
    disconnect: "中斷連線",
    remove: "刪除部署",
    retainCachedSummary: "中斷後保留上次非敏感摘要",
    trustTitle: "請核實部署營運方",
    trustDetail:
      "相容 Sub2API 的 URL 不代表由 Sub2API 或本擴充功能營運。請只連線到你信任其營運方與隱私權政策的 Origin。",
    insecureTitle: "未加密的遠端連線",
    insecureDetail:
      "此非 loopback HTTP Origin 會在沒有傳輸加密的情況下接收 API 金鑰。強烈建議使用 HTTPS。",
    acknowledgeInsecure: "我了解風險，仍要使用此 HTTP Origin",
    lastSync: "上次成功同步",
    sourceScope: "來源資料範圍",
    scopeApiKey: "API 金鑰",
    scopeAccount: "帳戶",
    scopeUnknown: "未回傳",
    neverSynced: "從未同步",
    protocolTitle: "支援的用量協議",
    protocolDetail:
      "擴充功能會以 1 至 31 天範圍和時區請求 GET /v1/usage，只匯入有界的帳戶或 API 金鑰彙總，包括支出、請求、Token、模型、趨勢及來源回傳的額度視窗。",
    protocolExcluded:
      "不會匯入請求正文、提示詞、回覆、使用者身分、API 金鑰清單、原始日誌或逐筆用量記錄。",
    modulesEyebrow: "閘道模組",
    modulesTitle: "選擇並排列計量模組",
    modulesDetail:
      "Popup、側欄與完整頁面的可見性和順序會分別儲存，且只套用到目前部署。",
    shown: "顯示",
    hidden: "隱藏",
    moduleLabels: {
      summary: "用量摘要",
      trend: "用量趨勢",
      model_breakdown: "主要模型",
      limit_windows: "額度視窗",
    },
  },
  ja: {
    eyebrow: "API ゲートウェイのデプロイ",
    title: "Sub2API 接続",
    detail:
      "独立して運営される Sub2API デプロイを接続します。認証情報、スナップショット、表示設定はデプロイごとに分離されます。",
    deployment: "使用中のデプロイ",
    addDeployment: "デプロイを追加",
    cancel: "キャンセル",
    displayLabel: "デプロイ名",
    baseUrl: "デプロイ Origin",
    connectionMode: "接続方法",
    connectionModeValue: "API key · GET /v1/usage",
    apiKey: "API key",
    apiKeyPlaceholder: "アカウント範囲の API key を入力",
    apiKeyPreserved: "空欄のままにすると保存済み key を維持します。",
    save: "保存",
    disconnect: "切断",
    remove: "デプロイを削除",
    retainCachedSummary: "切断後も直近の非機密概要を保持する",
    trustTitle: "運営者を確認してください",
    trustDetail:
      "Sub2API 互換 URL であることは、Sub2API または本拡張機能による運営を意味しません。運営者とプライバシーポリシーを信頼できる Origin のみ接続してください。",
    insecureTitle: "暗号化されていないリモート接続",
    insecureDetail:
      "この非 loopback HTTP Origin には、転送暗号化なしで API key が送信されます。HTTPS を強く推奨します。",
    acknowledgeInsecure: "リスクを理解したうえで、この HTTP Origin を使用する",
    lastSync: "前回の正常同期",
    sourceScope: "返された範囲",
    scopeApiKey: "API key",
    scopeAccount: "アカウント",
    scopeUnknown: "未報告",
    neverSynced: "未同期",
    protocolTitle: "対応する使用量契約",
    protocolDetail:
      "1〜31 日の範囲とタイムゾーンを指定して GET /v1/usage を要求し、支出、リクエスト、Token、モデル、推移、返された上限ウィンドウの有界なアカウントまたは API key 集計のみを取り込みます。",
    protocolExcluded:
      "リクエスト本文、プロンプト、応答、ユーザー識別情報、API key 一覧、未加工ログ、個別使用記録は取り込みません。",
    modulesEyebrow: "ゲートウェイモジュール",
    modulesTitle: "計量モジュールの表示と順序",
    modulesDetail:
      "Popup、Sidebar、Full-page ごとの表示と順序を、このデプロイ専用に保存します。",
    shown: "表示",
    hidden: "非表示",
    moduleLabels: {
      summary: "使用概要",
      trend: "使用推移",
      model_breakdown: "主なモデル",
      limit_windows: "上限ウィンドウ",
    },
  },
  ko: {
    eyebrow: "API 게이트웨이 배포",
    title: "Sub2API 연결",
    detail:
      "독립적으로 운영되는 Sub2API 배포를 연결합니다. 자격 증명, 스냅샷 및 표시 설정은 배포별로 분리됩니다.",
    deployment: "활성 배포",
    addDeployment: "배포 추가",
    cancel: "취소",
    displayLabel: "배포 이름",
    baseUrl: "배포 Origin",
    connectionMode: "연결 방식",
    connectionModeValue: "API key · GET /v1/usage",
    apiKey: "API key",
    apiKeyPlaceholder: "계정 범위 API key 입력",
    apiKeyPreserved: "비워 두면 저장된 key가 유지됩니다.",
    save: "저장",
    disconnect: "연결 해제",
    remove: "배포 삭제",
    retainCachedSummary: "연결 해제 후 마지막 비밀 없는 요약 유지",
    trustTitle: "배포 운영자를 확인하세요",
    trustDetail:
      "Sub2API 호환 URL이라고 해서 Sub2API 또는 이 확장 프로그램이 운영하는 것은 아닙니다. 운영자와 개인정보 정책을 신뢰하는 Origin만 연결하세요.",
    insecureTitle: "암호화되지 않은 원격 연결",
    insecureDetail:
      "이 비 loopback HTTP Origin에는 전송 암호화 없이 API key가 전송됩니다. HTTPS를 강력히 권장합니다.",
    acknowledgeInsecure: "위험을 이해했으며 이 HTTP Origin을 사용합니다",
    lastSync: "마지막 정상 동기화",
    sourceScope: "반환된 범위",
    scopeApiKey: "API key",
    scopeAccount: "계정",
    scopeUnknown: "보고되지 않음",
    neverSynced: "동기화 안 됨",
    protocolTitle: "지원 사용량 계약",
    protocolDetail:
      "1~31일 범위와 시간대를 포함해 GET /v1/usage를 요청하고 지출, 요청, Token, 모델, 추이 및 반환된 한도 구간의 제한된 계정 또는 API key 집계만 가져옵니다.",
    protocolExcluded:
      "요청 본문, 프롬프트, 응답, 사용자 ID, API key 목록, 원시 로그 또는 개별 사용 기록은 가져오지 않습니다.",
    modulesEyebrow: "게이트웨이 모듈",
    modulesTitle: "계량 모듈 표시 및 순서",
    modulesDetail:
      "Popup, Sidebar 및 Full-page의 표시와 순서는 이 배포에 대해 각각 저장됩니다.",
    shown: "표시",
    hidden: "숨김",
    moduleLabels: {
      summary: "사용량 요약",
      trend: "사용량 추이",
      model_breakdown: "주요 모델",
      limit_windows: "한도 구간",
    },
  },
  "es-419": {
    eyebrow: "Implementaciones de API gateway",
    title: "Conexiones Sub2API",
    detail:
      "Conecta implementaciones Sub2API operadas de forma independiente. Cada implementación mantiene aisladas sus credenciales, instantáneas y preferencias de visualización.",
    deployment: "Implementación activa",
    addDeployment: "Agregar implementación",
    cancel: "Cancelar",
    displayLabel: "Nombre de implementación",
    baseUrl: "Origin de implementación",
    connectionMode: "Modo de conexión",
    connectionModeValue: "API key · GET /v1/usage",
    apiKey: "API key",
    apiKeyPlaceholder: "Ingresa una API key con alcance de cuenta",
    apiKeyPreserved: "Déjalo vacío para conservar la key guardada.",
    save: "Guardar",
    disconnect: "Desconectar",
    remove: "Eliminar implementación",
    retainCachedSummary: "Conservar el último resumen no secreto al desconectar",
    trustTitle: "Verifica al operador",
    trustDetail:
      "Una URL compatible con Sub2API no demuestra que Sub2API ni esta extensión la operen. Conecta solo un Origin cuyo operador y política de privacidad sean de confianza.",
    insecureTitle: "Conexión remota sin cifrar",
    insecureDetail:
      "Este Origin HTTP no loopback recibe la API key sin cifrado de transporte. Se recomienda usar HTTPS.",
    acknowledgeInsecure: "Comprendo el riesgo y deseo usar este Origin HTTP",
    lastSync: "Última sincronización correcta",
    sourceScope: "Alcance devuelto",
    scopeApiKey: "API key",
    scopeAccount: "Cuenta",
    scopeUnknown: "No informado",
    neverSynced: "Nunca",
    protocolTitle: "Contrato de uso compatible",
    protocolDetail:
      "La extensión solicita GET /v1/usage con un rango de 1 a 31 días y zona horaria, e importa solo agregados acotados de cuenta o API key para gasto, solicitudes, Tokens, modelos, tendencias y ventanas de límite devueltas.",
    protocolExcluded:
      "No importa cuerpos de solicitud, prompts, respuestas, identidades, listas de API keys, logs sin procesar ni registros individuales.",
    modulesEyebrow: "Módulos del gateway",
    modulesTitle: "Elige y ordena módulos de medición",
    modulesDetail:
      "La visibilidad y el orden se guardan por separado para Popup, Sidebar y Full-page en esta implementación.",
    shown: "Visible",
    hidden: "Oculto",
    moduleLabels: {
      summary: "Resumen de uso",
      trend: "Tendencia de uso",
      model_breakdown: "Modelos principales",
      limit_windows: "Ventanas de límite",
    },
  },
  "pt-BR": {
    eyebrow: "Implantações de API gateway",
    title: "Conexões Sub2API",
    detail:
      "Conecte implantações Sub2API operadas de forma independente. Cada implantação mantém credencial, snapshot e preferências de exibição isolados.",
    deployment: "Implantação ativa",
    addDeployment: "Adicionar implantação",
    cancel: "Cancelar",
    displayLabel: "Nome da implantação",
    baseUrl: "Origin da implantação",
    connectionMode: "Modo de conexão",
    connectionModeValue: "API key · GET /v1/usage",
    apiKey: "API key",
    apiKeyPlaceholder: "Informe uma API key com escopo de conta",
    apiKeyPreserved: "Deixe vazio para manter a key salva.",
    save: "Salvar",
    disconnect: "Desconectar",
    remove: "Remover implantação",
    retainCachedSummary: "Manter o último resumo sem segredo após desconectar",
    trustTitle: "Verifique o operador",
    trustDetail:
      "Uma URL compatível com Sub2API não prova que Sub2API ou esta extensão a operam. Conecte apenas um Origin cujo operador e política de privacidade sejam confiáveis.",
    insecureTitle: "Conexão remota sem criptografia",
    insecureDetail:
      "Este Origin HTTP não loopback recebe a API key sem criptografia de transporte. HTTPS é altamente recomendado.",
    acknowledgeInsecure: "Entendo o risco e quero usar este Origin HTTP",
    lastSync: "Última sincronização bem-sucedida",
    sourceScope: "Escopo retornado",
    scopeApiKey: "API key",
    scopeAccount: "Conta",
    scopeUnknown: "Não informado",
    neverSynced: "Nunca",
    protocolTitle: "Contrato de uso compatível",
    protocolDetail:
      "A extensão solicita GET /v1/usage com intervalo de 1 a 31 dias e fuso horário, importando apenas agregados limitados de conta ou API key para gastos, solicitações, Tokens, modelos, tendências e janelas de limite retornadas.",
    protocolExcluded:
      "Não importa corpos de solicitação, prompts, respostas, identidades, listas de API keys, logs brutos ou registros individuais.",
    modulesEyebrow: "Módulos do gateway",
    modulesTitle: "Escolha e ordene módulos de medição",
    modulesDetail:
      "Visibilidade e ordem são salvas separadamente para Popup, Sidebar e Full-page nesta implantação.",
    shown: "Exibido",
    hidden: "Oculto",
    moduleLabels: {
      summary: "Resumo de uso",
      trend: "Tendência de uso",
      model_breakdown: "Principais modelos",
      limit_windows: "Janelas de limite",
    },
  },
  fr: {
    eyebrow: "Déploiements de passerelle API",
    title: "Connexions Sub2API",
    detail:
      "Connectez des déploiements Sub2API exploités indépendamment. Les identifiants, instantanés et préférences restent isolés par déploiement.",
    deployment: "Déploiement actif",
    addDeployment: "Ajouter un déploiement",
    cancel: "Annuler",
    displayLabel: "Nom du déploiement",
    baseUrl: "Origin du déploiement",
    connectionMode: "Mode de connexion",
    connectionModeValue: "Clé API · GET /v1/usage",
    apiKey: "Clé API",
    apiKeyPlaceholder: "Saisissez une clé API de portée compte",
    apiKeyPreserved: "Laissez vide pour conserver la clé enregistrée.",
    save: "Enregistrer",
    disconnect: "Déconnecter",
    remove: "Supprimer le déploiement",
    retainCachedSummary: "Conserver le dernier résumé non secret après déconnexion",
    trustTitle: "Vérifiez l’opérateur",
    trustDetail:
      "Une URL compatible Sub2API ne prouve pas qu’elle est exploitée par Sub2API ou cette extension. Connectez uniquement un Origin dont vous approuvez l’opérateur et la politique de confidentialité.",
    insecureTitle: "Connexion distante non chiffrée",
    insecureDetail:
      "Cet Origin HTTP non loopback reçoit la clé API sans chiffrement du transport. HTTPS est fortement recommandé.",
    acknowledgeInsecure: "Je comprends le risque et souhaite utiliser cet Origin HTTP",
    lastSync: "Dernière synchronisation réussie",
    sourceScope: "Portée renvoyée",
    scopeApiKey: "Clé API",
    scopeAccount: "Compte",
    scopeUnknown: "Non indiqué",
    neverSynced: "Jamais",
    protocolTitle: "Contrat d’utilisation pris en charge",
    protocolDetail:
      "L’extension appelle GET /v1/usage avec une période de 1 à 31 jours et un fuseau horaire, puis importe uniquement des agrégats bornés de compte ou de clé API pour les dépenses, requêtes, Tokens, modèles, tendances et limites renvoyées.",
    protocolExcluded:
      "Elle n’importe pas les corps de requête, prompts, réponses, identités, listes de clés API, logs bruts ou enregistrements individuels.",
    modulesEyebrow: "Modules de passerelle",
    modulesTitle: "Choisir et ordonner les modules de mesure",
    modulesDetail:
      "La visibilité et l’ordre sont enregistrés séparément pour Popup, Sidebar et Full-page sur ce déploiement.",
    shown: "Affiché",
    hidden: "Masqué",
    moduleLabels: {
      summary: "Résumé d’utilisation",
      trend: "Tendance d’utilisation",
      model_breakdown: "Modèles principaux",
      limit_windows: "Fenêtres de limite",
    },
  },
  de: {
    eyebrow: "API-Gateway-Bereitstellungen",
    title: "Sub2API-Verbindungen",
    detail:
      "Verbinden Sie unabhängig betriebene Sub2API-Bereitstellungen. Zugangsdaten, Snapshots und Anzeigeeinstellungen bleiben je Bereitstellung getrennt.",
    deployment: "Aktive Bereitstellung",
    addDeployment: "Bereitstellung hinzufügen",
    cancel: "Abbrechen",
    displayLabel: "Name der Bereitstellung",
    baseUrl: "Origin der Bereitstellung",
    connectionMode: "Verbindungsmodus",
    connectionModeValue: "API-Key · GET /v1/usage",
    apiKey: "API-Key",
    apiKeyPlaceholder: "API-Key mit Kontobereich eingeben",
    apiKeyPreserved: "Leer lassen, um den gespeicherten Key zu behalten.",
    save: "Speichern",
    disconnect: "Trennen",
    remove: "Bereitstellung entfernen",
    retainCachedSummary: "Letzte nicht geheime Übersicht nach dem Trennen behalten",
    trustTitle: "Betreiber prüfen",
    trustDetail:
      "Eine Sub2API-kompatible URL beweist nicht, dass Sub2API oder diese Erweiterung sie betreibt. Verbinden Sie nur einen Origin, dessen Betreiber und Datenschutzrichtlinie Sie vertrauen.",
    insecureTitle: "Unverschlüsselte Remote-Verbindung",
    insecureDetail:
      "Dieser HTTP-Origin außerhalb von loopback erhält den API-Key ohne Transportverschlüsselung. HTTPS wird dringend empfohlen.",
    acknowledgeInsecure: "Ich verstehe das Risiko und möchte diesen HTTP-Origin verwenden",
    lastSync: "Letzte erfolgreiche Synchronisierung",
    sourceScope: "Gemeldeter Bereich",
    scopeApiKey: "API-Key",
    scopeAccount: "Konto",
    scopeUnknown: "Nicht gemeldet",
    neverSynced: "Nie",
    protocolTitle: "Unterstützter Nutzungsvertrag",
    protocolDetail:
      "Die Erweiterung ruft GET /v1/usage mit 1 bis 31 Tagen und Zeitzone ab und importiert nur begrenzte Konto- oder API-Key-Aggregate für Ausgaben, Anfragen, Tokens, Modelle, Trends und gemeldete Limitfenster.",
    protocolExcluded:
      "Anfrageinhalte, Prompts, Antworten, Identitäten, API-Key-Listen, Rohlogs und einzelne Nutzungsdatensätze werden nicht importiert.",
    modulesEyebrow: "Gateway-Module",
    modulesTitle: "Messmodule auswählen und ordnen",
    modulesDetail:
      "Sichtbarkeit und Reihenfolge werden für Popup, Sidebar und Full-page getrennt für diese Bereitstellung gespeichert.",
    shown: "Angezeigt",
    hidden: "Ausgeblendet",
    moduleLabels: {
      summary: "Nutzungsübersicht",
      trend: "Nutzungsverlauf",
      model_breakdown: "Führende Modelle",
      limit_windows: "Limitfenster",
    },
  },
  it: {
    eyebrow: "Distribuzioni API gateway",
    title: "Connessioni Sub2API",
    detail:
      "Connetti distribuzioni Sub2API gestite in modo indipendente. Credenziali, snapshot e preferenze restano isolati per ogni distribuzione.",
    deployment: "Distribuzione attiva",
    addDeployment: "Aggiungi distribuzione",
    cancel: "Annulla",
    displayLabel: "Nome distribuzione",
    baseUrl: "Origin della distribuzione",
    connectionMode: "Modalità di connessione",
    connectionModeValue: "API key · GET /v1/usage",
    apiKey: "API key",
    apiKeyPlaceholder: "Inserisci una API key con ambito account",
    apiKeyPreserved: "Lascia vuoto per mantenere la key salvata.",
    save: "Salva",
    disconnect: "Disconnetti",
    remove: "Rimuovi distribuzione",
    retainCachedSummary: "Conserva l’ultimo riepilogo non segreto dopo la disconnessione",
    trustTitle: "Verifica l’operatore",
    trustDetail:
      "Un URL compatibile con Sub2API non prova che sia gestito da Sub2API o da questa estensione. Connetti solo un Origin di cui ritieni affidabili operatore e informativa privacy.",
    insecureTitle: "Connessione remota non cifrata",
    insecureDetail:
      "Questo Origin HTTP non loopback riceve la API key senza cifratura del trasporto. HTTPS è fortemente consigliato.",
    acknowledgeInsecure: "Comprendo il rischio e voglio usare questo Origin HTTP",
    lastSync: "Ultima sincronizzazione riuscita",
    sourceScope: "Ambito restituito",
    scopeApiKey: "API key",
    scopeAccount: "Account",
    scopeUnknown: "Non indicato",
    neverSynced: "Mai",
    protocolTitle: "Contratto di utilizzo supportato",
    protocolDetail:
      "L’estensione richiede GET /v1/usage con intervallo da 1 a 31 giorni e fuso orario, importando solo aggregati limitati di account o API key per spesa, richieste, Token, modelli, tendenze e finestre limite restituite.",
    protocolExcluded:
      "Non importa corpi delle richieste, prompt, risposte, identità, elenchi di API key, log grezzi o record individuali.",
    modulesEyebrow: "Moduli gateway",
    modulesTitle: "Scegli e ordina i moduli di misurazione",
    modulesDetail:
      "Visibilità e ordine sono salvati separatamente per Popup, Sidebar e Full-page in questa distribuzione.",
    shown: "Visibile",
    hidden: "Nascosto",
    moduleLabels: {
      summary: "Riepilogo utilizzo",
      trend: "Andamento utilizzo",
      model_breakdown: "Modelli principali",
      limit_windows: "Finestre dei limiti",
    },
  },
  ru: {
    eyebrow: "Развёртывания API-шлюза",
    title: "Подключения Sub2API",
    detail:
      "Подключайте независимо управляемые развёртывания Sub2API. Учётные данные, снимки и настройки отображения изолированы для каждого развёртывания.",
    deployment: "Активное развёртывание",
    addDeployment: "Добавить развёртывание",
    cancel: "Отмена",
    displayLabel: "Название развёртывания",
    baseUrl: "Origin развёртывания",
    connectionMode: "Способ подключения",
    connectionModeValue: "API-ключ · GET /v1/usage",
    apiKey: "API-ключ",
    apiKeyPlaceholder: "Введите API-ключ уровня аккаунта",
    apiKeyPreserved: "Оставьте пустым, чтобы сохранить текущий ключ.",
    save: "Сохранить",
    disconnect: "Отключить",
    remove: "Удалить развёртывание",
    retainCachedSummary: "Сохранить последнюю несекретную сводку после отключения",
    trustTitle: "Проверьте оператора",
    trustDetail:
      "Совместимый с Sub2API URL не доказывает, что им управляет Sub2API или это расширение. Подключайте только Origin с доверенным оператором и политикой конфиденциальности.",
    insecureTitle: "Незашифрованное удалённое подключение",
    insecureDetail:
      "Этот HTTP Origin вне loopback получает API-ключ без транспортного шифрования. Настоятельно рекомендуется HTTPS.",
    acknowledgeInsecure: "Я понимаю риск и хочу использовать этот HTTP Origin",
    lastSync: "Последняя успешная синхронизация",
    sourceScope: "Полученная область",
    scopeApiKey: "API-ключ",
    scopeAccount: "Аккаунт",
    scopeUnknown: "Не указано",
    neverSynced: "Никогда",
    protocolTitle: "Поддерживаемый контракт использования",
    protocolDetail:
      "Расширение запрашивает GET /v1/usage за 1–31 день с часовым поясом и импортирует только ограниченные агрегаты аккаунта или API-ключа: расходы, запросы, токены, модели, динамику и полученные окна лимитов.",
    protocolExcluded:
      "Тела запросов, промпты, ответы, личности, списки API-ключей, необработанные журналы и отдельные записи использования не импортируются.",
    modulesEyebrow: "Модули шлюза",
    modulesTitle: "Выбор и порядок модулей учёта",
    modulesDetail:
      "Видимость и порядок сохраняются отдельно для Popup, Sidebar и Full-page этого развёртывания.",
    shown: "Показан",
    hidden: "Скрыт",
    moduleLabels: {
      summary: "Сводка использования",
      trend: "Динамика использования",
      model_breakdown: "Основные модели",
      limit_windows: "Окна лимитов",
    },
  },
  ar: {
    eyebrow: "عمليات نشر بوابة API",
    title: "اتصالات Sub2API",
    detail:
      "اربط عمليات نشر Sub2API التي يديرها مشغلون مستقلون. تبقى بيانات الاعتماد واللقطات وتفضيلات العرض معزولة لكل نشر.",
    deployment: "النشر النشط",
    addDeployment: "إضافة نشر",
    cancel: "إلغاء",
    displayLabel: "اسم النشر",
    baseUrl: "Origin النشر",
    connectionMode: "طريقة الاتصال",
    connectionModeValue: "مفتاح API · GET /v1/usage",
    apiKey: "مفتاح API",
    apiKeyPlaceholder: "أدخل مفتاح API بنطاق الحساب",
    apiKeyPreserved: "اتركه فارغًا للاحتفاظ بالمفتاح المحفوظ.",
    save: "حفظ",
    disconnect: "قطع الاتصال",
    remove: "إزالة النشر",
    retainCachedSummary: "الاحتفاظ بآخر ملخص غير سري بعد قطع الاتصال",
    trustTitle: "تحقق من مشغل النشر",
    trustDetail:
      "توافق عنوان URL مع Sub2API لا يثبت أن Sub2API أو هذه الإضافة يشغّله. اربط فقط Origin تثق بمشغله وسياسة الخصوصية لديه.",
    insecureTitle: "اتصال بعيد غير مشفر",
    insecureDetail:
      "يتلقى Origin HTTP غير loopback مفتاح API من دون تشفير للنقل. يوصى بشدة باستخدام HTTPS.",
    acknowledgeInsecure: "أفهم المخاطر وأريد استخدام Origin HTTP هذا",
    lastSync: "آخر مزامنة ناجحة",
    sourceScope: "النطاق المُعاد",
    scopeApiKey: "مفتاح API",
    scopeAccount: "الحساب",
    scopeUnknown: "غير مذكور",
    neverSynced: "أبدًا",
    protocolTitle: "عقد الاستخدام المدعوم",
    protocolDetail:
      "تطلب الإضافة GET /v1/usage لنطاق من يوم إلى 31 يومًا مع المنطقة الزمنية، وتستورد فقط تجميعات محدودة للحساب أو مفتاح API للإنفاق والطلبات والرموز والنماذج والاتجاهات ونوافذ الحدود المُعادة.",
    protocolExcluded:
      "لا تستورد محتوى الطلبات أو المطالبات أو الردود أو الهويات أو قوائم مفاتيح API أو السجلات الخام أو سجلات الاستخدام الفردية.",
    modulesEyebrow: "وحدات البوابة",
    modulesTitle: "اختيار وحدات القياس وترتيبها",
    modulesDetail:
      "يتم حفظ الظهور والترتيب بشكل منفصل لواجهات Popup وSidebar وFull-page لهذا النشر.",
    shown: "ظاهر",
    hidden: "مخفي",
    moduleLabels: {
      summary: "ملخص الاستخدام",
      trend: "اتجاه الاستخدام",
      model_breakdown: "النماذج الرئيسية",
      limit_windows: "نوافذ الحدود",
    },
  },
  hi: {
    eyebrow: "API gateway डिप्लॉयमेंट",
    title: "Sub2API कनेक्शन",
    detail:
      "स्वतंत्र रूप से संचालित Sub2API डिप्लॉयमेंट कनेक्ट करें। हर डिप्लॉयमेंट के क्रेडेंशियल, स्नैपशॉट और डिस्प्ले विकल्प अलग रहते हैं।",
    deployment: "सक्रिय डिप्लॉयमेंट",
    addDeployment: "डिप्लॉयमेंट जोड़ें",
    cancel: "रद्द करें",
    displayLabel: "डिप्लॉयमेंट नाम",
    baseUrl: "डिप्लॉयमेंट Origin",
    connectionMode: "कनेक्शन मोड",
    connectionModeValue: "API key · GET /v1/usage",
    apiKey: "API key",
    apiKeyPlaceholder: "खाता-स्कोप API key दर्ज करें",
    apiKeyPreserved: "सहेजी गई key रखने के लिए खाली छोड़ें।",
    save: "सहेजें",
    disconnect: "डिस्कनेक्ट",
    remove: "डिप्लॉयमेंट हटाएँ",
    retainCachedSummary: "डिस्कनेक्ट होने के बाद पिछला गैर-गोपनीय सारांश रखें",
    trustTitle: "डिप्लॉयमेंट संचालक की जाँच करें",
    trustDetail:
      "Sub2API-संगत URL यह सिद्ध नहीं करता कि उसे Sub2API या यह एक्सटेंशन चलाता है। केवल उसी Origin से जुड़ें जिसके संचालक और गोपनीयता नीति पर भरोसा हो।",
    insecureTitle: "बिना एन्क्रिप्शन का रिमोट कनेक्शन",
    insecureDetail:
      "यह गैर-loopback HTTP Origin बिना ट्रांसपोर्ट एन्क्रिप्शन के API key प्राप्त करता है। HTTPS की दृढ़ता से अनुशंसा की जाती है।",
    acknowledgeInsecure: "मैं जोखिम समझता हूँ और इस HTTP Origin का उपयोग करना चाहता हूँ",
    lastSync: "पिछला सफल सिंक",
    sourceScope: "लौटाया गया स्कोप",
    scopeApiKey: "API key",
    scopeAccount: "खाता",
    scopeUnknown: "रिपोर्ट नहीं किया गया",
    neverSynced: "कभी नहीं",
    protocolTitle: "समर्थित उपयोग अनुबंध",
    protocolDetail:
      "एक्सटेंशन 1–31 दिन और समय क्षेत्र के साथ GET /v1/usage का अनुरोध करता है और खर्च, अनुरोध, टोकन, मॉडल, रुझान तथा लौटाई गई सीमा विंडो के सीमित खाता या API key सारांश ही आयात करता है।",
    protocolExcluded:
      "यह अनुरोध सामग्री, prompts, प्रतिक्रियाएँ, पहचान, API key सूचियाँ, raw logs या अलग-अलग उपयोग रिकॉर्ड आयात नहीं करता।",
    modulesEyebrow: "Gateway मॉड्यूल",
    modulesTitle: "मीटरिंग मॉड्यूल चुनें और क्रम दें",
    modulesDetail:
      "Popup, Sidebar और Full-page के लिए दृश्यता और क्रम इस डिप्लॉयमेंट पर अलग-अलग सहेजे जाते हैं।",
    shown: "दिखाया गया",
    hidden: "छिपा हुआ",
    moduleLabels: {
      summary: "उपयोग सारांश",
      trend: "उपयोग रुझान",
      model_breakdown: "मुख्य मॉडल",
      limit_windows: "सीमा विंडो",
    },
  },
  id: {
    eyebrow: "Deployment API gateway",
    title: "Koneksi Sub2API",
    detail:
      "Hubungkan deployment Sub2API yang dioperasikan secara independen. Kredensial, snapshot, dan preferensi tampilan tetap terpisah untuk setiap deployment.",
    deployment: "Deployment aktif",
    addDeployment: "Tambah deployment",
    cancel: "Batal",
    displayLabel: "Nama deployment",
    baseUrl: "Origin deployment",
    connectionMode: "Mode koneksi",
    connectionModeValue: "API key · GET /v1/usage",
    apiKey: "API key",
    apiKeyPlaceholder: "Masukkan API key dengan cakupan akun",
    apiKeyPreserved: "Biarkan kosong untuk mempertahankan key tersimpan.",
    save: "Simpan",
    disconnect: "Putuskan",
    remove: "Hapus deployment",
    retainCachedSummary: "Simpan ringkasan nonrahasia terakhir setelah diputus",
    trustTitle: "Verifikasi operator deployment",
    trustDetail:
      "URL yang kompatibel dengan Sub2API tidak membuktikan bahwa Sub2API atau ekstensi ini mengoperasikannya. Hubungkan hanya Origin dengan operator dan kebijakan privasi yang Anda percaya.",
    insecureTitle: "Koneksi jarak jauh tanpa enkripsi",
    insecureDetail:
      "Origin HTTP non-loopback ini menerima API key tanpa enkripsi transport. HTTPS sangat disarankan.",
    acknowledgeInsecure: "Saya memahami risikonya dan tetap ingin memakai Origin HTTP ini",
    lastSync: "Sinkronisasi berhasil terakhir",
    sourceScope: "Cakupan yang dikembalikan",
    scopeApiKey: "API key",
    scopeAccount: "Akun",
    scopeUnknown: "Tidak dilaporkan",
    neverSynced: "Belum pernah",
    protocolTitle: "Kontrak penggunaan yang didukung",
    protocolDetail:
      "Ekstensi meminta GET /v1/usage dengan rentang 1–31 hari dan zona waktu, lalu hanya mengimpor agregat akun atau API key terbatas untuk pengeluaran, permintaan, Token, model, tren, dan jendela batas yang dikembalikan.",
    protocolExcluded:
      "Ekstensi tidak mengimpor isi permintaan, prompt, respons, identitas, daftar API key, log mentah, atau catatan penggunaan individual.",
    modulesEyebrow: "Modul gateway",
    modulesTitle: "Pilih dan urutkan modul pengukuran",
    modulesDetail:
      "Visibilitas dan urutan disimpan terpisah untuk Popup, Sidebar, dan Full-page pada deployment ini.",
    shown: "Ditampilkan",
    hidden: "Disembunyikan",
    moduleLabels: {
      summary: "Ringkasan penggunaan",
      trend: "Tren penggunaan",
      model_breakdown: "Model utama",
      limit_windows: "Jendela batas",
    },
  },
};

export function buildSub2ApiSettingsLocalizedCopy(
  locale: ResolvedAppLocale,
): Sub2ApiSettingsLocalizedCopy {
  return locale === "en" ? ENGLISH_COPY : COPY_OVERRIDES[locale];
}
