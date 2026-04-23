import type {
  ProviderId,
  ProviderSourceKind,
  ProviderSourcePreference,
} from "../providers/types";
import {
  getSourceAttemptOrder,
  getSourceKindLabel,
  getSourcePreferenceLabel,
} from "./provider-sources";

export type SourceAttemptFailureCode =
  | "host_access_missing"
  | "credential_missing"
  | "open_page_required"
  | "logged_out"
  | "sync_error";

export type SourceAttemptFailure = {
  kind: ProviderSourceKind;
  code: SourceAttemptFailureCode;
  detail: string;
};

export function buildSourceSelectionReason(
  providerId: ProviderId,
  preference: ProviderSourcePreference,
  selectedKind: ProviderSourceKind,
  hadFallback: boolean,
): string {
  const selectedLabel = getSourceKindLabel(selectedKind);
  const orderedKinds = getSourceAttemptOrder(providerId, preference);

  if (orderedKinds.length <= 1) {
    return `${selectedLabel} is the only shipped source for ${providerId}.`;
  }

  if (hadFallback) {
    if (preference === "auto") {
      return `Auto fell back to ${selectedLabel}.`;
    }

    return `${getSourcePreferenceLabel(preference)} preference fell back to ${selectedLabel}.`;
  }

  if (preference === "auto") {
    return `Auto selected ${selectedLabel}.`;
  }

  return `${selectedLabel} selected by user preference.`;
}

export function buildSourceFallbackReason(
  failure: SourceAttemptFailure,
): string {
  return `${getSourceKindLabel(failure.kind)} unavailable: ${failure.detail}`;
}

export function buildNoSourceAvailableReason(
  preference: ProviderSourcePreference,
): string {
  if (preference === "auto") {
    return "Auto could not find an available live source.";
  }

  return `${getSourcePreferenceLabel(preference)} preference could not find an available live source.`;
}

export function shouldAttemptFallback(
  failure: SourceAttemptFailure,
): boolean {
  return failure.code !== "host_access_missing";
}
