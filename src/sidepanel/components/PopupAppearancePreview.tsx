import type { AppSettings } from "../../providers/types";
import type { RuntimeI18n } from "../../shared/i18n";

type PopupAppearancePreviewProps = {
  i18n: RuntimeI18n;
  settings: Pick<
    AppSettings,
    "popupCornerStyle" | "popupShadowStyle" | "popupSizePreset"
  >;
};

export function PopupAppearancePreview({
  i18n,
  settings,
}: PopupAppearancePreviewProps) {
  return (
    <div
      className="popup-appearance-preview-card"
      data-popup-size-preset={settings.popupSizePreset}
      data-popup-corner-style={settings.popupCornerStyle}
      data-popup-shadow-style={settings.popupShadowStyle}
    >
      <div className="dashboard-section__header">
        <div>
          <p className="section-label">
            {i18n.t("settings.popup_appearance_preview.eyebrow")}
          </p>
          <h2 className="section-title">
            {i18n.t("settings.popup_appearance_preview.title")}
          </h2>
        </div>
        <p className="supporting-copy">
          {i18n.t("settings.popup_appearance_preview.detail")}
        </p>
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
                {i18n.t("settings.popup_appearance_preview.sample_quota")}
              </p>
            </div>
            <div className="popup-appearance-preview-progress">
              <span />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
