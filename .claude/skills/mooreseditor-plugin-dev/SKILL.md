---
name: mooreseditor-plugin-dev
description: mooreseditor（Tauri アプリ）の外部プラグインを作成・ビルド・デプロイ・デバッグする。Use When — 「プラグインを作りたい」「プラグインのビルド方法」「node-graph のような新しいタブを追加」「plugin.json」「PluginManifest」「HostAPI」「プラグインがロードされない」「does not provide an export named エラー」と言われた場合。npm SDK、external starter、共有依存、HostAPI 契約、Tauri FS スコープのトラブルシュートを扱う。
---

# mooreseditor プラグイン開発

## 概要

mooreseditor のプラグインは、ユーザーが開いたプロジェクトから実行時にロードされ、ホストアプリにタブとして追加される独立した React ビュー。新規プラグインは npm 公開済み SDK `@moorestech/mooreseditor-plugin-sdk` と `examples/external-plugin-starter/` を使って、mooreseditor モノレポの外で作る。

ホストはプロジェクトを開いたとき `mooreseditor.config.yml` の `plugins:` 宣言を読み、各プラグインの `plugin.json` と `dist/index.js` を動的 `import()` でロードする。SDK の Vite helper `mooresPlugin(pluginMetadata)` が単体 ESM bundle と `plugin.json` を生成する。

詳細ドキュメント: `docs/plugin-development.md`

## 前提条件

- 新規外部プラグインは `examples/external-plugin-starter/` から作る。
- SDK は npm の `@moorestech/mooreseditor-plugin-sdk` を使い、対象 mooreseditor が同梱する SDK と同じ version を exact pin する。
- 固定リリース向けプラグインでは `^1.0.0` のような範囲指定を避ける。
- 動作確認は `pnpm run tauri:dev` かビルド済み `.app` で行う。純ブラウザ `pnpm run dev` では実プロジェクトを開けず、プラグインデバッグには使えない。
- macOS のビルド済み実アプリがある環境では `/Users/katsumi/moorestech/tools/mac/mooreseditor.app` を使って実操作確認する。
- プラグインの配置先は、最終的に「ユーザーが開く対象プロジェクト」の `plugins/<name>/` 配下。

## 作成手順

### Step 1 — starter を外部リポジトリへコピー

```bash
cp -R examples/external-plugin-starter ../my-mooreseditor-plugin
cd ../my-mooreseditor-plugin
git init
npm install
```

モノレポ内の `plugins/node-graph/` は実装参考には使えるが、新規プラグインの雛形として丸ごとコピーしない。`node-graph` にはモノレポ workspace 前提や専用実装が含まれる。

### Step 2 — SDK version を exact pin

`package.json` の SDK dependency を対象 host に合わせる。

```json
{
  "dependencies": {
    "@moorestech/mooreseditor-plugin-sdk": "1.0.0"
  }
}
```

React/Mantine などのホスト共有依存は `peerDependencies` と `devDependencies` に置き、plugin bundle へ含めない。

### Step 3 — メタデータを設定

`src/pluginMetadata.ts` に id/name/version を置く。これが `plugin.json` と runtime manifest の単一の真実源になる。

```ts
export const pluginMetadata = {
  id: "my-plugin",
  name: "My Plugin",
  version: "0.1.0",
} as const;
```

`plugin.json` は `mooresPlugin(pluginMetadata)` がビルド時に生成する。手書きの `plugin.json` と runtime manifest を二重管理しない。

### Step 4 — エントリ実装

`src/plugin-entry.tsx` は `PluginManifest` を default export する。

```tsx
import { MyPluginView } from "./MyPluginView";
import { pluginMetadata } from "./pluginMetadata";

import type {
  HostAPI,
  PluginManifest,
  PluginView,
} from "@moorestech/mooreseditor-plugin-sdk";

const manifest: PluginManifest = {
  ...pluginMetadata,
  createView(host: HostAPI): PluginView {
    return {
      render: () => <MyPluginView projectDir={host.projectDir} />,
      save: async () => {
        await host.saveProject(host.getColumns());
      },
      isDirty: () => false,
    };
  },
};

export default manifest;
```

実行時に検証される必須フィールドは `id` / `name` / `version` / `createView`。さらに `plugin.json` と runtime manifest の `id/name/version` が一致しないとロード失敗。

### Step 5 — Vite helper でビルド

`vite.config.ts` は SDK の Vite helper を使う。

```ts
import react from "@vitejs/plugin-react";
import { mooresPlugin } from "@moorestech/mooreseditor-plugin-sdk/vite";
import { defineConfig, mergeConfig } from "vite";

import { pluginMetadata } from "./src/pluginMetadata";

export default defineConfig(
  mergeConfig({ plugins: [react()] }, mooresPlugin(pluginMetadata)),
);
```

