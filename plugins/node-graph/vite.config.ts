import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const EXTERNAL = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "@mantine/core",
  "@mantine/hooks",
  "@mantine/notifications",
  "@tabler/icons-react",
  "@xyflow/react",
  "@mooreseditor/plugin-sdk",
];

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: "src/plugin-entry.tsx",
      formats: ["es"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      external: EXTERNAL,
      output: {
        // 単体プラグインバンドルとして読み込むため、動的 import も
        // index.js へインライン化し、出力を index.js / index.css の
        // 2 ファイルに固定する（plugin.json の entry/styles と一致させる）。
        inlineDynamicImports: true,
        assetFileNames: "index[extname]",
      },
    },
    outDir: "dist",
    emptyOutDir: true,
  },
});
