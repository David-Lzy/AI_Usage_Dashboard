import type {
  ApiKeyProviderId,
  AppSettings,
  AppState,
  ProviderId,
  ProviderPageBinding,
  ProviderSourcePreference,
} from "../providers/types";

export type AppMessage =
  | { type: "app:init" }
  | { type: "app:read-state" }
  | { type: "app:update-settings"; settings: Partial<AppSettings> }
  | { type: "app:set-provider-enabled"; providerId: ProviderId; enabled: boolean }
  | {
      type: "app:set-provider-source-preference";
      providerId: ProviderId;
      sourcePreference: ProviderSourcePreference;
    }
  | {
      type: "app:set-provider-page-binding";
      providerId: ProviderId;
      pageBinding: ProviderPageBinding;
    }
  | { type: "app:clear-provider-page-binding"; providerId: ProviderId }
  | {
      type: "app:set-provider-admin-api-key";
      providerId: ApiKeyProviderId;
      apiKey: string | null;
    }
  | {
      type: "app:set-codex-workspace-config";
      analyticsApiKey: string | null;
      workspaceId: string | null;
    }
  | { type: "app:toggle-provider-permission"; providerId: ProviderId }
  | { type: "app:request-refresh"; providerId?: ProviderId }
  | { type: "app:import-configuration-backup"; rawJson: string }
  | { type: "app:save-configuration-to-sync" }
  | { type: "app:restore-configuration-from-sync" }
  | { type: "app:open-action-popup" };

export type AppMessageResponse =
  | {
      ok: true;
      state: AppState;
      notice?: {
        tone: "success" | "error";
        title: string;
        message: string;
      };
    }
  | { ok: false; error: string };
