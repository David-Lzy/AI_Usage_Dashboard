import type {
  PopupCircularProgressItemsPerRow,
  ProgressColorAppearance,
  ProgressColorBand,
  ProgressDisplayStyle,
  ProgressItemsBySurface,
  ResetTimeDisplayMode,
} from "../providers/types";
import type { RuntimeI18n } from "../shared/i18n";
import type { ProviderViewModel } from "../shared/provider-view-models";
import { ProviderProgressItemList } from "../shared/components/ProviderProgressItemList";
import { DEFAULT_RESET_TIME_DISPLAY_MODE } from "../shared/reset-time-display";

type PopupProviderProgressProps = {
  i18n: RuntimeI18n;
  progressColorAppearance?: ProgressColorAppearance;
  progressColorBands: readonly ProgressColorBand[];
  popupCircularProgressItemsPerRow: PopupCircularProgressItemsPerRow;
  progressDisplayStyle: ProgressDisplayStyle;
  progressItemsBySurface: ProgressItemsBySurface;
  progressThicknessPx: number;
  provider: ProviderViewModel;
  resetTimeDisplayMode?: ResetTimeDisplayMode;
};

export function PopupProviderProgress({
  i18n,
  progressColorAppearance,
  progressColorBands,
  popupCircularProgressItemsPerRow,
  progressDisplayStyle,
  progressItemsBySurface,
  progressThicknessPx,
  provider,
  resetTimeDisplayMode = DEFAULT_RESET_TIME_DISPLAY_MODE,
}: PopupProviderProgressProps) {
  return (
    <ProviderProgressItemList
      density="compact"
      displayStyle={progressDisplayStyle}
      i18n={i18n}
      progressColorAppearance={progressColorAppearance}
      progressColorBands={progressColorBands}
      popupCircularProgressItemsPerRow={popupCircularProgressItemsPerRow}
      progressItemsBySurface={progressItemsBySurface}
      progressThicknessPx={progressThicknessPx}
      provider={provider}
      resetTimeDisplayMode={resetTimeDisplayMode}
      surface="popup"
    />
  );
}
