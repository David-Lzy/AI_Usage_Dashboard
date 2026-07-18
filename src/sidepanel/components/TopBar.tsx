import type { ReactNode } from "react";

import {
  MaterialActionIcon,
  type MaterialActionIconName,
} from "../../shared/components/MaterialActionIcon";
import { markSurfaceSwitchIntent } from "../surface-switch-intent";

type TopBarProps = {
  title: string;
  subtitle: string;
  themeActionLabel?: string;
  themeActionTitle?: string;
  themeActionIconName?: MaterialActionIconName;
  expandActionLabel?: string;
  expandActionTitle?: string;
  expandActionIconName?: MaterialActionIconName;
  secondaryActionLabel?: string;
  secondaryActionIconName?: MaterialActionIconName;
  primaryActionLabel?: string;
  primaryActionIconName?: MaterialActionIconName;
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
  themeActionIconName,
  expandActionLabel = "Tab",
  expandActionTitle = "Open full-page tab",
  expandActionIconName,
  secondaryActionLabel = "Refresh",
  secondaryActionIconName,
  primaryActionLabel = "Settings",
  primaryActionIconName,
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
              {themeActionIconName ? (
                <MaterialActionIcon
                  className="top-app-bar__action-icon"
                  name={themeActionIconName}
                />
              ) : null}
              <span className="top-app-bar__action-label">
                {themeActionLabel}
              </span>
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
              onPointerDown={() => markSurfaceSwitchIntent()}
              onClick={onExpandAction}
            >
              {expandActionIconName ? (
                <MaterialActionIcon
                  className="top-app-bar__action-icon"
                  name={expandActionIconName}
                />
              ) : null}
              <span className="top-app-bar__action-label">
                {expandActionLabel}
              </span>
            </button>
          ) : null}
          <button className="icon-button" type="button" onClick={onSecondaryAction}>
            {secondaryActionIconName ? (
              <MaterialActionIcon
                className="top-app-bar__action-icon"
                name={secondaryActionIconName}
              />
            ) : null}
            <span className="top-app-bar__action-label">
              {secondaryActionLabel}
            </span>
          </button>
          <button
            className="icon-button icon-button--primary"
            type="button"
            onClick={onPrimaryAction}
          >
            {primaryActionIconName ? (
              <MaterialActionIcon
                className="top-app-bar__action-icon"
                name={primaryActionIconName}
              />
            ) : null}
            <span className="top-app-bar__action-label">
              {primaryActionLabel}
            </span>
          </button>
        </div>
      </div>

      {bottomContent ? (
        <div className="top-app-bar__bottom">{bottomContent}</div>
      ) : null}
    </header>
  );
}
