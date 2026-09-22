import { useId, useMemo, useRef, useState } from "react";

import type { AppState } from "../../providers/types";
import {
  buildAggregateUsageLocalizedCopy,
  type GatewayComparisonReason,
} from "../../shared/aggregate-usage-localized-copy";
import { MaterialActionIcon } from "../../shared/components/MaterialActionIcon";
import type { RuntimeI18n } from "../../shared/i18n";
import {
  buildGatewayComparison,
  getDefaultGatewayRange,
  type ComparisonReason,
  type GatewayAggregateMetric,
  type UsageDateRange,
} from "../../shared/usage-aggregates";
import "./DeploymentComparison.css";

type DeploymentComparisonProps = {
  state: Pick<AppState, "providers" | "providerSettings" | "providerAccounts">;
  i18n: RuntimeI18n;
  onRefreshAccount: (accountId: string) => Promise<void>;
};

const DISPLAY_METRICS = [
  "requests",
  "totalTokens",
  "actualCost",
  "referenceCost",
] as const satisfies readonly GatewayAggregateMetric[];

function formatMetric(
  metric: (typeof DISPLAY_METRICS)[number],
  value: { value: number | null; unit: string; currency: string | null },
  i18n: RuntimeI18n,
  unavailable: string,
): string {
  if (value.value === null) {
    return unavailable;
  }

  if (metric === "requests" || metric === "totalTokens") {
    return i18n.formatNumber(value.value);
  }

  if (!value.currency) {
    return unavailable;
  }

  try {
    return new Intl.NumberFormat(i18n.resolvedLocale, {
      style: "currency",
      currency: value.currency,
      maximumFractionDigits: Math.abs(value.value) < 1 && value.value !== 0 ? 4 : 2,
    }).format(value.value);
  } catch {
    return `${i18n.formatNumber(value.value)} ${value.currency}`;
  }
}

function renderMetricReasons(
  reasons: readonly ComparisonReason[],
  copy: ReturnType<typeof buildAggregateUsageLocalizedCopy>,
) {
  const labels = reasons.map((reason) => copy.reasons[reason as GatewayComparisonReason]);
  const compactLabels = labels.slice(0, 2);
  const remaining = labels.length - compactLabels.length;

  return labels.length > 0 ? (
    <small title={labels.join(" · ")}>
      {compactLabels.join(" · ")}{remaining > 0 ? ` +${remaining}` : ""}
    </small>
  ) : null;
}

