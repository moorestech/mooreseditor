---
name: mooreseditor-plugin-dev
description: mooreseditor（Tauri アプリ）のプラグインを作成・ビルド・デプロイ・デバッグする。Use When — 「プラグインを作りたい」「プラグインのビルド方法」「node-graph のような新しいタブを追加」「plugin.json」「PluginManifest」「プラグインがロードされない」「does not provide an export named エラー」と言われた場合。plugins/ 配下の新規プラグイン作成、共有依存(External)同期、HostAPI 契約の実装、Tauri FS スコープのトラブルシュートを扱う。
---

# mooreseditor プラグイン開発

## 概要

mooreseditor のプラグインは「ホストアプリにタブとして追加される独立した React ビュー」。`packages/plugin-sdk` の契約（`PluginManifest` / `HostAPI` / `PluginView`）に従って実装し、SDK の Vite preset `mooresPlugin()` で単体 ESM バンドルと `plugin.json` を生成する。ホストはプロジェクトを開いたとき `mooreseditor.config.yml` の `plugins:` 宣言を読み、動的 `import()` でロードする。実装の生きた手本は `plugins/node-graph/`。

## 前提条件

- 作業対象は mooreseditor モノレポ（pnpm + turbo workspace）。
- 新規プラグインは `plugins/<name>/` に置く。pnpm workspace に `plugins/*` が含まれていることを前提とする。
- 動作確認は `pnpm run tauri:dev` かビルド済み `.app` で行う。**純ブラウザ `pnpm run dev` ではプロジェクトを開けず、プラグインは常に0個になる**（デバッグ不能）。
- プラグインの最終的な配置先は「ユーザーが開く対象プロジェクト」のディレクトリ配下であって、モノレポ内ではない。

## 作成手順

### Step 1 — node-graph を雛形にコピー

```bash
cp -r plugins/node-graph plugins/<name>
rm -rf plugins/<name>/{dist,node_modules,.turbo}
```

`node-graph` は forwardRef・HostAPI 保存・React Flow 初期化など実装パターンが詰まっているので、ゼロから書くより必ずコピーから始める。

### Step 2 — メタファイルを書き換える

`plugins/<name>/package.json` の `"name"` を `@mooreseditor/plugin-<name>` に変更。

`src/pluginMetadata.ts` にメタデータを置く:

```ts
export const pluginMetadata = {
  id: "<name>",
  name: "表示名",
  version: "0.1.0",
} as const;
```

`plugin.json` は `mooresPlugin(pluginMetadata)` がビルド時に生成する。手書きの `plugin.json` と runtime manifest を二重管理しない。

### Step 3 — エントリ実装（`src/plugin-entry.tsx`）

`PluginManifest` を **default export** する。これがビルドのエントリ（vite.config.ts の `build.lib.entry`）。

```tsx
import type {
  HostAPI,
  PluginManifest,
  PluginView,
} from "@mooreseditor/plugin-sdk";
import { pluginMetadata } from "./pluginMetadata";

const manifest: PluginManifest = {
  ...pluginMetadata,
  createView(host: HostAPI): PluginView {
    return {
      render: () => <MyView /* host を props で渡す */ />,
      save: async () => {
        /* host.saveProject(...) */
      },
      isDirty: () => false,
    };
  },
};
export default manifest;
```

実行時に検証される必須フィールドは `id` / `name` / `version` / `createView`。さらに `plugin.json` と runtime manifest の `id/name/version` が一致しないとロード失敗。

### Step 4 — ビルド

`vite.config.ts` は SDK preset を使う:

```ts
import react from "@vitejs/plugin-react";
import { mooresPlugin } from "@mooreseditor/plugin-sdk/vite";
import { defineConfig, mergeConfig } from "vite";

import { pluginMetadata } from "./src/pluginMetadata";

export default defineConfig(
  mergeConfig({ plugins: [react()] }, mooresPlugin(pluginMetadata)),
);
```

```bash
pnpm --filter @mooreseditor/plugin-<name> run build       # dist/index.js, index.css を生成
pnpm --filter @mooreseditor/plugin-<name> run type-check
pnpm --filter @mooreseditor/plugin-<name> run lint
```

`mooresPlugin()` は共有依存の `external`、出力名、`plugin.json` 生成をまとめて設定する。

### Step 5 — 対象プロジェクトへデプロイ

ビルドした `plugin.json` と `dist/` を、ユーザーが開く対象プロジェクトの配下にコピーする:

