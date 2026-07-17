import type { CSSProperties } from "react";

import type {
  DisplaySurface,
  PopupCircularProgressItemsPerRow,
  ProgressColorAppearance,
  ProgressColorBand,
  ProgressDisplayStyle,
  ProgressItemsBySurface,
  QuotaUnit,
} from "../../providers/types";
import type { RuntimeI18n } from "../i18n";
import { buildRuntimeCommonCopy } from "../i18n";
import { selectVisibleProviderProgressItems } from "../provider-progress-item-selection";
import {
  isFlexCreditBalanceProgressItem,
  type ProviderProgressItem,
} from "../provider-progress-items";
import type { ProviderViewModel } from "../provider-view-models";
import { isCircularProgressDisplayStyle } from "../progress-display";
import { formatPopupProgressItemLabel } from "./provider-progress-compact-labels";
import { UsageProgress } from "./UsageProgress";

type ProviderProgressItemListProps = {
  density?: "compact" | "detail";
  displayStyle: ProgressDisplayStyle;
  i18n: RuntimeI18n;
  progressColorAppearance?: ProgressColorAppearance;
  progressColorBands: readonly ProgressColorBand[];
  popupCircularProgressItemsPerRow?: PopupCircularProgressItemsPerRow;
  progressItemsBySurface: ProgressItemsBySurface;
  progressThicknessPx: number;
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
  label = item.label,
): string | undefined {
  const valueLabel = formatProgressValueLabel(item, i18n, "line");

  return valueLabel ? `${label}: ${valueLabel}` : undefined;
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
  progressColorAppearance,
  progressColorBands,
  popupCircularProgressItemsPerRow,
  progressItemsBySurface,
  progressThicknessPx,
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

  const isPopupCircularLayout =
    surface === "popup" && isCircularProgressDisplayStyle(displayStyle);
  const hasSingleCircularProgressItem =
    isCircularProgressDisplayStyle(displayStyle) &&
    visibleProgressItems.length === 1 &&
    visibleProgressItems[0]?.availability === "progress";
  const popupCircularItemsPerRow = popupCircularProgressItemsPerRow ?? 2;
  const listStyle = isPopupCircularLayout
    ? ({
        "--popup-circular-items-per-row": popupCircularItemsPerRow,
      } as CSSProperties)
    : undefined;
  const listClassName =
    `provider-progress-item-list provider-progress-item-list--${density} ` +
    `provider-progress-item-list--${displayStyle}` +
    (hasSingleCircularProgressItem
      ? " provider-progress-item-list--single-circular"
      : "");

  return (
    <div
      className={listClassName}
      data-single-circular-progress={
        hasSingleCircularProgressItem ? "" : undefined
      }
      data-popup-circular-items-per-row={
        isPopupCircularLayout ? popupCircularItemsPerRow : undefined
      }
      data-provider-progress-item-list={surface}
      style={listStyle}
    >
      {visibleProgressItems.map((item) => {
        const isPopup = surface === "popup";
        const label = isPopup ? formatPopupProgressItemLabel(item, i18n) : item.label;
        const detail = isPopup ? null : formatProgressItemDetail(item, i18n);
        const isFlexCreditBalance = isFlexCreditBalanceProgressItem(item);
        const tone =
          item.kind === "primary_quota" ? provider.displayTone : item.tone;

        return (
          <div
            key={item.id}
            className={`provider-progress-item-list__item provider-progress-item-list__item--${item.availability}${
              isFlexCreditBalance
                ? " provider-progress-item-list__item--flex-credit"
                : ""
            }`}
            data-provider-progress-item={item.id}
          >
            {item.availability === "progress" ? (
              <UsageProgress
                used={item.used}
                remaining={item.remaining}
                total={item.total}
                tone={tone}
                label={label}
                displayStyle={displayStyle}
                progressColorAppearance={progressColorAppearance}
                progressColorBands={progressColorBands}
                progressThicknessPx={progressThicknessPx}
                valueKind={getProgressItemValueKind(item)}
                valueLabel={formatProgressValueLabel(
                  item,
                  i18n,
                  displayStyle,
                )}
                valueText={formatProgressValueText(item, i18n, label)}
                detail={detail}
              />
            ) : (
              <div
                className={`provider-progress-item-list__value-only${
                  isFlexCreditBalance
                    ? " provider-progress-item-list__value-only--inline"
                    : ""
                }`}
              >
                <p className="supporting-copy provider-progress-item-list__label">
                  {label}
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
