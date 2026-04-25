import { createUsageThresholdDiagnostic } from "./diagnostics";
import type {
  ProviderDiagnostic,
  ProviderId,
  ProviderSnapshot,
  SyncStatus,
} from "./types";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatSyncTimestamp(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function addMonths(date: Date, months: number): Date {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
}

export function formatCalendarDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function buildUsageSignal(
  used: number | null,
  total: number | null,
  warningThresholdPercent: number,
  unitLabel: string,
  overageCount: number = 0,
  providerId: ProviderId | null = null,
): {
  syncStatus: SyncStatus;
  tone: ProviderSnapshot["tone"];
  warningReason: string | null;
  warningDiagnostic: ProviderDiagnostic | null;
} {
  if (overageCount > 0) {
    const warningReason = `${overageCount} pay-per-use ${unitLabel} recorded this cycle`;

    return {
      syncStatus: "warning",
      tone: "warning",
      warningReason,
      warningDiagnostic: providerId
        ? createUsageThresholdDiagnostic({
            providerId,
            usageThresholdKind: "overage_detected",
            rawMessage: warningReason,
            overageCount,
            unitLabel,
          })
        : null,
    };
  }

  if (used === null || total === null || total <= 0) {
    return {
      syncStatus: "ok",
      tone: "neutral",
      warningReason: null,
      warningDiagnostic: null,
    };
  }

  const usagePercent = Math.round((used / total) * 100);

  if (usagePercent >= warningThresholdPercent) {
    const warningReason = `${usagePercent}% of included ${unitLabel} consumed`;

    return {
      syncStatus: "warning",
      tone: "warning",
      warningReason,
      warningDiagnostic: providerId
        ? createUsageThresholdDiagnostic({
            providerId,
            usageThresholdKind: "threshold_warning",
            rawMessage: warningReason,
            usagePercent,
            thresholdPercent: warningThresholdPercent,
            unitLabel,
          })
        : null,
    };
  }

  return {
    syncStatus: "ok",
    tone: "neutral",
    warningReason: null,
    warningDiagnostic: null,
  };
}
