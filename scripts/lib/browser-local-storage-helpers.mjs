const HELPER_NAME = "__aiUsageDashboardSafeLocalStorage";

function serializeStorageError(error) {
  return error instanceof Error ? error.message : String(error);
}

export function installSafeLocalStorageHelpersInPage() {
  function getStorage() {
    try {
      const storage = globalThis.localStorage;

      if (
        storage &&
        typeof storage.getItem === "function" &&
        typeof storage.setItem === "function" &&
        typeof storage.removeItem === "function"
      ) {
        return {
          ok: true,
          storage,
        };
      }

      return {
        ok: false,
        error: "localStorage is unavailable.",
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  globalThis[HELPER_NAME] = {
    getItem(key) {
      const result = getStorage();

      if (!result.ok) {
        return result;
      }

      try {
        return {
          ok: true,
          value: result.storage.getItem(key),
        };
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
    removeItem(key) {
      const result = getStorage();

      if (!result.ok) {
        return result;
      }

      try {
        result.storage.removeItem(key);
        return {
          ok: true,
        };
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
    setItem(key, value) {
      const result = getStorage();

      if (!result.ok) {
        return result;
      }

      try {
        result.storage.setItem(key, value);
        return {
          ok: true,
        };
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  };
}

export async function installSafeLocalStorageHelpers(page) {
  await page.addInitScript(installSafeLocalStorageHelpersInPage);
  await page.evaluate(installSafeLocalStorageHelpersInPage).catch(() => undefined);
}

export function readSafeLocalStorageResult(globalScope, key) {
  const helper = globalScope?.[HELPER_NAME];

  if (!helper || typeof helper.getItem !== "function") {
    return {
      ok: false,
      error: "Safe localStorage helper is not installed.",
    };
  }

  return helper.getItem(key);
}

export function writeSafeLocalStorageResult(globalScope, key, value) {
  const helper = globalScope?.[HELPER_NAME];

  if (!helper || typeof helper.setItem !== "function") {
    return {
      ok: false,
      error: "Safe localStorage helper is not installed.",
    };
  }

  return helper.setItem(key, value);
}

export function removeSafeLocalStorageResult(globalScope, key) {
  const helper = globalScope?.[HELPER_NAME];

  if (!helper || typeof helper.removeItem !== "function") {
    return {
      ok: false,
      error: "Safe localStorage helper is not installed.",
    };
  }

  return helper.removeItem(key);
}

export function requireSafeLocalStorageValue(result, label) {
  if (!result.ok) {
    throw new Error(`${label}: ${result.error}`);
  }

  return result.value ?? null;
}

export function requireSafeLocalStorageWrite(result, label) {
  if (!result.ok) {
    throw new Error(`${label}: ${result.error}`);
  }
}

export function formatSafeLocalStorageError(error) {
  return serializeStorageError(error);
}
