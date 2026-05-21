import { resolvePluginPackagePath } from "./pluginPaths";
import { injectPluginStyleLink } from "./pluginStyles";

import type { PluginManifest } from "@mooreseditor/plugin-sdk";

/**
 * `plugin.json` の形。`config.yaml` の `dir` 配下に置かれる。
 * `entry` / `styles` の各パスは `dir` からの相対。
 */
export interface PluginJson {
  id: string;
  name: string;
  version: string;
  entry: string;
  styles?: string[];
}

/**
 * プラグインディレクトリの相対パスを、開いたプロジェクトディレクトリ基準で
 * 絶対パスへ解決する。
 *
 * `projectDir` は `open()` ダイアログ由来の絶対パス。`pluginDir` はプロジェクト
 * 設定 yml の `plugins[].dir`（プロジェクトディレクトリからの相対パス、例:
 * `./plugins/node-graph`）。`@tauri-apps/plugin-fs` の `readTextFile` も
 * `asset:` プロトコルの `convertFileSrc` も絶対パスを要求するため、ロード前に
 * 絶対化する。
 *
 * prod / `tauri:dev`（Tauri ランタイム有）: `@tauri-apps/api/path` の `resolve`
 *   で OS のパス規則どおりに正規化・絶対化する。プロジェクトディレクトリは
 *   `add_project_to_scope` で再帰的に FS スコープ登録済みなので、配下の
 *   プラグインファイルは追加登録なしで読める。
 * 純 Vite ブラウザ（Tauri ランタイム無）: `@tauri-apps/api/path` の import は
 *   成功するが `resolve` の invoke が失敗する。catch 側で素朴に文字列結合した
 *   パスを返す（純ブラウザは実プロジェクトを開けないためプラグイン 0 個で、
 *   このパスが実際に使われることはない）。
 *
 * セキュリティ: `pluginDir` はプロジェクト所有者自身の設定ファイル由来だが、
 * `..` セグメントと絶対パスによるプロジェクト外への脱出を最低限ガードする。
 */
async function resolvePluginDir(
  projectDir: string,
  pluginDir: string,
): Promise<string> {
  if (
    pluginDir.split(/[/\\]/).includes("..") ||
    /^([a-zA-Z]:[/\\]|[/\\])/.test(pluginDir)
  ) {
    throw new Error(`Invalid plugin dir: ${pluginDir}`);
  }
  try {
    const { resolve } = await import("@tauri-apps/api/path");
    return await resolve(projectDir, pluginDir);
  } catch {
    return `${projectDir}/${pluginDir}`;
  }
}

/**
 * プラグインディレクトリからファイルテキストを読む（dev/prod フォールバック）。
 *
 * prod (Tauri): `@tauri-apps/plugin-fs` の `readTextFile` で直接読む。
 * dev: `/api/plugin-fs/read` エンドポイント経由。このエンドポイントは
 *   JSON `{ content }` を返すため、`res.json()` から `content` を取り出す。
 *
 * `filePath` は `resolvePluginDir` が解決済みの絶対パス（例:
 * `<projectDir>/plugins/node-graph/plugin.json`）。
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
 * `filePath` は `resolvePluginDir` が解決済みの絶対パス。
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
  pluginId: string,
  pluginDir: string,
  styles: string[],
): Promise<void> {
  for (const stylePath of styles) {
    const href = await resolvePluginFileUrl(
      resolvePluginPackagePath(pluginDir, stylePath),
    );
    injectPluginStyleLink(pluginId, href);
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
    typeof manifest.version !== "string" ||
    typeof manifest.createView !== "function"
  ) {
    throw new Error(
      `Plugin ${pluginDir}: default export is not a valid PluginManifest`,
    );
  }
}

export function assertPluginMetadataMatchesJson(
  pluginJson: PluginJson,
  manifest: PluginManifest,
  pluginDir: string,
): void {
  if (
    pluginJson.id !== manifest.id ||
    pluginJson.name !== manifest.name ||
    pluginJson.version !== manifest.version
  ) {
    throw new Error(
      `Plugin ${pluginDir}: plugin.json metadata does not match runtime manifest`,
    );
  }
}

/**
 * 1 プラグインをロードして `PluginManifest` を返す。
 *
 * 手順:
 *  1. `pluginDir` を `projectDir` 基準で絶対パスへ解決。
 *  2. `<dir>/plugin.json` を読み、`PluginJson` としてパース。
 *  3. `styles` があれば CSS を `<link>` 注入。
 *  4. `<dir>/<entry>` の JS を動的 import し、`default` エクスポートを
 *     検証した上で `PluginManifest` として返す。
 *
 * `projectDir` は開いたプロジェクトの絶対パス。`pluginDir` はプロジェクト
 * 設定 yml の `plugins[].dir`（プロジェクトディレクトリからの相対パス）。
 */
export async function loadPlugin(
  projectDir: string,
  pluginDir: string,
): Promise<PluginManifest> {
  const resolvedDir = await resolvePluginDir(projectDir, pluginDir);
  const manifestText = await readPluginText(`${resolvedDir}/plugin.json`);
  let pluginJson: PluginJson;
  try {
    pluginJson = JSON.parse(manifestText) as PluginJson;
  } catch (e) {
    throw new Error(`Invalid plugin.json in ${pluginDir}: ${String(e)}`);
  }

  const entryUrl = await resolvePluginFileUrl(
    resolvePluginPackagePath(resolvedDir, pluginJson.entry),
  );
  // `@vite-ignore`: この URL は実行時に解決されるため、Vite に静的解析・
  // バンドルさせない。
  const mod = (await import(/* @vite-ignore */ entryUrl)) as {
    default: unknown;
  };
  assertPluginManifest(mod.default, pluginDir);
  assertPluginMetadataMatchesJson(pluginJson, mod.default, pluginDir);
  if (pluginJson.styles?.length) {
    await injectPluginStyles(mod.default.id, resolvedDir, pluginJson.styles);
  }
  return mod.default;
}
