import { readFileSync } from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createDefaultProgressItemsBySurface } from "../../shared/display-preferences";
import { SAMPLE_APP_STATE } from "../../shared/constants";
import { DashboardPage } from "./DashboardPage";

const layoutPrimitivesCss = readFileSync(
  new URL("../theme/layout-primitives.css", import.meta.url),
  "utf8",
);

describe("DashboardPage", () => {
  it("renders compact dashboard summary inside the overview hero", () => {
    const html = renderToStaticMarkup(
      <DashboardPage
        localePreference="en"
        progressColorBands={SAMPLE_APP_STATE.settings.progressColorBands}
        progressDisplayStyle="line"
        progressItemsBySurface={createDefaultProgressItemsBySurface()}
        progressThicknessPx={SAMPLE_APP_STATE.settings.progressThicknessPx}
        progressSurface="sidebar"
        summaryItems={[
          { label: "Visible", value: "1", tone: "neutral" },
          { label: "Healthy", value: "1", tone: "neutral" },
          { label: "Needs Access", value: "0", tone: "warning" },
          { label: "Needs Attention", value: "0", tone: "error" },
        ]}
        providers={[]}
        onOpenProvider={() => {}}
        onOpenSettings={() => {}}
        onOpenQuickSetup={() => {}}
        onRefreshProvider={() => {}}
        onRefreshAll={() => {}}
      />,
    );

    expect(html).toContain('class="hero-card dashboard-hero-card"');
    expect(html).toContain('class="body-copy dashboard-hero-card__detail"');
    expect(html.indexOf("dashboard-hero-card__detail")).toBeGreaterThan(
      html.indexOf("dashboard-hero-card__body"),
    );
    expect(html).toContain(
      'class="summary-strip summary-strip--compact dashboard-hero-card__summary"',
    );
    expect(html).toContain(">AI coding quota overview<");
    expect(html).toContain(">Visible<");
    expect(html).not.toContain("Material 3");
    expect(layoutPrimitivesCss).toContain(".dashboard-hero-card {");
    expect(layoutPrimitivesCss).toContain(
      ".dashboard-hero-card__detail {",
    );
    expect(layoutPrimitivesCss).toContain("max-inline-size: none;");
    expect(layoutPrimitivesCss).toContain(".dashboard-hero-card__body {");
    expect(layoutPrimitivesCss).toContain(
      "grid-template-columns: minmax(0, 1fr) minmax(240px, 420px);",
    );
    expect(layoutPrimitivesCss).toContain(
      ".dashboard-hero-card__summary.summary-strip--compact {",
    );
    expect(layoutPrimitivesCss).toContain(
      "grid-template-columns: repeat(4, minmax(64px, 1fr));",
    );
  });

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
