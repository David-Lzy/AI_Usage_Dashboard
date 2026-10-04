import type { ResolvedAppLocale } from "../../shared/i18n";
import { getSettingsSaveCopy } from "../../shared/settings-save-localized-copy";
import { MaterialActionIcon } from "../../shared/components/MaterialActionIcon";
import type { SettingsSaveStatus } from "../settings-save-feedback";
import { useRef } from "react";
import { useMotionEntrance } from "../../shared/use-motion-effects";
import { StatusBadge } from "../../shared/components/StatusBadge";

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
  const ref = useRef<HTMLSpanElement | null>(null);
  useMotionEntrance(ref, status, true);
  return (
    <div className="settings-save-feedback" data-settings-save-status={status}>
      {status !== "idle" && <span className="settings-save-feedback__icon" aria-hidden="true" key={status}>
        {status === "pending" ? <MaterialActionIcon name="refresh" /> : <StatusBadge compact label={copy[status]} tone={status === "saved" ? "neutral" : "error"} />}
      </span>}
      <span ref={ref} role="status" aria-live="polite" aria-atomic="true">
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
