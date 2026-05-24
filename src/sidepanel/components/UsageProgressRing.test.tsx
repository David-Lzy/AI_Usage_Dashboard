import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { UsageProgressRing } from "./UsageProgressRing";

describe("UsageProgressRing", () => {
  it("renders the soft ring with conic-gradient percent variables", () => {
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
    expect(html).toContain("--usage-progress-ring-percent:51%");
    expect(html).toContain("--usage-progress-ring-rotation:-90deg");
    expect(html).toContain("--usage-progress-ring-stroke-px:10px");
    expect(html).toContain("--usage-progress-ring-track-opacity:1");
    expect(html).not.toContain("<svg");
    expect(html).not.toContain("stroke-dasharray=");
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
    expect(html).toContain("--usage-progress-ring-arc:60");
    expect(html).toContain("--usage-progress-ring-track-arc:180.96");
    expect(html).toContain("--usage-progress-ring-fill-arc:92.29");
    expect(html).toContain("--usage-progress-ring-visible-fill-arc:92.29");
    expect(html).toContain("--usage-progress-ring-circumference:301.59");
    expect(html).toContain('stroke-dasharray="170.96 301.59"');
    expect(html).toContain('stroke-dasharray="82.29 301.59"');
    expect(html).toContain("--usage-progress-ring-rotation:146deg");
    expect(html).toContain("--usage-progress-ring-track-opacity:0.46");
  });

  it("keeps a readable non-full gauge gap when thick arcs are nearly full", () => {
    const html = renderToStaticMarkup(
      <UsageProgressRing
        isIndeterminate={false}
        label="Gauge"
        progressColor="#146C2E"
        progressThicknessPx={20}
        roundedPercent={99}
        tone="neutral"
        valueKind="remaining"
        valueLabel="99%"
        valueText="Gauge: 99% remaining"
        variant="circle-gauge"
      />,
    );

    expect(html).toContain("--usage-progress-ring-track-arc:180.96");
    expect(html).toContain("--usage-progress-ring-fill-arc:179.15");
    expect(html).toContain("--usage-progress-ring-visible-fill-arc:166.56");
    expect(html).toContain('stroke-dasharray="160.96 301.59"');
    expect(html).toContain('stroke-dasharray="146.56 301.59"');
  });

  it("still renders a full gauge arc at exactly 100 percent", () => {
    const html = renderToStaticMarkup(
      <UsageProgressRing
        isIndeterminate={false}
        label="Gauge"
        progressColor="#146C2E"
        progressThicknessPx={20}
        roundedPercent={100}
        tone="neutral"
        valueKind="remaining"
        valueLabel="100%"
        valueText="Gauge: 100% remaining"
        variant="circle-gauge"
      />,
    );

    expect(html).toContain("--usage-progress-ring-track-arc:180.96");
    expect(html).toContain("--usage-progress-ring-fill-arc:180.96");
    expect(html).toContain("--usage-progress-ring-visible-fill-arc:180.96");
    expect(html).toContain('stroke-dasharray="160.96 301.59"');
  });
});
