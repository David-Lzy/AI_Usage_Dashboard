import type { ProgressDisplayStyle } from "../providers/types";

export const DEFAULT_POPUP_PROGRESS_STYLE: ProgressDisplayStyle = "circle-soft";
export const DEFAULT_SIDEBAR_PROGRESS_STYLE: ProgressDisplayStyle = "line";
export const DEFAULT_FULL_PAGE_PROGRESS_STYLE: ProgressDisplayStyle = "line";

export const PROGRESS_DISPLAY_STYLE_OPTIONS: Array<{
  value: ProgressDisplayStyle;
  label: string;
}> = [
  {
    value: "line",
    label: "Line",
  },
  {
    value: "circle",
    label: "Circle",
  },
  {
    value: "circle-soft",
    label: "Soft circle",
  },
  {
    value: "circle-gauge",
    label: "Gauge circle",
  },
];

export function normalizeProgressDisplayStyle(
  value: unknown,
  fallback: ProgressDisplayStyle = "line",
): ProgressDisplayStyle {
  return value === "circle" ||
    value === "circle-soft" ||
    value === "circle-gauge" ||
    value === "line"
    ? value
    : fallback;
}
