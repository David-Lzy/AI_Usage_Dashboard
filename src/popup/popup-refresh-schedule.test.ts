import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { PERIODIC_SYNC_ALARM } from "../shared/alarm-names";
import {
  decrementPopupRefreshCountdownSeconds,
  formatPopupRefreshCountdownLabel,
  POPUP_REFRESH_COUNTDOWN_ALARM_RESYNC_MS,
  readPopupRefreshCountdownSeconds,
} from "./popup-refresh-schedule";

const popupAppSource = readFileSync(
  new URL("./PopupApp.tsx", import.meta.url),
  "utf8",
);

describe("popup refresh schedule", () => {
  it("uses the next Chrome alarm scheduled time when available", async () => {
    await expect(
      readPopupRefreshCountdownSeconds(30, {
        now: () => 1_000,
        chrome: {
          alarms: {
            get: async () => ({
              name: PERIODIC_SYNC_ALARM,
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

  it("ticks the visible countdown locally between alarm reads", () => {
    expect(decrementPopupRefreshCountdownSeconds(null)).toBeNull();
    expect(decrementPopupRefreshCountdownSeconds(0)).toBe(0);
    expect(decrementPopupRefreshCountdownSeconds(1)).toBe(0);
    expect(decrementPopupRefreshCountdownSeconds(125.2)).toBe(125);
  });

  it("keeps popup alarm reads on a lower-frequency resync cadence", () => {
    expect(POPUP_REFRESH_COUNTDOWN_ALARM_RESYNC_MS).toBeGreaterThanOrEqual(
      30_000,
    );
    expect(popupAppSource).toContain(
      "window.setInterval(tickRefreshCountdown, 1_000)",
    );
    expect(popupAppSource).toContain(
      "window.setInterval(\n      syncRefreshCountdownFromAlarm,",
    );
    expect(popupAppSource).not.toContain(
      "window.setInterval(updateRefreshCountdown, 1_000)",
    );
  });
});
