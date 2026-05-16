import type { AppState, ProviderId, ProviderSetting, ProviderSnapshot } from "../providers/types";
import {
  createCredentialDiagnostic,
  createHostAccessDiagnostic,
  createSourceSelectionDiagnostic,
} from "../providers/diagnostics";
import { SAMPLE_APP_STATE } from "../shared/constants";

export type StoreScreenshotSeedPreset =
  | "toolbar-first-quick-glance"
  | "setup-guidance"
  | "honest-contract-or-policy-only"
  | "settings-and-setup-depth"
  | "provider-or-dashboard-depth"
  | "unlock";

export const STORE_SCREENSHOT_SEED_LOCK_STORAGE_KEY =
  "ai-usage-dashboard.store-screenshot-seed-lock";
export const STORE_SCREENSHOT_SEED_BACKUP_STORAGE_KEY =
  "ai-usage-dashboard.store-screenshot-seed-backup";

type StoreScreenshotSeedPresetDefinition = {
  headline: string;
  detail: string;
  appState: AppState | null;
  lockEnabled: boolean;
};

type StoreScreenshotSeedBackupEnvelope = {
  hasBackup: boolean;
  appState: AppState | null;
};

function cloneAppState(state: AppState): AppState {
  return structuredClone(state);
}

function getProviderSetting(state: AppState, providerId: ProviderId): ProviderSetting {
  const setting = state.providerSettings.find((provider) => provider.id === providerId);

  if (!setting) {
    throw new Error(`Missing provider setting for ${providerId}.`);
  }

  return setting;
}

function getProviderSnapshot(state: AppState, providerId: ProviderId): ProviderSnapshot {
  const snapshot = state.providers.find((provider) => provider.providerId === providerId);

  if (!snapshot) {
    throw new Error(`Missing provider snapshot for ${providerId}.`);
  }

  return snapshot;
}

function patchProviderSetting(
  state: AppState,
  providerId: ProviderId,
  patch: Partial<ProviderSetting>,
) {
  Object.assign(getProviderSetting(state, providerId), patch);
}

function patchProviderSnapshot(
  state: AppState,
  providerId: ProviderId,
  patch: Partial<ProviderSnapshot>,
) {
  Object.assign(getProviderSnapshot(state, providerId), patch);
}

function disableAllProviders(state: AppState) {
  for (const provider of state.providerSettings) {
    provider.displayEnabled = false;
  }
}

function applySharedStoreTheme(state: AppState) {
  state.settings.themeMode = "light";
  state.settings.themePreset = "default";
  state.settings.themeCustomSeedHex = null;
}

function buildToolbarFirstQuickGlanceState(): AppState {
  const state = cloneAppState(SAMPLE_APP_STATE);
  disableAllProviders(state);
  applySharedStoreTheme(state);

  for (const providerId of ["cursor-personal-page", "claude-code-team-page", "codex-personal-page"] as const) {
    patchProviderSetting(state, providerId, {
      displayEnabled: true,
      status: "granted",
      credentialStatus: "configured",
    });
    patchProviderSnapshot(state, providerId, {
      syncStatus: "ok",
      tone: "neutral",
      warningReason: null,
      warningDiagnostic: null,
      sourceFallbackDiagnostic: null,
      syncedAt: "2026-04-24 19:40",
      lastSyncLabel: "Synced 2m ago",
    });
  }

  patchProviderSnapshot(state, "cursor-personal-page", {
    used: 36,
    remaining: null,
    total: null,
    resetLabel: "Current billing-period usage",
  });
  patchProviderSnapshot(state, "claude-code-team-page", {
    used: 4,
    remaining: null,
    total: null,
    resetLabel: "Healthy analytics snapshot",
  });
  patchProviderSnapshot(state, "codex-personal-page", {
    planName: "Codex personal usage pages",
    quotaUnit: "percent",
    quotaWindow: "workspace",
    used: 38,
    remaining: 62,
    total: 100,
    resetAt: "2026-04-27 00:00 UTC",
    resetLabel: "62% remaining in the current visible usage window",
    syncSource: "page_parse",
    sourceSelectionReason: "Auto selected Session page.",
    sourceSelectionDiagnostic: createSourceSelectionDiagnostic({
      providerId: "codex-personal-page",
      sourcePreference: "auto",
      selectedKind: "session_page",
      hadFallback: false,
      rawMessage: "Auto selected Session page.",
    }),
    sourceFallbackReason: "Official API is available but this store capture keeps the personal usage-page story in frame.",
    sourceFallbackDiagnostic: null,
  });

  return state;
}

