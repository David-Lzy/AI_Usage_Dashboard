import type { ProviderId, ProviderSetting } from "../providers/types";

const FIRST_PROVIDER_SETUP_PRIORITY: ProviderId[] = [
  "codex-personal-page",
  "cursor-personal-page",
  "claude-code-team-page",
  "gemini-policy",
];

export function getRecommendedFirstSetupProvider(
  providers: ProviderSetting[],
): ProviderSetting | null {
  const disabledProviders = providers.filter((provider) => !provider.displayEnabled);
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
    disabledProviders.find((provider) => provider.id !== "jetbrains-org-page") ??
    disabledProviders[0] ??
    null
  );
}
