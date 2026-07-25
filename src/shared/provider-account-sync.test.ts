import { describe, expect, it, vi } from "vitest";

import { runProviderAccountManualSyncSerial } from "./provider-account-sync";

describe("provider account manual sync serialization", () => {
  it("serializes inactive account refreshes for one source entry", async () => {
    let releaseFirst!: () => void;
    const firstGate = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    const events: string[] = [];
    const firstRun = vi.fn(async () => {
      events.push("first:start");
      await firstGate;
      events.push("first:end");
      return "first";
    });
    const secondRun = vi.fn(async () => {
      events.push("second:start");
      return "second";
    });

    const first = runProviderAccountManualSyncSerial(
      "cursor-team-api",
      "account_11111111",
      firstRun,
    );
    const second = runProviderAccountManualSyncSerial(
      "cursor-team-api",
      "account_22222222",
      secondRun,
    );
    await Promise.resolve();

    expect(firstRun).toHaveBeenCalledOnce();
    expect(secondRun).not.toHaveBeenCalled();
    releaseFirst();

    await expect(Promise.all([first, second])).resolves.toEqual([
      "first",
      "second",
    ]);
    expect(events).toEqual(["first:start", "first:end", "second:start"]);
  });
});
