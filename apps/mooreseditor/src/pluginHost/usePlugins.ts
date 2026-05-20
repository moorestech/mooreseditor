import { useEffect, useState } from "react";

import { parsePluginConfig } from "./config";
import { loadPlugin, resolveAbsolutePluginPath } from "./loader";

import type { PluginManifest } from "@mooreseditor/plugin-sdk";

/** `config.yaml` の置き場所（monorepo ルート相対 = `apps/mooreseditor/` 直下）。 */
const CONFIG_RELATIVE_PATH = "apps/mooreseditor/mooreseditor.config.yaml";

/**
 * `mooreseditor.config.yaml` の本文を読む（dev/prod フォールバック）。
 *
 * prod (Tauri): `resolve_plugin_path` で config を絶対パス化（同時に FS
 *   スコープへ登録）し、`readTextFile` で読む。Tauri webview の作業
 *   ディレクトリは `src-tauri` 付近のため、相対パス直読みは解決できない。
 * dev (Vite ブラウザ): Tauri API が無いため `resolveAbsolutePluginPath` は
 *   相対パスをそのまま返し、`readTextFile` の import も失敗する。catch 側で
 *   Vite がルート配信する `/mooreseditor.config.yaml` を fetch する。
 */
async function readConfigText(): Promise<string> {
  try {
    const absolutePath = await resolveAbsolutePluginPath(CONFIG_RELATIVE_PATH);
    const { readTextFile } = await import("@tauri-apps/plugin-fs");
    return await readTextFile(absolutePath);
  } catch {
    const res = await fetch("/mooreseditor.config.yaml");
    if (!res.ok) {
      console.warn(`usePlugins: failed to fetch config (${res.status})`);
      return "";
    }
    return await res.text();
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
