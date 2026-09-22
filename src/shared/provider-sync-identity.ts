import type { AppState, ProviderAccountId, ProviderId } from "../providers/types";
import {
  getActiveProviderAccountId,
  getActiveProviderAccountMetadata,
} from "./provider-accounts";

export type ProviderSyncIdentity = Readonly<{
  accountId: ProviderAccountId;
  generation: number;
  signature: string;
}>;

const identities = new Map<ProviderId, ProviderSyncIdentity>();
let replacementGeneration = 0;

export function getAppStateReplacementGeneration(): number {
  return replacementGeneration;
}

function connectionSignature(state: AppState, providerId: ProviderId): string {
  const setting = state.providerSettings.find((entry) => entry.id === providerId);
  const metadata = getActiveProviderAccountMetadata(state, providerId);
  return JSON.stringify([
    getActiveProviderAccountId(state, providerId),
    metadata?.createdAt ?? null,
    metadata?.apiGatewayConnection ?? null,
    setting?.displayEnabled,
    setting?.status,
    setting?.credentialStatus,
    setting?.sourcePreference,
    setting?.hostOrigins,
    setting?.pageBinding,
  ]);
}

/** In-memory generations expire with the worker, just like its in-flight runs. */
export function invalidateProviderSyncIdentity(providerId: ProviderId): void {
  const previous = identities.get(providerId);
  if (previous) {
    identities.set(providerId, {
      ...previous,
      generation: previous.generation + 1,
      signature: "",
    });
  }
}

export function invalidateAllProviderSyncIdentities(): void {
  replacementGeneration += 1;
  for (const providerId of identities.keys()) {
    invalidateProviderSyncIdentity(providerId);
  }
}

export function captureProviderSyncIdentity(
  state: AppState,
  providerId: ProviderId,
): ProviderSyncIdentity {
  const signature = connectionSignature(state, providerId);
  const previous = identities.get(providerId);
  if (previous?.signature === signature) {
    return previous;
  }
  const identity = {
    accountId: getActiveProviderAccountId(state, providerId),
    generation: (previous?.generation ?? 0) + 1,
    signature,
  };
  identities.set(providerId, identity);
  return identity;
}

export function isProviderSyncIdentityCurrent(
  state: AppState,
  providerId: ProviderId,
  identity: ProviderSyncIdentity,
): boolean {
  return (
    identities.get(providerId)?.generation === identity.generation &&
    connectionSignature(state, providerId) === identity.signature
  );
}
