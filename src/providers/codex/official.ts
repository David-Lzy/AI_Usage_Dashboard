import analyticsFixture from "../../../fixtures/codex/analytics-api.fixture.json";

export type CodexAnalyticsUsageMetrics = {
  credits?: number | null;
  threads?: number | null;
  turns?: number | null;
};

export type CodexAnalyticsUsageRecord = {
  date?: string;
  start_time?: string;
  end_time?: string;
  client?: string | null;
  user_id?: string | null;
  credits?: number | null;
  threads?: number | null;
  turns?: number | null;
  metrics?: CodexAnalyticsUsageMetrics | null;
};

export type CodexAnalyticsResponse = {
  data: CodexAnalyticsUsageRecord[];
  has_more: boolean;
  next_cursor?: string | null;
  next_page?: string | null;
};

type CodexAnalyticsClientOptions = {
  source?: "fixture" | "live";
  apiKey?: string;
  workspaceId?: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  signal?: AbortSignal;
};

type GetCodexAnalyticsInput = {
  cursor?: string;
  limit?: number;
};

export type CodexAnalyticsClient = {
  getUsageReport: (
    input?: GetCodexAnalyticsInput,
  ) => Promise<CodexAnalyticsResponse>;
};

function cloneFixture<T>(value: T): T {
  return structuredClone(value);
}

async function requestCodexAnalyticsPage(
  input: GetCodexAnalyticsInput,
  options: Required<
    Pick<CodexAnalyticsClientOptions, "apiKey" | "workspaceId" | "baseUrl">
  > &
    Pick<CodexAnalyticsClientOptions, "fetchImpl" | "signal">,
): Promise<CodexAnalyticsResponse> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const params = new URLSearchParams();

  if (typeof input.limit === "number") {
    params.set("limit", String(input.limit));
  }

  if (input.cursor) {
    params.set("cursor", input.cursor);
  }

  const query = params.size > 0 ? `?${params.toString()}` : "";
  const response = await fetchImpl(
    `${options.baseUrl}/v1/analytics/codex/workspaces/${encodeURIComponent(options.workspaceId)}/usage${query}`,
    {
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
      },
      signal: options.signal,
    },
  );

  if (!response.ok) {
    throw new Error(`Codex Analytics API request failed: ${response.status}`);
  }

  return (await response.json()) as CodexAnalyticsResponse;
}

function getNextCursor(response: CodexAnalyticsResponse): string | undefined {
  const nextCursor =
    typeof response.next_cursor === "string"
      ? response.next_cursor
      : typeof response.next_page === "string"
        ? response.next_page
        : undefined;

  return nextCursor && nextCursor.length > 0 ? nextCursor : undefined;
}

export function createCodexAnalyticsClient(
  options: CodexAnalyticsClientOptions = {},
): CodexAnalyticsClient {
  const source =
    options.source ?? (options.apiKey && options.workspaceId ? "live" : "fixture");
  const baseUrl = options.baseUrl ?? "https://api.chatgpt.com";

  return {
    async getUsageReport(input = {}) {
      if (source === "fixture") {
        return cloneFixture(analyticsFixture as CodexAnalyticsResponse);
      }

      if (!options.apiKey) {
        throw new Error(
          "Codex analytics API key is required for live requests.",
        );
      }

      if (!options.workspaceId) {
        throw new Error("Codex workspace ID is required for live requests.");
      }

      const records: CodexAnalyticsUsageRecord[] = [];
      let nextCursor = input.cursor;
      let hasMore = true;

      while (hasMore) {
        const page = await requestCodexAnalyticsPage(
          {
            ...input,
            cursor: nextCursor,
          },
          {
            apiKey: options.apiKey,
            workspaceId: options.workspaceId,
            baseUrl,
            fetchImpl: options.fetchImpl,
            signal: options.signal,
          },
        );

        records.push(...page.data);
        hasMore = page.has_more;

        if (!page.has_more) {
          return {
            data: records,
            has_more: false,
            next_cursor: null,
          };
        }

        nextCursor = getNextCursor(page);

        if (!nextCursor) {
          throw new Error(
            "Codex Analytics API returned has_more without a next cursor.",
          );
        }
      }

      return {
        data: records,
        has_more: false,
        next_cursor: null,
      };
    },
  };
}
