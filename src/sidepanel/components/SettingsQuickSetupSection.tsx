import type {
  ProviderId,
  ProviderSetting,
  ProviderSnapshot,
  SettingsUserLevel,
} from "../../providers/types";
import { buildSettingsLocalizedCopy } from "../../shared/localized-copy";
import { getRecommendedFirstSetupProvider } from "../../shared/first-provider-setup";
import type { SettingsQuickSetupActionModel } from "../settings-view-models";
import { buildSettingsQuickSetupCardModel } from "../settings-view-models";

type SettingsQuickSetupSectionProps = {
  activeSessionPageAttachAvailable: boolean;
  providers: ProviderSetting[];
  sectionId?: string;
  sessionPageNavigationAvailable: boolean;
  settingsCopy: ReturnType<typeof buildSettingsLocalizedCopy>;
  snapshots: ProviderSnapshot[];
  userLevel: SettingsUserLevel;
  onAttachActiveSessionPage: (providerId: ProviderId) => void;
  onClearPageBinding: (providerId: ProviderId) => void;
  onOpenSessionPage: (providerId: ProviderId) => void;
  onTogglePermission: (providerId: ProviderId) => void;
  onToggleProvider: (providerId: ProviderId) => void;
};

export function SettingsQuickSetupSection({
  activeSessionPageAttachAvailable,
  providers,
  sectionId,
  sessionPageNavigationAvailable,
  settingsCopy,
  snapshots,
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
  const disabledProviders = providers.filter((provider) => !provider.enabled);
  const shouldHighlightDisabledProviders =
    enabledProviders.length === 0 && disabledProviders.length > 0;
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

  return (
    <section className="dashboard-section settings-section-anchor" id={sectionId}>
      <div className="dashboard-section__header">
        <div>
          <p className="section-label">{settingsCopy.quickSetup.eyebrow}</p>
          <h2 className="section-title">{settingsCopy.quickSetup.title}</h2>
        </div>
        <p className="supporting-copy">{settingsCopy.quickSetup.detail}</p>
      </div>

      <div className="provider-shell-list">
        {firstSetupProvider ? (
          <article
            className="quick-setup-card quick-setup-card--starter"
            data-quick-setup-provider-id={firstSetupProvider.id}
            data-quick-setup-first-provider-id={firstSetupProvider.id}
          >
            <div className="quick-setup-card__header">
              <div>
                <p className="section-label">
                  {settingsCopy.quickSetup.firstProvider.eyebrow}
                </p>
                <p className="quick-setup-card__provider">
                  {settingsCopy.quickSetup.firstProvider.title(
                    firstSetupProvider.label,
                  )}
                </p>
                <p className="supporting-copy">
                  {settingsCopy.quickSetup.firstProvider.detail(
                    firstSetupProvider.label,
                  )}
                </p>
              </div>
              <span className={getQuickSetupStatusClassName("neutral")}>
                {settingsCopy.quickSetup.firstProvider.statusLabel}
              </span>
            </div>

            <div className="quick-setup-card__fields">
              <div className="source-card__field">
                <p className="source-card__label">
                  {settingsCopy.quickSetup.currentSetupLabel}
                </p>
                <p className="source-card__value">
                  {settingsCopy.quickSetup.currentSetup.disabled}
                </p>
              </div>

              <div className="source-card__field">
                <p className="source-card__label">
                  {settingsCopy.quickSetup.nextStepLabel}
                </p>
                <p className="source-card__value">
                  {settingsCopy.quickSetup.firstProvider.action(
                    firstSetupProvider.label,
                  )}
                </p>
              </div>
            </div>

            <div className="credential-actions quick-setup-card__actions">
              <button
                className="text-button"
                type="button"
                data-quick-setup-primary-action="enable_provider"
                onClick={() => onToggleProvider(firstSetupProvider.id)}
              >
                {settingsCopy.quickSetup.firstProvider.action(
                  firstSetupProvider.label,
                )}
              </button>
              <span className="supporting-copy">
                {settingsCopy.quickSetup.firstProvider.moreHint}
              </span>
            </div>
          </article>
        ) : null}

        {enabledProviders.map((provider) => {
          const snapshot = snapshotMap.get(provider.id);

          if (!snapshot) {
            return null;
          }

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
              key={provider.id}
              className="quick-setup-card"
              data-quick-setup-provider-id={provider.id}
            >
              <div className="quick-setup-card__header">
                <div>
                  <p className="quick-setup-card__provider">{model.providerLabel}</p>
                  <p className="supporting-copy">{model.helperText}</p>
                </div>
                <span className={getQuickSetupStatusClassName(model.statusTone)}>
                  {model.statusLabel}
                </span>
              </div>

              <div className="quick-setup-card__fields">
                <label
                  className="switch-row quick-setup-card__visibility"
                  data-visibility-provider-id={provider.id}
                  data-visibility-enabled="true"
                >
                  <div>
                    <p className="switch-row__title">
                      {settingsCopy.quickSetup.visibilityLabel}
                    </p>
                    <p className="supporting-copy">
                      {settingsCopy.quickSetup.actions.disableProvider}
                    </p>
                  </div>
                  <input
                    className="switch-row__control"
                    type="checkbox"
                    checked
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
                  <p className="source-card__value">{model.nextStepValue}</p>
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
                      {model.primaryAction.label}
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
        })}
      </div>

      {disabledProviders.length > 0 ? (
        <details
          className="quick-setup-card__more"
          data-quick-setup-empty-visible={shouldHighlightDisabledProviders}
        >
          <summary
            className="source-card__details-toggle"
            data-quick-setup-attention={shouldHighlightDisabledProviders}
          >
            <span>
              {settingsCopy.quickSetup.disabledProvidersSummary(
                disabledProviders.length,
              )}
            </span>
          </summary>

          <div className="settings-list quick-setup-card__disabled-list">
            {disabledProviders.map((provider) => (
              <label
                key={provider.id}
                className="switch-row"
                data-visibility-provider-id={provider.id}
                data-visibility-enabled="false"
              >
                <div>
                  <p className="switch-row__title">{provider.label}</p>
                  <p className="supporting-copy">
                    {settingsCopy.quickSetup.helperText.disabled}
                  </p>
                </div>
                <input
                  className="switch-row__control"
                  type="checkbox"
                  checked={false}
                  data-visibility-toggle={provider.id}
                  onChange={() => onToggleProvider(provider.id)}
                />
              </label>
            ))}
          </div>
        </details>
      ) : null}
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
