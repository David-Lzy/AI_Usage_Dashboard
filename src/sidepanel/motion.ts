import type { MotionMode } from "../providers/types";
import {
  resolveMotionMode,
  type MotionPreferenceReader,
} from "../shared/motion-preferences";

export function prefersReducedMotion(
  reader: MotionPreferenceReader | null | undefined,
  motionMode: MotionMode = "system",
): boolean {
  return resolveMotionMode(motionMode, reader) === "reduced";
}

export function getPreferredScrollBehavior(
  reader: MotionPreferenceReader | null | undefined,
  motionMode: MotionMode = "system",
): ScrollBehavior {
  return prefersReducedMotion(reader, motionMode) ? "auto" : "smooth";
}