function buildSetupGuidanceState(): AppState {
  const state = cloneAppState(SAMPLE_APP_STATE);
  disableAllProviders(state);
  applySharedStoreTheme(state);

  patchProviderSetting(state, "cursor-personal-page", {
    displayEnabled: true,
    status: "missing",
    credentialStatus: "configured",
  });
  patchProviderSnapshot(state, "cursor-personal-page", {
    syncStatus: "warning",
    tone: "warning",
    warningReason: "Grant access to cursor.com before live sync can run.",
    warningDiagnostic: createHostAccessDiagnostic({
      providerId: "cursor-personal-page",
      sourceKind: "session_page",
      hostLabel: "cursor.com",
      rawMessage: "Grant access to cursor.com before live sync can run.",
    }),
    syncedAt: "2026-04-24 19:42",
    lastSyncLabel: "Needs host access",
    sourceFallbackDiagnostic: null,
  });

  patchProviderSetting(state, "codex-personal-page", {
    displayEnabled: true,
    status: "granted",
    credentialStatus: "missing",
  });
  patchProviderSnapshot(state, "codex-personal-page", {
    syncStatus: "error",
    tone: "error",
    warningReason: "Workspace id config required before live sync can run.",
    warningDiagnostic: createCredentialDiagnostic({
      providerId: "codex-personal-page",
      credentialKind: "workspace_config",
      rawMessage: "Workspace id config required before live sync can run.",
    }),
    syncedAt: "2026-04-24 19:41",
    lastSyncLabel: "Credential missing",
  });

  return state;
}

function buildHonestContractOnlyState(): AppState {
  const state = cloneAppState(SAMPLE_APP_STATE);
  disableAllProviders(state);
  applySharedStoreTheme(state);

  patchProviderSetting(state, "gemini-policy", {
    displayEnabled: true,
    status: "granted",
    credentialStatus: "not_required",
  });
  patchProviderSnapshot(state, "gemini-policy", {
    syncedAt: "2026-04-24 19:39",
    lastSyncLabel: "Documented policy snapshot",
  });

  return state;
}

function buildProviderOrDashboardDepthState(): AppState {
  const state = cloneAppState(SAMPLE_APP_STATE);
  disableAllProviders(state);
  applySharedStoreTheme(state);

  patchProviderSetting(state, "codex-personal-page", {
    displayEnabled: true,
    status: "granted",
    credentialStatus: "configured",
  });
  patchProviderSnapshot(state, "codex-personal-page", {
    syncStatus: "warning",
    tone: "warning",
    warningReason:
      "Enterprise analytics API selected. Exact remaining workspace credits are not exposed by the analytics endpoint.",
    warningDiagnostic: null,
    syncedAt: "2026-04-24 19:38",
    lastSyncLabel: "Analytics snapshot 4m ago",
  });

  return state;
}

