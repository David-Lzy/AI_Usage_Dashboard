import type {
  ProviderSetting,
  ProviderSnapshot,
  ProviderSyncOutcome,
} from "../types";
import { buildUsageSignal, formatSyncTimestamp } from "../normalize";
import { createJetBrainsConsoleClient } from "./official";
import { parseJetBrainsUsersAndLicensingHtml } from "./page-parse";

type JetBrainsAdapterContext = {
  provider: ProviderSnapshot;
  setting: ProviderSetting;
  warningThresholdPercent: number;
  now: Date;
};

function buildJetBrainsRefreshLabel(): string {
  return "JetBrains Console synced just now";
}

export async function syncJetBrainsProvider({
  provider,
  setting,
  warningThresholdPercent,
  now,
}: JetBrainsAdapterContext): Promise<ProviderSyncOutcome> {
  const syncedAt = formatSyncTimestamp(now);

  if (setting.status === "missing") {
    return {
      snapshot: {
        ...provider,
        syncedAt,
        syncSource: "page_parse",
        syncStatus: "error",
        tone: "error",
        warningReason:
          "JetBrains Central Console access is not configured for this workspace.",
        lastSyncLabel: "JetBrains Console access required",
        sourceSelectionReason:
          "JetBrains session-page sync is retained in the repo, but deferred from the active RC surface until a real org-visible Console session is reverified.",
        sourceFallbackReason: null,
        resetLabel: "Grant JetBrains Console access to sync AI Credits usage",
      },
    };
  }

  const client = createJetBrainsConsoleClient({
    source: "live",
  });
  const capture = await client.getUsersAndLicensingPage(setting.pageBinding);
  const nextSetting: ProviderSetting = {
    ...setting,
    pageBinding: capture.pageBinding,
  };

  if (capture.status !== "ok") {
    const accessUnavailable = capture.status === "access_unavailable";

    return {
      snapshot: {
        ...provider,
        syncedAt,
        syncSource: "page_parse",
        syncStatus: accessUnavailable ? "error" : "warning",
        tone: accessUnavailable ? "error" : "warning",
        warningReason: capture.reason,
        lastSyncLabel:
          capture.status === "logged_out"
            ? "JetBrains Console session missing"
            : accessUnavailable
              ? "JetBrains org access unavailable"
            : "JetBrains Console page not open",
        sourceSelectionReason:
          "JetBrains session-page sync is retained in the repo, but deferred from the active RC surface until a real org-visible Console session is reverified.",
        sourceFallbackReason: null,
        resetLabel:
          capture.status === "logged_out"
            ? "Log back into JetBrains and reopen Users and licensing"
            : accessUnavailable
              ? "Use a JetBrains organization account with AI visibility"
            : "Open the JetBrains Console Users and licensing page and refresh again",
      },
      setting: nextSetting,
    };
  }

  try {
    const page = capture.page;
    const parsed = parseJetBrainsUsersAndLicensingHtml(page.html);
    const total = parsed.users.reduce(
      (sum, user) =>
        sum +
        user.licensesAndQuotas.reduce(
          (licenseSum, license) => licenseSum + license.includedCredits,
          0,
        ),
      0,
    );
    const used = parsed.users.reduce(
      (sum, user) =>
        sum +
        user.licensesAndQuotas.reduce(
          (licenseSum, license) => licenseSum + license.usedCredits,
          0,
        ),
      0,
    );
    const remaining = Math.max(total - used, 0);
    const maxBalanceUsedPercent = Math.max(
      ...parsed.users.map((user) => user.balanceUsedPercent),
    );
    const warningUsers = parsed.users.filter(
      (user) => user.balanceUsedPercent >= warningThresholdPercent,
    ).length;
    const usersAlmostOutOfAiCredits =
      parsed.cards.usersLicensedForAi.usersAlmostOutOfAiCredits;
    const warningUserCount = usersAlmostOutOfAiCredits ?? warningUsers;
    const usageSignal = buildUsageSignal(
      used,
      total,
      warningThresholdPercent,
      "credits",
    );
    const warningReason =
      warningUserCount > 0
        ? `${warningUserCount} users are almost out of monthly AI Credits`
        : usageSignal.warningReason;

    return {
      snapshot: {
        ...provider,
        providerLabel: "JetBrains AI",
        planName: `JetBrains Console (${parsed.cards.usersLicensedForAi.count} licensed)`,
        quotaUnit: "credits",
        quotaWindow: "monthly",
        used,
        remaining,
        total,
        resetAt: "Renews every 30 days",
        resetLabel: "Monthly AI quota renews every 30 days",
        syncedAt,
        syncSource: "page_parse",
        syncStatus: warningUserCount > 0 ? "warning" : usageSignal.syncStatus,
        tone: warningUserCount > 0 ? "warning" : usageSignal.tone,
        warningReason:
          maxBalanceUsedPercent > 100
            ? "One or more users exceeded 100% after a top-up limit change."
            : warningReason,
        lastSyncLabel: buildJetBrainsRefreshLabel(),
        sourceSelectionReason:
          "JetBrains session-page sync is retained in the repo, but deferred from the active RC surface until a real org-visible Console session is reverified.",
        sourceFallbackReason: null,
      },
      setting: nextSetting,
    };
  } catch (error) {
    return {
      snapshot: {
        ...provider,
        syncedAt,
        syncSource: "page_parse",
        syncStatus: "error",
        tone: "error",
        warningReason:
          error instanceof Error
            ? error.message
            : "JetBrains sync failed unexpectedly.",
        lastSyncLabel: "JetBrains sync failed just now",
        sourceSelectionReason:
          "JetBrains session-page sync is retained in the repo, but deferred from the active RC surface until a real org-visible Console session is reverified.",
        sourceFallbackReason: null,
        resetLabel: "Retry after checking JetBrains Console access and parser assumptions",
      },
      setting: nextSetting,
    };
  }
}
