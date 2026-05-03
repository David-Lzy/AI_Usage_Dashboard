import { describe, expect, it } from "vitest";

import { createRuntimeI18n } from "./i18n";
import { buildStoreWorkflowLocalizedCopy as buildReexportedCopy } from "./localized-copy";
import { buildStoreWorkflowLocalizedCopy } from "./store-workflow-localized-copy";

describe("buildStoreWorkflowLocalizedCopy", () => {
  it("builds English store screenshot seed copy", () => {
    const copy = buildStoreWorkflowLocalizedCopy(createRuntimeI18n("en"));

    expect(copy.screenshotSeed.sectionLabel).toBe(
      "Store Screenshot Debug Route",
    );
    expect(copy.screenshotSeed.presetHeadline("unlock", "Fallback")).toBe(
      "Screenshot seed lock cleared",
    );
    expect(copy.nativePopupProbe.openingTitle).toBe(
      "Opening native toolbar popup",
    );
  });

  it("builds Simplified Chinese store workflow copy", () => {
    const copy = buildStoreWorkflowLocalizedCopy(createRuntimeI18n("zh-CN"));

    expect(copy.screenshotSeed.sectionLabel).toBe("Store Screenshot 调试路由");
    expect(copy.screenshotSeed.presetDetail("missing", "回退")).toBe("回退");
    expect(copy.nativePopupProbe.requestedTitle).toBe("已请求原生 popup");
  });

  it("preserves the legacy localized-copy export path", () => {
    const copy = buildReexportedCopy(createRuntimeI18n("en"));

    expect(copy.nativePopupProbe.didNotOpenTitle).toBe(
      "Native popup did not open",
    );
  });
});
