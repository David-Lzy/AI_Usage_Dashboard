import type { CSSProperties } from "react";

import type { ProgressDisplayStyle } from "../../providers/types";

type UsageProgressRingProps = {
  detail?: string | null;
  isIndeterminate: boolean;
  label: string;
  labelSecondary?: string | null;
  progressColor: string | null;
  progressThicknessPx: number;
  roundedPercent: number | null;
  tone: "neutral" | "warning" | "error";
  valueKind: "used" | "remaining";
  valueLabel: string;
  valueText: string;
  variant: Extract<ProgressDisplayStyle, "circle-soft" | "circle-gauge">;
};

const RING_RADIUS = 48;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const GAUGE_RING_ARC_PERCENT = 60;
const GAUGE_RING_MAX_READABLE_GAP_RATIO = 0.14;
const GAUGE_RING_MIN_READABLE_GAP_PX = 12;
const GAUGE_RING_MIN_READABLE_GAP_STROKE_RATIO = 1.6;

function formatSvgNumber(value: number): string {
  return String(Math.round(value * 100) / 100);
}

function getRingArcLength(variant: UsageProgressRingProps["variant"]): number {
  return variant === "circle-gauge" ? GAUGE_RING_ARC_PERCENT : 100;
}

function getRingRotation(variant: UsageProgressRingProps["variant"]): string {
  return variant === "circle-gauge" ? "146deg" : "-90deg";
}

function getRingTrackOpacity(variant: UsageProgressRingProps["variant"]): string {
  return variant === "circle-gauge" ? "0.46" : "1";
}

function getRingFillArcLength(
  variant: UsageProgressRingProps["variant"],
  roundedPercent: number | null,
): number {
  if (roundedPercent === null) {
    return 0;
  }

  return getRingTrackArcLength(variant) * (roundedPercent / 100);
}

function getGaugeReadableGapLength(
  trackArcLength: number,
  progressThicknessPx: number,
): number {
  return Math.min(
    trackArcLength * GAUGE_RING_MAX_READABLE_GAP_RATIO,
    Math.max(
      GAUGE_RING_MIN_READABLE_GAP_PX,
      progressThicknessPx * GAUGE_RING_MIN_READABLE_GAP_STROKE_RATIO,
    ),
  );
}

function getRingVisibleFillArcLength(
  variant: UsageProgressRingProps["variant"],
  roundedPercent: number | null,
  progressThicknessPx: number,
): number {
  const fillArcLength = getRingFillArcLength(variant, roundedPercent);

  if (
    variant !== "circle-gauge" ||
    roundedPercent === null ||
    roundedPercent <= 0 ||
    roundedPercent >= 100
  ) {
    return fillArcLength;
  }

  const trackArcLength = getRingTrackArcLength(variant);
  const minimumReadableGap = getGaugeReadableGapLength(
    trackArcLength,
    progressThicknessPx,
  );

  return Math.min(fillArcLength, Math.max(0, trackArcLength - minimumReadableGap));
}

function getRoundCapDashLength(
  visibleArcLength: number,
  progressThicknessPx: number,
): number {
  if (visibleArcLength <= 0) {
    return 0;
  }

  // SVG round caps add half a stroke at both ends; subtract one stroke so the
  // visible filled arc still matches the quota percent at thick settings.
  return Math.max(0, visibleArcLength - progressThicknessPx);
}

function getRingTrackArcLength(
  variant: UsageProgressRingProps["variant"],
): number {
  return RING_CIRCUMFERENCE * (getRingArcLength(variant) / 100);
}

