# ノードグラフのプラグイン化 Phase 3 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `plugins/node-graph` を `react`/Mantine/`@xyflow/react`/SDK を external にした単体 ESM バンドルとして出力し、`mooreseditor.config.yaml` で指定したディレクトリから起動時に動的ロードする。`React.lazy` 静的 import を撤廃する。

**Architecture:** プラグインを Vite library mode + `rollupOptions.external` で単体バンドル化し、`plugin.json` マニフェストを生成する。ホストは `index.html` の import map で共有依存（React/Mantine/xyflow/SDK）を 1 インスタンスに解決する。`pluginHost/` が `mooreseditor.config.yaml` → 各プラグインの `plugin.json` → エントリ JS の動的 `import()` を行い、`PluginManifest.createView(HostAPI)` で得た `PluginView` を Phase 1 の ViewRegistry へタブ登録する。dev/prod のロード差分は try-catch フォールバックで吸収する。

**Tech Stack:** Vite library mode / Rollup external / ES Module import maps / Tauri `convertFileSrc` / YAML

設計ドキュメント: `docs/superpowers/specs/2026-05-20-node-graph-plugin-design.md`（§3.1-3.3）

---

## ⚠️ 実行前提

- **Phase 1・Phase 2 がともに master にマージ済みであること。**
- Phase 2 完了時点で `plugins/node-graph/` が独立パッケージとして存在し、`@mooreseditor/plugin-sdk`
  のみに依存し、`App.tsx` が `React.lazy` でこれを静的 import している状態を前提とする。
- 本計画のパスは Phase 2 完了後の状態を前提とする。各タスク開始時に対象の存在を再検証する。

## 前提と共通ルール

- 作業ブランチ: master から `feature/plugin-runtime-phase3` を切る。
- 検証コマンド（ルート）: `pnpm run type-check` / `pnpm run lint` / `pnpm run test` / `pnpm run test:e2e -- --reporter=list`
- ランタイムロードは Tauri webview（Chromium）と Vite dev の両方で動く必要がある。
  環境判定 if は使わず **try-catch フォールバック**で実装する（CLAUDE.md 規約）。
- コミットはタスクごと。メッセージ末尾に `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`。

## 設計上の確定事項

- **共有依存（external）:** `react`, `react-dom`, `react/jsx-runtime`, `@mantine/core`,
  `@mantine/hooks`, `@mantine/notifications`, `@tabler/icons-react`, `@xyflow/react`,
  `@mooreseditor/plugin-sdk`。これらはプラグインにバンドルせず、
  ホストの import map で解決する。→ React 二重インスタンス問題の回避。
  なお、SDK の推移的依存グラフはバンドルアナライザ（`rollup-plugin-visualizer` 等）で確認し、
  external 一覧・import map・`peerDependencies` を常に同期させること（Task 2 参照）。
- **プラグイン成果物:** `dist/index.js`（単体 ESM）+ 付随 CSS + `plugin.json`。
- **ロードフロー:** `mooreseditor.config.yaml` 読込 → `plugins[].dir` ごとに `plugin.json` 読込 →
  `entry` の JS を動的 `import()` → `default` export（`PluginManifest`）を取得 → ViewRegistry へ登録。
- **dev:** Vite dev サーバ経由でプラグイン JS を配信。**prod:** Tauri `convertFileSrc` で
  `asset://` URL 化して `import()`。

## File Structure

| パス                                               | 責務                                            | 操作 |
| -------------------------------------------------- | ----------------------------------------------- | ---- |
| `plugins/node-graph/vite.config.ts`                | プラグインの library ビルド設定                 | 新規 |
| `plugins/node-graph/plugin.json`                   | プラグインマニフェスト                          | 新規 |
| `plugins/node-graph/src/plugin-entry.tsx`          | `PluginManifest` を default export するエントリ | 新規 |
| `apps/mooreseditor/mooreseditor.config.yaml`       | プラグインディレクトリ指定                      | 新規 |
| `apps/mooreseditor/index.html`                     | import map                                      | 更新 |
| `apps/mooreseditor/src/pluginHost/config.ts`       | config.yaml 読込                                | 新規 |
| `apps/mooreseditor/src/pluginHost/loader.ts`       | plugin.json 読込 + 動的 import                  | 新規 |
| `apps/mooreseditor/src/pluginHost/hostApi.ts`      | `HostAPI` 実装の生成                            | 新規 |
| `apps/mooreseditor/src/pluginHost/usePlugins.ts`   | プラグインロードを束ねるフック                  | 新規 |
| `apps/mooreseditor/vite-plugins/pluginFsPlugin.ts` | プラグイン専用 dev 配信エンドポイント           | 新規 |
| `apps/mooreseditor/src/App.tsx`                    | ViewRegistry へプラグイン登録、lazy 撤廃        | 更新 |
| `apps/mooreseditor/src-tauri/`                     | FS スコープにプラグイン dir 追加                | 更新 |

---

## Task 0: 技術検証 PoC（実装着手前の必須ゲート）

