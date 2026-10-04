import { ControlVisibilityBoundary } from "../../shared/control-visibility";
import { useEffect, useState, type ReactNode } from "react";

import type {
  CredentialProviderId,
  ProviderId,
  ProviderSetting,
  ProviderSnapshot,
  SettingsUserLevel,
} from "../../providers/types";
import { getProviderDefinition } from "../../providers/provider-definitions";
import type { RuntimeI18n } from "../../shared/i18n";
import { getRecommendedFirstSetupProvider } from "../../shared/first-provider-setup";
import { buildSettingsLocalizedCopy } from "../../shared/settings-localized-copy";
import { getSettingsCategoryCopy } from "../../shared/settings-category-localized-copy";
import type { ProviderSourceDisplayCopy } from "../../shared/provider-sources";
import { MaterialActionIcon } from "../../shared/components/MaterialActionIcon";
import {
  buildSettingsQuickSetupCardModel,
  type SettingsQuickSetupActionModel,
} from "../settings-view-models";
import { FusionCheckbox } from "./material-ui/FusionControls";
import { MotionDetails } from "../../shared/components/MotionDetails";

type Props = {
  activeSessionPageAttachAvailable: boolean;
  focusedProviderId?: ProviderId | null;
  routeFocusKey?: string | null;
  i18n: RuntimeI18n;
  providers: ProviderSetting[];
  providerSourceDisplayCopy: ProviderSourceDisplayCopy;
  sectionId?: string;
  sessionPageNavigationAvailable: boolean;
  settingsCopy: ReturnType<typeof buildSettingsLocalizedCopy>;
  snapshots: ProviderSnapshot[];
  userLevel: SettingsUserLevel;
  renderConfiguration?: (provider: ProviderSetting) => ReactNode;
  onAttachActiveSessionPage: (providerId: ProviderId) => void;
  onClearPageBinding: (providerId: ProviderId) => void;
  onOpenCredentialSettings: (providerId: CredentialProviderId) => void;
  onOpenSessionPage: (providerId: ProviderId) => void;
  onTogglePermission: (providerId: ProviderId) => void;
  onToggleProvider: (providerId: ProviderId) => void;
};

type Group = "personal" | "api";
const groupFor = (id: ProviderId): Group =>
  getProviderDefinition(id).connectionMode === "credential"
    ? "api"
    : "personal";

