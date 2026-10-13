import type { ProviderPageBinding, ProviderUsageInsights } from "./types";
import type { PageSessionClient } from "./page-session";
import { getCandidateTabs } from "./page-session-candidate-tabs";
import { getExtensionTabsApi } from "../shared/extension-api";
import { normalizeProviderUsageInsights } from "../shared/provider-usage-insights";

export type UsageInsightsDomCapture = {
  sourceUrl?: string;
  blocked?: boolean;
  rows: { key: string; label: string; value: number | null; total: number | null;
    unit: "percent" | "USD" | "count" | null; direction: "used" | "remaining" | null;
    available: boolean | null; expiresAt: string | null; expiryText: string | null }[];
  rangeStart: string | null;
  rangeEnd: string | null;
  sharedPlan: boolean;
  loggedOut: boolean;
};

// This function is serialized into the source page. Keep its dependencies local.
export function readUsageInsightsDom(...args: unknown[]): UsageInsightsDomCapture {
  const provider = args[0];
  const empty: UsageInsightsDomCapture = { sourceUrl: location.origin + location.pathname,
    rows: [], rangeStart: null, rangeEnd: null, sharedPlan: false, loggedOut: false };
  const host = provider === "codex" ? "chatgpt.com" : provider === "claude" ? "claude.ai" : provider === "cursor" ? "cursor.com" : null;
  if (!host || location.hostname !== host) return empty;
  if (args[1] === "new_codex_only" && provider === "codex" && location.pathname !== "/settings/usage") return empty;
  if (provider === "codex" && !/^\/(?:settings\/usage|codex\/(?:cloud\/)?settings\/(?:usage|analytics))\/?$/.test(location.pathname)
    || provider === "claude" && !(location.hash.startsWith("#settings/usage") || /\/settings\/usage\/?$/.test(location.pathname))
    || provider === "cursor" && !/\/(?:dashboard\/usage|dashboard\/spending)\/?$/.test(location.pathname)) return empty;
  const definitions: [string, RegExp][] = provider === "codex" ? [
    ["quota.weekly", /^(?:weekly limit|weekly usage|每周限额|每周用量|本周)$/i],
    ["quota.five_hour", /^(?:5[- ]hour limit|5[- ]hour usage|5\s*小时限额|5\s*小时用量)$/i],
    ["function.tasks", /^(?:tasks|任务)$/i], ["function.subagents", /^(?:subagents|子智能体)$/i],
    ["function.agent_tasks", /^(?:agent-created tasks|智能体创建的任务)$/i],
    ["function.composer", /^composer predictions$/i], ["function.memory", /^(?:memory updates|记忆更新)$/i],
    ["function.unknown", /^(?:unknown|未知)$/i],
    ["balance.flex", /^(?:credit balance|credits balance|flex credits|余额额度)$/i],
  ] : provider === "claude" ? [
    ["reset.full", /^(?:full reset|完全重置)$/i], ["reset.five_hour", /^(?:5[- ]hour reset|5\s*小时重置)$/i],
    ["balance.cloud", /^(?:included credits|included allowance|包含的额度)$/i],
    ["balance.usage", /^(?:usage credits|用量额度)$/i],
    ["product.claude_code", /^claude code$/i], ["product.chats", /^(?:chats|聊天)$/i],
    ["product.cowork", /^cowork$/i], ["product.other", /^(?:other|其他)$/i],
  ] : [
    ["pool.cursor_models", /^cursor models(?:\s*[·-].*)?$/i],
    ["pool.other_models", /^other models$/i], ["pool.grok_bot", /^weekly usage$/i],
  ];
  const clean = (value: string | null) => (value ?? "").replace(/\s+/g, " ").trim();
  const leaves = [...document.querySelectorAll("h1,h2,h3,h4,p,span,div,label")].filter((element) =>
    element.childElementCount === 0 && element.getClientRects().length > 0
    && !element.closest("table,[role=table],[role=row],nav,aside,a[href*='/c/'],a[href*='conversation']")
    && clean(element.textContent).length <= 160).slice(0, 10000);
  const known = leaves.flatMap((element) => {
    const label = clean(element.textContent);
    const definition = definitions.find(([, pattern]) => pattern.test(label));
    return definition ? [{ element, label, key: definition[0] }] : [];
  });
  const rows: UsageInsightsDomCapture["rows"] = [];
  for (const { element, label, key } of known.slice(0, 32)) {
    let parent = element.parentElement;
    for (let depth = 0; parent && depth < 4; depth++, parent = parent.parentElement) {
      const context = clean(parent.textContent);
      if (context.length > 480 || /chat usage ranking|聊天用量排行/i.test(context)
        || known.some((other) => other.element !== element && other.key !== key && parent!.contains(other.element))) break;
      if (key === "pool.grok_bot" && !/grok bot/i.test(clean(parent.parentElement?.textContent ?? null))) continue;
      const percent = context.match(/(\d{1,3}(?:\.\d+)?)\s*[%％]/);
      const money = [...context.matchAll(/(?:US\$|USD)\s*([\d,]+(?:\.\d{1,2})?)/g)];
      const count = key === "balance.flex" ? [...parent.children].map((child) => clean(child.textContent))
        .find((text) => /^\d{1,5}(?:\.\d+)?$/.test(text)) : undefined;
      const available = /no (?:resets|credits)|none (?:available|yet)|目前还没有|当前没有|暂无/i.test(context) ? false
        : /reset for free|免费重置/i.test(context) ? true : null;
      const expiryText = context.match(/expires?(?: on| at)?\s+[^.;。]{1,72}|于[^。]{1,64}(?:到期|过期)|\d+月\d+日[^。]{0,32}(?:到期|过期)/i)?.[0] ?? null;
      const rawTime = parent.querySelector("time[datetime]")?.getAttribute("datetime");
      const expiresAt = rawTime && /^\d{4}-\d{2}-\d{2}T/.test(rawTime) && Number.isFinite(Date.parse(rawTime))
        ? new Date(rawTime).toISOString() : null;
      if (percent || money.length || count !== undefined || key.startsWith("reset.") && (available !== null || expiryText)) {
        const value = percent ? Number(percent[1]) : money[0] ? Number(money[0][1]!.replace(/,/g, ""))
          : count !== undefined ? Number(count) : null;
        rows.push({ key, label, value, total: money[1] ? Number(money[1][1]!.replace(/,/g, "")) : null,
          unit: percent ? "percent" : money.length ? "USD" : count !== undefined ? "count" : null,
          direction: /remaining|left|剩余|可用/i.test(context) ? "remaining" : /used|consumed|已用|已使用/i.test(context) ? "used" : null,
          available, expiresAt, expiryText });
        break;
      }
    }
  }
  const dateElements = leaves.filter((element) => /^\d{4}[/-]\d{1,2}[/-]\d{1,2}\s*[-–]\s*\d{4}[/-]\d{1,2}[/-]\d{1,2}$/.test(clean(element.textContent)));
  let distributionContainer = known.find((item) => /^(function|product)\./.test(item.key))?.element.parentElement;
  let dateRange: string | undefined;
  for (let depth = 0; distributionContainer && distributionContainer !== document.body && depth < 8; depth++, distributionContainer = distributionContainer.parentElement) {
    const datesInGroup = dateElements.filter((element) => distributionContainer!.contains(element));
    if (datesInGroup.length === 1) { dateRange = clean(datesInGroup[0]!.textContent); break; }
    if (datesInGroup.length > 1) break;
  }
  const dates = dateRange?.match(/\d{4}[/-]\d{1,2}[/-]\d{1,2}/g)?.map((text) =>
    text.split(/[/-]/).map((part, index) => index ? part.padStart(2, "0") : part).join("-"));
  const sharedPlan = provider === "codex" && leaves.some((element) => {
    const text = clean(element.textContent);
    return /^(?:view|see|查看)/i.test(text) && /work.{0,20}codex|codex.{0,20}work/i.test(text);
  });
  const loggedOut = rows.length === 0 && [...document.querySelectorAll("a,button")].some((element) =>
    /^(?:log in|sign in|登录|登入)$/i.test(clean(element.textContent)));
  return { ...empty, rows, rangeStart: dates?.[0] ?? null, rangeEnd: dates?.[1] ?? null, sharedPlan, loggedOut,
    blocked: Boolean(document.querySelector("[id*='cf-turnstile'],iframe[src*='challenges.cloudflare.com']")) };
}

