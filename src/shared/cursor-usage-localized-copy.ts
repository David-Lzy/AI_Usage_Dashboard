export type CursorUsageLocalizedCopy = {
  billingSummary: string;
  recentUsage: string;
  billingCycle: string;
  planUsage: string;
  firstPartyPool: string;
  apiPool: string;
  onDemand: string;
  includedValue: string;
  bonusValue: string;
  actualCharge: string;
  enabled: string;
  disabled: string;
  unavailable: string;
  stale: string;
  updated: string;
  sevenDays: string;
  thirtyDays: string;
  models: string;
  usageTypes: string;
  noHistory: string;
  expand: string;
  collapse: string;
};

const ENGLISH_COPY: CursorUsageLocalizedCopy = {
  billingSummary: "Usage & billing",
  recentUsage: "Recent usage",
  billingCycle: "Billing cycle",
  planUsage: "Plan usage value",
  firstPartyPool: "Included model pool",
  apiPool: "Third-party API pool",
  onDemand: "On-Demand",
  includedValue: "Included",
  bonusValue: "Free / bonus",
  actualCharge: "Actual charge",
  enabled: "Enabled",
  disabled: "Off",
  unavailable: "Not available",
  stale: "Saved data",
  updated: "Updated",
  sevenDays: "7 days",
  thirtyDays: "30 days",
  models: "Models",
  usageTypes: "Usage types",
  noHistory: "No aggregate usage history yet",
  expand: "Show Cursor usage details",
  collapse: "Hide Cursor usage details",
};

const CHINESE_COPY: CursorUsageLocalizedCopy = {
  billingSummary: "用量与计费",
  recentUsage: "近期用量",
  billingCycle: "计费周期",
  planUsage: "套餐内用量价值",
  firstPartyPool: "第一方模型池",
  apiPool: "第三方 API 池",
  onDemand: "按量付费",
  includedValue: "套餐内",
  bonusValue: "免费 / 赠送",
  actualCharge: "实际支出",
  enabled: "已启用",
  disabled: "未启用",
  unavailable: "暂无数据",
  stale: "已保存数据",
  updated: "更新于",
  sevenDays: "7 天",
  thirtyDays: "30 天",
  models: "主要模型",
  usageTypes: "用量类型",
  noHistory: "暂无聚合用量历史",
  expand: "展开 Cursor 用量详情",
  collapse: "收起 Cursor 用量详情",
};

export function buildCursorUsageLocalizedCopy(
  locale: string,
): CursorUsageLocalizedCopy {
  return locale.toLowerCase().startsWith("zh") ? CHINESE_COPY : ENGLISH_COPY;
}
