import { describe, expect, it } from "vitest";

import { SUPPORTED_APP_LOCALES } from "./i18n";
import {
  buildSub2ApiSettingsLocalizedCopy,
  getSub2ApiConnectionTestLocalizedCopy,
} from "./sub2api-settings-localized-copy";

describe("Sub2API settings localized copy", () => {
  it("provides complete copy for every supported locale", () => {
    for (const locale of SUPPORTED_APP_LOCALES) {
      const copy = buildSub2ApiSettingsLocalizedCopy(locale);
      for (const [key, value] of Object.entries(copy)) {
        if (key === "moduleLabels") {
          for (const label of Object.values(copy.moduleLabels)) {
            expect(label.trim(), `${locale} contains an empty module label`).not.toBe("");
          }
        } else {
          expect(String(value).trim(), `${locale}.${key} is empty`).not.toBe("");
        }
      }
    }
  });

  it("provides complete connection-test feedback for every supported locale", () => {
    for (const locale of SUPPORTED_APP_LOCALES) {
      const copy = getSub2ApiConnectionTestLocalizedCopy(locale);
      for (const [key, value] of Object.entries(copy)) {
        expect(value.trim(), `${locale}.${key} is empty`).not.toBe("");
      }
    }
  });

  it("does not silently reuse the English title for localized settings", () => {
    const english = buildSub2ApiSettingsLocalizedCopy("en");
    for (const locale of SUPPORTED_APP_LOCALES) {
      if (locale !== "en") {
        expect(buildSub2ApiSettingsLocalizedCopy(locale).title).not.toBe(
          english.title,
        );
      }
    }
  });
});
