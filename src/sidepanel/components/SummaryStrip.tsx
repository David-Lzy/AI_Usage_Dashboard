import type { SummaryItem } from "../../providers/types";

type SummaryStripProps = {
  ariaLabel?: string;
  className?: string;
  items: SummaryItem[];
  variant?: "default" | "compact";
};

export function SummaryStrip({
  ariaLabel = "Usage summary",
  className,
  items,
  variant = "default",
}: SummaryStripProps) {
  const classNames = [
    "summary-strip",
    variant === "compact" ? "summary-strip--compact" : null,
    className,
  ]
    .filter((name): name is string => Boolean(name))
    .join(" ");

  return (
    <section className={classNames} aria-label={ariaLabel}>
      {items.map((item) => (
        <article
          key={item.label}
          className={`summary-pill summary-pill--${item.tone}`}
          data-summary-tone={item.tone}
        >
          <p className="summary-pill__label">{item.label}</p>
          <p className="summary-pill__value">{item.value}</p>
        </article>
      ))}
    </section>
  );
}
