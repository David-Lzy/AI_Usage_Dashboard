import { describe, expect, it } from "vitest";

import {
  formatPopupRefreshCountdownLabel,
  readPopupRefreshCountdownSeconds,
} from "./popup-refresh-schedule";

describe("popup refresh schedule", () => {
  it("uses the next Chrome alarm scheduled time when available", async () => {
    await expect(
      readPopupRefreshCountdownSeconds(30, {
        now: () => 1_000,
        chrome: {
          alarms: {
            get: async () => ({
              name: "ai-usage-dashboard.periodic-sync.v2",
              scheduledTime: 1_000 + 12.2 * 60_000 + 4_000,
            }),
          },
        },
      }),
    ).resolves.toBe(736);
  });

  it("falls back to the normalized sync interval when the alarm is unavailable", async () => {
    await expect(
      readPopupRefreshCountdownSeconds(2, {
        chrome: {
          alarms: {
            get: async () => undefined,
          },
        },
      }),
    ).resolves.toBe(180);
  });

  it("formats a compact countdown label with seconds", () => {
    expect(formatPopupRefreshCountdownLabel(15 * 60 + 4, String)).toBe("15:04");
    expect(formatPopupRefreshCountdownLabel(70, String)).toBe("1:10");
    expect(formatPopupRefreshCountdownLabel(3_664, String)).toBe("1:01:04");
    expect(formatPopupRefreshCountdownLabel(null, String)).toBeNull();
  });
});
