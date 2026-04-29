import { describe, expect, it } from "vitest";

import { shouldRefreshAfterSourcePageRecovery } from "./source-page-recovery";

describe("source-page recovery policy", () => {
  it("refreshes immediately when recovery reuses an existing matching tab", () => {
    expect(shouldRefreshAfterSourcePageRecovery("existing-tab")).toBe(true);
  });

  it("waits for manual refresh when recovery opens a new source page", () => {
    expect(shouldRefreshAfterSourcePageRecovery("created-tab")).toBe(false);
  });
});
