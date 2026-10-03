import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { createServer } from "vite";

const arg = (name) =>
  process.argv
    .find((value) => value.startsWith(`${name}=`))
    ?.slice(name.length + 1);
assert(arg("--extension"), "Pass --extension=<isolated Chrome build>");
const extensionPath = path.resolve(arg("--extension"));
assert(
  !extensionPath.startsWith(path.resolve("dist") + path.sep),
  "Do not test a user-loaded build",
);
const manifest = JSON.parse(
  await readFile(path.join(extensionPath, "manifest.json"), "utf8"),
);
const root = path.resolve("tmp/output/playwright/fusion-native-popup");
await mkdir(root, { recursive: true });
const output = await mkdtemp(path.join(root, "run-"));
const loader = await createServer({
  configFile: false,
  cacheDir: path.join(output, "vite-cache"),
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, watch: null },
  appType: "custom",
});
let fixture;
try {
  const seed = await loader.ssrLoadModule(
    "/src/sidepanel/store-screenshot-seed.ts",
  );
  fixture = JSON.parse(
    JSON.stringify(
      seed.getStoreScreenshotSeedPresetDefinition("toolbar-first-quick-glance")
        .appState,
    ),
  );
} finally {
  await loader.close();
}

// Chrome action bubbles are not exposed in context.pages(). Attach to the real
// action target without opening its URL in a tab or emulating its viewport.
async function attach(rootSession, targetId) {
  const { sessionId } = await rootSession.send("Target.attachToTarget", {
    targetId,
    flatten: false,
  });
  let sequence = 0;
  const pending = new Map();
  const listener = (event) => {
    if (event.sessionId !== sessionId) return;
    const message = JSON.parse(event.message);
    const request = pending.get(message.id);
    if (!request) return;
    clearTimeout(request.timer);
    pending.delete(message.id);
    if (message.error) request.reject(new Error(JSON.stringify(message.error)));
    else request.resolve(message.result);
  };
  rootSession.on("Target.receivedMessageFromTarget", listener);
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++sequence;
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`${method} timed out`));
      }, 15000);
      pending.set(id, { resolve, reject, timer });
      rootSession
        .send("Target.sendMessageToTarget", {
          sessionId,
          message: JSON.stringify({ id, method, params }),
        })
        .catch((error) => {
          clearTimeout(timer);
          pending.delete(id);
          reject(error);
        });
    });
  return {
    send,
    async close() {
      rootSession.off("Target.receivedMessageFromTarget", listener);
      for (const request of pending.values()) {
        clearTimeout(request.timer);
        request.reject(new Error("Target closed"));
      }
      await rootSession
        .send("Target.detachFromTarget", { sessionId })
        .catch(() => undefined);
    },
  };
}

const results = [],
  errors = [];
let context,
  passed = false;
