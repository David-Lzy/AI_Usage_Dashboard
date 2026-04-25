import type { ProgressDisplayStyle } from "../providers/types";

export const DEFAULT_POPUP_PROGRESS_STYLE: ProgressDisplayStyle = "circle";
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
];

export function normalizeProgressDisplayStyle(
  value: unknown,
  fallback: ProgressDisplayStyle = "line",
): ProgressDisplayStyle {
  return value === "circle" || value === "line" ? value : fallback;
}
