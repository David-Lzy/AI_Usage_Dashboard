import type { ReactNode } from "react";

type TopBarProps = {
  title: string;
  subtitle: string;
  themeActionLabel?: string;
  themeActionTitle?: string;
  expandActionLabel?: string;
  expandActionTitle?: string;
  secondaryActionLabel?: string;
  primaryActionLabel?: string;
  bottomContent?: ReactNode;
  sticky?: boolean;
  onThemeAction?: () => void;
  onExpandAction?: () => void;
  onSecondaryAction?: () => void;
  onPrimaryAction?: () => void;
};

export function TopBar({
  title,
  subtitle,
  themeActionLabel = "Dark",
  themeActionTitle = "Switch to dark mode",
  expandActionLabel = "Tab",
  expandActionTitle = "Open full-page tab",
  secondaryActionLabel = "Refresh",
  primaryActionLabel = "Settings",
  bottomContent,
  sticky = false,
  onThemeAction,
  onExpandAction,
  onSecondaryAction,
  onPrimaryAction,
}: TopBarProps) {
  return (
    <header className={`top-app-bar${sticky ? " top-app-bar--sticky" : ""}`}>
      <div className="top-app-bar__main">
        <div className="top-app-bar__title">
          <p className="top-app-bar__eyebrow">{subtitle}</p>
          <h1 className="top-app-bar__headline">{title}</h1>
        </div>

        <div className="top-app-bar__actions" aria-label="Toolbar actions">
          {onThemeAction ? (
            <button
              className="icon-button"
              data-topbar-toggle-theme-mode="true"
              type="button"
              aria-label={themeActionTitle}
              title={themeActionTitle}
              onClick={onThemeAction}
            >
              {themeActionLabel}
            </button>
          ) : null}
          {onExpandAction ? (
            <button
              className="icon-button"
              data-topbar-open-full-page="true"
              data-topbar-switch-surface="true"
              type="button"
              aria-label={expandActionTitle}
              title={expandActionTitle}
              onClick={onExpandAction}
            >
              {expandActionLabel}
            </button>
          ) : null}
          <button className="icon-button" type="button" onClick={onSecondaryAction}>
            {secondaryActionLabel}
          </button>
          <button
            className="icon-button icon-button--primary"
            type="button"
            onClick={onPrimaryAction}
          >
            {primaryActionLabel}
          </button>
        </div>
      </div>

      {bottomContent ? (
        <div className="top-app-bar__bottom">{bottomContent}</div>
      ) : null}
    </header>
  );
}
