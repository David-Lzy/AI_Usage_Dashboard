import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import path from "node:path";
import react from "@vitejs/plugin-react";
import { createServer } from "vite";

// No CRX plugin or output directory: browser QA must not replace a loaded build.
export async function startSourceQaServer(root = process.cwd()) {
  const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
  const cacheRoot = path.join(root, "tmp", "source-qa-cache");
  await mkdir(cacheRoot, { recursive: true });
  const cacheDir = await mkdtemp(path.join(cacheRoot, "run-"));
  const qaModules = {
    "/__qa/react.js": 'export { default } from "react";',
    "/__qa/react-dom-client.js": 'export { default } from "react-dom/client";',
  };
  let server;
  try {
    server = await createServer({
      root, configFile: false, cacheDir,
      plugins: [react(), {
        name: "isolated-source-qa-imports",
        resolveId(id) { return Object.hasOwn(qaModules, id) ? id : undefined; },
        load(id) { return qaModules[id]; },
      }],
      optimizeDeps: { include: ["react", "react-dom/client"] },
      define: {
        __APP_VERSION__: JSON.stringify(pkg.version),
        __BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString()),
        __GIT_COMMIT__: JSON.stringify("source-browser-qa"),
        __SOURCE_ORIGIN__: JSON.stringify(pkg.homepage),
      },
      server: { host: "127.0.0.1", port: 0, hmr: false, watch: null },
    });
  } catch (error) {
    await rm(cacheDir, { recursive: true, force: true });
    throw error;
  }
  const close = async () => {
    try {
      await server.close();
    } finally {
      await rm(cacheDir, { recursive: true, force: true });
    }
  };
  try {
    await server.listen();
    return {
      baseUrl: `http://127.0.0.1:${server.httpServer.address().port}`,
      close,
    };
  } catch (error) {
    await close();
    throw error;
  }
}
