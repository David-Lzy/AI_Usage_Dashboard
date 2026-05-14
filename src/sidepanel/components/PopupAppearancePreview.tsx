import type { AppSettings } from "../../providers/types";
import { buildRuntimeCommonCopy, type RuntimeI18n } from "../../shared/i18n";
import { MaterialInfoTooltip } from "./MaterialInfoTooltip";
import { UsageProgress } from "./UsageProgress";

type PopupAppearancePreviewProps = {
  i18n: RuntimeI18n;
  settings: Pick<
    AppSettings,
    | "popupCornerStyle"
    | "progressColorBands"
    | "progressThicknessPx"
    | "popupProgressStyle"
    | "popupShadowStyle"
    | "popupSizePreset"
  >;
};

export function PopupAppearancePreview({
  i18n,
  settings,
}: PopupAppearancePreviewProps) {
  const sampleQuotaLabel = i18n.t(
    "settings.popup_appearance_preview.sample_quota",
  );
  const remainingLabel = buildRuntimeCommonCopy(i18n).remaining;
  const sampleRemainingLabel =
    settings.popupProgressStyle === "line" ? `51% ${remainingLabel}` : "51%";

  return (
    <div
      className="popup-appearance-preview-card"
      data-popup-size-preset={settings.popupSizePreset}
      data-popup-corner-style={settings.popupCornerStyle}
      data-popup-shadow-style={settings.popupShadowStyle}
      data-popup-progress-style={settings.popupProgressStyle}
    >
      <div className="dashboard-section__header">
        <div>
          <p className="section-label">
            {i18n.t("settings.popup_appearance_preview.eyebrow")}
          </p>
          <div className="section-title-with-info">
            <h2 className="section-title">
              {i18n.t("settings.popup_appearance_preview.title")}
            </h2>
            <MaterialInfoTooltip>
              {i18n.t("settings.popup_appearance_preview.detail")}
            </MaterialInfoTooltip>
          </div>
        </div>
      </div>

      <div
        className="popup-appearance-preview-frame"
        aria-label={i18n.t("settings.popup_appearance_preview.title")}
      >
        <div className="popup-appearance-preview-surface">
          <div className="popup-appearance-preview-header">
            <div>
              <p className="section-label">{i18n.t("popup.header.eyebrow")}</p>
              <h3 className="section-title">{i18n.t("popup.header.title")}</h3>
            </div>
            <div className="popup-appearance-preview-actions">
              <span>
                {i18n.t("settings.popup_appearance_preview.sample_refresh")}
              </span>
              <span>{i18n.t("settings.popup_appearance_preview.sample_tab")}</span>
            </div>
          </div>

          <div className="popup-appearance-preview-provider">
            <div>
              <p className="popup-appearance-preview-provider__title">
                {i18n.t("settings.popup_appearance_preview.sample_provider")}
              </p>
              <p className="supporting-copy">
                {sampleQuotaLabel}
              </p>
            </div>
            <div
              className={`popup-appearance-preview-progress popup-appearance-preview-progress--${settings.popupProgressStyle}`}
            >
              <UsageProgress
                used={49}
                remaining={51}
                total={100}
                tone="neutral"
                label={sampleQuotaLabel}
                displayStyle={settings.popupProgressStyle}
                progressColorBands={settings.progressColorBands}
                progressThicknessPx={settings.progressThicknessPx}
                valueKind="remaining"
                valueLabel={sampleRemainingLabel}
                valueText={`${sampleQuotaLabel}: 51% ${remainingLabel}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