Phase 3 が扱う技術要素（import map + 動的 `import()`・`/shared/*.js` ブリッジ・CSS ロード・
プラグイン配信エンドポイント）はいずれも Vite の挙動に強く依存し、前提が崩れると全体が機能しない。
Task 1 以降の実装に入る前に、以下の 4 点を使い捨ての最小プラグインで検証し、全て成立することを
確認してから進む。

**Files（PoC 専用、検証後に削除可）:**

- `apps/mooreseditor/poc-plugin/poc.js`（最小 ESM、`import "react"` するだけ）
- `apps/mooreseditor/vite-plugins/pluginFsPlugin.ts`（専用配信エンドポイントの初期実装）

- [ ] **Step 1: React インスタンス同一性の検証**

  import map + Tauri asset protocol（または dev サーバ）+ 動的 `import()` の組合せで、
  ホスト側の React インスタンスとプラグイン側の React インスタンスが同一オブジェクトであることを
  確認する。

  検証手順:

  1. `poc-plugin/poc.js` を `export { default as React } from "react"` のみの ESM として作成する。
  2. `index.html` の import map に `"react": "/shared/react.js"` を 1 エントリだけ追加する。
  3. ホスト側で `import React from "react"` し、`window.__hostReact = React` とセットする。
  4. `import(/* @vite-ignore */ url)` で poc.js をロードし、返ってきた `React` オブジェクトと
     `window.__hostReact` を `===` 比較する。
  5. `true` なら成功。`false` なら import map の解決方式を見直す（Task 3 の方針変更が必要）。

  Exit criteria: `pocReact === window.__hostReact` が `true`。

- [ ] **Step 2: `/shared/*.js` ブリッジの安定性確認**

  `/shared/react.js` が `vite build` 後にも確定的な URL として出力され、かつ dev と prod で
  同一のモジュールインスタンスを返すことを確認する。

  1. `vite build` を実行し、`dist/shared/react.js`（または相当するパス）が出力されることを確認。
  2. Tauri prod 環境で `convertFileSrc` 経由の URL と `/shared/react.js` URL の両方から同一
     インスタンスが返ることを確認。

  Exit criteria: dev / prod 双方で React インスタンス同一性が確認できる。

- [ ] **Step 3: プラグイン CSS ロード方式の確認**

  `plugin.json` の `styles` フィールドに列挙された CSS を `<link rel="stylesheet">` として
  動的挿入する最小実装を試作し、xyflow の CSS がノードグラフ表示に正しく適用されることを確認する。

  Exit criteria: xyflow CSS を動的 `<link>` で注入した状態でノードが正常描画される。

- [ ] **Step 4: 専用プラグイン配信エンドポイントの確認**

  プラグインファイルを dev サーバで配信するための専用エンドポイント（後述 Task 6 参照）を
  最小実装し、`/api/plugin-fs/read?path=<absPath>` が許可ルート内のファイルを返すことを確認する。
  既存の `/api/dev-fs/` エンドポイントは `tmp/e2e-output` に限定されており流用できない。

  Exit criteria: プラグインディレクトリのファイルが `/api/plugin-fs/` 経由で取得できる。

- [ ] **Step 5: PoC 成果のまとめと Task 1〜8 への反映**

  上記 4 点が全て成立したら、PoC で得た設定値・URLパターン・Vite プラグインの具体的な実装を
  Task 1〜8 の該当箇所へ転記する。未解決の場合は設計を見直してから先に進む。

  Exit criteria: 4 つの PoC が全て成立し、Task 1 着手が承認された状態。

- [ ] **Step 6: コミット（PoC 実装を保存、または cleanup）**

```bash
git add apps/mooreseditor/vite-plugins/pluginFsPlugin.ts
# poc-plugin は削除 or .gitignore してよい
git commit -m "chore: Phase 3 技術検証 PoC（import map / CSS / plugin-fs エンドポイント）"
```

---

## Task 1: プラグインエントリ（`PluginManifest`）の作成

プラグインが `PluginManifest` を default export する形へ整える。

**Files:**

- Create: `plugins/node-graph/src/plugin-entry.tsx`

- [ ] **Step 1: 作業ブランチ作成**

```bash
git checkout master && git checkout -b feature/plugin-runtime-phase3
```

- [ ] **Step 2: `plugin-entry.tsx` を作成**

`plugins/node-graph/src/plugin-entry.tsx`。Phase 2 までは `index.tsx` が `NodeEditorView`
コンポーネントを default export していた。これを `PluginManifest` を default export する形に包む:

```tsx
import type {
  HostAPI,
  PluginManifest,
  PluginView,
} from "@mooreseditor/plugin-sdk";

import NodeEditorView from "./index";

const manifest: PluginManifest = {
  id: "node-graph",
  name: "Node Graph",
  version: "0.1.0",
  createView(host: HostAPI): PluginView {
    // NodeEditorView は ref で save()/focusSearchMatch() を公開する。
    // createView では ref を内部保持し、PluginView の各メソッドへ橋渡しする。
    let handle: {
      save: () => void;
      focusSearchMatch: (e: HTMLElement | null) => void;
    } | null = null;

    return {
      render: () => (
        <NodeEditorView
          ref={(h) => {
            handle = h;
          }}
          host={host}
        />
      ),
      save: async () => {
        handle?.save();
      },
      focusSearchMatch: (element) => {
        handle?.focusSearchMatch(element);
      },
    };
  },
};

export default manifest;
```

