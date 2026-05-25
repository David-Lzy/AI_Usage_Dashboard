import type { ProviderTone } from "../../providers/types";

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
  if (compact) {
    return (
      <span
        className={`status-chip status-chip--${tone} status-chip--compact`}
        aria-label={label}
        title={label}
      >
        <span aria-hidden="true">{getCompactStatusIcon(tone)}</span>
      </span>
    );
  }

  return <span className={`status-chip status-chip--${tone}`}>{label}</span>;
}
