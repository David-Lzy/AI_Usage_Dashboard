export type GeminiStaticPlanId =
  | "individual-free"
  | "google-ai-pro"
  | "google-ai-ultra"
  | "standard"
  | "enterprise";

export type GeminiStaticQuotaPolicy = {
  planId: GeminiStaticPlanId;
  planLabel: string;
  purchaseChannels: string[];
  requestsPerUserPerMinute: number;
  requestsPerUserPerDay: number;
  localCodebaseAwarenessTokens: number;
  codeCustomizationRepositories: number;
  notes: string[];
};

export type GeminiReleaseDecision = {
  mode: "policy_only";
  reviewedOn: string;
  rationale: string;
};

const BASE_POLICY = {
  localCodebaseAwarenessTokens: 1_000_000,
  codeCustomizationRepositories: 20_000,
};

const GEMINI_STATIC_POLICIES: Record<
  GeminiStaticPlanId,
  GeminiStaticQuotaPolicy
> = {
  "individual-free": {
    planId: "individual-free",
    planLabel: "Gemini Code Assist for individuals",
    purchaseChannels: ["N/A"],
    requestsPerUserPerMinute: 60,
    requestsPerUserPerDay: 1000,
    ...BASE_POLICY,
    notes: [
      "Free tier for eligible personal Google accounts.",
      "Gemini CLI and agent mode share the same documented quota.",
    ],
  },
  "google-ai-pro": {
    planId: "google-ai-pro",
    planLabel: "Gemini Code Assist via Google AI Pro",
    purchaseChannels: ["Google AI Pro"],
    requestsPerUserPerMinute: 120,
    requestsPerUserPerDay: 1500,
    ...BASE_POLICY,
    notes: [
      "Gemini CLI and agent mode share the same documented quota.",
      "Google recognizes the subscription automatically in supported IDEs.",
    ],
  },
  "google-ai-ultra": {
    planId: "google-ai-ultra",
    planLabel: "Gemini Code Assist via Google AI Ultra",
    purchaseChannels: ["Google AI Ultra"],
    requestsPerUserPerMinute: 120,
    requestsPerUserPerDay: 2000,
    ...BASE_POLICY,
    notes: [
      "Gemini CLI and agent mode share the same documented quota.",
      "Google recognizes the subscription automatically in supported IDEs.",
    ],
  },
  standard: {
    planId: "standard",
    planLabel: "Gemini Code Assist Standard",
    purchaseChannels: [
      "Google Developer Program premium",
      "Google Cloud console",
    ],
    requestsPerUserPerMinute: 120,
    requestsPerUserPerDay: 1500,
    ...BASE_POLICY,
    notes: [
      "Requires a Google Cloud project to manage API access, quota, and billing.",
      "Gemini CLI and agent mode share the same documented quota.",
    ],
  },
  enterprise: {
    planId: "enterprise",
    planLabel: "Gemini Code Assist Enterprise",
    purchaseChannels: ["Google Cloud console"],
    requestsPerUserPerMinute: 120,
    requestsPerUserPerDay: 2000,
    ...BASE_POLICY,
    notes: [
      "Requires a Google Cloud project to manage API access, quota, and billing.",
      "Gemini CLI and agent mode share the same documented quota.",
    ],
  },
};

export function getGeminiStaticQuotaPolicy(
  planId: GeminiStaticPlanId,
): GeminiStaticQuotaPolicy {
  return GEMINI_STATIC_POLICIES[planId];
}

export function getGeminiReleaseDecision(): GeminiReleaseDecision {
  return {
    mode: "policy_only",
    reviewedOn: "2026-04-22",
    rationale:
      "Official docs publish Gemini Code Assist quota policy and describe Cloud Quotas in the Google Cloud console. The 2026-04-22 spike also confirmed that the live `console.cloud.google.com/gemini-code-assist/metrics` route is project-scoped and composed inside Google Cloud console frames, not a defendable Gemini Code Assist per-user live usage surface.",
  };
}
