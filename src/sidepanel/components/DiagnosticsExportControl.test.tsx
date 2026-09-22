import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../../shared/demo-state";
import { createRuntimeI18n } from "../../shared/i18n";
import { DiagnosticsExportControl } from "./DiagnosticsExportControl";

describe("DiagnosticsExportControl", () => {
  it("renders a compact preview trigger before a snapshot is created", () => {
    const html = renderToStaticMarkup(
      <DiagnosticsExportControl
        state={{
          providers: SAMPLE_APP_STATE.providers,
          providerSettings: SAMPLE_APP_STATE.providerSettings,
          providerAccounts: SAMPLE_APP_STATE.providerAccounts,
        }}
        i18n={createRuntimeI18n("en")}
      />,
    );

    expect(html).toContain('data-diagnostics-export=""');
    expect(html).toContain('data-diagnostics-action="preview"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("Sanitized diagnostic export");
    expect(html).not.toContain('data-diagnostics-preview=""');
    expect(html).not.toContain('data-diagnostics-action="download"');
    expect(html).not.toContain('data-diagnostics-action="close"');
  });
});
