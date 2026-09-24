import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SUPPORTED_APP_LOCALES } from "../../shared/i18n";
import { CodexLocalConnectionSettings } from "./CodexLocalConnectionSettings";

describe("CodexLocalConnectionSettings", () => {
  it.each(SUPPORTED_APP_LOCALES)("shows the pairing steps in %s", (locale) => {
    const html = renderToStaticMarkup(
      <CodexLocalConnectionSettings locale={locale} />,
    );

    expect(html).toContain('data-codex-local-setup=""');
    expect(html).toContain('data-codex-local-setup-toggle=""');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('hidden=""');
    expect(html).toContain("node scripts/local-companion-bridge.mjs --codex-home");
    expect(html).toContain("ABSOLUTE_CODEX_HOME_PATH");
    expect(html).toContain('data-codex-local-status="disconnected"');
    expect(html).not.toContain("undefined");
  });

  it("explains that the one-time code comes from the running Companion", () => {
    const html = renderToStaticMarkup(
      <CodexLocalConnectionSettings locale="en" />,
    );

    expect(html).toContain("Keep the terminal open");
    expect(html).toContain("one-time code");
    expect(html).toContain("After a restart, pair again");
  });
});
