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
): boolean {
  return Boolean(reader?.matchMedia?.(REDUCED_MOTION_QUERY).matches);
}

export function getPreferredScrollBehavior(
  reader: MotionPreferenceReader | null | undefined,
): ScrollBehavior {
  return prefersReducedMotion(reader) ? "auto" : "smooth";
}
