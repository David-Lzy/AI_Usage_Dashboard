import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  BUILD_ROOT_ENVIRONMENT_VARIABLE,
  assertConfiguredChromeBuildOutDir,
  resolveBuildPaths,
  shouldMaintainLegacyChromeDistAliases,
} from "./build-paths.mjs";

const temporaryRoots = [];

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((root) => rm(root, { force: true, recursive: true })),
  );
});

async function createTemporaryRoot(prefix) {
  const root = await mkdtemp(path.join(tmpdir(), prefix));
  temporaryRoots.push(root);
  return root;
}

describe("resolveBuildPaths", () => {
  it("keeps the established paths and aliases when no isolated root is configured", async () => {
    const projectRoot = await createTemporaryRoot("ai-usage-dashboard-project-");
    const paths = resolveBuildPaths({ projectRoot, environment: {} });

    expect(paths).toEqual({
      projectRoot,
      buildRoot: null,
      chromeDir: path.join(projectRoot, "dist", "chrome"),
      firefoxDir: path.join(projectRoot, "dist", "firefox"),
      releaseDir: path.join(projectRoot, "release"),
      isIsolated: false,
    });
    expect(shouldMaintainLegacyChromeDistAliases(paths)).toBe(true);
  });

  it("places every build artifact below an isolated absolute root without touching the project paths", async () => {
    const projectRoot = await createTemporaryRoot("ai-usage-dashboard-project-");
    const buildRoot = await createTemporaryRoot("ai-usage-dashboard-output-");
    const preservedFile = path.join(buildRoot, "preserve-me.txt");
    await writeFile(preservedFile, "existing data", "utf8");
    const paths = resolveBuildPaths({
      projectRoot,
      environment: { [BUILD_ROOT_ENVIRONMENT_VARIABLE]: buildRoot },
    });

    expect(paths).toEqual({
      projectRoot,
      buildRoot,
      chromeDir: path.join(buildRoot, "chrome"),
      firefoxDir: path.join(buildRoot, "firefox"),
      releaseDir: path.join(buildRoot, "release"),
      isIsolated: true,
    });
    expect(await readFile(preservedFile, "utf8")).toBe("existing data");
    expect(shouldMaintainLegacyChromeDistAliases(paths)).toBe(false);
  });

  it("rejects unsafe roots before a build can write to them", async () => {
    const projectRoot = await createTemporaryRoot("ai-usage-dashboard-project-");
    const linkedParent = await createTemporaryRoot("ai-usage-dashboard-link-parent-");
    const linkedTarget = await createTemporaryRoot("ai-usage-dashboard-link-target-");
    const symbolicRoot = path.join(linkedParent, "output-link");
    await symlink(linkedTarget, symbolicRoot);

    const invalidRoots = [
      "relative-output",
      "",
      path.parse(projectRoot).root,
      projectRoot,
      path.join(projectRoot, "output"),
      path.dirname(projectRoot),
      symbolicRoot,
    ];

    for (const buildRoot of invalidRoots) {
      expect(() =>
        resolveBuildPaths({
          projectRoot,
          environment: { [BUILD_ROOT_ENVIRONMENT_VARIABLE]: buildRoot },
        }),
      ).toThrow();
    }
  });

  it("rejects a symlinked output channel even when the isolated root itself is real", async () => {
    const projectRoot = await createTemporaryRoot("ai-usage-dashboard-project-");
    const buildRoot = await createTemporaryRoot("ai-usage-dashboard-output-");
    const outputTarget = await createTemporaryRoot("ai-usage-dashboard-output-target-");
    await mkdir(path.join(outputTarget, "chrome"));
    await symlink(path.join(outputTarget, "chrome"), path.join(buildRoot, "chrome"));

    expect(() =>
      resolveBuildPaths({
        projectRoot,
        environment: { [BUILD_ROOT_ENVIRONMENT_VARIABLE]: buildRoot },
      }),
    ).toThrow("must not use a symbolic link");
  });

  it("rejects a real-path source overlap when the project was opened through a symlink", async () => {
    const realProjectRoot = await createTemporaryRoot("ai-usage-dashboard-project-");
    const projectAliasParent = await createTemporaryRoot("ai-usage-dashboard-project-alias-");
    const projectRoot = path.join(projectAliasParent, "project");
    await symlink(realProjectRoot, projectRoot);

    expect(() =>
      resolveBuildPaths({
        projectRoot,
        environment: {
          [BUILD_ROOT_ENVIRONMENT_VARIABLE]: path.join(realProjectRoot, "output"),
        },
      }),
    ).toThrow("must not overlap the project source tree");
  });

  it("allows Vite's configured output and rejects a conflicting --outDir", async () => {
    const projectRoot = await createTemporaryRoot("ai-usage-dashboard-project-");
    const paths = resolveBuildPaths({ projectRoot, environment: {} });

    expect(() =>
      assertConfiguredChromeBuildOutDir(paths, projectRoot, "dist/chrome"),
    ).not.toThrow();
    expect(() =>
      assertConfiguredChromeBuildOutDir(paths, projectRoot, "dist/other"),
    ).toThrow("Do not override --outDir");
  });
});
