import { readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { startSourceQaServer } from "./source-qa-server.mjs";

const cacheRoot = path.join(process.cwd(), "tmp", "source-qa-cache");

describe("source QA server", () => {
  it("removes only its own Vite cache after closing", async () => {
    const before = new Set(await readdir(cacheRoot).catch((error) => {
      if (error.code === "ENOENT") return [];
      throw error;
    }));
    const server = await startSourceQaServer();
    const created = (await readdir(cacheRoot)).filter((name) => !before.has(name));

    try {
      expect(created).toHaveLength(1);
      expect(server.baseUrl).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);
    } finally {
      await server.close();
    }

    const remaining = (await readdir(cacheRoot)).filter((name) => !before.has(name));
    expect(remaining).toEqual([]);
  });
});
