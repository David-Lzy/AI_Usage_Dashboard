import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { resolveFirefoxWebExtInvocation } from "./firefox-web-ext.mjs";

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

describe("resolveFirefoxWebExtInvocation", () => {
  it("preserves default web-ext lint arguments", async () => {
    const projectRoot = await createTemporaryRoot("ai-usage-dashboard-project-");

    expect(
      resolveFirefoxWebExtInvocation({
        projectRoot,
        environment: {},
        arguments: ["lint", "--verbose"],
      }),
    ).toEqual({
      command: "lint",
      arguments: [
        "lint",
        "--source-dir",
        path.join(projectRoot, "dist", "firefox"),
        "--verbose",
      ],
    });
  });

  it("isolates Firefox builds and artifacts below AI_USAGE_BUILD_ROOT", async () => {
    const projectRoot = await createTemporaryRoot("ai-usage-dashboard-project-");
    const buildRoot = await createTemporaryRoot("ai-usage-dashboard-output-");

    expect(
      resolveFirefoxWebExtInvocation({
        projectRoot,
        environment: { AI_USAGE_BUILD_ROOT: buildRoot },
        arguments: ["build"],
      }),
    ).toEqual({
      command: "build",
      arguments: [
        "build",
        "--source-dir",
        path.join(buildRoot, "firefox"),
        "--artifacts-dir",
        path.join(buildRoot, "release", "firefox"),
        "--overwrite-dest",
      ],
    });
  });

  it("rejects unknown commands and path-routing overrides", async () => {
    const projectRoot = await createTemporaryRoot("ai-usage-dashboard-project-");

    expect(() =>
      resolveFirefoxWebExtInvocation({ projectRoot, environment: {}, arguments: [] }),
    ).toThrow("Usage:");
    expect(() =>
      resolveFirefoxWebExtInvocation({
        projectRoot,
        environment: {},
        arguments: ["lint", "--source-dir=elsewhere"],
      }),
    ).toThrow("managed by AI_USAGE_BUILD_ROOT-aware Firefox packaging");
    for (const override of ["-s", "-selsewhere", "-a=/tmp/other", "-o"]) {
      expect(() => resolveFirefoxWebExtInvocation({
        projectRoot, environment: {}, arguments: ["build", override],
      })).toThrow("managed by AI_USAGE_BUILD_ROOT-aware Firefox packaging");
    }
  });
});
