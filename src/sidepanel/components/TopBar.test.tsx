import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { TopBar } from "./TopBar";

describe("TopBar", () => {
  it("renders the optional full-page expand action ahead of the standard actions", () => {
    const html = renderToStaticMarkup(
      <TopBar
        title="AI Usage Dashboard"
        subtitle="Usage, credits, and sync health"
        expandActionLabel="Tab"
        expandActionTitle="Open dashboard tab"
        secondaryActionLabel="Refresh All"
        primaryActionLabel="Settings"
        onExpandAction={() => {}}
        onSecondaryAction={() => {}}
        onPrimaryAction={() => {}}
      />,
    );

    expect(html).toContain('data-topbar-open-full-page="true"');
    expect(html).toContain('aria-label="Open dashboard tab"');
    expect(html).toContain(">Tab<");
    expect(html).toContain(">Refresh All<");
    expect(html).toContain(">Settings<");
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
});
