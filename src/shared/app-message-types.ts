import type {
  ApiKeyProviderId,
  AppSettings,
  AppState,
  ProviderAccountId,
  ProviderId,
  ProviderPageBinding,
  ProviderSourcePreference,
} from "../providers/types";
import type { CustomSourceSetting } from "./custom-sources";

export type AppMessage =
  | { type: "app:init" }
  | { type: "app:read-state" }
  | { type: "app:update-settings"; settings: Partial<AppSettings> }
  | {
      type: "app:update-custom-sources";
      customSources: CustomSourceSetting[];
    }
  | {
      type: "app:connect-codexbar-dashboard";
      endpointUrl: string;
      token: string | null;
    }
  | { type: "app:disconnect-codexbar-dashboard" }
  | { type: "app:clear-codexbar-dashboard-token" }
  | { type: "app:set-provider-enabled"; providerId: ProviderId; enabled: boolean }
  | {
      type: "app:set-provider-active-account";
      providerId: ProviderId;
      accountId: ProviderAccountId;
    }
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
  | { type: "app:set-codex-session-token"; accessToken: string | null }
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
