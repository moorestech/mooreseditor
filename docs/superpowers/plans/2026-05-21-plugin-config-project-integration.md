# プラグイン設定のプロジェクト統合 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** プラグイン宣言を「エディタ固定パスの専用 `mooreseditor.config.yaml`」から「開いたプロジェクトの `mooreseditor.config.yml` の `plugins:` セクション」へ移し、プロジェクトごとにプラグインを宣言・配置できるようにする。

**Architecture:** `ProjectContext` が既に読み込んでいるプロジェクト設定 `<projectDir>/mooreseditor.config.yml` から `plugins:` を抽出して公開する。`usePlugins` はプロジェクトオープン後にその宣言を受け取り、各プラグインを **プロジェクトディレクトリ基準**で解決してロードする。`projectDir` は `open()` ダイアログ由来の絶対パスであり、プロジェクトディレクトリは `add_project_to_scope` で再帰的に FS スコープ登録済みのため、monorepo ルート基準の Rust 解決コマンド（`resolve_plugin_path`）は不要になり削除する。

**Tech Stack:** React Context / Tauri 2（fs scope・asset protocol）/ YAML / Vite

設計経緯: Phase 3（`docs/superpowers/plans/2026-05-20-node-graph-plugin-phase3.md`）は専用 `mooreseditor.config.yaml` をエディタ固定パスに置く設計だったが、実プロジェクトが既に `mooreseditor.config.yml`（`projectName`/`schemaPath`/`masterPath`）を持つことと衝突していた。本計画はその統合修正。

---

## ⚠️ 実行前提

- Phase 3 が master にマージ済み（マージコミット `bb65284`）であること。
- 作業ブランチ: master から `feature/plugin-config-project-integration` を切る。
- 検証コマンド（ルート）: `pnpm run type-check` / `pnpm run lint` / `pnpm run test` / `npx playwright test --reporter=list`
- CLAUDE.md 規約: 環境判定 if は使わず try-catch フォールバック。スキーマ構造のハードコード禁止。
- コミットはタスクごと。メッセージ末尾に `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`。

## 現状の問題（修正対象）

|            | プロジェクト設定（既存）          | プラグイン設定（Phase 3）                |
| ---------- | --------------------------------- | ---------------------------------------- |
| ファイル   | `mooreseditor.config.yml`         | `mooreseditor.config.yaml`               |
| 場所       | 開いたプロジェクト直下            | `<repo>/apps/mooreseditor/` 固定         |
| 読む箇所   | `ProjectContext.openProjectDir()` | `usePlugins`（mount 時 1 回）            |
| タイミング | プロジェクトオープン時            | アプリ起動直後（プロジェクト未オープン） |

Phase 3 のプラグインローダは「開いたプロジェクト」を一切見ず、エディタ固定パスから読む。実プロジェクト（例: `/Users/katsumi/moorestech_master/server_v8/mods/moorestechAlphaMod_8/`）の `mooreseditor.config.yml` に `plugins:` を書いてもロードされない。

## 設計上の確定事項

- **プラグイン宣言の置き場所:** プロジェクト直下の `mooreseditor.config.yml` に `plugins:` セクションを追加する（プロジェクト設定とプラグイン設定を 1 ファイルへ統合）。
- **プラグイン実体の置き場所:** プロジェクトディレクトリ配下（例: `<projectDir>/plugins/node-graph/`）。`plugins[].dir` はプロジェクトディレクトリからの相対パス。
- **パス解決:** `projectDir` は `open()` ダイアログ由来の絶対パス。プラグインディレクトリは `path.resolve(projectDir, dir)` で絶対化する（Rust 不要）。
- **FS スコープ:** `add_project_to_scope`（既存）が `projectDir` を再帰的に FS スコープ登録済みなので、配下のプラグインファイルは追加登録なしで `readTextFile` 可能。
- **asset プロトコルスコープ:** 既存の静的 glob `$HOME/**/plugins/*/dist/**`（`tauri.conf.json`）が `$HOME` 配下プロジェクトのプラグイン `dist/` を網羅する。`$HOME` 外のプロジェクトは本計画のスコープ外（既知の制約として明記する）。
- **`resolve_plugin_path`（Rust）と `monorepo_root()` は不要になるため削除する。**
- **import map / `/shared/*` ブリッジ（`pluginFsPlugin.ts`・`index.html`）は変更しない** — プラグイン実体の置き場所と無関係に共有依存解決を担うため、現状のまま機能する。

