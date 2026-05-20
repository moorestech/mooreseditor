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
 *
 * `filePath` は monorepo ルート相対パス（例: `./plugins/node-graph/plugin.json`）。
 */
async function readPluginText(filePath: string): Promise<string> {
  try {
    const { readTextFile } = await import("@tauri-apps/plugin-fs");
    return await readTextFile(filePath);
  } catch {
    const res = await fetch(
      `/api/plugin-fs/read?path=${encodeURIComponent(filePath)}`,
    );
    if (!res.ok) {
      throw new Error(`plugin read failed: ${filePath} (${res.status})`);
    }
    const body = (await res.json()) as { content?: unknown };
    if (typeof body.content !== "string") {
      throw new Error(`plugin read returned no content: ${filePath}`);
    }
    return body.content;
  }
}

/**
 * プラグインファイル（エントリ JS・CSS）の URL を解決する（dev/prod フォールバック）。
 *
 * prod (Tauri): `convertFileSrc` でカスタムプロトコル URL に変換。
 * dev: `/api/plugin-fs/file` エンドポイント（正しい MIME で配信）。
 *
 * `filePath` は monorepo ルート相対パス。
 */
async function resolvePluginFileUrl(filePath: string): Promise<string> {
  try {
    const { convertFileSrc } = await import("@tauri-apps/api/core");
    return convertFileSrc(filePath);
  } catch {
    return `/api/plugin-fs/file?path=${encodeURIComponent(filePath)}`;
  }
}

/**
 * plugin.json の styles の CSS を `<link>` として動的注入する。
 *
 * 各 href は `resolvePluginFileUrl` で解決するため、prod (Tauri) でも
 * dev でも正しく配信される（dev 専用エンドポイントを直書きしない）。
 */
async function injectPluginStyles(
  pluginDir: string,
  styles: string[],
): Promise<void> {
  for (const stylePath of styles) {
    const href = await resolvePluginFileUrl(`${pluginDir}/${stylePath}`);
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
 * 動的 import した default export が `PluginManifest` として妥当かを検証する。
 * エントリ JS は外部の信頼できないコードなので、型アサーションだけに頼らず
 * 実行時に最低限の形を確認する。
 */
function assertPluginManifest(
  value: unknown,
  pluginDir: string,
): asserts value is PluginManifest {
  const manifest = value as Partial<PluginManifest> | undefined;
  if (
    !manifest ||
    typeof manifest.id !== "string" ||
    typeof manifest.name !== "string" ||
    typeof manifest.createView !== "function"
  ) {
    throw new Error(
      `Plugin ${pluginDir}: default export is not a valid PluginManifest`,
    );
  }
}

/**
 * 1 プラグインディレクトリをロードして `PluginManifest` を返す。
 *
 * 手順:
 *  1. `<dir>/plugin.json` を読み、`PluginJson` としてパース。
 *  2. `styles` があれば CSS を `<link>` 注入。
 *  3. `<dir>/<entry>` の JS を動的 import し、`default` エクスポートを
 *     検証した上で `PluginManifest` として返す。
 *
 * `pluginDir` は monorepo ルート相対パス（例: `./plugins/node-graph`）。
 */
export async function loadPlugin(pluginDir: string): Promise<PluginManifest> {
  const manifestText = await readPluginText(`${pluginDir}/plugin.json`);
  let pluginJson: PluginJson;
  try {
    pluginJson = JSON.parse(manifestText) as PluginJson;
  } catch (e) {
    throw new Error(`Invalid plugin.json in ${pluginDir}: ${String(e)}`);
  }

  if (pluginJson.styles?.length) {
    await injectPluginStyles(pluginDir, pluginJson.styles);
  }

  const entryUrl = await resolvePluginFileUrl(
    `${pluginDir}/${pluginJson.entry}`,
  );
  // `@vite-ignore`: この URL は実行時に解決されるため、Vite に静的解析・
  // バンドルさせない。
  const mod = (await import(/* @vite-ignore */ entryUrl)) as {
    default: unknown;
  };
  assertPluginManifest(mod.default, pluginDir);
  return mod.default;
}
