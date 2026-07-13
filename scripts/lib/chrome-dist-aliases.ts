import { lstat, mkdir, readlink, symlink, unlink } from "node:fs/promises";
import path from "node:path";

export const LEGACY_CHROME_DIST_ALIASES = [
  "_locales",
  "assets",
  "icons",
  "manifest.json",
  "page-session-network-observer-document-start.js",
  "service-worker-loader.js",
  "src",
] as const;

async function readLinkState(linkPath: string) {
  try {
    const stats = await lstat(linkPath);
    return {
      exists: true,
      isSymbolicLink: stats.isSymbolicLink(),
      target: stats.isSymbolicLink() ? await readlink(linkPath) : null,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { exists: false, isSymbolicLink: false, target: null };
    }
    throw error;
  }
}

export async function ensureLegacyChromeDistAliases(projectRoot: string) {
  const distRoot = path.join(projectRoot, "dist");
  await mkdir(distRoot, { recursive: true });

  for (const alias of LEGACY_CHROME_DIST_ALIASES) {
    const linkPath = path.join(distRoot, alias);
    const target = path.posix.join("chrome", alias);
    const state = await readLinkState(linkPath);

    if (state.exists && !state.isSymbolicLink) {
      throw new Error(
        `Cannot maintain legacy Chrome build alias because ${linkPath} is not a symbolic link.`,
      );
    }

    if (state.target === target) {
      continue;
    }

    if (state.isSymbolicLink) {
      await unlink(linkPath);
    }

    await symlink(target, linkPath);
  }
}
