type TopBarProps = {
  title: string;
  subtitle: string;
  expandActionLabel?: string;
  expandActionTitle?: string;
  secondaryActionLabel?: string;
  primaryActionLabel?: string;
  sticky?: boolean;
  onExpandAction?: () => void;
  onSecondaryAction?: () => void;
  onPrimaryAction?: () => void;
};

export function TopBar({
  title,
  subtitle,
  expandActionLabel = "Tab",
  expandActionTitle = "Open full-page tab",
  secondaryActionLabel = "Refresh",
  primaryActionLabel = "Settings",
  sticky = false,
  onExpandAction,
  onSecondaryAction,
  onPrimaryAction,
}: TopBarProps) {
  return (
    <header className={`top-app-bar${sticky ? " top-app-bar--sticky" : ""}`}>
      <div className="top-app-bar__title">
        <p className="top-app-bar__eyebrow">{subtitle}</p>
        <h1 className="top-app-bar__headline">{title}</h1>
      </div>

      <div className="top-app-bar__actions" aria-label="Toolbar actions">
        {onExpandAction ? (
          <button
            className="icon-button"
            data-topbar-open-full-page="true"
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
    </header>
  );
}
