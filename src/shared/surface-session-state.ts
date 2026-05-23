import { getSafeLocalStorage, getSafeSessionStorage } from "./local-storage";

export const SURFACE_SESSION_STATE_TTL_MS = 30 * 60 * 1000;

const SURFACE_SESSION_STATE_KEY_PREFIX =
  "ai-usage-dashboard:surface-session-state";
const SURFACE_SESSION_STATE_SCHEMA_VERSION = 1;

type UnknownRecord = Record<string, unknown>;

type StorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

type ExtensionSessionStorageArea = {
  get?: (key: string) => Promise<Record<string, unknown>> | Record<string, unknown>;
  set?: (items: Record<string, unknown>) => Promise<void> | void;
  remove?: (key: string) => Promise<void> | void;
};

export type SurfaceSessionRouteName =
  | "dashboard"
  | "settings"
  | "provider-detail";

export type ToolbarPopupPreviewSessionState = {
  open: boolean;
  percent: number;
  position: {
    left: number;
    top: number;
  } | null;
};

export type SettingsActivePopoverSessionState = {
  id: string;
  customPanelOpen?: boolean;
};

export type SettingsSurfaceSessionState = {
  activeSectionId: string | null;
  advancedOpen: boolean;
  uiMoreOpen: boolean;
  toolbarPopupPreview: ToolbarPopupPreviewSessionState | null;
  activePopover: SettingsActivePopoverSessionState | null;
  providerProgressDetailsOpen: Record<string, boolean>;
  carouselIndexById: Record<string, number>;
};

export type ProviderDetailSurfaceSessionState = {
  providerId: string;
  quotaDetailsOpen: Record<string, boolean>;
};

export type SurfaceSessionState = {
  routeName: SurfaceSessionRouteName;
  routeKey: string;
  scrollY: number | null;
  settings: SettingsSurfaceSessionState | null;
  providerDetail: ProviderDetailSurfaceSessionState | null;
};

type StoredSurfaceSessionStateEnvelope = {
  version: typeof SURFACE_SESSION_STATE_SCHEMA_VERSION;
  expiresAt: number;
  state: SurfaceSessionState;
};

export type SurfaceSessionStateStorageOptions = {
  now?: () => number;
  extensionStorage?: ExtensionSessionStorageArea | null;
  sessionStorage?: StorageLike | null;
  localStorage?: StorageLike | null;
};

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeFiniteInteger(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(0, Math.round(value));
}

function normalizePercent(value: unknown): number {
  const normalized = normalizeFiniteInteger(value);

  if (normalized === null) {
    return 0;
  }

  return Math.min(100, normalized);
}

function normalizeRouteName(value: unknown): SurfaceSessionRouteName | null {
  return value === "dashboard" ||
    value === "settings" ||
    value === "provider-detail"
    ? value
    : null;
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeBooleanRecord(value: unknown): Record<string, boolean> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, entry]) =>
      typeof entry === "boolean" ? [[key, entry] as const] : [],
    ),
  );
}

function normalizeIntegerRecord(value: unknown): Record<string, number> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, entry]) => {
      const normalized = normalizeFiniteInteger(entry);
      return normalized === null ? [] : [[key, normalized] as const];
    }),
  );
}

function normalizeToolbarPopupPreview(
  value: unknown,
): ToolbarPopupPreviewSessionState | null {
  if (!isRecord(value)) {
    return null;
  }

  const rawPosition = value.position;
  const position =
    isRecord(rawPosition) &&
    typeof rawPosition.left === "number" &&
    Number.isFinite(rawPosition.left) &&
    typeof rawPosition.top === "number" &&
    Number.isFinite(rawPosition.top)
      ? {
          left: Math.round(rawPosition.left),
          top: Math.round(rawPosition.top),
        }
      : null;

  return {
    open: value.open === true,
    percent: normalizePercent(value.percent),
    position,
  };
}

