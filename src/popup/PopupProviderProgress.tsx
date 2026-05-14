import type {
  ProgressColorBand,
  ProgressDisplayStyle,
  ProgressItemsBySurface,
} from "../providers/types";
import type { RuntimeI18n } from "../shared/i18n";
import { ProviderProgressItemList } from "../sidepanel/components/ProviderProgressItemList";
import type { ProviderViewModel } from "../sidepanel/view-models";

type PopupProviderProgressProps = {
  i18n: RuntimeI18n;
  progressColorBands: readonly ProgressColorBand[];
  progressDisplayStyle: ProgressDisplayStyle;
  progressItemsBySurface: ProgressItemsBySurface;
  progressThicknessPx: number;
  provider: ProviderViewModel;
};

export function PopupProviderProgress({
  i18n,
  progressColorBands,
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
      progressItemsBySurface={progressItemsBySurface}
      progressThicknessPx={progressThicknessPx}
      provider={provider}
      surface="popup"
    />
  );
}