export function SettingsQuickSetupSection({
  activeSessionPageAttachAvailable,
  focusedProviderId = null,
  routeFocusKey,
  i18n,
  providers,
  providerSourceDisplayCopy,
  sectionId,
  sessionPageNavigationAvailable,
  settingsCopy,
  snapshots,
  userLevel,
  renderConfiguration,
  onAttachActiveSessionPage,
  onClearPageBinding,
  onOpenCredentialSettings,
  onOpenSessionPage,
  onTogglePermission,
  onToggleProvider,
}: Props) {
  const [group, setGroup] = useState<Group>(
    focusedProviderId ? groupFor(focusedProviderId) : "personal",
  );
  const [openProviderId, setOpenProviderId] = useState<ProviderId | null>(
    () =>
      focusedProviderId ??
      (providers.every((provider) => !provider.displayEnabled)
        ? (getRecommendedFirstSetupProvider(providers)?.id ?? null)
        : null),
  );
  useEffect(() => {
    if (focusedProviderId) {
      setGroup(groupFor(focusedProviderId));
      setOpenProviderId(focusedProviderId);
    }
  }, [focusedProviderId, routeFocusKey]);
  const copy = getSettingsCategoryCopy(i18n.resolvedLocale);
  const firstSetup = providers.every((provider) => !provider.displayEnabled)
    ? getRecommendedFirstSetupProvider(providers)
    : null;
  const snapshotMap = new Map(
    snapshots.map((snapshot) => [snapshot.providerId, snapshot]),
  );

  function runAction(
    provider: ProviderSetting,
    action: SettingsQuickSetupActionModel,
  ) {
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
  function actionDisabled(
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
    <section
      className="dashboard-section settings-section-anchor settings-connections"
      id={sectionId}
    >
      <div
        className="quick-setup-section__provider-groups"
        role="group"
        aria-label={settingsCopy.quickSetup.title}
        data-quick-setup-provider-groups=""
      >
        {(["personal", "api"] as const).map((value) => (
          <button
            key={value}
            className="quick-setup-section__provider-group"
            type="button"
            aria-pressed={group === value}
            data-quick-setup-provider-group={value}
            onClick={() => setGroup(value)}
          >
            <span>
              {value === "personal"
                ? settingsCopy.quickSetup.personalProviders
                : settingsCopy.quickSetup.apiProviders}
            </span>
            <span className="quick-setup-section__provider-group-count">
              {
                providers.filter((provider) => groupFor(provider.id) === value)
                  .length
              }
            </span>
          </button>
        ))}
      </div>
      <div className="settings-connection-list">
        {providers.map((provider) => {
          const snapshot = snapshotMap.get(provider.id);
          const model = snapshot
            ? buildSettingsQuickSetupCardModel(
                provider,
                snapshot,
                settingsCopy,
                userLevel,
                providerSourceDisplayCopy,
              )
            : null;
          const actions = model
            ? [model.primaryAction, ...model.secondaryActions]
                .filter(
                  (action): action is SettingsQuickSetupActionModel => !!action,
                )
                .filter(
                  (action, index, items) =>
                    items.findIndex((item) => item.id === action.id) === index,
                )
            : [];
          const definition = getProviderDefinition(provider.id);
          const open = openProviderId === provider.id;
          const bodyId = `settings-connection-${provider.id}`;
          return (
            <article
              className="settings-connection"
              key={provider.id}
              hidden={groupFor(provider.id) !== group}
              data-quick-setup-provider-id={provider.id}
              data-quick-setup-first-provider-id={
                firstSetup?.id === provider.id ? provider.id : undefined
              }
            >
              <div className="settings-connection__row">
                <span
                  className="settings-connection__monogram"
                  aria-hidden="true"
                >
                  {definition.shortLabel.slice(0, 1)}
                </span>
                <div className="settings-connection__name">
                  <h3>{definition.shortLabel}</h3>
                  <p className="supporting-copy">{provider.label}</p>
                </div>
                {model ? (
                  <span
                    className={`meta-chip settings-connection__status ${model.statusTone === "error" ? "meta-chip--error" : model.statusTone === "warning" ? "meta-chip--warning" : ""}`}
                  >
                    {model.statusLabel}
                  </span>
                ) : null}
                <div
                  data-visibility-provider-id={provider.id}
                  data-visibility-enabled={
                    provider.displayEnabled ? "true" : "false"
                  }
                >
                  <FusionCheckbox
                    checked={provider.displayEnabled}
                    onChange={() => onToggleProvider(provider.id)}
                  >
                    {settingsCopy.quickSetup.visibilityLabel}
                  </FusionCheckbox>
                </div>
                <button
                  className="text-button settings-connection__configure"
                  type="button"
                  aria-expanded={open}
                  aria-controls={bodyId}
                  aria-label={`${copy.configure}: ${provider.label}`}
                  onClick={() => setOpenProviderId(open ? null : provider.id)}
                >
                  {copy.configure}
                  <MaterialActionIcon
                    name="keyboard-arrow-down"
                  />
                </button>
              </div>
              <ControlVisibilityBoundary
                animate
                id={bodyId}
                className="settings-connection__body"
                hidden={!open || groupFor(provider.id) !== group}
              >
                {firstSetup?.id === provider.id ? (
                  <p>
                    {settingsCopy.quickSetup.firstProvider.title(
                      definition.shortLabel,
                    )}
                  </p>
                ) : null}
                {model ? (
                  <p className="supporting-copy">{model.helperText}</p>
                ) : null}
                <div className="credential-actions">
                  {actions.map((action, index) => (
                    <button
                      key={action.id}
                      className="text-button"
                      type="button"
                      data-quick-setup-primary-action={
                        index === 0 ? action.id : undefined
                      }
                      data-quick-setup-secondary-action={
                        index > 0 ? action.id : undefined
                      }
                      disabled={actionDisabled(provider, action)}
                      onClick={() => runAction(provider, action)}
                    >
                      {action.label}
                    </button>
                  ))}
                  {definition.connectionMode === "credential" ? (
                    <button
                      className="text-button"
                      type="button"
                      data-quick-setup-credential-link={provider.id}
                      onClick={() =>
                        onOpenCredentialSettings(
                          provider.id as CredentialProviderId,
                        )
                      }
                    >
                      {settingsCopy.quickSetup.configureConnection}
                    </button>
                  ) : null}
                </div>
                {renderConfiguration?.(provider)}
                {model ? (
                  <MotionDetails
                    className="settings-connection__source-modes"
                    data-quick-setup-source-modes={provider.id}
                    summary={<>{settingsCopy.quickSetup.currentSetupLabel}: {model.currentSetupValue}</>}
                  >
                    <p>
                      {settingsCopy.sources.preferenceLabel}:{" "}
                      {model.sourcePreferenceValue}
                    </p>
                    {model.sourceModes.map((mode) => (
                      <div
                        key={mode.id}
                        data-quick-setup-source-mode={mode.id}
                        data-quick-setup-source-mode-current={String(
                          mode.isCurrent,
                        )}
                      >
                        <h4>{mode.label}</h4>
                        <p className="supporting-copy">{mode.detail}</p>
                      </div>
                    ))}
                  </MotionDetails>
                ) : null}
              </ControlVisibilityBoundary>
            </article>
          );
        })}
      </div>
    </section>
  );
}
