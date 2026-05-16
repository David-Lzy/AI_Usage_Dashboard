export function getOpenableRouteHint(routeHints: string[]): string | null {
  for (const routeHint of routeHints) {
    if (!routeHint.startsWith("https://")) {
      continue;
    }

    const normalizedRoute = routeHint.replace(/\*+$/, "");

    if (!normalizedRoute.includes("*")) {
      return normalizedRoute;
    }
  }

  return null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeComparableUrl(value: string): string | null {
  try {
    return new URL(value).toString();
  } catch {
    return null;
  }
}

function normalizeComparableUrlWithoutHash(value: string): string | null {
  const normalizedUrl = normalizeComparableUrl(value);

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

export function doesUrlMatchRouteHint(url: string, routeHint: string): boolean {
  const normalizedUrl = normalizeComparableUrl(url);
  const normalizedRouteHint = normalizeComparableUrl(routeHint.replace(/\*+$/, ""));

  if (!normalizedUrl || !routeHint.startsWith("https://")) {
    return false;
  }

  if (routeHint.includes("*")) {
    const wildcardPattern = routeHint
      .split("*")
      .map((part) => escapeRegExp(part))
      .join(".*");

    return new RegExp(`^${wildcardPattern}$`).test(normalizedUrl);
  }

  if (!normalizedRouteHint) {
    return false;
  }

  return (
    normalizedUrl === normalizedRouteHint ||
    normalizeComparableUrlWithoutHash(normalizedUrl) ===
      normalizeComparableUrlWithoutHash(normalizedRouteHint)
  );
}

export function doesUrlMatchRouteHints(
  url: string,
  routeHints: string[],
): boolean {
  return routeHints.some((routeHint) => doesUrlMatchRouteHint(url, routeHint));
}
