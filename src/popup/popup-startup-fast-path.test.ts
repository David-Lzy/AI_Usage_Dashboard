import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const popupAppSource = readFileSync(
  new URL("./PopupApp.tsx", import.meta.url),
  "utf8",
);
const popupLoadStateCardsSource = readFileSync(
  new URL("./PopupLoadStateCards.tsx", import.meta.url),
  "utf8",
);
const popupThemeCss = readFileSync(
  new URL("./popup-theme.css", import.meta.url),
  "utf8",
);
const messageBusSource = readFileSync(
  new URL("../background/message-bus.ts", import.meta.url),
  "utf8",
);
const serviceWorkerSource = readFileSync(
  new URL("../background/service-worker.ts", import.meta.url),
  "utf8",
);

describe("popup startup fast path", () => {
  it("renders no intermediate loading card or indicator", () => {
    expect(popupAppSource).toContain(
      'if (loadState.status === "loading") {\n    return null;',
    );
    expect(popupAppSource).not.toContain("PopupLoadingCard");
    expect(popupLoadStateCardsSource).not.toContain("PopupLoadingCard");
    expect(popupThemeCss).not.toContain("popup-load-state-card__indicator");
  });

  it("waits for cached settings before starting theme synchronization", () => {
    const themeSyncStart = popupAppSource.indexOf("startThemeSettingsSync(");
    const readyGuard = popupAppSource.lastIndexOf(
      'if (loadState.status !== "ready")',
      themeSyncStart,
    );

    expect(themeSyncStart).toBeGreaterThan(-1);
    expect(readyGuard).toBeGreaterThan(-1);
    expect(readyGuard).toBeLessThan(themeSyncStart);
  });

  it("keeps read-state ahead of maintenance work as a one-read fast path", () => {
    const readStateStart = messageBusSource.indexOf(
      'if (message.type === "app:read-state")',
    );
    const screenshotLockRead = messageBusSource.indexOf(
      "readStoreScreenshotRuntimeLock()",
      readStateStart,
    );
    const fastPath = messageBusSource.slice(readStateStart, screenshotLockRead);

    expect(readStateStart).toBeGreaterThan(-1);
    expect(screenshotLockRead).toBeGreaterThan(readStateStart);
    expect(fastPath).toContain("seedAppStateIfEmpty()");
    expect(fastPath).not.toContain("syncStoredProviderPermissions");
    expect(fastPath).not.toContain("syncStoredProviderCredentials");
    expect(fastPath).not.toContain("ensureBackgroundAlarms");
  });

  it("moves permission reconciliation to browser events and skips toolbar writes", () => {
    expect(serviceWorkerSource).toContain(
      "chrome.permissions.onAdded.addListener",
    );
    expect(serviceWorkerSource).toContain(
      "chrome.permissions.onRemoved.addListener",
    );
    expect(serviceWorkerSource).toContain(
      'response.ok && message.type !== "app:read-state"',
    );
  });
});
