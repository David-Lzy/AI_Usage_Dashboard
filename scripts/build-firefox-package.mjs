import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const chromeDistDir = path.join(projectRoot, "dist");
const firefoxDistDir = path.join(projectRoot, "dist-firefox");
const firefoxManifestPath = path.join(firefoxDistDir, "manifest.json");

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function buildFirefoxManifest(chromeManifest) {
  const manifest = structuredClone(chromeManifest);

  delete manifest.side_panel;
  delete manifest.version_name;

  manifest.permissions = (manifest.permissions ?? []).filter(
    (permission) => permission !== "sidePanel" && permission !== "favicon",
  );

  if (manifest.background?.service_worker) {
    manifest.background = {
      ...manifest.background,
      scripts: [manifest.background.service_worker],
    };
  }

  manifest.sidebar_action = {
    default_title: manifest.action?.default_title ?? manifest.name,
    default_panel: "src/sidepanel/index.html",
    default_icon: manifest.action?.default_icon ?? manifest.icons,
    open_at_install: false,
  };

  manifest.browser_specific_settings = {
    gecko: {
      data_collection_permissions: {
        required: ["none"],
      },
      id: "ai-usage-dashboard@david-lzy.github.io",
      strict_min_version: "140.0",
    },
  };

  return manifest;
}

async function main() {
  const chromeManifestPath = path.join(chromeDistDir, "manifest.json");
  const chromeManifest = await readJson(chromeManifestPath).catch((error) => {
    throw new Error(
      `Could not read ${chromeManifestPath}. Run npm run build before firefox:build. ${error}`,
    );
  });

  await rm(firefoxDistDir, { force: true, recursive: true });
  await mkdir(path.dirname(firefoxDistDir), { recursive: true });
  await cp(chromeDistDir, firefoxDistDir, { recursive: true });
  await writeJson(firefoxManifestPath, buildFirefoxManifest(chromeManifest));

  console.log(`Firefox package directory created: ${firefoxDistDir}`);
}

await main();
