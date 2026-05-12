import type { ProgressDisplayStyle } from "../providers/types";
import type { RuntimeI18n } from "../shared/i18n";
import { StatusBadge } from "../sidepanel/components/StatusBadge";
import type { SettingsRouteFocus } from "../sidepanel/route-state";
import { PopupProviderProgress } from "./PopupProviderProgress";
import { shouldShowPopupProviderProgress } from "./progress-visibility";
import type {
  PopupFeaturedProviderCard,
  PopupGuidanceAction,
} from "./view-models";

type PopupFeaturedProviderListProps = {
  ariaLabel: string;
  cards: PopupFeaturedProviderCard[];
  i18n: RuntimeI18n;
  progressDisplayStyle: ProgressDisplayStyle;
  getSettingsFocusForProvider: (
    provider: PopupFeaturedProviderCard["provider"],
  ) => SettingsRouteFocus | null;
  onAction: (
    action: PopupGuidanceAction,
    options?: { settingsFocus?: SettingsRouteFocus | null },
  ) => void | Promise<void>;
};

export function PopupFeaturedProviderList({
  ariaLabel,
  cards,
  i18n,
  progressDisplayStyle,
  getSettingsFocusForProvider,
  onAction,
}: PopupFeaturedProviderListProps) {
  if (cards.length === 0) {
    return null;
  }

  return (
    <section className="popup-quota-section" aria-label={ariaLabel}>
      <div className="popup-provider-list">
        {cards.map((card, index) => {
          const { provider } = card;
          const providerProgress = (
            <PopupProviderProgress
              provider={provider}
              progressDisplayStyle={progressDisplayStyle}
              i18n={i18n}
            />
          );
          const hasProviderProgress = shouldShowPopupProviderProgress(provider);

          return (
            <article
              key={provider.providerId}
              className={`popup-provider-card popup-provider-card--${provider.displayTone}${
                hasProviderProgress ? " popup-provider-card--quota-first" : ""
              }`}
              data-theme-local-surface={
                index === 0 ? "popup-first-provider-card" : undefined
              }
            >
              <div className="popup-provider-card__header">
                <div>
                  <p className="popup-provider-card__provider">
                    {provider.providerLabel}
                  </p>
                  {!hasProviderProgress ? (
                    <p className="popup-provider-card__plan">
                      {provider.planName}
                    </p>
                  ) : null}
                </div>
                <div data-popup-featured-status={index === 0 ? "true" : undefined}>
                  <StatusBadge
                    label={card.statusLabel}
                    tone={provider.displayTone}
                  />
                </div>
              </div>

              {hasProviderProgress ? (
                <div
                  className={`popup-provider-card__progress popup-provider-card__progress--${progressDisplayStyle}`}
                  data-popup-featured-progress={
                    index === 0 ? "true" : undefined
                  }
                >
                  {providerProgress}
                </div>
              ) : (
                <>
                  <div
                    className="popup-provider-card__chips"
                    data-popup-featured-chips={index === 0 ? "true" : undefined}
                  >
                    {card.metaChips.map((chipLabel) => (
                      <span key={chipLabel} className="meta-chip">
                        {chipLabel}
                      </span>
                    ))}
                  </div>
                  <p
                    className="supporting-copy"
                    data-popup-featured-primary={
                      index === 0 ? "true" : undefined
                    }
                  >
                    {card.primaryDetail}
                  </p>
                  <p
                    className="supporting-copy"
                    data-popup-featured-secondary={
                      index === 0 ? "true" : undefined
                    }
                  >
                    {card.secondaryDetail}
                  </p>
                </>
              )}

              <div className="popup-actions">
                <button
                  className="text-button"
                  data-theme-local-surface={
                    index === 0 ? "popup-first-open-detail" : undefined
                  }
                  data-popup-featured-action={index === 0 ? "true" : undefined}
                  type="button"
                  onClick={() => {
                    void onAction(card.action, {
                      settingsFocus:
                        card.action.kind === "settings"
                          ? getSettingsFocusForProvider(provider)
                          : null,
                    });
                  }}
                >
                  {card.action.label}
                </button>
                <button
                  className="text-button"
                  data-popup-hide-provider={provider.providerId}
                  type="button"
                  onClick={() => {
                    void onAction(card.secondaryAction);
                  }}
                >
                  {card.secondaryAction.label}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