export function buildUsageInsightsFromDom(provider: "codex" | "claude" | "cursor", data: UsageInsightsDomCapture, capturedAt: string): ProviderUsageInsights | null {
  if (!data || !Array.isArray(data.rows) || data.blocked || data.loggedOut) return null;
  const meta = { source: "page" as const, capturedAt, accountVerified: false };
  const result: ProviderUsageInsights = {};
  if (data.sharedPlan) result.quotaScope = { ...meta, scope: "shared_plan" };
  // Browser offer presence is not the authoritative availableCount contract.
  const count = null;
  const offers = data.rows.filter((row) => row.key === "reset.full" || row.key === "reset.five_hour")
    .map((row) => ({ kind: row.key === "reset.full" ? "full" as const : "rolling_5h" as const,
      available: row.available, expiresAt: row.expiresAt, ...(row.expiryText ? { expiryText: row.expiryText } : {}) }));
  if (count !== null || offers.length) result.resetCredits = { ...meta, availableCount: count,
    offers: offers.length ? offers : null, detailsComplete: null };
  const balances = data.rows.filter((row) => row.key === "balance.cloud" || row.key === "balance.usage")
    .filter((row) => row.unit === "USD").map((row) => ({ ...meta,
      id: row.key === "balance.cloud" ? "cloud_session" as const : "usage_credit" as const,
      remaining: row.value, total: row.total, unit: "USD", expiresAt: row.expiresAt,
      ...(row.expiryText ? { expiryText: row.expiryText } : {}) }));
  if (balances.length) result.balances = balances;
  const kind = provider === "codex" ? "function" as const : "product" as const;
  const categories = provider === "codex" ? ["tasks", "subagents", "agent_tasks", "composer", "memory", "unknown"] : ["claude_code", "chats", "cowork", "other"];
  const values = data.rows.filter((row) => categories.includes(row.key.slice(kind.length + 1)) && row.key.startsWith(`${kind}.`) && row.unit === "percent" && row.value !== null)
    .map((row) => ({ id: row.key.slice(kind.length + 1), label: row.label, value: row.value! }));
  if (values.length) result.distribution = { ...meta, kind, unit: "percent",
    rangeStart: data.rangeStart, rangeEnd: data.rangeEnd, values };
  return normalizeProviderUsageInsights(result,
    provider === "codex" ? "codex-personal-page" : provider === "claude" ? "claude-code-team-page" : "cursor-personal-page");
}

