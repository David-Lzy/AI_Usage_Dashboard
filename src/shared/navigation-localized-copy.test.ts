import { describe, expect, it } from "vitest";

import { SUPPORTED_APP_LOCALES, createRuntimeI18n } from "./i18n";
import { buildNavigationLocalizedCopy } from "./navigation-localized-copy";

describe("navigation localized copy", () => {
  it.each(SUPPORTED_APP_LOCALES)(
    "provides complete toast and carousel accessibility copy for %s",
    (locale) => {
      const i18n = createRuntimeI18n(locale, undefined);
      const copy = buildNavigationLocalizedCopy(i18n);

      expect(copy.dismiss.trim()).not.toBe("");
      expect(copy.carousel.roleDescription.trim()).not.toBe("");
      expect(copy.carousel.slideRoleDescription.trim()).not.toBe("");
      expect(copy.carousel.previousProvider.trim()).not.toBe("");
      expect(copy.carousel.nextProvider.trim()).not.toBe("");
      expect(copy.carousel.slides.trim()).not.toBe("");
      expect(copy.carousel.status(2, 14, "Cursor")).toContain(
        i18n.formatNumber(2),
      );
      expect(copy.carousel.status(2, 14, "Cursor")).toContain(
        i18n.formatNumber(14),
      );
      expect(copy.carousel.slideLabel(2, 14, "Cursor")).toContain(
        i18n.formatNumber(2),
      );
      expect(copy.carousel.slideLabel(2, 14, "Cursor")).toContain(
        i18n.formatNumber(14),
      );
      expect(copy.carousel.showSlide("Cursor")).toContain("Cursor");
    },
  );
});
