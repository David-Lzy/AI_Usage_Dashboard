import { describe, expect, it } from "vitest";

import { createRuntimeI18n, SUPPORTED_APP_LOCALES } from "./i18n";
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

  it("localizes provider source display wrapper copy for every non-English locale", () => {
    const englishCopy = buildProviderSourceDisplayLocalizedCopy(
      createRuntimeI18n("en"),
    );

    for (const locale of SUPPORTED_APP_LOCALES.filter(
      (supportedLocale) => supportedLocale !== "en",
    )) {
      const copy = buildProviderSourceDisplayLocalizedCopy(
        createRuntimeI18n(locale),
      );

      expect(copy.rolloutStageLabels.deferred).not.toBe(
        englishCopy.rolloutStageLabels.deferred,
      );
      expect(copy.fieldAvailabilityLabels.unavailable).not.toBe(
        englishCopy.fieldAvailabilityLabels.unavailable,
      );
      expect(copy.sourceFidelity.window_only.detail).not.toBe(
        englishCopy.sourceFidelity.window_only.detail,
      );
      expect(copy.connectionMode.credential.detail).not.toBe(
        englishCopy.connectionMode.credential.detail,
      );
      expect(copy.sourceContractLabels.shipped_admin_analytics).not.toBe(
        englishCopy.sourceContractLabels.shipped_admin_analytics,
      );
      expect(copy.sourceContractLabels.shipped_personal_partial).not.toBe(
        englishCopy.sourceContractLabels.shipped_personal_partial,
      );
      expect(copy.sourceState.hostAccessMissingLabel).not.toBe(
        englishCopy.sourceState.hostAccessMissingLabel,
      );
      expect(copy.availabilitySummary("10%", "90%", "tomorrow")).not.toBe(
        englishCopy.availabilitySummary("10%", "90%", "tomorrow"),
      );
    }
  });

  it("keeps Arabic source contract badges free of embedded Latin fragments", () => {
    const copy = buildProviderSourceDisplayLocalizedCopy(
      createRuntimeI18n("ar"),
    );

    expect(copy.sourceContractLabels.shipped_admin_analytics).not.toMatch(
      /[A-Za-z]/,
    );
    expect(copy.sourceContractLabels.shipped_personal_partial).not.toMatch(
      /[A-Za-z]/,
    );
  });

  it("preserves the legacy localized-copy export path", () => {
    const copy = buildReexportedCopy(createRuntimeI18n("zh-CN"));

    expect(copy.rolloutStageLabels.shipped).toBe("已发布");
  });
});
