import { describe, expect, it } from "vitest";

import { SUPPORTED_APP_LOCALES } from "./i18n";
import { buildQuotaNotificationLocalizedCopy } from "./quota-notification-localized-copy";

describe("quota notification localized copy", () => {
  it.each(SUPPORTED_APP_LOCALES)("provides complete notification copy for %s", (locale) => {
    const copy = buildQuotaNotificationLocalizedCopy(locale);

    expect(
      Object.entries(copy)
        .filter(([key]) => key !== "windowKindLabels")
        .every(([, value]) => typeof value === "string" && value.trim().length > 0),
    ).toBe(true);
    expect(
      Object.values(copy.windowKindLabels).every((value) => value.trim().length > 0),
    ).toBe(true);
    expect(copy.notifyLowTitle).toContain("{provider}");
    expect(copy.notifyLowBody).toContain("{provider}");
    expect(copy.notifyLowBody).toContain("{remaining}");
    expect(copy.notifyResetTitle).toContain("{provider}");
    expect(copy.notifyResetBody).toContain("{provider}");
  });
});
