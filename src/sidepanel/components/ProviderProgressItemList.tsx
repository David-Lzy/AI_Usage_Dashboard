import type {
  DisplaySurface,
  ProgressDisplayStyle,
  ProgressItemsBySurface,
  QuotaUnit,
} from "../../providers/types";
import type { RuntimeI18n } from "../../shared/i18n";
import { buildRuntimeCommonCopy } from "../../shared/i18n";
import { selectVisibleProviderProgressItems } from "../../shared/provider-progress-item-selection";
import type { ProviderProgressItem } from "../../shared/provider-progress-items";
import type { ProviderViewModel } from "../view-models";
import { UsageProgress } from "./UsageProgress";

type ProviderProgressItemListProps = {
  density?: "compact" | "detail";
  displayStyle: ProgressDisplayStyle;
  i18n: RuntimeI18n;
  progressItemsBySurface: ProgressItemsBySurface;
  provider: ProviderViewModel;
  surface: DisplaySurface;
};

function formatQuotaValue(
  value: number,
  quotaUnit: QuotaUnit,
  i18n: RuntimeI18n,
): string {
  if (quotaUnit === "percent") {
    return i18n.formatPercentValue(value);
  }

  const unitLabel = buildRuntimeCommonCopy(i18n).quotaUnitLabel(quotaUnit);
  return `${i18n.formatNumber(value)} ${unitLabel}`;
}

function formatProgressValueLabel(
  item: ProviderProgressItem,
  i18n: RuntimeI18n,
  displayStyle: ProgressDisplayStyle,
): string | undefined {
  const commonCopy = buildRuntimeCommonCopy(i18n);

  if (item.remaining !== null) {
    const value = formatQuotaValue(item.remaining, item.quotaUnit, i18n);
    return displayStyle === "circle" && item.quotaUnit === "percent"
      ? value
      : `${value} ${commonCopy.remaining}`;
  }

  if (item.used !== null) {
    return formatQuotaValue(item.used, item.quotaUnit, i18n);
  }

  return undefined;
}

function formatProgressValueText(
  item: ProviderProgressItem,
  i18n: RuntimeI18n,
): string | undefined {
  const valueLabel = formatProgressValueLabel(item, i18n, "line");

  return valueLabel ? `${item.label}: ${valueLabel}` : undefined;
}

function formatValueOnlyText(
  item: ProviderProgressItem,
  i18n: RuntimeI18n,
): string {
  const commonCopy = buildRuntimeCommonCopy(i18n);

  if (item.remaining !== null) {
    const remainingValue = formatQuotaValue(
      item.remaining,
      item.quotaUnit,
      i18n,
    );
    return `${remainingValue} ${commonCopy.remaining}`;
  }

  if (item.used !== null) {
    return `${formatQuotaValue(item.used, item.quotaUnit, i18n)} tracked`;
  }

  if (item.total !== null) {
    return `${formatQuotaValue(item.total, item.quotaUnit, i18n)} total`;
  }

  return "Unavailable";
}

function formatProgressItemDetail(
  item: ProviderProgressItem,
  i18n: RuntimeI18n,
): string | null {
  const resetAt = item.resetAt
    ? (i18n.formatTemporalValue(item.resetAt) ?? item.resetAt)
    : null;
  const resetLabel = item.resetLabel
    ? i18n.localizeResetRuntimeLabel(item.resetLabel)
    : null;
  const resetDetail = resetAt
    ? `${buildRuntimeCommonCopy(i18n).reset} ${resetAt}`
    : resetLabel;
  const detailParts = [resetDetail, item.detail].filter(
    (part): part is string => Boolean(part),
  );

  return detailParts.length > 0 ? detailParts.join(" · ") : null;
}

function getProgressItemValueKind(
  item: ProviderProgressItem,
): "remaining" | "used" {
  return item.remaining !== null ? "remaining" : "used";
}

export function ProviderProgressItemList({
  density = "detail",
  displayStyle,
  i18n,
  progressItemsBySurface,
  provider,
  surface,
}: ProviderProgressItemListProps) {
  const visibleProgressItems = selectVisibleProviderProgressItems(
    provider,
    surface,
    progressItemsBySurface,
  );

  if (visibleProgressItems.length === 0) {
    return null;
  }

  return (
    <div
      className={`provider-progress-item-list provider-progress-item-list--${density} provider-progress-item-list--${displayStyle}`}
      data-provider-progress-item-list={surface}
    >
      {visibleProgressItems.map((item) => {
        const detail = formatProgressItemDetail(item, i18n);
        const tone =
          item.kind === "primary_quota" ? provider.displayTone : item.tone;

        return (
          <div
            key={item.id}
            className={`provider-progress-item-list__item provider-progress-item-list__item--${item.availability}`}
            data-provider-progress-item={item.id}
          >
            {item.availability === "progress" ? (
              <UsageProgress
                used={item.used}
                remaining={item.remaining}
                total={item.total}
                tone={tone}
                label={item.label}
                displayStyle={displayStyle}
                valueKind={getProgressItemValueKind(item)}
                valueLabel={formatProgressValueLabel(
                  item,
                  i18n,
                  displayStyle,
                )}
                valueText={formatProgressValueText(item, i18n)}
                detail={detail}
              />
            ) : (
              <div className="provider-progress-item-list__value-only">
                <p className="supporting-copy provider-progress-item-list__label">
                  {item.label}
                </p>
                <p className="provider-progress-item-list__value">
                  {formatValueOnlyText(item, i18n)}
                </p>
                {detail ? (
                  <p className="supporting-copy provider-progress-item-list__detail">
                    {detail}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
