import { describe, expect, it } from "vitest";
import { SUPPORTED_APP_LOCALES } from "./i18n";
import { buildLocalCompanionLocalizedCopy } from "./local-companion-localized-copy";

describe("local companion localized copy", () => {
  it.each(SUPPORTED_APP_LOCALES)("covers bridge copy for %s", (locale) => {
    const copy = buildLocalCompanionLocalizedCopy(locale);
    expect(copy.pair.length).toBeGreaterThan(0);
    expect(copy.failures.permission_required.length).toBeGreaterThan(0);
    expect(copy.statuses.connected.length).toBeGreaterThan(0);
    expect(copy.stale.length).toBeGreaterThan(0);
    expect(copy.managedStatuses.ok.length).toBeGreaterThan(0);
  });

  it.each(SUPPORTED_APP_LOCALES.filter((locale) => locale !== "en"))(
    "does not reuse English copy for %s",
    (locale) => {
      const english = buildLocalCompanionLocalizedCopy("en");
      const copy = buildLocalCompanionLocalizedCopy(locale);

      expect(copy).not.toBe(english);
      expect(copy.failures).not.toBe(english.failures);
      expect(copy.removeSource).not.toBe(english.removeSource);
    },
  );
});
