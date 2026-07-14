import { readFileSync } from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { createRuntimeI18n } from "../shared/i18n";
import type { ThemeMode } from "../providers/types";
import { PopupHeaderSection } from "./PopupHeaderSection";

const popupThemeCss = readFileSync(
  new URL("./popup-theme.css", import.meta.url),
  "utf8",
);

function renderPopupHeader({
  areActionsCollapsed = false,
  isRefreshing = false,
  hideProviderFeedback = null,
  currentThemeMode = "light",
}: {
  areActionsCollapsed?: boolean;
  isRefreshing?: boolean;
  hideProviderFeedback?: ReactNode;
  currentThemeMode?: ThemeMode;
} = {}) {
  const runtimeI18n = createRuntimeI18n("en");

  return renderToStaticMarkup(
    <PopupHeaderSection
      isRefreshing={isRefreshing}
      isThemeTogglePending={false}
      areActionsCollapsed={areActionsCollapsed}
      currentThemeMode={currentThemeMode}
      refreshCountdownSeconds={15 * 60 + 4}
      runtimeI18n={runtimeI18n}
      hideProviderFeedback={hideProviderFeedback}
      onOpenDashboardSidebar={() => undefined}
      onOpenDashboardTab={() => undefined}
      onOpenSettings={() => undefined}
      onRefresh={() => undefined}
      onToggleActionsCollapsed={() => undefined}
      onSetThemeMode={() => undefined}
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
    expect(html).toContain('aria-haspopup="menu"');
    expect(html).toContain('role="menuitemradio"');
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

  it("shows the current system or local-time mode on the trigger", () => {
    expect(renderPopupHeader({ currentThemeMode: "system" })).toContain(
      'data-theme-mode="system"',
    );
    expect(renderPopupHeader({ currentThemeMode: "system" })).toContain(
      'data-popup-material-icon="devices"',
    );
    expect(renderPopupHeader({ currentThemeMode: "time" })).toContain(
      'data-theme-mode="time"',
    );
    expect(renderPopupHeader({ currentThemeMode: "time" })).toContain(
      'data-popup-material-icon="brightness-auto"',
    );
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

  it("keeps high-DPI action row padding and narrow-width compaction in CSS", () => {
    expect(popupThemeCss).toContain(
      "--popup-header-action-even-gap-min: var(--popup-header-action-gap);",
    );
    expect(popupThemeCss).toContain(
      "--popup-header-refresh-control-min: calc(",
    );
    const evenGapColumns =
      popupThemeCss.match(
        /minmax\(var\(--popup-header-action-even-gap-min\), 1fr\)/g,
      ) ?? [];
    expect(evenGapColumns).toHaveLength(6);
    expect(popupThemeCss).toContain("justify-self: stretch;");
    expect(popupThemeCss).toContain("grid-column: 10;");
    expect(popupThemeCss).toContain("env(safe-area-inset-right, 0px)");
    expect(popupThemeCss).toContain(".popup-header__theme-mode-menu");
    expect(popupThemeCss).toContain("grid-template-columns: repeat(2");
    expect(popupThemeCss).toContain("@media (max-width: 360px)");
    expect(popupThemeCss).toContain("--popup-header-control-size: 44px;");
    expect(popupThemeCss).toContain("--popup-header-action-gap: 6px;");
    expect(popupThemeCss).not.toContain(
      "--popup-header-refresh-control-min: var(--popup-header-control-size);",
    );
  });
});
