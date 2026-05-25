import type { RuntimeI18n } from "../shared/i18n";
import { StatusBadge } from "../sidepanel/components/StatusBadge";
import type { SettingsRouteFocus } from "../shared/sidepanel-route-state";
import type {
  PopupGuidanceAction,
  PopupGuidanceCard,
} from "./view-models";

type PopupGuidanceCardSectionProps = {
  card: PopupGuidanceCard | null;
  runtimeI18n: RuntimeI18n;
  settingsFocus: SettingsRouteFocus | null;
  onAction: (
    action: PopupGuidanceAction,
    options?: { settingsFocus?: SettingsRouteFocus | null },
  ) => void | Promise<void>;
};

export function PopupGuidanceCardSection({
  card,
  runtimeI18n,
  settingsFocus,
  onAction,
}: PopupGuidanceCardSectionProps) {
  if (!card) {
    return null;
  }

  return (
    <section
      className={`status-card${
        card.tone === "neutral" ? "" : ` status-card--${card.tone}`
      }`}
      data-theme-local-surface="popup-guidance-card"
    >
      <div className="status-card__header">
        <div>
          <p className="section-label">{runtimeI18n.t("popup.guidance.eyebrow")}</p>
          <h2 className="section-title">{card.headline}</h2>
        </div>
        <StatusBadge
          label={card.label}
          tone={card.tone}
        />
      </div>
      <p className="supporting-copy">{card.detail}</p>
      <div className="popup-actions">
        <button
          className="text-button"
          data-theme-local-surface="popup-guidance-action"
          type="button"
          onClick={() => {
            void onAction(card.action, {
              settingsFocus,
            });
          }}
        >
          {card.action.label}
        </button>
      </div>
    </section>
  );
}