export function UsageProgressRing({
  detail,
  isIndeterminate,
  label,
  labelSecondary,
  progressColor,
  progressThicknessPx,
  roundedPercent,
  tone,
  valueKind,
  valueLabel,
  valueText,
  variant,
}: UsageProgressRingProps) {
  const arcLength = getRingArcLength(variant);
  const circumference = formatSvgNumber(RING_CIRCUMFERENCE);
  const fillArcLength = formatSvgNumber(
    getRingFillArcLength(variant, roundedPercent),
  );
  const visibleFillArcLength = formatSvgNumber(
    getRingVisibleFillArcLength(variant, roundedPercent, progressThicknessPx),
  );
  const trackArcLength = formatSvgNumber(getRingTrackArcLength(variant));
  const svgTrackArcLength = formatSvgNumber(
    getRoundCapDashLength(getRingTrackArcLength(variant), progressThicknessPx),
  );
  const svgFillArcLength = formatSvgNumber(
    getRoundCapDashLength(
      getRingVisibleFillArcLength(variant, roundedPercent, progressThicknessPx),
      progressThicknessPx,
    ),
  );
  const ringStyle = {
    "--usage-progress-ring-arc": String(arcLength),
    "--usage-progress-ring-circumference": circumference,
    "--usage-progress-ring-fill-arc": fillArcLength,
    "--usage-progress-ring-percent": `${roundedPercent ?? 0}%`,
    "--usage-progress-ring-rotation": getRingRotation(variant),
    "--usage-progress-ring-stroke": String(progressThicknessPx),
    "--usage-progress-ring-stroke-px": `${progressThicknessPx}px`,
    "--usage-progress-ring-track-arc": trackArcLength,
    "--usage-progress-ring-track-opacity": getRingTrackOpacity(variant),
    "--usage-progress-ring-visible-fill-arc": visibleFillArcLength,
    ...(progressColor && !isIndeterminate
      ? {
          "--usage-progress-ring-fill": progressColor,
        }
      : {}),
  } as CSSProperties & {
    "--usage-progress-ring-arc": string;
    "--usage-progress-ring-circumference": string;
    "--usage-progress-ring-fill"?: string;
    "--usage-progress-ring-fill-arc": string;
    "--usage-progress-ring-percent": string;
    "--usage-progress-ring-rotation": string;
    "--usage-progress-ring-stroke": string;
    "--usage-progress-ring-stroke-px": string;
    "--usage-progress-ring-track-arc": string;
    "--usage-progress-ring-track-opacity": string;
    "--usage-progress-ring-visible-fill-arc": string;
  };
  const trackDasharray = `${svgTrackArcLength} ${circumference}`;
  const fillDasharray = `${svgFillArcLength} ${circumference}`;
  const accessibleLabel = labelSecondary
    ? `${label}. ${labelSecondary}`
    : label;

  return (
    <div
      className={`usage-progress usage-progress--${valueKind} usage-progress--circle usage-progress--${variant}${isIndeterminate ? " usage-progress--indeterminate" : ""}`}
    >
      <div
        role="progressbar"
        aria-label={accessibleLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={roundedPercent ?? undefined}
        aria-valuetext={valueText}
        className={`usage-progress-ring usage-progress-ring--${variant} usage-progress-ring--${tone}${isIndeterminate ? " usage-progress-ring--indeterminate" : ""}`}
        style={ringStyle}
      >
        {variant === "circle-gauge" ? (
          <svg
            className="usage-progress-ring__svg"
            viewBox="0 0 120 120"
            aria-hidden="true"
          >
            <circle
              className="usage-progress-ring__track"
              cx="60"
              cy="60"
              r={RING_RADIUS}
              strokeDasharray={trackDasharray}
            />
            <circle
              className="usage-progress-ring__fill"
              cx="60"
              cy="60"
              r={RING_RADIUS}
              strokeDasharray={fillDasharray}
            />
          </svg>
        ) : null}
        <span className="usage-progress-ring__value">{valueLabel}</span>
      </div>
      <p className="usage-progress__ring-label">
        <span className="usage-progress__label-name">{label}</span>
        {labelSecondary ? (
          <span className="usage-progress__label-reset">{labelSecondary}</span>
        ) : null}
      </p>
      {detail ? <p className="supporting-copy usage-progress__detail">{detail}</p> : null}
    </div>
  );
}
