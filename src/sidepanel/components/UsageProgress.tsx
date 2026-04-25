type UsageProgressProps = {
  used: number | null;
  remaining?: number | null;
  total: number | null;
  tone: "neutral" | "warning" | "error";
  label: string;
  valueKind?: "used" | "remaining";
  valueLabel?: string;
  valueText?: string;
  detail?: string | null;
};

export function UsageProgress({
  used,
  remaining,
  total,
  tone,
  label,
  valueKind = "used",
  valueLabel,
  valueText,
  detail,
}: UsageProgressProps) {
  const trackedValue =
    valueKind === "remaining"
      ? (remaining ??
        (used !== null && total !== null ? Math.max(total - used, 0) : null))
      : used;
  const percent =
    trackedValue !== null && total !== null && total > 0
      ? Math.min(100, Math.max(0, (trackedValue / total) * 100))
      : null;
  const roundedPercent = percent === null ? null : Math.round(percent);
  const isIndeterminate = roundedPercent === null;
  const progressValueLabel = isIndeterminate
    ? "Unknown"
    : (valueLabel ??
      (valueKind === "remaining" ? `${roundedPercent}% remaining` : `${roundedPercent}%`));
  const progressValueText = isIndeterminate
    ? "Usage percentage unavailable"
    : (valueText ??
      `${roundedPercent}% ${valueKind === "remaining" ? "remaining" : "used"}`);

  return (
    <div
      className={`usage-progress usage-progress--${valueKind}${isIndeterminate ? " usage-progress--indeterminate" : ""}`}
    >
      <div className="usage-progress__meta">
        <p className="supporting-copy">{label}</p>
        <p
          className={`usage-progress__value${isIndeterminate ? " usage-progress__value--indeterminate" : ""}`}
        >
          {progressValueLabel}
        </p>
      </div>

      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={roundedPercent ?? undefined}
        aria-valuetext={progressValueText}
        className={`usage-progress__track usage-progress__track--${tone}${isIndeterminate ? " usage-progress__track--indeterminate" : ""}`}
      >
        <div
          aria-hidden="true"
          className={`usage-progress__fill usage-progress__fill--${tone}${isIndeterminate ? " usage-progress__fill--indeterminate" : ""}`}
          style={
            roundedPercent === null ? undefined : { width: `${roundedPercent}%` }
          }
        />
      </div>
      {detail ? <p className="supporting-copy usage-progress__detail">{detail}</p> : null}
    </div>
  );
}
