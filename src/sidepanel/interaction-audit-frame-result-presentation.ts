import type { buildOperatorWorkspaceLocalizedCopy } from "../shared/operator-workspace-localized-copy";
import type {
  AuditFrameReadiness,
  AuditPresetResult,
} from "./interaction-audit-frame-actions";

type InteractionAuditFrameResultsCopy = ReturnType<
  typeof buildOperatorWorkspaceLocalizedCopy
>["interactionAudit"]["frameResults"];

export type InteractionAuditFrameDisplayStatus = {
  tone: "neutral" | "warning";
  message: string;
  rawDetailLabel?: string;
  rawMessage?: string;
};

export function presentAuditFrameReadiness(
  readiness: AuditFrameReadiness,
  copy: InteractionAuditFrameResultsCopy,
): InteractionAuditFrameDisplayStatus {
  return {
    tone: "neutral",
    message: copy.readiness[readiness.code] ?? readiness.message,
    ...(readiness.rawMessage
      ? {
          rawDetailLabel: copy.rawDetailLabel,
          rawMessage: readiness.rawMessage,
        }
      : {}),
  };
}

export function presentAuditPresetResult(
  result: AuditPresetResult,
  copy: InteractionAuditFrameResultsCopy,
): InteractionAuditFrameDisplayStatus {
  return {
    tone: result.ok ? "neutral" : "warning",
    message: copy.presets[result.code] ?? result.message,
    ...(result.rawMessage
      ? {
          rawDetailLabel: copy.rawDetailLabel,
          rawMessage: result.rawMessage,
        }
      : {}),
  };
}
