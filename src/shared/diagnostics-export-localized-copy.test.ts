import { describe, expect, it } from "vitest";

import { SUPPORTED_APP_LOCALES } from "./i18n";
import { buildDiagnosticsExportLocalizedCopy } from "./diagnostics-export-localized-copy";

describe("buildDiagnosticsExportLocalizedCopy", () => {
  it("provides complete diagnostic export copy for every shipped locale", () => {
    for (const locale of SUPPORTED_APP_LOCALES) {
      const copy = buildDiagnosticsExportLocalizedCopy(locale);

      expect(copy.title).not.toHaveLength(0);
      expect(copy.preview).not.toHaveLength(0);
      expect(copy.previewTitle).not.toHaveLength(0);
      expect(copy.download).not.toHaveLength(0);
      expect(copy.downloadTitle).not.toHaveLength(0);
      expect(copy.close).not.toHaveLength(0);
      expect(copy.closeTitle).not.toHaveLength(0);
      expect(copy.previewFailed).not.toHaveLength(0);
      expect(copy.downloadFailed).not.toHaveLength(0);
    }
  });

  it("does not fall back to English diagnostic export copy", () => {
    const english = buildDiagnosticsExportLocalizedCopy("en");

    for (const locale of SUPPORTED_APP_LOCALES.filter(
      (supportedLocale) => supportedLocale !== "en",
    )) {
      const copy = buildDiagnosticsExportLocalizedCopy(locale);

      expect(copy.title).not.toBe(english.title);
      expect(copy.preview).not.toBe(english.preview);
      expect(copy.download).not.toBe(english.download);
      expect(copy.close).not.toBe(english.close);
      expect(copy.previewFailed).not.toBe(english.previewFailed);
      expect(copy.downloadFailed).not.toBe(english.downloadFailed);
    }
  });
});
