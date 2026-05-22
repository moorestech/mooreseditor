import { useEffect, useState } from "react";

import { loadPlugin } from "./loader";

import type { PluginConfigEntry } from "./config";
import type { PluginManifest } from "@moorestech/mooreseditor-plugin-sdk";

/**
 * 開いたプロジェクトで宣言されたプラグインをロードするフック。
 *
 * `ProjectContext` が `<projectDir>/mooreseditor.config.yml` の `plugins:`
 * セクションを抽出した `pluginConfigs` と、`open()` ダイアログ由来の絶対パス
 * `projectDir` を受け取り、プロジェクトオープン後に各プラグインをロードする。
 * `projectDir` が `null`（プロジェクト未オープン）のあいだはプラグイン 0 個。
 *
 * 各プラグインの `dir` は `projectDir` からの相対パスとして解決される。
 * 1 プラグインのロード失敗は致命的とはせず、`console.error` で記録して残りの
 * プラグインのロードを続行する。
 *
 * 注: `pluginConfigs` は安定した参照（`useState` 由来など）であること。
 * 毎レンダー新しい配列リテラルを渡すと毎回全プラグインが再ロードされる。
 */
export function usePlugins(
  pluginConfigs: PluginConfigEntry[],
  projectDir: string | null,
): { plugins: PluginManifest[]; loading: boolean } {
  const [plugins, setPlugins] = useState<PluginManifest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!projectDir) {
      setPlugins([]);
      setIsLoading(false);
      return;
    }
    let isCancelled = false;
    setIsLoading(true);
    void (async () => {
      const loaded: PluginManifest[] = [];
      for (const entry of pluginConfigs) {
        try {
          loaded.push(await loadPlugin(projectDir, entry.dir));
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
  }, [projectDir, pluginConfigs]);

  return { plugins, loading: isLoading };
}
