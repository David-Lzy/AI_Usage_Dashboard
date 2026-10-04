import type { ProviderTone } from "../../providers/types";
import { useRef } from "react";
import { useMotionEntrance } from "../use-motion-effects";

type StatusBadgeProps = {
  compact?: boolean;
  label: string;
  tone: ProviderTone;
};

function getCompactStatusIcon(tone: ProviderTone): string {
  switch (tone) {
    case "error":
      return "x";
    case "warning":
      return "!";
    case "neutral":
      return "✓";
  }
}

export function StatusBadge({
  compact = false,
  label,
  tone,
}: StatusBadgeProps) {
  const ref = useRef<HTMLSpanElement>(null);
  useMotionEntrance(ref, `${tone}:${label}`, true);
  if (compact) {
    return (
      <span
        ref={ref}
        className={`status-chip status-chip--${tone} status-chip--compact`}
        aria-label={label}
        title={label}
      >
        <span aria-hidden="true">{getCompactStatusIcon(tone)}</span>
      </span>
    );
  }

  return <span ref={ref} className={`status-chip status-chip--${tone}`}>{label}</span>;
}
