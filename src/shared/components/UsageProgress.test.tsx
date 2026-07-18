import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { UsageProgress } from "./UsageProgress";

describe("shared UsageProgress", () => {
  it("resolves gradient progress color appearance for progress surfaces", () => {
    const html = renderToStaticMarkup(
      <UsageProgress
        used={50}
        remaining={50}
        total={100}
        tone="neutral"
        label="Weekly usage window"
        valueKind="remaining"
        progressColorAppearance={{
          mode: "gradient",
          stops: [
            {
              id: "empty",
              positionPercent: 0,
              colorHex: "#000000",
            },
            {
              id: "full",
              positionPercent: 100,
              colorHex: "#FFFFFF",
            },
          ],
        }}
      />,
    );

    expect(html).toContain("--usage-progress-color:#808080");
  });

  it("keeps quota names and reset timestamps in separate label spans", () => {
    const html = renderToStaticMarkup(
      <UsageProgress
        used={10}
        remaining={90}
        total={100}
        tone="neutral"
        label="Weekly limit"
        labelSecondary="Resets Jul 20, 5:17 AM"
        displayStyle="circle-soft"
      />,
    );

    expect(html).toContain(
      '<span class="usage-progress__label-name">Weekly limit</span>',
    );
    expect(html).toContain(
      '<span class="usage-progress__label-reset">Resets Jul 20, 5:17 AM</span>',
    );
    expect(html).toContain(
      'aria-label="Weekly limit. Resets Jul 20, 5:17 AM"',
    );
  });
});