## File Structure

| パス                                                | 責務                                                   | 操作 |
| --------------------------------------------------- | ------------------------------------------------------ | ---- |
| `apps/mooreseditor/src/contexts/ProjectContext.tsx` | プロジェクト設定読込。`plugins:` を抽出し公開          | 更新 |
| `apps/mooreseditor/src/pluginHost/usePlugins.ts`    | プロジェクト依存のプラグインロードフック               | 更新 |
| `apps/mooreseditor/src/pluginHost/loader.ts`        | プラグインディレクトリをプロジェクト基準で解決しロード | 更新 |
| `apps/mooreseditor/src-tauri/src/lib.rs`            | `resolve_plugin_path`/`monorepo_root` を削除           | 更新 |
| `apps/mooreseditor/src/App.tsx`                     | `usePlugins` へ `pluginConfigs`/`projectDir` を渡す    | 更新 |
| `apps/mooreseditor/src/App.test.tsx`                | `useProject` モックに `pluginConfigs` を追加           | 更新 |
| `apps/mooreseditor/mooreseditor.config.yaml`        | 旧プラグイン設定（不要）                               | 削除 |

`apps/mooreseditor/src/pluginHost/config.ts`（`parsePluginConfig`）は **変更しない** — `plugins:` キーが無ければ `[]` を返す実装なので、プロジェクト設定 yml にそのまま適用できる。

---

## Task 1: ProjectContext がプロジェクト設定から `plugins:` を抽出・公開する

**Files:**

- Modify: `apps/mooreseditor/src/contexts/ProjectContext.tsx`

- [ ] **Step 1: 作業ブランチ作成**

```bash
git checkout master && git checkout -b feature/plugin-config-project-integration
```

- [ ] **Step 2: import と型に `pluginConfigs` を追加**

`apps/mooreseditor/src/contexts/ProjectContext.tsx` の先頭の import 群に追加（既存の `import { getSampleSchemaList, getSampleSchema } from "../utils/devFileSystem";` の下）:

```ts
import { parsePluginConfig } from "../pluginHost/config";

import type { PluginConfigEntry } from "../pluginHost/config";
```

`ProjectContextType` インターフェース（現状 6 メンバ）に `pluginConfigs` を追加する。修正後の全体:

```ts
interface ProjectContextType {
  projectDir: string | null;
  schemaDir: string | null;
  masterDir: string | null;
  menuToFileMap: Record<string, string>;
  /** 開いたプロジェクトの mooreseditor.config.yml で宣言されたプラグイン一覧。 */
  pluginConfigs: PluginConfigEntry[];
  loading: boolean;
  openProjectDir: () => Promise<void>;
}
```

- [ ] **Step 3: `pluginConfigs` の state を追加**

`ProjectProvider` 内の state 宣言群（`const [menuToFileMap, setMenuToFileMap] = useState<Record<string, string>>({});` の下）に追加:

```ts
const [pluginConfigs, setPluginConfigs] = useState<PluginConfigEntry[]>([]);
```

- [ ] **Step 4: `openProjectDir` で `plugins:` を抽出**

`openProjectDir` 内、`configContents` を読み `configData` を検証した直後（`if (!configData || !configData.schemaPath) { ... }` ブロックの **後**、`const resolvedSchemaPath = ...` の **前**）に追加:

