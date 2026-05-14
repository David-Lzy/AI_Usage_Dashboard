import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  createRuntimeI18n,
  getQuickThemeToggleCopy,
} from "../shared/i18n";
import { PopupHeaderSection } from "./PopupHeaderSection";

function renderPopupHeader({
  hasFeaturedProviderCards = true,
  isRefreshing = false,
}: {
  hasFeaturedProviderCards?: boolean;
  isRefreshing?: boolean;
} = {}) {
  const runtimeI18n = createRuntimeI18n("en");

  return renderToStaticMarkup(
    <PopupHeaderSection
      headerDetail="Everything is ready"
      hasFeaturedProviderCards={hasFeaturedProviderCards}
      isRefreshing={isRefreshing}
      isThemeTogglePending={false}
      quickThemeToggleCopy={getQuickThemeToggleCopy("dark", runtimeI18n)}
      runtimeI18n={runtimeI18n}
      onOpenDashboardTab={() => undefined}
      onOpenSettings={() => undefined}
      onRefresh={() => undefined}
      onToggleThemeMode={() => undefined}
    />,
  );
}

describe("PopupHeaderSection", () => {
  it("places refresh in the title row and keeps route actions together", () => {
    const html = renderPopupHeader();

    expect(html).toContain('class="popup-header__top-row"');
    expect(html).toContain('class="popup-header__title-copy"');
    expect(html).toContain('data-popup-refresh="true"');
    expect(html).toContain('class="popup-header__actions"');
    expect(html).toContain('data-popup-toggle-theme-mode="true"');
    expect(html).toContain('data-popup-open-dashboard-tab="true"');
    expect(html).toContain('data-popup-open-settings="true"');
    expect(html).toContain('aria-label="Open settings"');
    expect(html).toContain(">Settings</button>");
    expect(html).not.toContain('class="popup-actions"');
    expect(html.indexOf("data-popup-refresh")).toBeLessThan(
      html.indexOf('class="popup-header__actions"'),
    );
  });

  it("uses the refreshing label and preserves header detail only when needed", () => {
    const readyHtml = renderPopupHeader({
      hasFeaturedProviderCards: false,
      isRefreshing: true,
    });
    const quotaFirstHtml = renderPopupHeader();

    expect(readyHtml).toContain("Refreshing");
    expect(readyHtml).toContain("Everything is ready");
    expect(quotaFirstHtml).not.toContain("Everything is ready");
  });
});