function normalizeSettingsActivePopover(
  value: unknown,
): SettingsActivePopoverSessionState | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = normalizeString(value.id);

  if (!id) {
    return null;
  }

  return {
    id,
    ...(value.customPanelOpen === true ? { customPanelOpen: true } : {}),
  };
}

function normalizeSettingsSurfaceState(
  value: unknown,
): SettingsSurfaceSessionState | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    activeSectionId: normalizeString(value.activeSectionId),
    advancedOpen: value.advancedOpen === true,
    uiMoreOpen: value.uiMoreOpen === true,
    toolbarPopupPreview: normalizeToolbarPopupPreview(
      value.toolbarPopupPreview,
    ),
    activePopover: normalizeSettingsActivePopover(value.activePopover),
    providerProgressDetailsOpen: normalizeBooleanRecord(
      value.providerProgressDetailsOpen,
    ),
    carouselIndexById: normalizeIntegerRecord(value.carouselIndexById),
  };
}

function normalizeProviderDetailSurfaceState(
  value: unknown,
): ProviderDetailSurfaceSessionState | null {
  if (!isRecord(value)) {
    return null;
  }

  const providerId = normalizeString(value.providerId);

  if (!providerId) {
    return null;
  }

  return {
    providerId,
    quotaDetailsOpen: normalizeBooleanRecord(value.quotaDetailsOpen),
  };
}

export function normalizeSurfaceSessionState(
  value: unknown,
): SurfaceSessionState | null {
  if (!isRecord(value)) {
    return null;
  }

  const routeName = normalizeRouteName(value.routeName);
  const routeKey = normalizeString(value.routeKey);

  if (!routeName || !routeKey) {
    return null;
  }

  return {
    routeName,
    routeKey,
    scrollY: normalizeFiniteInteger(value.scrollY),
    settings: normalizeSettingsSurfaceState(value.settings),
    providerDetail: normalizeProviderDetailSurfaceState(value.providerDetail),
  };
}

export function createSurfaceSessionStateForRoute({
  providerId = null,
  routeKey,
  routeName,
  scrollY = null,
}: {
  routeName: SurfaceSessionRouteName;
  routeKey: string;
  scrollY?: number | null;
  providerId?: string | null;
}): SurfaceSessionState {
  return {
    routeName,
    routeKey,
    scrollY: normalizeFiniteInteger(scrollY),
    settings: null,
    providerDetail:
      routeName === "provider-detail" && providerId
        ? {
            providerId,
            quotaDetailsOpen: {},
          }
        : null,
  };
}

function normalizeSurfaceFamily(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "standard";
}

