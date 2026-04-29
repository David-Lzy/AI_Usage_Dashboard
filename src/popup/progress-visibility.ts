import { shouldShowSingleUsageProgress } from "../sidepanel/usage-progress-visibility";
import type { ProviderViewModel } from "../sidepanel/view-models";

type PopupProgressVisibilityProvider = Pick<
  ProviderViewModel,
  "quotaUnit" | "remaining" | "total" | "usageWindows" | "used"
>;

export function shouldShowPopupProviderProgress(
  provider: PopupProgressVisibilityProvider,
): boolean {
  if ((provider.usageWindows?.length ?? 0) > 0) {
    return true;
  }

  return shouldShowSingleUsageProgress(provider);
}
