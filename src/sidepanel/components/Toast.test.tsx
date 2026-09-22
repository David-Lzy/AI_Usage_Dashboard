import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SUPPORTED_APP_LOCALES, createRuntimeI18n } from "../../shared/i18n";
import { buildNavigationLocalizedCopy } from "../../shared/navigation-localized-copy";
import { Toast } from "./Toast";

describe("Toast", () => {
  it.each(SUPPORTED_APP_LOCALES)(
    "renders a localized dismiss action for %s",
    (locale) => {
      const i18n = createRuntimeI18n(locale, undefined);
      const html = renderToStaticMarkup(
        <Toast
          i18n={i18n}
          tone="success"
          title="Saved"
          message="Your settings were saved."
          onDismiss={() => {}}
        />,
      );

      expect(html).toContain(buildNavigationLocalizedCopy(i18n).dismiss);
    },
  );
});
