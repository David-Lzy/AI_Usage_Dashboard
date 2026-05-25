import type { ProviderViewModel } from "../shared/provider-view-models";
import { shouldShowSingleUsageProgress } from "../shared/usage-progress-visibility";

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
