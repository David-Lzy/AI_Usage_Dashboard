import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../../shared/demo-state";
import { createRuntimeI18n } from "../../shared/i18n";
import { QuotaNotificationSettings } from "./QuotaNotificationSettings";

describe("QuotaNotificationSettings", () => {
  it("renders safely during SSR before notification settings are read", () => {
    const html = renderToStaticMarkup(
      <QuotaNotificationSettings
        state={{
          providers: SAMPLE_APP_STATE.providers,
          providerSettings: SAMPLE_APP_STATE.providerSettings,
          providerAccounts: SAMPLE_APP_STATE.providerAccounts,
        }}
        i18n={createRuntimeI18n("en")}
        warningThresholdPercent={SAMPLE_APP_STATE.settings.warningThresholdPercent}
      />,
    );

    expect(html).toContain('data-quota-notifications=""');
    expect(html).toContain('role="status"');
    expect(html).toContain("Loading notification settings");
    expect(html).not.toContain('data-notification-action="enable"');
  });

  it.each([
    ["zh-CN", "用量通知"],
    ["ar", "إشعارات الحصة"],
  ] as const)("uses localized SSR copy for %s", (locale, title) => {
    const html = renderToStaticMarkup(
      <QuotaNotificationSettings
        state={{
          providers: [],
          providerSettings: [],
          providerAccounts: {},
        }}
        i18n={createRuntimeI18n(locale)}
        warningThresholdPercent={80}
      />,
    );

    expect(html).toContain(title);
  });
});
