import { useState } from "react";

import type {
  PopupCircularProgressItemsPerRow,
  ProgressColorAppearance,
  ProgressColorBand,
  ProgressDisplayStyle,
  ProgressItemsBySurface,
  ProviderId,
  ProviderUsageHistory,
  ProviderUsageHistoryModuleId,
  ResetTimeDisplayMode,
  UsageHistoryModulesBySurface,
} from "../providers/types";
import type { RuntimeI18n } from "../shared/i18n";
import { hasVisibleProviderProgressItems } from "../shared/provider-progress-item-selection";
import { StatusBadge } from "../shared/components/StatusBadge";
import type { SettingsRouteFocus } from "../shared/sidepanel-route-state";
import { PopupProviderProgress } from "./PopupProviderProgress";
import type {
  PopupFeaturedProviderCard,
  PopupGuidanceAction,
} from "./view-models";
import {
  UsageHistoryCompact,
  type UsageHistoryChartCopy,
} from "../shared/components/UsageHistoryCharts";
import { buildUsageHistoryLocalizedCopy } from "../shared/usage-history-localized-copy";
import {
  createDefaultUsageHistoryModulesBySurface,
  resolveProviderUsageHistoryModules,
} from "../shared/usage-history-visibility";
import {
  readPopupUsageHistoryCollapsePreference,
  writePopupUsageHistoryCollapsePreference,
} from "./popup-collapse-preferences";
import { CursorUsageSummary } from "../shared/components/CursorUsageSummary";
import { buildCursorUsageLocalizedCopy } from "../shared/cursor-usage-localized-copy";
import { DEFAULT_RESET_TIME_DISPLAY_MODE } from "../shared/reset-time-display";

type PopupFeaturedProviderListProps = {
  ariaLabel: string;
  cards: PopupFeaturedProviderCard[];
  i18n: RuntimeI18n;
  sourcePageActionLabel: string;
  progressColorAppearance?: ProgressColorAppearance;
  progressColorBands: readonly ProgressColorBand[];
  popupCircularProgressItemsPerRow: PopupCircularProgressItemsPerRow;
  progressDisplayStyle: ProgressDisplayStyle;
  progressItemsBySurface: ProgressItemsBySurface;
  progressThicknessPx: number;
  resetTimeDisplayMode?: ResetTimeDisplayMode;
  usageHistoryModulesBySurface?: UsageHistoryModulesBySurface;
  getSettingsFocusForProvider: (
    provider: PopupFeaturedProviderCard["provider"],
  ) => SettingsRouteFocus | null;
  onAction: (
    action: PopupGuidanceAction,
    options?: { settingsFocus?: SettingsRouteFocus | null },
  ) => void | Promise<void>;
};

function PopupUsageHistoryModule({
  copy,
  history,
  moduleId,
  providerId,
}: {
  copy: UsageHistoryChartCopy;
  history: ProviderUsageHistory;
  moduleId: ProviderUsageHistoryModuleId;
  providerId: ProviderId;
}) {
  const [defaultExpanded] = useState(
    () => !readPopupUsageHistoryCollapsePreference(providerId, moduleId),
  );

  return (
    <UsageHistoryCompact
      copy={copy}
      defaultExpanded={defaultExpanded}
      history={history}
      moduleId={moduleId}
      onExpandedChange={(isExpanded) =>
        writePopupUsageHistoryCollapsePreference(
          providerId,
          moduleId,
          !isExpanded,
        )
      }
    />
  );
}

