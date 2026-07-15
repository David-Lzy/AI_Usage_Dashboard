import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { AppState, CursorUsageBilling } from "../../providers/types";
import { SAMPLE_APP_STATE } from "../../shared/constants";
import { getProviderViewModel } from "../view-models";
import { ProviderDetailPage } from "./ProviderDetailPage";

function createState(overrides?: Partial<AppState>): AppState {
  return {
    ...SAMPLE_APP_STATE,
    ...overrides,
    providers: overrides?.providers ?? SAMPLE_APP_STATE.providers,
    providerSettings:
      overrides?.providerSettings ?? SAMPLE_APP_STATE.providerSettings,
    settings: overrides?.settings ?? SAMPLE_APP_STATE.settings,
  };
}

const CURSOR_USAGE: CursorUsageBilling = {
  capturedAt: "2026-07-15T00:00:00.000Z",
  billingCapturedAt: "2026-07-15T00:00:00.000Z",
  historyCapturedAt: "2026-07-15T00:00:00.000Z",
  billingCycleStart: "2026-07-01T00:00:00.000Z",
  billingCycleEnd: "2026-08-01T00:00:00.000Z",
  membershipType: "pro",
  limitType: "plan",
  isUnlimited: false,
  currency: "USD",
  planName: "Pro",
  planIncludedAmountCents: 10000,
  planPriceLabel: "$20",
  planOwner: "individual",
  plan: {
    enabled: true,
    usedCents: 4200,
    limitCents: 10000,
    remainingCents: 5800,
    includedUsageCents: 4000,
    bonusUsageCents: 200,
    totalUsageCents: 4200,
    autoPercentUsed: 18,
    apiPercentUsed: 24,
    totalPercentUsed: 42,
  },
  onDemand: {
    enabled: true,
    usedCents: 350,
    limitCents: 2000,
    remainingCents: 1650,
  },
  noUsageBasedAllowed: false,
  history: null,
};

function renderProviderDetail(
  state: AppState,
  providerId: "codex-personal-page" | "cursor-personal-page" | "gemini-policy",
  options: {
    onOpenSourcePage?: () => void;
  } = {},
) {
  const provider = getProviderViewModel(state, providerId);

  if (!provider) {
    throw new Error(`Missing provider ${providerId}`);
  }

  return renderToStaticMarkup(
    <ProviderDetailPage
      localePreference="en"
      progressColorBands={state.settings.progressColorBands}
      progressDisplayStyle="line"
      progressItemsBySurface={state.settings.progressItemsBySurface}
      progressThicknessPx={state.settings.progressThicknessPx}
      progressSurface="sidebar"
      provider={provider}
      onBack={() => undefined}
      onOpenSourcePage={options.onOpenSourcePage}
      onRefresh={() => undefined}
    />,
  );
}

describe("ProviderDetailPage", () => {
  it("renders a source-page recovery action for shipped session-page providers", () => {
    const html = renderProviderDetail(createState(), "codex-personal-page", {
      onOpenSourcePage: () => undefined,
    });

    expect(html).toContain('data-provider-detail-open-source-page="true"');
    expect(html).toContain("Source-page recovery");
    expect(html).toContain(">Open source page<");
  });

  it("omits the source-page recovery action for deferred session-page providers", () => {
    const html = renderProviderDetail(createState(), "gemini-policy", {
      onOpenSourcePage: () => undefined,
    });

    expect(html).not.toContain('data-provider-detail-open-source-page="true"');
    expect(html).not.toContain("Source-page recovery");
  });

  it("renders Cursor personal spend facts without claiming request remaining", () => {
    const html = renderProviderDetail(createState(), "cursor-personal-page");

    expect(html).toContain("Visible usage context");
    expect(html).toContain('class="usage-facts usage-facts--regular"');
    expect(html).toContain("Total spend");
    expect(html).toContain("Included");
    expect(html).toContain("On-demand");
    expect(html).toContain("Plan-included spend shown by Cursor");
    expect(html).not.toContain("Usage unknown · requests");
    expect(html).not.toContain("Visible Cursor usage:");
  });

  it("renders the detailed Cursor billing modules and source actions", () => {
    const state = createState({
      providers: SAMPLE_APP_STATE.providers.map((provider) =>
        provider.providerId === "cursor-personal-page"
          ? { ...provider, cursorUsage: CURSOR_USAGE }
          : provider,
      ),
    });
    const html = renderProviderDetail(state, "cursor-personal-page");

    expect(html).toContain('data-cursor-usage-detail=""');
    expect(html).toContain("cursor-usage-summary--detail");
    expect(html).toContain("Plan usage value");
    expect(html).toContain("Actual charge: $3.50");
    expect(html).toContain('href="https://cursor.com/dashboard/usage"');
    expect(html).toContain('href="https://cursor.com/dashboard/spending"');
    expect(html).not.toContain("request ledger");
  });
});
