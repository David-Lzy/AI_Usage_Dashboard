import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { inspectScriptSource, inventoryCommands } from "./workflow-command-inventory.mjs";

describe("read-only workflow inventory", () => {
  it("distinguishes version pins from output references without executing scripts", () => {
    const result = inspectScriptSource('const expectedPackageVersion = "0.1.0"; const out = "Doc/report.md"; await writeFile(out, "done"); throw new Error("must not run");');
    expect(result.expectedVersions).toEqual({ expectedPackageVersion: "0.1.0" });
    expect(result.references).toEqual(["Doc/report.md"]);
    expect(result.writes).toEqual(['writeFile(out, "done")']);
  });

  it("keeps maintained QA aliases and resolves all npm callers and targets", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    const commands = inventoryCommands(process.cwd(), pkg);
    expect(commands.flatMap((entry) => entry.missingCalls)).toEqual([]);
    expect(commands.flatMap((entry) => entry.files.filter((file) => !file.exists))).toEqual([]);
    expect(commands.find((entry) => entry.name === "phase556:browser-qa").classification).toBe("compatibility-alias");
    expect(commands.find((entry) => entry.name === "phase565:extension-qa").classification).toBe("compatibility-alias");
    expect(commands.find((entry) => entry.name === "phase285:review").classification).toBe("historical-review-required");
    expect(commands.filter((entry) => entry.classification === "historical-version-mismatch")).toEqual([]);
  });

  it("reports broken npm references rather than silently accepting them", () => {
    const result = inventoryCommands(process.cwd(), { version: "0.2.0-rc.13", scripts: {
      check: "npm run absent && node ./scripts/does-not-exist.mjs",
    } });
    expect(result[0].missingCalls).toEqual(["absent"]);
    expect(result[0].files).toEqual([{ path: "scripts/does-not-exist.mjs", exists: false }]);
  });
});
