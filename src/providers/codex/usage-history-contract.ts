export const CODEX_DAILY_TOKEN_USAGE_PATH =
  "/backend-api/wham/usage/daily-token-usage-breakdown";

export const CODEX_DAILY_WORKSPACE_USAGE_PATH =
  "/backend-api/wham/analytics/daily-workspace-usage-counts";

export const CODEX_USAGE_HISTORY_PATHS = [
  CODEX_DAILY_TOKEN_USAGE_PATH,
  CODEX_DAILY_WORKSPACE_USAGE_PATH,
] as const;

export type CodexDailyTokenUsageEntry = {
  date: string;
  product_surface_usage_values: Record<string, number | string | null | undefined>;
};

export type CodexDailyTokenUsageResponse = {
  data: CodexDailyTokenUsageEntry[];
  units?: string | null;
};

export type CodexDailyWorkspaceUsageTotals = {
  users?: number | string | null;
  threads?: number | string | null;
  turns?: number | string | null;
  credits?: number | string | null;
};

export type CodexDailyWorkspaceUsageClient =
  CodexDailyWorkspaceUsageTotals & {
    client_id: string;
  };

export type CodexDailyWorkspaceUsageModel = {
  model: string;
  turns?: number | string | null;
  credits?: number | string | null;
};

export type CodexDailyWorkspaceUsageEntry = {
  date: string;
  totals: CodexDailyWorkspaceUsageTotals;
  clients: CodexDailyWorkspaceUsageClient[];
  models: CodexDailyWorkspaceUsageModel[];
};

export type CodexDailyWorkspaceUsageResponse = {
  data: CodexDailyWorkspaceUsageEntry[];
};

export type CodexUsageHistoryContractFixture = {
  capturedAt: string;
  dailyTokenUsageBreakdown: CodexDailyTokenUsageResponse;
  dailyWorkspaceUsageCounts: CodexDailyWorkspaceUsageResponse;
};

export function isCodexUsageHistoryUrl(url: string): boolean {
  return CODEX_USAGE_HISTORY_PATHS.some((path) => url.includes(path));
}
