import { readFileSync } from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { TopBar } from "./TopBar";

const topAppBarCss = readFileSync(
  new URL("../theme/top-app-bar.css", import.meta.url),
  "utf8",
);

describe("TopBar", () => {
  it("renders optional theme and full-page actions ahead of the standard actions", () => {
    const html = renderToStaticMarkup(
      <TopBar
        title="AI Usage Dashboard"
        subtitle="Usage, credits, and sync health"
        themeActionLabel="Dark"
        themeActionTitle="Switch to dark mode"
        expandActionLabel="Tab"
        expandActionTitle="Open dashboard tab"
        secondaryActionLabel="Refresh All"
        primaryActionLabel="Settings"
        onThemeAction={() => {}}
        onExpandAction={() => {}}
        onSecondaryAction={() => {}}
        onPrimaryAction={() => {}}
      />,
    );

    expect(html).toContain('data-topbar-toggle-theme-mode="true"');
    expect(html).toContain('aria-label="Switch to dark mode"');
    expect(html).toContain('data-topbar-open-full-page="true"');
    expect(html).toContain('data-topbar-switch-surface="true"');
    expect(html).toContain('aria-label="Open dashboard tab"');
    expect(html).toContain(">Dark<");
    expect(html).toContain(">Tab<");
    expect(html).toContain(">Refresh All<");
    expect(html).toContain(">Settings<");
    expect(html.indexOf(">Dark<")).toBeLessThan(html.indexOf(">Tab<"));
    expect(html.indexOf(">Tab<")).toBeLessThan(html.indexOf(">Refresh All<"));
  });

  it("omits the full-page expand action when no handler is supplied", () => {
    const html = renderToStaticMarkup(
      <TopBar
        title="Settings"
        subtitle="Dashboard preferences and access"
        secondaryActionLabel="Back"
        primaryActionLabel="Save"
        onSecondaryAction={() => {}}
        onPrimaryAction={() => {}}
      />,
    );

    expect(html).not.toContain('data-topbar-open-full-page="true"');
    expect(html).not.toContain(">Tab<");
  });

  it("renders optional bottom content inside the same top bar surface", () => {
    const html = renderToStaticMarkup(
      <TopBar
        title="Settings"
        subtitle="Dashboard preferences and access"
        bottomContent={<nav aria-label="Sections">Section chips</nav>}
        onSecondaryAction={() => {}}
        onPrimaryAction={() => {}}
      />,
    );

    expect(html).toContain('class="top-app-bar__bottom"');
    expect(html).toContain('aria-label="Sections"');
    expect(html).toContain("Section chips");
  });

  it("keeps narrow action rows from wrapping action labels", () => {
    expect(topAppBarCss).toContain(".top-app-bar__actions .icon-button {");
    expect(topAppBarCss).toContain("white-space: nowrap;");
    expect(topAppBarCss).toContain("@media (max-width: 520px)");
    expect(topAppBarCss).toContain(
      "grid-template-columns: repeat(2, minmax(0, 1fr));",
    );
  });
});
