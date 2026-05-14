import type {
  ProviderId,
  ProviderSetting,
  ProviderSnapshot,
  SettingsUserLevel,
} from "../../providers/types";
import type { ResolvedTextDirection } from "../../shared/i18n";
import { buildSettingsLocalizedCopy } from "../../shared/localized-copy";
import { getRecommendedFirstSetupProvider } from "../../shared/first-provider-setup";
import type { SettingsQuickSetupActionModel } from "../settings-view-models";
import { buildSettingsQuickSetupCardModel } from "../settings-view-models";
import {
  ProviderCarousel,
  type ProviderCarouselItem,
} from "./ProviderCarousel";

type SettingsQuickSetupSectionProps = {
  activeSessionPageAttachAvailable: boolean;
  focusedProviderId?: ProviderId | null;
  providers: ProviderSetting[];
  sectionId?: string;
  sessionPageNavigationAvailable: boolean;
  settingsCopy: ReturnType<typeof buildSettingsLocalizedCopy>;
  snapshots: ProviderSnapshot[];
  textDirection?: ResolvedTextDirection;
  userLevel: SettingsUserLevel;
  onAttachActiveSessionPage: (providerId: ProviderId) => void;
  onClearPageBinding: (providerId: ProviderId) => void;
  onOpenSessionPage: (providerId: ProviderId) => void;
  onTogglePermission: (providerId: ProviderId) => void;
  onToggleProvider: (providerId: ProviderId) => void;
};

