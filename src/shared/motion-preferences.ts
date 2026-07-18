import type { MotionMode } from "../providers/types";

export type ResolvedMotionMode = "full" | "reduced";

export type MotionPreferenceReader = {
  matchMedia?: (
    query: string,
  ) => {
    matches: boolean;
  };
};

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export const DEFAULT_MOTION_MODE: MotionMode = "full";

export const MOTION_MODE_OPTIONS: Array<{ value: MotionMode }> = [
  { value: "system" },
  { value: "full" },
  { value: "reduced" },
];

export function normalizeMotionMode(value: unknown): MotionMode {
  return value === "system" || value === "full" || value === "reduced"
    ? value
    : DEFAULT_MOTION_MODE;
}

export function resolveMotionMode(
  value: unknown,
  reader?: MotionPreferenceReader | null,
): ResolvedMotionMode {
  const motionMode = normalizeMotionMode(value);

  if (motionMode === "full" || motionMode === "reduced") {
    return motionMode;
  }

  return reader?.matchMedia?.(REDUCED_MOTION_QUERY).matches
    ? "reduced"
    : "full";
}
