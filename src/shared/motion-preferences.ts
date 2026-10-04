import type { MotionMode } from "../providers/types";

export type ResolvedMotionMode = "full" | "reduced";
export type MotionProfile = "standard" | "expressive" | "reduced";

export const MOTION_PROFILES = {
  standard: { fast: 120, medium: 200, slow: 280, distance: 6, stagger: 0 },
  expressive: { fast: 180, medium: 270, slow: 360, distance: 12, stagger: 30 },
  reduced: { fast: 0, medium: 0, slow: 0, distance: 0, stagger: 0 },
} as const;

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
  { value: "full" },
  { value: "system" },
  { value: "expressive" },
  { value: "reduced" },
];

export function normalizeMotionMode(value: unknown): MotionMode {
  return value === "system" || value === "full" || value === "expressive" || value === "reduced"
    ? value
    : DEFAULT_MOTION_MODE;
}

export function resolveMotionMode(
  value: unknown,
  reader?: MotionPreferenceReader | null,
): ResolvedMotionMode {
  const motionMode = normalizeMotionMode(value);

  if (motionMode === "expressive") return "full";
  if (motionMode === "full" || motionMode === "reduced") {
    return motionMode;
  }

  return reader?.matchMedia?.(REDUCED_MOTION_QUERY).matches
    ? "reduced"
    : "full";
}

export function resolveMotionProfile(
  value: unknown,
  reader?: MotionPreferenceReader | null,
): MotionProfile {
  if (resolveMotionMode(value, reader) === "reduced") return "reduced";
  return normalizeMotionMode(value) === "expressive" ? "expressive" : "standard";
}
