import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createDefaultProgressItemsBySurface } from "../display-preferences";
import { createRuntimeI18n } from "../i18n";
import type { CustomSourceViewModel } from "../custom-source-view-models";
import { CustomSourceProgressItemList } from "./CustomSourceProgressItemList";

describe("CustomSourceProgressItemList", () => {
  it("localizes value-only totals without changing the custom source label", () => {
    const source = {
      sourceId: "custom:build_quota",
      label: "Build Quota",
      progressItems: [
        {
          id: "primary",
          kind: "primary_quota",
          sourceId: "custom:build_quota",
          sourceLabel: "Build Quota",
          label: "Build jobs",
          quotaUnit: "jobs",
          used: null,
          remaining: null,
          total: 3000,
          resetAt: null,
          resetLabel: null,
          detail: null,
          tone: "neutral",
          availability: "value_only",
        },
      ],
    } as unknown as CustomSourceViewModel;

    const html = renderToStaticMarkup(
      <CustomSourceProgressItemList
        displayStyle="line"
        i18n={createRuntimeI18n("de")}
        progressColorBands={[]}
        progressItemsBySurface={createDefaultProgressItemsBySurface()}
        progressThicknessPx={10}
        source={source}
        surface="popup"
      />,
    );

    expect(html).toContain(">Build jobs<");
    expect(html).toContain(">3.000 jobs insgesamt<");
  });
});
