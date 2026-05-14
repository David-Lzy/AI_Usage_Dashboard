import type { CSSProperties } from "react";

import type { ProgressDisplayStyle } from "../../providers/types";
import { UsageProgressRing } from "./UsageProgressRing";

type UsageProgressProps = {
  used: number | null;
  remaining?: number | null;
  total: number | null;
  tone: "neutral" | "warning" | "error";
  label: string;
  displayStyle?: ProgressDisplayStyle;
  valueKind?: "used" | "remaining";
  valueLabel?: string;
  valueText?: string;
  detail?: string | null;
};

function isCircularProgressStyle(
  displayStyle: ProgressDisplayStyle,
): displayStyle is "circle" | "circle-soft" | "circle-gauge" {
  return (
    displayStyle === "circle" ||
    displayStyle === "circle-soft" ||
    displayStyle === "circle-gauge"
  );
}

export function UsageProgress({
  used,
  remaining,
  total,
  tone,
  label,
  displayStyle = "line",
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
    : isCircularProgressStyle(displayStyle)
      ? `${roundedPercent}%`
      : (valueLabel ??
        (valueKind === "remaining"
          ? `${roundedPercent}% remaining`
          : `${roundedPercent}%`));
  const progressValueText = isIndeterminate
    ? "Usage percentage unavailable"
    : (valueText ??
      `${roundedPercent}% ${valueKind === "remaining" ? "remaining" : "used"}`);
  const progressStyle =
    roundedPercent === null
      ? undefined
      : ({
          "--usage-progress-percent": `${roundedPercent}%`,
        } as CSSProperties & { "--usage-progress-percent": string });

  if (displayStyle === "circle") {
    return (
      <div
        className={`usage-progress usage-progress--${valueKind} usage-progress--circle${isIndeterminate ? " usage-progress--indeterminate" : ""}`}
      >
        <div
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={roundedPercent ?? undefined}
          aria-valuetext={progressValueText}
          className={`usage-progress__ring usage-progress__ring--${tone}${isIndeterminate ? " usage-progress__ring--indeterminate" : ""}`}
          style={progressStyle}
        >
          <span className="usage-progress__ring-value">
            {progressValueLabel}
          </span>
        </div>
        <p className="usage-progress__ring-label">{label}</p>
        {detail ? <p className="supporting-copy usage-progress__detail">{detail}</p> : null}
      </div>
    );
  }

  if (displayStyle === "circle-soft" || displayStyle === "circle-gauge") {
    return (
      <UsageProgressRing
        detail={detail}
        isIndeterminate={isIndeterminate}
        label={label}
        roundedPercent={roundedPercent}
        tone={tone}
        valueKind={valueKind}
        valueLabel={progressValueLabel}
        valueText={progressValueText}
        variant={displayStyle}
      />
    );
  }

  return (
    <div
      className={`usage-progress usage-progress--${valueKind}${isIndeterminate ? " usage-progress--indeterminate" : ""}`}
    >
      <div className="usage-progress__meta">
        <p className="supporting-copy usage-progress__label">
          <span>{label}</span>
          {detail ? (
            <span className="usage-progress__meta-detail"> · {detail}</span>
          ) : null}
        </p>
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
    </div>
  );
}
