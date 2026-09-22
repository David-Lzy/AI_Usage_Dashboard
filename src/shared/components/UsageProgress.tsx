import type { CSSProperties } from "react";

import type {
  ProgressColorAppearance,
  ProgressColorBand,
  ProgressDisplayStyle,
} from "../../providers/types";
import { createRuntimeI18n, type RuntimeI18n } from "../i18n";
import {
  DEFAULT_PROGRESS_COLOR_BANDS,
  DEFAULT_PROGRESS_THICKNESS_PX,
  normalizeProgressThicknessPx,
  resolveProgressColorForAppearance,
} from "../progress-appearance";
import { isCircularProgressDisplayStyle } from "../progress-display";
import { buildUsageProgressLocalizedCopy } from "../usage-progress-localized-copy";
import { UsageProgressRing } from "./UsageProgressRing";
import { ProgressRingValue } from "./ProgressRingValue";

type UsageProgressProps = {
  used: number | null;
  remaining?: number | null;
  total: number | null;
  tone: "neutral" | "warning" | "error";
  label: string;
  labelSecondary?: string | null;
  displayStyle?: ProgressDisplayStyle;
  progressColorAppearance?: ProgressColorAppearance;
  progressColorBands?: readonly ProgressColorBand[];
  progressThicknessPx?: number;
  valueKind?: "used" | "remaining";
  valueLabel?: string;
  valueText?: string;
  detail?: string | null;
  i18n?: RuntimeI18n;
};

export function UsageProgress({
  used,
  remaining,
  total,
  tone,
  label,
  labelSecondary,
  displayStyle = "line",
  progressColorAppearance,
  progressColorBands = DEFAULT_PROGRESS_COLOR_BANDS,
  progressThicknessPx = DEFAULT_PROGRESS_THICKNESS_PX,
  valueKind = "used",
  valueLabel,
  valueText,
  detail,
  i18n = createRuntimeI18n(
    "system",
    typeof window !== "undefined" ? window : undefined,
  ),
}: UsageProgressProps) {
  const trackedValue =
    valueKind === "remaining"
      ? (remaining ??
        (used !== null && total !== null ? Math.max(total - used, 0) : null))
      : used;
  const percent =
    trackedValue !== null && Number.isFinite(trackedValue) && total !== null && Number.isFinite(total) && total > 0
      ? Math.min(100, Math.max(0, (trackedValue / total) * 100))
      : null;
  const roundedPercent = percent === null ? null : Math.round(percent);
  const remainingPercent =
    remaining !== null && remaining !== undefined && Number.isFinite(remaining) && total !== null && Number.isFinite(total) && total > 0
      ? Math.min(100, Math.max(0, (remaining / total) * 100))
      : null;
  const resolvedThicknessPx = normalizeProgressThicknessPx(progressThicknessPx);
  const resolvedProgressColor = resolveProgressColorForAppearance(
    remainingPercent,
    progressColorAppearance,
    progressColorBands,
  );
  const isIndeterminate = roundedPercent === null;
  const copy = buildUsageProgressLocalizedCopy(i18n.resolvedLocale);
  const formattedPercent = i18n.formatPercentValue(roundedPercent ?? 0);
  const progressValueLabel = isIndeterminate
    ? (valueLabel ?? copy.unknown)
    : isCircularProgressDisplayStyle(displayStyle)
      ? formattedPercent
      : (valueLabel ??
        (valueKind === "remaining"
          ? copy.remainingValue(formattedPercent)
          : copy.usedValue(formattedPercent)));
  const progressValueText = isIndeterminate
    ? (valueText ?? copy.percentageUnavailable)
    : (valueText ??
      (valueKind === "remaining"
        ? copy.remainingValue(formattedPercent)
        : copy.usedValue(formattedPercent)));
  const accessibleLabel = labelSecondary
    ? `${label}. ${labelSecondary}`
    : label;
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
          aria-label={accessibleLabel}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={roundedPercent ?? undefined}
          aria-valuetext={progressValueText}
          className={`usage-progress__ring usage-progress__ring--${tone}${isIndeterminate ? " usage-progress__ring--indeterminate" : ""}`}
          style={progressStyle}
        >
          <ProgressRingValue className="usage-progress__ring-value" value={progressValueLabel} inset={resolvedThicknessPx + 3} />
        </div>
        <p className="usage-progress__ring-label">
          <span className="usage-progress__label-name">{label}</span>
          {labelSecondary ? (
            <span className="usage-progress__label-reset">
              {labelSecondary}
            </span>
          ) : null}
        </p>
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
        labelSecondary={labelSecondary}
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
          <span className="usage-progress__label-name">{label}</span>
          {labelSecondary ? (
            <span className="usage-progress__label-reset">
              {labelSecondary}
            </span>
          ) : null}
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
        aria-label={accessibleLabel}
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