```bash
npm run build
```

成果物:

- `dist/index.js`
- `dist/index.css`（CSS がある場合）
- `plugin.json`

`mooresPlugin()` は共有依存の external、出力名、`plugin.json` 生成をまとめて設定する。プラグイン側で手動 `EXTERNAL` 配列を書かない。

### Step 6 — 対象プロジェクトへデプロイ

ビルドした `plugin.json` と `dist/` を、ユーザーが開く対象プロジェクト配下へコピーする。

```text
<project>/plugins/my-plugin/
├── plugin.json
└── dist/
    ├── index.js
    └── index.css
```

対象プロジェクトの `mooreseditor.config.yml` に宣言を追加する。

```yaml
plugins:
  - dir: ./plugins/my-plugin
```

現在の production loader は `plugins/<name>` 形式をサポートする。`plugins/foo/bar`、絶対パス、`..` は避ける。

### Step 7 — 動作確認

mooreseditor 側で `pnpm run tauri:dev` を起動し、対象プロジェクトを開く。タブが増えていることを確認する。ロードに失敗すると console に `プラグインのロードに失敗` が出る。

ビルド済み macOS アプリで確認する場合:

```bash
open /Users/katsumi/moorestech/tools/mac/mooreseditor.app --args /path/to/target-project
```

プラグインの `dist/index.js` を更新した直後は WebView が古い JS を保持していることがある。右クリック `Reload` だけで直らない場合は mooreseditor アプリを完全終了して起動し直す。

## Gotchas

### FormView の編集中 draft は完成データとは限らない

`FormView` は enum / switch / object array などの編集途中に、スキーマ上の最終形とは異なる中間データを `onDataChange` へ渡すことがある。例えば discriminated union 相当の `kind` を `oneshot` から `loop` へ変えた瞬間、`kind: "loop"` だが `buttons` がまだ無い draft state がレンダリングに流れる。

ルール:

- `onDataChange` から host へ保存・反映する境界では、ドメイン型の不変条件を正規化してから `setColumns` する。
- グラフ・一覧・派生表示などの render-time derive は、保存済み完全データだけでなく編集中 draft も入力される前提で落ちないようにする。
- ただし Zod / master schema の必須条件を緩めて旧形式互換にしない。draft 耐性はエディタ UI 境界の責務として扱う。
- `state.buttons ?? []` のような対応を入れる場合は、保存データの補完ではなく「編集中 draft を読む派生表示のクラッシュ防止」であることをテスト名やコメントで明確にする。

### 共有依存は SDK Vite helper に寄せる

React・Mantine などはホストとプラグインで同一インスタンスでないと React Context が共有できず UI が壊れる。共有依存の単一の真実源は `packages/plugin-sdk/src/vite/sharedDeps.js`。

現在の主な共有対象:

- `react`
- `react-dom`
- `react/jsx-runtime`
- `@mantine/core`
- `@mantine/hooks`
- `@mantine/notifications`
- `@tabler/icons-react`
- `@xyflow/react`
- `@moorestech/mooreseditor-plugin-sdk`

ルール:

- プラグイン側は必ず `mooresPlugin(pluginMetadata)` を使う。
- 新しい共有パッケージを追加する場合は `packages/plugin-sdk/src/vite/sharedDeps.js` を更新し、mooreseditor モノレポで `pnpm check:plugin-contracts` を通す。
- `does not provide an export named '...'` が出たら、まず SDK helper の適用漏れ、shared deps registry、host の import map を確認する。
- `@tauri-apps/*` は shared deps に入れない。プラグイン専用依存として `dist/index.js` に同梱する。

### HostAPI の状態管理