export function getStoreScreenshotSeedPresetDefinition(
  preset: StoreScreenshotSeedPreset,
): StoreScreenshotSeedPresetDefinition {
  switch (preset) {
    case "toolbar-first-quick-glance":
      return {
        headline: "Toolbar-first quick glance seed applied",
        detail:
          "Cursor, Claude Code, and Codex are visible in one healthy popup-focused runtime state for the first storyboard screenshot.",
        appState: buildToolbarFirstQuickGlanceState(),
        lockEnabled: true,
      };
    case "setup-guidance":
      return {
        headline: "Setup guidance seed applied",
        detail:
          "Cursor is missing host access and Codex is missing workspace credentials so the popup can truthfully show setup guidance.",
        appState: buildSetupGuidanceState(),
        lockEnabled: true,
      };
    case "honest-contract-or-policy-only":
      return {
        headline: "Contract-only seed applied",
        detail:
          "Gemini is the only visible provider so the popup truthfully shows policy-only coverage without faking live precision.",
        appState: buildHonestContractOnlyState(),
        lockEnabled: true,
      };
    case "settings-and-setup-depth":
      return {
        headline: "Settings depth seed applied",
        detail:
          "The same mixed setup blockers are preserved so Settings can own the setup story instead of the popup.",
        appState: buildSetupGuidanceState(),
        lockEnabled: true,
      };
    case "provider-or-dashboard-depth":
      return {
        headline: "Provider depth seed applied",
        detail:
          "Codex is visible in a warning but truthful detail-review state so the side panel can prove deeper contract context.",
        appState: buildProviderOrDashboardDepthState(),
        lockEnabled: true,
      };
    case "unlock":
      return {
        headline: "Screenshot seed lock cleared",
        detail:
          "The temporary store-screenshot seed lock was removed. The next normal side-panel open will re-enter the regular init flow.",
        appState: null,
        lockEnabled: false,
      };
    default:
      throw new Error(`Unsupported store screenshot seed preset: ${String(preset)}`);
  }
}

function hasLocalStorageAccess(): boolean {
  return (
    typeof globalThis.localStorage?.getItem === "function" &&
    typeof globalThis.localStorage?.setItem === "function" &&
    typeof globalThis.localStorage?.removeItem === "function"
  );
}

export function isStoreScreenshotSeedLockEnabled(): boolean {
  if (!hasLocalStorageAccess()) {
    return false;
  }

  return globalThis.localStorage.getItem(STORE_SCREENSHOT_SEED_LOCK_STORAGE_KEY) === "true";
}

export function setStoreScreenshotSeedLockEnabled(enabled: boolean) {
  if (!hasLocalStorageAccess()) {
    return;
  }

  if (enabled) {
    globalThis.localStorage.setItem(STORE_SCREENSHOT_SEED_LOCK_STORAGE_KEY, "true");
    return;
  }

  globalThis.localStorage.removeItem(STORE_SCREENSHOT_SEED_LOCK_STORAGE_KEY);
}

export function readStoreScreenshotSeedBackup(): StoreScreenshotSeedBackupEnvelope {
  if (!hasLocalStorageAccess()) {
    return {
      hasBackup: false,
      appState: null,
    };
  }

  try {
    const raw = globalThis.localStorage.getItem(STORE_SCREENSHOT_SEED_BACKUP_STORAGE_KEY);

    if (!raw) {
      return {
        hasBackup: false,
        appState: null,
      };
    }

    const parsed = JSON.parse(raw) as StoreScreenshotSeedBackupEnvelope;

    if (!parsed || typeof parsed !== "object" || parsed.hasBackup !== true) {
      return {
        hasBackup: false,
        appState: null,
      };
    }

    return {
      hasBackup: true,
      appState: parsed.appState ?? null,
    };
  } catch {
    globalThis.localStorage.removeItem(STORE_SCREENSHOT_SEED_BACKUP_STORAGE_KEY);

    return {
      hasBackup: false,
      appState: null,
    };
  }
}

export function writeStoreScreenshotSeedBackup(appState: AppState | null) {
  if (!hasLocalStorageAccess()) {
    return;
  }

  globalThis.localStorage.setItem(
    STORE_SCREENSHOT_SEED_BACKUP_STORAGE_KEY,
    JSON.stringify({
      hasBackup: true,
      appState,
    } satisfies StoreScreenshotSeedBackupEnvelope),
  );
}

export function clearStoreScreenshotSeedBackup() {
  if (!hasLocalStorageAccess()) {
    return;
  }

  globalThis.localStorage.removeItem(STORE_SCREENSHOT_SEED_BACKUP_STORAGE_KEY);
}
