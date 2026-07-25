import { useState } from "react";

import type {
  DisplaySurface,
  ProviderServiceStatusVisibilityBySurface,
  ProviderServiceStatusVendorId,
} from "../../providers/types";
import type { ResolvedAppLocale } from "../../shared/i18n";
import {
  PROVIDER_SERVICE_STATUS_CONFIG,
  PROVIDER_SERVICE_STATUS_SURFACES,
  setProviderServiceStatusVisibility,
} from "../../shared/provider-service-status";
import { requestProviderServiceStatusHostAccess } from "../../shared/provider-service-status-host-access";
import { buildProviderServiceStatusLocalizedCopy } from "../../shared/provider-service-status-localized-copy";
import type { buildSettingsLocalizedCopy } from "../../shared/settings-localized-copy";
import { MaterialInfoTooltip } from "./MaterialInfoTooltip";

export function ProviderServiceStatusPreferenceControls({
  locale,
  onChange,
  requestHostAccess = requestProviderServiceStatusHostAccess,
  settingsCopy,
  value,
}: {
  locale: ResolvedAppLocale;
  onChange: (value: ProviderServiceStatusVisibilityBySurface) => void;
  requestHostAccess?: (
    vendorId: ProviderServiceStatusVendorId,
  ) => Promise<boolean>;
  settingsCopy: ReturnType<typeof buildSettingsLocalizedCopy>;
  value: ProviderServiceStatusVisibilityBySurface;
}) {
  const copy = buildProviderServiceStatusLocalizedCopy(locale);
  const [pendingVendorId, setPendingVendorId] =
    useState<ProviderServiceStatusVendorId | null>(null);
  const [deniedVendorId, setDeniedVendorId] =
    useState<ProviderServiceStatusVendorId | null>(null);

  async function handleVisibilityChange(
    vendorId: ProviderServiceStatusVendorId,
    surface: DisplaySurface,
    visible: boolean,
  ) {
    if (visible) {
      setPendingVendorId(vendorId);
      const granted = await requestHostAccess(vendorId);
      setPendingVendorId(null);
      if (!granted) {
        setDeniedVendorId(vendorId);
        return;
      }
    }

    setDeniedVendorId(null);
    onChange(
      setProviderServiceStatusVisibility(
        value,
        surface,
        PROVIDER_SERVICE_STATUS_CONFIG[vendorId].brandId,
        visible,
      ),
    );
  }

  return (
    <section
      className="provider-service-status-preferences"
      data-provider-service-status-preferences=""
    >
      <div>
        <p className="section-label">{copy.eyebrow}</p>
        <div className="section-title-with-info">
          <h3 className="section-title">{copy.settingsTitle}</h3>
          <MaterialInfoTooltip>{copy.settingsDetail}</MaterialInfoTooltip>
        </div>
      </div>
      <div className="provider-service-status-preferences__vendors">
        {(Object.keys(PROVIDER_SERVICE_STATUS_CONFIG) as ProviderServiceStatusVendorId[]).map(
          (vendorId) => {
            const config = PROVIDER_SERVICE_STATUS_CONFIG[vendorId];
            return (
              <fieldset
                className="provider-service-status-preferences__vendor"
                key={vendorId}
                disabled={pendingVendorId === vendorId}
              >
                <legend>{copy.vendors[vendorId]}</legend>
                <div className="provider-service-status-preferences__surfaces">
                  {PROVIDER_SERVICE_STATUS_SURFACES.map((surface) => (
                    <label key={surface}>
                      <input
                        type="checkbox"
                        checked={value[surface]?.[config.brandId] === true}
                        onChange={(event) =>
                          void handleVisibilityChange(
                            vendorId,
                            surface,
                            event.currentTarget.checked,
                          )
                        }
                      />
                      <span>{settingsCopy.progressItems.surfaceLabels[surface]}</span>
                    </label>
                  ))}
                </div>
                {deniedVendorId === vendorId ? (
                  <p className="supporting-copy provider-service-status-preferences__error" role="status">
                    {copy.accessDenied}
                  </p>
                ) : null}
              </fieldset>
            );
          },
        )}
      </div>
    </section>
  );
}
