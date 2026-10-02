import type { ResolvedAppLocale } from "../../shared/i18n";
import { getSettingsSaveCopy } from "../../shared/settings-save-localized-copy";
import { MaterialActionIcon } from "../../shared/components/MaterialActionIcon";
import type { SettingsSaveStatus } from "../settings-save-feedback";

export function SettingsSaveFeedback({
  status,
  locale,
  onRetry,
}: {
  status: SettingsSaveStatus;
  locale: ResolvedAppLocale;
  onRetry: () => void;
}) {
  const copy = getSettingsSaveCopy(locale);
  return (
    <div className="settings-save-feedback" data-settings-save-status={status}>
      <span role="status" aria-live="polite" aria-atomic="true">
        {status === "idle" ? "" : copy[status]}
      </span>
      {status === "error" && (
        <button
          type="button"
          className="icon-button"
          title={copy.retry}
          aria-label={copy.retry}
          onClick={onRetry}
        >
          <MaterialActionIcon name="refresh" />
        </button>
      )}
    </div>
  );
}
