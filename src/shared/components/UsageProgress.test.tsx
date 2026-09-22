import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createRuntimeI18n } from "../i18n";
import { UsageProgress } from "./UsageProgress";

describe("shared UsageProgress", () => {
  it.each([Number.NaN, Number.POSITIVE_INFINITY])("treats non-finite quota values as unknown (%s)", (used) => {
    const html = renderToStaticMarkup(<UsageProgress used={used} total={100} tone="neutral" label="Quota" />);
    expect(html).toContain("Unknown");
    expect(html).not.toContain("aria-valuenow=");
  });
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

  it("uses localized percent formatting for circular progress", () => {
    const i18n = createRuntimeI18n("de");
    const expectedPercent = i18n.formatPercentValue(35);
    const html = renderToStaticMarkup(
      <UsageProgress
        used={65}
        remaining={35}
        total={100}
        tone="neutral"
        label="Weekly limit"
        displayStyle="circle"
        valueKind="remaining"
        i18n={i18n}
      />,
    );

    expect(html).toContain(`>${expectedPercent}<`);
    expect(html).toContain(`aria-valuetext="${i18n.formatPercentValue(35)} verbleibend"`);
  });

  it("keeps caller-provided indeterminate values", () => {
    const html = renderToStaticMarkup(
      <UsageProgress
        used={null}
        total={100}
        tone="warning"
        label="Weekly limit"
        valueLabel="Awaiting provider data"
        valueText="Weekly limit: awaiting provider data"
        i18n={createRuntimeI18n("ja")}
      />,
    );

    expect(html).toContain(">Awaiting provider data<");
    expect(html).toContain(
      'aria-valuetext="Weekly limit: awaiting provider data"',
    );
    expect(html).not.toContain("使用率を取得できません");
  });
});
