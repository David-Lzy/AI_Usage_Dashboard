import type { ProviderDiagnostic } from "../providers/types";
import type { RuntimeI18n } from "./i18n";
import { getAdapterErrorDiagnosticPresentation } from "./provider-diagnostic-adapter-error-copy";
import { getSourceDiagnosticPresentation } from "./provider-diagnostic-source-copy";
import { getWarningDiagnosticPresentation } from "./provider-diagnostic-warning-copy";

export type ProviderDiagnosticPresentation = {
  label: string;
  summary: string;
};

export function getProviderDiagnosticPresentation(
  diagnostic: ProviderDiagnostic | null | undefined,
  i18n: RuntimeI18n,
): ProviderDiagnosticPresentation | null {
  if (!diagnostic) {
    return null;
  }

  const warningPresentation = getWarningDiagnosticPresentation(diagnostic, i18n);
  const sourcePresentation = getSourceDiagnosticPresentation(diagnostic, i18n);
  const adapterErrorPresentation = getAdapterErrorDiagnosticPresentation(
    diagnostic,
    i18n,
  );

  if (warningPresentation) {
    return warningPresentation;
  }

  if (sourcePresentation) {
    return sourcePresentation;
  }

  if (adapterErrorPresentation) {
    return adapterErrorPresentation;
  }

  return null;
}
