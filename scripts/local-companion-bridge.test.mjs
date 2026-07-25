import path from "node:path";

import { describe, expect, it } from "vitest";

import { parseLocalCompanionBridgeArgs } from "./local-companion-bridge.mjs";

describe("local companion bridge CLI arguments", () => {
  it("accepts only explicit source mappings", () => {
    expect(
      parseLocalCompanionBridgeArgs([
        "--host",
        "::1",
        "--port",
        "49000",
        "--source",
        "build=fixtures/build.json",
      ]),
    ).toMatchObject({
      host: "::1",
      port: 49_000,
      sources: [
        {
          sourceId: "build",
          filePath: path.resolve("fixtures/build.json"),
        },
      ],
    });
  });

  it("rejects missing files, malformed mappings, and unknown options", () => {
    expect(() => parseLocalCompanionBridgeArgs([])).toThrow(/--source/u);
    expect(() =>
      parseLocalCompanionBridgeArgs(["--source", "build"]),
    ).toThrow(/<id>=<json-file>/u);
    expect(() => parseLocalCompanionBridgeArgs(["--scan", "/home"])).toThrow(
      /Unknown option/u,
    );
  });
});
