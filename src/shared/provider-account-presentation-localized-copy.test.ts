import { describe, expect, it } from "vitest";

import { SUPPORTED_APP_LOCALES } from "./i18n";
import { getProviderAccountPresentationLocalizedCopy } from "./provider-account-presentation-localized-copy";

describe("provider account presentation localized copy", () => {
  it.each(SUPPORTED_APP_LOCALES)(
    "provides distinct popup deployment modes for %s",
    (locale) => {
      const copy = getProviderAccountPresentationLocalizedCopy(locale);

      expect(copy.label.trim()).not.toBe("");
      expect(copy.detail.trim()).not.toBe("");
      expect(copy.nextDeployment.trim()).not.toBe("");
      expect(new Set([copy.select, copy.cycle, copy.cards])).toHaveLength(3);
    },
  );
});
