import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { describe, expect, it } from "vitest";
import { accountBindingDigest, normalizeCodexRateLimits, readCodexRateLimits } from "./codex-local-quota.mjs";

const RESPONSE = {
  accountId: "private-account-id",
  rateLimits: {
    primary: { usedPercent: 25, windowDurationMins: 300, resetsAt: 1_800_000_000 },
    secondary: { usedPercent: 40, windowDurationMins: 10080, resetsAt: 1_800_000_000 },
  },
  rateLimitResetCredits: { availableCount: 0 },
};

function fakeSpawn(reply = RESPONSE) {
  const child = new EventEmitter();
  child.stdout = new PassThrough();
  child.stderr = new PassThrough();
  child.kill = () => true;
  const calls = [];
  child.stdin = Object.assign(new EventEmitter(), {
    write(text) {
      const message = JSON.parse(text);
      calls.push(message);
      if (message.id === 1) queueMicrotask(() => child.stdout.write(`${JSON.stringify({ id: 1, result: {} })}\n`));
      if (message.id === 2) queueMicrotask(() => child.stdout.write(`${JSON.stringify({ id: 2, result: reply })}\n`));
    },
  });
  return { child, calls };
}

describe("Codex read-only app-server quota", () => {
  it("normalizes only official windows and zero reset cards", () => {
    expect(normalizeCodexRateLimits(RESPONSE, "2026-09-24T00:00:00.000Z")).toMatchObject({
      accountId: "private-account-id",
      availableResetCount: 0,
      windows: [{ kind: "rolling_5h", usedPercent: 25 }, { kind: "weekly", usedPercent: 40 }],
    });
    expect(normalizeCodexRateLimits({ ...RESPONSE, rateLimitResetCredits: {} }).availableResetCount).toBeNull();
    expect(() => normalizeCodexRateLimits({ rateLimits: {} })).toThrow();
  });

  it("uses only account/rateLimits/read and keeps identity bound to the pairing token", async () => {
    const { child, calls } = fakeSpawn();
    const result = await readCodexRateLimits({ codexHome: "/tmp/explicit-codex-home", spawnImpl: (_bin, args, options) => {
      expect(args).toEqual(["app-server"]);
      expect(options.env.CODEX_HOME).toBe("/tmp/explicit-codex-home");
      return child;
    } });
    expect(result.availableResetCount).toBe(0);
    expect(calls.map((call) => call.method)).toEqual(["initialize", "initialized", "account/rateLimits/read"]);
    expect(accountBindingDigest("token-one", result.accountId)).not.toBe(accountBindingDigest("token-two", result.accountId));
  });

  it("fails closed on timeout and oversized responses", async () => {
    const hanging = fakeSpawn();
    hanging.child.stdin.write = () => undefined;
    await expect(readCodexRateLimits({ codexHome: "/tmp", timeoutMs: 5, spawnImpl: () => hanging.child })).rejects.toThrow("codex_timeout");
    const oversized = fakeSpawn();
    oversized.child.stdin.write = (text) => {
      if (JSON.parse(text).id === 1) queueMicrotask(() => oversized.child.stdout.write("x".repeat(1024 * 1024 + 1)));
    };
    await expect(readCodexRateLimits({ codexHome: "/tmp", spawnImpl: () => oversized.child })).rejects.toThrow("codex_response_too_large");
  });
});
