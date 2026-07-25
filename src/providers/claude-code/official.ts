import analyticsFixture from "../../../fixtures/claude/analytics-api.fixture.json";

export type ClaudeCodeAnalyticsActor =
  | {
      type: "user_actor";
      email_address: string;
    }
  | {
      type: "api_actor";
      api_key_name: string;
    };

export type ClaudeCodeAnalyticsModelUsage = {
  model: string;
  tokens: {
    input: number;
    output: number;
    cache_read: number;
    cache_creation: number;
  };
  estimated_cost: {
    currency: "USD";
    amount: number;
  };
};

export type ClaudeCodeAnalyticsRecord = {
  date: string;
  actor: ClaudeCodeAnalyticsActor;
  organization_id: string;
  customer_type: "api" | "subscription";
  terminal_type: string;
  num_sessions: number;
  lines_of_code: {
    added: number;
    removed: number;
  };
  commits_by_claude_code: number;
  pull_requests_by_claude_code: number;
  edit_tool: {
    accepted: number;
    rejected: number;
  };
  write_tool: {
    accepted: number;
    rejected: number;
  };
  notebook_edit_tool: {
    accepted: number;
    rejected: number;
  };
  models: ClaudeCodeAnalyticsModelUsage[];
};

export type ClaudeCodeAnalyticsResponse = {
  data: ClaudeCodeAnalyticsRecord[];
  has_more: boolean;
  next_page: string | null;
};

type ClaudeCodeAnalyticsClientOptions = {
  source?: "fixture" | "live";
  apiKey?: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  signal?: AbortSignal;
};

type GetUsageReportInput = {
  startingAt: string;
  limit?: number;
  page?: string;
};

export type ClaudeCodeAnalyticsClient = {
  getUsageReport: (
    input: GetUsageReportInput,
  ) => Promise<ClaudeCodeAnalyticsResponse>;
};

async function requestClaudeCodeAnalyticsPage(
  input: GetUsageReportInput,
  options: Required<Pick<ClaudeCodeAnalyticsClientOptions, "apiKey" | "baseUrl">> &
    Pick<ClaudeCodeAnalyticsClientOptions, "fetchImpl" | "signal">,
): Promise<ClaudeCodeAnalyticsResponse> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const params = new URLSearchParams({
    starting_at: input.startingAt,
  });

  if (typeof input.limit === "number") {
    params.set("limit", String(input.limit));
  }

  if (input.page) {
    params.set("page", input.page);
  }

  const response = await fetchImpl(
    `${options.baseUrl}/v1/organizations/usage_report/claude_code?${params.toString()}`,
    {
      headers: {
        "anthropic-version": "2023-06-01",
        "x-api-key": options.apiKey,
      },
      signal: options.signal,
    },
  );

  if (!response.ok) {
    throw new Error(`Claude Code Analytics API request failed: ${response.status}`);
  }

  return (await response.json()) as ClaudeCodeAnalyticsResponse;
}

export function createClaudeCodeAnalyticsClient(
  options: ClaudeCodeAnalyticsClientOptions = {},
): ClaudeCodeAnalyticsClient {
  const source = options.source ?? (options.apiKey ? "live" : "fixture");
  const baseUrl = options.baseUrl ?? "https://api.anthropic.com";

  return {
    async getUsageReport(input) {
      if (source === "fixture") {
        return analyticsFixture as ClaudeCodeAnalyticsResponse;
      }

      if (!options.apiKey) {
        throw new Error("Claude Admin API key is required for live requests.");
      }

      const records: ClaudeCodeAnalyticsRecord[] = [];
      let nextPage: string | undefined = input.page;
      let hasMore = true;

      while (hasMore) {
        const page = await requestClaudeCodeAnalyticsPage(
          {
            ...input,
            page: nextPage,
          },
          {
            apiKey: options.apiKey,
            baseUrl,
            fetchImpl: options.fetchImpl,
            signal: options.signal,
          },
        );

        records.push(...page.data);
        hasMore = page.has_more;
        nextPage = page.next_page ?? undefined;

        if (!page.has_more) {
          return {
            data: records,
            has_more: false,
            next_page: null,
          };
        }

        if (!page.next_page) {
          throw new Error(
            "Claude Code Analytics API returned has_more without a next_page cursor.",
          );
        }
      }

      return {
        data: records,
        has_more: false,
        next_page: null,
      };
    },
  };
}
