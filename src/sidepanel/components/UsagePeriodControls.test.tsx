import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createRuntimeI18n } from "../../shared/i18n";
import { UsagePeriodControls } from "./UsagePeriodControls";

describe("UsagePeriodControls", () => {
  it("renders a localized custom period selector with export date probes", () => {
    const html = renderToStaticMarkup(<UsagePeriodControls i18n={createRuntimeI18n("ar")} range={{ start: "2026-09-20", end: "2026-09-23" }} referenceTimezone={null} surface="export" onChange={() => undefined} />);
    expect(html).toContain('data-usage-period-controls=""');
    expect(html).toContain('data-usage-period-preset=""');
    expect(html).toContain('data-usage-export-date-input="start"');
    expect(html).toContain("مرجع الفترة: UTC");
  });
});
