import type { RuntimeI18n } from "../shared/i18n";
import type { PopupFeaturedSection as PopupFeaturedSectionModel } from "./view-models";

type PopupFeaturedSectionProps = {
  featuredSection: PopupFeaturedSectionModel;
  runtimeI18n: RuntimeI18n;
};

export function PopupFeaturedSection({
  featuredSection,
  runtimeI18n,
}: PopupFeaturedSectionProps) {
  return (
    <section className="dashboard-section">
      <div className="dashboard-section__header">
        <div>
          <p
            className="section-label"
            data-theme-local-surface="popup-featured-section-label"
          >
            {featuredSection.label}
          </p>
          <h2 className="section-title">{featuredSection.headline}</h2>
        </div>
        <p className="supporting-copy">{featuredSection.detail}</p>
      </div>

      <section className="status-card" data-theme-local-surface="popup-empty-state-card">
        <p className="section-label">{runtimeI18n.t("popup.triage.eyebrow")}</p>
        <h3 className="section-title">
          {featuredSection.emptyStateHeadline}
        </h3>
        <p className="supporting-copy">
          {featuredSection.emptyStateDetail}
        </p>
      </section>
    </section>
  );
}
