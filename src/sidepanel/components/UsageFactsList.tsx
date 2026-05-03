import type { ProviderViewModel } from "../view-models";

type UsageFactsListProps = {
  facts: NonNullable<ProviderViewModel["usageFacts"]>;
  density?: "compact" | "regular";
};

export function UsageFactsList({
  facts,
  density = "regular",
}: UsageFactsListProps) {
  if (facts.length === 0) {
    return null;
  }

  return (
    <div
      className={`usage-facts usage-facts--${density}`}
      aria-label="Visible usage context"
    >
      {facts.map((fact) => (
        <div
          key={`${fact.label}-${fact.value}`}
          className={`usage-fact usage-fact--${fact.tone ?? "neutral"}`}
        >
          <p className="usage-fact__label">{fact.label}</p>
          <p className="usage-fact__value">{fact.value}</p>
          {fact.detail ? (
            <p className="usage-fact__detail">{fact.detail}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
