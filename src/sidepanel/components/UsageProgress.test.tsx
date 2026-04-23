import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { UsageProgress } from "./UsageProgress";

describe("UsageProgress", () => {
  it("renders determinate progress semantics when the percent is known", () => {
    const html = renderToStaticMarkup(
      <UsageProgress
        used={16}
        total={20}
        tone="warning"
        label="JetBrains usage ratio"
      />,
    );

    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuenow="80"');
    expect(html).toContain('aria-valuetext="80% used"');
    expect(html).toContain("usage-progress__track--warning");
    expect(html).not.toContain("usage-progress__track--indeterminate");
    expect(html).toContain('style="width:80%"');
  });

  it("renders indeterminate progress semantics when the percent is unknown", () => {
    const html = renderToStaticMarkup(
      <UsageProgress
        used={null}
        total={2000}
        tone="warning"
        label="Gemini usage ratio"
      />,
    );

    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuetext="Usage percentage unavailable"');
    expect(html).not.toContain("aria-valuenow=");
    expect(html).toContain("usage-progress__track--indeterminate");
    expect(html).toContain("usage-progress__fill--indeterminate");
    expect(html).toContain(">Unknown<");
    expect(html).not.toContain("22%");
  });
});
