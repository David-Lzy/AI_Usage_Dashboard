import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { AppState } from "../../providers/types";
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

function renderProviderDetail(
  state: AppState,
  providerId: "codex" | "cursor" | "gemini",
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
      progressDisplayStyle="line"
      progressItemsBySurface={state.settings.progressItemsBySurface}
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
    const html = renderProviderDetail(createState(), "codex", {
      onOpenSourcePage: () => undefined,
    });

    expect(html).toContain('data-provider-detail-open-source-page="true"');
    expect(html).toContain("Source-page recovery");
    expect(html).toContain(">Open source page<");
  });

  it("omits the source-page recovery action for deferred session-page providers", () => {
    const html = renderProviderDetail(createState(), "gemini", {
      onOpenSourcePage: () => undefined,
    });

    expect(html).not.toContain('data-provider-detail-open-source-page="true"');
    expect(html).not.toContain("Source-page recovery");
  });

  it("renders Cursor personal spend facts without claiming request remaining", () => {
    const html = renderProviderDetail(createState(), "cursor");

    expect(html).toContain("Visible usage context");
    expect(html).toContain('class="usage-facts usage-facts--regular"');
    expect(html).toContain("Total spend");
    expect(html).toContain("Included");
    expect(html).toContain("On-demand");
    expect(html).toContain("Plan-included spend shown by Cursor");
    expect(html).not.toContain("Usage unknown · requests");
    expect(html).not.toContain("Visible Cursor usage:");
  });
});
