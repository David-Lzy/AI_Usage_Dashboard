import dailyUsageFixture from "../../../fixtures/cursor/admin-api-daily-usage.fixture.json";
import membersFixture from "../../../fixtures/cursor/admin-api-members.fixture.json";
import spendFixture from "../../../fixtures/cursor/admin-api-spend.fixture.json";

export type CursorTeamMember = {
  name: string;
  email: string;
  role: "owner" | "member" | "free-owner";
};

export type CursorTeamMembersResponse = {
  teamMembers: CursorTeamMember[];
};

export type CursorTeamSpendMember = {
  spendCents: number;
  fastPremiumRequests: number;
  name: string;
  email: string;
  role: CursorTeamMember["role"];
  hardLimitOverrideDollars: number;
};

export type CursorTeamSpendResponse = {
  teamMemberSpend: CursorTeamSpendMember[];
  subscriptionCycleStart: number;
  totalMembers: number;
  totalPages: number;
};

export type CursorDailyUsageRow = {
  date: number;
  isActive: boolean;
  totalLinesAdded: number;
  totalLinesDeleted: number;
  acceptedLinesAdded: number;
  acceptedLinesDeleted: number;
  totalApplies: number;
  totalAccepts: number;
  totalRejects: number;
  totalTabsShown: number;
  totalTabsAccepted: number;
  composerRequests: number;
  chatRequests: number;
  agentRequests: number;
  cmdkUsages: number;
  subscriptionIncludedReqs: number;
  apiKeyReqs: number;
  usageBasedReqs: number;
  bugbotUsages: number;
  mostUsedModel: string;
  applyMostUsedExtension?: string;
  tabMostUsedExtension?: string;
  clientVersion?: string;
  email?: string;
};

export type CursorDailyUsageResponse = {
  data: CursorDailyUsageRow[];
  period: {
    startDate: number;
    endDate: number;
  };
};

export type CursorOfficialClient = {
  getTeamMembers: () => Promise<CursorTeamMembersResponse>;
  getTeamSpend: () => Promise<CursorTeamSpendResponse>;
  getDailyUsageData: (params: {
    startDate: number;
    endDate: number;
  }) => Promise<CursorDailyUsageResponse>;
};

type CursorOfficialClientOptions = {
  apiKey?: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  signal?: AbortSignal;
  source?: "fixture" | "live";
};

function cloneFixture<T>(value: T): T {
  return structuredClone(value);
}

function encodeBasicAuth(apiKey: string): string {
  return `Basic ${btoa(`${apiKey}:`)}`;
}

async function requestCursorJson<T>(
  route: string,
  init: RequestInit,
  options: Required<Pick<CursorOfficialClientOptions, "apiKey" | "baseUrl">> &
    Pick<CursorOfficialClientOptions, "fetchImpl" | "signal">,
): Promise<T> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const response = await fetchImpl(`${options.baseUrl}${route}`, {
    ...init,
    signal: options.signal,
    headers: {
      Authorization: encodeBasicAuth(options.apiKey),
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Cursor API request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export function createCursorOfficialClient(
  options: CursorOfficialClientOptions = {},
): CursorOfficialClient {
  const source = options.source ?? (options.apiKey ? "live" : "fixture");
  const baseUrl = options.baseUrl ?? "https://api.cursor.com";

  return {
    async getTeamMembers() {
      if (source === "fixture") {
        return cloneFixture(membersFixture as CursorTeamMembersResponse);
      }

      if (!options.apiKey) {
        throw new Error("Cursor Admin API key is required for live requests.");
      }

      return requestCursorJson<CursorTeamMembersResponse>(
        "/teams/members",
        {
          method: "GET",
        },
        {
          apiKey: options.apiKey,
          baseUrl,
          fetchImpl: options.fetchImpl,
          signal: options.signal,
        },
      );
    },

    async getTeamSpend() {
      if (source === "fixture") {
        return cloneFixture(spendFixture as CursorTeamSpendResponse);
      }

      if (!options.apiKey) {
        throw new Error("Cursor Admin API key is required for live requests.");
      }

      return requestCursorJson<CursorTeamSpendResponse>(
        "/teams/spend",
        {
          method: "POST",
          body: JSON.stringify({}),
        },
        {
          apiKey: options.apiKey,
          baseUrl,
          fetchImpl: options.fetchImpl,
          signal: options.signal,
        },
      );
    },

    async getDailyUsageData(params) {
      if (source === "fixture") {
        return cloneFixture(dailyUsageFixture as CursorDailyUsageResponse);
      }

      if (!options.apiKey) {
        throw new Error("Cursor Admin API key is required for live requests.");
      }

      return requestCursorJson<CursorDailyUsageResponse>(
        "/teams/daily-usage-data",
        {
          method: "POST",
          body: JSON.stringify(params),
        },
        {
          apiKey: options.apiKey,
          baseUrl,
          fetchImpl: options.fetchImpl,
          signal: options.signal,
        },
      );
    },
  };
}
