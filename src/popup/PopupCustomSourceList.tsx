import type {
  PopupCircularProgressItemsPerRow,
  ProgressColorAppearance,
  ProgressColorBand,
  ProgressDisplayStyle,
  ProgressItemsBySurface,
} from "../providers/types";
import { CustomSourceProgressItemList } from "../shared/components/CustomSourceProgressItemList";
import { StatusBadge } from "../shared/components/StatusBadge";
import type { CustomSourceViewModel } from "../shared/custom-source-view-models";
import type { RuntimeI18n } from "../shared/i18n";
import type { SettingsRouteFocus } from "../shared/sidepanel-route-state";

type PopupCustomSourceListProps = {
  ariaLabel: string;
  sources: readonly CustomSourceViewModel[];
  i18n: RuntimeI18n;
  progressColorAppearance?: ProgressColorAppearance;
  progressColorBands: readonly ProgressColorBand[];
  popupCircularProgressItemsPerRow: PopupCircularProgressItemsPerRow;
  progressDisplayStyle: ProgressDisplayStyle;
  progressItemsBySurface: ProgressItemsBySurface;
  progressThicknessPx: number;
  settingsFocus: SettingsRouteFocus | null;
  onOpenSettings: (settingsFocus: SettingsRouteFocus | null) => void | Promise<void>;
};

function buildPopupCustomSourceCopy(i18n: RuntimeI18n) {
  const zh = i18n.resolvedLocale === "zh-CN";

  return {
    custom: zh ? "自定义" : "Custom",
    settings: zh ? "设置" : "Settings",
    noSnapshot: zh ? "尚未同步到可显示的数据。" : "No synced data yet.",
    noSummary: zh ? "自定义 JSON 端点" : "Custom JSON endpoint",
  };
}

function getPrimaryDetail(source: CustomSourceViewModel, fallback: string): string {
  if (source.usageSummary) {
    return source.usageSummary;
  }

  if (source.warningReason) {
    return source.warningReason;
  }

  return source.hasSnapshot ? fallback : "";
}

export function PopupCustomSourceList({
  ariaLabel,
  sources,
  i18n,
  progressColorAppearance,
  progressColorBands,
  popupCircularProgressItemsPerRow,
  progressDisplayStyle,
  progressItemsBySurface,
  progressThicknessPx,
  settingsFocus,
  onOpenSettings,
}: PopupCustomSourceListProps) {
  if (sources.length === 0) {
    return null;
  }

  const copy = buildPopupCustomSourceCopy(i18n);

  return (
    <section className="popup-quota-section" aria-label={ariaLabel}>
      <div className="popup-provider-list">
        {sources.map((source, index) => {
          const hasProgressItems = source.progressItems.length > 0;
          const primaryDetail = getPrimaryDetail(source, copy.noSummary);

          return (
            <article
              key={source.sourceId}
              className={`popup-provider-card popup-provider-card--custom popup-provider-card--${source.displayTone}${
                hasProgressItems ? " popup-provider-card--quota-first" : ""
              }`}
              data-popup-custom-source-id={source.sourceId}
              data-theme-local-surface={
                index === 0 ? "popup-first-custom-source-card" : undefined
              }
            >
              <div className="popup-provider-card__header">
                <div className="popup-provider-card__identity">
                  <div className="popup-provider-card__title-row">
                    <p className="popup-provider-card__provider">
                      {source.label}
                    </p>
                    <div className="popup-provider-card__header-actions">
                      <button
                        className="text-button text-button--inline popup-provider-card__header-action"
                        type="button"
                        onClick={() => {
                          void onOpenSettings(settingsFocus);
                        }}
                      >
                        {copy.settings}
                      </button>
                    </div>
                    <div className="popup-provider-card__status">
                      <StatusBadge
                        compact
                        label={source.statusLabel}
                        tone={source.displayTone}
                      />
                    </div>
                  </div>
                  {!hasProgressItems ? (
                    <p className="popup-provider-card__plan">
                      {source.description ?? copy.custom}
                    </p>
                  ) : null}
                </div>
              </div>

              {hasProgressItems ? (
                <div
                  className={`popup-provider-card__progress popup-provider-card__progress--${progressDisplayStyle}`}
                >
                  <CustomSourceProgressItemList
                    density="compact"
                    displayStyle={progressDisplayStyle}
                    i18n={i18n}
                    progressColorAppearance={progressColorAppearance}
                    progressColorBands={progressColorBands}
                    popupCircularProgressItemsPerRow={
                      popupCircularProgressItemsPerRow
                    }
                    progressItemsBySurface={progressItemsBySurface}
                    progressThicknessPx={progressThicknessPx}
                    source={source}
                    surface="popup"
                  />
                </div>
              ) : (
                <>
                  <div className="popup-provider-card__chips">
                    <span className="meta-chip">{copy.custom}</span>
                    <span className="meta-chip">{source.lastSyncLabel}</span>
                  </div>
                  <p className="supporting-copy">
                    {primaryDetail || copy.noSnapshot}
                  </p>
                </>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
