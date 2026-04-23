type TopBarProps = {
  title: string;
  subtitle: string;
  secondaryActionLabel?: string;
  primaryActionLabel?: string;
  sticky?: boolean;
  onSecondaryAction?: () => void;
  onPrimaryAction?: () => void;
};

export function TopBar({
  title,
  subtitle,
  secondaryActionLabel = "Refresh",
  primaryActionLabel = "Settings",
  sticky = false,
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
