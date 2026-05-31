#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();

async function readProjectFile(relativePath) {
  return readFile(path.join(projectRoot, relativePath), "utf8");
}

function assertIncludes(source, snippet, label) {
  if (!source.includes(snippet)) {
    throw new Error(`Release workflow contract failed: missing ${label}.`);
  }
}

function assertNotIncludes(source, snippet, label) {
  if (source.includes(snippet)) {
    throw new Error(`Release workflow contract failed: unexpected ${label}.`);
  }
}

function assertMatches(source, pattern, label) {
  if (!pattern.test(source)) {
    throw new Error(`Release workflow contract failed: missing ${label}.`);
  }
}

const [workflow, releaseGuide, readme, packageJsonText] = await Promise.all([
  readProjectFile(".github/workflows/build-packages.yml"),
  readProjectFile("Doc/Store/GitHub_Release_Push_And_Notes.md"),
  readProjectFile("README.md"),
  readProjectFile("package.json"),
]);

const packageJson = JSON.parse(packageJsonText);

assertIncludes(
  packageJson.scripts?.["release:check"] ?? "",
  "npm run release:workflow:check",
  "`release:check` workflow guard",
);

assertIncludes(
  workflow,
  'chrome_asset="ai-usage-dashboard-chrome-${package_version}.zip"',
  "Chrome release asset name",
);
assertIncludes(
  workflow,
  'firefox_asset="ai-usage-dashboard-firefox-${package_version}.zip"',
  "Firefox release asset name",
);
assertIncludes(workflow, "name: chrome-extension-package", "Chrome artifact name");
assertIncludes(workflow, "name: firefox-extension-package", "Firefox artifact name");
assertNotIncludes(
  workflow,
  "already has the expected assets; skipping",
  "asset-only release skip path",
);
assertIncludes(
  workflow,
  "should-upload-assets=${should_upload_assets}",
  "release asset upload output",
);
assertIncludes(
  workflow,
  "Matching GitHub Release ${release_tag} does not exist yet; skipping notes refresh.",
  "main notes-only release skip",
);
assertIncludes(
  workflow,
  "if: steps.release-target.outputs.should-upload-assets == 'true'",
  "tag-scoped package artifact download",
);
assertIncludes(
  workflow,
  "if [[ \"${SHOULD_UPLOAD_ASSETS}\" == \"true\" ]]; then",
  "conditional release asset upload",
);
assertIncludes(
  workflow,
  "Refusing to create ${RELEASE_TAG} without tag-scoped release assets.",
  "release creation asset provenance guard",
);
assertIncludes(
  workflow,
  'sha256sum "${chrome_asset}" "${firefox_asset}" > SHA256SUMS.txt',
  "release checksums",
);
assertIncludes(workflow, "--notes-file release-notes.md", "release notes upload");
assertIncludes(workflow, "### Downloads", "release notes downloads section");
assertIncludes(workflow, "- Chrome: \\`${chrome_asset}\\`", "Chrome release notes entry");
assertIncludes(
  workflow,
  "- Firefox local beta: \\`${firefox_asset}\\`",
  "Firefox release notes entry",
);
assertIncludes(workflow, "- Checksums: \\`SHA256SUMS.txt\\`", "checksum release notes entry");
assertIncludes(
  workflow,
  "Chrome Web Store remains the recommended install path",
  "Chrome Web Store install boundary note",
);
assertIncludes(
  workflow,
  "Normal Firefox installation still needs a signed AMO/self-distribution package",
  "Firefox unsigned package boundary note",
);
assertMatches(
  workflow,
  /release:\n(?:[\s\S]*?\n)?\s+name: Publish GitHub Release[\s\S]*?\n\s+permissions:\n\s+contents: write/,
  "GitHub Release write permission",
);

assertIncludes(
  releaseGuide,
  "Chrome: `ai-usage-dashboard-chrome-<package-version>.zip`",
  "public Chrome asset naming guide",
);
assertIncludes(
  releaseGuide,
  "Firefox local beta: `ai-usage-dashboard-firefox-<package-version>.zip`",
  "public Firefox asset naming guide",
);
assertIncludes(
  releaseGuide,
  "## Release Notes Template",
  "public release notes template",
);
assertIncludes(
  releaseGuide,
  "Do not imply that the GitHub Firefox zip is signed",
  "public Firefox signing boundary",
);
assertIncludes(
  readme,
  "GitHub Release with Chrome and Firefox package zips plus",
  "README automated package summary",
);
assertIncludes(
  readme,
  "Doc/Store/GitHub_Release_Push_And_Notes.md",
  "README release guide link",
);

console.log("release workflow contract check passed");
