import type { CustomSourceId } from "./custom-sources";
import type { LocalCompanionBridgeFailureCode } from "./local-companion-bridge";
import { normalizeSnapshotTimestamp } from "./snapshot-freshness";
import type { CodexLocalSourceMode } from "./codex-local-bridge";

export function isLocalCompanionCaptureStale(capturedAt: unknown, now = new Date()): boolean {
  const capture = normalizeSnapshotTimestamp(capturedAt);
  const age = now.getTime() - Date.parse(capture ?? "");
  return !Number.isFinite(age) || age < -60_000 || age > 3_600_000;
}

export type LocalCompanionAction =
  | { action: "status" }
  | { action: "pair"; baseUrl: string; pairingCode: string }
  | { action: "refresh-index" }
  | { action: "refresh-source"; sourceId: CustomSourceId }
  | { action: "remove-source"; sourceId: CustomSourceId }
  | { action: "disconnect" }
  | { action: "codex-status" }
  | { action: "pair-codex"; baseUrl: string; pairingCode: string }
  | { action: "set-codex-mode"; mode: CodexLocalSourceMode }
  | { action: "disconnect-codex" };

export type LocalCompanionSettingsStatus = "disconnected" | "connected" | "expired" | "unavailable";
export type LocalCompanionSettingsFailure = LocalCompanionBridgeFailureCode | "permission_required" | "developer_required" | "source_missing" | "conflict" | "superseded";
export type LocalCompanionSettingsView = {
  baseUrl: string | null;
  status: LocalCompanionSettingsStatus;
  checkedAt: string | null;
  failure: LocalCompanionSettingsFailure | null;
  sources: { sourceId: CustomSourceId; label: string; managedId: CustomSourceId | null }[];
  codexMode?: CodexLocalSourceMode;
  codexAvailable?: boolean;
};
