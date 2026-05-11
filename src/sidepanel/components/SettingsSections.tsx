import type { ReactNode } from "react";

import type {
  ProviderId,
  ProviderSetting,
  SummaryItem,
} from "../../providers/types";
import {
  PermissionPrompt,
  type PermissionPromptLabels,
} from "./PermissionPrompt";
import { SummaryStrip } from "./SummaryStrip";

export {
  SettingsCredentialsSection,
  type CredentialProviderSection,
} from "./SettingsCredentialsSection";

type SettingsOverviewSectionProps = {
  ariaLabel: string;
  children?: ReactNode;
  detail: string;
  eyebrow: string;
  items: SummaryItem[];
  sectionId?: string;
  title: string;
};

type SettingsVisibilitySectionProps = {
  disabledDetail: string;
  enabledDetail: string;
  eyebrow: string;
  providers: ProviderSetting[];
  sectionId?: string;
  onToggleProvider: (providerId: ProviderId) => void;
};

type SettingsPermissionsSectionProps = {
  detail: string;
  eyebrow: string;
  labels: PermissionPromptLabels;
  providers: ProviderSetting[];
  sectionId?: string;
  title: string;
  onTogglePermission: (providerId: ProviderId) => void;
};

export function SettingsOverviewSection({
  ariaLabel,
  children,
  detail,
  eyebrow,
  items,
  sectionId,
  title,
}: SettingsOverviewSectionProps) {
  return (
    <section
      className="status-card settings-overview settings-section-anchor"
      id={sectionId}
    >
      <div className="dashboard-section__header">
        <div>
          <p className="section-label">{eyebrow}</p>
          <h2 className="section-title">{title}</h2>
        </div>
        <p className="supporting-copy">{detail}</p>
      </div>

      <SummaryStrip ariaLabel={ariaLabel} items={items} />
      {children}
    </section>
  );
}

export function SettingsVisibilitySection({
  disabledDetail,
  enabledDetail,
  eyebrow,
  providers,
  sectionId,
  onToggleProvider,
}: SettingsVisibilitySectionProps) {
  return (
    <section className="status-card settings-section-anchor" id={sectionId}>
      <p className="section-label">{eyebrow}</p>
      <div className="settings-list">
        {providers.map((provider) => (
          <label
            key={provider.id}
            className="switch-row"
            data-visibility-provider-id={provider.id}
            data-visibility-enabled={provider.enabled ? "true" : "false"}
          >
            <div>
              <p className="switch-row__title">{provider.label}</p>
              <p className="supporting-copy">
                {provider.enabled ? enabledDetail : disabledDetail}
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
        ))}
      </div>
    </section>
  );
}

export function SettingsPermissionsSection({
  detail,
  eyebrow,
  labels,
  providers,
  sectionId,
  title,
  onTogglePermission,
}: SettingsPermissionsSectionProps) {
  return (
    <section className="dashboard-section settings-section-anchor" id={sectionId}>
      <div className="dashboard-section__header">
        <div>
          <p className="section-label">{eyebrow}</p>
          <h2 className="section-title">{title}</h2>
        </div>
        <p className="supporting-copy">{detail}</p>
      </div>

      <div className="provider-shell-list">
        {providers.map((provider) => (
          <PermissionPrompt
            key={provider.id}
            providerId={provider.id}
            providerLabel={provider.label}
            description={provider.description}
            hostsLabel={provider.hostsLabel}
            requiresHostAccess={(provider.hostOrigins?.length ?? 0) > 0}
            status={provider.status}
            labels={labels}
            onToggle={() => onTogglePermission(provider.id)}
          />
        ))}
      </div>
    </section>
  );
}
