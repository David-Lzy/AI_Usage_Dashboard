import { useEffect, useMemo, useState } from "react";

import type { AppState, ProviderId } from "../../providers/types";
import { MaterialActionIcon } from "../../shared/components/MaterialActionIcon";
import type { RuntimeI18n } from "../../shared/i18n";
import { buildUsageExportLocalizedCopy } from "../../shared/usage-export-localized-copy";
import {
  buildUsageExport,
  getUsageExportRange,
  listUsageExportFamilies,
  type UsageExportFamily,
} from "../../shared/usage-export";
import {
  getSavedUsageAccounts,
  type UsageDateRange,
  usageRangeDayCount,
} from "../../shared/usage-aggregates";
import { downloadTextFile } from "../download-text-file";
import { MaterialSelect } from "./MaterialSelect";
import { UsagePeriodControls } from "./UsagePeriodControls";
import { UsagePeriodSummary } from "./UsagePeriodSummary";
import "./UsageExport.css";

type UsageExportProps = {
  state: Pick<AppState, "providers" | "providerSettings" | "providerAccounts">;
  providerId: ProviderId;
  i18n: RuntimeI18n;
};

type PreviewSnapshot = {
  key: string;
  result: ReturnType<typeof buildUsageExport>;
};

const EMPTY_RANGE: UsageDateRange = { start: "", end: "" };
const PREVIEW_LIMIT = 50;

