export function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

export async function waitForDashboard(page) {
  await page.waitForSelector(".dashboard-section");
  await page.waitForTimeout(250);
}

export async function waitForSettings(page) {
  await page.waitForSelector("#settings-appearance");
  await page.waitForSelector("[data-topbar-open-full-page='true']");
  await page.waitForTimeout(250);
}

export async function waitForProviderDetail(page) {
  await page.waitForSelector(
    "[data-theme-stability-surface='provider-detail-sync-status-card']",
  );
  await page.waitForSelector("[data-topbar-open-full-page='true']");
  await page.waitForTimeout(250);
}

export async function collectSettingsSnapshot(page) {
  return page.evaluate(() => {
    function rectTop(selector) {
      const element = document.querySelector(selector);

      return element ? Math.round(element.getBoundingClientRect().top) : null;
    }

    const colorDropdownButton = document.querySelector(
      "[data-session-popover-id='progress-color-band:high:color'] button",
    );
    const providerProgressDetails = Array.from(
      document.querySelectorAll("[data-provider-progress-preference-provider]"),
    ).map((element) => ({
      id: element.getAttribute("data-provider-progress-preference-provider"),
      open: element instanceof HTMLDetailsElement ? element.open : false,
    }));
    const carousels = Array.from(
      document.querySelectorAll("[data-provider-carousel]"),
    ).map((element) => ({
      activeId: element.getAttribute("data-provider-carousel-active-id"),
      count: Number(element.getAttribute("data-provider-carousel-count") ?? "0"),
    }));
    const uiMore = document.querySelector(".settings-preferences__more");
    const toolbarPreviewButton = document.querySelector(
      ".settings-preferences__test-popup-button",
    );

    return {
      url: window.location.href,
      urlProtocol: window.location.protocol,
      hash: window.location.hash,
      search: window.location.search,
      scrollY: Math.round(window.scrollY),
      viewportHeight: window.innerHeight,
      scrollHeight: document.documentElement.scrollHeight,
      colorDropdownOpen: colorDropdownButton?.getAttribute("data-open") ?? null,
      colorDropdownTop: rectTop(
        "[data-session-popover-id='progress-color-band:high:color']",
      ),
      providerDisplayTop: rectTop("#settings-provider-display"),
      quickSetupTop: rectTop("#settings-quick-setup"),
      advancedTop: rectTop("#settings-advanced"),
      providerProgressDetails,
      carousels,
      uiMoreOpen: uiMore?.getAttribute("data-open") ?? null,
      toolbarPreviewOpen:
        toolbarPreviewButton?.getAttribute("aria-pressed") ?? null,
      toolbarPreviewMode:
        uiMore?.getAttribute("data-toolbar-popup-preview-mode") ?? null,
    };
  });
}

export function assertVisibleTop(snapshot, key, label) {
  const top = snapshot[key];

  assert(typeof top === "number", `${label} top was not available.`);
  assert(
    top >= -120 && top <= snapshot.viewportHeight * 0.8,
    `${label} was not restored into view; top=${top}, viewport=${snapshot.viewportHeight}.`,
  );
}
