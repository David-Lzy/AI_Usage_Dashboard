import { describe, expect, it } from "vitest";

import {
  shouldRefreshAfterSourcePageRecovery,
  shouldReloadBeforeSourcePageRecoveryRefresh,
} from "./source-page-recovery";

describe("source-page recovery policy", () => {
  it("refreshes immediately when recovery reuses an existing matching tab", () => {
    expect(shouldRefreshAfterSourcePageRecovery("existing-tab")).toBe(true);
  });

  it("waits for manual refresh when recovery opens a new source page", () => {
    expect(shouldRefreshAfterSourcePageRecovery("created-tab")).toBe(false);
  });

  it("reloads an existing source tab before refresh for capture-unavailable recovery", () => {
    expect(
      shouldReloadBeforeSourcePageRecoveryRefresh(
        "existing-tab",
        "capture_unavailable",
      ),
    ).toBe(true);
  });

  it("does not reload newly opened or non-capture-unavailable source pages", () => {
    expect(
      shouldReloadBeforeSourcePageRecoveryRefresh(
        "created-tab",
        "capture_unavailable",
      ),
    ).toBe(false);
    expect(
      shouldReloadBeforeSourcePageRecoveryRefresh("existing-tab", "logged_out"),
    ).toBe(false);
  });
});