export function PopupFeaturedProviderList({
  ariaLabel,
  cards,
  i18n,
  sourcePageActionLabel,
  progressColorAppearance,
  progressColorBands,
  popupCircularProgressItemsPerRow,
  progressDisplayStyle,
  progressItemsBySurface,
  progressThicknessPx,
  resetTimeDisplayMode = DEFAULT_RESET_TIME_DISPLAY_MODE,
  usageHistoryModulesBySurface = createDefaultUsageHistoryModulesBySurface(),
  getSettingsFocusForProvider,
  onAction,
}: PopupFeaturedProviderListProps) {
  if (cards.length === 0) {
    return null;
  }
  const usageHistoryCopy = buildUsageHistoryLocalizedCopy(i18n.resolvedLocale);
  const cursorUsageCopy = buildCursorUsageLocalizedCopy(i18n.resolvedLocale);

  return (
    <section className="popup-quota-section" aria-label={ariaLabel}>
      <div className="popup-provider-list">
        {cards.map((card, index) => {
          const { provider } = card;
          const providerProgress = (
            <PopupProviderProgress
              provider={provider}
              progressColorAppearance={progressColorAppearance}
              progressColorBands={progressColorBands}
              popupCircularProgressItemsPerRow={popupCircularProgressItemsPerRow}
              progressDisplayStyle={progressDisplayStyle}
              progressItemsBySurface={progressItemsBySurface}
              progressThicknessPx={progressThicknessPx}
              resetTimeDisplayMode={resetTimeDisplayMode}
              i18n={i18n}
            />
          );
          const hasProviderProgress = hasVisibleProviderProgressItems(
            provider,
            "popup",
            progressItemsBySurface,
          );
          const usageHistory = provider.usageHistory;
          const visibleUsageHistoryModules = usageHistory
            ? resolveProviderUsageHistoryModules(
                usageHistoryModulesBySurface,
                "popup",
                provider.providerId,
              ).filter((preference) => preference.visible)
            : [];
          const hasCachedProviderContent =
            hasProviderProgress ||
            visibleUsageHistoryModules.length > 0 ||
            provider.cursorUsage !== undefined;
          const cardSurfaceTone =
            hasCachedProviderContent && provider.displayTone === "error"
              ? "neutral"
              : provider.displayTone;
          const cardStatusTone =
            hasCachedProviderContent && provider.displayTone === "error"
              ? "warning"
              : provider.displayTone;
          const sourcePageAction =
            provider.openableSessionPageUrl !== null
              ? {
                  kind: "source-page",
                  label: sourcePageActionLabel,
                  providerId: provider.providerId,
                  sourcePageNavigationMode: "view",
                } satisfies PopupGuidanceAction
              : null;

          return (
            <article
              key={provider.providerId}
              className={`popup-provider-card popup-provider-card--${cardSurfaceTone}${
                hasProviderProgress ? " popup-provider-card--quota-first" : ""
              }`}
              data-theme-local-surface={
                index === 0 ? "popup-first-provider-card" : undefined
              }
            >
              <div className="popup-provider-card__header">
                <div className="popup-provider-card__identity">
                  <div className="popup-provider-card__title-row">
                    <p className="popup-provider-card__provider">
                      {sourcePageAction ? (
                        <a
                          aria-label={`${sourcePageAction.label}: ${provider.providerLabel}`}
                          className="popup-provider-card__provider-link"
                          data-popup-provider-source-link={provider.providerId}
                          href={provider.openableSessionPageUrl ?? undefined}
                          title={sourcePageAction.label}
                          onClick={(event) => {
                            event.preventDefault();
                            void onAction(sourcePageAction);
                          }}
                        >
                          <span className="popup-provider-card__provider-link-label">
                            {provider.providerLabel}
                          </span>
                        </a>
                      ) : (
                        provider.providerLabel
                      )}
                    </p>
                    <div className="popup-provider-card__header-actions">
                      <button
                        className="text-button text-button--inline popup-provider-card__header-action"
                        data-theme-local-surface={
                          index === 0 ? "popup-first-open-detail" : undefined
                        }
                        data-popup-featured-action={
                          index === 0 ? "true" : undefined
                        }
                        type="button"
                        onClick={() => {
                          void onAction(card.action, {
                            settingsFocus:
                              card.action.kind === "settings"
                                ? getSettingsFocusForProvider(provider)
                                : null,
                          });
                        }}
                      >
                        {card.action.label}
                      </button>
                      <button
                        className="text-button text-button--inline popup-provider-card__header-action"
                        data-popup-hide-provider={provider.providerId}
                        type="button"
                        onClick={() => {
                          void onAction(card.secondaryAction);
                        }}
                      >
                        {card.secondaryAction.label}
                      </button>
                    </div>
                    <div
                      className="popup-provider-card__status"
                      data-popup-featured-status={
                        index === 0 ? "true" : undefined
                      }
                    >
                      <StatusBadge
                        compact
                        label={card.statusLabel}
                        tone={cardStatusTone}
                      />
                    </div>
                  </div>
                  {!hasProviderProgress ? (
                    <p className="popup-provider-card__plan">
                      {provider.planName}
                    </p>
                  ) : null}
                </div>
              </div>

              {hasProviderProgress ? (
                <div
                  className={`popup-provider-card__progress popup-provider-card__progress--${progressDisplayStyle}`}
                  data-popup-featured-progress={
                    index === 0 ? "true" : undefined
                  }
                >
                  {providerProgress}
                </div>
              ) : provider.cursorUsage ? null : (
                <>
                  <div
                    className="popup-provider-card__chips"
                    data-popup-featured-chips={index === 0 ? "true" : undefined}
                  >
                    {card.metaChips.map((chipLabel) => (
                      <span key={chipLabel} className="meta-chip">
                        {chipLabel}
                      </span>
                    ))}
                  </div>
                  <p
                    className="supporting-copy"
                    data-popup-featured-primary={index === 0 ? "true" : undefined}
                  >
                    {card.primaryDetail}
                  </p>
                  <p
                    className="supporting-copy"
                    data-popup-featured-secondary={index === 0 ? "true" : undefined}
                  >
                    {card.secondaryDetail}
                  </p>
                </>
              )}

              {usageHistory && visibleUsageHistoryModules.length > 0 ? (
                <div className="popup-provider-card__history">
                  {visibleUsageHistoryModules.map((preference) => (
                    <PopupUsageHistoryModule
                      key={preference.id}
                      copy={usageHistoryCopy}
                      history={usageHistory}
                      moduleId={preference.id}
                      providerId={provider.providerId}
                    />
                  ))}
                </div>
              ) : null}
              {provider.cursorUsage ? (
                <CursorUsageSummary
                  copy={cursorUsageCopy}
                  locale={i18n.resolvedLocale}
                  providerId={provider.providerId}
                  surface="popup"
                  usage={provider.cursorUsage}
                />
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