function formatCapturedAt(
  capturedAt: string | null,
  i18n: RuntimeI18n,
  unavailable: string,
): string {
  if (!capturedAt) {
    return unavailable;
  }

  const timestamp = Date.parse(capturedAt);
  if (!Number.isFinite(timestamp)) {
    return unavailable;
  }

  return new Intl.DateTimeFormat(i18n.resolvedLocale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export function DeploymentComparison({
  state,
  i18n,
  onRefreshAccount,
}: DeploymentComparisonProps) {
  const copy = buildAggregateUsageLocalizedCopy(i18n.resolvedLocale);
  const [range, setRange] = useState<UsageDateRange>(() => getDefaultGatewayRange(state));
  const [pendingAccountIds, setPendingAccountIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const pendingAccountIdsRef = useRef<Set<string>>(new Set());
  const [failedAccountIds, setFailedAccountIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const startInputId = useId();
  const endInputId = useId();
  const invalidRangeId = useId();
  const comparison = useMemo(
    () => buildGatewayComparison(state, range),
    [range, state],
  );

  const metricLabels: Record<(typeof DISPLAY_METRICS)[number], string> = {
    requests: copy.requests,
    totalTokens: copy.totalTokens,
    actualCost: copy.actualCost,
    referenceCost: copy.referenceCost,
  };
  const commonReasons = comparison.metricReasons.requests.filter((reason) =>
    DISPLAY_METRICS.every((metric) => comparison.metricReasons[metric].includes(reason)),
  );

  async function refreshAccount(accountId: string) {
    if (pendingAccountIdsRef.current.has(accountId)) {
      return;
    }

    pendingAccountIdsRef.current.add(accountId);
    setPendingAccountIds((current) => new Set(current).add(accountId));
    setFailedAccountIds((current) => {
      const next = new Set(current);
      next.delete(accountId);
      return next;
    });

    try {
      await onRefreshAccount(accountId);
    } catch {
      setFailedAccountIds((current) => new Set(current).add(accountId));
    } finally {
      pendingAccountIdsRef.current.delete(accountId);
      setPendingAccountIds((current) => {
        const next = new Set(current);
        next.delete(accountId);
        return next;
      });
    }
  }

  return (
    <section className="deployment-comparison" data-deployment-comparison="">
      <header className="deployment-comparison__header">
        <div>
          <p className="section-label">{copy.eyebrow}</p>
          <h2 className="section-title">{copy.title}</h2>
        </div>
        <div className="deployment-comparison__dates">
          <label htmlFor={startInputId}>
            <span>{copy.startDate}</span>
            <input
              id={startInputId}
              aria-describedby={!comparison.rangeValid ? invalidRangeId : undefined}
              aria-invalid={!comparison.rangeValid}
              type="date"
              value={range.start}
              onChange={(event) => setRange((current) => ({ ...current, start: event.target.value }))}
            />
          </label>
          <label htmlFor={endInputId}>
            <span>{copy.endDate}</span>
            <input
              id={endInputId}
              aria-describedby={!comparison.rangeValid ? invalidRangeId : undefined}
              aria-invalid={!comparison.rangeValid}
              type="date"
              value={range.end}
              onChange={(event) => setRange((current) => ({ ...current, end: event.target.value }))}
            />
          </label>
        </div>
      </header>

      {!comparison.rangeValid ? <p className="deployment-comparison__alert" id={invalidRangeId} role="alert" aria-live="polite">{copy.invalidRange}</p> : null}

      {commonReasons.length > 0 ? (
        <p className="deployment-comparison__comparison-status" data-gateway-comparison-status="">
          {commonReasons.map((reason) => copy.reasons[reason as GatewayComparisonReason]).join(" · ")}
        </p>
      ) : null}

      {comparison.rows.length === 0 ? (
        <p className="deployment-comparison__empty">{copy.empty}</p>
      ) : (
        <div className="deployment-comparison__table-region" role="region" tabIndex={0} aria-label={copy.tableLabel}>
          <table>
            <colgroup>
              <col className="deployment-comparison__deployment-column" />
              <col className="deployment-comparison__number-column" />
              <col className="deployment-comparison__number-column" />
              <col className="deployment-comparison__number-column" />
              <col className="deployment-comparison__number-column" />
              <col className="deployment-comparison__coverage-column" />
              <col className="deployment-comparison__capture-column" />
              <col className="deployment-comparison__freshness-column" />
              <col className="deployment-comparison__action-column" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">{copy.deployment}</th>
                {DISPLAY_METRICS.map((metric) => {
                  const reasons = (comparison.metricReasons[metric] ?? []).filter(
                    (reason) => !commonReasons.includes(reason),
                  );
                  return <th key={metric} scope="col"><span data-gateway-comparison-metric={metric}>{metricLabels[metric]}{renderMetricReasons(reasons, copy)}</span></th>;
                })}
                <th scope="col">{copy.coverage}</th>
                <th scope="col">{copy.captured}</th>
                <th scope="col">{copy.freshness}</th>
                <th scope="col"><span className="sr-only">{copy.refresh}</span></th>
              </tr>
            </thead>
            <tbody>
              {comparison.rows.map((row) => {
                const isPending = pendingAccountIds.has(row.accountId);
                const refreshFailed =
                  failedAccountIds.has(row.accountId) || row.syncStatus === "error";
                const refreshDisabled = isPending || !row.connected;
                const refreshTitle = !row.connected
                  ? copy.refreshDisconnected
                  : isPending
                    ? copy.refreshingTitle(row.label)
                    : copy.refreshTitle(row.label);
                const capture = formatCapturedAt(row.capturedAt, i18n, copy.unavailable);
                const timeBasis = row.timezone ? copy.timezoneKnown(row.timezone) : copy.timezoneUnknown;
                return (
                  <tr key={row.accountId} data-deployment-comparison-row={row.accountId}>
                    <th scope="row">
                      <span className="deployment-comparison__deployment-label">{row.label}</span>
                      <span className="deployment-comparison__metadata">{timeBasis}</span>
                      {refreshFailed ? <span className="deployment-comparison__failure">{copy.refreshFailed}</span> : null}
                    </th>
                    {DISPLAY_METRICS.map((metric) => <td key={metric}>{formatMetric(metric, row.metrics[metric], i18n, copy.unavailable)}</td>)}
                    <td>{copy.coverageValue(row.coverage.observedDays, row.coverage.selectedDays)}</td>
                    <td>{capture}</td>
                    <td><span className="deployment-comparison__freshness" data-freshness={row.freshness}>{copy.freshnessValues[row.freshness]}</span></td>
                    <td>
                      <button
                        aria-label={refreshTitle}
                        className="icon-button deployment-comparison__refresh"
                        disabled={refreshDisabled}
                        title={refreshTitle}
                        type="button"
                        onClick={() => void refreshAccount(row.accountId)}
                      >
                        <MaterialActionIcon name="refresh" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
