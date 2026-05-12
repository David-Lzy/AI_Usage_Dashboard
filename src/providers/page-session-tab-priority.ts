export type PageSessionTabPriorityCandidate = {
  active?: boolean;
  lastAccessed?: number;
  title?: string;
  url?: string;
};

export type PageSessionTabPriorityBinding = {
  matchedTitle?: string | null;
  matchedUrl?: string | null;
};

function normalizeUrl(value: string | null | undefined): string | null {
  if (typeof value !== "string" || value.length === 0) {
    return null;
  }

  try {
    return new URL(value).toString();
  } catch {
    return value;
  }
}

function normalizeUrlWithoutHash(value: string | null | undefined): string | null {
  const normalizedUrl = normalizeUrl(value);

  if (!normalizedUrl) {
    return null;
  }

  try {
    const parsedUrl = new URL(normalizedUrl);
    parsedUrl.hash = "";
    return parsedUrl.toString();
  } catch {
    return normalizedUrl.split("#")[0] ?? normalizedUrl;
  }
}

function buildUrlPriorityScore(
  tabUrl: string | null | undefined,
  matchedUrl: string | null | undefined,
): number {
  const normalizedTabUrl = normalizeUrl(tabUrl);
  const normalizedMatchedUrl = normalizeUrl(matchedUrl);

  if (!normalizedTabUrl || !normalizedMatchedUrl) {
    return 0;
  }

  if (normalizedTabUrl === normalizedMatchedUrl) {
    return 1_000_000_000;
  }

  if (
    normalizeUrlWithoutHash(normalizedTabUrl) ===
    normalizeUrlWithoutHash(normalizedMatchedUrl)
  ) {
    return 900_000_000;
  }

  return normalizedTabUrl.startsWith(normalizedMatchedUrl) ? 800_000_000 : 0;
}

function buildTitlePriorityScore(
  tabTitle: string | null | undefined,
  matchedTitle: string | null | undefined,
): number {
  if (!tabTitle || !matchedTitle) {
    return 0;
  }

  return tabTitle.trim() === matchedTitle.trim() ? 50_000_000 : 0;
}

function scoreTab(
  tab: PageSessionTabPriorityCandidate,
  binding?: PageSessionTabPriorityBinding,
): number {
  return (
    buildUrlPriorityScore(tab.url, binding?.matchedUrl) +
    buildTitlePriorityScore(tab.title, binding?.matchedTitle) +
    (tab.active ? 10_000 : 0) +
    (tab.lastAccessed ?? 0)
  );
}

export function sortTabsByPriority<T extends PageSessionTabPriorityCandidate>(
  tabs: T[],
  binding?: PageSessionTabPriorityBinding,
): T[] {
  return [...tabs].sort(
    (left, right) => scoreTab(right, binding) - scoreTab(left, binding),
  );
}
