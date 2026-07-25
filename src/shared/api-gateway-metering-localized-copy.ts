import type { ResolvedAppLocale } from "./i18n";

export type ApiGatewayMeteringLocalizedCopy = {
  overview: string;
  trend: string;
  models: string;
  limits: string;
  balance: string;
  quotaRemaining: string;
  dailyRemaining: string;
  weeklyRemaining: string;
  monthlyRemaining: string;
  noFixedLimit: string;
  unavailable: string;
  actualSpend: string;
  requests: string;
  tokens: string;
  recorded: string;
  sevenDays: string;
  thirtyDays: string;
  apiKeyScope: string;
  accountScope: string;
  savedData: string;
  currentData: string;
  other: string;
  reset: string;
  remaining: string;
  expand: string;
  collapse: string;
  chartLegend: string;
};

const ENGLISH_COPY: ApiGatewayMeteringLocalizedCopy = {
  overview: "Usage summary",
  trend: "Usage trend",
  models: "Leading models",
  limits: "Limit windows",
  balance: "Available balance",
  quotaRemaining: "Quota remaining",
  dailyRemaining: "Daily allowance remaining",
  weeklyRemaining: "Weekly allowance remaining",
  monthlyRemaining: "Monthly allowance remaining",
  noFixedLimit: "No fixed limit returned",
  unavailable: "Not available",
  actualSpend: "Actual spend",
  requests: "Requests",
  tokens: "Tokens",
  recorded: "Recorded",
  sevenDays: "7 days",
  thirtyDays: "30 days",
  apiKeyScope: "API key scope",
  accountScope: "Account scope",
  savedData: "Saved data",
  currentData: "Current data",
  other: "Other",
  reset: "Resets",
  remaining: "remaining",
  expand: "Show metering details",
  collapse: "Hide metering details",
  chartLegend: "Usage legend",
};

const COPY_OVERRIDES: Partial<
  Record<ResolvedAppLocale, Partial<ApiGatewayMeteringLocalizedCopy>>
> = {
  "zh-CN": {
    overview: "用量摘要",
    trend: "用量趋势",
    models: "主要模型",
    limits: "额度窗口",
    balance: "可用余额",
    quotaRemaining: "剩余额度",
    dailyRemaining: "每日剩余额度",
    weeklyRemaining: "每周剩余额度",
    monthlyRemaining: "每月剩余额度",
    noFixedLimit: "来源未返回固定限额",
    unavailable: "暂无数据",
    actualSpend: "实际支出",
    requests: "请求",
    tokens: "Token",
    recorded: "已记录",
    sevenDays: "7 天",
    thirtyDays: "30 天",
    apiKeyScope: "API 密钥范围",
    accountScope: "账户范围",
    savedData: "已保存数据",
    currentData: "当前数据",
    other: "其他",
    reset: "重置于",
    remaining: "剩余",
    expand: "展开计量详情",
    collapse: "收起计量详情",
    chartLegend: "用量图例",
  },
  "zh-TW": {
    overview: "用量摘要",
    trend: "用量趨勢",
    models: "主要模型",
    limits: "額度視窗",
    balance: "可用餘額",
    quotaRemaining: "剩餘額度",
    actualSpend: "實際支出",
    requests: "請求",
    recorded: "已記錄",
    sevenDays: "7 天",
    thirtyDays: "30 天",
    apiKeyScope: "API 金鑰範圍",
    accountScope: "帳戶範圍",
    savedData: "已儲存資料",
    currentData: "目前資料",
    other: "其他",
  },
};

export function buildApiGatewayMeteringLocalizedCopy(
  locale: ResolvedAppLocale,
): ApiGatewayMeteringLocalizedCopy {
  return { ...ENGLISH_COPY, ...COPY_OVERRIDES[locale] };
}
