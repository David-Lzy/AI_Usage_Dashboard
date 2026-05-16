import type {
  ProviderSetting,
  ProviderSnapshot,
} from "../providers/types";
import {
  buildProviderSourceDisplay,
  DEFAULT_PROVIDER_SOURCE_DISPLAY_COPY,
  type ProviderSourceDisplayCopy,
} from "./provider-sources";

export type ProviderDisplayEligibilityReason =
  | "connected_or_supported_fallback"
  | "policy_only"
  | "deferred"
  | "planned"
  | "missing_setting";

export type ProviderDisplayEligibility = {
  eligible: boolean;
  reason: ProviderDisplayEligibilityReason;
};

export function resolveProviderDisplayEligibility(
  snapshot: ProviderSnapshot,
  setting: ProviderSetting | null | undefined,
  sourceDisplayCopy: ProviderSourceDisplayCopy = DEFAULT_PROVIDER_SOURCE_DISPLAY_COPY,
): ProviderDisplayEligibility {
  if (!setting) {
    return {
      eligible: false,
      reason: "missing_setting",
    };
  }

  const sourceDisplay = buildProviderSourceDisplay(
    snapshot,
    setting,
    sourceDisplayCopy,
  );

  if (sourceDisplay.currentPlan.rolloutStage === "deferred") {
    return {
      eligible: false,
      reason: "deferred",
    };
  }

  if (sourceDisplay.currentPlan.rolloutStage === "planned") {
    return {
      eligible: false,
      reason: "planned",
    };
  }

  if (sourceDisplay.currentPlan.kind === "policy_only") {
    return {
      eligible: true,
      reason: "policy_only",
    };
  }

  return {
    eligible: true,
    reason: "connected_or_supported_fallback",
  };
}

export function isProviderDisplayEligible(
  snapshot: ProviderSnapshot,
  setting: ProviderSetting | null | undefined,
  sourceDisplayCopy?: ProviderSourceDisplayCopy,
): boolean {
  return resolveProviderDisplayEligibility(
    snapshot,
    setting,
    sourceDisplayCopy,
  ).eligible;
}

export function filterDisplayEligibleProviderSettings(
  providers: readonly ProviderSetting[],
  snapshots: readonly ProviderSnapshot[],
  sourceDisplayCopy?: ProviderSourceDisplayCopy,
): ProviderSetting[] {
  const snapshotMap = new Map(
    snapshots.map((snapshot) => [snapshot.providerId, snapshot] as const),
  );

  return providers.filter((provider) => {
    const snapshot = snapshotMap.get(provider.id);

    return snapshot
      ? isProviderDisplayEligible(snapshot, provider, sourceDisplayCopy)
      : false;
  });
}
