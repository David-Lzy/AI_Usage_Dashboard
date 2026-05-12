import type { ProviderId, ProviderSetting } from "../providers/types";

const FIRST_PROVIDER_SETUP_PRIORITY: ProviderId[] = [
  "codex",
  "cursor",
  "claude-code",
  "gemini",
];

export function getRecommendedFirstSetupProvider(
  providers: ProviderSetting[],
): ProviderSetting | null {
  const disabledProviders = providers.filter((provider) => !provider.enabled);
  const disabledById = new Map(
    disabledProviders.map((provider) => [provider.id, provider]),
  );

  for (const providerId of FIRST_PROVIDER_SETUP_PRIORITY) {
    const provider = disabledById.get(providerId);

    if (provider) {
      return provider;
    }
  }

  return (
    disabledProviders.find((provider) => provider.id !== "jetbrains") ??
    disabledProviders[0] ??
    null
  );
}