```
<project>/plugins/<name>/
├── plugin.json
└── dist/index.js, index.css
```

対象プロジェクトの `mooreseditor.config.yml` に宣言を追加:

```yaml
plugins:
  - dir: ./plugins/<name> # config.yml からの相対パス
```

### Step 6 — 動作確認

`pnpm run tauri:dev` でホストを起動 → 対象プロジェクトを開く → タブが増えていることを確認。ロードに失敗すると console に `プラグインのロードに失敗` が出る（プラグイン1個の失敗は致命的でなく、他は続行される）。

## Gotchas

### 🔴 共有依存は SDK Vite preset に寄せる

React・Mantine 等は「ホストとプラグインで同一インスタンス」でないと React Context が共有できず UI が壊れる。以下3ファイルの依存リストを**完全一致**させる:

| ファイル                                                            | 役割                                |
| ------------------------------------------------------------------- | ----------------------------------- |
| `packages/plugin-sdk/src/vite/sharedDeps.js`                        | shared deps の単一の真実源          |
| `apps/mooreseditor/vite-plugins/pluginFsPlugin.ts`                  | import map と `/shared/*` を生成    |
| `plugins/<name>/vite.config.ts`                                     | `mooresPlugin()` を呼ぶだけ         |

現在の共有対象: `react`, `react-dom`, `react/jsx-runtime`, `@mantine/core`, `@mantine/hooks`, `@mantine/notifications`, `@tabler/icons-react`, `@xyflow/react`, `@mooreseditor/plugin-sdk`。

- プラグイン側は手動 `EXTERNAL` 配列を書かず、必ず `mooresPlugin(pluginMetadata)` を使う。
- 新しい共有パッケージ（例 `@mantine/dates`）を使うなら `sharedDeps.js` に追加し、`pnpm check:plugin-contracts` で host/plugin/sdk の version contract を確認する。
- `does not provide an export named '...'` が出たら、まず shared deps registry と plugin build preset の適用漏れを疑う。
- **逆に `@tauri-apps/*` は EXTERNAL に入れない**。これはプラグイン専用依存として `dist/index.js` に同梱する（`window.__TAURI__` 経由で動くので二重インスタンス問題がない）。

### 🟠 HostAPI の状態管理の癖（`pluginHost/hostApi.ts`）

