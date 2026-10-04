import type { ComponentProps } from "react";
import type {
  AppSettings,
  ProviderAccountsByProvider,
  ProviderSetting,
  ProviderSnapshot,
} from "../../providers/types";
import { createRuntimeI18n, type ResolvedAppLocale } from "../../shared/i18n";
import { resolvePopupProviderAccountPresentationMode } from "../../shared/provider-account-presentation";
import { SUB2API_PROVIDER_ID } from "../../shared/sub2api-deployments";
import { CodexLocalConnectionSettings } from "./CodexLocalConnectionSettings";
import { ProviderAccountSelector } from "./ProviderAccountSelector";
import { Sub2ApiDeploymentSettings } from "./Sub2ApiDeploymentSettings";

type Props = {
  provider: ProviderSetting;
  snapshot: ProviderSnapshot | null;
  locale: ResolvedAppLocale;
  settings: AppSettings;
  providerAccounts?: ProviderAccountsByProvider;
  onSelectAccount: ComponentProps<typeof ProviderAccountSelector>["onChange"];
  onOpenPresentationSettings?: () => void;
  onPopupAccountPresentationModeChange: (
    providerId: ProviderSetting["id"],
    mode: ComponentProps<
      typeof Sub2ApiDeploymentSettings
    >["popupAccountPresentationMode"],
  ) => void;
} & Pick<
  ComponentProps<typeof Sub2ApiDeploymentSettings>,
  "onSave" | "onTest" | "onDisconnect" | "onRemove"
>;

export function SettingsProviderConnectionControls({
  provider,
  snapshot,
  locale,
  settings,
  providerAccounts,
  onSelectAccount,
  onOpenPresentationSettings,
  onPopupAccountPresentationModeChange,
  onSave,
  onTest,
  onDisconnect,
  onRemove,
}: Props) {
  const i18n = createRuntimeI18n(locale);
  if (provider.id === SUB2API_PROVIDER_ID)
    return (
      <Sub2ApiDeploymentSettings
        locale={locale}
        providerAccounts={providerAccounts}
        onOpenPresentationSettings={onOpenPresentationSettings}
        snapshot={snapshot}
        popupAccountPresentationMode={resolvePopupProviderAccountPresentationMode(
          settings.popupProviderAccountPresentationByProvider,
          provider.id,
        )}
        onSelectAccount={(id) => onSelectAccount(provider.id, id)}
        onPopupAccountPresentationModeChange={(mode) =>
          onPopupAccountPresentationModeChange(provider.id, mode)
        }
        onSave={onSave}
        onTest={onTest}
        onDisconnect={onDisconnect}
        onRemove={onRemove}
      />
    );
  return (
    <>
      {provider.displayEnabled ? (
        <ProviderAccountSelector
          providerId={provider.id}
          providerAccounts={providerAccounts}
          accountLabel={i18n.t("provider.account.selector_label")}
          onChange={onSelectAccount}
        />
      ) : null}
      {provider.id === "codex-personal-page" && provider.displayEnabled ? (
        <CodexLocalConnectionSettings locale={locale} />
      ) : null}
    </>
  );
}
