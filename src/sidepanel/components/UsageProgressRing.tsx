import type { CSSProperties } from "react";

import type { ProgressDisplayStyle } from "../../providers/types";

type UsageProgressRingProps = {
  detail?: string | null;
  isIndeterminate: boolean;
  label: string;
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

function formatSvgNumber(value: number): string {
  return String(Math.round(value * 100) / 100);
}

function getRingArcLength(variant: UsageProgressRingProps["variant"]): number {
  return variant === "circle-gauge" ? 68 : 100;
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

function getRingTrackArcLength(
  variant: UsageProgressRingProps["variant"],
): number {
  return RING_CIRCUMFERENCE * (getRingArcLength(variant) / 100);
}

export function UsageProgressRing({
  detail,
  isIndeterminate,
  label,
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
  const trackArcLength = formatSvgNumber(getRingTrackArcLength(variant));
  const ringStyle = {
    "--usage-progress-ring-arc": String(arcLength),
    "--usage-progress-ring-circumference": circumference,
    "--usage-progress-ring-fill-arc": fillArcLength,
    "--usage-progress-ring-rotation": getRingRotation(variant),
    "--usage-progress-ring-stroke": String(progressThicknessPx),
    "--usage-progress-ring-track-arc": trackArcLength,
    "--usage-progress-ring-track-opacity": getRingTrackOpacity(variant),
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
    "--usage-progress-ring-rotation": string;
    "--usage-progress-ring-stroke": string;
    "--usage-progress-ring-track-arc": string;
    "--usage-progress-ring-track-opacity": string;
  };
  const trackDasharray = `${trackArcLength} ${circumference}`;
  const fillDasharray = `${fillArcLength} ${circumference}`;

  return (
    <div
      className={`usage-progress usage-progress--${valueKind} usage-progress--circle usage-progress--${variant}${isIndeterminate ? " usage-progress--indeterminate" : ""}`}
    >
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={roundedPercent ?? undefined}
        aria-valuetext={valueText}
        className={`usage-progress-ring usage-progress-ring--${variant} usage-progress-ring--${tone}${isIndeterminate ? " usage-progress-ring--indeterminate" : ""}`}
        style={ringStyle}
      >
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
        <span className="usage-progress-ring__value">{valueLabel}</span>
      </div>
      <p className="usage-progress__ring-label">{label}</p>
      {detail ? <p className="supporting-copy usage-progress__detail">{detail}</p> : null}
    </div>
  );
}
