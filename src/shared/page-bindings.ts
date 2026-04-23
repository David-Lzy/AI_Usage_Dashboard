import type { ProviderPageBinding } from "../providers/types";
import type { PageSessionResult } from "../providers/page-session";

type PageBindingMode = ProviderPageBinding["mode"];

type BoundPageBindingInput = {
  mode?: PageBindingMode;
  tabId: number;
  matchedUrl?: string | null;
  matchedTitle?: string | null;
  updatedAt: string;
};

function normalizeNullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function normalizeTabId(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function createEmptyPageBinding(
  mode: PageBindingMode = "auto",
): ProviderPageBinding {
  return {
    mode,
    status: "unbound",
    tabId: null,
    matchedUrl: null,
    matchedTitle: null,
    updatedAt: null,
  };
}

export function normalizePageBinding(
  value: unknown,
  fallbackMode: PageBindingMode = "auto",
): ProviderPageBinding {
  if (!value || typeof value !== "object") {
    return createEmptyPageBinding(fallbackMode);
  }

  const rawBinding = value as Partial<ProviderPageBinding>;
  const mode = rawBinding.mode === "bound" ? "bound" : fallbackMode;
  const tabId = normalizeTabId(rawBinding.tabId);
  const matchedUrl = normalizeNullableString(rawBinding.matchedUrl);
  const matchedTitle = normalizeNullableString(rawBinding.matchedTitle);
  const updatedAt = normalizeNullableString(rawBinding.updatedAt);
  const hasBindingFingerprint =
    tabId !== null || matchedUrl !== null || matchedTitle !== null;
  const status =
    rawBinding.status === "bound" || rawBinding.status === "stale"
      ? rawBinding.status
      : hasBindingFingerprint
        ? "bound"
        : "unbound";

  return {
    mode,
    status,
    tabId,
    matchedUrl,
    matchedTitle,
    updatedAt,
  };
}

export function createBoundPageBinding({
  mode = "bound",
  tabId,
  matchedUrl = null,
  matchedTitle = null,
  updatedAt,
}: BoundPageBindingInput): ProviderPageBinding {
  return {
    mode,
    status: "bound",
    tabId,
    matchedUrl,
    matchedTitle,
    updatedAt,
  };
}

export function clearPageBinding(): ProviderPageBinding {
  return createEmptyPageBinding("auto");
}

export function createPageBindingFromTab({
  tabId,
  matchedUrl = null,
  matchedTitle = null,
  updatedAt,
  mode = "bound",
}: BoundPageBindingInput): ProviderPageBinding {
  return createBoundPageBinding({
    mode,
    tabId,
    matchedUrl,
    matchedTitle,
    updatedAt,
  });
}

export function markPageBindingStale(
  binding: ProviderPageBinding | null | undefined,
): ProviderPageBinding {
  const normalizedBinding = normalizePageBinding(binding);

  return {
    ...normalizedBinding,
    status:
      normalizedBinding.tabId !== null ||
      normalizedBinding.matchedUrl !== null ||
      normalizedBinding.matchedTitle !== null
        ? "stale"
        : "unbound",
  };
}

export function hasPageBindingFingerprint(
  binding: ProviderPageBinding | null | undefined,
): boolean {
  const normalizedBinding = normalizePageBinding(binding);

  return (
    normalizedBinding.tabId !== null ||
    normalizedBinding.matchedUrl !== null ||
    normalizedBinding.matchedTitle !== null
  );
}

export function reconcilePageBindingFromSessionResult(
  previousBinding: ProviderPageBinding | null | undefined,
  result: PageSessionResult,
  updatedAt: string,
): ProviderPageBinding {
  const normalizedBinding = normalizePageBinding(previousBinding);

  if (result.status === "matched") {
    return createBoundPageBinding({
      mode: normalizedBinding.mode === "bound" ? "bound" : "auto",
      tabId: result.target.tabId,
      matchedUrl: result.page.url,
      matchedTitle: result.page.title,
      updatedAt,
    });
  }

  const hasSavedFingerprint = hasPageBindingFingerprint(normalizedBinding);
  const sawBindingAttempt = result.attempts.some(
    (attempt) => attempt.bindingMode === "bound",
  );
  const sawMissingBinding = result.attempts.some(
    (attempt) => attempt.status === "binding_missing",
  );

  if (result.status === "logged_out") {
    return hasSavedFingerprint || sawBindingAttempt
      ? markPageBindingStale(normalizedBinding)
      : createEmptyPageBinding(normalizedBinding.mode);
  }

  if (hasSavedFingerprint || sawBindingAttempt || sawMissingBinding) {
    return markPageBindingStale(normalizedBinding);
  }

  return createEmptyPageBinding(normalizedBinding.mode);
}