注: `NodeEditorView` の props は Phase 2 時点で `HostAPI` ベースに整理されている前提。
そうなっていない場合（Phase 0 の `NodeEditorViewProps` の個別 props 形が残っている場合）は、
本 Step で `host` から個別 props へ展開するアダプタを `plugin-entry.tsx` 内に書く。

- [ ] **Step 3: 型チェック**

```bash
pnpm --filter @mooreseditor/plugin-node-graph run type-check
```

Expected: 成功。

- [ ] **Step 4: コミット**

```bash
git add plugins/node-graph/src/plugin-entry.tsx
git commit -m "feat: ノードグラフプラグインの PluginManifest エントリを追加"
```

---

## Task 2: プラグインの単体バンドルビルド構成

`plugins/node-graph` を external 指定の単体 ESM としてビルドし、`plugin.json` を出力する。

**Files:**

- Create: `plugins/node-graph/vite.config.ts`, `plugins/node-graph/plugin.json`
- Modify: `plugins/node-graph/package.json`（`build` スクリプト追加）

- [ ] **Step 1: `plugins/node-graph/vite.config.ts` を作成**

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const EXTERNAL = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "@mantine/core",
  "@mantine/hooks",
  "@mantine/notifications",
  "@tabler/icons-react",
  "@xyflow/react",
  "@mooreseditor/plugin-sdk",
];

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: "src/plugin-entry.tsx",
      formats: ["es"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      external: EXTERNAL,
    },
    outDir: "dist",
    emptyOutDir: true,
  },
});
```

注: `html-to-image` は external にしない（プラグイン専用依存なのでバンドルに含める）。

**依存グラフの完全性確認（必須）:** SDK（`@mooreseditor/plugin-sdk`）が推移的に参照するパッケージが
`EXTERNAL` に漏れると、そのパッケージがプラグインバンドルと二重インスタンス化する。
ビルド後に `rollup-plugin-visualizer`（または `pnpm --filter plugin-node-graph exec rollup-plugin-analyzer`）
でバンドルの中身を確認し、`EXTERNAL` に未列挙の共有パッケージが混入していないことを検証する。
新たに共有すべきパッケージが見つかった場合は `EXTERNAL` 一覧・Task 3 の import map・
SDK の `peerDependencies` をあわせて更新すること。

- [ ] **Step 2: `plugin.json` マニフェストを作成**

`plugins/node-graph/plugin.json`:

```json
{
  "id": "node-graph",
  "name": "Node Graph",
  "version": "0.1.0",
  "entry": "dist/index.js",
  "styles": ["dist/index.css"]
}
```

注: `styles` はプラグインがロード時に必要な CSS ファイルのリスト。Vite library mode は
`@xyflow/react` 等の CSS を `dist/index.css`（または複数ファイル）として出力する。
ホストはこのリストの各エントリを `<link rel="stylesheet" href="...">` として `<head>` へ
動的挿入する（Task 6 のローダが担当）。実際の出力ファイル名はビルド後に確認して調整すること。

- [ ] **Step 3: `package.json` に build スクリプトを追加**

`plugins/node-graph/package.json` の `scripts` に追加:

```json
    "build": "vite build",
```

`devDependencies` に `vite` `@vitejs/plugin-react` を追加（バージョンはアプリと揃える）。

- [ ] **Step 4: ビルド実行**

```bash
pnpm install
pnpm --filter @mooreseditor/plugin-node-graph run build
```

Expected: `plugins/node-graph/dist/index.js` が生成される。

- [ ] **Step 5: バンドルに React が含まれていないことを確認**

```bash
grep -c "createElement" plugins/node-graph/dist/index.js
node -e "const s=require('fs').readFileSync('plugins/node-graph/dist/index.js','utf8'); console.log(/from\s*[\"']react[\"']/.test(s) ? 'OK: react is external' : 'WARN: react may be bundled')"
```

Expected: バンドル内で `react` が import 文として残っている（= external 化成功）。
React 本体のコード（`useState` 実装等）が同梱されていないこと。

- [ ] **Step 6: コミット**

```bash
git add plugins/node-graph/vite.config.ts plugins/node-graph/plugin.json plugins/node-graph/package.json pnpm-lock.yaml
echo "plugins/node-graph/dist/" >> .gitignore
git add .gitignore
git commit -m "build: ノードグラフプラグインの単体バンドル構成を追加"
```

---

## Task 3: ホストの import map 設定

共有依存を 1 インスタンスに解決する import map をホストの `index.html` に追加する。

**Files:**

- Modify: `apps/mooreseditor/index.html`
- Modify: `apps/mooreseditor/vite.config.ts`

- [ ] **Step 1: 共有依存をホストから配信する仕組みを用意**

ホストは `react` 等を自身のバンドルに持つ。プラグインの `import "react"` を、ホストが配信する
単一モジュール URL へ向ける import map を `index.html` の `<head>` に追加する:

```html
<script type="importmap">
  {
    "imports": {
      "react": "/shared/react.js",
      "react-dom": "/shared/react-dom.js",
      "react/jsx-runtime": "/shared/react-jsx-runtime.js",
      "@mantine/core": "/shared/mantine-core.js",
      "@mantine/hooks": "/shared/mantine-hooks.js",
      "@mantine/notifications": "/shared/mantine-notifications.js",
      "@tabler/icons-react": "/shared/tabler-icons-react.js",
      "@xyflow/react": "/shared/xyflow-react.js",
      "@mooreseditor/plugin-sdk": "/shared/plugin-sdk.js"
    }
  }
