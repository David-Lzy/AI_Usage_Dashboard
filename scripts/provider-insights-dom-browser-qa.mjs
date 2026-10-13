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
  console.log(JSON.stringify({ status: "passed", provider: "codex", checks: ["literal-aggregates", "period", "scope", "chat-exclusion", "sign-out", "hydration"], syntheticData: true }));
} finally {
  await browser.close();
}
