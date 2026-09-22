import type {
  AppState,
  PermissionStatus,
  ProviderId,
  ProviderSetting,
} from "../providers/types";
import { seedAppStateIfEmpty, updateAppState } from "../shared/storage";
import { readStoreScreenshotRuntimeLock } from "../shared/store-screenshot-runtime-lock";
import { getExtensionPermissionsApi } from "../shared/extension-api";
import {
  captureProviderSyncIdentity,
  isProviderSyncIdentityCurrent,
  type ProviderSyncIdentity,
} from "../shared/provider-sync-identity";

export type PermissionNotice = {
  tone: "success" | "error";
  title: string;
  message: string;
};

export type PermissionToggleResult = {
  state: AppState;
  notice: PermissionNotice;
};

type LivePermissionsApi = {
  contains: (permissions: { origins?: string[] }) => boolean | Promise<boolean>;
  request: (permissions: { origins?: string[] }) => boolean | Promise<boolean>;
  remove: (permissions: { origins?: string[] }) => boolean | Promise<boolean>;
};

function getLivePermissionsApi(): LivePermissionsApi | null {
  const permissionsApi = getExtensionPermissionsApi();

  if (
    !permissionsApi ||
    typeof permissionsApi.contains !== "function" ||
    typeof permissionsApi.request !== "function" ||
    typeof permissionsApi.remove !== "function"
  ) {
    return null;
  }

  return {
    contains: permissionsApi.contains,
    request: permissionsApi.request,
    remove: permissionsApi.remove,
  };
}

function canRequestHostAccess(setting: ProviderSetting): boolean {
  return Array.isArray(setting.hostOrigins) && setting.hostOrigins.length > 0;
}

async function hasGrantedOrigins(origins: string[]): Promise<boolean> {
  const permissionsApi = getLivePermissionsApi();

  if (!permissionsApi || origins.length === 0) {
    return origins.length === 0;
  }

  return permissionsApi.contains({
    origins,
  });
}

type PermissionCheck = {
  providerId: ProviderId;
  identity: ProviderSyncIdentity;
  status: PermissionStatus;
};

function applyPermissionChecks(
  state: AppState,
  checks: readonly PermissionCheck[],
): AppState {
  const checksByProviderId = new Map(
    checks.map((check) => [check.providerId, check]),
  );
  let changed = false;

  const providerSettings = state.providerSettings.map((provider) => {
    const check = checksByProviderId.get(provider.id);

    if (
      !check ||
      provider.status === check.status ||
      !isProviderSyncIdentityCurrent(state, provider.id, check.identity)
    ) {
      return provider;
    }

    changed = true;
    return { ...provider, status: check.status };
  });

  return changed ? { ...state, providerSettings } : state;
}

export async function reconcileProviderPermissions(
  state: AppState,
): Promise<AppState> {
  if (!getLivePermissionsApi()) {
    return state;
  }

  const checks = await Promise.all(
    state.providerSettings.map(async (provider): Promise<PermissionCheck> => {
      const identity = captureProviderSyncIdentity(state, provider.id);

      if (!canRequestHostAccess(provider)) {
        return {
          providerId: provider.id,
          identity,
          status: "granted",
        };
      }

      const hasAccess = await hasGrantedOrigins(provider.hostOrigins);

      return {
        providerId: provider.id,
        identity,
        status: hasAccess ? "granted" : "missing",
      };
    }),
  );

  return updateAppState((latest) => applyPermissionChecks(latest, checks));
}

export async function syncStoredProviderPermissions(): Promise<AppState> {
  const current = await seedAppStateIfEmpty();

  if (await readStoreScreenshotRuntimeLock()) {
    return current;
  }

  return reconcileProviderPermissions(current);
}

export async function toggleProviderPermission(
  providerId: ProviderId,
): Promise<PermissionToggleResult> {
  const current = await seedAppStateIfEmpty();
  const target =
    current.providerSettings.find((provider) => provider.id === providerId) ??
    null;

  if (!target) {
    return {
      state: current,
      notice: {
        tone: "error",
        title: "Provider not found",
        message: "The selected provider could not be resolved from local state.",
      },
    };
  }

  if (!canRequestHostAccess(target)) {
    const identity = captureProviderSyncIdentity(current, providerId);
    const state = await updateAppState((latest) =>
      applyPermissionChecks(latest, [{ providerId, identity, status: "granted" }]),
    );

    return {
      state,
      notice: {
        tone: "success",
        title: `${target.label} does not need host access`,
        message: "This provider uses static policy data in v1.",
      },
    };
  }

  const permissionsApi = getLivePermissionsApi();
  const identity = captureProviderSyncIdentity(current, providerId);

  if (!permissionsApi) {
    const nextStatus: PermissionStatus =
      target.status === "granted" ? "missing" : "granted";
    const state = await updateAppState((latest) =>
      applyPermissionChecks(latest, [{ providerId, identity, status: nextStatus }]),
    );

    return {
      state,
      notice: {
        tone: "success",
        title:
          nextStatus === "granted"
            ? `${target.label} access simulated`
            : `${target.label} access removed locally`,
        message:
          "Browser preview mode cannot call the extension permissions API, so this toggle only updates local preview state.",
      },
    };
  }

  if (target.status === "granted") {
    const removed = await permissionsApi.remove({
      origins: target.hostOrigins,
    });
    const nextStatus: PermissionStatus = removed ? "missing" : "granted";
    const state = await updateAppState((latest) =>
      applyPermissionChecks(latest, [{ providerId, identity, status: nextStatus }]),
    );

    return {
      state,
      notice: removed
        ? {
            tone: "success",
            title: `${target.label} access removed`,
            message: "The extension host access grant was removed.",
          }
        : {
            tone: "error",
            title: `${target.label} access removal failed`,
            message: "The browser kept the existing host access grant.",
          },
    };
  }

  const granted = await permissionsApi.request({
    origins: target.hostOrigins,
  });
  const nextStatus: PermissionStatus = granted ? "granted" : "missing";
  const state = await updateAppState((latest) =>
    applyPermissionChecks(latest, [{ providerId, identity, status: nextStatus }]),
  );

  return {
    state,
    notice: granted
      ? {
          tone: "success",
          title: `${target.label} access granted`,
          message: "The extension can now request the configured host origins.",
        }
      : {
          tone: "error",
          title: `${target.label} access denied`,
          message:
            "The permission request was dismissed or denied, so live host access is still unavailable.",
        },
  };
}
