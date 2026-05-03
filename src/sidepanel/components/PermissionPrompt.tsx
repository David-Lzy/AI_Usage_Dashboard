export type PermissionPromptLabels = {
  noHostAccessRequired: string;
  hostAccessGranted: string;
  hostAccessMissing: string;
  noActionNeeded: string;
  removeAccess: string;
  requestAccess: string;
};

type PermissionPromptProps = {
  providerId: string;
  providerLabel: string;
  description: string;
  hostsLabel: string;
  requiresHostAccess: boolean;
  status: "granted" | "missing";
  labels: PermissionPromptLabels;
  onToggle: () => void;
};

export function PermissionPrompt({
  providerId,
  providerLabel,
  description,
  hostsLabel,
  requiresHostAccess,
  status,
  labels,
  onToggle,
}: PermissionPromptProps) {
  const isGranted = status === "granted";
  const isActionDisabled = !requiresHostAccess;
  const statusLabel = !requiresHostAccess
    ? labels.noHostAccessRequired
    : isGranted
      ? labels.hostAccessGranted
      : labels.hostAccessMissing;
  const actionLabel = !requiresHostAccess
    ? labels.noActionNeeded
    : isGranted
      ? labels.removeAccess
      : labels.requestAccess;
  const toneClassName =
    requiresHostAccess && !isGranted ? " permission-prompt--warning" : "";

  return (
    <article
      className={`permission-prompt${toneClassName}`}
      data-provider-id={providerId}
      data-permission-status={status}
      data-requires-host-access={requiresHostAccess ? "true" : "false"}
    >
      <div className="permission-prompt__header">
        <div>
          <p className="permission-prompt__provider">{providerLabel}</p>
          <p className="supporting-copy">{description}</p>
        </div>
        <span
          className={`${!requiresHostAccess || isGranted ? "meta-chip" : "meta-chip meta-chip--warning"}`.trim()}
        >
          {statusLabel}
        </span>
      </div>

      <div className="permission-prompt__body">
        <p className="permission-prompt__hosts">{hostsLabel}</p>
      </div>

      <div className="permission-prompt__footer">
        <button
          className="text-button"
          type="button"
          onClick={onToggle}
          disabled={isActionDisabled}
          data-provider-id={providerId}
          data-permission-action={
            !requiresHostAccess ? "none" : isGranted ? "remove" : "request"
          }
        >
          {actionLabel}
        </button>
      </div>
    </article>
  );
}