```ts
// プロジェクト設定 yml の plugins: セクションを抽出する。
// plugins: が無ければ parsePluginConfig は [] を返す。
setPluginConfigs(parsePluginConfig(configContents));
```

- [ ] **Step 5: `loadSampleProjectData` で `pluginConfigs` をクリア**

`loadSampleProjectData` 内、`setProjectDir("SampleProject");` の直後に追加（サンプルプロジェクトはプラグイン設定を持たないため明示的に空へ）:

```ts
setPluginConfigs([]);
```

- [ ] **Step 6: Provider value に `pluginConfigs` を追加**

`<ProjectContext.Provider value={{ ... }}>` の value オブジェクトに `pluginConfigs` を追加する。修正後:

```tsx
      value={{
        projectDir,
        schemaDir,
        masterDir,
        menuToFileMap,
        pluginConfigs,
        loading: isLoading,
        openProjectDir,
      }}
```

- [ ] **Step 7: 型チェック**

Run: `pnpm run type-check`
Expected: `App.tsx` で `useProject()` の戻り値型に `pluginConfigs` が増えたことによるエラーは出ない（`pluginConfigs` を未使用にしても型エラーにはならない）。`App.test.tsx` の `useProject` モックでエラーが出る可能性があるが、それは Task 5 で解消する。このタスク単体では `ProjectContext.tsx` に型エラーが無いことを確認する。成功すること。

- [ ] **Step 8: コミット**

```bash
git add apps/mooreseditor/src/contexts/ProjectContext.tsx
git commit -m "feat: プロジェクト設定 yml から plugins: を抽出し ProjectContext で公開"
```

---

## Task 2: usePlugins をプロジェクト依存フックへ変更

**Files:**

- Modify: `apps/mooreseditor/src/pluginHost/usePlugins.ts`

- [ ] **Step 1: `usePlugins.ts` を全面置換**

`apps/mooreseditor/src/pluginHost/usePlugins.ts` の内容を以下で完全に置き換える。旧実装の `CONFIG_RELATIVE_PATH` / `readConfigText` / `parsePluginConfig` import / mount 時 1 回発火（`[]` deps）はすべて廃止する:

```ts
import { useEffect, useState } from "react";

import { loadPlugin } from "./loader";

import type { PluginConfigEntry } from "./config";
import type { PluginManifest } from "@mooreseditor/plugin-sdk";

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
```

- [ ] **Step 2: 型チェック**

Run: `pnpm run type-check`
Expected: `usePlugins.ts` 自体に型エラーが無いこと。`App.tsx` は旧シグネチャ（引数なし）で `usePlugins()` を呼んでいるためここでエラーが出る — それは Task 5 で解消する。`loadPlugin` の新シグネチャ（2 引数）も Task 3 で実装するため、`loadPlugin(projectDir, entry.dir)` の呼び出しが現時点で型エラーになる場合がある。**このタスクは Task 3 と密結合のため、Task 2・Task 3 をまとめて実装し、Task 3 完了後に型チェックが通ることを確認してよい。**

- [ ] **Step 3: コミット**

```bash
git add apps/mooreseditor/src/pluginHost/usePlugins.ts
git commit -m "feat: usePlugins をプロジェクト依存フックへ変更"
```

---

## Task 3: loader をプロジェクトディレクトリ基準の解決へ変更

**Files:**

- Modify: `apps/mooreseditor/src/pluginHost/loader.ts`

- [ ] **Step 1: `isTauriRuntime` と `resolveAbsolutePluginPath` を削除し `resolvePluginDir` を追加**

`loader.ts` の `isTauriRuntime` 関数（`function isTauriRuntime()...`）と `resolveAbsolutePluginPath` 関数（`export async function resolveAbsolutePluginPath...`）の **2 つを丸ごと削除**し、代わりに以下の `resolvePluginDir` を同じ位置に追加する:

