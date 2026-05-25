import type {
  PopupCircularProgressItemsPerRow,
  ProgressColorBand,
  ProgressDisplayStyle,
  ProgressItemsBySurface,
} from "../providers/types";
import type { RuntimeI18n } from "../shared/i18n";
import type { ProviderViewModel } from "../shared/provider-view-models";
import { ProviderProgressItemList } from "../shared/components/ProviderProgressItemList";

type PopupProviderProgressProps = {
  i18n: RuntimeI18n;
  progressColorBands: readonly ProgressColorBand[];
  popupCircularProgressItemsPerRow: PopupCircularProgressItemsPerRow;
  progressDisplayStyle: ProgressDisplayStyle;
  progressItemsBySurface: ProgressItemsBySurface;
  progressThicknessPx: number;
  provider: ProviderViewModel;
};

export function PopupProviderProgress({
  i18n,
  progressColorBands,
  popupCircularProgressItemsPerRow,
  progressDisplayStyle,
  progressItemsBySurface,
  progressThicknessPx,
  provider,
}: PopupProviderProgressProps) {
  return (
    <ProviderProgressItemList
      density="compact"
      displayStyle={progressDisplayStyle}
      i18n={i18n}
      progressColorBands={progressColorBands}
      popupCircularProgressItemsPerRow={popupCircularProgressItemsPerRow}
      progressItemsBySurface={progressItemsBySurface}
      progressThicknessPx={progressThicknessPx}
      provider={provider}
      surface="popup"
    />
  );
}
