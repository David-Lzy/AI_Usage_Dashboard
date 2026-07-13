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

export type CodexObservedUsageHistoryContract = {
  dailyTokenUsageBreakdown: CodexDailyTokenUsageResponse | null;
  dailyWorkspaceUsageCounts: CodexDailyWorkspaceUsageResponse | null;
};

type ObservedEntry = {
  url: string;
  ok: boolean | null;
  bodyText: string | null;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toFiniteNumber(value: unknown): number | null {
  const numberValue =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;
  return Number.isFinite(numberValue) ? numberValue : null;
}

function sanitizeTokenResponse(value: unknown): CodexDailyTokenUsageResponse | null {
  if (!isRecord(value) || !Array.isArray(value.data)) {
    return null;
  }

  const data = value.data.slice(-31).flatMap<CodexDailyTokenUsageEntry>((entry) => {
    if (
      !isRecord(entry) ||
      typeof entry.date !== "string" ||
      !isRecord(entry.product_surface_usage_values)
    ) {
      return [];
    }

    const productSurfaceUsageValues = Object.fromEntries(
      Object.entries(entry.product_surface_usage_values)
        .slice(0, 16)
        .flatMap(([id, rawValue]) => {
          const numberValue = toFiniteNumber(rawValue);
          return id.trim() && numberValue !== null
            ? [[id, numberValue] as const]
            : [];
        }),
    );

    return [{
      date: entry.date,
      product_surface_usage_values: productSurfaceUsageValues,
    }];
  });

  return data.length > 0
    ? {
        data,
        ...(typeof value.units === "string" ? { units: value.units } : {}),
      }
    : null;
}

function sanitizeWorkspaceResponse(
  value: unknown,
): CodexDailyWorkspaceUsageResponse | null {
  if (!isRecord(value) || !Array.isArray(value.data)) {
    return null;
  }

  const data = value.data.slice(-31).flatMap<CodexDailyWorkspaceUsageEntry>((entry) => {
    if (!isRecord(entry) || typeof entry.date !== "string") {
      return [];
    }

    const totalsSource = isRecord(entry.totals) ? entry.totals : {};
    const totalTurns = toFiniteNumber(totalsSource.turns);
    const clients = Array.isArray(entry.clients)
      ? entry.clients.slice(0, 16).flatMap<CodexDailyWorkspaceUsageClient>((client) => {
          if (!isRecord(client) || typeof client.client_id !== "string") {
            return [];
          }
          const turns = toFiniteNumber(client.turns);
          return turns === null ? [] : [{ client_id: client.client_id, turns }];
        })
      : [];
    const models = Array.isArray(entry.models)
      ? entry.models.slice(0, 16).flatMap<CodexDailyWorkspaceUsageModel>((model) => {
          if (!isRecord(model) || typeof model.model !== "string") {
            return [];
          }
          const turns = toFiniteNumber(model.turns);
          return turns === null ? [] : [{ model: model.model, turns }];
        })
      : [];

    return [{
      date: entry.date,
      totals: totalTurns === null ? {} : { turns: totalTurns },
      clients,
      models,
    }];
  });

  return data.length > 0 ? { data } : null;
}

function parseBody(entry: ObservedEntry): unknown {
  if (entry.ok !== true || !entry.bodyText) {
    return null;
  }

  try {
    return JSON.parse(entry.bodyText);
  } catch {
    return null;
  }
}

export function extractCodexObservedUsageHistoryContract(
  entries: readonly ObservedEntry[] | undefined,
): CodexObservedUsageHistoryContract | null {
  let dailyTokenUsageBreakdown: CodexDailyTokenUsageResponse | null = null;
  let dailyWorkspaceUsageCounts: CodexDailyWorkspaceUsageResponse | null = null;

  for (const entry of entries ?? []) {
    if (!dailyTokenUsageBreakdown && entry.url.includes(CODEX_DAILY_TOKEN_USAGE_PATH)) {
      dailyTokenUsageBreakdown = sanitizeTokenResponse(parseBody(entry));
    }
    if (!dailyWorkspaceUsageCounts && entry.url.includes(CODEX_DAILY_WORKSPACE_USAGE_PATH)) {
      dailyWorkspaceUsageCounts = sanitizeWorkspaceResponse(parseBody(entry));
    }
  }

  return dailyTokenUsageBreakdown || dailyWorkspaceUsageCounts
    ? { dailyTokenUsageBreakdown, dailyWorkspaceUsageCounts }
    : null;
}

export function isCodexUsageHistoryUrl(url: string): boolean {
  return CODEX_USAGE_HISTORY_PATHS.some((path) => url.includes(path));
}
