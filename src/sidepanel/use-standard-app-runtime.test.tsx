import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { STORE_SCREENSHOT_SEED_LOCK_STORAGE_KEY } from "./store-screenshot-seed";
import {
  getStandardAppBootstrapPlan,
  getStandardAppBootstrapMessage,
  useStandardAppRuntime,
} from "./use-standard-app-runtime";

function StandardAppRuntimeProbe() {
  const runtime = useStandardAppRuntime();

  return (
    <div
      data-app-state={runtime.appState === null ? "missing" : "ready"}
      data-has-apply={typeof runtime.applyMessage === "function"}
      data-has-retry={typeof runtime.handleRetryInitialization === "function"}
      data-has-set-toast={typeof runtime.setToast === "function"}
      data-loading={runtime.isLoading}
      data-load-error={runtime.loadError ?? ""}
      data-toast={runtime.toast === null ? "missing" : "present"}
    />
  );
}

describe("useStandardAppRuntime", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("exposes the initial runtime state and app callbacks", () => {
    const html = renderToStaticMarkup(<StandardAppRuntimeProbe />);

    expect(html).toContain('data-app-state="missing"');
    expect(html).toContain('data-loading="true"');
    expect(html).toContain('data-load-error=""');
    expect(html).toContain('data-toast="missing"');
    expect(html).toContain('data-has-apply="true"');
    expect(html).toContain('data-has-retry="true"');
    expect(html).toContain('data-has-set-toast="true"');
  });

  it("uses cached bootstrap by default for sidepanel and full-page surfaces", () => {
    expect(getStandardAppBootstrapMessage()).toEqual({
      type: "app:read-state",
    });
  });

  it("uses read-state initialization for locked store screenshot seeds", () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) =>
        key === STORE_SCREENSHOT_SEED_LOCK_STORAGE_KEY ? "true" : null,
      ),
      removeItem: vi.fn(),
      setItem: vi.fn(),
    });

    expect(getStandardAppBootstrapMessage()).toEqual({
      type: "app:read-state",
    });
  });

  it("uses cached bootstrap plus background init for full-page surfaces", () => {
    expect(getStandardAppBootstrapPlan(true)).toEqual({
      initialMessage: { type: "app:read-state" },
      backgroundMessage: { type: "app:init" },
    });
  });

  it("still supports explicit blocking bootstrap when cached-first is disabled", () => {
    expect(getStandardAppBootstrapPlan(false)).toEqual({
      initialMessage: { type: "app:init" },
    });
  });
});
