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
  saveAndTest: string;
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
  saveAndTest: "Save and test",
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

const COPY_OVERRIDES: Partial<
  Record<ResolvedAppLocale, Partial<Sub2ApiSettingsLocalizedCopy>>
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
    baseUrl: "部署 Origin",
    connectionMode: "连接方式",
    connectionModeValue: "API 密钥 · GET /v1/usage",
    apiKey: "API 密钥",
    apiKeyPlaceholder: "输入账户范围的 API 密钥",
    apiKeyPreserved: "留空会保留已经保存的密钥。",
    save: "保存",
    saveAndTest: "保存并测试",
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
    baseUrl: "部署 Origin",
    connectionMode: "連線方式",
    apiKey: "API 金鑰",
    apiKeyPlaceholder: "輸入帳戶範圍的 API 金鑰",
    apiKeyPreserved: "留空會保留已儲存的金鑰。",
    save: "儲存",
    saveAndTest: "儲存並測試",
    disconnect: "中斷連線",
    remove: "刪除部署",
    retainCachedSummary: "中斷後保留上次非敏感摘要",
    trustTitle: "請核實部署營運方",
    lastSync: "上次成功同步",
    sourceScope: "來源資料範圍",
    scopeApiKey: "API 金鑰",
    scopeAccount: "帳戶",
    scopeUnknown: "未回傳",
    neverSynced: "從未同步",
    protocolTitle: "支援的用量協議",
    modulesEyebrow: "閘道模組",
    modulesTitle: "選擇並排列計量模組",
    shown: "顯示",
    hidden: "隱藏",
    moduleLabels: {
      summary: "用量摘要",
      trend: "用量趨勢",
      model_breakdown: "主要模型",
      limit_windows: "額度視窗",
    },
  },
};

export function buildSub2ApiSettingsLocalizedCopy(
  locale: ResolvedAppLocale,
): Sub2ApiSettingsLocalizedCopy {
  const override = COPY_OVERRIDES[locale];
  return {
    ...ENGLISH_COPY,
    ...override,
    moduleLabels: {
      ...ENGLISH_COPY.moduleLabels,
      ...override?.moduleLabels,
    },
  };
}
