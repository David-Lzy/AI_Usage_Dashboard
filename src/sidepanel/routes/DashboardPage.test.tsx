import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createDefaultProgressItemsBySurface } from "../../shared/display-preferences";
import { SAMPLE_APP_STATE } from "../../shared/constants";
import { DashboardPage } from "./DashboardPage";

describe("DashboardPage", () => {
  it("renders a direct Quick Setup action in the empty provider state", () => {
    const html = renderToStaticMarkup(
      <DashboardPage
        localePreference="en"
        progressColorBands={SAMPLE_APP_STATE.settings.progressColorBands}
        progressDisplayStyle="line"
        progressItemsBySurface={createDefaultProgressItemsBySurface()}
        progressThicknessPx={SAMPLE_APP_STATE.settings.progressThicknessPx}
        progressSurface="sidebar"
        summaryItems={[]}
        providers={[]}
        onOpenProvider={() => {}}
        onOpenSettings={() => {}}
        onOpenQuickSetup={() => {}}
        onRefreshProvider={() => {}}
        onRefreshAll={() => {}}
      />,
    );

    expect(html).toContain(">Open Quick Setup<");
    expect(html).toContain("Start in Quick Setup to enable your first provider");
  });

  it("can render the full-page surface switch as a sidebar action", () => {
    const html = renderToStaticMarkup(
      <DashboardPage
        localePreference="en"
        progressColorBands={SAMPLE_APP_STATE.settings.progressColorBands}
        progressDisplayStyle="line"
        progressItemsBySurface={createDefaultProgressItemsBySurface()}
        progressThicknessPx={SAMPLE_APP_STATE.settings.progressThicknessPx}
        progressSurface="fullPage"
        summaryItems={[]}
        providers={[]}
        surfaceActionLabel="Sidebar"
        surfaceActionTitle="Open sidebar"
        onOpenFullPage={() => {}}
        onOpenProvider={() => {}}
        onOpenSettings={() => {}}
        onOpenQuickSetup={() => {}}
        onRefreshProvider={() => {}}
        onRefreshAll={() => {}}
      />,
    );

    expect(html).toContain('data-topbar-open-full-page="true"');
    expect(html).toContain('aria-label="Open sidebar"');
    expect(html).toContain(">Sidebar<");
  });
});
