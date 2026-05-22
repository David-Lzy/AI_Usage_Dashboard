import type { MotionMode } from "../providers/types";

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
