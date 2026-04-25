import type { ProgressDisplayStyle } from "../../providers/types";
import type { RuntimeI18n } from "../../shared/i18n";
import type { ProviderViewModel } from "../view-models";
import { UsageProgress } from "./UsageProgress";

type UsageWindowProgressListProps = {
  windows: NonNullable<ProviderViewModel["usageWindows"]>;
  i18n: RuntimeI18n;
  density?: "compact" | "detail";
  displayStyle?: ProgressDisplayStyle;
};

function getUsageWindowProgressTone(
  window: NonNullable<ProviderViewModel["usageWindows"]>[number],
): "neutral" | "warning" | "error" {
  if (window.remaining === null) {
    return "neutral";
  }

  if (window.remaining <= 30) {
    return "error";
  }

  if (window.remaining <= 50) {
    return "warning";
  }

  return "neutral";
}

function formatRemainingValue(
  window: NonNullable<ProviderViewModel["usageWindows"]>[number],
  i18n: RuntimeI18n,
  displayStyle: ProgressDisplayStyle,
): string | undefined {
  if (window.remaining === null) {
    return undefined;
  }

  if (displayStyle === "circle") {
    return i18n.formatPercentValue(window.remaining);
  }

  const remainingLabel = i18n.resolvedLocale === "zh-CN" ? "剩余" : "remaining";
  return `${i18n.formatPercentValue(window.remaining)} ${remainingLabel}`;
}

function formatRemainingText(
  window: NonNullable<ProviderViewModel["usageWindows"]>[number],
  i18n: RuntimeI18n,
): string | undefined {
  if (window.remaining === null) {
    return undefined;
  }

  const remainingLabel = i18n.resolvedLocale === "zh-CN" ? "剩余" : "remaining";
  return `${window.normalizedLabel}: ${i18n.formatPercentValue(window.remaining)} ${remainingLabel}`;
}

function formatWindowResetDetail(
  window: NonNullable<ProviderViewModel["usageWindows"]>[number],
  i18n: RuntimeI18n,
): string | null {
  const resetAt = window.resetAt
    ? (i18n.formatTemporalValue(window.resetAt) ?? window.resetAt)
    : null;
  const resetLabel = i18n.resolvedLocale === "zh-CN" ? "重置" : "resets";

  if (resetAt) {
    return `${resetLabel} ${resetAt}`;
  }

  return window.resetLabel ? i18n.localizeResetRuntimeLabel(window.resetLabel) : null;
}

export function UsageWindowProgressList({
  windows,
  i18n,
  density = "detail",
  displayStyle = "line",
}: UsageWindowProgressListProps) {
  if (windows.length === 0) {
    return null;
  }

  return (
    <div
      className={`usage-window-progress-list usage-window-progress-list--${density} usage-window-progress-list--${displayStyle}`}
      data-usage-window-progress-list=""
    >
      {windows.map((usageWindow) => (
        <div
          key={`${usageWindow.normalizedLabel}-${usageWindow.remaining ?? "unknown"}-${usageWindow.resetAt ?? "no-reset"}`}
          className="usage-window-progress-list__item"
        >
          <UsageProgress
            used={usageWindow.used}
            remaining={usageWindow.remaining}
            total={usageWindow.total ?? 100}
            tone={getUsageWindowProgressTone(usageWindow)}
            label={usageWindow.normalizedLabel}
            displayStyle={displayStyle}
            valueKind="remaining"
            valueLabel={formatRemainingValue(usageWindow, i18n, displayStyle)}
            valueText={formatRemainingText(usageWindow, i18n)}
            detail={formatWindowResetDetail(usageWindow, i18n)}
          />
        </div>
      ))}
    </div>
  );
}
