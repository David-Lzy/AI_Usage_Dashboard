import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SettingsSaveFeedback } from "./SettingsSaveFeedback";
import { getSettingsSaveCopy } from "../../shared/settings-save-localized-copy";

describe("SettingsSaveFeedback", () => {
  it.each([
    "en",
    "zh-CN",
    "zh-TW",
    "ja",
    "ko",
    "es-419",
    "pt-BR",
    "fr",
    "de",
    "it",
    "ru",
    "ar",
    "hi",
    "id",
  ] as const)(
    "localizes acknowledgement and independent thresholds in %s",
    (locale) => {
      const copy = getSettingsSaveCopy(locale);
      expect(new Set(Object.values(copy)).size).toBe(6);
      for (const status of ["pending", "saved", "error"] as const) {
        const html = renderToStaticMarkup(
          <SettingsSaveFeedback
            locale={locale}
            status={status}
            onRetry={() => {}}
          />,
        );
        expect(html).toContain(copy[status]);
        expect(html).toContain('role="status"');
        expect(html.includes("<button")).toBe(status === "error");
      }
      const idle = renderToStaticMarkup(
        <SettingsSaveFeedback
          locale={locale}
          status="idle"
          onRetry={() => {}}
        />,
      );
      expect(idle).not.toContain(copy.saved);
      expect(idle).not.toContain("<button");
    },
  );
});