- **`setColumns(action)` は React の `SetStateAction<Column[]>`**。値直接渡しと updater 関数の両方を受ける。React component 側へ渡すなら SDK の `createColumnDispatch(host)` を使う。
- **`host.schemas` は getter**。読むたび最新値が返るが参照が毎回変わりうる → `useMemo`/`useEffect` の deps に入れない。
- **`host.projectDir` / `host.masterDir` は getter**。読むたび最新値が返る。
- **`saveProject(columns, extraFiles)` は書き込み前に全パスを検証するが、filesystem atomic ではない**。途中失敗で partial write になりうる。reject されたらユーザーに再試行させる。
- `saveExtraFile`/`readExtraFile` の `relativePath` は **POSIX 区切り `/` のみ**。Windows の `\`、絶対パス、`..` は検証で拒否される。

### 🟠 PluginView のオプショナルメソッド

`save?` / `isDirty?` / `focusSearchMatch?` は任意だが、未実装だと意図しない挙動になる:

- **`isDirty()` 未実装 → タブが常に「保存可能」扱い**（ホスト側 `canSave: isDirty ?? true`）。未保存変更がないのに保存ボタンが活性化する。保存不要なビューは必ず `isDirty: () => false` を返す。
- **`save()` 未実装 → 保存ボタンが無反応**（`Promise.resolve()` で即完了）。
- **`dispose()` は任意**。購読解除、タイマー停止、外部リソース解放が必要なビューは実装する。ホストはプラグインが外れたときに呼ぶ。

### 🟠 `createView` は React の外で呼ばれる

`createView` 内で `useState`/`useRef` 等の hook を呼んではいけない。ref が必要なら node-graph のように素のミュータブルコンテナ `const handleRef = { current: null }` + コールバック ref を使う。

### 🟡 plugin.json のパス解決とセキュリティ

- `mooreseditor.config.yml` の `plugins[].dir` は**開いたプロジェクトディレクトリ基準の相対パス**として解決される。
- `dir` に `..` セグメントや絶対パスを書くと `loader.ts` の `resolvePluginDir` で拒否される → プラグインはプロジェクト配下にしか置けない。
- `plugin.json` の `entry` / `styles` も plugin package 境界内の相対パスとして検証される。空パス、絶対パス、`..` traversal は拒否される。
- `mooreseditor.config.yml` が不正な YAML だと `parsePluginConfig` が `[]` を返し、プラグインなしで起動する（エラーで落ちはしない）。

### 🟡 CSS 注入

- `styles` の CSS は `loader.ts` の `injectPluginStyles` が plugin id 単位の `<link>` として動的注入する。同じ plugin id + href の重複注入は避ける。
- 対策: クラス名にプラグイン id を接頭辞（`plugin-<name>__...`）、または Mantine のスタイルシステムを使う。
- ホストの Mantine theme（`primaryColor: "orange"`）が支配的。プラグインで nested `MantineProvider` は避け、`useMantineTheme()` で実行時にテーマを読む。

### 🟡 dev と prod の挙動差

| 環境                         | プラグインロード                               | extraFile 保存先         |
| ---------------------------- | ---------------------------------------------- | ------------------------ |
| `pnpm run dev`（純ブラウザ） | 実プロジェクトを開けない。サンプルプロジェクトにはプラグイン宣言なし | —                        |
| `pnpm run tauri:dev`         | Tauri ランタイムあり → prod と同経路           | 実プロジェクトに書き込み |
| ビルド済み `.app`            | `convertFileSrc`（asset プロトコル）+ Tauri FS | 実プロジェクトに書き込み |

- dev の `/api/dev-fs/*` は `tmp/e2e-output/` 配下に書く（E2E 隔離用）ため、`saveExtraFile` の本番挙動は純ブラウザ dev では確認できない。

### 🟡 Tauri FS スコープ（prod のみ効く）

prod でプラグインファイルが読めない時はここ:

- `apps/mooreseditor/src-tauri/tauri.conf.json` の `assetProtocol.scope`（読み取り用、`$HOME/**/plugins/*/dist/**` 等）。
- `apps/mooreseditor/src-tauri/capabilities/default.json` の `fs:scope`（読み書き用、`**/plugins/**` / `**/.mooreseditor/**`）。
- プロジェクトを開くと `add_project_to_scope`（`src-tauri/src/lib.rs`）がプロジェクト全体を再帰的にスコープ追加する。
- **これらの設定を変えたら Tauri を再ビルドしないと反映されない**（`tauri:dev` は毎回 Rust ビルドされるので影響なし）。

### 🟢 ビューの遅延マウント

`App.tsx` はプラグインビューを「初めてアクティブ化されるまで DOM に追加しない」（`@xyflow/react` がサイズ0で初期化されレイアウト崩壊するのを防ぐため）。プラグインは「初回アクティブ化まで `render()` が呼ばれない」前提で設計する。一度表示されたら以後は `display:none` で隠すだけ（内部状態は保持）。

## トラブルシュート早見表

| 症状                                     | 原因と対処                                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `does not provide an export named '...'` | `mooresPlugin()` の適用漏れ、または shared deps registry の不足を確認                              |
| プラグインが0個（タブが増えない）        | 純ブラウザ dev で実行している / `mooreseditor.config.yml` の `plugins:` 漏れ / 不正 YAML          |
| `プラグインのロードに失敗` (console)     | `plugin.json` の `entry`/`styles` パスミス、または対象プロジェクトに `plugin.json`/`dist/` 未配置 |
| prod でファイルが読めない                | Tauri FS スコープ設定 + Tauri 再ビルド                                                            |
| Context not found（notification 等）     | ホスト側 `NotificationProvider` の外でフックを呼んでいる                                          |

## 完成チェックリスト

```
[ ] vite.config.ts で `mooresPlugin(pluginMetadata)` を使う
[ ] `pnpm check:plugin-contracts` が通る
[ ] @tauri-apps/* は EXTERNAL に含めない（プラグインに同梱）
[ ] PluginManifest を default export、id/name/version/createView がある
[ ] plugin.json と runtime manifest の id/name/version が一致
[ ] isDirty() / save() を実装（または isDirty: () => false で明示）
[ ] createView 内で React hook を呼んでいない
[ ] React dispatch として渡す場合は createColumnDispatch(host) を使う
[ ] saveExtraFile/readExtraFile のパスは POSIX `/`、相対パス
[ ] 生成された plugin.json を dist/ と一緒に対象プロジェクトへ配置
[ ] 対象プロジェクトの mooreseditor.config.yml に plugins: - dir: を追加
[ ] 動作確認は tauri:dev かビルド済み .app で実施
```
