import type { ReactNode } from "react";

import type {
  ProviderId,
  ProviderSetting,
  SummaryItem,
} from "../../providers/types";
import type { ResolvedTextDirection } from "../../shared/i18n";
import {
  PermissionPrompt,
  type PermissionPromptLabels,
} from "./PermissionPrompt";
import { MaterialInfoTooltip } from "./MaterialInfoTooltip";
import { ProviderCarousel } from "./ProviderCarousel";
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
  textDirection?: ResolvedTextDirection;
  onToggleProvider: (providerId: ProviderId) => void;
};

type SettingsPermissionsSectionProps = {
  detail: string;
  eyebrow: string;
  labels: PermissionPromptLabels;
  providers: ProviderSetting[];
  sectionId?: string;
  textDirection?: ResolvedTextDirection;
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
          <div className="section-title-with-info">
            <h2 className="section-title">{title}</h2>
            <MaterialInfoTooltip>{detail}</MaterialInfoTooltip>
          </div>
        </div>
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
  textDirection = "ltr",
  onToggleProvider,
}: SettingsVisibilitySectionProps) {
  return (
    <section className="status-card settings-section-anchor" id={sectionId}>
      <p className="section-label">{eyebrow}</p>
      <ProviderCarousel
        ariaLabel={`${eyebrow} providers`}
        textDirection={textDirection}
        items={providers.map((provider) => ({
          id: provider.id,
          label: provider.label,
          content: (
            <label
              className="switch-row"
              data-visibility-provider-id={provider.id}
              data-visibility-enabled={provider.displayEnabled ? "true" : "false"}
            >
              <div>
                <p className="switch-row__title">{provider.label}</p>
                <p className="supporting-copy">
                  {provider.displayEnabled ? enabledDetail : disabledDetail}
                </p>
              </div>
              <input
                className="switch-row__control"
                type="checkbox"
                checked={provider.displayEnabled}
                data-visibility-toggle={provider.id}
                onChange={() => onToggleProvider(provider.id)}
              />
            </label>
          ),
        }))}
      />
    </section>
  );
}

export function SettingsPermissionsSection({
  detail,
  eyebrow,
  labels,
  providers,
  sectionId,
  textDirection = "ltr",
  title,
  onTogglePermission,
}: SettingsPermissionsSectionProps) {
  return (
    <section className="dashboard-section settings-section-anchor" id={sectionId}>
      <div className="dashboard-section__header">
        <div>
          <p className="section-label">{eyebrow}</p>
          <div className="section-title-with-info">
            <h2 className="section-title">{title}</h2>
            <MaterialInfoTooltip>{detail}</MaterialInfoTooltip>
          </div>
        </div>
      </div>

      <ProviderCarousel
        ariaLabel={`${title} providers`}
        textDirection={textDirection}
        items={providers.map((provider) => ({
          id: provider.id,
          label: provider.label,
          content: (
            <PermissionPrompt
              providerId={provider.id}
              providerLabel={provider.label}
              description={provider.description}
              hostsLabel={provider.hostsLabel}
              requiresHostAccess={(provider.hostOrigins?.length ?? 0) > 0}
              status={provider.status}
              labels={labels}
              onToggle={() => onTogglePermission(provider.id)}
            />
          ),
        }))}
      />
    </section>
  );
}
