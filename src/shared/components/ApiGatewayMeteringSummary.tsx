import { Fragment, useMemo, useState, type ReactNode } from "react";

import type {
  ApiGatewayMeteringDisplayPreferences,
  ApiGatewayMeteringModuleId,
  ApiGatewayMeteringSnapshot,
  ApiGatewayUsageMetric,
  DisplaySurface,
  ProviderAccountId,
  ProviderId,
} from "../../providers/types";
import { TechnicalText } from "./TechnicalText";
import {
  createDefaultApiGatewayMeteringDisplayPreferences,
  deriveApiGatewayReferenceSavings,
  normalizeApiGatewayMeteringDisplayPreferences,
} from "../api-gateway-metering";
import type { ApiGatewayMeteringLocalizedCopy } from "../api-gateway-metering-localized-copy";
import {
  readApiGatewayModuleCollapsed,
  readApiGatewayTrendMetric,
  readApiGatewayTrendRangeDays,
  writeApiGatewayModuleCollapsed,
  writeApiGatewayTrendMetric,
  writeApiGatewayTrendRangeDays,
  type ApiGatewayTrendMetric,
  type ApiGatewayTrendRangeDays,
} from "../api-gateway-metering-ui-preferences";
import {
  UsageCompositionSvg,
  UsageHistoryLegend,
  UsageHistorySvg,
} from "./UsageHistoryCharts";
import {
  buildCompactModels,
  buildLegendData,
  buildTrendData,
  formatDuration,
  formatMoney,
  formatNumber,
  formatReset,
  formatSelectedDateRange,
  getPrimaryMetric,
  sumMoney,
  sumNumbers,
} from "../api-gateway-metering-presentation";
import { ApiGatewayDeploymentSelector } from "./ApiGatewayDeploymentSelector";
import "./api-gateway-metering-summary.css";

export { ApiGatewayDeploymentSelector } from "./ApiGatewayDeploymentSelector";

type ApiGatewayMeteringSummaryProps = {
  copy: ApiGatewayMeteringLocalizedCopy;
  locale: string;
  metering: ApiGatewayMeteringSnapshot;
  preferences?: ApiGatewayMeteringDisplayPreferences;
  providerId: ProviderId;
  surface: DisplaySurface;
  density?: "compact" | "detail";
  deploymentOptions?: readonly Readonly<{
    id: ProviderAccountId;
    label: string;
  }>[];
  activeDeploymentId?: ProviderAccountId | null;
  onSelectDeployment?: (accountId: ProviderAccountId) => void;
  showDeploymentSelector?: boolean;
};

function ModuleToggle({
  copy,
  expanded,
  onToggle,
}: {
  copy: ApiGatewayMeteringLocalizedCopy;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      aria-expanded={expanded}
      aria-label={expanded ? copy.collapse : copy.expand}
      className="icon-button api-gateway-metering-module__collapse-toggle"
      title={expanded ? copy.collapse : copy.expand}
      type="button"
      onClick={onToggle}
    >
      <span className="api-gateway-metering-module__collapse-icon" aria-hidden="true" />
    </button>
  );
}

function useExpandedModule(
  providerId: ProviderId,
  accountId: ApiGatewayMeteringSnapshot["accountId"],
  surface: DisplaySurface,
  moduleId: ApiGatewayMeteringModuleId,
) {
  const [expanded, setExpanded] = useState(
    () => !readApiGatewayModuleCollapsed(providerId, accountId, surface, moduleId),
  );
  const update = (next: boolean) => {
    setExpanded(next);
    writeApiGatewayModuleCollapsed(providerId, accountId, surface, moduleId, !next);
  };
  return [expanded, update] as const;
}

function MeteringModule({
  children,
  copy,
  expanded,
  headerAccessory,
  headingAccessory,
  moduleId,
  onToggle,
  title,
}: {
  children: ReactNode;
  copy: ApiGatewayMeteringLocalizedCopy;
  expanded: boolean;
  headerAccessory?: ReactNode;
  headingAccessory?: ReactNode;
  moduleId: ApiGatewayMeteringModuleId;
  onToggle: () => void;
  title: string;
}) {
  return (
    <section
      className={`api-gateway-metering-module${expanded ? "" : " api-gateway-metering-module--collapsed"}`}
      data-api-gateway-metering-module={moduleId}
    >
      <header className="api-gateway-metering-module__header">
        <div className="api-gateway-metering-module__heading">
          <p>{title}</p>
          {headingAccessory}
        </div>
        <div className="api-gateway-metering-module__header-actions">
          {headerAccessory}
          <ModuleToggle copy={copy} expanded={expanded} onToggle={onToggle} />
        </div>
      </header>
      {expanded ? <div className="api-gateway-metering-module__content">{children}</div> : null}
    </section>
  );
}

