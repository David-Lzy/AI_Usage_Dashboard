export type SourcePageRecoveryTarget = "existing-tab" | "created-tab";

export function shouldRefreshAfterSourcePageRecovery(
  target: SourcePageRecoveryTarget,
): boolean {
  return target === "existing-tab";
}
