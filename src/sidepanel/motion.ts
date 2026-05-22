import type { MotionMode } from "../providers/types";
import { normalizeMotionMode } from "../shared/motion-preferences";

type MotionPreferenceReader = {
  matchMedia?: (
    query: string,
  ) => {
    matches: boolean;
  };
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion(
  reader: MotionPreferenceReader | null | undefined,
  motionMode: MotionMode = "system",
): boolean {
  const normalizedMotionMode = normalizeMotionMode(motionMode);

  if (normalizedMotionMode === "full") {
    return false;
  }

  if (normalizedMotionMode === "reduced") {
    return true;
  }

  return Boolean(reader?.matchMedia?.(REDUCED_MOTION_QUERY).matches);
}

export function getPreferredScrollBehavior(
  reader: MotionPreferenceReader | null | undefined,
  motionMode: MotionMode = "system",
): ScrollBehavior {
  return prefersReducedMotion(reader, motionMode) ? "auto" : "smooth";
}
