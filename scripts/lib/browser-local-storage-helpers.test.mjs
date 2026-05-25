import { afterEach, describe, expect, it, vi } from "vitest";

import {
  installSafeLocalStorageHelpersInPage,
  readSafeLocalStorageResult,
  removeSafeLocalStorageResult,
  requireSafeLocalStorageValue,
  requireSafeLocalStorageWrite,
  writeSafeLocalStorageResult,
} from "./browser-local-storage-helpers.mjs";

describe("browser localStorage helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete globalThis.__aiUsageDashboardSafeLocalStorage;
  });

  it("wraps localStorage get, set, and remove operations", () => {
    const values = new Map();

    vi.stubGlobal("localStorage", {
      getItem: (key) => values.get(key) ?? null,
      removeItem: (key) => {
        values.delete(key);
      },
      setItem: (key, value) => {
        values.set(key, value);
      },
    });

    installSafeLocalStorageHelpersInPage();

    expect(writeSafeLocalStorageResult(globalThis, "key", "value")).toEqual({
      ok: true,
    });
    expect(readSafeLocalStorageResult(globalThis, "key")).toEqual({
      ok: true,
      value: "value",
    });
    expect(removeSafeLocalStorageResult(globalThis, "key")).toEqual({
      ok: true,
    });
    expect(readSafeLocalStorageResult(globalThis, "key")).toEqual({
      ok: true,
      value: null,
    });
  });

  it("installs after Playwright-style function serialization", () => {
    const values = new Map();

    vi.stubGlobal("localStorage", {
      getItem: (key) => values.get(key) ?? null,
      removeItem: (key) => {
        values.delete(key);
      },
      setItem: (key, value) => {
        values.set(key, value);
      },
    });

    const serializedInstaller = Function(
      `return (${installSafeLocalStorageHelpersInPage.toString()})`,
    )();
    serializedInstaller();

    expect(writeSafeLocalStorageResult(globalThis, "key", "value")).toEqual({
      ok: true,
    });
    expect(readSafeLocalStorageResult(globalThis, "key")).toEqual({
      ok: true,
      value: "value",
    });
  });

  it("returns explicit errors when localStorage operations throw", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("get failed");
      },
      removeItem: () => {
        throw new Error("remove failed");
      },
      setItem: () => {
        throw new Error("set failed");
      },
    });

    installSafeLocalStorageHelpersInPage();

    expect(readSafeLocalStorageResult(globalThis, "key")).toEqual({
      ok: false,
      error: "get failed",
    });
    expect(writeSafeLocalStorageResult(globalThis, "key", "value")).toEqual({
      ok: false,
      error: "set failed",
    });
    expect(removeSafeLocalStorageResult(globalThis, "key")).toEqual({
      ok: false,
      error: "remove failed",
    });
  });

  it("formats required read and write failures for scripts", () => {
    expect(() =>
      requireSafeLocalStorageValue(
        {
          ok: false,
          error: "blocked",
        },
        "read state",
      ),
    ).toThrow("read state: blocked");
    expect(() =>
      requireSafeLocalStorageWrite(
        {
          ok: false,
          error: "blocked",
        },
        "write state",
      ),
    ).toThrow("write state: blocked");
  });
});
