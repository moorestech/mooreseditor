import path from "path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { devFsPlugin } from "./vite-plugins/devFsPlugin";

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [react(), devFsPlugin()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/test": path.resolve(__dirname, "./src/test"),
      "~": path.resolve(__dirname, "./app"),
    },
  },

  build: {
    sourcemap: true,
    minify: false,
    cssMinify: false,
    rollupOptions: {
      output: {
        sourcemapExcludeSources: false,
      },
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: parseInt(process.env.PORT || "5173"),
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