export function ApiGatewayMeteringSummary({
  copy,
  locale,
  metering,
  preferences = createDefaultApiGatewayMeteringDisplayPreferences(),
  providerId,
  surface,
  density = "compact",
  deploymentOptions = [],
  activeDeploymentId = null,
  onSelectDeployment,
  showDeploymentSelector = true,
}: ApiGatewayMeteringSummaryProps) {
  const [summaryExpanded, setSummaryExpanded] = useExpandedModule(
    providerId,
    metering.accountId,
    surface,
    "summary",
  );
  const [trendExpanded, setTrendExpanded] = useExpandedModule(
    providerId,
    metering.accountId,
    surface,
    "trend",
  );
  const [modelsExpanded, setModelsExpanded] = useExpandedModule(
    providerId,
    metering.accountId,
    surface,
    "model_breakdown",
  );
  const [limitsExpanded, setLimitsExpanded] = useExpandedModule(
    providerId,
    metering.accountId,
    surface,
    "limit_windows",
  );
  const [rangeDays, setRangeDays] = useState<ApiGatewayTrendRangeDays>(() =>
    readApiGatewayTrendRangeDays(providerId, metering.accountId, surface),
  );
  const [trendMetric, setTrendMetric] = useState<ApiGatewayTrendMetric>(() =>
    readApiGatewayTrendMetric(providerId, metering.accountId, surface),
  );
  const normalizedPreferences = useMemo(
    () => normalizeApiGatewayMeteringDisplayPreferences(preferences)[surface],
    [preferences, surface],
  );
  const primary = useMemo(
    () => getPrimaryMetric(metering, copy, locale),
    [copy, locale, metering],
  );
  const selectedDays = metering.dailyUsage.slice(-rangeDays);
  const selectedDateRange = formatSelectedDateRange(selectedDays, locale);
  const currentRangeLabel =
    rangeDays === 7 ? copy.sevenDays : copy.thirtyDays;
  const nextRangeLabel =
    rangeDays === 7 ? copy.thirtyDays : copy.sevenDays;
  const visibleRangeLabel = selectedDateRange ?? currentRangeLabel;
  const hasSelectedPeriod = selectedDays.length > 0;
  const selectedMetric: ApiGatewayUsageMetric = hasSelectedPeriod
    ? {
        actualCost: sumMoney(selectedDays.map((day) => day.totals.actualCost)),
        referenceCost: sumMoney(
          selectedDays.map((day) => day.totals.referenceCost),
        ),
        requests: sumNumbers(selectedDays.map((day) => day.totals.requests)),
        inputTokens: sumNumbers(
          selectedDays.map((day) => day.totals.inputTokens),
        ),
        outputTokens: sumNumbers(
          selectedDays.map((day) => day.totals.outputTokens),
        ),
        cacheCreationTokens: sumNumbers(
          selectedDays.map((day) => day.totals.cacheCreationTokens),
        ),
        cacheReadTokens: sumNumbers(
          selectedDays.map((day) => day.totals.cacheReadTokens),
        ),
        totalTokens: sumNumbers(selectedDays.map((day) => day.totals.totalTokens)),
      }
    : (metering.usage?.total ?? {
        actualCost: null,
        referenceCost: null,
        requests: null,
        inputTokens: null,
        outputTokens: null,
        cacheCreationTokens: null,
        cacheReadTokens: null,
        totalTokens: null,
      });
  const estimatedSavings = deriveApiGatewayReferenceSavings(selectedMetric);
  const detailFacts = [
    {
      label: copy.actualSpend,
      value: formatMoney(selectedMetric.actualCost, locale),
    },
    {
      label: copy.referenceCost,
      value: formatMoney(selectedMetric.referenceCost, locale),
    },
    {
      label: copy.estimatedSavings,
      value: formatMoney(estimatedSavings, locale),
    },
    {
      label: copy.requests,
      value:
        selectedMetric.requests === null
          ? null
          : formatNumber(selectedMetric.requests, locale),
    },
    {
      label: copy.tokens,
      value:
        selectedMetric.totalTokens === null
          ? null
          : formatNumber(selectedMetric.totalTokens, locale),
    },
    {
      label: copy.averageLatency,
      value:
        metering.usage?.averageDurationMs === null ||
        metering.usage?.averageDurationMs === undefined
          ? null
          : formatDuration(metering.usage.averageDurationMs, locale),
    },
  ].filter((fact): fact is { label: string; value: string } => fact.value !== null);
  const tokenBreakdown = [
    { label: copy.inputTokens, value: selectedMetric.inputTokens },
    { label: copy.outputTokens, value: selectedMetric.outputTokens },
    { label: copy.cacheCreationTokens, value: selectedMetric.cacheCreationTokens },
    { label: copy.cacheReadTokens, value: selectedMetric.cacheReadTokens },
  ].filter((fact): fact is { label: string; value: number } => fact.value !== null);
  const availableTrendMetrics = useMemo(
    () =>
      (["actual_spend", "tokens", "requests"] as const).filter((metric) =>
        buildTrendData(metering, rangeDays, metric, "") !== null,
      ),
    [metering, rangeDays],
  );
  const effectiveTrendMetric = availableTrendMetrics.includes(trendMetric)
    ? trendMetric
    : (availableTrendMetrics[0] ?? trendMetric);
  const metricLabels: Record<ApiGatewayTrendMetric, string> = {
    actual_spend: copy.actualSpend,
    tokens: copy.tokens,
    requests: copy.requests,
  };
  const trend = useMemo(
    () =>
      buildTrendData(
        metering,
        rangeDays,
        effectiveTrendMetric,
        metricLabels[effectiveTrendMetric],
      ),
    [effectiveTrendMetric, metering, rangeDays],
  );
  const compactModels = useMemo(
    () =>
      buildCompactModels(metering.modelUsage).map((model) =>
        model.id === "other" ? { ...model, label: copy.other } : model,
      ),
    [copy.other, metering.modelUsage],
  );
  const modelLegendData = useMemo(
    () => buildLegendData(compactModels),
    [compactModels],
  );
  const scopeLabel =
    metering.scope === "api_key" ? copy.apiKeyScope : copy.accountScope;
  const dataStateLabel = metering.stale ? copy.savedData : copy.currentData;
  const isPopupCompact = surface === "popup" && density === "compact";

  const setRange = (nextRange: ApiGatewayTrendRangeDays) => {
    setRangeDays(nextRange);
    writeApiGatewayTrendRangeDays(providerId, metering.accountId, surface, nextRange);
  };
  const setMetric = (nextMetric: ApiGatewayTrendMetric) => {
    setTrendMetric(nextMetric);
    writeApiGatewayTrendMetric(providerId, metering.accountId, surface, nextMetric);
  };

  const modules: Record<ApiGatewayMeteringModuleId, ReactNode> = {
    summary: (
      <MeteringModule
        copy={copy}
        expanded={summaryExpanded}
        headerAccessory={
          density === "compact" && showDeploymentSelector ? (
            <ApiGatewayDeploymentSelector
              activeDeploymentId={activeDeploymentId}
              displayLabel={metering.displayLabel}
              onSelectDeployment={onSelectDeployment}
              options={deploymentOptions}
              summaryLabel={copy.overview}
            />
          ) : undefined
        }
        headingAccessory={
          isPopupCompact ? (
            <strong className="api-gateway-metering-module__primary-value">
              {primary.value}
            </strong>
          ) : undefined
        }
        moduleId="summary"
        onToggle={() => setSummaryExpanded(!summaryExpanded)}
        title={isPopupCompact ? primary.label : copy.overview}
      >
        {density === "detail" ? (
          <div className="api-gateway-metering-primary">
            <div>
              <span>{primary.label}</span>
              <strong>{primary.value}</strong>
            </div>
            <span className="api-gateway-metering-primary__scope">{scopeLabel} · {dataStateLabel}</span>
          </div>
        ) : null}
        {primary.percentUsed !== null ? (
          <div
            aria-label={`${primary.label}: ${formatNumber(primary.percentUsed, locale)}%`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={primary.percentUsed}
            className="api-gateway-metering-progress"
            role="progressbar"
          >
            <span style={{ width: `${primary.percentUsed}%` }} />
          </div>
        ) : null}
        {density === "detail" ? (
          <dl className="api-gateway-metering-facts api-gateway-metering-facts--detail">
            {detailFacts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <dl
            className={`api-gateway-metering-facts api-gateway-metering-facts--compact${
              isPopupCompact
                ? " api-gateway-metering-facts--supporting-only"
                : ""
            }`}
          >
            {!isPopupCompact ? (
              <div className="api-gateway-metering-facts__primary">
                <dt>{primary.label}</dt>
                <dd>{primary.value}</dd>
              </div>
            ) : null}
            {[
              {
                label: copy.actualSpend,
                value:
                  formatMoney(selectedMetric.actualCost, locale) ??
                  copy.unavailable,
              },
              {
                label: copy.requests,
                value:
                  selectedMetric.requests === null
                    ? copy.unavailable
                    : formatNumber(selectedMetric.requests, locale),
              },
              {
                label: copy.tokens,
                value:
                  selectedMetric.totalTokens === null
                    ? copy.unavailable
                    : formatNumber(selectedMetric.totalTokens, locale),
              },
            ].map((fact) => (
              <div
                className="api-gateway-metering-facts__supporting"
                key={fact.label}
              >
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {density === "detail" && tokenBreakdown.length > 0 ? (
          <div className="api-gateway-metering-token-breakdown">
            <p>{copy.tokenBreakdown}</p>
            <dl>
              {tokenBreakdown.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{formatNumber(fact.value, locale)}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </MeteringModule>
    ),
    trend: trend ? (
      <MeteringModule
        copy={copy}
        expanded={trendExpanded}
        headingAccessory={
          <button
            className="api-gateway-metering-range"
            data-api-gateway-metering-range-days={rangeDays}
            aria-label={`${copy.trend}: ${currentRangeLabel}, ${visibleRangeLabel}. ${nextRangeLabel}`}
            title={`${currentRangeLabel}: ${visibleRangeLabel}`}
            type="button"
            onClick={() => setRange(rangeDays === 7 ? 30 : 7)}
          >
            {visibleRangeLabel}
          </button>
        }
        moduleId="trend"
        onToggle={() => setTrendExpanded(!trendExpanded)}
        title={copy.trend}
      >
        <div className="api-gateway-metering-controls">
          <div className="api-gateway-metering-segmented" aria-label={copy.trend}>
            {availableTrendMetrics.map((metric) => (
              <button
                aria-pressed={effectiveTrendMetric === metric}
                key={metric}
                type="button"
                onClick={() => setMetric(metric)}
              >
                {metricLabels[metric]}
              </button>
            ))}
          </div>
        </div>
        <UsageHistorySvg
          compact={density === "compact"}
          data={trend.data}
          kind="area"
          label={`${copy.trend}: ${metricLabels[effectiveTrendMetric]}`}
          locale={locale}
          unit={trend.unit}
        />
      </MeteringModule>
    ) : null,
    model_breakdown: compactModels.length > 0 ? (
      <MeteringModule
        copy={copy}
        expanded={modelsExpanded}
        moduleId="model_breakdown"
        onToggle={() => setModelsExpanded(!modelsExpanded)}
        title={copy.models}
      >
        <UsageCompositionSvg
          compact={density === "compact"}
          data={modelLegendData}
          label={copy.models}
          locale={locale}
        />
        <UsageHistoryLegend data={modelLegendData} label={copy.chartLegend} />
        {density === "detail" ? (
          <ol className="api-gateway-metering-model-list">
            {compactModels.map((model) => (
              <li key={model.id}>
                <TechnicalText>{model.label}</TechnicalText>
                <strong>
                  {formatMoney(model.totals.actualCost, locale) ??
                    (model.totals.totalTokens === null
                      ? copy.unavailable
                      : formatNumber(model.totals.totalTokens, locale))}
                </strong>
              </li>
            ))}
          </ol>
        ) : null}
      </MeteringModule>
    ) : null,
    limit_windows: metering.rateLimits.length > 0 ? (
      <MeteringModule
        copy={copy}
        expanded={limitsExpanded}
        moduleId="limit_windows"
        onToggle={() => setLimitsExpanded(!limitsExpanded)}
        title={copy.limits}
      >
        <ul className="api-gateway-metering-limits">
          {metering.rateLimits.slice(0, 3).map((limit) => (
            <li key={limit.id}>
              <span>{limit.id}</span>
              <strong>{formatMoney(limit.remaining, locale) ?? copy.unavailable}</strong>
              {formatReset(limit.resetAt, locale) ? (
                <small>{copy.reset} {formatReset(limit.resetAt, locale)}</small>
              ) : null}
            </li>
          ))}
        </ul>
      </MeteringModule>
    ) : null,
  };

  return (
    <div
      className={`api-gateway-metering-summary api-gateway-metering-summary--${surface} api-gateway-metering-summary--${density}`}
      data-api-gateway-metering-scope={metering.scope}
      data-api-gateway-metering-stale={metering.stale ? "true" : "false"}
    >
      {normalizedPreferences.map((preference) =>
        preference.visible ? (
          <Fragment key={preference.id}>{modules[preference.id]}</Fragment>
        ) : null,
      )}
    </div>
  );
}
