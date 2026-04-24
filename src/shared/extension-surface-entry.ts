export type FullPageEntrySource = "popup-expand" | "sidebar-expand";

type StorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

type PendingFullPageEntry = {
  source: FullPageEntrySource;
  targetHash: string;
  createdAt: number;
};

const PENDING_FULL_PAGE_ENTRY_KEY =
  "ai-usage-dashboard:pending-full-page-entry";
const PENDING_FULL_PAGE_ENTRY_TTL_MS = 15_000;

function normalizeHash(hash: string): string {
  if (!hash) {
    return "#";
  }

  return hash.startsWith("#") ? hash : `#${hash}`;
}

function isFullPageEntrySource(value: unknown): value is FullPageEntrySource {
  return value === "popup-expand" || value === "sidebar-expand";
}

function readPendingFullPageEntry(
  storage: StorageLike,
): PendingFullPageEntry | null {
  const rawValue = storage.getItem(PENDING_FULL_PAGE_ENTRY_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<PendingFullPageEntry>;

    if (
      !isFullPageEntrySource(parsedValue.source) ||
      typeof parsedValue.targetHash !== "string" ||
      typeof parsedValue.createdAt !== "number" ||
      !Number.isFinite(parsedValue.createdAt)
    ) {
      storage.removeItem(PENDING_FULL_PAGE_ENTRY_KEY);
      return null;
    }

    return {
      source: parsedValue.source,
      targetHash: normalizeHash(parsedValue.targetHash),
      createdAt: parsedValue.createdAt,
    };
  } catch {
    storage.removeItem(PENDING_FULL_PAGE_ENTRY_KEY);
    return null;
  }
}

export function storePendingFullPageEntry(
  source: FullPageEntrySource,
  targetHash: string,
  storage?: StorageLike | null,
  now = Date.now(),
) {
  if (!storage) {
    return;
  }

  storage.setItem(
    PENDING_FULL_PAGE_ENTRY_KEY,
    JSON.stringify({
      source,
      targetHash: normalizeHash(targetHash),
      createdAt: now,
    }),
  );
}

export function consumePendingFullPageEntry(
  currentHash: string,
  storage?: StorageLike | null,
  now = Date.now(),
): FullPageEntrySource | null {
  if (!storage) {
    return null;
  }

  const pendingEntry = readPendingFullPageEntry(storage);

  if (!pendingEntry) {
    return null;
  }

  if (now - pendingEntry.createdAt > PENDING_FULL_PAGE_ENTRY_TTL_MS) {
    storage.removeItem(PENDING_FULL_PAGE_ENTRY_KEY);
    return null;
  }

  if (pendingEntry.targetHash !== normalizeHash(currentHash)) {
    return null;
  }

  storage.removeItem(PENDING_FULL_PAGE_ENTRY_KEY);
  return pendingEntry.source;
}