</script>
```

注: import map の内容は Task 2 の `EXTERNAL` 配列と必ず一致させること。新たな共有依存が
`EXTERNAL` に追加された場合はここにも同時に追記する。

- [ ] **Step 2: `/shared/*` を供給する Vite プラグインを追加**

`apps/mooreseditor/vite.config.ts` に、`/shared/<name>.js` リクエストに対し当該モジュールを
ESM 再 export する仮想モジュールを返すプラグインを追加する。dev では `resolve` 経由、
prod（`vite build`）では `/shared/*.js` を実ファイルとして出力するよう
`rollupOptions.input` に追加する。

実装方針: 各 `/shared/<name>.js` の中身は `export * from "<name>"; export { default } from "<name>";`
の仮想ソースとし、Vite のバンドルに同梱させる。これによりホストとプラグインが同一インスタンスを共有する。

注: この Task は Vite の挙動依存が大きい。Task 0 の PoC（Step 1-2）でインスタンス同一性が
確認済みであることを前提とする。未確認の場合は Task 0 へ戻ること。

- [ ] **Step 3: 検証**

```bash
pnpm run dev
```

`http://localhost:1420/shared/react.js` がブラウザで取得でき、ESM として評価できることを
`browser_navigate` + `browser_console_messages` で確認。

- [ ] **Step 4: コミット**

```bash
git add apps/mooreseditor/index.html apps/mooreseditor/vite.config.ts
git commit -m "feat: 共有依存解決のための import map とブリッジを追加"
```

---

## Task 4: `mooreseditor.config.yaml` と config ローダ

プラグインディレクトリを宣言する設定ファイルと、その読込ロジックを作る。

**Files:**

- Create: `apps/mooreseditor/mooreseditor.config.yaml`
- Create: `apps/mooreseditor/src/pluginHost/config.ts`
- Test: `apps/mooreseditor/src/pluginHost/config.test.ts`

- [ ] **Step 1: `mooreseditor.config.yaml` を作成**

`apps/mooreseditor/mooreseditor.config.yaml`:

```yaml
# mooreseditor が起動時に読み込むプラグインの宣言。
plugins:
  - dir: ./plugins/node-graph
```

- [ ] **Step 2: 失敗するテストを書く**

`apps/mooreseditor/src/pluginHost/config.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { parsePluginConfig } from "./config";

describe("parsePluginConfig", () => {
  it("plugins 配列の dir を抽出する", () => {
    const yaml = "plugins:\n  - dir: ./plugins/node-graph\n";
    const result = parsePluginConfig(yaml);
    expect(result).toEqual([{ dir: "./plugins/node-graph" }]);
  });

  it("plugins が無いとき空配列を返す", () => {
    expect(parsePluginConfig("other: 1\n")).toEqual([]);
  });

  it("不正な YAML のとき空配列を返す", () => {
    expect(parsePluginConfig(":::not yaml:::")).toEqual([]);
  });
});
```

- [ ] **Step 3: テストが失敗することを確認**

```bash
pnpm run test -- pluginHost/config
```

Expected: FAIL（`parsePluginConfig` 未定義）。

- [ ] **Step 4: `config.ts` を実装**

`apps/mooreseditor/src/pluginHost/config.ts`。YAML パースには軽量ライブラリ（`yaml`）を
`apps/mooreseditor/package.json` に追加して使う:

```ts
import { parse } from "yaml";

export interface PluginConfigEntry {
  dir: string;
}

/** mooreseditor.config.yaml の文字列から plugins[].dir を抽出する。 */
export function parsePluginConfig(yamlText: string): PluginConfigEntry[] {
  try {
    const doc = parse(yamlText) as { plugins?: { dir?: string }[] } | null;
    const plugins = doc?.plugins;
    if (!Array.isArray(plugins)) {
      return [];
    }
    return plugins
      .filter((p): p is { dir: string } => typeof p?.dir === "string")
      .map((p) => ({ dir: p.dir }));
  } catch {
    return [];
  }
}
```

- [ ] **Step 5: テストが通ることを確認**

```bash
pnpm install
pnpm run test -- pluginHost/config
```

Expected: PASS（3 テスト）。

- [ ] **Step 6: コミット**

```bash
git add -A
git commit -m "feat: mooreseditor.config.yaml と config ローダを追加"
```

---

## Task 5: HostAPI 実装の生成

ホスト側の状態（columns / schemas / project dir / 保存）をプラグインへ渡す `HostAPI` 実装を作る。

**Files:**

- Create: `apps/mooreseditor/src/pluginHost/hostApi.ts`

- [ ] **Step 1: `hostApi.ts` を実装**

`apps/mooreseditor/src/pluginHost/hostApi.ts`。`App.tsx` が持つ state とハンドラを束ねて
`HostAPI`（Phase 2 で SDK に定義）を生成する関数を作る:

```ts
import type { Column, HostAPI, Schema } from "@mooreseditor/plugin-sdk";

