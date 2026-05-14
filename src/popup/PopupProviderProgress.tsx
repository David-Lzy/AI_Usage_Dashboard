import type {
  ProgressDisplayStyle,
  ProgressItemsBySurface,
} from "../providers/types";
import type { RuntimeI18n } from "../shared/i18n";
import { ProviderProgressItemList } from "../sidepanel/components/ProviderProgressItemList";
import type { ProviderViewModel } from "../sidepanel/view-models";

type PopupProviderProgressProps = {
  i18n: RuntimeI18n;
  progressDisplayStyle: ProgressDisplayStyle;
  progressItemsBySurface: ProgressItemsBySurface;
  provider: ProviderViewModel;
};

export function PopupProviderProgress({
  i18n,
  progressDisplayStyle,
  progressItemsBySurface,
  provider,
}: PopupProviderProgressProps) {
  return (
    <ProviderProgressItemList
      density="compact"
      displayStyle={progressDisplayStyle}
      i18n={i18n}
      progressItemsBySurface={progressItemsBySurface}
      provider={provider}
      surface="popup"
    />
  );
}
