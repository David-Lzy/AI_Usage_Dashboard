import { describe, expect, it } from "vitest";

import { createDefaultOperatorRuntimeI18n } from "./operator-runtime-i18n";

describe("createDefaultOperatorRuntimeI18n", () => {
  it("uses the system locale preference by default", () => {
    expect(createDefaultOperatorRuntimeI18n(undefined).localePreference).toBe(
      "system",
    );
  });

  it("passes runtime readers through to shared locale resolution", () => {
    const i18n = createDefaultOperatorRuntimeI18n({
      location: { search: "?app-dir=rtl" },
      navigator: { language: "zh-TW" },
    });

    expect(i18n.localePreference).toBe("system");
    expect(i18n.resolvedLocale).toBe("zh-CN");
    expect(i18n.resolvedTextDirection).toBe("rtl");
  });
});
