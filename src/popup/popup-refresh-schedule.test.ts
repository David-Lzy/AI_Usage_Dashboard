import { describe, expect, it } from "vitest";

import {
  formatPopupRefreshCountdownLabel,
  readPopupRefreshCountdownMinutes,
} from "./popup-refresh-schedule";

describe("popup refresh schedule", () => {
  it("uses the next Chrome alarm scheduled time when available", async () => {
    await expect(
      readPopupRefreshCountdownMinutes(30, {
        now: () => 1_000,
        chrome: {
          alarms: {
            get: async () => ({
              name: "ai-usage-dashboard.periodic-sync.v2",
              scheduledTime: 1_000 + 12.2 * 60_000,
            }),
          },
        },
      }),
    ).resolves.toBe(13);
  });

  it("falls back to the normalized sync interval when the alarm is unavailable", async () => {
    await expect(
      readPopupRefreshCountdownMinutes(2, {
        chrome: {
          alarms: {
            get: async () => undefined,
          },
        },
      }),
    ).resolves.toBe(3);
  });

  it("formats a compact approximate countdown label", () => {
    expect(formatPopupRefreshCountdownLabel(15, String)).toBe("~15m");
    expect(formatPopupRefreshCountdownLabel(null, String)).toBeNull();
  });
});