```ts
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
 * `..` セグメントによるプロジェクト外への脱出を最低限ガードする。
 */
async function resolvePluginDir(
  projectDir: string,
  pluginDir: string,
): Promise<string> {
  if (pluginDir.split(/[/\\]/).includes("..")) {
    throw new Error(`Invalid plugin dir (contains ".."): ${pluginDir}`);
  }
  try {
    const { resolve } = await import("@tauri-apps/api/path");
    return await resolve(projectDir, pluginDir);
  } catch {
    return `${projectDir}/${pluginDir}`;
  }
}
```

- [ ] **Step 2: `loadPlugin` のシグネチャを 2 引数へ変更**

`loadPlugin` 関数を以下で置き換える（`pluginDir` 1 引数 → `projectDir` + `pluginDir` の 2 引数。先頭の `resolveAbsolutePluginPath` 呼び出しを `resolvePluginDir` に変更。それ以降の本体は不変）:

```ts
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

  if (pluginJson.styles?.length) {
    await injectPluginStyles(resolvedDir, pluginJson.styles);
  }

  const entryUrl = await resolvePluginFileUrl(
    `${resolvedDir}/${pluginJson.entry}`,
  );
  // `@vite-ignore`: この URL は実行時に解決されるため、Vite に静的解析・
  // バンドルさせない。
  const mod = (await import(/* @vite-ignore */ entryUrl)) as {
    default: unknown;
  };
  assertPluginManifest(mod.default, pluginDir);
  return mod.default;
}
```

注: `readPluginText` / `resolvePluginFileUrl` / `injectPluginStyles` / `assertPluginManifest` / `PluginJson` は変更しない。`readPluginText` と `resolvePluginFileUrl` は引き続き「Tauri を試し、失敗時 `/api/plugin-fs/` へフォールバック」する try-catch 構造を持つ（CLAUDE.md 規約準拠）。

- [ ] **Step 3: 型チェック・lint**

Run: `pnpm run type-check && pnpm run lint`
Expected: `usePlugins.ts`（Task 2）と `loader.ts` の整合が取れ、両ファイルに型エラー・lint エラーが無いこと。`App.tsx` は旧 `usePlugins()` 呼び出しのため型エラーが残る — Task 5 で解消する。**`App.tsx` 由来のエラーのみであることを確認すること。**

- [ ] **Step 4: コミット**

```bash
git add apps/mooreseditor/src/pluginHost/loader.ts apps/mooreseditor/src/pluginHost/usePlugins.ts
git commit -m "feat: プラグインディレクトリをプロジェクト基準で解決するよう loader を変更"
```

---

## Task 4: Rust の `resolve_plugin_path` / `monorepo_root` を削除

**Files:**

- Modify: `apps/mooreseditor/src-tauri/src/lib.rs`

- [ ] **Step 1: `lib.rs` を以下で全面置換**

`resolve_plugin_path`（コマンド）と `monorepo_root`（ヘルパ）は新モデルで不要になるため削除する。プラグインディレクトリは `add_project_to_scope` が `projectDir` を再帰登録することで FS スコープに入り、絶対化は webview 側（`@tauri-apps/api/path` の `resolve`）で行う。`apps/mooreseditor/src-tauri/src/lib.rs` 全体を以下で置き換える:

