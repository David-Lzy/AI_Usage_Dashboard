import type { buildOperatorWorkspaceLocalizedCopy } from "../../shared/localized-copy";

type InteractionAuditGuidanceCopy = ReturnType<
  typeof buildOperatorWorkspaceLocalizedCopy
>["interactionAudit"]["guidance"];

type InteractionAuditGuidanceCardProps = {
  buildAuditUrl: (path: string) => string;
  copy: InteractionAuditGuidanceCopy;
};

export function InteractionAuditGuidanceCard({
  buildAuditUrl,
  copy,
}: InteractionAuditGuidanceCardProps) {
  return (
    <section className="status-card">
      <div className="dashboard-section__header">
        <div>
          <p className="section-label">{copy.eyebrow}</p>
          <h2 className="section-title">{copy.title}</h2>
        </div>
        <p className="supporting-copy">{copy.detail}</p>
      </div>

      <ul className="feature-list interaction-audit__checklist">
        {copy.checks.map((check) => (
          <li key={check}>{check}</li>
        ))}
      </ul>

      <div className="interaction-audit__actions">
        <a
          className="text-button interaction-audit__open-link"
          href={buildAuditUrl("./index.html#dashboard")}
          rel="noreferrer"
          target="_blank"
        >
          {copy.openDashboard}
        </a>
        <a
          className="text-button interaction-audit__open-link"
          href={buildAuditUrl("./index.html#settings")}
          rel="noreferrer"
          target="_blank"
          data-theme-local-surface="audit-open-settings-link"
        >
          {copy.openSettings}
        </a>
        <a
          className="text-button interaction-audit__open-link"
          href={buildAuditUrl("../popup/index.html")}
          rel="noreferrer"
          target="_blank"
        >
          {copy.openPopup}
        </a>
      </div>
    </section>
  );
}
