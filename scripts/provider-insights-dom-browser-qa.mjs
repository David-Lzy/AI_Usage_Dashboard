import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import { chromium } from "playwright";

const source = await readFile(new URL("../src/providers/usage-insights-dom.ts", import.meta.url), "utf8");
const ast = ts.createSourceFile("usage-insights-dom.ts", source, ts.ScriptTarget.Latest, true);
const declaration = ast.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "readUsageInsightsDom");
assert.ok(declaration);
const printed = ts.createPrinter().printNode(ts.EmitHint.Unspecified, declaration, ast).replace("export function", "function");
const compiled = ts.transpileModule(printed, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
  ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : { channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome" }) });
try {
  const page = await browser.newPage();
  let body = `<h1>Usage</h1><p>View Work, Codex and other agent tasks. Excludes ordinary chats.</p>
    <div><span>Weekly limit</span><span>73% remaining</span></div>
    <section><div>2026/10/7 - 2026/10/13</div>
    <div><span>Tasks</span><span>74.7%</span></div><div><span>Subagents</span><span>11.3%</span></div>
    </section><div><span>Banked resets</span><span>4</span></div>
    <table><tr><td>private-conversation-title</td><td>99%</td></tr></table>
    <nav><a href="/c/private-chat">Tasks</a><span>99%</span></nav>`;
  await page.route("**/*", (route) => route.request().isNavigationRequest()
    ? route.fulfill({ contentType: "text/html", body }) : route.abort());
  await page.goto("https://chatgpt.com/settings/usage?tab=analytics");
  const capture = () => page.evaluate(`${compiled}\nreadUsageInsightsDom("codex")`);
  const result = await capture();
  assert.equal(result.sharedPlan, true);
  assert.equal(result.rangeStart, "2026-10-07");
  assert.equal(result.rangeEnd, "2026-10-13");
  assert.equal(result.rows.find((row) => row.key === "quota.weekly")?.value, 73);
  assert.equal(result.rows.find((row) => row.key === "function.tasks")?.value, 74.7);
  assert.equal(result.rows.find((row) => row.key === "reset.count"), undefined);
  assert.ok(!JSON.stringify(result).includes("private-"));
  body = "<h1>Usage</h1><button>Log in</button>";
  await page.reload();
  assert.equal((await capture()).loggedOut, true);
  body = "<h1>Usage</h1><p>Loading</p>";
  await page.reload();
  assert.deepEqual((await capture()).rows, []);
  assert.equal((await capture()).loggedOut, false);
  body = `<nav>Claude Code 99%</nav><div role="dialog"><h1>Usage</h1><span>Pro</span>
    <section><div><span>Current session</span><span>25% used</span></div><div><span>All models</span><span>40% used</span></div><div><span>Daily included routine runs</span><span>1 of 10</span></div></section>
    <section><div><div><span><div><span>Full reset</span></div><span>?</span></span><div>Expires October 31</div></div><div><button>Reset for free</button></div></div>
      <div><span>5-hour reset</span><p>None available yet</p></div></section>
    <section><h3>Cloud-session credits</h3><div><div><span>Included credits</span><span>Expires November 15</span></div><div>US$80 remaining (US$100 total)</div></div></section>
    <section><div><h3>Usage credits</h3><div>US$0</div></div><div>80% used</div></section>
    <section><h3>Products</h3><div><span>Claude Code</span><span>85%</span></div></section>
    <table><tr><td>private-conversation-title</td></tr></table></div>`;
  await page.goto("https://claude.ai/new#settings/usage");
  const claude = await page.evaluate(`${compiled}\nreadUsageInsightsDom("claude")`);
  assert.equal(claude.sourceUrl, "https://claude.ai/new#settings/usage");
  assert.equal(claude.rows.find((row) => row.key === "reset.full")?.available, true);
  assert.equal(claude.rows.find((row) => row.key === "reset.five_hour")?.available, false);
  assert.equal(claude.rows.find((row) => row.key === "balance.cloud")?.value, 80);
  assert.equal(claude.rows.find((row) => row.key === "balance.cloud")?.total, 100);
  assert.equal(claude.rows.find((row) => row.key === "balance.usage")?.value, 0);
  assert.equal(claude.rows.filter((row) => row.key.startsWith("quota.")).length, 3);
  assert.equal(claude.rows.find((row) => row.key === "quota.routine_runs")?.total, 10);
  assert.ok(claude.rows.every((row) => !row.key.startsWith("product.")));
  assert.ok(!JSON.stringify(claude).includes("private-"));
  body = `<main><h1>Spending</h1><section><p>Usage limits reset on Nov 30</p></section>
    <div><div><div><span>Cursor Models</span><span>Includes Grok and Composer</span></div><span>32% used</span></div><div></div></div>
    <div><div><div><span>Other Models</span></div><span>68% used</span></div><div></div></div>
    <div><h2>Grok Bot</h2><div><div><span>Weekly usage</span><span>0% used</span></div><p>Resets weekly</p><p>Grok Bot pauses at the limit.</p></div></div>
    <table><tr><td>private-request-row</td><td>100%</td></tr></table></main>`;
  await page.goto("https://cursor.com/dashboard/spending");
  const cursor = await page.evaluate(`${compiled}\nreadUsageInsightsDom("cursor")`);
  assert.equal(cursor.rows.find((row) => row.key === "pool.cursor_models")?.value, 32);
  assert.equal(cursor.rows.find((row) => row.key === "pool.other_models")?.value, 68);
  assert.equal(cursor.rows.find((row) => row.key === "pool.grok_bot")?.value, 0);
  assert.equal(cursor.rows.find((row) => row.key === "pool.grok_bot")?.resetText, "Resets weekly");
  assert.equal(cursor.monthlyResetText, "Usage limits reset on Nov 30");
  assert.ok(!JSON.stringify(cursor).includes("private-"));
  body = `<main><p>Promo 99% used</p><div><div><div><span>Cursor Models</span></div><span>32,5% used</span></div><div></div></div></main>`;
  await page.reload();
  const single = await page.evaluate(`${compiled}\nreadUsageInsightsDom("cursor")`);
  assert.equal(single.rows.find((row) => row.key === "pool.cursor_models")?.value, 32.5);
  assert.equal(single.rows.length, 1);
  console.log(JSON.stringify({ status: "passed", providers: ["codex", "claude", "cursor"], checks: ["literal-aggregates", "scoped-period", "scope", "chat-exclusion", "sign-out", "hydration", "reset-presence", "scoped-credits", "unsupported-composition-excluded", "independent-pools", "date-only-reset"], syntheticData: true }));
} finally {
  await browser.close();
}
