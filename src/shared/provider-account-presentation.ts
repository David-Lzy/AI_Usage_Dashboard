import type {
  PopupProviderAccountPresentationByProvider,
  PopupProviderAccountPresentationMode,
  ProviderId,
} from "../providers/types";
import { isProviderId } from "../providers/provider-definitions";

export const DEFAULT_POPUP_PROVIDER_ACCOUNT_PRESENTATION_MODE =
  "select" satisfies PopupProviderAccountPresentationMode;

export const POPUP_PROVIDER_ACCOUNT_PRESENTATION_MODES = [
  "select",
  "cycle",
  "cards",
] as const satisfies readonly PopupProviderAccountPresentationMode[];

export function isPopupProviderAccountPresentationMode(
  value: unknown,
): value is PopupProviderAccountPresentationMode {
  return POPUP_PROVIDER_ACCOUNT_PRESENTATION_MODES.some(
    (mode) => mode === value,
  );
}

export function normalizePopupProviderAccountPresentationByProvider(
  value: unknown,
): PopupProviderAccountPresentationByProvider {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      ([providerId, mode]) =>
        isProviderId(providerId) &&
        isPopupProviderAccountPresentationMode(mode),
    ),
  ) as PopupProviderAccountPresentationByProvider;
}

export function resolvePopupProviderAccountPresentationMode(
  value: PopupProviderAccountPresentationByProvider | undefined,
  providerId: ProviderId,
): PopupProviderAccountPresentationMode {
  return (
    value?.[providerId] ?? DEFAULT_POPUP_PROVIDER_ACCOUNT_PRESENTATION_MODE
  );
}
