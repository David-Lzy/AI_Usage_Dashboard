import { describe, expect, it } from "vitest";

import { SUPPORTED_APP_LOCALES, createRuntimeI18n } from "./i18n";
import { buildPopupLocalizedCopy as buildReexportedCopy } from "./localized-copy";
import { buildPopupLocalizedCopy } from "./popup-localized-copy";

describe("buildPopupLocalizedCopy", () => {
  it("builds English popup setup and surface-role copy", () => {
    const copy = buildPopupLocalizedCopy(createRuntimeI18n("en"));

    expect(copy.header.ready).toBe(
      "Use this popup for quick freshness and provider triage without reopening the full dashboard.",
    );
    expect(copy.setupCoverage.buildSetupBlockerSentence(1, 2)).toBe(
      "1 provider needs host access. 2 providers need credentials.",
    );
    expect(copy.surfaceRoles.popupQuickGlanceHeadline).toBe(
      "Popup stays quick glance",
    );
  });

  it("builds Simplified Chinese popup setup and featured-card copy", () => {
    const copy = buildPopupLocalizedCopy(createRuntimeI18n("zh-CN"));

    expect(copy.featuredCard.statusReloadPage).toBe("重新加载");
    expect(copy.guidance.multipleMissingCredentialDetail(2)).toBe(
      "2 个 provider 仍然依赖缺失的已存凭据，它们的当前 live 路径还不能稳定运行。",
    );
    expect(copy.setupCoverage.visibleProvidersHeadline(3)).toBe(
      "3 个 provider 可见",
    );
  });

  it("ships first-run popup guidance copy for every non-English locale", () => {
    const englishCopy = buildPopupLocalizedCopy(createRuntimeI18n("en"));

    for (const locale of SUPPORTED_APP_LOCALES.filter(
      (supportedLocale) => supportedLocale !== "en",
    )) {
      const copy = buildPopupLocalizedCopy(createRuntimeI18n(locale));

      expect(copy.snapshotStatus.noProvidersHeadline).not.toBe(
        englishCopy.snapshotStatus.noProvidersHeadline,
      );
      expect(copy.guidance.startHereLabel).not.toBe(
        englishCopy.guidance.startHereLabel,
      );
      expect(copy.setupCoverage.statusStartSetup).not.toBe(
        englishCopy.setupCoverage.statusStartSetup,
      );
      expect(copy.header.ready).not.toBe(englishCopy.header.ready);
    }
  });

  it("keeps later popup buckets on English fallback until the next slice", () => {
    const englishCopy = buildPopupLocalizedCopy(createRuntimeI18n("en"));

    for (const locale of SUPPORTED_APP_LOCALES.filter(
      (supportedLocale) => supportedLocale !== "en" && supportedLocale !== "zh-CN",
    )) {
      const copy = buildPopupLocalizedCopy(createRuntimeI18n(locale));

      expect(copy.featuredCard.statusNeedsAccess).toBe(
        englishCopy.featuredCard.statusNeedsAccess,
      );
      expect(copy.surfaceRoles.popupQuickGlanceHeadline).toBe(
        englishCopy.surfaceRoles.popupQuickGlanceHeadline,
      );
    }
  });

  it("preserves the legacy localized-copy export path", () => {
    const copy = buildReexportedCopy(createRuntimeI18n("en"));

    expect(copy.setupCoverage.label).toBe("Setup coverage");
    expect(copy.featuredSection.providerTriageLabel).toBe("Provider triage");
  });
});