- `setColumns(action)` は React の `SetStateAction<Column[]>`。値直接渡しと updater 関数の両方を受ける。React component 側へ渡すなら SDK の `createColumnDispatch(host)` を使う。
- `host.schemas` は getter。読むたび最新値が返るが参照が毎回変わりうるため、`useMemo`/`useEffect` の deps に入れない。
- `host.projectDir` / `host.masterDir` は getter。読むたび最新値が返る。
- `saveProject(columns, extraFiles)` は書き込み前に全パスを検証するが、filesystem atomic ではない。途中失敗で partial write になりうる。
- `saveExtraFile` / `readExtraFile` の path は POSIX 区切り `/` の相対パスにする。Windows の `\`、絶対パス、`..` は拒否される。

### PluginView のオプショナルメソッド

`save?` / `isDirty?` / `focusSearchMatch?` / `dispose?` は任意だが、未実装だと意図しない挙動になる。

- `isDirty()` 未実装: タブが常に保存可能扱い。保存不要なビューは `isDirty: () => false` を返す。
- `save()` 未実装: 保存ボタンが実質何もしない。
- `dispose()` は購読解除、タイマー停止、外部リソース解放が必要なビューで実装する。

### `createView` は React の外で呼ばれる

`createView` 内で `useState` / `useRef` などの React hook を呼ばない。ref が必要なら素のミュータブルコンテナ `const handleRef = { current: null }` と callback ref を使う。

### plugin.json のパス解決とセキュリティ

- `mooreseditor.config.yml` の `plugins[].dir` は開いたプロジェクトディレクトリ基準の相対パスとして解決される。
- `dir` に `..` セグメントや絶対パスを書くと `loader.ts` の `resolvePluginDir` で拒否される。
- `plugin.json` の `entry` / `styles` も plugin package 境界内の相対パスとして検証される。
- `mooreseditor.config.yml` が不正な YAML だと `parsePluginConfig` が `[]` を返し、プラグインなしで起動する。

### CSS 注入

- `styles` の CSS は `loader.ts` の `injectPluginStyles` が plugin id 単位の `<link>` として動的注入する。
- クラス名には plugin id を接頭辞として付けるか、Mantine のスタイルシステムを使う。
- ホストの Mantine theme が支配的。プラグインで nested `MantineProvider` は避け、`useMantineTheme()` で実行時にテーマを読む。

### dev と prod の挙動差

| 環境                         | プラグインロード                               | extraFile 保存先         |
| ---------------------------- | ---------------------------------------------- | ------------------------ |
| `pnpm run dev`（純ブラウザ） | 実プロジェクトを開けない                       | なし                     |
| `pnpm run tauri:dev`         | Tauri ランタイムあり、prod と同経路            | 実プロジェクトに書き込み |
| ビルド済み `.app`            | `convertFileSrc` + Tauri FS                    | 実プロジェクトに書き込み |

dev の `/api/dev-fs/*` は E2E 隔離用。`saveExtraFile` の本番挙動は純ブラウザ dev では確認できない。

### Tauri FS スコープ

prod でプラグインファイルが読めない時はここを確認する。

- `apps/mooreseditor/src-tauri/tauri.conf.json` の `assetProtocol.scope`
- `apps/mooreseditor/src-tauri/capabilities/default.json` の `fs:scope`
- `src-tauri/src/lib.rs` の `add_project_to_scope`

設定変更後は Tauri を再ビルドする。

## トラブルシュート早見表

| 症状                                     | 原因と対処                                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `does not provide an export named '...'` | `mooresPlugin()` の適用漏れ、または shared deps registry / host import map の不足を確認           |
| プラグインが0個（タブが増えない）        | 純ブラウザ dev で実行している / `mooreseditor.config.yml` の `plugins:` 漏れ / 不正 YAML          |
| `プラグインのロードに失敗`               | `plugin.json` の `entry`/`styles` パスミス、または対象プロジェクトに `plugin.json`/`dist/` 未配置 |
| prod でファイルが読めない                | Tauri FS スコープ設定 + Tauri 再ビルド                                                            |
| Context not found                        | host-shared 依存が bundle に混入していないか確認                                                  |
| `dist/index.js` を直したのに同じエラー   | WebView が古いプラグイン JS を保持している可能性。右クリック Reload でだめならアプリを完全再起動   |
| FormView 編集直後に派生表示がクラッシュ  | `onDataChange` の中間 draft が完成データでない。保存境界の正規化と render-time derive の耐性を確認 |

## 完成チェックリスト

```text
[ ] npm SDK `@moorestech/mooreseditor-plugin-sdk` を exact pin
[ ] vite.config.ts で `mooresPlugin(pluginMetadata)` を使う
[ ] 手動 EXTERNAL 配列を書いていない
[ ] @tauri-apps/* は shared deps に含めない
[ ] PluginManifest を default export、id/name/version/createView がある
[ ] plugin.json と runtime manifest の id/name/version が一致
[ ] isDirty() / save() を実装（または isDirty: () => false で明示）
[ ] createView 内で React hook を呼んでいない
[ ] React dispatch として渡す場合は createColumnDispatch(host) を使う
[ ] saveExtraFile/readExtraFile のパスは POSIX `/`、相対パス
[ ] 生成された plugin.json を dist/ と一緒に対象プロジェクトへ配置
[ ] 対象プロジェクトの mooreseditor.config.yml に plugins: - dir: を追加
[ ] 動作確認は tauri:dev かビルド済み .app で実施
[ ] dist 更新後の実アプリ確認では必要に応じて mooreseditor を完全再起動
[ ] FormView の onDataChange 経路は中間 draft 入力でもクラッシュしない
```
