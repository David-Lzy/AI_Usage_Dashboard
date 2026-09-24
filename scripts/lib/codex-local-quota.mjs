import { spawn } from "node:child_process";
import { createHmac } from "node:crypto";
import { lstat, realpath } from "node:fs/promises";
import path from "node:path";
import { StringDecoder } from "node:string_decoder";

export const CODEX_LOCAL_SUMMARY_SCHEMA = "ai-usage-dashboard.codex-local.v1";
const MAX_RPC_BYTES = 1024 * 1024;
const DEFAULT_TIMEOUT_MS = 12_000;

function record(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizedWindow(raw, key) {
  if (!record(raw) || !Number.isInteger(raw.usedPercent) || raw.usedPercent < 0 || raw.usedPercent > 100) return null;
  const minutes = raw.windowDurationMins;
  if (!Number.isSafeInteger(minutes) || minutes < 1 || minutes > 60 * 24 * 31) return null;
  const resetMilliseconds = raw.resetsAt * 1000;
  const resetAt = Number.isSafeInteger(raw.resetsAt) && raw.resetsAt > 0 && Number.isFinite(resetMilliseconds) && resetMilliseconds <= 8.64e15
    ? new Date(resetMilliseconds).toISOString()
    : null;
  return {
    id: key,
    kind: minutes === 300 ? "rolling_5h" : minutes === 10080 ? "weekly" : "unknown",
    durationMinutes: minutes,
    usedPercent: raw.usedPercent,
    resetAt,
  };
}

export function normalizeCodexRateLimits(raw, observedAt = new Date().toISOString()) {
  if (!record(raw)) throw new Error("codex_invalid_response");
  const primary = record(raw.rateLimitsByLimitId) && record(raw.rateLimitsByLimitId.codex)
    ? raw.rateLimitsByLimitId.codex : raw.rateLimits;
  if (!record(primary)) throw new Error("codex_invalid_response");
  const windows = [
    normalizedWindow(primary.primary, "primary"),
    normalizedWindow(primary.secondary, "secondary"),
  ].filter(Boolean);
  if (windows.length === 0) throw new Error("codex_no_windows");
  const resetCount = raw.rateLimitResetCredits?.availableCount;
  if (resetCount !== undefined && resetCount !== null && (!Number.isSafeInteger(resetCount) || resetCount < 0)) {
    throw new Error("codex_invalid_response");
  }
  return {
    observedAt,
    accountId: typeof raw.accountId === "string" && raw.accountId.length > 0 && raw.accountId.length <= 256
      ? raw.accountId : null,
    windows,
    availableResetCount: resetCount ?? null,
  };
}

export function accountBindingDigest(token, accountId) {
  return accountId ? createHmac("sha256", token).update(accountId, "utf8").digest("hex") : null;
}

export async function validateCodexHome(value) {
  if (typeof value !== "string" || !path.isAbsolute(value)) throw new Error("codex_home_required");
  const metadata = await lstat(value);
  if (!metadata.isDirectory()) throw new Error("codex_home_invalid");
  return realpath(value);
}

export function readCodexRateLimits({ codexHome, codexBin = "codex", timeoutMs = DEFAULT_TIMEOUT_MS, spawnImpl = spawn }) {
  return new Promise((resolve, reject) => {
    const child = spawnImpl(codexBin, ["app-server"], {
      env: { ...process.env, CODEX_HOME: codexHome },
      stdio: ["pipe", "pipe", "pipe"],
      shell: false,
      windowsHide: true,
    });
    let finished = false;
    let stdout = "";
    const decoder = new StringDecoder("utf8");
    let bytes = 0;
    let initialized = false;
    const finish = (error, value) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      child.stdout?.removeAllListeners();
      child.stderr?.removeAllListeners();
      child.kill();
      if (error) reject(new Error(error));
      else resolve(value);
    };
    const timer = setTimeout(() => finish("codex_timeout"), timeoutMs);
    child.on("error", () => finish("codex_unavailable"));
    child.on("exit", () => finish("codex_unavailable"));
    child.stdin?.on("error", () => finish("codex_unavailable"));
    child.stderr?.resume();
    child.stdout?.on("data", (chunk) => {
      bytes += chunk.length;
      if (bytes > MAX_RPC_BYTES) { finish("codex_response_too_large"); return; }
      stdout += decoder.write(chunk);
      while (stdout.includes("\n")) {
        const end = stdout.indexOf("\n");
        const line = stdout.slice(0, end);
        stdout = stdout.slice(end + 1);
        let message;
        try { message = JSON.parse(line); } catch { finish("codex_invalid_response"); return; }
        if (!record(message)) continue;
        if (message.id === 1 && !initialized) {
          if (message.error) { finish("codex_unsupported"); return; }
          initialized = true;
          child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method: "initialized", params: {} })}\n`);
          child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: 2, method: "account/rateLimits/read", params: { excludeResetCreditDetails: true } })}\n`);
        } else if (message.id === 2) {
          if (message.error) { finish("codex_quota_unavailable"); return; }
          try { finish(null, normalizeCodexRateLimits(message.result)); }
          catch { finish("codex_invalid_response"); }
          return;
        }
      }
    });
    child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { clientInfo: { name: "ai_usage_dashboard_local", title: "AI Usage Dashboard Local", version: "0.1.0" }, capabilities: { experimentalApi: true } } })}\n`);
  });
}
