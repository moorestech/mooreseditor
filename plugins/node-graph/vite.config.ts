import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// external にしたパッケージはホストが提供する共有インスタンスを使う
// （ホストの import map = Task 3 と一致させる）。バンドルには含めない。
//
// @tauri-apps/* と html-to-image は意図的に EXTERNAL に「含めない」。
// これらはホスト共有ではなくプラグイン専用依存なので、自己完結バンドルと
// して dist/index.js に同梱する（@tauri-apps API は window.__TAURI__ 経由で
// 動くため二重インスタンス問題が無い）。
//
// @mantine/hooks / @mantine/notifications は現状プラグイン本体からは未 import
// だが、ホストの import map と同期させ、将来利用が追加された際に誤ってバンドル
// 同梱されないよう EXTERNAL に明示的に残す（未使用ゆえの除去はしない）。
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
        // 拡張子ごとに 1 アセットのみ出力される前提（CSS は index.css に集約）。
        // 同一拡張子のアセットが複数 emit されるとファイル名が衝突する点に注意。
        assetFileNames: "index[extname]",
      },
    },
    outDir: "dist",
    emptyOutDir: true,
  },
});