export function SettingsQuickSetupSection({
  activeSessionPageAttachAvailable,
  focusedProviderId = null,
  providers,
  sectionId,
  sessionPageNavigationAvailable,
  settingsCopy,
  snapshots,
  textDirection = "ltr",
  userLevel,
  onAttachActiveSessionPage,
  onClearPageBinding,
  onOpenSessionPage,
  onTogglePermission,
  onToggleProvider,
}: SettingsQuickSetupSectionProps) {
  const snapshotMap = new Map(
    snapshots.map((snapshot) => [snapshot.providerId, snapshot]),
  );
  const enabledProviders = providers.filter((provider) => provider.enabled);
  const firstSetupProvider =
    enabledProviders.length === 0
      ? getRecommendedFirstSetupProvider(providers)
      : null;

  function runAction(provider: ProviderSetting, action: SettingsQuickSetupActionModel) {
    switch (action.id) {
      case "enable_provider":
      case "disable_provider":
        onToggleProvider(provider.id);
        break;
      case "grant_access":
        onTogglePermission(provider.id);
        break;
      case "open_usage_page":
      case "open_page_and_sign_in":
      case "retry_page":
      case "open_source_page":
        onOpenSessionPage(provider.id);
        break;
      case "use_current_page":
        onAttachActiveSessionPage(provider.id);
        break;
      case "disconnect_page":
        onClearPageBinding(provider.id);
        break;
    }
  }

  function isActionDisabled(
    provider: ProviderSetting,
    action: SettingsQuickSetupActionModel,
  ) {
    switch (action.id) {
      case "open_usage_page":
      case "open_page_and_sign_in":
      case "retry_page":
      case "open_source_page":
        return !sessionPageNavigationAvailable;
      case "use_current_page":
        return !activeSessionPageAttachAvailable;
      case "disconnect_page":
        return provider.pageBinding.status === "unbound";
      default:
        return false;
    }
  }

  function renderProviderCard(
    provider: ProviderSetting,
    snapshot: ProviderSnapshot,
    isStarter: boolean,
  ) {
    const model = buildSettingsQuickSetupCardModel(
      provider,
      snapshot,
      settingsCopy,
      userLevel,
    );
    const secondaryActions = model.secondaryActions.filter(
      (action, index, actions) =>
        actions.findIndex((candidate) => candidate.id === action.id) === index,
    );

    return (
      <article
        className={`quick-setup-card ${
          isStarter ? "quick-setup-card--starter" : ""
        }`.trim()}
        data-quick-setup-provider-id={provider.id}
        data-quick-setup-first-provider-id={isStarter ? provider.id : undefined}
      >
        <div className="quick-setup-card__header">
          <div>
            {isStarter ? (
              <p className="section-label">
                {settingsCopy.quickSetup.firstProvider.eyebrow}
              </p>
            ) : null}
            <p className="quick-setup-card__provider">
              {isStarter
                ? settingsCopy.quickSetup.firstProvider.title(provider.label)
                : model.providerLabel}
            </p>
            <p className="supporting-copy">
              {isStarter
                ? settingsCopy.quickSetup.firstProvider.detail(provider.label)
                : model.helperText}
            </p>
          </div>
          <span
            className={getQuickSetupStatusClassName(
              isStarter ? "neutral" : model.statusTone,
            )}
          >
            {isStarter
              ? settingsCopy.quickSetup.firstProvider.statusLabel
              : model.statusLabel}
          </span>
        </div>

        <div className="quick-setup-card__fields">
          <label
            className="switch-row quick-setup-card__visibility"
            data-visibility-provider-id={provider.id}
            data-visibility-enabled={provider.enabled ? "true" : "false"}
          >
            <div>
              <p className="switch-row__title">
                {settingsCopy.quickSetup.visibilityLabel}
              </p>
              <p className="supporting-copy">
                {provider.enabled
                  ? settingsCopy.quickSetup.actions.disableProvider
                  : settingsCopy.quickSetup.actions.enableProvider}
              </p>
            </div>
            <input
              className="switch-row__control"
              type="checkbox"
              checked={provider.enabled}
              data-visibility-toggle={provider.id}
              onChange={() => onToggleProvider(provider.id)}
            />
          </label>

          <div className="source-card__field">
            <p className="source-card__label">
              {settingsCopy.quickSetup.currentSetupLabel}
            </p>
            <p className="source-card__value">{model.currentSetupValue}</p>
          </div>

          <div className="source-card__field">
            <p className="source-card__label">
              {settingsCopy.quickSetup.nextStepLabel}
            </p>
            <p className="source-card__value">
              {isStarter
                ? settingsCopy.quickSetup.firstProvider.action(provider.label)
                : model.nextStepValue}
            </p>
          </div>

          {model.pageStatusValue ? (
            <div className="source-card__field">
              <p className="source-card__label">
                {settingsCopy.quickSetup.pageStatusLabel}
              </p>
              <p className="source-card__value">{model.pageStatusValue}</p>
            </div>
          ) : null}
        </div>

        {model.primaryAction || secondaryActions.length > 0 ? (
          <div className="credential-actions quick-setup-card__actions">
            {model.primaryAction ? (
              <button
                className="text-button"
                type="button"
                data-quick-setup-primary-action={model.primaryAction.id}
                disabled={isActionDisabled(provider, model.primaryAction)}
                onClick={() => runAction(provider, model.primaryAction!)}
              >
                {isStarter && model.primaryAction.id === "enable_provider"
                  ? settingsCopy.quickSetup.firstProvider.action(provider.label)
                  : model.primaryAction.label}
              </button>
            ) : null}

            {secondaryActions.map((action) => (
              <button
                key={action.id}
                className="text-button"
                type="button"
                data-quick-setup-secondary-action={action.id}
                disabled={isActionDisabled(provider, action)}
                onClick={() => runAction(provider, action)}
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : null}
      </article>
    );
  }

  const quickSetupItems: ProviderCarouselItem[] = providers.flatMap((provider) => {
      const snapshot = snapshotMap.get(provider.id);
      const isStarter =
        firstSetupProvider !== null && provider.id === firstSetupProvider.id;

      return snapshot
        ? [
            {
              id: provider.id,
              label: provider.label,
              content: renderProviderCard(provider, snapshot, isStarter),
            },
          ]
        : [];
    });
  const focusedQuickSetupIndex = quickSetupItems.findIndex(
    (item) => item.id === focusedProviderId,
  );
  const firstSetupIndex = quickSetupItems.findIndex(
    (item) => item.id === firstSetupProvider?.id,
  );

  return (
    <section className="dashboard-section settings-section-anchor" id={sectionId}>
      <div className="dashboard-section__header">
        <div>
          <p className="section-label">{settingsCopy.quickSetup.eyebrow}</p>
          <h2 className="section-title">{settingsCopy.quickSetup.title}</h2>
        </div>
        <p className="supporting-copy">{settingsCopy.quickSetup.detail}</p>
      </div>

      <ProviderCarousel
        ariaLabel={settingsCopy.quickSetup.title}
        initialIndex={
          focusedQuickSetupIndex > -1
            ? focusedQuickSetupIndex
            : firstSetupIndex > -1
              ? firstSetupIndex
              : 0
        }
        items={quickSetupItems}
        textDirection={textDirection}
      />
    </section>
  );
}

function getQuickSetupStatusClassName(
  tone: "error" | "warning" | "neutral",
) {
  return `meta-chip ${
    tone === "error"
      ? "meta-chip--error"
      : tone === "warning"
        ? "meta-chip--warning"
        : ""
  }`.trim();
}
