import path from "path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    passWithNoTests: true,
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
      "**/test-examples/**",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/test": path.resolve(__dirname, "./src/test"),
      "@tauri-apps/api/core": path.resolve(
        __dirname,
        "./src/test/mocks/tauri-api-core.ts",
      ),
      "@tauri-apps/api/path": path.resolve(
        __dirname,
        "./src/test/mocks/tauri-api-path.ts",
      ),
      "@tauri-apps/plugin-dialog": path.resolve(
        __dirname,
        "./src/test/mocks/tauri-plugin-dialog.ts",
      ),
      "@tauri-apps/plugin-fs": path.resolve(
        __dirname,
        "./src/test/mocks/tauri-plugin-fs.ts",
      ),
      "@tauri-apps/api": path.resolve(__dirname, "./src/test/mocks/tauri.ts"),
    },
  },
});
