import type { SummaryItem } from "../../providers/types";

type SummaryStripProps = {
  ariaLabel?: string;
  items: SummaryItem[];
};

export function SummaryStrip({
  ariaLabel = "Usage summary",
  items,
}: SummaryStripProps) {
  return (
    <section className="summary-strip" aria-label={ariaLabel}>
      {items.map((item) => (
        <article
          key={item.label}
          className={`summary-pill summary-pill--${item.tone}`}
        >
          <p className="summary-pill__label">{item.label}</p>
          <p className="summary-pill__value">{item.value}</p>
        </article>
      ))}
    </section>
  );
}
