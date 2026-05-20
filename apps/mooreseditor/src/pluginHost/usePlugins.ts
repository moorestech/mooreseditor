import { useEffect, useState } from "react";

import { parsePluginConfig } from "./config";
import { loadPlugin } from "./loader";

import type { PluginManifest } from "@mooreseditor/plugin-sdk";

/**
 * `mooreseditor.config.yaml` の本文を読む（dev/prod フォールバック）。
 *
 * prod (Tauri): `readTextFile` でアプリ起動時に直接読む。
 * dev: Vite が `apps/mooreseditor/` 直下のファイルをルート配信するため
 *   `/mooreseditor.config.yaml` で取得できる。
 */
async function readConfigText(): Promise<string> {
  try {
    const { readTextFile } = await import("@tauri-apps/plugin-fs");
    return await readTextFile("mooreseditor.config.yaml");
  } catch {
    const res = await fetch("/mooreseditor.config.yaml");
    return res.ok ? await res.text() : "";
  }
}

/**
 * `mooreseditor.config.yaml` を読み、宣言された全プラグインをロードして
 * `PluginManifest[]` と loading 状態を返すフック。
 *
 * 1 プラグインのロード失敗は致命的とはせず、`console.error` で記録した上で
 * 残りのプラグインのロードを続行する。
 */
export function usePlugins(): { plugins: PluginManifest[]; loading: boolean } {
  const [plugins, setPlugins] = useState<PluginManifest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    void (async () => {
      const entries = parsePluginConfig(await readConfigText());
      const loaded: PluginManifest[] = [];
      for (const entry of entries) {
        try {
          loaded.push(await loadPlugin(entry.dir));
        } catch (error) {
          console.error(`プラグインのロードに失敗: ${entry.dir}`, error);
        }
      }
      if (!isCancelled) {
        setPlugins(loaded);
        setIsLoading(false);
      }
    })();
    return () => {
      isCancelled = true;
    };
  }, []);

  return { plugins, loading: isLoading };
}
