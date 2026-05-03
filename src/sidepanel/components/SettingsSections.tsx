import type {
  ProviderId,
  ProviderSetting,
  SummaryItem,
} from "../../providers/types";
import type { SettingsSectionId } from "../settings-section-ids";
import { SummaryStrip } from "./SummaryStrip";

type SettingsOverviewSectionProps = {
  ariaLabel: string;
  detail: string;
  eyebrow: string;
  items: SummaryItem[];
  title: string;
};

type SettingsVisibilitySectionProps = {
  disabledDetail: string;
  enabledDetail: string;
  eyebrow: string;
  providers: ProviderSetting[];
  sectionId: SettingsSectionId;
  onToggleProvider: (providerId: ProviderId) => void;
};

export function SettingsOverviewSection({
  ariaLabel,
  detail,
  eyebrow,
  items,
  title,
}: SettingsOverviewSectionProps) {
  return (
    <section className="status-card settings-overview">
      <div className="dashboard-section__header">
        <div>
          <p className="section-label">{eyebrow}</p>
          <h2 className="section-title">{title}</h2>
        </div>
        <p className="supporting-copy">{detail}</p>
      </div>

      <SummaryStrip ariaLabel={ariaLabel} items={items} />
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
