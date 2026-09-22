import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { RuntimeI18n } from "../shared/i18n";
import type { ThemeMode } from "../providers/types";
import { PopupMaterialIcon } from "./PopupMaterialIcon";
import { formatPopupRefreshCountdownLabel } from "./popup-refresh-schedule";

type PopupHeaderSectionProps = {
  isRefreshing: boolean;
  isThemeTogglePending: boolean;
  currentThemeMode: ThemeMode;
  areActionsCollapsed: boolean;
  refreshCountdownSeconds: number | null;
  runtimeI18n: RuntimeI18n;
  hideProviderFeedback?: ReactNode;
  onOpenDashboardSidebar: () => void | Promise<void>;
  onOpenDashboardTab: () => void | Promise<void>;
  onOpenSettings: () => void | Promise<void>;
  onRefresh: () => void | Promise<void>;
  onToggleActionsCollapsed: () => void;
  onSetThemeMode: (themeMode: ThemeMode) => void | Promise<void>;
};

const THEME_MODE_OPTIONS: readonly ThemeMode[] = [
  "light",
  "system",
  "dark",
  "time",
];

function getThemeModeIcon(themeMode: ThemeMode) {
  return themeMode === "dark"
    ? "dark-mode"
    : themeMode === "light"
      ? "clear-day"
      : themeMode === "system"
        ? "devices"
        : "brightness-auto";
}

function getThemeModeLabel(themeMode: ThemeMode, runtimeI18n: RuntimeI18n) {
  return runtimeI18n.t(
    themeMode === "dark"
      ? "settings.preferences.theme_mode.dark"
      : themeMode === "light"
        ? "settings.preferences.theme_mode.light"
        : themeMode === "system"
          ? "settings.preferences.theme_mode.system"
          : "settings.preferences.theme_mode.time",
  );
}

function buildRefreshTitle({
  isRefreshing,
  refreshCountdownSeconds,
  runtimeI18n,
}: {
  isRefreshing: boolean;
  refreshCountdownSeconds: number | null;
  runtimeI18n: RuntimeI18n;
}) {
  if (isRefreshing) {
    return runtimeI18n.t("popup.actions.refreshing");
  }

  const countdownLabel =
    refreshCountdownSeconds === null
      ? null
      : formatPopupRefreshCountdownLabel(
          refreshCountdownSeconds,
          runtimeI18n.formatNumber,
        );

  return [
    runtimeI18n.t("popup.actions.refresh_title"),
    countdownLabel,
    runtimeI18n.t("popup.actions.refresh_drift_note"),
  ]
    .filter(Boolean)
    .join(" · ");
}

