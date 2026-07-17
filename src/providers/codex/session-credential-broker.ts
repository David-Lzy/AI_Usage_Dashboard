import {
  buildCodexSessionCredential,
  isCodexSessionCredentialUsable,
  type CodexSessionCredential,
} from "./session-credential";
import { acquireCodexCredentialFromOpenTabs } from "./session-credential-page";

export const CODEX_SESSION_CREDENTIAL_STORAGE_KEY =
  "ai-usage-dashboard:codex-session-credential";
export const CODEX_AUTH_FAILURE_COOLDOWN_MS = 5 * 60 * 1_000;

export type CodexCredentialFailureCode = "auth_missing" | "auth_cooldown";

export type CodexCredentialResult =
  | { ok: true; credential: CodexSessionCredential }
  | {
      ok: false;
      code: CodexCredentialFailureCode;
      retryAt: number | null;
    };

export type CodexSessionStorageArea = {
  get: (key: string) => Promise<Record<string, unknown>> | Record<string, unknown>;
  set: (items: Record<string, unknown>) => Promise<void> | void;
  remove: (key: string) => Promise<void> | void;
};

export type CodexCredentialBrokerOptions = {
  acquireFromWebSession?: () => Promise<CodexSessionCredential | null>;
  now?: () => number;
  storage?: CodexSessionStorageArea | null;
};

export type CodexCredentialRequestOptions = {
  bypassCooldown?: boolean;
  forceRefresh?: boolean;
};

export type CodexCredentialBroker = {
  clearCredential: () => Promise<void>;
  getCredential: (
    options?: CodexCredentialRequestOptions,
  ) => Promise<CodexCredentialResult>;
  setManualCredential: (
    accessToken: string,
    accountId?: string | null,
  ) => Promise<CodexCredentialResult>;
};

function getDefaultStorage(): CodexSessionStorageArea | null {
  const globalScope = globalThis as typeof globalThis & {
    browser?: { storage?: { session?: CodexSessionStorageArea } };
    chrome?: { storage?: { session?: CodexSessionStorageArea } };
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

function normalizeStoredCredential(value: unknown): CodexSessionCredential | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const source = value as Record<string, unknown>;

  if (
    typeof source.accessToken !== "string" ||
    (source.source !== "web_session" &&
      source.source !== "observed_request" &&
      source.source !== "manual_session")
  ) {
    return null;
  }

  const credential = buildCodexSessionCredential({
    accessToken: source.accessToken,
    accountId: typeof source.accountId === "string" ? source.accountId : null,
    source: source.source,
  });

  if (!credential) {
    return null;
  }

  return {
    ...credential,
    expiresAt:
      typeof source.expiresAt === "number" && Number.isFinite(source.expiresAt)
        ? source.expiresAt
        : credential.expiresAt,
  };
}

export function createCodexCredentialBroker(
  options: CodexCredentialBrokerOptions = {},
): CodexCredentialBroker {
  const storage = options.storage === undefined ? getDefaultStorage() : options.storage;
  const now = options.now ?? Date.now;
  const acquireFromWebSession =
    options.acquireFromWebSession ?? acquireCodexCredentialFromOpenTabs;
  let memoryCredential: CodexSessionCredential | null = null;
  let authCooldownUntil = 0;
  let activeAcquisition: Promise<CodexCredentialResult> | null = null;

  async function readCredential(): Promise<CodexSessionCredential | null> {
    if (isCodexSessionCredentialUsable(memoryCredential, now())) {
      return memoryCredential;
    }

    memoryCredential = null;

    if (!storage) {
      return null;
    }

    try {
      const stored = await storage.get(CODEX_SESSION_CREDENTIAL_STORAGE_KEY);
      const credential = normalizeStoredCredential(
        stored[CODEX_SESSION_CREDENTIAL_STORAGE_KEY],
      );

      if (isCodexSessionCredentialUsable(credential, now())) {
        memoryCredential = credential;
        return credential;
      }

      await storage.remove(CODEX_SESSION_CREDENTIAL_STORAGE_KEY);
    } catch {
      // Session storage is optional; keep the service-worker memory fallback.
    }

    return null;
  }

  async function writeCredential(credential: CodexSessionCredential): Promise<void> {
    memoryCredential = credential;

    if (!storage) {
      return;
    }

    try {
      await storage.set({ [CODEX_SESSION_CREDENTIAL_STORAGE_KEY]: credential });
    } catch {
      // The in-memory credential remains usable for this service-worker life.
    }
  }

  async function clearCredential(): Promise<void> {
    memoryCredential = null;
    authCooldownUntil = 0;

    if (storage) {
      try {
        await storage.remove(CODEX_SESSION_CREDENTIAL_STORAGE_KEY);
      } catch {
        // Nothing else should fail because session storage is unavailable.
      }
    }
  }

  async function acquireCredential(): Promise<CodexCredentialResult> {
    try {
      const credential = await acquireFromWebSession();

      if (!credential || !isCodexSessionCredentialUsable(credential, now())) {
        authCooldownUntil = now() + CODEX_AUTH_FAILURE_COOLDOWN_MS;
        return {
          ok: false,
          code: "auth_missing",
          retryAt: authCooldownUntil,
        };
      }

      authCooldownUntil = 0;
      await writeCredential(credential);
      return { ok: true, credential };
    } catch {
      authCooldownUntil = now() + CODEX_AUTH_FAILURE_COOLDOWN_MS;
      return {
        ok: false,
        code: "auth_missing",
        retryAt: authCooldownUntil,
      };
    }
  }

  async function getCredential(
    request: CodexCredentialRequestOptions = {},
  ): Promise<CodexCredentialResult> {
    if (!request.forceRefresh) {
      const credential = await readCredential();

      if (credential) {
        return { ok: true, credential };
      }
    }

    if (!request.bypassCooldown && authCooldownUntil > now()) {
      return {
        ok: false,
        code: "auth_cooldown",
        retryAt: authCooldownUntil,
      };
    }

    if (activeAcquisition) {
      return activeAcquisition;
    }

    activeAcquisition = acquireCredential();

    try {
      return await activeAcquisition;
    } finally {
      activeAcquisition = null;
    }
  }

  async function setManualCredential(
    accessToken: string,
    accountId: string | null = null,
  ): Promise<CodexCredentialResult> {
    const credential = buildCodexSessionCredential({
      accessToken,
      accountId,
      source: "manual_session",
    });

    if (!credential || !isCodexSessionCredentialUsable(credential, now())) {
      return { ok: false, code: "auth_missing", retryAt: null };
    }

    authCooldownUntil = 0;
    await writeCredential(credential);
    return { ok: true, credential };
  }

  return { clearCredential, getCredential, setManualCredential };
}

export const codexCredentialBroker = createCodexCredentialBroker();
