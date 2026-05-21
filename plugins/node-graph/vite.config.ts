import react from "@vitejs/plugin-react";
import { mooresPlugin } from "@mooreseditor/plugin-sdk/vite";
import { defineConfig, mergeConfig } from "vite";

import { pluginMetadata } from "./src/pluginMetadata";

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
export default defineConfig(
  mergeConfig(
    {
      plugins: [react()],
    },
    mooresPlugin(pluginMetadata),
  ),
);