export function PopupHeaderSection({
  isRefreshing,
  isThemeTogglePending,
  currentThemeMode,
  areActionsCollapsed,
  refreshCountdownSeconds,
  runtimeI18n,
  hideProviderFeedback = null,
  onOpenDashboardSidebar,
  onOpenDashboardTab,
  onOpenSettings,
  onRefresh,
  onToggleActionsCollapsed,
  onSetThemeMode,
}: PopupHeaderSectionProps) {
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const themeMenuId = useId();
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const themeButtonRef = useRef<HTMLButtonElement>(null);
  const collapseButtonRef = useRef<HTMLButtonElement>(null);
  const initialMenuFocus = useRef(0);
  const refreshTitle = buildRefreshTitle({
    isRefreshing,
    refreshCountdownSeconds,
    runtimeI18n,
  });
  const refreshCountdownLabel = formatPopupRefreshCountdownLabel(
    refreshCountdownSeconds,
    runtimeI18n.formatNumber,
  );
  const currentThemeLabel = getThemeModeLabel(currentThemeMode, runtimeI18n);
  const themeButtonTitle = `${runtimeI18n.t(
    "settings.preferences.theme_mode_label",
  )}: ${currentThemeLabel}`;
  const toggleActionsTitle = runtimeI18n.t(
    areActionsCollapsed
      ? "popup.actions.show_header_actions"
      : "popup.actions.hide_header_actions",
  );
  const isSurfaceCollapsed = areActionsCollapsed && !hideProviderFeedback;

  function closeThemeMenu(restoreFocus = false) {
    setIsThemeMenuOpen(false);
    if (restoreFocus) themeButtonRef.current?.focus();
  }

  useEffect(() => {
    if (areActionsCollapsed) {
      if (themeMenuRef.current?.contains(document.activeElement)) collapseButtonRef.current?.focus();
      setIsThemeMenuOpen(false);
    }
  }, [areActionsCollapsed]);

  useEffect(() => {
    if (!isThemeMenuOpen) {
      return undefined;
    }

    function closeWhenFocusLeaves(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !themeMenuRef.current?.contains(event.target)
      ) {
        setIsThemeMenuOpen(false);
      }
    }

    const options = themeMenuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]');
    options?.[initialMenuFocus.current]?.focus();

    document.addEventListener("pointerdown", closeWhenFocusLeaves);
    return () => {
      document.removeEventListener("pointerdown", closeWhenFocusLeaves);
    };
  }, [isThemeMenuOpen]);

  return (
    <section
      className={`status-card popup-header${
        areActionsCollapsed ? " popup-header--actions-collapsed" : ""
      }${isSurfaceCollapsed ? " popup-header--surface-collapsed" : ""}`}
    >
      <button
        ref={collapseButtonRef}
        className="icon-button popup-header__collapse-toggle"
        type="button"
        aria-controls="popup-header-actions"
        aria-expanded={!areActionsCollapsed}
        aria-label={toggleActionsTitle}
        title={toggleActionsTitle}
        onClick={onToggleActionsCollapsed}
      >
        <PopupMaterialIcon
          name={
            areActionsCollapsed
              ? "keyboard-arrow-down"
              : "keyboard-arrow-up"
          }
        />
      </button>
      {hideProviderFeedback ? (
        <div className="popup-header__feedback-slot">
          {hideProviderFeedback}
        </div>
      ) : null}
      <div
        id="popup-header-actions"
        className="popup-header__actions"
        hidden={areActionsCollapsed}
      >
        <button
          className="icon-button popup-header__icon-action popup-header__icon-action--refresh"
          type="button"
          disabled={isRefreshing}
          data-popup-refresh="true"
          aria-label={refreshTitle}
          title={refreshTitle}
          onClick={() => {
            void onRefresh();
          }}
        >
          <PopupMaterialIcon name="refresh" />
          <span className="popup-header__refresh-countdown" aria-hidden="true">
            {isRefreshing
              ? runtimeI18n.t("popup.actions.refreshing")
              : refreshCountdownLabel}
          </span>
        </button>
        <div className="popup-header__theme-menu" ref={themeMenuRef}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) closeThemeMenu();
          }}
        >
          <button
            ref={themeButtonRef}
            className="icon-button popup-header__icon-action"
            data-popup-toggle-theme-mode="true"
            data-theme-local-surface="popup-toggle-theme-mode"
            data-theme-mode={currentThemeMode}
            type="button"
            aria-controls={themeMenuId}
            aria-expanded={isThemeMenuOpen}
            aria-haspopup="menu"
            aria-label={themeButtonTitle}
            title={themeButtonTitle}
            aria-disabled={isThemeTogglePending}
            onClick={() => {
              if (isThemeTogglePending) return;
              initialMenuFocus.current = 0;
              setIsThemeMenuOpen((current) => !current);
            }}
            onKeyDown={(event) => {
              if (!isThemeTogglePending && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
                event.preventDefault();
                initialMenuFocus.current = event.key === "ArrowUp" ? THEME_MODE_OPTIONS.length - 1 : 0;
                setIsThemeMenuOpen(true);
              }
            }}
          >
            <PopupMaterialIcon name={getThemeModeIcon(currentThemeMode)} />
          </button>
          <div
            id={themeMenuId}
            className="popup-header__theme-mode-menu"
            role="menu"
            aria-label={runtimeI18n.t(
              "settings.preferences.theme_mode_label",
            )}
            hidden={!isThemeMenuOpen}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                closeThemeMenu(true);
              } else if (event.key === "Tab") {
                // Continue the browser's normal tab order from the menu trigger.
                closeThemeMenu(true);
              } else {
                const options = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]'));
                const current = options.indexOf(document.activeElement as HTMLButtonElement);
                const next = event.key === "ArrowDown" ? (current + 1) % options.length
                  : event.key === "ArrowUp" ? (current - 1 + options.length) % options.length
                    : event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : -1;
                if (next >= 0) {
                  event.preventDefault();
                  options[next]?.focus();
                }
              }
            }}
          >
            {THEME_MODE_OPTIONS.map((themeMode) => {
              const isSelected = themeMode === currentThemeMode;
              const label = getThemeModeLabel(themeMode, runtimeI18n);

              return (
                <button
                  key={themeMode}
                  className={`popup-header__theme-mode-option${
                    isSelected
                      ? " popup-header__theme-mode-option--selected"
                      : ""
                  }`}
                  type="button"
                  role="menuitemradio"
                  tabIndex={-1}
                  aria-checked={isSelected}
                  aria-disabled={isThemeTogglePending}
                  onClick={() => {
                    if (isThemeTogglePending) return;
                    closeThemeMenu(true);
                    if (!isSelected) {
                      void onSetThemeMode(themeMode);
                    }
                  }}
                >
                  <PopupMaterialIcon name={getThemeModeIcon(themeMode)} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <button
          className="icon-button popup-header__icon-action"
          data-popup-open-dashboard-tab="true"
          data-theme-local-surface="popup-open-dashboard-tab"
          type="button"
          aria-label={runtimeI18n.t("common.actions.open_dashboard_tab")}
          title={runtimeI18n.t("common.actions.open_dashboard_tab")}
          onClick={() => {
            void onOpenDashboardTab();
          }}
        >
          <PopupMaterialIcon name="tab" />
        </button>
        <button
          className="icon-button popup-header__icon-action"
          data-popup-open-dashboard-sidebar="true"
          data-theme-local-surface="popup-open-dashboard-sidebar"
          type="button"
          aria-label={runtimeI18n.t("common.actions.open_sidebar")}
          title={runtimeI18n.t("common.actions.open_sidebar")}
          onClick={() => {
            void onOpenDashboardSidebar();
          }}
        >
          <PopupMaterialIcon name="dock-left" />
        </button>
        <button
          className="icon-button popup-header__icon-action"
          data-popup-open-settings="true"
          data-theme-local-surface="popup-open-settings"
          type="button"
          aria-label={runtimeI18n.t("common.actions.open_settings")}
          title={runtimeI18n.t("common.actions.open_settings")}
          onClick={() => {
            void onOpenSettings();
          }}
        >
          <PopupMaterialIcon name="settings" />
        </button>
      </div>
    </section>
  );
}
