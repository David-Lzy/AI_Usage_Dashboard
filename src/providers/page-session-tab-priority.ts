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

type PageSessionTabPriorityScore = {
  urlMatch: number;
  titleMatch: number;
  active: number;
  lastAccessed: number;
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

function isBoundaryUrlPrefixMatch(tabUrl: string, matchedUrl: string): boolean {
  if (!tabUrl.startsWith(matchedUrl)) {
    return false;
  }

  if (tabUrl.length === matchedUrl.length) {
    return true;
  }

  if (matchedUrl.endsWith("/")) {
    return true;
  }

  const nextCharacter = tabUrl.charAt(matchedUrl.length);

  return nextCharacter === "/" || nextCharacter === "?";
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
    return 3;
  }

  if (
    normalizeUrlWithoutHash(normalizedTabUrl) ===
    normalizeUrlWithoutHash(normalizedMatchedUrl)
  ) {
    return 2;
  }

  return isBoundaryUrlPrefixMatch(normalizedTabUrl, normalizedMatchedUrl) ? 1 : 0;
}

function buildTitlePriorityScore(
  tabTitle: string | null | undefined,
  matchedTitle: string | null | undefined,
): number {
  if (!tabTitle || !matchedTitle) {
    return 0;
  }

  return tabTitle.trim() === matchedTitle.trim() ? 1 : 0;
}

function normalizeLastAccessed(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function scoreTab(
  tab: PageSessionTabPriorityCandidate,
  binding?: PageSessionTabPriorityBinding,
): PageSessionTabPriorityScore {
  return {
    urlMatch: buildUrlPriorityScore(tab.url, binding?.matchedUrl),
    titleMatch: buildTitlePriorityScore(tab.title, binding?.matchedTitle),
    active: tab.active ? 1 : 0,
    lastAccessed: normalizeLastAccessed(tab.lastAccessed),
  };
}

function compareScore(
  left: PageSessionTabPriorityScore,
  right: PageSessionTabPriorityScore,
): number {
  return (
    right.urlMatch - left.urlMatch ||
    right.titleMatch - left.titleMatch ||
    right.active - left.active ||
    right.lastAccessed - left.lastAccessed
  );
}

export function sortTabsByPriority<T extends PageSessionTabPriorityCandidate>(
  tabs: T[],
  binding?: PageSessionTabPriorityBinding,
): T[] {
  return [...tabs].sort((left, right) =>
    compareScore(scoreTab(left, binding), scoreTab(right, binding)),
  );
}
