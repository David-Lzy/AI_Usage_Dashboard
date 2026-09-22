import type { UsageExportResult } from "../../shared/usage-export";
import { buildUsageExportLocalizedCopy } from "../../shared/usage-export-localized-copy";
import type { RuntimeI18n } from "../../shared/i18n";
import { buildUsagePeriodLocalizedCopy } from "../../shared/usage-period-localized-copy";
import { buildUsagePeriodSummary } from "../../shared/usage-periods";
import "./UsagePeriodSummary.css";

type UsagePeriodSummaryProps = {
  result: UsageExportResult;
  i18n: RuntimeI18n;
};

function formatValue(
  value: number | null,
  unit: string,
  currency: string,
  i18n: RuntimeI18n,
  unavailable: string,
) {
  if (value === null) return unavailable;
  if (unit === "currency" && currency) {
    try {
      return new Intl.NumberFormat(i18n.resolvedLocale, {
        style: "currency", currency,
        maximumFractionDigits: Math.abs(value) < 1 && value !== 0 ? 4 : 2,
      }).format(value);
    } catch {
      return `${i18n.formatNumber(value)} ${currency}`;
    }
  }
  return i18n.formatNumber(value);
}

function formatCapturedAt(value: string | null, i18n: RuntimeI18n, unavailable: string) {
  if (!value || !Number.isFinite(Date.parse(value))) return unavailable;
  return new Intl.DateTimeFormat(i18n.resolvedLocale, {
    dateStyle: "medium", timeStyle: "short",
  }).format(new Date(value));
}

export function UsagePeriodSummary({ result, i18n }: UsagePeriodSummaryProps) {
  const copy = buildUsagePeriodLocalizedCopy(i18n.resolvedLocale);
  const exportCopy = buildUsageExportLocalizedCopy(i18n.resolvedLocale);
  const items = buildUsagePeriodSummary(result);

  return (
    <section className="usage-period-summary" data-usage-period-summary="" aria-labelledby="usage-period-summary-title">
      <h3 id="usage-period-summary-title" className="usage-period-summary__title">{copy.summaryTitle}</h3>
      <dl className="usage-period-summary__metadata">
        <div><dt>{exportCopy.sourceTimezone}</dt><dd>{result.sourceTimezone ? exportCopy.timezoneKnown(result.sourceTimezone) : exportCopy.timezoneUnknown}</dd></div>
        <div><dt>{exportCopy.freshness}</dt><dd>{exportCopy.freshnessLabels[result.freshness]}</dd></div>
        <div><dt>{exportCopy.captured}</dt><dd>{formatCapturedAt(result.capturedAt, i18n, exportCopy.unavailable)}</dd></div>
      </dl>
      {items.length === 0 ? <p className="usage-period-summary__empty">{copy.noSummary}</p> : (
        <div className="usage-period-summary__table-region" role="region" tabIndex={0} aria-label={copy.summaryTableLabel}>
          <table>
            <thead><tr><th scope="col">{copy.metric}</th><th scope="col">{copy.series}</th><th scope="col">{copy.value}</th><th scope="col">{copy.coverage}</th></tr></thead>
            <tbody>{items.map((item, index) => {
              const visibleDate = item.lastDate
                ? i18n.formatTemporalValue(item.lastDate) ?? item.lastDate
                : exportCopy.unavailable;
              const observation = item.kind === "latest_observation"
                ? copy.latestObservation(visibleDate)
                : copy.observedTotal;
              return <tr key={`${item.metric}:${item.series}:${item.unit}:${item.currency}:${index}`} data-usage-period-summary-item={item.metric} data-summary-value={item.value ?? ""} data-summary-kind={item.kind} data-summary-date={item.lastDate ?? ""}>
                <th scope="row"><span>{exportCopy.metricLabels[item.metric] ?? exportCopy.unavailable}</span><small>{observation}</small></th>
                <td>{item.series || exportCopy.unavailable}</td>
                <td>{formatValue(item.value, item.unit, item.currency, i18n, exportCopy.unavailable)}<small>{exportCopy.unitLabels[item.unit] ?? exportCopy.unavailable}</small></td>
                <td><span>{item.observedDays} / {item.selectedDays}</span>{item.ambiguous ? <small>{copy.ambiguous}</small> : null}</td>
              </tr>;
            })}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}