function normalizeRouteKey(value: string): string {
  return value
    .trim()
    .replace(/^#/, "")
    .replace(/[^a-zA-Z0-9/_:-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "dashboard";
}

export function buildSurfaceSessionKey(
  routeKey: string,
  surfaceFamily = "standard",
): string {
  return [
    SURFACE_SESSION_STATE_KEY_PREFIX,
    normalizeSurfaceFamily(surfaceFamily),
    normalizeRouteKey(routeKey),
  ].join(":");
}

function getDefaultExtensionSessionStorage(): ExtensionSessionStorageArea | null {
  const globalScope = globalThis as typeof globalThis & {
    browser?: { storage?: { session?: ExtensionSessionStorageArea } };
    chrome?: { storage?: { session?: ExtensionSessionStorageArea } };
  };

  const storage =
    globalScope.browser?.storage?.session ?? globalScope.chrome?.storage?.session;

  return storage &&
    typeof storage.get === "function" &&
    typeof storage.set === "function" &&
    typeof storage.remove === "function"
    ? storage
    : null;
}

function createEnvelope(
  state: SurfaceSessionState,
  now: number,
): StoredSurfaceSessionStateEnvelope {
  return {
    version: SURFACE_SESSION_STATE_SCHEMA_VERSION,
    expiresAt: now + SURFACE_SESSION_STATE_TTL_MS,
    state,
  };
}

function normalizeEnvelope(
  value: unknown,
  now: number,
): StoredSurfaceSessionStateEnvelope | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    value.version !== SURFACE_SESSION_STATE_SCHEMA_VERSION ||
    typeof value.expiresAt !== "number" ||
    !Number.isFinite(value.expiresAt)
  ) {
    return null;
  }

  if (value.expiresAt <= now) {
    return null;
  }

  const state = normalizeSurfaceSessionState(value.state);

  return state
    ? {
        version: SURFACE_SESSION_STATE_SCHEMA_VERSION,
        expiresAt: value.expiresAt,
        state,
      }
    : null;
}

async function readExtensionEnvelope(
  storage: ExtensionSessionStorageArea,
  key: string,
): Promise<unknown> {
  const result = await storage.get?.(key);
  return result?.[key];
}

async function removeFromStorage(
  key: string,
  options: SurfaceSessionStateStorageOptions,
) {
  const extensionStorage =
    options.extensionStorage === undefined
      ? getDefaultExtensionSessionStorage()
      : options.extensionStorage;

  if (extensionStorage?.remove) {
    await extensionStorage.remove(key);
    return;
  }

  const sessionStorage =
    options.sessionStorage === undefined
      ? getSafeSessionStorage()
      : options.sessionStorage;

  if (sessionStorage) {
    sessionStorage.removeItem(key);
    return;
  }

  const localStorage =
    options.localStorage === undefined ? getSafeLocalStorage() : options.localStorage;

  localStorage?.removeItem(key);
}

export async function captureSurfaceSessionState(
  key: string,
  state: SurfaceSessionState,
  options: SurfaceSessionStateStorageOptions = {},
): Promise<void> {
  const now = options.now?.() ?? Date.now();
  const envelope = createEnvelope(normalizeSurfaceSessionState(state) ?? state, now);
  const extensionStorage =
    options.extensionStorage === undefined
      ? getDefaultExtensionSessionStorage()
      : options.extensionStorage;

  if (extensionStorage?.set) {
    await extensionStorage.set({ [key]: envelope });
    return;
  }

  const serialized = JSON.stringify(envelope);
  const sessionStorage =
    options.sessionStorage === undefined
      ? getSafeSessionStorage()
      : options.sessionStorage;

  if (sessionStorage) {
    sessionStorage.setItem(key, serialized);
    return;
  }

  const localStorage =
    options.localStorage === undefined ? getSafeLocalStorage() : options.localStorage;

  localStorage?.setItem(key, serialized);
}

export async function restoreSurfaceSessionState(
  key: string,
  options: SurfaceSessionStateStorageOptions = {},
): Promise<SurfaceSessionState | null> {
  const now = options.now?.() ?? Date.now();
  const extensionStorage =
    options.extensionStorage === undefined
      ? getDefaultExtensionSessionStorage()
      : options.extensionStorage;

  if (extensionStorage?.get) {
    const envelope = normalizeEnvelope(
      await readExtensionEnvelope(extensionStorage, key),
      now,
    );

    if (envelope) {
      return envelope.state;
    }

    await extensionStorage.remove?.(key);
    return null;
  }

  const sessionStorage =
    options.sessionStorage === undefined
      ? getSafeSessionStorage()
      : options.sessionStorage;
  const localStorage =
    options.localStorage === undefined ? getSafeLocalStorage() : options.localStorage;
  const fallbackStorage = sessionStorage ?? localStorage;

  if (!fallbackStorage) {
    return null;
  }

  const raw = fallbackStorage.getItem(key);

  if (!raw) {
    return null;
  }

  try {
    const envelope = normalizeEnvelope(JSON.parse(raw) as unknown, now);

    if (envelope) {
      return envelope.state;
    }
  } catch {
    // Malformed session state should be discarded below.
  }

  fallbackStorage.removeItem(key);
  return null;
}

export async function clearSurfaceSessionState(
  key: string,
  options: SurfaceSessionStateStorageOptions = {},
): Promise<void> {
  await removeFromStorage(key, options);
}
