import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createAdapterErrorDiagnostic } from "../../providers/diagnostics";
import type { AppState, ProviderId } from "../../providers/types";
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
  providerId: ProviderId,
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
      progressItemsBySurface={state.settings.progressItemsBySurface}
      progressSurface="sidebar"
      provider={provider}
      onOpen={() => undefined}
      onOpenSourcePage={options.onOpenSourcePage}
      onRefresh={() => undefined}
    />,
  );
}

describe("ProviderCard", () => {
  it("uses the Material provider-card hierarchy for summary, progress, chips, and actions", () => {
    const html = renderProviderCard(createState(), "jetbrains");

    expect(html).toContain('<header class="provider-card__header">');
    expect(html).toContain('class="provider-card__identity"');
    expect(html).toContain('class="provider-card__status"');
    expect(html).toContain('class="provider-card__summary"');
    expect(html).toContain('class="provider-card__usage-label"');
    expect(html).toContain('class="provider-card__progress-surface"');
    expect(html).toContain('class="provider-card__meta"');
    expect(html).toContain('<footer class="provider-card__footer">');
    expect(html).toContain(
      'class="text-button provider-card__action provider-card__action--primary"',
    );
  });

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

  it("does not render policy-only totals as fabricated progress", () => {
    const html = renderProviderCard(createState(), "gemini");

    expect(html).not.toContain('role="progressbar"');
    expect(html).toContain("Unknown / 2,000 requests");
    expect(html).toContain("Documented quota snapshot");
  });

  it("renders a source-page recovery action for shipped session-page providers", () => {
    const html = renderProviderCard(createState(), "codex", {
      onOpenSourcePage: () => undefined,
    });

    expect(html).toContain('data-provider-card-open-source-page="true"');
    expect(html).toContain(">Source page<");
    expect(html).toContain('title="Open source page"');
  });

  it("renders Cursor personal spend facts as structured usage context", () => {
    const html = renderProviderCard(createState(), "cursor");

    expect(html).toContain("Visible usage context");
    expect(html).toContain('class="usage-facts usage-facts--compact"');
    expect(html).toContain("Billing period");
    expect(html).toContain("Mar 23 - Apr 21");
    expect(html).toContain("Total spend");
    expect(html).toContain("$0");
    expect(html).not.toContain("Usage unknown · requests");
    expect(html).not.toContain("Visible Cursor usage:");
  });

  it("renders multiple Claude Team usage windows instead of collapsing back to one summary bar", () => {
    const state = createState({
      providers: SAMPLE_APP_STATE.providers.map((provider) =>
        provider.providerId === "claude-code"
          ? {
              ...provider,
              planName: "Claude Team Usage Page (Current session)",
              quotaUnit: "percent",
              quotaWindow: "rolling",
              used: 49,
              remaining: 51,
              total: 100,
              resetAt: "in 29 min",
              resetLabel: "Current session resets in 29 min",
              syncSource: "page_parse",
              syncStatus: "ok",
              tone: "neutral",
              warningReason: null,
              usageWindows: [
                {
                  label: "Current session",
                  normalizedLabel: "Current session",
                  kind: "unknown",
                  modelLabel: null,
                  quotaUnit: "percent",
                  used: 49,
                  remaining: 51,
                  total: 100,
                  resetAt: "in 29 min",
                  resetLabel: "Current session resets in 29 min",
                },
                {
                  label: "All models",
                  normalizedLabel: "All models weekly limit",
                  kind: "weekly",
                  modelLabel: null,
                  quotaUnit: "percent",
                  used: 15,
                  remaining: 85,
                  total: 100,
                  resetAt: "in 9 hr 49 min",
                  resetLabel: "All models weekly limit resets in 9 hr 49 min",
                },
                {
                  label: "Claude Design",
                  normalizedLabel: "Claude Design",
                  kind: "unknown",
                  modelLabel: null,
                  quotaUnit: "percent",
                  used: 0,
                  remaining: 100,
                  total: 100,
                  resetAt: null,
                  resetLabel: "You haven't used Claude Design yet",
                },
                {
                  label: "Daily included routine runs",
                  normalizedLabel: "Daily included routine runs",
                  kind: "unknown",
                  modelLabel: null,
                  quotaUnit: "percent",
                  used: 0,
                  remaining: 100,
                  total: 100,
                  resetAt: null,
                  resetLabel: "0 / 25",
                },
              ],
              usageFacts: [],
              usageSummary: null,
              lastSyncLabel: "Claude usage page synced just now",
            }
          : provider,
      ),
    });

    const html = renderProviderCard(state, "claude-code");

    expect(html).toContain('class="provider-progress-item-list');
    expect(html.match(/role="progressbar"/g)).toHaveLength(4);
    expect(html).toContain("Current session");
    expect(html).toContain("All models weekly limit");
    expect(html).toContain("Claude Design");
    expect(html).toContain("Daily included routine runs");
    expect(html).not.toContain("rolling percent");
  });

  it("honors hidden sidebar progress item preferences", () => {
    const state = createState({
      settings: {
        ...SAMPLE_APP_STATE.settings,
        progressItemsBySurface: {
          ...SAMPLE_APP_STATE.settings.progressItemsBySurface,
          sidebar: {
            jetbrains: [{ id: "primary", visible: false }],
          },
        },
      },
    });
    const html = renderProviderCard(state, "jetbrains");

    expect(html).not.toContain('role="progressbar"');
    expect(html).toContain("16 / 20 credits");
  });

  it("omits the source-page recovery action for deferred session-page providers", () => {
    const html = renderProviderCard(createState(), "gemini", {
      onOpenSourcePage: () => undefined,
    });

    expect(html).not.toContain('data-provider-card-open-source-page="true"');
    expect(html).not.toContain(">Source page<");
  });
});
