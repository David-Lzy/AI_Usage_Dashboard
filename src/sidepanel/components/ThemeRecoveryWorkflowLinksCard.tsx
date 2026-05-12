import type { buildOperatorWorkspaceLocalizedCopy } from "../../shared/localized-copy";

type ThemeRecoveryCopy = ReturnType<
  typeof buildOperatorWorkspaceLocalizedCopy
>["themeRecovery"];

type ThemeRecoveryWorkflowLinksCardProps = {
  linksCopy: ThemeRecoveryCopy["links"];
  workflowCopy: ThemeRecoveryCopy["workflow"];
};

const SIDE_PANEL_ROUTE_LINKS = [
  {
    id: "settings",
    href: "./index.html#settings",
  },
  {
    id: "dashboard",
    href: "./index.html#dashboard",
  },
  {
    id: "cursor-detail",
    href: "./index.html#provider-detail/cursor",
  },
  {
    id: "codex-detail",
    href: "./index.html#provider-detail/codex",
  },
  {
    id: "popup",
    href: "../popup/index.html",
  },
] as const;

const VENDOR_ROUTE_LINKS = [
  {
    id: "cursor-session-page",
    href: "https://cursor.com/dashboard/usage",
  },
  {
    id: "codex-session-page",
    href: "https://chatgpt.com/codex/cloud/settings/analytics#usage",
  },
] as const;

export function ThemeRecoveryWorkflowLinksCard({
  linksCopy,
  workflowCopy,
}: ThemeRecoveryWorkflowLinksCardProps) {
  return (
    <section className="status-card">
      <div className="dashboard-section__header">
        <div>
          <p className="section-label">{workflowCopy.eyebrow}</p>
          <h2 className="section-title">{workflowCopy.title}</h2>
        </div>
        <p className="supporting-copy">{workflowCopy.detail}</p>
      </div>

      <ol className="feature-list theme-recovery-checklist">
        {workflowCopy.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <div className="theme-recovery-link-groups">
        <div className="theme-recovery-link-group">
          <p className="detail-note__label">
            {workflowCopy.extensionSurfaces}
          </p>
          <div className="interaction-audit__actions">
            {SIDE_PANEL_ROUTE_LINKS.map((link) => (
              <a
                key={link.id}
                className="text-button interaction-audit__open-link"
                data-theme-recovery-link={link.id}
                href={link.href}
                rel="noreferrer"
                target="_blank"
              >
                {linksCopy.sidePanel[link.id]}
              </a>
            ))}
          </div>
        </div>

        <div className="theme-recovery-link-group">
          <p className="detail-note__label">
            {workflowCopy.vendorSessionPages}
          </p>
          <div className="interaction-audit__actions">
            {VENDOR_ROUTE_LINKS.map((link) => (
              <a
                key={link.id}
                className="text-button interaction-audit__open-link"
                data-theme-recovery-vendor-link={link.id}
                href={link.href}
                rel="noreferrer"
                target="_blank"
              >
                {linksCopy.vendor[link.id]}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
