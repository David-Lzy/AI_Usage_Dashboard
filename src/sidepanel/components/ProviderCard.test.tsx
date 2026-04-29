import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createAdapterErrorDiagnostic } from "../../providers/diagnostics";
import type { AppState } from "../../providers/types";
import { SAMPLE_APP_STATE } from "../../shared/constants";
import { getProviderViewModel } from "../view-models";
import { ProviderCard } from "./ProviderCard";

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

function renderProviderCard(
  state: AppState,
  providerId: "codex" | "gemini",
  options: {
    onOpenSourcePage?: () => void;
  } = {},
) {
  const provider = getProviderViewModel(state, providerId);

  if (!provider) {
    throw new Error(`Missing provider ${providerId}`);
  }

  return renderToStaticMarkup(
    <ProviderCard
      localePreference="en"
      progressDisplayStyle="line"
      provider={provider}
      onOpen={() => undefined}
      onOpenSourcePage={options.onOpenSourcePage}
      onRefresh={() => undefined}
    />,
  );
}

describe("ProviderCard", () => {
  it("does not render empty percent progress when Codex page parsing fails", () => {
    const warningReason =
      "The matched Codex usage page no longer exposed a parseable remaining-percentage window.";
    const state = createState({
      providers: SAMPLE_APP_STATE.providers.map((provider) =>
        provider.providerId === "codex"
          ? {
              ...provider,
              planName: "Codex Personal Usage Page",
              quotaUnit: "percent",
              quotaWindow: "rolling",
              used: null,
              remaining: null,
              total: 100,
              resetAt: "Visible usage-window reset time",
              resetLabel:
                "Inspect the live Codex page and update the parser assumptions",
              syncSource: "page_parse",
              syncStatus: "error",
              tone: "error",
              warningReason,
              warningDiagnostic: createAdapterErrorDiagnostic({
                providerId: "codex",
                adapterErrorKind: "parse_failed",
                sourceKind: "session_page",
                failureCode: "route_drift",
                parserStage: "personal_usage_page",
                rawMessage: warningReason,
              }),
              usageWindows: undefined,
              usageBalances: undefined,
              usageSummary: null,
              lastSyncLabel: "Codex usage page parse failed",
            }
          : provider,
      ),
    });

    const html = renderProviderCard(state, "codex");

    expect(html).toContain("Usage window percent unavailable");
    expect(html).toContain("Inspect the live Codex page");
    expect(html).not.toContain('role="progressbar"');
    expect(html).not.toContain("rolling percent");
    expect(html).not.toContain("&gt;Unknown&lt;");
  });

  it("keeps documented non-percent totals visible as indeterminate progress", () => {
    const html = renderProviderCard(createState(), "gemini");

    expect(html).toContain('role="progressbar"');
    expect(html).toContain("daily requests");
    expect(html).toContain("Unknown");
  });

  it("renders a source-page recovery action for shipped session-page providers", () => {
    const html = renderProviderCard(createState(), "codex", {
      onOpenSourcePage: () => undefined,
    });

    expect(html).toContain('data-provider-card-open-source-page="true"');
    expect(html).toContain(">Source page<");
    expect(html).toContain('title="Open source page"');
  });

  it("omits the source-page recovery action for deferred session-page providers", () => {
    const html = renderProviderCard(createState(), "gemini", {
      onOpenSourcePage: () => undefined,
    });

    expect(html).not.toContain('data-provider-card-open-source-page="true"');
    expect(html).not.toContain(">Source page<");
  });
});
