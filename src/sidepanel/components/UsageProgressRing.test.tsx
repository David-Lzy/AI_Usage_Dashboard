import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { UsageProgressRing } from "./UsageProgressRing";

describe("UsageProgressRing", () => {
  it("keeps the soft ring as a full circular arc", () => {
    const html = renderToStaticMarkup(
      <UsageProgressRing
        isIndeterminate={false}
        label="Soft"
        progressColor="#146C2E"
        progressThicknessPx={10}
        roundedPercent={51}
        tone="neutral"
        valueKind="remaining"
        valueLabel="51%"
        valueText="Soft: 51% remaining"
        variant="circle-soft"
      />,
    );

    expect(html).toContain("usage-progress-ring--circle-soft");
    expect(html).toContain("--usage-progress-ring-arc:100");
    expect(html).toContain("--usage-progress-ring-rotation:-90deg");
    expect(html).toContain("--usage-progress-ring-track-opacity:1");
  });

  it("renders the gauge ring as a shorter instrument arc", () => {
    const html = renderToStaticMarkup(
      <UsageProgressRing
        isIndeterminate={false}
        label="Gauge"
        progressColor="#146C2E"
        progressThicknessPx={10}
        roundedPercent={51}
        tone="neutral"
        valueKind="remaining"
        valueLabel="51%"
        valueText="Gauge: 51% remaining"
        variant="circle-gauge"
      />,
    );

    expect(html).toContain("usage-progress-ring--circle-gauge");
    expect(html).toContain("--usage-progress-ring-arc:68");
    expect(html).toContain("--usage-progress-ring-rotation:146deg");
    expect(html).toContain("--usage-progress-ring-track-opacity:0.46");
  });
});
