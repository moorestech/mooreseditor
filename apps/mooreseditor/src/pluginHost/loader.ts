import type { PluginManifest } from "@mooreseditor/plugin-sdk";

/**
 * `plugin.json` の形。`config.yaml` の `dir` 配下に置かれる。
 * `entry` / `styles` の各パスは `dir` からの相対。
 */
interface PluginJson {
  id: string;
  name: string;
  version: string;
  entry: string;
  styles?: string[];
}

/**
 * プラグインディレクトリからファイルテキストを読む（dev/prod フォールバック）。
 *
 * prod (Tauri): `@tauri-apps/plugin-fs` の `readTextFile` で直接読む。
 * dev: `/api/plugin-fs/read` エンドポイント経由。このエンドポイントは
 *   JSON `{ content }` を返すため、`res.json()` から `content` を取り出す。
 */
async function readPluginText(absPath: string): Promise<string> {
  try {
    const { readTextFile } = await import("@tauri-apps/plugin-fs");
    return await readTextFile(absPath);
  } catch {
    const res = await fetch(
      `/api/plugin-fs/read?path=${encodeURIComponent(absPath)}`,
    );
    if (!res.ok) {
      throw new Error(`plugin read failed: ${absPath} (${res.status})`);
    }
    const body = (await res.json()) as { content?: unknown };
    if (typeof body.content !== "string") {
      throw new Error(`plugin read returned no content: ${absPath}`);
    }
    return body.content;
  }
}

/**
 * プラグインエントリ JS の動的 import 用 URL を解決する（dev/prod フォールバック）。
 *
 * prod (Tauri): `convertFileSrc` でカスタムプロトコル URL に変換。
 * dev: `/api/plugin-fs/file` エンドポイント（正しい JS MIME で配信）。
 */
async function resolveEntryUrl(entryAbsPath: string): Promise<string> {
  try {
    const { convertFileSrc } = await import("@tauri-apps/api/core");
    return convertFileSrc(entryAbsPath);
  } catch {
    return `/api/plugin-fs/file?path=${encodeURIComponent(entryAbsPath)}`;
  }
}

/** plugin.json の styles の CSS を <link> として動的注入する。 */
function injectPluginStyles(pluginDir: string, styles: string[]): void {
  for (const stylePath of styles) {
    const href = `/api/plugin-fs/file?path=${encodeURIComponent(
      `${pluginDir}/${stylePath}`,
    )}`;
    if (!document.querySelector(`link[data-plugin-style="${href}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.dataset.pluginStyle = href;
      document.head.appendChild(link);
    }
  }
}

/**
 * 1 プラグインディレクトリをロードして `PluginManifest` を返す。
 *
 * 手順:
 *  1. `<dir>/plugin.json` を読み、`PluginJson` としてパース。
 *  2. `styles` があれば CSS を `<link>` 注入。
 *  3. `<dir>/<entry>` の JS を動的 import し、`default` エクスポートを
 *     `PluginManifest` として返す。
 *
 * `pluginDir` は monorepo ルート相対パス（例: `./plugins/node-graph`）。
 */
export async function loadPlugin(pluginDir: string): Promise<PluginManifest> {
  const manifestText = await readPluginText(`${pluginDir}/plugin.json`);
  const pluginJson = JSON.parse(manifestText) as PluginJson;

  if (pluginJson.styles?.length) {
    injectPluginStyles(pluginDir, pluginJson.styles);
  }

  const entryAbs = `${pluginDir}/${pluginJson.entry}`;
  const entryUrl = await resolveEntryUrl(entryAbs);
  // `@vite-ignore`: この URL は実行時に解決されるため、Vite に静的解析・
  // バンドルさせない。
  const mod = (await import(/* @vite-ignore */ entryUrl)) as {
    default: PluginManifest;
  };
  return mod.default;
}
