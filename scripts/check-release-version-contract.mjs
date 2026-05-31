#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();

async function readJson(relativePath) {
  const raw = await readFile(path.join(projectRoot, relativePath), "utf8");
  return JSON.parse(raw);
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

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(
      `Release version contract failed: ${label} must be ${expected}, got ${actual}.`,
    );
  }
}

const [packageJson, packageLock, manifest] = await Promise.all([
  readJson("package.json"),
  readJson("package-lock.json"),
  readJson("src/manifest.json"),
]);

const packageVersion = packageJson.version;
const expectedManifestVersion = buildExpectedManifestVersion(packageVersion);

assertEqual(
  packageJson.scripts?.["release:check"]?.includes("npm run release:version:check"),
  true,
  "`release:check` includes release:version:check",
);
assertEqual(packageLock.version, packageVersion, "package-lock.json version");
assertEqual(
  packageLock.packages?.[""]?.version,
  packageVersion,
  "package-lock.json root package version",
);
assertEqual(manifest.version_name, packageVersion, "src/manifest.json version_name");
assertEqual(
  manifest.version,
  expectedManifestVersion,
  "src/manifest.json numeric version",
);

console.log(
  `release version contract check passed: package ${packageVersion}, manifest ${manifest.version}`,
);
