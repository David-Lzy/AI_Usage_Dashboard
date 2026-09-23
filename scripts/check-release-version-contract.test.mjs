import { execFile } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execute = promisify(execFile);
const checker = path.resolve("scripts/check-release-version-contract.mjs");
describe("source and published release version documentation", () => {
  it.each([
    ["0.2.0-rc.13", "0.2.0.13", true],
    ["0.2.0-rc.12", "0.2.0.13", false],
    ["0.2.0-rc.13", "0.2.0.12", false],
  ])("checks source %s / manifest %s without equating Store publication", async (source, manifest, accepted) => {
    const root = await mkdtemp(path.join(os.tmpdir(), "usage-version-contract-"));
    try {
      await mkdir(path.join(root, "src"));
      const version = "0.2.0-rc.13";
      await writeFile(path.join(root, "package.json"), JSON.stringify({ version, scripts: { "release:check": "npm run release:version:check" } }));
      await writeFile(path.join(root, "package-lock.json"), JSON.stringify({ version, packages: { "": { version } } }));
      await writeFile(path.join(root, "src/manifest.json"), JSON.stringify({ version_name: version, version: "0.2.0.13" }));
      await writeFile(path.join(root, "README.md"), `Published Store build is separately verified.\n- Source package version: \`${source}\`; Chrome manifest version: \`${manifest}\`.\nUnreleased branch changes do not update the Store.\n`);
      if (accepted) await expect(execute(process.execPath, [checker], { cwd: root })).resolves.toMatchObject({ stderr: "" });
      else await expect(execute(process.execPath, [checker], { cwd: root })).rejects.toMatchObject({ code: 1 });
    } finally { await rm(root, { recursive: true, force: true }); }
  });
});