try {
  context = await chromium.launchPersistentContext(
    path.join(output, "profile"),
    {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
      headless: true,
      offline: true,
      viewport: { width: 1440, height: 900 },
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    },
  );
  const worker =
    context.serviceWorkers()[0] ??
    (await context.waitForEvent("serviceworker"));
  const origin = `chrome-extension://${new URL(worker.url()).host}`;
  await worker.evaluate(() =>
    chrome.storage.local.set({
      "ai-usage-dashboard.store-screenshot-runtime-lock": true,
    }),
  );
  const helper = await context.newPage();
  await helper.goto(
    `${origin}/src/sidepanel/index.html?surface=full-page#settings`,
  );
  await helper.locator(".settings-fusion").waitFor();
  const session = await context.newCDPSession(helper);
  const styles = ["line", "circle", "circle-soft", "circle-gauge"];
  const modes = ["collapsible", "single", "switch", "scroll"];
  for (const locale of (arg("--locales") ?? "en,zh-CN,ar").split(","))
    for (const theme of ["light", "dark"])
      for (const [size, width] of [
        ["compact", 344],
        ["balanced", 392],
        ["wide", 520],
      ])
        for (const [index, style] of styles.entries()) {
          const state = structuredClone(fixture);
          const id = `${locale}-${theme}-${size}-${style}`;
          state.settings = {
            ...state.settings,
            locale,
            themeMode: theme,
            popupSizePreset: size,
            popupProgressStyle: style,
            popupProviderBrowsingMode: modes[index],
            motionMode: arg("--motion-mode") ?? "reduced",
            popupCornerStyle:
              size === "compact"
                ? "square"
                : size === "wide"
                  ? "rounded"
                  : "soft",
            popupShadowStyle:
              size === "compact"
                ? "none"
                : size === "wide"
                  ? "elevated"
                  : "soft",
          };
          state.settings.providerOrderBySurface.popup = [
            "codex-personal-page",
            "claude-code-team-page",
          ];
          state.providerSettings = state.providerSettings.map((setting) => ({
            ...setting,
            displayEnabled:
              state.settings.providerOrderBySurface.popup.includes(setting.id),
          }));
          for (const snapshot of state.providers)
            for (const window of snapshot.usageWindows ?? [])
              if (window.resetAt) window.resetAt = "2026-10-06T12:00:00.000Z";
          const snapshots = structuredClone(state.providers);
          await worker.evaluate(
            (state) =>
              chrome.storage.local.set({
                "ai-usage-dashboard.app-state": state,
              }),
            state,
          );
          await worker.evaluate(() => chrome.action.openPopup());
          await helper.waitForFunction(() =>
            chrome.extension
              .getViews({ type: "popup" })[0]
              ?.document.querySelector(".popup-provider-card"),
          );
          const target = (
            await session.send("Target.getTargets")
          ).targetInfos.find(
            (target) =>
              target.url === `${origin}/${manifest.action.default_popup}`,
          );
          assert(target, "Chrome did not create an action popup target");
          const native = await attach(session, target.targetId);
          const evaluate = async (fn) => {
            const response = await native.send("Runtime.evaluate", {
              expression: `(${fn.toString()})()`,
              returnByValue: true,
              awaitPromise: true,
            });
            assert(
              !response.exceptionDetails,
              JSON.stringify(response.exceptionDetails),
            );
            return response.result.value;
          };
          try {
            await evaluate(async () => {
              await document.fonts.ready;
              await new Promise((resolve) => setTimeout(resolve, 350));
              await new Promise((resolve) =>
                requestAnimationFrame(() => requestAnimationFrame(resolve)),
              );
            });
            const layout = await evaluate(() => ({
              actionView: chrome.extension
                .getViews({ type: "popup" })
                .includes(window),
              width: innerWidth,
              height: innerHeight,
              bodyWidth: document.body.getBoundingClientRect().width,
              overflow: document.documentElement.scrollWidth - innerWidth,
              cards: document.querySelectorAll(".popup-provider-card").length,
              theme: document.documentElement.dataset.themeResolved,
              locale: document.documentElement.lang,
              dir: document.documentElement.dir,
              style: document.querySelector(".popup-provider-card__progress")
                ?.className,
              radius: getComputedStyle(
                document.querySelector(".popup-provider-card"),
              ).borderRadius,
              shadow: getComputedStyle(
                document.querySelector(".popup-provider-card"),
              ).boxShadow,
              background: getComputedStyle(document.body).backgroundColor,
              materialLibrary: customElements.get("mdui-select") !== undefined,
              resources: performance
                .getEntriesByType("resource")
                .map((resource) => resource.name),
              progress: [
                ...document.querySelectorAll('[role="progressbar"]'),
              ].map((element) => element.getAttribute("aria-valuenow")),
              headerClipped: [
                ...document.querySelectorAll(".popup-provider-card__header"),
              ].some(
                (element) => element.scrollWidth > element.clientWidth + 1,
              ),
            }));
            assert(layout.actionView, "This is a tab, not the action popup");
            assert(
              Math.abs(layout.bodyWidth - width) <= 2 && layout.overflow <= 1,
              JSON.stringify(layout),
            );
            assert(
              layout.height > 100 &&
                layout.height <= 600 &&
                !layout.headerClipped,
            );
            assert.equal(
              layout.cards,
              ["single", "switch"].includes(modes[index]) ? 1 : 2,
            );
            assert.equal(layout.theme, theme);
            assert.equal(layout.locale, locale);
            assert.equal(layout.dir, locale === "ar" ? "rtl" : "ltr");
            assert.notEqual(
              layout.background,
              "rgba(0, 0, 0, 0)",
              "Popup background token is unresolved",
            );
            assert(layout.style.includes(`--${style}`));
            assert(
              !layout.materialLibrary &&
                !layout.resources.some((url) =>
                  /material-controls|^https?:/.test(url),
                ),
            );
            if (size === "compact") assert.equal(layout.shadow, "none");
            const shot = await native.send("Page.captureScreenshot", {
              format: "png",
            });
            await writeFile(
              path.join(output, `${id}.png`),
              Buffer.from(shot.data, "base64"),
            );
            await evaluate(() =>
              document
                .querySelector(".popup-header__theme-menu > button")
                .click(),
            );
            const menu = await evaluate(() => {
              const box = document
                .querySelector(".popup-header__theme-mode-menu")
                .getBoundingClientRect();
              return {
                left: box.left,
                right: box.right,
                bottom: box.bottom,
                width: innerWidth,
                height: innerHeight,
              };
            });
            assert(
              menu.left >= -1 &&
                menu.right <= menu.width + 1 &&
                menu.bottom <= menu.height,
              JSON.stringify(menu),
            );
            await native.send("Input.dispatchKeyEvent", {
              type: "keyDown",
              key: "Escape",
              code: "Escape",
              windowsVirtualKeyCode: 27,
            });
            await native.send("Input.dispatchKeyEvent", {
              type: "keyUp",
              key: "Escape",
              code: "Escape",
              windowsVirtualKeyCode: 27,
            });
            assert(
              await evaluate(
                () =>
                  document.querySelector(".popup-header__theme-mode-menu")
                    .hidden,
              ),
            );
            assert(
              await evaluate(
                () =>
                  document.activeElement ===
                  document.querySelector(".popup-header__theme-menu > button"),
              ),
            );
            assert.deepEqual(
              await worker.evaluate(
                async () =>
                  (
                    await chrome.storage.local.get(
                      "ai-usage-dashboard.app-state",
                    )
                  )["ai-usage-dashboard.app-state"].providers,
              ),
              snapshots,
            );
            results.push({
              id,
              mode: modes[index],
              layout,
              menu,
              keyboard: true,
            });
            console.log(`Native action ${id}: passed`);
          } finally {
            await native.close();
            await helper.evaluate(() =>
              chrome.extension
                .getViews({ type: "popup" })
                .forEach((view) => view.close()),
            );
          }
        }
  passed = true;
} catch (error) {
  errors.push(String(error));
  throw error;
} finally {
  await writeFile(
    path.join(output, "result.json"),
    JSON.stringify(
      {
        passed,
        extensionPath,
        browser: context?.browser()?.version(),
        results,
        errors,
      },
      null,
      2,
    ),
  );
  await context?.close();
  console.log(`Native action evidence: ${output}`);
}
