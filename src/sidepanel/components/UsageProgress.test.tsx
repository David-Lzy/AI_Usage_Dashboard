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

  it("renders remaining-mode progress semantics when remaining percent is known", () => {
    const html = renderToStaticMarkup(
      <UsageProgress
        used={72}
        remaining={28}
        total={100}
        tone="error"
        label="Weekly usage window"
        valueKind="remaining"
        valueLabel="28% remaining"
        valueText="Weekly usage window: 28% remaining"
        detail="resets 2026-04-29 04:00"
      />,
    );

    expect(html).toContain("usage-progress--remaining");
    expect(html).toContain('aria-valuenow="28"');
    expect(html).toContain('aria-valuetext="Weekly usage window: 28% remaining"');
    expect(html).toContain("usage-progress__track--error");
    expect(html).toContain('style="width:28%"');
    expect(html).toContain(">28% remaining<");
    expect(html).toContain("usage-progress__meta-detail");
    expect(html).toContain("resets 2026-04-29 04:00");
  });

  it("renders circular progress semantics when requested", () => {
    const html = renderToStaticMarkup(
      <UsageProgress
        used={65}
        remaining={35}
        total={100}
        tone="warning"
        label="Weekly usage window"
        displayStyle="circle"
        valueKind="remaining"
        valueText="Weekly usage window: 35% remaining"
        detail="resets 2026-04-29 04:00"
      />,
    );

    expect(html).toContain("usage-progress--circle");
    expect(html).toContain("usage-progress__ring--warning");
    expect(html).toContain('aria-valuenow="35"');
    expect(html).toContain('aria-valuetext="Weekly usage window: 35% remaining"');
    expect(html).toContain("--usage-progress-percent:35%");
    expect(html).toContain(">35%<");
    expect(html).not.toContain("usage-progress__track");
    expect(html).toContain("usage-progress__detail");
    expect(html).toContain("resets 2026-04-29 04:00");
  });

  it("renders soft SVG ring progress semantics when requested", () => {
    const html = renderToStaticMarkup(
      <UsageProgress
        used={65}
        remaining={35}
        total={100}
        tone="warning"
        label="Weekly usage window"
        displayStyle="circle-soft"
        valueKind="remaining"
        valueText="Weekly usage window: 35% remaining"
      />,
    );

    expect(html).toContain("usage-progress--circle-soft");
    expect(html).toContain("usage-progress-ring--circle-soft");
    expect(html).toContain("usage-progress-ring--warning");
    expect(html).toContain('aria-valuenow="35"');
    expect(html).toContain('aria-valuetext="Weekly usage window: 35% remaining"');
    expect(html).toContain("--usage-progress-ring-arc:100");
    expect(html).toContain("--usage-progress-ring-offset:65");
    expect(html).toContain("<svg");
    expect(html).not.toContain("usage-progress__track");
  });

  it("renders gauge SVG ring progress semantics when requested", () => {
    const html = renderToStaticMarkup(
      <UsageProgress
        used={49}
        remaining={51}
        total={100}
        tone="neutral"
        label="Weekly usage window"
        displayStyle="circle-gauge"
        valueKind="remaining"
        valueText="Weekly usage window: 51% remaining"
      />,
    );

    expect(html).toContain("usage-progress--circle-gauge");
    expect(html).toContain("usage-progress-ring--circle-gauge");
    expect(html).toContain('aria-valuenow="51"');
    expect(html).toContain("--usage-progress-ring-arc:76");
    expect(html).toContain("--usage-progress-ring-offset:37.24");
  });

  it("keeps soft SVG ring indeterminate semantics accessible", () => {
    const html = renderToStaticMarkup(
      <UsageProgress
        used={null}
        total={100}
        tone="warning"
        label="Weekly usage window"
        displayStyle="circle-soft"
      />,
    );

    expect(html).toContain("usage-progress-ring--indeterminate");
    expect(html).toContain('aria-valuetext="Usage percentage unavailable"');
    expect(html).not.toContain("aria-valuenow=");
    expect(html).toContain(">Unknown<");
  });
});
