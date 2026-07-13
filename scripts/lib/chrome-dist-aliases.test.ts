import { lstat, mkdtemp, mkdir, readFile, readlink, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  ensureLegacyChromeDistAliases,
  LEGACY_CHROME_DIST_ALIASES,
} from "./chrome-dist-aliases";

const temporaryRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

async function createProjectRoot() {
  const root = await mkdtemp(path.join(tmpdir(), "ai-usage-dashboard-dist-aliases-"));
  temporaryRoots.push(root);
  await mkdir(path.join(root, "dist", "chrome"), { recursive: true });
  return root;
}

describe("ensureLegacyChromeDistAliases", () => {
  it("creates every Chrome compatibility alias including the document-start observer", async () => {
    const root = await createProjectRoot();

    await ensureLegacyChromeDistAliases(root);
    await ensureLegacyChromeDistAliases(root);

    expect(LEGACY_CHROME_DIST_ALIASES).toContain(
      "page-session-network-observer-document-start.js",
    );

    for (const alias of LEGACY_CHROME_DIST_ALIASES) {
      const linkPath = path.join(root, "dist", alias);
      expect((await lstat(linkPath)).isSymbolicLink()).toBe(true);
      expect(await readlink(linkPath)).toBe(path.posix.join("chrome", alias));
    }
  });

  it("does not replace a real file in the legacy build root", async () => {
    const root = await createProjectRoot();
    const manifestPath = path.join(root, "dist", "manifest.json");
    await writeFile(manifestPath, "keep-me", "utf8");

    await expect(ensureLegacyChromeDistAliases(root)).rejects.toThrow(
      "is not a symbolic link",
    );
    expect(await readFile(manifestPath, "utf8")).toBe("keep-me");
  });
});
