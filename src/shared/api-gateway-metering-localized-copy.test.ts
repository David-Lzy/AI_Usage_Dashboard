import { describe, expect, it } from "vitest";

import { SUPPORTED_APP_LOCALES } from "./i18n";
import { buildApiGatewayMeteringLocalizedCopy } from "./api-gateway-metering-localized-copy";

describe("API gateway metering localized copy", () => {
  it("provides complete copy for every supported locale", () => {
    for (const locale of SUPPORTED_APP_LOCALES) {
      const copy = buildApiGatewayMeteringLocalizedCopy(locale);
      for (const value of Object.values(copy)) {
        expect(value.trim(), `${locale} contains an empty metering label`).not.toBe("");
      }
    }
  });

  it("does not silently reuse the English heading for localized surfaces", () => {
    const english = buildApiGatewayMeteringLocalizedCopy("en");
    for (const locale of SUPPORTED_APP_LOCALES) {
      if (locale !== "en") {
        expect(buildApiGatewayMeteringLocalizedCopy(locale).overview).not.toBe(
          english.overview,
        );
      }
    }
  });
});
