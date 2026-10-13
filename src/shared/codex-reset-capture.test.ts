import { afterEach, describe, expect, it, vi } from "vitest";
import { codexResetPairingTag, normalizeCodexResetCapture, writeCodexResetCapture } from "./codex-reset-capture";

afterEach(() => vi.unstubAllGlobals());
describe("accepted local Codex capture identity", () => {
  it("retains only opaque keyed identity/pairing tag and rejects raw IDs or malformed accounts", () => {
    const capture = { accountKey: '["codex-personal-page","default"]', identity: "a".repeat(64), pairingTag: "b".repeat(64), capturedAt: "2026-10-13T06:00:00Z" };
    expect(normalizeCodexResetCapture({ ...capture, token: "secret", email: "private@example.test" })).toEqual({ ...capture, capturedAt: "2026-10-13T06:00:00.000Z" });
    expect(normalizeCodexResetCapture({ ...capture, identity: "raw-account" })).toBeNull();
    expect(normalizeCodexResetCapture({ ...capture, accountKey: '["cursor-personal-page","default"]' })).toBeNull();
  });
  it("re-pairing changes the tag, not the original token, and localhost writes no identity", async () => {
    const a = await codexResetPairingTag("http://127.0.0.1:47831", "synthetic-token-a");
    const b = await codexResetPairingTag("http://127.0.0.1:47831", "synthetic-token-b");
    expect(a).toMatch(/^[a-f0-9]{64}$/); expect(a).not.toBe(b);
    vi.stubGlobal("chrome", undefined);
    await expect(writeCodexResetCapture(null)).resolves.toBeUndefined();
  });
});
