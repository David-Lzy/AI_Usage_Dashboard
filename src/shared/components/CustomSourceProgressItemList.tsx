import type { CSSProperties } from "react";

import type {
  DisplaySurface,
  PopupCircularProgressItemsPerRow,
  ProgressColorAppearance,
  ProgressColorBand,
  ProgressDisplayStyle,
  ProgressItemsBySurface,
} from "../../providers/types";
import {
  selectVisibleCustomSourceProgressItems,
  type CustomSourceProgressItem,
  type CustomSourceViewModel,
} from "../custom-source-view-models";
import type { RuntimeI18n } from "../i18n";
import { buildRuntimeCommonCopy } from "../i18n";
import { isCircularProgressDisplayStyle } from "../progress-display";
import { UsageProgress } from "./UsageProgress";

type CustomSourceProgressItemListProps = {
  density?: "compact" | "detail";
  displayStyle: ProgressDisplayStyle;
  i18n: RuntimeI18n;
  progressColorAppearance?: ProgressColorAppearance;
  progressColorBands: readonly ProgressColorBand[];
  popupCircularProgressItemsPerRow?: PopupCircularProgressItemsPerRow;
  progressItemsBySurface: ProgressItemsBySurface;
  progressThicknessPx: number;
  source: CustomSourceViewModel;
  surface: DisplaySurface;
};

function formatQuotaValue(
  value: number,
  quotaUnit: string,
  i18n: RuntimeI18n,
): string {
  if (quotaUnit.toLowerCase() === "percent") {
    return i18n.formatPercentValue(value);
  }

  const unitLabel = buildRuntimeCommonCopy(i18n).quotaUnitLabel(quotaUnit);
  return `${i18n.formatNumber(value)} ${unitLabel}`;
}

function formatProgressValueLabel(
  item: CustomSourceProgressItem,
  i18n: RuntimeI18n,
  displayStyle: ProgressDisplayStyle,
): string | undefined {
  const commonCopy = buildRuntimeCommonCopy(i18n);

  if (item.remaining !== null) {
    const value = formatQuotaValue(item.remaining, item.quotaUnit, i18n);
    return displayStyle === "circle" && item.quotaUnit.toLowerCase() === "percent"
      ? value
      : `${value} ${commonCopy.remaining}`;
  }

  if (item.used !== null) {
    return formatQuotaValue(item.used, item.quotaUnit, i18n);
  }

  return undefined;
}

function formatProgressValueText(
  item: CustomSourceProgressItem,
  i18n: RuntimeI18n,
  label = item.label,
): string | undefined {
  const valueLabel = formatProgressValueLabel(item, i18n, "line");

  return valueLabel ? `${label}: ${valueLabel}` : undefined;
}

function formatValueOnlyText(
  item: CustomSourceProgressItem,
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
  item: CustomSourceProgressItem,
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
  item: CustomSourceProgressItem,
): "remaining" | "used" {
  return item.remaining !== null ? "remaining" : "used";
}

export function CustomSourceProgressItemList({
  density = "detail",
  displayStyle,
  i18n,
  progressColorAppearance,
  progressColorBands,
  popupCircularProgressItemsPerRow,
  progressItemsBySurface,
  progressThicknessPx,
  source,
  surface,
}: CustomSourceProgressItemListProps) {
  const visibleProgressItems = selectVisibleCustomSourceProgressItems(
    source,
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

  return (
    <div
      className={`provider-progress-item-list provider-progress-item-list--${density} provider-progress-item-list--${displayStyle}${hasSingleCircularProgressItem ? " provider-progress-item-list--single-circular" : ""}`}
      data-custom-source-progress-item-list={surface}
      data-single-circular-progress={
        hasSingleCircularProgressItem ? "" : undefined
      }
      data-popup-circular-items-per-row={
        isPopupCircularLayout ? popupCircularItemsPerRow : undefined
      }
      style={listStyle}
    >
      {visibleProgressItems.map((item) => {
        const label = item.label;
        const detail =
          surface === "popup" ? null : formatProgressItemDetail(item, i18n);

        return (
          <div
            key={item.id}
            className={`provider-progress-item-list__item provider-progress-item-list__item--${item.availability}`}
            data-custom-source-progress-item={item.id}
          >
            {item.availability === "progress" ? (
              <UsageProgress
                used={item.used}
                remaining={item.remaining}
                total={item.total}
                tone={item.tone}
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
              <div className="provider-progress-item-list__value-only">
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
