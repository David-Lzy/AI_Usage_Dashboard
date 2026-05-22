import { execSync } from "node:child_process";
import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { crx } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import manifest from "./src/manifest.json";
import pkg from "./package.json";

const chromeDistRelativeDir = "dist/chrome";

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

async function rewriteHtmlEntryToStableFile(
  projectRoot: string,
  htmlRelativePath: string,
  stableAssetRelativePath: string,
) {
  const htmlAbsolutePath = path.join(projectRoot, htmlRelativePath);
  const html = await readFile(htmlAbsolutePath, "utf8");
  const match = html.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/);

  if (!match) {
    throw new Error(`Failed to find module entry script in ${htmlRelativePath}`);
  }

  const currentAssetPath = match[1];
  const currentAssetRelativePath = currentAssetPath.replace(/^\//, "");
  const currentAssetAbsolutePath = path.join(
    projectRoot,
    chromeDistRelativeDir,
    currentAssetRelativePath,
  );
  const stableAssetAbsolutePath = path.join(
    projectRoot,
    chromeDistRelativeDir,
    stableAssetRelativePath,
  );

  if (currentAssetRelativePath !== stableAssetRelativePath) {
    await rename(currentAssetAbsolutePath, stableAssetAbsolutePath);
  }

  const rewrittenHtml = html.replace(currentAssetPath, `/${stableAssetRelativePath}`);
  await writeFile(htmlAbsolutePath, rewrittenHtml);
}

function stableExtensionBuildOutputPlugin() {
  return {
    name: "stable-extension-build-output",
    async closeBundle() {
      const projectRoot = process.cwd();

      await rewriteHtmlEntryToStableFile(
        projectRoot,
        path.join(chromeDistRelativeDir, "src/popup/index.html"),
        "assets/popup.js",
      );
      await rewriteHtmlEntryToStableFile(
        projectRoot,
        path.join(chromeDistRelativeDir, "src/sidepanel/index.html"),
        "assets/sidepanel.js",
      );

      const loaderRelativePath = path.join(
        chromeDistRelativeDir,
        "service-worker-loader.js",
      );
      const loaderAbsolutePath = path.join(projectRoot, loaderRelativePath);
      const loader = await readFile(loaderAbsolutePath, "utf8");
      const workerMatch = loader.match(/['"]\.\/assets\/([^'"]+)['"]/);

      if (!workerMatch) {
        throw new Error(`Failed to find built service-worker import in ${loaderRelativePath}`);
      }

      const currentWorkerRelativePath = `assets/${workerMatch[1]}`;
      const stableWorkerRelativePath = "assets/service-worker.js";
      const currentWorkerAbsolutePath = path.join(
        projectRoot,
        chromeDistRelativeDir,
        currentWorkerRelativePath,
      );
      const stableWorkerAbsolutePath = path.join(
        projectRoot,
        chromeDistRelativeDir,
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
    outDir: chromeDistRelativeDir,
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
