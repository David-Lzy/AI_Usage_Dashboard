import { crx } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import manifest from "./src/manifest.json";

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
