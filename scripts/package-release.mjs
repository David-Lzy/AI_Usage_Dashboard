import { mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const projectRoot = process.cwd();
const distDir = path.join(projectRoot, "dist");
const releaseDir = path.join(projectRoot, "release");
const packageJsonPath = path.join(projectRoot, "package.json");
const manifestPath = path.join(projectRoot, "src", "manifest.json");
const builtManifestPath = path.join(distDir, "manifest.json");

async function readJson(filePath) {
  const moduleUrl = new URL(`file://${filePath}`);
  const imported = await import(moduleUrl.href, {
    with: { type: "json" },
  });

  return imported.default;
}

function buildExpectedManifestVersion(packageVersion) {
  const match = packageVersion.match(/^(\d+)\.(\d+)\.(\d+)(?:-rc\.(\d+))?$/);

  if (!match) {
    throw new Error(
      `Unsupported package version format "${packageVersion}". Expected x.y.z or x.y.z-rc.n.`,
    );
  }

  const [, major, minor, patch, rcNumber] = match;
  return `${major}.${minor}.${patch}.${rcNumber ?? "0"}`;
}

async function ensureExists(filePath, label) {
  try {
    await stat(filePath);
  } catch {
    throw new Error(`${label} is missing: ${filePath}`);
  }
}

async function main() {
  const packageJson = await readJson(packageJsonPath);
  const manifest = await readJson(manifestPath);
  const packageVersion = packageJson.version;
  const manifestVersionName = manifest.version_name ?? manifest.version;
  const expectedManifestVersion = buildExpectedManifestVersion(packageVersion);

  if (manifestVersionName !== packageVersion) {
    throw new Error(
      `manifest.version_name (${manifestVersionName}) must match package.json version (${packageVersion}).`,
    );
  }

  if (manifest.version !== expectedManifestVersion) {
    throw new Error(
      `manifest.version (${manifest.version}) must match the numeric Chrome version derived from package.json (${expectedManifestVersion}).`,
    );
  }

  await ensureExists(distDir, "Build output directory");
  await ensureExists(builtManifestPath, "Built manifest");
  await ensureExists(path.join(distDir, "src", "sidepanel", "index.html"), "Built side panel entry");
  await ensureExists(path.join(distDir, "icons", "icon128.png"), "Built icon set");

  const builtManifest = await readJson(builtManifestPath);
  const builtManifestVersionName =
    builtManifest.version_name ?? builtManifest.version;

  if (builtManifestVersionName !== packageVersion) {
    throw new Error(
      `dist/manifest.json version_name (${builtManifestVersionName}) must match package.json version (${packageVersion}). Run \`npm run build\` before packaging.`,
    );
  }

  if (builtManifest.version !== expectedManifestVersion) {
    throw new Error(
      `dist/manifest.json version (${builtManifest.version}) must match the numeric Chrome version derived from package.json (${expectedManifestVersion}). Run \`npm run build\` before packaging.`,
    );
  }

  await mkdir(releaseDir, { recursive: true });

  const archiveName = `ai-usage-dashboard-${packageVersion}.zip`;
  const archivePath = path.join(releaseDir, archiveName);

  await rm(archivePath, { force: true });

  await execFileAsync(
    "zip",
    ["-qr", archivePath, "."],
    {
      cwd: distDir,
    },
  );

  console.log(`Release package created: ${archivePath}`);
}

await main();