interface CreateHostApiDeps {
  getColumns: () => Column[];
  setColumns: (updater: (columns: Column[]) => Column[]) => void;
  schemas: Record<string, Schema>;
  loadSchema: (name: string) => Promise<Schema | null>;
  projectDir: string | null;
  masterDir: string | null;
  markDirty: () => void;
  saveExtraFile: (relativePath: string, content: string) => Promise<void>;
  readExtraFile: (relativePath: string) => Promise<string | null>;
}

export function createHostApi(deps: CreateHostApiDeps): HostAPI {
  return {
    getColumns: deps.getColumns,
    setColumns: deps.setColumns,
    schemas: deps.schemas,
    loadSchema: deps.loadSchema,
    projectDir: deps.projectDir,
    masterDir: deps.masterDir,
    markDirty: deps.markDirty,
    saveExtraFile: deps.saveExtraFile,
    readExtraFile: deps.readExtraFile,
  };
}
```

- [ ] **Step 2: `saveExtraFile` / `readExtraFile` の実装**

`.mooreseditor/<relativePath>` への書込/読込を担う関数を実装する。Phase 0 の
`saveProjectData` にあった「`.mooreseditor` ディレクトリを Tauri FS スコープへ追加」
「`nodeGraph.v1.json` 書込」ロジックを汎用化して流用する。dev は dev サーバ経由、
prod は Tauri FS を try-catch フォールバックで使い分ける。

- [ ] **Step 3: 型チェック**

```bash
pnpm run type-check
```

Expected: 成功。

- [ ] **Step 4: コミット**

```bash
git add apps/mooreseditor/src/pluginHost/hostApi.ts
git commit -m "feat: プラグインへ渡す HostAPI 実装を追加"
```

---

## Task 6: プラグインローダの実装

`plugin.json` を読み、エントリ JS を動的 import して `PluginManifest` を取得するローダを作る。

> **⚠️ devFsPlugin の流用禁止:** 既存の `/api/dev-fs/` エンドポイント（`devFsPlugin.ts`）は
> `tmp/e2e-output` に許可ルートを限定しており、絶対パスをパストラバーサルとして拒否する。
> プラグインファイルの配信には **専用エンドポイント `/api/plugin-fs/`** を使う。
> このエンドポイントは許可ルートをプラグインディレクトリ群（またはワークスペースルート）に
> 限定した別の Vite プラグイン（`pluginFsPlugin.ts`）として実装する。
> Task 0 Step 4 でこのエンドポイントの初期実装が PoC 済みであることを前提とする。

**Files:**

- Create: `apps/mooreseditor/src/pluginHost/loader.ts`
- Create: `apps/mooreseditor/src/pluginHost/usePlugins.ts`
- Create/Modify: `apps/mooreseditor/vite-plugins/pluginFsPlugin.ts`（専用プラグイン配信エンドポイント）

- [ ] **Step 0: `pluginFsPlugin.ts` を実装（Task 0 PoC を本実装へ昇格）**

  `apps/mooreseditor/vite-plugins/pluginFsPlugin.ts` を実装する。要件:

  - エンドポイント: `/api/plugin-fs/read?path=<absPath>`（テキスト返却）
    および `/api/plugin-fs/file?path=<absPath>`（バイナリ配信・JS/CSS）
  - 許可ルート: `plugins/` ディレクトリ（monorepo ルート配下）に限定する。
    `path.resolve` で正規化し、許可ルート外はすべて 403 を返す。
  - `devFsPlugin.ts` を修正せず、**同名の sibling ファイル**として新規作成する。
  - `vite.config.ts` で `devFsPlugin` の後に追加する。

- [ ] **Step 1: `loader.ts` を実装**

`apps/mooreseditor/src/pluginHost/loader.ts`。1 プラグインディレクトリを受け取り、
`plugin.json` 読込 → CSS 注入 → エントリ JS の動的 import → `PluginManifest` 返却を行う:

```ts
import type { PluginManifest } from "@mooreseditor/plugin-sdk";

interface PluginJson {
  id: string;
  name: string;
  version: string;
  entry: string;
  styles?: string[];
}

/** プラグインディレクトリからファイルテキストを読む（dev/prod フォールバック）。 */
async function readPluginText(absPath: string): Promise<string> {
  // prod: Tauri FS、失敗時 dev: fetch（CLAUDE.md の try-catch 規約）
  try {
    const { readTextFile } = await import("@tauri-apps/plugin-fs");
    return await readTextFile(absPath);
  } catch {
    // dev: 専用プラグイン配信エンドポイント（/api/dev-fs/ は流用不可）
    const res = await fetch(
      `/api/plugin-fs/read?path=${encodeURIComponent(absPath)}`,
    );
    if (!res.ok) throw new Error(`plugin read failed: ${absPath}`);
    return await res.text();
  }
}

