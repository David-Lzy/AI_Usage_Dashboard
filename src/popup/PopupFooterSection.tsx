import { BUILD_INFO } from "../shared/build-info";
import type { RuntimeI18n } from "../shared/i18n";

type PopupFooterSectionProps = {
  headerDetail: string;
  hasFeaturedProviderCards: boolean;
  runtimeI18n: RuntimeI18n;
};

export function PopupFooterSection({
  headerDetail,
  hasFeaturedProviderCards,
  runtimeI18n,
}: PopupFooterSectionProps) {
  return (
    <footer
      className="popup-footer"
      aria-label={runtimeI18n.t("popup.header.eyebrow")}
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
          <div>
            {"© 2026 "}
            <a
              href={BUILD_INFO.sourceOrigin}
              target="_blank"
              rel="noopener noreferrer"
            >
              David-Lzy
            </a>
            {" · "}
            <a
              href={`${BUILD_INFO.sourceOrigin}/blob/main/LICENSE`}
              target="_blank"
              rel="noopener noreferrer"
            >
              AGPL-3.0
            </a>
            {" · "}
            <a
              href={BUILD_INFO.sourceOrigin}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
          <div>
            {BUILD_INFO.gitCommit} · {BUILD_INFO.buildTimestamp.slice(0, 10)}
          </div>
        </div>
      </div>
    </footer>
  );
}
