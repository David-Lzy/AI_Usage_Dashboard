import { describe, expect, it } from "vitest";

import { createRuntimeI18n } from "./i18n";
import { buildProviderSourceDisplayLocalizedCopy as buildReexportedCopy } from "./localized-copy";
import { buildProviderSourceDisplayLocalizedCopy } from "./provider-source-display-localized-copy";
import { DEFAULT_PROVIDER_SOURCE_DISPLAY_COPY } from "./provider-sources";

describe("buildProviderSourceDisplayLocalizedCopy", () => {
  it("keeps the default source display copy for English", () => {
    expect(buildProviderSourceDisplayLocalizedCopy(createRuntimeI18n("en"))).toBe(
      DEFAULT_PROVIDER_SOURCE_DISPLAY_COPY,
    );
  });

  it("localizes source display labels for Simplified Chinese", () => {
    const copy = buildProviderSourceDisplayLocalizedCopy(
      createRuntimeI18n("zh-CN"),
    );

    expect(copy.sourceKindLabels.session_page).toBe("会话页面");
    expect(copy.sourcePreferenceLabels.official_api).toBe("官方 API");
    expect(copy.sourceState.hostAccessMissingLabel).toBe("缺少 host access");
    expect(copy.availabilitySummary("10%", "90%", "明天")).toBe(
      "已用：10% · 剩余：90% · 重置：明天",
    );
  });

  it("preserves the legacy localized-copy export path", () => {
    const copy = buildReexportedCopy(createRuntimeI18n("zh-CN"));

    expect(copy.rolloutStageLabels.shipped).toBe("已发布");
  });
});
