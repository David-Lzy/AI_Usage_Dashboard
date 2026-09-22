import { execSync } from "node:child_process";
import { readdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { crx } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import manifest from "./src/manifest.json";
import pkg from "./package.json";
import { ensureLegacyChromeDistAliases } from "./scripts/lib/chrome-dist-aliases";
import {
  assertConfiguredChromeBuildOutDir,
  resolveBuildPaths,
  shouldMaintainLegacyChromeDistAliases,
} from "./scripts/lib/build-paths.mjs";

const buildPaths = resolveBuildPaths();

function getGitCommit(): string {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "unknown";
  }
}

function normalizeRollupId(id: string | null | undefined) {
  return id?.replaceAll("\\", "/") ?? "";
}

async function rewriteBuiltAssetReferences(
  chromeDistDir: string,
  previousAssetRelativePath: string,
  stableAssetRelativePath: string,
) {
  const previousAssetPath = normalizeRollupId(previousAssetRelativePath);
  const stableAssetPath = normalizeRollupId(stableAssetRelativePath);

  if (previousAssetPath === stableAssetPath) {
    return;
  }

  const previousAssetFilename = path.posix.basename(previousAssetPath);
  const stableAssetFilename = path.posix.basename(stableAssetPath);
  const assetsAbsoluteDir = path.join(chromeDistDir, "assets");
  const entries = await readdir(assetsAbsoluteDir, { withFileTypes: true });

  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".js"))
      .map(async (entry) => {
        const assetAbsolutePath = path.join(assetsAbsoluteDir, entry.name);
        const asset = await readFile(assetAbsolutePath, "utf8");
        const nextAsset = asset
          .replaceAll(`./${previousAssetFilename}`, `./${stableAssetFilename}`)
          .replaceAll(`/${previousAssetPath}`, `/${stableAssetPath}`)
          .replaceAll(previousAssetPath, stableAssetPath);

        if (nextAsset !== asset) {
          await writeFile(assetAbsolutePath, nextAsset);
        }
      }),
  );
}

async function rewriteHtmlEntryToStableFile(
  chromeDistDir: string,
  htmlRelativePath: string,
  stableAssetRelativePath: string,
) {
  const htmlAbsolutePath = path.join(chromeDistDir, htmlRelativePath);
  const html = await readFile(htmlAbsolutePath, "utf8");
  const match = html.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/);

  if (!match) {
    throw new Error(`Failed to find module entry script in ${htmlRelativePath}`);
  }

  const currentAssetPath = match[1];
  const currentAssetRelativePath = currentAssetPath.replace(/^\//, "");
  const currentAssetAbsolutePath = path.join(
    chromeDistDir,
    currentAssetRelativePath,
  );
  const stableAssetAbsolutePath = path.join(
    chromeDistDir,
    stableAssetRelativePath,
  );

  if (currentAssetRelativePath !== stableAssetRelativePath) {
    await rename(currentAssetAbsolutePath, stableAssetAbsolutePath);
    await rewriteBuiltAssetReferences(
      chromeDistDir,
      currentAssetRelativePath,
      stableAssetRelativePath,
    );
  }

  const rewrittenHtml = html.replace(currentAssetPath, `/${stableAssetRelativePath}`);
  await writeFile(htmlAbsolutePath, rewrittenHtml);
}

function stableExtensionBuildOutputPlugin() {
  return {
    name: "stable-extension-build-output",
    apply: "build" as const,
    configResolved(config: { root: string; build: { outDir: string } }) {
      assertConfiguredChromeBuildOutDir(buildPaths, config.root, config.build.outDir);
    },
    async closeBundle() {
      await rewriteHtmlEntryToStableFile(
        buildPaths.chromeDir,
        path.join("src/popup/index.html"),
        "assets/popup.js",
      );
      await rewriteHtmlEntryToStableFile(
        buildPaths.chromeDir,
        path.join("src/sidepanel/index.html"),
        "assets/sidepanel.js",
      );

      const loaderRelativePath = "service-worker-loader.js";
      const loaderAbsolutePath = path.join(buildPaths.chromeDir, loaderRelativePath);
      const loader = await readFile(loaderAbsolutePath, "utf8");
      const workerMatch = loader.match(/['"]\.\/assets\/([^'"]+)['"]/);

      if (!workerMatch) {
        throw new Error(`Failed to find built service-worker import in ${loaderRelativePath}`);
      }

      const currentWorkerRelativePath = `assets/${workerMatch[1]}`;
      const stableWorkerRelativePath = "assets/service-worker.js";
      const currentWorkerAbsolutePath = path.join(
        buildPaths.chromeDir,
        currentWorkerRelativePath,
      );
      const stableWorkerAbsolutePath = path.join(
        buildPaths.chromeDir,
        stableWorkerRelativePath,
      );

      if (currentWorkerRelativePath !== stableWorkerRelativePath) {
        await rename(currentWorkerAbsolutePath, stableWorkerAbsolutePath);
      }

      const rewrittenLoader = loader.replace(
        `./${currentWorkerRelativePath}`,
        `./${stableWorkerRelativePath}`,
      );
      await writeFile(loaderAbsolutePath, rewrittenLoader);
      if (shouldMaintainLegacyChromeDistAliases(buildPaths)) {
        await ensureLegacyChromeDistAliases(buildPaths.projectRoot);
      }
    },
  };
}

export default defineConfig({
  define: {
    __APP_VERSION__:     JSON.stringify(pkg.version),
    __BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString()),
    __GIT_COMMIT__:      JSON.stringify(getGitCommit()),
    __SOURCE_ORIGIN__:   JSON.stringify(pkg.homepage),
  },
  plugins: [react(), crx({ manifest }), stableExtensionBuildOutputPlugin()],
  build: {
    outDir: buildPaths.chromeDir,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        chunkFileNames: "assets/[name].js",
        assetFileNames(assetInfo) {
          const names = [
            ...(assetInfo.names ?? []),
            ...(assetInfo.originalFileNames ?? []),
          ].map((name) => normalizeRollupId(name));

          if (names.some((name) => name.endsWith("material-theme.css"))) {
            return "assets/material-theme.css";
          }

          return "assets/[name][extname]";
        },
      },
    },
  },
});
