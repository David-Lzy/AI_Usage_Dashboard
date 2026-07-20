import { BUILD_INFO } from "../shared/build-info";
import type { RuntimeI18n } from "../shared/i18n";
import { PopupMaterialIcon } from "./PopupMaterialIcon";

type PopupFooterSectionProps = {
  headerDetail: string;
  hasFeaturedProviderCards: boolean;
  isCollapsed: boolean;
  runtimeI18n: RuntimeI18n;
  onToggleCollapsed: () => void;
};

export function PopupFooterSection({
  headerDetail,
  hasFeaturedProviderCards,
  isCollapsed,
  runtimeI18n,
  onToggleCollapsed,
}: PopupFooterSectionProps) {
  const toggleTitle = runtimeI18n.t(
    isCollapsed
      ? "popup.actions.show_footer_info"
      : "popup.actions.hide_footer_info",
  );

  return (
    <footer
      className={`popup-footer${isCollapsed ? " popup-footer--collapsed" : ""}`}
      aria-label={runtimeI18n.t("popup.header.eyebrow")}
    >
      <button
        className="icon-button popup-footer__collapse-toggle"
        type="button"
        aria-controls="popup-footer-content"
        aria-expanded={!isCollapsed}
        aria-label={toggleTitle}
        title={toggleTitle}
        onClick={onToggleCollapsed}
      >
        <PopupMaterialIcon
          name={
            isCollapsed ? "keyboard-arrow-up" : "keyboard-arrow-down"
          }
        />
      </button>
      <div
        id="popup-footer-content"
        className="popup-footer__content"
        data-i18n-layout-contract="popup-footer"
        hidden={isCollapsed}
      >
        <div className="popup-footer__heading">
          <p
            className="section-label"
            data-theme-local-surface="popup-footer-label"
          >
            {runtimeI18n.t("popup.header.eyebrow")}
          </p>
          <p className="popup-footer__title">
            {runtimeI18n.t("popup.header.title")}
          </p>
        </div>
        <div className="popup-footer__meta">
          {!hasFeaturedProviderCards ? (
            <p className="popup-footer__detail">{headerDetail}</p>
          ) : null}
          <div className="popup-footer__about">
            <div>AI Usage Dashboard {BUILD_INFO.version}</div>
            <div className="popup-footer__legal">
              <span className="popup-footer__owner">
                {"© 2026 "}
                <a
                  href={BUILD_INFO.sourceOrigin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  David-Lzy
                </a>
              </span>
              <span className="popup-footer__public-links">
                <a
                  href={`${BUILD_INFO.sourceOrigin}/blob/main/LICENSE`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  AGPL-3.0
                </a>
                <span aria-hidden="true">·</span>
                <a
                  href={BUILD_INFO.sourceOrigin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
