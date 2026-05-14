import type { CSSProperties } from "react";

import type {
  ProgressColorBand,
  ProgressDisplayStyle,
} from "../../providers/types";
import {
  DEFAULT_PROGRESS_COLOR_BANDS,
  DEFAULT_PROGRESS_THICKNESS_PX,
  normalizeProgressThicknessPx,
  resolveProgressColorForRemainingPercent,
} from "../../shared/progress-appearance";
import { UsageProgressRing } from "./UsageProgressRing";

type UsageProgressProps = {
  used: number | null;
  remaining?: number | null;
  total: number | null;
  tone: "neutral" | "warning" | "error";
  label: string;
  displayStyle?: ProgressDisplayStyle;
  progressColorBands?: readonly ProgressColorBand[];
  progressThicknessPx?: number;
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
  progressColorBands = DEFAULT_PROGRESS_COLOR_BANDS,
  progressThicknessPx = DEFAULT_PROGRESS_THICKNESS_PX,
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
  const remainingPercent =
    remaining !== null && remaining !== undefined && total !== null && total > 0
      ? Math.min(100, Math.max(0, (remaining / total) * 100))
      : null;
  const resolvedThicknessPx = normalizeProgressThicknessPx(progressThicknessPx);
  const resolvedProgressColor = resolveProgressColorForRemainingPercent(
    remainingPercent,
    progressColorBands,
  );
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
  const progressStyle = {
    "--usage-progress-thickness": `${resolvedThicknessPx}px`,
    ...(roundedPercent === null
      ? {}
      : {
          "--usage-progress-percent": `${roundedPercent}%`,
        }),
    ...(resolvedProgressColor && !isIndeterminate
      ? {
          "--usage-progress-color": resolvedProgressColor,
        }
      : {}),
  } as CSSProperties & {
    "--usage-progress-color"?: string;
    "--usage-progress-percent"?: string;
    "--usage-progress-thickness": string;
  };

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
        progressColor={resolvedProgressColor}
        progressThicknessPx={resolvedThicknessPx}
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
        style={progressStyle}
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
