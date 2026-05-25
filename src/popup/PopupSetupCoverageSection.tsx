import { SummaryStrip } from "../sidepanel/components/SummaryStrip";
import { StatusBadge } from "../sidepanel/components/StatusBadge";
import type { SettingsRouteFocus } from "../shared/sidepanel-route-state";
import type {
  PopupGuidanceAction,
  PopupSetupCoverage,
} from "./view-models";

type PopupSetupCoverageSectionProps = {
  ariaLabel: string;
  setupCoverage: PopupSetupCoverage;
  settingsFocus: SettingsRouteFocus | null;
  onAction: (
    action: PopupGuidanceAction,
    options?: { settingsFocus?: SettingsRouteFocus | null },
  ) => void | Promise<void>;
};

export function PopupSetupCoverageSection({
  ariaLabel,
  setupCoverage,
  settingsFocus,
  onAction,
}: PopupSetupCoverageSectionProps) {
  const action = setupCoverage.action;

  return (
    <section
      className="status-card popup-setup-coverage"
      data-theme-local-surface="popup-setup-coverage-card"
    >
      <div className="status-card__header">
        <div>
          <p
            className="section-label"
            data-theme-local-surface="popup-setup-coverage-label"
          >
            {setupCoverage.label}
          </p>
          <h2 className="section-title">{setupCoverage.headline}</h2>
        </div>
        <div data-popup-setup-coverage-stage>
          {action ? (
            <button
              className={`status-chip status-chip-button status-chip--${setupCoverage.tone}`}
              data-popup-setup-coverage-action="true"
              type="button"
              aria-label={action.label}
              title={action.label}
              onClick={() => {
                void onAction(action, {
                  settingsFocus,
                });
              }}
            >
              {setupCoverage.statusLabel}
            </button>
          ) : (
            <StatusBadge
              label={setupCoverage.statusLabel}
              tone={setupCoverage.tone}
            />
          )}
        </div>
      </div>
      <p className="supporting-copy" data-popup-setup-coverage-detail>
        {setupCoverage.detail}
      </p>
      <div data-popup-setup-coverage-grid>
        <SummaryStrip
          ariaLabel={ariaLabel}
          items={setupCoverage.items}
        />
      </div>
    </section>
  );
}