/** プラグインエントリ JS の import 用 URL を解決する（dev/prod フォールバック）。 */
async function resolveEntryUrl(entryAbsPath: string): Promise<string> {
  try {
    const { convertFileSrc } = await import("@tauri-apps/api/core");
    return convertFileSrc(entryAbsPath);
  } catch {
    return `/api/plugin-fs/file?path=${encodeURIComponent(entryAbsPath)}`;
  }
}

/** plugin.json の styles フィールドの CSS を <link> として動的注入する。 */
function injectPluginStyles(pluginDir: string, styles: string[]): void {
  for (const stylePath of styles) {
    const href = `/api/plugin-fs/file?path=${encodeURIComponent(`${pluginDir}/${stylePath}`)}`;
    if (!document.querySelector(`link[data-plugin-style="${href}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.dataset.pluginStyle = href;
      document.head.appendChild(link);
    }
  }
}

/** 1 プラグインディレクトリをロードして PluginManifest を返す。 */
export async function loadPlugin(pluginDir: string): Promise<PluginManifest> {
  const manifestText = await readPluginText(`${pluginDir}/plugin.json`);
  const pluginJson = JSON.parse(manifestText) as PluginJson;

  // CSS を先に注入（JS ロード前に適用させる）
  if (pluginJson.styles?.length) {
    injectPluginStyles(pluginDir, pluginJson.styles);
  }

  const entryAbs = `${pluginDir}/${pluginJson.entry}`;
  const entryUrl = await resolveEntryUrl(entryAbs);

  const mod = (await import(/* @vite-ignore */ entryUrl)) as {
    default: PluginManifest;
  };
  return mod.default;
}
```

- [ ] **Step 2: `usePlugins.ts` を実装**

`apps/mooreseditor/src/pluginHost/usePlugins.ts`。config.yaml を読み、全プラグインを
`loadPlugin` でロードし、`PluginManifest[]` と loading/error 状態を返すフック:

```ts
import { useEffect, useState } from "react";

import { parsePluginConfig } from "./config";
import { loadPlugin } from "./loader";

import type { PluginManifest } from "@mooreseditor/plugin-sdk";

async function readConfigText(): Promise<string> {
  try {
    const { readTextFile } = await import("@tauri-apps/plugin-fs");
    return await readTextFile("mooreseditor.config.yaml");
  } catch {
    const res = await fetch("/mooreseditor.config.yaml");
    return res.ok ? await res.text() : "";
  }
}

export function usePlugins(): {
  plugins: PluginManifest[];
  loading: boolean;
} {
  const [plugins, setPlugins] = useState<PluginManifest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
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
      if (!cancelled) {
        setPlugins(loaded);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { plugins, loading };
}
```

- [ ] **Step 3: 型チェック・lint**

```bash
pnpm run type-check && pnpm run lint
```

Expected: 成功。

- [ ] **Step 4: コミット**

```bash
git add apps/mooreseditor/src/pluginHost/loader.ts apps/mooreseditor/src/pluginHost/usePlugins.ts
git add apps/mooreseditor/vite-plugins/pluginFsPlugin.ts
git commit -m "feat: プラグイン動的ロード機構(loader/usePlugins/pluginFsPlugin)を追加"
```

---

## Task 7: App.tsx 統合 — `React.lazy` 撤廃とランタイム登録

`App.tsx` から `@mooreseditor/plugin-node-graph` の静的 import を撤廃し、`usePlugins` で
ロードしたプラグインを ViewRegistry へ動的登録する。

**Files:**

- Modify: `apps/mooreseditor/src/App.tsx`
- Modify: `apps/mooreseditor/package.json`（`@mooreseditor/plugin-node-graph` 依存を削除）

- [ ] **Step 1: `App.tsx` を更新**

Phase 2 で追加した `React.lazy(() => import("@mooreseditor/plugin-node-graph"))` を削除し、
代わりに `usePlugins()` を呼ぶ。ロードされた各 `PluginManifest` について
`manifest.createView(hostApi)` を呼び、得た `PluginView` を `ViewDescriptor` に変換して
`views` 配列へ追加する:

```tsx
const { plugins } = usePlugins();
const hostApi = useMemo(
  () =>
    createHostApi({
      /* App の state/handler を束ねる */
    }),
  [
    /* deps */
  ],
);

const pluginViews: ViewDescriptor[] = useMemo(
  () =>
    plugins.map((manifest) => {
      const view = manifest.createView(hostApi);
      return {
        id: manifest.id,
        label: manifest.name,
        render: () => view.render(),
      };
    }),
  [plugins, hostApi],
);

const views = useMemo(
  () => [editorView, ...pluginViews],
  [editorView, pluginViews],
);
```

アクティブビューの `ViewCapabilities`（`canSave`/`onSave`/`focusSearchMatch`）は、
Editor なら従来ロジック、プラグインビューなら対応する `PluginView` の `save`/`isDirty`/
`focusSearchMatch` から解決する。

> **Phase 1 繰り越し負債①（display:none / xyflow 問題）の対処:**
> Phase 1 の `App.tsx` は全ビューを常時マウントし、非アクティブなビューを `display:none` で
> 隠している。`@xyflow/react` はコンテナサイズ 0 で初期化されるとノードレイアウトが崩れる。
> プラグインビューを登録するこのタスクで、以下のいずれかを必ず実施すること:
>
> - **遅延マウント（推奨）:** プラグインビューを `display:none` 常時マウントではなく、
>   初回アクティブ化まで DOM に追加しない（条件付きレンダリング `activeViewId === view.id`）。
> - **代替:** マウントは維持するが、ビューが表示切替時に React Flow の `fitView` / `resize`
>   メソッドを呼ぶ `onShow` コールバックを `PluginView` インターフェースに追加する。

> **Phase 1 繰り越し負債②（capabilities のハードコード判定）の対処:**
> Phase 1 の `capabilities` は `activeViewId === "editor"` でハードコード判定している。
> プラグインビューが増えるこのタスクで、`ViewDescriptor` に `getCapabilities?()` メソッドを
> 追加し、Editor も含めた全ビューが同一パスで能力を返すよう統一すること。

> **Phase 1 繰り越し負債③（useMemo の安定化）の対処:** > `views` / `capabilities` の `useMemo` が多依存でチャーンしている。プラグインビューを
> `useMemo` に追加する前に、揮発性の値（columns / schemas 等）を props/context/HostAPI ref
> 経由に移し、ビュー記述子オブジェクトの同一性を安定させること。

- [ ] **Step 2: 静的依存を削除**

`apps/mooreseditor/package.json` の `dependencies` から `@mooreseditor/plugin-node-graph` を削除する
（ランタイムロードに移行したため build-time 依存は不要）。`@xyflow/react` `html-to-image` が
アプリ側 `package.json` にまだ残っていれば削除する（プラグイン側へ Phase 2 で移譲済み）。

```bash
pnpm install
```

- [ ] **Step 3: プラグインを事前ビルド**

ランタイムロードはビルド済み `dist/index.js` を読む。ルート `package.json` に
プラグインビルドを含める（例: `"build": "turbo run build"` でプラグインも対象に入るよう
`turbo.json` を設定）。

```bash
pnpm --filter @mooreseditor/plugin-node-graph run build
```

- [ ] **Step 4: 検証**

```bash
pnpm run type-check && pnpm run lint && pnpm run test
```

Expected: 全て成功。`App.tsx` に `@mooreseditor/plugin-node-graph` の静的 import が
無いことを確認:

```bash
grep -n "plugin-node-graph" apps/mooreseditor/src/App.tsx || echo "OK: no static plugin import"
```

Expected: `OK: no static plugin import`

- [ ] **Step 5: 開発サーバ動作確認（CLAUDE.md フロー）**

`pnpm run dev` で:

1. 起動時、コンソールにプラグインロードのエラーが出ていないこと
2. ヘッダに Editor / Node Graph タブが表示される（= プラグインが動的ロードされタブ登録された）
3. Node Graph タブでノード追加・エッジ編集・Ctrl+S 保存が動作する
4. Editor タブで従来編集が動作する

Expected: ランタイムロードで `feature/node-graph-system` 相当の挙動が再現される。

- [ ] **Step 6: コミット**

```bash
git add -A
git commit -m "feat: ノードグラフをランタイムプラグインとして動的ロードへ移行"
```

---

## Task 8: Tauri FS スコープ対応と prod ビルド検証

prod（Tauri アプリ）でプラグインディレクトリと `.mooreseditor` を読み書きできるよう
FS スコープを設定し、Tauri ビルドで動作確認する。

**Files:**

- Modify: `apps/mooreseditor/src-tauri/tauri.conf.json`（および `capabilities/`）
- Modify: `apps/mooreseditor/src-tauri/` の scope 追加コマンド（既存 `add_project_to_scope` を流用/拡張）

- [ ] **Step 1: FS スコープにプラグインディレクトリと config を追加**

`src-tauri` の capabilities / `tauri.conf.json` の `fs` スコープに、プラグインディレクトリ配下
（`plugins/**`）と `mooreseditor.config.yaml`、`.mooreseditor/**` を許可する。
`asset` プロトコルでプラグイン JS を `import()` できるよう `assetProtocol` のスコープも追加する。

- [ ] **Step 2: Tauri 開発ビルドで起動確認**

```bash
pnpm run tauri:dev
```

Expected: Tauri webview でアプリが起動し、Node Graph タブが表示される。
`convertFileSrc` 経由のプラグイン `import()` が成功し、ノードグラフが描画される。

- [ ] **Step 3: prod ビルド**

```bash
pnpm run tauri:build
```

Expected: ビルド成功。生成物起動時にプラグインがロードされる。

- [ ] **Step 4: プラグイン無効化の確認**

`mooreseditor.config.yaml` の `plugins:` を空（`plugins: []`）にして起動し、
Editor のみ表示されタブが非表示になることを確認（Phase 1 の `views.length > 1` 分岐）。
確認後、設定を元に戻す。

- [ ] **Step 5: E2E テスト**

```bash
pnpm run test:e2e -- --reporter=list
```

Expected: 既存 E2E が pass。

- [ ] **Step 6: コミット**

```bash
git add -A
git commit -m "feat: Tauri FS スコープにプラグインディレクトリを追加し prod 動作を確認"
```

---

## Phase 1 からの繰り越し設計負債 / Phase 3 で対応

以下 3 点は Phase 1 実装時に意図的に先送りした設計負債。Task 7（プラグインビュー登録）で
対処する（Task 7 Step 1 内の各注記を参照）。

1. **`display:none` 常時マウントと `@xyflow/react` の相性問題**
   Phase 1 は非アクティブビューを `display:none` で隠す常時マウント方式を採っている。
   `@xyflow/react` はコンテナサイズ 0 で初期化されるとノードレイアウトが崩れる。
   Phase 3 ではプラグインビューを初回アクティブ化まで遅延マウント（lazy mount）するか、
   表示切替時に React Flow へ `fitView` / resize 通知を送る方式へ変更する。

2. **`capabilities` のハードコード判定**
   Phase 1 の `capabilities` 解決は `activeViewId === "editor"` による固定判定。
   プラグインビューが増えることで破綻するため、`ViewDescriptor` に `getCapabilities?()` を
   持たせ、Editor とプラグインが同一パスで能力を公開できるよう統一する。

3. **`views` / `capabilities` `useMemo` の安定化**
   Phase 1 の `useMemo` は多くの依存を列挙しており、揮発性の state 変化のたびにビュー
   記述子が再生成される。プラグインビューを追加する前に、揮発性の値を props/context/
   HostAPI ref 経由に移してビュー記述子の同一性を安定させる。

---

## 完了条件（Phase 3 全体）

- [ ] Task 0 の技術検証 PoC が 4 項目すべて成立している
- [ ] `plugins/node-graph` が external 指定の単体 ESM（`dist/index.js`）としてビルドできる
- [ ] バンドルに React / Mantine / xyflow / SDK が同梱されていない（import map で解決）
- [ ] `@tabler/icons-react` / `@mantine/notifications` が `EXTERNAL` / import map に含まれている
- [ ] プラグイン CSS が `plugin.json` の `styles` フィールド経由で動的注入されている
- [ ] プラグインファイルの dev 配信に `/api/plugin-fs/` 専用エンドポイントを使っている
- [ ] `mooreseditor.config.yaml` の `plugins:` 記述でノードグラフが起動時ロードされる
- [ ] `plugins: []` にするとノードグラフが読み込まれず Editor のみになる
- [ ] `App.tsx` に `@mooreseditor/plugin-node-graph` の静的 import が存在しない
- [ ] プラグインビューが遅延マウントまたは `fitView` 通知による xyflow 初期化問題を回避している
- [ ] `capabilities` 解決が `ViewDescriptor.getCapabilities?()` 統一パスになっている
- [ ] dev（Vite）/ prod（Tauri）両方でプラグインがロードされ動作する
- [ ] `pnpm run type-check` / `lint` / `test` / `test:e2e` が全て成功
- [ ] ノードグラフの全機能が `feature/node-graph-system` ブランチと同等に動作する

これでノードグラフは完全に着脱可能なランタイムプラグインとなり、プラグイン化の全工程が完了する。

## Self-Review メモ

- **Spec coverage:** 設計 §3.1（import map / config→plugin.json→動的 import）→ Task 3-6。
  §3.2（dev/prod ローディング差分）→ Task 6 Step 0-1 / Task 8。§3.3（方式 A: import map）→ Task 3。
  §5 Phase 3 の全項目（単体バンドル / pluginHost / lazy 撤廃 / FS スコープ）→
  Task 2 / Task 4-6 / Task 7 / Task 8。
- **型整合:** `PluginManifest`/`HostAPI`/`PluginView`（Phase 2 で SDK 定義）を Task 1・5・6・7 で
  一貫使用。`createHostApi` の戻り値型と `loadPlugin` の戻り値型が `App.tsx`（Task 7）で結合する。
  `HostAPI.saveProject`（Phase 2 Task 2 で定義）は Task 5（`hostApi.ts`）で実装する。
- **リスク:** Task 0 PoC が全 Phase 3 実装のゲート。Task 3（import map + 共有依存ブリッジ）と
  Task 6（プラグイン配信エンドポイント）は Task 0 で方式確定済みであることを前提とする。
  `devFsPlugin` の流用禁止と `/api/plugin-fs/` 専用エンドポイント新設を Task 6 Step 0 に明記済み。
  依存グラフの漏れ（`@tabler/icons-react` / `@mantine/notifications` 等）は Task 2 のバンドル
  アナライザ確認で検出する。
- **検証:** dev は Task 7 Step 5、prod（Tauri）は Task 8 Step 2-3、無効化は Task 8 Step 4 で確認。
  Phase 1 繰り越し負債 3 点の対処は Task 7 Step 1 内の注記と「完了条件」で追跡する。
