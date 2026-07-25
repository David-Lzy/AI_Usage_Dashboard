import type { ProviderServiceStatus as ProviderServiceStatusModel } from "../../providers/types";
import type { ResolvedAppLocale } from "../i18n";
import { buildProviderServiceStatusLocalizedCopy } from "../provider-service-status-localized-copy";
import "./provider-service-status.css";

export function ProviderServiceStatus({
  density = "compact",
  locale,
  status,
}: {
  density?: "compact" | "detail";
  locale: ResolvedAppLocale;
  status: ProviderServiceStatusModel | null;
}) {
  const copy = buildProviderServiceStatusLocalizedCopy(locale);
  const level = status?.level ?? "unknown";
  const failureText = status?.failureReason
    ? copy.failures[status.failureReason]
    : null;
  const firstIncident = status?.incidents[0] ?? null;

  return (
    <section
      className={`provider-service-status provider-service-status--${density}`}
      data-provider-service-status={status?.vendorId ?? "unknown"}
      data-provider-service-status-level={level}
      aria-label={copy.eyebrow}
    >
      <div className="provider-service-status__summary">
        <span className="provider-service-status__dot" aria-hidden="true" />
        <span className="provider-service-status__label">{copy.eyebrow}</span>
        <strong className="provider-service-status__value">
          {copy.levels[level]}
        </strong>
        {status?.stale ? (
          <span className="provider-service-status__stale">{copy.stale}</span>
        ) : null}
        {status ? (
          <a
            className="provider-service-status__link"
            href={status.statusPageUrl}
            target="_blank"
            rel="noreferrer"
            title={copy.openStatusPage}
          >
            {copy.officialSource}
          </a>
        ) : null}
      </div>
      {density === "detail" ? (
        <div className="provider-service-status__detail">
          <p>
            {failureText ?? status?.description ?? copy.notChecked}
          </p>
          {firstIncident ? (
            <a
              href={firstIncident.url}
              target="_blank"
              rel="noreferrer"
            >
              {copy.incident}: {firstIncident.name}
            </a>
          ) : null}
        </div>
      ) : firstIncident ? (
        <a
          className="provider-service-status__incident"
          href={firstIncident.url}
          target="_blank"
          rel="noreferrer"
        >
          {firstIncident.name}
        </a>
      ) : null}
    </section>
  );
}