export async function captureOpenUsageInsights(provider: "codex" | "claude" | "cursor", client: PageSessionClient, binding?: ProviderPageBinding): Promise<ProviderUsageInsights | undefined> {
  const tabs = getExtensionTabsApi();
  if (!tabs?.query || !client.executeMainWorld) return undefined;
  const urlPatterns = provider === "codex" ? ["https://chatgpt.com/settings/usage*"]
    : provider === "claude" ? ["https://claude.ai/new*", "https://claude.ai/settings/usage*"]
      : ["https://cursor.com/*dashboard/spending*"];
  let cancelled = false, timeout: ReturnType<typeof setTimeout> | undefined;
  const read = async () => {
    const { candidates, bindingMissing } = await getCandidateTabs({ query: tabs.query!.bind(tabs), get: tabs.get?.bind(tabs) }, { urlPatterns, binding });
    if (bindingMissing && binding?.mode === "bound" || cancelled) return undefined;
    const candidate = candidates.find((tab) => typeof tab.id === "number");
    if (!candidate?.id) return undefined;
    const data = await client.executeMainWorld!(candidate.id, readUsageInsightsDom, [provider]);
    return cancelled ? undefined : buildUsageInsightsFromDom(provider, data as UsageInsightsDomCapture, new Date().toISOString()) ?? undefined;
  };
  try {
    return await Promise.race([read().catch(() => undefined), new Promise<undefined>((resolve) => {
      timeout = setTimeout(() => { cancelled = true; resolve(undefined); }, 1500);
    })]);
  } finally { clearTimeout(timeout); }
}
