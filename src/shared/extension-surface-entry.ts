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
  let rawValue: string | null;

  try {
    rawValue = storage.getItem(PENDING_FULL_PAGE_ENTRY_KEY);
  } catch {
    return null;
  }

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
      removePendingFullPageEntry(storage);
      return null;
    }

    return {
      source: parsedValue.source,
      targetHash: normalizeHash(parsedValue.targetHash),
      createdAt: parsedValue.createdAt,
    };
  } catch {
    removePendingFullPageEntry(storage);
    return null;
  }
}

function removePendingFullPageEntry(storage: StorageLike): void {
  try {
    storage.removeItem(PENDING_FULL_PAGE_ENTRY_KEY);
  } catch {
    // Pending entry cleanup is best-effort; navigation must keep going.
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

  try {
    storage.setItem(
      PENDING_FULL_PAGE_ENTRY_KEY,
      JSON.stringify({
        source,
        targetHash: normalizeHash(targetHash),
        createdAt: now,
      }),
    );
  } catch {
    // Surface handoff animation hints are optional.
  }
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
    removePendingFullPageEntry(storage);
    return null;
  }

  if (pendingEntry.targetHash !== normalizeHash(currentHash)) {
    return null;
  }

  removePendingFullPageEntry(storage);
  return pendingEntry.source;
}
