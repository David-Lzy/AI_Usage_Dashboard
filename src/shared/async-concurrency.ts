export async function mapWithConcurrency<TItem, TResult>(
  items: readonly TItem[],
  concurrencyLimit: number,
  mapper: (item: TItem, index: number) => Promise<TResult>,
): Promise<TResult[]> {
  if (items.length === 0) {
    return [];
  }

  const normalizedConcurrencyLimit = Number.isFinite(concurrencyLimit)
    ? Math.floor(concurrencyLimit)
    : 1;
  const resolvedConcurrencyLimit = Math.max(
    1,
    Math.min(items.length, normalizedConcurrencyLimit),
  );
  const results = new Array<TResult>(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(
    Array.from({ length: resolvedConcurrencyLimit }, () => runWorker()),
  );

  return results;
}
