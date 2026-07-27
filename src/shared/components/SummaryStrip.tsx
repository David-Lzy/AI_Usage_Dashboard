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
    <section
      className={classNames}
      aria-label={ariaLabel}
      data-i18n-layout-contract={
        variant === "compact" ? "compact-summary" : undefined
      }
    >
      {items.map((item) => (
        <article
          key={item.label}
          className={`summary-pill summary-pill--${item.tone}`}
          data-summary-tone={item.tone}
        >
          <p className="summary-pill__label" data-i18n-summary-label>
            {item.label}
          </p>
          <p className="summary-pill__value" data-i18n-summary-value>
            {item.value}
          </p>
        </article>
      ))}
    </section>
  );
}
