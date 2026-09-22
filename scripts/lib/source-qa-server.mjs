import { readFile } from "node:fs/promises";
import path from "node:path";
import react from "@vitejs/plugin-react";
import { createServer } from "vite";

// No CRX plugin or output directory: browser QA must not replace a loaded build.
export async function startSourceQaServer(root = process.cwd()) {
  const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
  const server = await createServer({
    root, configFile: false, plugins: [react()],
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
      __BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString()),
      __GIT_COMMIT__: JSON.stringify("source-browser-qa"),
      __SOURCE_ORIGIN__: JSON.stringify(pkg.homepage),
    },
    server: { host: "127.0.0.1", port: 0, hmr: false, watch: null },
  });
  try {
    await server.listen();
    return {
      baseUrl: `http://127.0.0.1:${server.httpServer.address().port}`,
      close: () => server.close(),
    };
  } catch (error) {
    await server.close();
    throw error;
  }
}
