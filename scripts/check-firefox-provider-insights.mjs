import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { firefox } from "playwright";
import { providerInsightsQaOverrides } from "./lib/provider-insights-qa-fixtures.mjs";

const arg = (key) => process.argv.find((value) => value.startsWith(`${key}=`))?.slice(key.length + 1);
assert(arg("--extension") && arg("--geckodriver"), "Provide an isolated Firefox build and a geckodriver executable");
const source = path.resolve(arg("--extension"));
assert(!source.startsWith(path.resolve("dist") + path.sep), "Never use the owner's loaded extension");
const root = path.resolve(".local/qa/provider-insights/824/native-firefox");
await mkdir(root, { recursive: true });
const output = await mkdtemp(path.join(root, "run-"));
const installed = path.join(output, "owned-extension");
await cp(source, installed, { recursive: true });
const manifest = JSON.parse(await readFile(path.join(installed, "manifest.json"), "utf8"));
// The disposable copy alone pre-grants transport access; no production manifest changes.
manifest.permissions = [...new Set([...manifest.permissions, "notifications"])];
await writeFile(path.join(installed, "manifest.json"), JSON.stringify(manifest));
const report = { passed: false, synthetic: true, source, cases: [], notificationApi: null, osBanner: "not_observed_headless", errors: [] };
let session, driverUrl;
let log = "";
const driver = spawn(arg("--geckodriver"), ["--host", "127.0.0.1", "--port", "0", "--allow-system-access", "--log", "info"], { stdio: ["ignore", "pipe", "pipe"] });
for (const stream of [driver.stdout, driver.stderr]) stream.on("data", (chunk) => { log += chunk; });
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function command(method, endpoint, body) {
  const response = await fetch(`${driverUrl}${endpoint}`, { method, headers: { "content-type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(45000) });
  const result = await response.json();
  if (!response.ok) throw new Error(`${endpoint}: ${JSON.stringify(result.value)}`);
  return result.value;
}
const post = (endpoint, body) => command("POST", `/session/${session}${endpoint}`, body);
const evaluate = (script, args = []) => post("/execute/sync", { script, args });
const asyncEvaluate = (script, args = []) => post("/execute/async", { script, args });
async function waitFor(script) {
  for (let attempt = 0; attempt < 100; attempt++) { if (await evaluate(script)) return; await pause(100); }
  throw new Error(`Rendered condition did not settle: ${script}`);
}
try {
  for (let attempt = 0; attempt < 100; attempt++) {
    const found = /Listening on (127\.0\.0\.1:\d+)/.exec(log);
    if (found) { driverUrl = `http://${found[1]}`; break; }
    if (driver.exitCode !== null) throw new Error(`Owned driver exited: ${log.slice(-1200)}`);
    await pause(100);
  }
  assert(driverUrl, "Owned driver did not bind");
  const started = await command("POST", "/session", { capabilities: { alwaysMatch: { browserName: "firefox", "moz:firefoxOptions": {
    binary: arg("--firefox") ?? firefox.executablePath(), args: ["-headless"], prefs: { "xpinstall.signatures.required": false, "datareporting.healthreport.uploadEnabled": false },
  } } } });
  session = started.sessionId; report.browser = started.capabilities.browserVersion;
  await post("/moz/context", { context: "chrome" });
  assert.equal(await evaluate("Services.io.offline = true; return Services.io.offline;"), true);
  await post("/moz/context", { context: "content" });
  assert.equal(await post("/moz/addon/install", { path: installed, temporary: true }), manifest.browser_specific_settings.gecko.id);
  await post("/moz/context", { context: "chrome" });
  const host = await evaluate("return JSON.parse(Services.prefs.getStringPref('extensions.webextensions.uuids'))[arguments[0]];", [manifest.browser_specific_settings.gecko.id]);
  await post("/moz/context", { context: "content" });
  const origin = `moz-extension://${host}`;
  await post("/url", { url: `${origin}/src/sidepanel/index.html?surface=full-page#settings/section/settings-usage-notifications` });
  await waitFor("return !!document.querySelector('.settings-fusion');");
  const prepared = await asyncEvaluate(`const done=arguments[arguments.length-1];(async()=>{
    await browser.storage.local.set({'ai-usage-dashboard.store-screenshot-runtime-lock':true});
    const result=await browser.runtime.sendMessage({type:'app:read-state'});if(!result.ok)throw Error('state read');
    const state=result.state;for(const snapshot of state.providers)if(arguments[0][snapshot.providerId])Object.assign(snapshot,arguments[0][snapshot.providerId]);
    for(const setting of state.providerSettings)if(arguments[0][setting.id])setting.displayEnabled=true;
    await browser.storage.local.set({'ai-usage-dashboard.app-state':state});done(true);
  })().catch(error=>done({error:String(error)}));`, [providerInsightsQaOverrides()]);
  assert.equal(prepared, true);
  for (const [locale, theme, width] of [["en", "light", 1440], ["zh-CN", "dark", 900], ["ar", "dark", 390]]) {
    const saved = await asyncEvaluate(`const done=arguments[arguments.length-1];browser.runtime.sendMessage({type:'app:update-settings',settings:{locale:arguments[0],themeMode:arguments[1]}}).then(done,error=>done({error:String(error)}));`, [locale, theme]);
    assert.equal(saved.ok, true);
    await post("/window/rect", { width, height: 900 });
    if (width < 500) {
      await post("/moz/context", { context: "chrome" });
      await evaluate("gBrowser.selectedBrowser.fullZoom = 500 / arguments[0]; return gBrowser.selectedBrowser.fullZoom;", [width]);
      await post("/moz/context", { context: "content" });
    }
    await post("/url", { url: `${origin}/src/sidepanel/index.html?surface=full-page#settings/section/settings-usage-notifications` });
    await waitFor(`return document.documentElement.lang===${JSON.stringify(locale)} && document.documentElement.dataset.themeResolved===${JSON.stringify(theme)} && !!document.querySelector('[data-reset-insights-settings]');`);
    const layout = await evaluate(`return {width:innerWidth,overflow:document.documentElement.scrollWidth-innerWidth,dir:document.documentElement.dir,
      fields:[...document.querySelectorAll('[data-reset-insights-settings] mdui-select')].map(element=>({value:element.value,disabled:element.disabled})),
      realRuntime:browser.runtime.id===${JSON.stringify(manifest.browser_specific_settings.gecko.id)},parts:!!document.querySelector('mdui-select')?.shadowRoot};`);
    assert(layout.realRuntime && layout.parts && layout.overflow <= 1);
    assert(Math.abs(layout.width - width) <= 2, `Requested CSS width ${width}, actual ${layout.width}`);
    assert.equal(layout.dir, locale === "ar" ? "rtl" : "ltr");
    assert.equal(layout.fields[0].value, "off");
    await writeFile(path.join(output, `${locale}-${theme}.png`), Buffer.from(await command("GET", `/session/${session}/screenshot`), "base64"));
    report.cases.push({ locale, theme, ...layout });
  }
  report.notificationApi = await asyncEvaluate(`const done=arguments[arguments.length-1];(async()=>{
    const id=await browser.notifications.create('synthetic-provider-insights-api',{type:'basic',title:'AI Usage Dashboard synthetic API test',message:'No account data. API acceptance only.',iconUrl:browser.runtime.getURL('icons/icon128.png')});
    await browser.notifications.clear(id);done({accepted:true});
  })().catch(error=>done({accepted:false,error:String(error).slice(0,200)}));`);
  assert.equal(report.notificationApi.accepted, true, report.notificationApi.error ?? "Native Firefox notification API rejected the synthetic message");
  await post("/moz/context", { context: "chrome" });
  assert.equal(await evaluate("return Services.io.offline;"), true);
  report.offline = true; report.passed = true;
} catch (error) { report.errors.push(String(error)); throw error; }
finally {
  if (session) await command("DELETE", `/session/${session}`).catch(() => {});
  driver.kill("SIGTERM");
  await writeFile(path.join(output, "result.json"), JSON.stringify(report, null, 2));
  console.log(`Native Firefox evidence: ${output}`);
}
