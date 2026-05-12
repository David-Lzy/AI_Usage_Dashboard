import type { PopupSurfaceRolesCard } from "./view-models";

type PopupSurfaceRolesSectionProps = {
  surfaceRolesCard: PopupSurfaceRolesCard;
};

export function PopupSurfaceRolesSection({
  surfaceRolesCard,
}: PopupSurfaceRolesSectionProps) {
  return (
    <section
      className="status-card"
      data-theme-local-surface="popup-contract-card"
    >
      <p className="section-label">{surfaceRolesCard.label}</p>
      <h2
        className="section-title"
        data-popup-surface-roles-headline="true"
      >
        {surfaceRolesCard.headline}
      </h2>
      <p className="supporting-copy" data-popup-surface-roles-detail="true">
        {surfaceRolesCard.detail}
      </p>
    </section>
  );
}
