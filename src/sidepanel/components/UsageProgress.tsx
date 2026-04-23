type UsageProgressProps = {
  used: number | null;
  total: number | null;
  tone: "neutral" | "warning" | "error";
  label: string;
};

export function UsageProgress({
  used,
  total,
  tone,
  label,
}: UsageProgressProps) {
  const percent =
    used !== null && total !== null && total > 0
      ? Math.min(100, Math.max(0, (used / total) * 100))
      : null;
  const roundedPercent = percent === null ? null : Math.round(percent);
  const isIndeterminate = roundedPercent === null;
  const valueLabel = isIndeterminate ? "Unknown" : `${roundedPercent}%`;
  const valueText = isIndeterminate
    ? "Usage percentage unavailable"
    : `${roundedPercent}% used`;

  return (
    <div
      className={`usage-progress${isIndeterminate ? " usage-progress--indeterminate" : ""}`}
    >
      <div className="usage-progress__meta">
        <p className="supporting-copy">{label}</p>
        <p
          className={`usage-progress__value${isIndeterminate ? " usage-progress__value--indeterminate" : ""}`}
        >
          {valueLabel}
        </p>
      </div>

      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={roundedPercent ?? undefined}
        aria-valuetext={valueText}
        className={`usage-progress__track usage-progress__track--${tone}${isIndeterminate ? " usage-progress__track--indeterminate" : ""}`}
      >
        <div
          aria-hidden="true"
          className={`usage-progress__fill usage-progress__fill--${tone}${isIndeterminate ? " usage-progress__fill--indeterminate" : ""}`}
          style={roundedPercent === null ? undefined : { width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
