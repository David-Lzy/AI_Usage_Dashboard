import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import {
  createRuntimeI18n,
  getQuickThemeToggleCopy,
} from "../shared/i18n";
import { PopupHeaderSection } from "./PopupHeaderSection";

function renderPopupHeader({
  areActionsCollapsed = false,
  isRefreshing = false,
  hideProviderFeedback = null,
}: {
  areActionsCollapsed?: boolean;
  isRefreshing?: boolean;
  hideProviderFeedback?: ReactNode;
} = {}) {
  const runtimeI18n = createRuntimeI18n("en");

  return renderToStaticMarkup(
    <PopupHeaderSection
      isRefreshing={isRefreshing}
      isThemeTogglePending={false}
      areActionsCollapsed={areActionsCollapsed}
      quickThemeToggleCopy={getQuickThemeToggleCopy("dark", runtimeI18n)}
      quickThemeToggleTargetMode="dark"
      refreshCountdownSeconds={15 * 60 + 4}
      runtimeI18n={runtimeI18n}
      hideProviderFeedback={hideProviderFeedback}
      onOpenDashboardSidebar={() => undefined}
      onOpenDashboardTab={() => undefined}
      onOpenSettings={() => undefined}
      onRefresh={() => undefined}
      onToggleActionsCollapsed={() => undefined}
      onToggleThemeMode={() => undefined}
    />,
  );
}

describe("PopupHeaderSection", () => {
  it("renders compact icon actions in one header row", () => {
    const html = renderPopupHeader();

    expect(html).toContain('class="popup-header__actions"');
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('aria-label="Hide top actions"');
    expect(html).toContain('data-popup-toggle-theme-mode="true"');
    expect(html).toContain('data-popup-refresh="true"');
    expect(html).toContain('data-popup-open-dashboard-tab="true"');
    expect(html).toContain('data-popup-open-dashboard-sidebar="true"');
    expect(html).toContain('data-popup-open-settings="true"');
    expect(html).toContain('aria-label="Open sidebar"');
    expect(html).toContain('aria-label="Open settings"');
    expect(html).toContain("15:04");
    expect(html.indexOf('data-popup-refresh="true"')).toBeLessThan(
      html.indexOf('data-popup-toggle-theme-mode="true"'),
    );
    expect(html).not.toContain(">Settings</button>");
    expect(html).not.toContain("Quick glance");
    expect(html).not.toContain('class="popup-actions"');
  });

  it("keeps the floating collapse toggle when header actions are hidden", () => {
    const html = renderPopupHeader({
      areActionsCollapsed: true,
    });

    expect(html).toContain("popup-header--actions-collapsed");
    expect(html).toContain("popup-header--surface-collapsed");
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-label="Show top actions"');
    expect(html).toContain('id="popup-header-actions"');
    expect(html).toContain("hidden");
  });

  it("uses the refreshing label without title copy", () => {
    const readyHtml = renderPopupHeader({
      isRefreshing: true,
    });
    const quotaFirstHtml = renderPopupHeader();

    expect(readyHtml).toContain("Refreshing");
    expect(readyHtml).not.toContain("Everything is ready");
    expect(quotaFirstHtml).not.toContain("Everything is ready");
  });

  it("places hide-provider feedback above the compact action row", () => {
    const html = renderPopupHeader({
      hideProviderFeedback: <span data-test-feedback="true">Undo hide</span>,
    });

    expect(html).toContain('class="popup-header__feedback-slot"');
    expect(html.indexOf('data-test-feedback="true"')).toBeLessThan(
      html.indexOf('class="popup-header__actions"'),
    );
  });
});
