import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createDefaultProgressItemsBySurface } from "../../shared/display-preferences";
import { DashboardPage } from "./DashboardPage";

describe("DashboardPage", () => {
  it("renders a direct Quick Setup action in the empty provider state", () => {
    const html = renderToStaticMarkup(
      <DashboardPage
        localePreference="en"
        progressDisplayStyle="line"
        progressItemsBySurface={createDefaultProgressItemsBySurface()}
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
});
