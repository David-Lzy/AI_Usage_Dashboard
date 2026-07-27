import { useState } from "react";

import type {
  PopupCircularProgressItemsPerRow,
  PopupProviderBrowsingMode,
  ProgressColorAppearance,
  ProgressColorBand,
  ProgressDisplayStyle,
  ProgressItemsBySurface,
  ProviderId,
  ProviderAccountId,
  ProviderAccountsByProvider,
  ProviderUsageHistory,
  ProviderUsageHistoryModuleId,
  ProviderServiceStatus as ProviderServiceStatusModel,
  ProviderServiceStatusVisibilityBySurface,
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
  readPopupProviderCardCollapsePreference,
  writePopupProviderCardCollapsePreference,
  writePopupUsageHistoryCollapsePreference,
} from "./popup-collapse-preferences";
import { CursorUsageSummary } from "../shared/components/CursorUsageSummary";
import { buildCursorUsageLocalizedCopy } from "../shared/cursor-usage-localized-copy";
import {
  ApiGatewayDeploymentSelector,
  ApiGatewayMeteringSummary,
} from "../shared/components/ApiGatewayMeteringSummary";
import { buildApiGatewayMeteringLocalizedCopy } from "../shared/api-gateway-metering-localized-copy";
import { getActiveProviderAccountMetadata } from "../shared/provider-accounts";
import { DEFAULT_RESET_TIME_DISPLAY_MODE } from "../shared/reset-time-display";
import { ProviderServiceStatus } from "../shared/components/ProviderServiceStatus";
import { TechnicalText } from "../shared/components/TechnicalText";
import {
  createDefaultProviderServiceStatusVisibilityBySurface,
  getProviderServiceStatusForProvider,
  isProviderServiceStatusVisible,
} from "../shared/provider-service-status";
import { usePopupProviderAutoGlide } from "./popup-provider-auto-glide";

type PopupFeaturedProviderListProps = {
  ariaLabel: string;
  cards: PopupFeaturedProviderCard[];
  i18n: RuntimeI18n;
  sourcePageActionLabel: string;
  progressColorAppearance?: ProgressColorAppearance;
  progressColorBands: readonly ProgressColorBand[];
  popupCircularProgressItemsPerRow: PopupCircularProgressItemsPerRow;
  providerBrowsingMode: PopupProviderBrowsingMode;
  progressDisplayStyle: ProgressDisplayStyle;
  progressItemsBySurface: ProgressItemsBySurface;
  progressThicknessPx: number;
  resetTimeDisplayMode?: ResetTimeDisplayMode;
  usageHistoryModulesBySurface?: UsageHistoryModulesBySurface;
  providerServiceStatuses?: readonly ProviderServiceStatusModel[];
  providerServiceStatusVisibilityBySurface?: ProviderServiceStatusVisibilityBySurface;
  providerAccounts?: ProviderAccountsByProvider;
  onSelectProviderAccount?: (
    providerId: ProviderId,
    accountId: ProviderAccountId,
  ) => void | Promise<void>;
  getSettingsFocusForProvider: (
    provider: PopupFeaturedProviderCard["provider"],
  ) => SettingsRouteFocus | null;
  onAction: (
    action: PopupGuidanceAction,
    options?: { settingsFocus?: SettingsRouteFocus | null },
  ) => void | Promise<void>;
};

type PopupProviderNavigationDirection = "previous" | "next";

