import type {
  AppState,
  PermissionStatus,
  ProviderId,
  ProviderSetting,
} from "../providers/types";
import { seedAppStateIfEmpty, writeAppState } from "../shared/storage";

export type PermissionNotice = {
  tone: "success" | "error";
  title: string;
  message: string;
};

export type PermissionToggleResult = {
  state: AppState;
  notice: PermissionNotice;
};

function hasChromePermissionsApi(): boolean {
  return (
    typeof chrome !== "undefined" &&
    typeof chrome.permissions?.contains === "function" &&
    typeof chrome.permissions?.request === "function" &&
    typeof chrome.permissions?.remove === "function"
  );
}

function canRequestHostAccess(setting: ProviderSetting): boolean {
  return Array.isArray(setting.hostOrigins) && setting.hostOrigins.length > 0;
}

async function hasGrantedOrigins(origins: string[]): Promise<boolean> {
  if (!hasChromePermissionsApi() || origins.length === 0) {
    return origins.length === 0;
  }

  return chrome.permissions.contains({
    origins,
  });
}

function updateProviderPermission(
  state: AppState,
  providerId: ProviderId,
  status: PermissionStatus,
): AppState {
  return {
    ...state,
    providerSettings: state.providerSettings.map((provider) =>
      provider.id === providerId ? { ...provider, status } : provider,
    ),
  };
}

export async function reconcileProviderPermissions(
  state: AppState,
): Promise<AppState> {
  if (!hasChromePermissionsApi()) {
    return state;
  }

  const nextSettings: ProviderSetting[] = await Promise.all(
    state.providerSettings.map(async (provider): Promise<ProviderSetting> => {
      if (!canRequestHostAccess(provider)) {
        return {
          ...provider,
          status: "granted",
        };
      }

      const hasAccess = await hasGrantedOrigins(provider.hostOrigins);

      return {
        ...provider,
        status: hasAccess ? "granted" : "missing",
      };
    }),
  );

  const nextState: AppState = {
    ...state,
    providerSettings: nextSettings,
  };

  return writeAppState(nextState);
}

export async function syncStoredProviderPermissions(): Promise<AppState> {
  const current = await seedAppStateIfEmpty();
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
    const state = await writeAppState(
      updateProviderPermission(current, providerId, "granted"),
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

  if (!hasChromePermissionsApi()) {
    const nextStatus: PermissionStatus =
      target.status === "granted" ? "missing" : "granted";
    const state = await writeAppState(
      updateProviderPermission(current, providerId, nextStatus),
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
          "Browser preview mode cannot call chrome.permissions, so this toggle only updates local preview state.",
      },
    };
  }

  if (target.status === "granted") {
    const removed = await chrome.permissions.remove({
      origins: target.hostOrigins,
    });
    const nextStatus: PermissionStatus = removed ? "missing" : "granted";
    const state = await writeAppState(
      updateProviderPermission(current, providerId, nextStatus),
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

  const granted = await chrome.permissions.request({
    origins: target.hostOrigins,
  });
  const nextStatus: PermissionStatus = granted ? "granted" : "missing";
  const state = await writeAppState(
    updateProviderPermission(current, providerId, nextStatus),
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