```rust
use tauri_plugin_fs::FsExt;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn add_project_to_scope(app: tauri::AppHandle, project_path: String) -> Result<(), String> {
    // Add the project directory and all its subdirectories to the scope.
    // プロジェクトディレクトリを再帰登録するため、配下に置かれたプラグイン
    // （`<projectDir>/plugins/.../dist/*` 等）も追加登録なしで読み書きできる。
    let fs = app.fs_scope();
    fs.allow_directory(&project_path, true)
        .map_err(|e| format!("Failed to add directory to scope: {}", e))?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![greet, add_project_to_scope])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

注: `use std::path::{Path, PathBuf};` は `resolve_plugin_path` 削除により未使用になるため、上記のとおり import 行ごと削除する。`use tauri_plugin_fs::FsExt;` は `add_project_to_scope` で使うため残す。

- [ ] **Step 2: Rust がコンパイルできることを確認**

Run: `cd apps/mooreseditor/src-tauri && cargo build 2>&1 | tail -15 && cd -`
Expected: 警告・エラーなくコンパイル成功（`Finished` が表示される）。未使用 import 警告が出ないこと。

- [ ] **Step 3: コミット**

```bash
git add apps/mooreseditor/src-tauri/src/lib.rs
git commit -m "refactor: 不要になった resolve_plugin_path / monorepo_root を削除"
```

---

## Task 5: App.tsx 配線・旧 config 削除・テスト修正

**Files:**

- Modify: `apps/mooreseditor/src/App.tsx`
- Modify: `apps/mooreseditor/src/App.test.tsx`
- Delete: `apps/mooreseditor/mooreseditor.config.yaml`

- [ ] **Step 1: `App.tsx` で `useProject` から `pluginConfigs` を取得**

`App.tsx` の `useProject()` 分割代入（現状 `const { projectDir, schemaDir, masterDir, menuToFileMap, openProjectDir } = useProject();`）に `pluginConfigs` を追加する:

```ts
const {
  projectDir,
  schemaDir,
  masterDir,
  menuToFileMap,
  pluginConfigs,
  openProjectDir,
} = useProject();
```

- [ ] **Step 2: `usePlugins` 呼び出しを 2 引数へ変更**

`App.tsx` の `const { plugins, loading: isPluginsLoading } = usePlugins();` を以下に変更:

```ts
const { plugins, loading: isPluginsLoading } = usePlugins(
  pluginConfigs,
  projectDir,
);
```

- [ ] **Step 3: 旧プラグイン設定ファイルを削除**

```bash
git rm apps/mooreseditor/mooreseditor.config.yaml
```

このファイルは Phase 3 が作ったエディタ固定パスのプラグイン設定で、新モデルでは使われない（`usePlugins` はもう読まない）。

- [ ] **Step 4: `App.test.tsx` の `useProject` モックに `pluginConfigs` を追加**

`apps/mooreseditor/src/App.test.tsx` を開く。`useProject` のモック戻り値オブジェクト（`vi.mocked(useProject).mockReturnValue({ ... })` の形で複数箇所、および `mockUseProject` 定義）すべてに `pluginConfigs: []` を追加する。`as any` 付きでキャストしている箇所はそのままでも型エラーにならないが、`as any` を使っていない `mockReturnValue({ ... })` 箇所には必ず `pluginConfigs: []` を加える（`ProjectContextType` の必須メンバになったため）。

`usePlugins` のモック（`vi.mock("./pluginHost/usePlugins", () => ({ usePlugins: vi.fn(() => ({ plugins: [], loading: false })) }))`）は引数を無視するため **変更不要**（新 2 引数シグネチャでもそのまま動く）。

- [ ] **Step 5: 型チェック・lint・ユニットテスト**

Run: `pnpm run type-check && pnpm run lint && pnpm run test`
Expected: すべて成功。ユニットテストは Phase 3 完了時と同数（app 117 / plugin-sdk 383 pass + 5 skip / node-graph 48）で全 pass。

- [ ] **Step 6: E2E テスト**

Run: `npx playwright test --reporter=list`
Expected: 8/8 pass。E2E は純 Vite dev サーバ（サンプルプロジェクト）で走り、サンプルには `plugins:` 宣言が無いため Node Graph タブは出ないが、E2E 4 spec はいずれも Editor の機能のみを検証しており Node Graph タブに依存しないため影響しない。

- [ ] **Step 7: コミット**

```bash
git add apps/mooreseditor/src/App.tsx apps/mooreseditor/src/App.test.tsx
git commit -m "feat: App を新プラグインロード機構へ配線し旧 config を削除"
```

---

## Task 6: ビルド・moorestech プロジェクトへの導入・prod 検証

**Files:**

- Build: `plugins/node-graph/dist/`（成果物）
- Deploy（mooreseditor リポジトリ外）:

  - `/Users/katsumi/moorestech_master/server_v8/mods/moorestechAlphaMod_8/plugins/node-graph/`
  - `/Users/katsumi/moorestech_master/server_v8/mods/moorestechAlphaMod_8/mooreseditor.config.yml`

- [ ] **Step 1: ノードグラフプラグインをビルド**

```bash
pnpm --filter @mooreseditor/plugin-node-graph run build
ls -la plugins/node-graph/dist/
```

Expected: `plugins/node-graph/dist/index.js` と `plugins/node-graph/dist/index.css` が生成される。

- [ ] **Step 2: プラグイン実体を moorestech プロジェクトへ配置**

```bash
DEST="/Users/katsumi/moorestech_master/server_v8/mods/moorestechAlphaMod_8/plugins/node-graph"
mkdir -p "$DEST/dist"
cp plugins/node-graph/plugin.json "$DEST/plugin.json"
cp plugins/node-graph/dist/index.js "$DEST/dist/index.js"
cp plugins/node-graph/dist/index.css "$DEST/dist/index.css"
ls -R "$DEST"
```

Expected: `<DEST>/plugin.json`・`<DEST>/dist/index.js`・`<DEST>/dist/index.css` が揃う。

- [ ] **Step 3: moorestech プロジェクトの `mooreseditor.config.yml` に `plugins:` を追記**

`/Users/katsumi/moorestech_master/server_v8/mods/moorestechAlphaMod_8/mooreseditor.config.yml` の末尾に以下を追記する（既存の `projectName`/`projectDescription`/`schemaPath`/`masterPath` はそのまま残す）:

```yaml
# 起動時に読み込むプラグイン。dir はこの設定ファイルからの相対パス。
plugins:
  - dir: ./plugins/node-graph
```

追記後、`parse` で読めることを確認:

```bash
node -e "const y=require('yaml');const fs=require('fs');const d=y.parse(fs.readFileSync('/Users/katsumi/moorestech_master/server_v8/mods/moorestechAlphaMod_8/mooreseditor.config.yml','utf8'));console.log(JSON.stringify(d.plugins));"
```

Expected: `[{"dir":"./plugins/node-graph"}]` が出力される。

- [ ] **Step 4: prod ビルド**

```bash
pnpm run tauri:build 2>&1 | tail -20
```

Expected: ビルド成功。`apps/mooreseditor/src-tauri/target/release/bundle/macos/mooreseditor.app` が生成される（release ビルドのため数分〜十数分かかる。必要なら `run_in_background` で実行する）。

- [ ] **Step 5: ビルド成果物のパスを確認**

```bash
ls -la apps/mooreseditor/src-tauri/target/release/bundle/macos/mooreseditor.app
stat -f "%Sm" apps/mooreseditor/src-tauri/target/release/bundle/macos/mooreseditor.app
```

Expected: `.app` が存在し、更新日時が今回のビルド時刻であること。

- [ ] **Step 6: ユーザーへ手動検証を引き継ぐ**

以下はネイティブ Tauri ウィンドウの操作が必要で自動化できないため、ユーザーに手順を提示して確認を依頼する:

1. `open apps/mooreseditor/src-tauri/target/release/bundle/macos/mooreseditor.app` でアプリを起動。
2. 「File Open」で `/Users/katsumi/moorestech_master/server_v8/mods/moorestechAlphaMod_8/` を開く。
3. ヘッダに「Editor」「Node Graph」タブが両方表示されること（= プロジェクトの `mooreseditor.config.yml` の `plugins:` 宣言からノードグラフが動的ロードされた）。
4. Node Graph タブでノードグラフが正常描画され、ノード追加・Ctrl+S 保存が動作すること。
5. 既存の `.mooreseditor/nodeGraph.v1.json` が読み込まれること。

- [ ] **Step 7: コミット**

```bash
git add -A
git commit -m "build: ノードグラフプラグインをビルドしプロジェクト導入手順を整備"
```

注: Step 2・3 の配置先（moorestech プロジェクト）は mooreseditor リポジトリ外なので git 管理対象外。本コミットは mooreseditor リポジトリ側の成果物（あれば）のみ。差分が無ければコミットは省略してよい。

---

## 完了条件（本計画全体）

- [ ] `ProjectContext` が `<projectDir>/mooreseditor.config.yml` の `plugins:` を抽出し `pluginConfigs` として公開する
- [ ] `usePlugins(pluginConfigs, projectDir)` がプロジェクトオープン後にプラグインをロードする（未オープン時 0 個）
- [ ] `loadPlugin(projectDir, pluginDir)` がプラグインディレクトリをプロジェクト基準で絶対化する
- [ ] Rust の `resolve_plugin_path` / `monorepo_root` が削除され、`cargo build` が警告なく通る
- [ ] 旧 `apps/mooreseditor/mooreseditor.config.yaml` が削除されている
- [ ] `pnpm run type-check` / `lint` / `test` / E2E がすべて成功
- [ ] moorestech プロジェクトに `plugins/node-graph/` が配置され `mooreseditor.config.yml` に `plugins:` が宣言されている
- [ ] `tauri:build` で `.app` が生成される
- [ ] （手動）`.app` で moorestech プロジェクトを開くと Node Graph タブが表示され動作する

## 既知の制約（本計画のスコープ外）

- **`$HOME` 外のプロジェクト:** asset プロトコルスコープの静的 glob は `$HOME/**/plugins/*/dist/**`。`$HOME` 外に置かれたプロジェクトのプラグイン `dist/` は asset スコープ外となり `convertFileSrc` 経由のロードが失敗する。対象ユーザーのプロジェクトは `$HOME` 配下のため本計画では問題にならないが、汎用化するなら `add_project_to_scope` に asset プロトコルスコープの登録を追加する別計画が必要。
- **純 Vite ブラウザ（`pnpm run dev`）でのプラグイン動作:** 純ブラウザは `ProjectContext` が実プロジェクトを開けない（`readTextFile` が Tauri 依存）ため、`pluginConfigs` は常に空でプラグインは 0 個。プラグインの動作確認は `tauri:dev` または ビルド済み `.app` で行う。

## Self-Review メモ

- **Spec coverage:** 「プラグイン宣言をプロジェクト設定へ統合」→ Task 1。「プロジェクト依存ロード」→ Task 2。「プロジェクト基準のパス解決」→ Task 3。「不要 Rust 削除」→ Task 4。「配線・旧設定削除」→ Task 5。「ビルド・導入・検証」→ Task 6。
- **型整合:** `PluginConfigEntry`（`config.ts` 既存・変更なし）を Task 1・2 で一貫使用。`usePlugins(pluginConfigs, projectDir)` の 2 引数（Task 2）と `App.tsx` 呼び出し（Task 5）が一致。`loadPlugin(projectDir, pluginDir)` の 2 引数（Task 3）と `usePlugins` 内呼び出し（Task 2）が一致。`ProjectContextType.pluginConfigs`（Task 1）を `App.tsx`（Task 5）と `App.test.tsx` モック（Task 5）が参照。
- **依存順:** Task 2 と Task 3 は相互依存（`usePlugins` が新 `loadPlugin` を呼ぶ）。実装時は Task 2・3 を連続実装し、Task 3 完了時点で両ファイルの型チェックが通ることを確認する。`App.tsx` 由来の型エラーは Task 5 まで残る想定。
- **リスク:** 最大のリスクは prod (`.app`) のプラグインロードがネイティブウィンドウ操作なしには自動検証できない点。Task 6 Step 6 でユーザーへ手順を引き継ぐ。E2E は Node Graph タブ非依存（4 spec 確認済み）なので新モデルでも 8/8 を維持する見込み。