function formatCapture(value: string | null, i18n: RuntimeI18n, unavailable: string) {
  if (!value || !Number.isFinite(Date.parse(value))) {
    return unavailable;
  }

  return new Intl.DateTimeFormat(i18n.resolvedLocale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function snapshotKey(
  providerId: ProviderId,
  accountId: string,
  family: UsageExportFamily | "",
  range: UsageDateRange,
  result: ReturnType<typeof buildUsageExport> | null,
) {
  return `${providerId}:${accountId}:${family}:${range.start}:${range.end}:${result?.status ?? "none"}:${result?.filename ?? ""}:${result?.csv ?? ""}`;
}

export function UsageExport({ state, providerId, i18n }: UsageExportProps) {
  const copy = buildUsageExportLocalizedCopy(i18n.resolvedLocale);
  const accounts = useMemo(
    () => getSavedUsageAccounts(state, providerId),
    [state, providerId],
  );
  const [accountId, setAccountId] = useState(() => accounts[0]?.metadata.id ?? "");
  const families = useMemo(
    () => accountId ? listUsageExportFamilies(state, providerId, accountId) : [],
    [accountId, providerId, state],
  );
  const [family, setFamily] = useState<UsageExportFamily | "">(
    () => families[0] ?? "",
  );
  const [range, setRange] = useState<UsageDateRange>(() =>
    accountId && family
      ? getUsageExportRange(state, providerId, accountId, family)
      : EMPTY_RANGE,
  );
  const [preview, setPreview] = useState<PreviewSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const accountOptions = accounts.map((account) => ({
    value: account.metadata.id,
    label: account.metadata.label,
  }));
  const familyOptions = families.map((value) => ({
    value,
    label: copy.familyLabels[value],
  }));
  const hasFamilies = familyOptions.length > 0;
  const accountExists = accounts.some((account) => account.metadata.id === accountId);
  const familyIsAvailable = Boolean(family && families.includes(family));
  const hasValidRange = usageRangeDayCount(range) > 0;
  const currentResult = accountExists && familyIsAvailable && family
    ? buildUsageExport(state, { providerId, accountId, family, range })
    : null;
  const currentSnapshotKey = snapshotKey(providerId, accountId, family, range, currentResult);
  const canPreview = currentResult?.status === "ready" && currentResult.rows.length > 0;

  useEffect(() => {
    if (!accounts.some((account) => account.metadata.id === accountId)) {
      setAccountId(accounts[0]?.metadata.id ?? "");
    }
  }, [accountId, accounts]);

  useEffect(() => {
    if (!family || !families.includes(family)) {
      setFamily(families[0] ?? "");
    }
  }, [family, families]);

  useEffect(() => {
    setRange(
      accountId && family
        ? getUsageExportRange(state, providerId, accountId, family)
        : EMPTY_RANGE,
    );
  }, [accountId, family, providerId]);

  useEffect(() => {
    if (preview && preview.key !== currentSnapshotKey) {
      setPreview(null);
      setError(null);
    }
  }, [currentSnapshotKey, preview]);

  function selectAccount(nextAccountId: string) {
    const nextFamilies = listUsageExportFamilies(state, providerId, nextAccountId);
    setAccountId(nextAccountId);
    setFamily(nextFamilies[0] ?? "");
  }

  function selectFamily(nextFamily: UsageExportFamily | "") {
    setFamily(nextFamily);
  }

  function handlePreview() {
    const result = family ? buildUsageExport(state, { providerId, accountId, family, range }) : null;
    if (!result || result.status !== "ready") {
      setError(!hasValidRange ? copy.invalidRange : result?.status === "empty" ? copy.noData : copy.unavailable);
      return;
    }

    setPreview({
      key: snapshotKey(providerId, accountId, family, range, result),
      result,
    });
    setError(null);
  }

  function handleDownload() {
    const latest = family ? buildUsageExport(state, { providerId, accountId, family, range }) : null;
    if (!preview || preview.key !== snapshotKey(providerId, accountId, family, range, latest)) {
      setPreview(null);
      setError(copy.unavailable);
      return;
    }
    if (!downloadTextFile(preview.result.filename, preview.result.csv, "text/csv;charset=utf-8")) {
      setError(copy.downloadFailed);
      return;
    }
    setError(null);
  }

  if (accounts.length === 0) {
    return (
      <section className="usage-export" data-usage-export="" aria-labelledby="usage-export-title">
        <p className="section-label">{copy.eyebrow}</p>
        <h2 id="usage-export-title" className="section-title">{copy.title}</h2>
        <p className="usage-export__status">{copy.noSavedAccounts}</p>
      </section>
    );
  }

  return (
    <section className="usage-export" data-usage-export="" aria-labelledby="usage-export-title">
      <header className="usage-export__header">
        <div>
          <p className="section-label">{copy.eyebrow}</p>
          <h2 id="usage-export-title" className="section-title">{copy.title}</h2>
        </div>
      </header>
      <div className="usage-export__fields">
        <div data-usage-export-field="account">
          <MaterialSelect
            fieldIdPrefix="usage-export-account"
            label={copy.account}
            options={accountOptions}
            value={accountId}
            onChange={selectAccount}
          />
        </div>
        {hasFamilies ? <>
          <div data-usage-export-field="family">
            <MaterialSelect<UsageExportFamily | "">
              fieldIdPrefix="usage-export-family"
              label={copy.family}
              options={familyOptions}
              value={family}
              onChange={selectFamily}
            />
          </div>
          <div className="usage-export__period">
            <UsagePeriodControls i18n={i18n} range={range} referenceTimezone={currentResult?.sourceTimezone} surface="export" onChange={setRange} />
          </div>
        </> : null}
      </div>
      {!hasFamilies ? <p className="usage-export__status">{copy.noFamilies}</p> : null}
      {hasFamilies && hasValidRange && currentResult?.status === "empty" ? <p className="usage-export__status" role="status">{copy.noData}</p> : null}
      {hasFamilies ? <div className="usage-export__actions">
        <button className="text-button text-button--outlined usage-export__button" type="button" data-usage-export-action="preview" disabled={!canPreview} onClick={handlePreview}>
          <MaterialActionIcon className="usage-export__button-icon" name="keyboard-arrow-down" />
          {copy.preview}
        </button>
      </div> : null}
      {error ? <p className="usage-export__error" role="alert">{error}</p> : null}
      {currentResult?.status === "ready" ? <UsagePeriodSummary i18n={i18n} result={currentResult} /> : null}
      {preview ? <UsageExportPreview copy={copy} i18n={i18n} preview={preview} providerLabel={state.providers.find((provider) => provider.providerId === providerId)?.providerLabel ?? copy.unavailable} onDownload={handleDownload} /> : null}
    </section>
  );
}

function UsageExportPreview({ copy, i18n, preview, providerLabel, onDownload }: {
  copy: ReturnType<typeof buildUsageExportLocalizedCopy>;
  i18n: RuntimeI18n;
  preview: PreviewSnapshot;
  providerLabel: string;
  onDownload: () => void;
}) {
  const { result } = preview;
  const rows = result.rows.slice(0, PREVIEW_LIMIT);

  return (
    <section className="usage-export__preview" data-usage-export-preview="" aria-labelledby="usage-export-preview-title">
      <div className="usage-export__preview-header">
        <h3 id="usage-export-preview-title" className="usage-export__preview-title">{copy.previewTitle}</h3>
        <p className="usage-export__total">{copy.totalRows(result.rows.length)}</p>
        <button className="text-button text-button--outlined usage-export__button" type="button" data-usage-export-action="download" title={copy.downloadTitle} onClick={onDownload}>
          <MaterialActionIcon className="usage-export__button-icon" name="save" />
          {copy.download}
        </button>
      </div>
      <dl className="usage-export__metadata">
        <div><dt>{copy.provider}</dt><dd>{providerLabel}</dd></div>
        <div><dt>{copy.coverage}</dt><dd>{copy.coverageValue(result.coverage.observedDays, result.coverage.selectedDays)}</dd></div>
        <div><dt>{copy.captured}</dt><dd>{formatCapture(result.capturedAt, i18n, copy.unavailable)}</dd></div>
        <div><dt>{copy.freshness}</dt><dd>{copy.freshnessLabels[result.freshness]}</dd></div>
        <div><dt>{copy.sourceTimezone}</dt><dd>{result.sourceTimezone ? copy.timezoneKnown(result.sourceTimezone) : copy.timezoneUnknown}</dd></div>
      </dl>
      <div className="usage-export__table-region" role="region" tabIndex={0} aria-label={copy.tableLabel}>
        <table>
          <thead><tr><th scope="col">{copy.date}</th><th scope="col">{copy.series}</th><th scope="col">{copy.metric}</th><th scope="col">{copy.value}</th><th scope="col">{copy.unit}</th><th scope="col">{copy.currency}</th></tr></thead>
          <tbody>{rows.map((row, index) => <tr key={`${row.date}:${row.series}:${row.metric}:${index}`}><td>{row.date}</td><td>{row.series || copy.unavailable}</td><td>{copy.metricLabels[row.metric] ?? copy.unavailable}</td><td>{row.value === null ? copy.unavailable : i18n.formatNumber(row.value)}</td><td>{copy.unitLabels[row.unit] ?? copy.unavailable}</td><td>{row.currency || copy.unavailable}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}
