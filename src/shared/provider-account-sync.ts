import type { ProviderAccountId, ProviderId } from "../providers/types";

const providerManualSyncTails = new Map<ProviderId, Promise<unknown>>();

/** Inactive accounts are manual-only and serialize per source entry. */
export function runProviderAccountManualSyncSerial<T>(
  providerId: ProviderId,
  _accountId: ProviderAccountId,
  run: () => Promise<T>,
): Promise<T> {
  const previousTail = providerManualSyncTails.get(providerId);
  const nextRun = previousTail ? previousTail.then(run, run) : run();
  const trackedTail = nextRun.then(
    () => undefined,
    () => undefined,
  );

  providerManualSyncTails.set(providerId, trackedTail);
  void trackedTail.finally(() => {
    if (providerManualSyncTails.get(providerId) === trackedTail) {
      providerManualSyncTails.delete(providerId);
    }
  });

  return nextRun;
}
