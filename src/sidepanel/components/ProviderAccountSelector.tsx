import type {
  ProviderAccountId,
  ProviderAccountsByProvider,
  ProviderId,
} from "../../providers/types";
import { getProviderAccountOptions } from "../../shared/provider-accounts";
import type { ProviderMultiAccountCapabilityResolver } from "../../shared/provider-accounts";
import { MaterialSelect } from "./MaterialSelect";

type ProviderAccountSelectorProps = {
  accountLabel: string;
  providerId: ProviderId;
  providerAccounts?: ProviderAccountsByProvider;
  capabilityResolver?: ProviderMultiAccountCapabilityResolver;
  onChange: (providerId: ProviderId, accountId: ProviderAccountId) => void;
};

export function ProviderAccountSelector({
  accountLabel,
  providerId,
  providerAccounts,
  capabilityResolver,
  onChange,
}: ProviderAccountSelectorProps) {
  const options = getProviderAccountOptions(
    { providerAccounts },
    providerId,
    capabilityResolver,
  );

  if (!options) {
    return null;
  }

  return (
    <div className="provider-account-selector" data-provider-account-selector="">
      <MaterialSelect
        fieldIdPrefix={`provider-account-${providerId}`}
        label={accountLabel}
        value={options.activeAccountId}
        options={options.accounts.map((account) => ({
          value: account.id,
          label: account.label,
        }))}
        onChange={(accountId) => onChange(providerId, accountId)}
      />
    </div>
  );
}