function shouldShowPlanWithProviderProgress(
  provider: PopupFeaturedProviderCard["provider"],
): boolean {
  return (
    provider.providerId === "claude-code-team-page" &&
    !/^Claude personal usage page(?:\s|$)/i.test(provider.planName)
  );
}

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
  providerBrowsingMode,
  progressDisplayStyle,
  progressItemsBySurface,
  progressThicknessPx,
  resetTimeDisplayMode = DEFAULT_RESET_TIME_DISPLAY_MODE,
  usageHistoryModulesBySurface = createDefaultUsageHistoryModulesBySurface(),
  providerServiceStatuses = [],
  providerServiceStatusVisibilityBySurface =
    createDefaultProviderServiceStatusVisibilityBySurface(),
  providerAccounts = {},
  onSelectProviderAccount,
  getSettingsFocusForProvider,
  onAction,
}: PopupFeaturedProviderListProps) {
  const [activeProviderId, setActiveProviderId] = useState<ProviderId | null>(
    () => cards[0]?.provider.providerId ?? null,
  );
  const [collapsedProviderCards, setCollapsedProviderCards] = useState<
    Partial<Record<ProviderId, boolean>>
  >(() =>
    Object.fromEntries(
      cards.map((card) => [
        card.provider.providerId,
        readPopupProviderCardCollapsePreference(card.provider.providerId),
      ]),
    ),
  );
  const {
    isActive: hasActiveAutoGlide,
    orderedItemIds: autoGlideProviderIds,
    trackRef: autoGlideTrackRef,
    viewportRef: autoGlideViewportRef,
  } = usePopupProviderAutoGlide(
    cards.map((card) => card.provider.providerId),
    providerBrowsingMode === "scroll",
  );

  const resolvedActiveProviderIndex = Math.max(
    0,
    cards.findIndex((card) => card.provider.providerId === activeProviderId),
  );
  const usesSingleProviderStage =
    providerBrowsingMode === "single" || providerBrowsingMode === "switch";
  const activeCard = cards[resolvedActiveProviderIndex] ?? cards[0] ?? null;
  const cardsByProviderId = new Map(
    cards.map((card) => [card.provider.providerId, card]),
  );
  const autoGlideCards = autoGlideProviderIds
    .map((providerId) => cardsByProviderId.get(providerId))
    .filter((card): card is PopupFeaturedProviderCard => card !== undefined);
  const visibleCards =
    usesSingleProviderStage && activeCard
      ? [activeCard]
      : providerBrowsingMode === "scroll"
        ? autoGlideCards
        : cards;
  const usageHistoryCopy = buildUsageHistoryLocalizedCopy(i18n.resolvedLocale);
  const cursorUsageCopy = buildCursorUsageLocalizedCopy(i18n.resolvedLocale);
  const apiGatewayMeteringCopy = buildApiGatewayMeteringLocalizedCopy(
    i18n.resolvedLocale,
  );

  const navigateProvider = (direction: PopupProviderNavigationDirection) => {
    if (cards.length === 0) {
      return;
    }

    const offset = direction === "previous" ? -1 : 1;
    const nextIndex =
      (resolvedActiveProviderIndex + offset + cards.length) % cards.length;

    setActiveProviderId(cards[nextIndex].provider.providerId);
  };

  if (cards.length === 0) {
    return null;
  }

  return (
    <section className="popup-quota-section" aria-label={ariaLabel}>
      <div
        ref={
          providerBrowsingMode === "scroll" ? autoGlideViewportRef : undefined
        }
        aria-label={
          providerBrowsingMode === "scroll" && cards.length > 1
            ? ariaLabel
            : undefined
        }
        className={`popup-provider-stage popup-provider-stage--${providerBrowsingMode}`}
        data-popup-provider-auto-glide={
          providerBrowsingMode === "scroll" ? "" : undefined
        }
        data-popup-provider-auto-glide-active={
          providerBrowsingMode === "scroll"
            ? hasActiveAutoGlide
              ? "true"
              : "false"
            : undefined
        }
        data-popup-provider-auto-glide-wheel={
          providerBrowsingMode === "scroll" && hasActiveAutoGlide
            ? "true"
            : undefined
        }
        role={
          providerBrowsingMode === "scroll" && cards.length > 1
            ? "group"
            : undefined
        }
      >
        {providerBrowsingMode === "single" && cards.length > 1 ? (
          <div
            className="popup-provider-switcher"
            data-popup-provider-switcher=""
          >
            <button
              aria-label={i18n.t("popup.providers.previous")}
              className="popup-provider-switcher__button popup-provider-switcher__button--previous"
              type="button"
              onClick={() => navigateProvider("previous")}
            >
              <span
                className="popup-provider-switcher__icon"
                aria-hidden="true"
              />
            </button>
            <span
              className="popup-provider-switcher__position"
              aria-live="polite"
            >
              {i18n.formatNumber(resolvedActiveProviderIndex + 1)} /{" "}
              {i18n.formatNumber(cards.length)}
            </span>
            <button
              aria-label={i18n.t("popup.providers.next")}
              className="popup-provider-switcher__button popup-provider-switcher__button--next"
              type="button"
              onClick={() => navigateProvider("next")}
            >
              <span
                className="popup-provider-switcher__icon"
                aria-hidden="true"
              />
            </button>
          </div>
        ) : null}
        <div
          ref={
            providerBrowsingMode === "scroll" ? autoGlideTrackRef : undefined
          }
          className={`popup-provider-list popup-provider-list--${providerBrowsingMode}`}
          data-popup-provider-browsing-mode={providerBrowsingMode}
        >
          {visibleCards.map((card) => {
            const { provider } = card;
            const index = cards.indexOf(card);
            const isCardCollapsed =
              providerBrowsingMode === "collapsible" &&
              (collapsedProviderCards[provider.providerId] ??
                readPopupProviderCardCollapsePreference(provider.providerId));
            const apiGatewayMeteringDisplayPreferences =
              getActiveProviderAccountMetadata(
                { providerAccounts },
                provider.providerId,
              )?.apiGatewayMeteringDisplayPreferences;
            const providerAccountCollection =
              providerAccounts[provider.providerId];
            const hasApiGatewayMetering =
              provider.apiGatewayMetering !== undefined;
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
            const showProviderServiceStatus = isProviderServiceStatusVisible(
              providerServiceStatusVisibilityBySurface,
              "popup",
              provider.providerId,
            );
            const providerServiceStatus = showProviderServiceStatus
              ? getProviderServiceStatusForProvider(
                  providerServiceStatuses,
                  provider.providerId,
                )
              : null;
            const hasCachedProviderContent =
              hasProviderProgress ||
              visibleUsageHistoryModules.length > 0 ||
              provider.cursorUsage !== undefined ||
              hasApiGatewayMetering ||
              showProviderServiceStatus;
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
                }${isCardCollapsed ? " popup-provider-card--collapsed" : ""}${
                  providerBrowsingMode === "collapsible"
                    ? " popup-provider-card--collapsible"
                    : ""
                }`}
                data-popup-provider-card-collapsed={
                  isCardCollapsed ? "true" : undefined
                }
                data-theme-local-surface={
                  index === 0 ? "popup-first-provider-card" : undefined
                }
              >
                <div className="popup-provider-card__header">
                  <div className="popup-provider-card__identity">
                    <div className="popup-provider-card__title-row">
                      <div className="popup-provider-card__provider-and-deployment">
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
                                <TechnicalText>
                                  {provider.providerLabel}
                                </TechnicalText>
                              </span>
                            </a>
                          ) : (
                            <TechnicalText>
                              {provider.providerLabel}
                            </TechnicalText>
                          )}
                        </p>
                        {provider.apiGatewayMetering ? (
                          <ApiGatewayDeploymentSelector
                            activeDeploymentId={
                              providerAccountCollection?.activeAccountId ?? null
                            }
                            displayLabel={provider.apiGatewayMetering.displayLabel}
                            onSelectDeployment={
                              onSelectProviderAccount
                                ? (accountId) =>
                                    onSelectProviderAccount(
                                      provider.providerId,
                                      accountId,
                                    )
                                : undefined
                            }
                            options={providerAccountCollection?.accounts ?? []}
                            summaryLabel={apiGatewayMeteringCopy.overview}
                          />
                        ) : null}
                      </div>
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
                    {!hasApiGatewayMetering &&
                    (!hasProviderProgress ||
                      shouldShowPlanWithProviderProgress(provider)) ? (
                      <p className="popup-provider-card__plan">
                        <TechnicalText direction="auto">
                          {provider.planName}
                        </TechnicalText>
                      </p>
                    ) : null}
                  </div>
                </div>

                {!isCardCollapsed ? (
                  <>
                    {hasProviderProgress ? (
                      <div
                        className={`popup-provider-card__progress popup-provider-card__progress--${progressDisplayStyle}`}
                        data-popup-featured-progress={
                          index === 0 ? "true" : undefined
                        }
                      >
                        {providerProgress}
                      </div>
                    ) : provider.cursorUsage || hasApiGatewayMetering ? null : (
                      <>
                        <div
                          className="popup-provider-card__chips"
                          data-popup-featured-chips={
                            index === 0 ? "true" : undefined
                          }
                        >
                          {card.metaChips.map((chipLabel) => (
                            <span key={chipLabel} className="meta-chip">
                              {chipLabel}
                            </span>
                          ))}
                        </div>
                        <p
                          className="supporting-copy"
                          data-popup-featured-primary={
                            index === 0 ? "true" : undefined
                          }
                        >
                          {card.primaryDetail}
                        </p>
                        <p
                          className="supporting-copy"
                          data-popup-featured-secondary={
                            index === 0 ? "true" : undefined
                          }
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
                    {provider.apiGatewayMetering ? (
                      <ApiGatewayMeteringSummary
                        copy={apiGatewayMeteringCopy}
                        locale={i18n.resolvedLocale}
                        metering={provider.apiGatewayMetering}
                        preferences={apiGatewayMeteringDisplayPreferences}
                        providerId={provider.providerId}
                        showDeploymentSelector={false}
                        surface="popup"
                        activeDeploymentId={
                          providerAccountCollection?.activeAccountId ?? null
                        }
                        deploymentOptions={providerAccountCollection?.accounts}
                        onSelectDeployment={
                          onSelectProviderAccount
                            ? (accountId) =>
                                onSelectProviderAccount(
                                  provider.providerId,
                                  accountId,
                                )
                            : undefined
                        }
                      />
                    ) : null}
                    {showProviderServiceStatus ? (
                      <ProviderServiceStatus
                        locale={i18n.resolvedLocale}
                        status={providerServiceStatus}
                      />
                    ) : null}
                  </>
                ) : null}
                {providerBrowsingMode === "collapsible" ? (
                  <button
                    aria-expanded={!isCardCollapsed}
                    aria-label={i18n.t(
                      isCardCollapsed
                        ? "popup.providers.expand_card"
                        : "popup.providers.collapse_card",
                    )}
                    className="popup-provider-card__collapse-toggle"
                    data-popup-provider-card-toggle={provider.providerId}
                    type="button"
                    onClick={() => {
                      const nextCollapsed = !isCardCollapsed;
                      setCollapsedProviderCards((current) => ({
                        ...current,
                        [provider.providerId]: nextCollapsed,
                      }));
                      writePopupProviderCardCollapsePreference(
                        provider.providerId,
                        nextCollapsed,
                      );
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className={`popup-provider-card__collapse-icon${
                        isCardCollapsed
                          ? " popup-provider-card__collapse-icon--collapsed"
                          : ""
                      }`}
                    />
                  </button>
                ) : null}
              </article>
            );
          })}
        </div>
        {providerBrowsingMode === "switch" && cards.length > 1 ? (
          <button
            aria-label={i18n.t("popup.providers.next")}
            className="popup-provider-center-switch"
            data-popup-provider-center-switch=""
            type="button"
            onClick={() => navigateProvider("next")}
          >
            <span
              aria-hidden="true"
              className="popup-provider-center-switch__icon"
            />
          </button>
        ) : null}
      </div>
    </section>
  );
}
