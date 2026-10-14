import type { DisplaySurface, UsageHistoryModulesBySurface } from "../../providers/types";
import type { ProviderViewModel } from "../provider-view-models";
import type { RuntimeI18n } from "../i18n";
import { isProviderUsageHistoryModuleVisible } from "../usage-history-visibility";
import { ProviderUsageComposition } from "./ProviderUsageComposition";
import { CursorQuotaPoolInsights } from "./CursorQuotaPoolInsights";
import { CommunityResetPanelSlot } from "./CommunityResetPanelSlot";
import { CodexUsageInsightsSummary } from "./CodexUsageInsightsSummary";
import { ClaudeUsageInsightsSummary } from "./ClaudeUsageInsightsSummary";

export function ProviderSupplementalModules({ provider, i18n, surface, preferences, compact = false, includeAccountSummary = false }: {
  provider: ProviderViewModel; i18n: RuntimeI18n; surface: DisplaySurface; preferences: UsageHistoryModulesBySurface; compact?: boolean; includeAccountSummary?: boolean;
}) {
  const visible = (id: "quota_insights" | "usage_composition") => isProviderUsageHistoryModuleVisible(preferences, surface, provider.providerId, id);
  return <>
    {includeAccountSummary && visible("quota_insights") ? <>
      <CodexUsageInsightsSummary provider={provider} i18n={i18n} detail={!compact} includeLocalCount />
      <ClaudeUsageInsightsSummary provider={provider} i18n={i18n} detail={!compact} />
    </> : null}
    {provider.providerId === "cursor-personal-page" && visible("quota_insights") && provider.usageInsights?.quotaPools?.length
      ? <CursorQuotaPoolInsights pools={provider.usageInsights.quotaPools} i18n={i18n} compact={compact} /> : null}
    {visible("usage_composition") && (surface !== "popup" || !compact || provider.usageInsights?.distribution?.values.length)
      ? <ProviderUsageComposition provider={provider} i18n={i18n} compact={compact} /> : null}
    {compact && provider.providerId === "codex-personal-page" && isProviderUsageHistoryModuleVisible(preferences, surface, provider.providerId, "community_resets")
      ? <CommunityResetPanelSlot i18n={i18n} compact presentation={surface === "popup" ? "popup" : undefined} /> : null}
  </>;
}
