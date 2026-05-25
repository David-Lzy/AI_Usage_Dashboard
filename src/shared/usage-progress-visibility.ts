import type { ProviderViewModel } from "./provider-view-models";

type UsageProgressVisibilityProvider = Pick<
  ProviderViewModel,
  "quotaUnit" | "remaining" | "total" | "usageWindows" | "used"
>;

export function shouldShowSingleUsageProgress(
  provider: UsageProgressVisibilityProvider,
): boolean {
  if ((provider.usageWindows?.length ?? 0) > 0) {
    return false;
  }

  if (provider.used !== null || provider.remaining !== null) {
    return true;
  }

  return provider.quotaUnit !== "percent" && provider.total !== null;
}
