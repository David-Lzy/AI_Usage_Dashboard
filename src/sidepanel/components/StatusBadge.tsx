import type { ProviderTone } from "../../providers/types";

type StatusBadgeProps = {
  label: string;
  tone: ProviderTone;
};

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return <span className={`status-chip status-chip--${tone}`}>{label}</span>;
}
