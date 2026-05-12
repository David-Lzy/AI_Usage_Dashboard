import type { ProgressDisplayStyle } from "../providers/types";
import type { RuntimeI18n } from "../shared/i18n";
import { UsageProgress } from "../sidepanel/components/UsageProgress";
import { UsageWindowProgressList } from "../sidepanel/components/UsageWindowProgressList";
import type { ProviderViewModel } from "../sidepanel/view-models";
import { shouldShowPopupProviderProgress } from "./progress-visibility";

type PopupProviderProgressProvider = Pick<
  ProviderViewModel,
  | "displayTone"
  | "providerLabel"
  | "quotaUnit"
  | "quotaWindow"
  | "remaining"
  | "total"
  | "usageWindows"
  | "used"
>;

type PopupProviderProgressProps = {
  i18n: RuntimeI18n;
  progressDisplayStyle: ProgressDisplayStyle;
  provider: PopupProviderProgressProvider;
};

export function PopupProviderProgress({
  i18n,
  progressDisplayStyle,
  provider,
}: PopupProviderProgressProps) {
  const hasUsageWindows = (provider.usageWindows?.length ?? 0) > 0;

  if (!shouldShowPopupProviderProgress(provider)) {
    return null;
  }

  if (hasUsageWindows && provider.usageWindows) {
    return (
      <UsageWindowProgressList
        windows={provider.usageWindows}
        i18n={i18n}
        density="compact"
        displayStyle={progressDisplayStyle}
      />
    );
  }

  return (
    <UsageProgress
      used={provider.used}
      remaining={provider.remaining}
      total={provider.total}
      tone={provider.displayTone}
      label={`${provider.providerLabel} ${provider.quotaWindow} ${provider.quotaUnit}`}
      displayStyle={progressDisplayStyle}
      valueKind={provider.remaining !== null ? "remaining" : "used"}
    />
  );
}
