# ノードグラフのプラグイン化 設計ドキュメント

- 日付: 2026-05-20
- 対象: `feature/node-graph-system` ブランチのノードグラフ機能を、mooreseditor 固有実装からランタイムプラグインへ外部化する
- ステータス: 設計合意済み（全体設計 + Phase 1 詳細）

## 1. 背景と目的

`feature/node-graph-system` ブランチは master に対して 86 コミット先行しており、実コード変更は
`apps/mooreseditor/src/` 配下で +7,986 / -408 行。中核は `nodeEditor/`（xyflow ベースのノードグラフ
エディタ）の新規追加で、それに伴い App.tsx のビュー管理刷新・検索機能・foreignKey 強化・ビルド/開発
基盤の整備が行われている。

ノードグラフは mooreseditor 固有機能として実装されているが、これを **着脱可能なランタイムプラグイン**
として外部化したい。プラグインは単体ビルド成果物として出力でき、`mooreseditor.config.yaml` で
プラグインディレクトリを指定し、アプリ起動時にロードされる。

汎用機能（モード切替、検索など）は master 側へ取り込み、ノードグラフ専用処理のみをプラグイン化する。

## 2. 現状のカップリング調査結果

### 2.1 公開インターフェース（すでに比較的きれい）

`nodeEditor/index.tsx` は `NodeEditorView`（`forwardRef` コンポーネント）を default export し、
App.tsx は `React.lazy` で遅延ロードしている。Props 契約 `NodeEditorViewProps` は以下:

```ts
interface NodeEditorViewProps {
  jsonData: Column[];
  setJsonData: React.Dispatch<React.SetStateAction<Column[]>>;
  schemas: Record<string, Schema>;
  loadSchema: (schemaName: string) => Promise<Schema | null>;
  projectDir: string | null;
  masterDir: string | null;
  onMarkDirty: () => void;
  onRequestSave: (
    columns: Column[],
    nodeGraph: NodeGraphFile | null,
  ) => Promise<void>;
}
```

ハンドル `NodeEditorHandle` は `save()` と `focusSearchMatch(element)` を公開。

### 2.2 `nodeEditor/` から mooreseditor 本体への依存

- `utils/createInitialValue`
- `components/TableView`（PropertiesPanel 等で再利用）
- `components/FormView`（同上）
- `libs/schema/types`（`Schema` / `ObjectSchema` / `ArraySchema` 型）
- `hooks/useJson`（`Column` 型）

### 2.3 プラグイン機構の有無

mooreseditor には現状プラグイン機構は存在しない。`React.lazy` による遅延ロードのみ。

### 2.4 master 取り込み候補に混在するノード依存

- `saveProjectData`（`nodeGraphData?: NodeGraphFile` 引数を持つ）
- `useSaveShortcut`（`mode: "editor" | "node"` 固定）
- App.tsx の `mode` ステート（`"editor" | "node"` 固定）

これらは「要一般化」対象。

## 3. 目標アーキテクチャ（最終形）

```
mooreseditor/ (monorepo)
├── apps/mooreseditor/              ← ホスト本体
│   ├── src/pluginHost/             ← 【新規】プラグインローダ + レジストリ
│   └── mooreseditor.config.yaml    ← plugins: [{ dir: "./plugins/node-graph" }]
├── packages/
│   └── plugin-sdk/                 ← 【新規】@mooreseditor/plugin-sdk
│       ├── contract: PluginManifest / HostAPI / PluginViewProps 型
│       ├── schema types (libs/schema/types を移管)
│       └── 共有UI: TableView / FormView / createInitialValue 等
└── plugins/
    └── node-graph/                 ← 【移管】単体ビルド可能なプラグイン
        ├── plugin.json             ← マニフェスト (id, name, entry, version)
        └── dist/index.js           ← 単体ESMバンドル成果物
```

### 3.1 ランタイム連携

- プラグインは `react` / `react-dom` / `@mantine/core` / `@mooreseditor/plugin-sdk` を
  **external** としてビルドし、自前バンドルしない。
- ホストが起動時に **import map** でこれら共有モジュールを 1 インスタンスに解決する。
  これにより React フックの二重インスタンス問題を回避する。
- プラグインの読み込みフロー:
  1. `mooreseditor.config.yaml` を読む（`plugins: [{ dir }]`）
  2. 各プラグイン dir の `plugin.json`（マニフェスト）を読む
  3. マニフェストの entry JS を動的 `import()` する
  4. プラグインの `export default`（マニフェスト準拠オブジェクト）をホストのビューレジストリへ登録する
- プラグインはビュー（タブ）を提供し、`save()` / `isDirty()` / `focusSearchMatch()` フックを
  `HostAPI` 経由でホストへ公開する。

### 3.2 dev/prod のローディング差分

CLAUDE.md の try-catch フォールバック規約に従う:

- prod: Tauri `convertFileSrc(pluginEntryPath)` → `asset://` URL を `import()`
- dev: 上記が失敗したら dev サーバ経由パス（`devFsPlugin` 拡張）にフォールバック

### 3.3 ランタイムローダ実装方式

**方式 A: import map + 動的 import** を採用する。

- プラグインを `react` 等を external にした ESM でビルドする。
- ホストの `index.html` に import map を置き、共有モジュールを 1 インスタンスに解決する。
- `import(assetUrl)` でプラグインをロードする。

不採用案:

- Module Federation（`@originjs/vite-plugin-federation`）: 強力だが Vite 版は不安定・設定が複雑で、
  今回の規模ではオーバースペック。
- SystemJS: import map 相当を自前で抱える必要があり、標準の import map で足りるため不要。

採用理由: Tauri webview はモダン Chromium で import map をネイティブサポートし、追加依存ゼロ。
プラグインのビルドは Vite library mode + `rollupOptions.external` のみで完結する。

## 4. master 取り込み vs プラグイン専用の振り分け

### A. master に取り込む（汎用機能・ノード非依存）

| 対象                                                                               | 備考                                                        |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `SearchOverlay` + `mark.js` 検索                                                   | 汎用。`focusSearchMatch` のノードジャンプ部分は契約フック化 |
| App.tsx → `EditorView` 抽出リファクタ                                              | ビュー管理の整理。汎用                                      |
| foreignKey 強化（string 型 FK・TableView FK ドロップダウン・`types.ts` 集約）      | 完全に汎用                                                  |
| `devFsPlugin.ts`・eslint config 刷新・`tsconfig`・ルート `package.json` スクリプト | ビルド/開発基盤                                             |
| ObjectArrayDialog 修正・float 精度・UUID v7 などの単発バグ修正                     | 一部は master 取り込み済み                                  |

### B. 「要一般化」して master に取り込む

| 対象                            | 一般化の方向                                                                                                               |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `mode` 切替（SegmentedControl） | **ビューホスト**に一般化。`"editor" \| "node"` 固定を撤廃し、登録されたビューでタブを動的生成。ビューが 1 個ならタブ非表示 |
| `useSaveShortcut`               | `mode` 固定を撤廃。アクティブビューが自分の保存ハンドラを登録する形へ                                                      |
| `saveProjectData`               | `nodeGraphData` 引数を除去。master カラム保存に専念。プラグインの追加ファイル保存は `HostAPI` 経由                         |

### C. プラグイン専用（`plugins/node-graph/` へ移管）

- `nodeEditor/` 配下ほぼ全部: xyflow、Nodes/Edges、`PropertiesPanel`、`CanvasContextMenu`、`NodeToolbar`
- レシピロジック: `recipeEdge*`・`exportToMaster*`・`spatialUnlock`・`recordLookup`・`masterRecordCreation`
- `nodeGraph.v1.json` の保存/読込・`graphMigration`・`useGraphImageExport`（`html-to-image`）
- `@xyflow/react`・`html-to-image` 依存はプラグイン側 `package.json` へ

### D. plugin-sdk へ移管（ホスト・プラグイン双方が使う共有資産）

- `libs/schema/types`（`Schema` 系型）
- `components/TableView`・`components/FormView`
- `utils/createInitialValue`、`hooks/useJson` の `Column` 型
- プラグイン契約型（`PluginManifest`・`HostAPI`・`PluginViewProps`）

## 5. フェーズ分割

### Phase 1 — master 取り込み + ビューホスト基盤

master ブランチに対し、ノード非依存の汎用機能を取り込みつつ「ビューホスト」を一般化導入する。
**この時点ではプラグインも SDK も存在せず、ビューは Editor 1 個だけ。**

1. **ビューホスト基盤の導入**
   - `ViewRegistry`（登録されたビューの配列）+ `ActiveViewContext`
   - `mode` 固定 `"editor" | "node"` を撤廃し、ビュー ID 文字列ベースに。タブは登録ビューから
     動的生成し、1 個ならタブ非表示。
   - `EditorView` を「組み込みビュー」第 1 号として登録。
2. **保存機構の一般化**
   - `useSaveShortcut`: アクティブビューが `onSave` / `canSave` を登録する形へ。
   - `saveProjectData`: `nodeGraphData` 引数を除去、master カラム保存に専念。
3. **検索機構の取り込み**
   - `SearchOverlay` + `mark.js` を取り込む。`focusSearchMatch` は「アクティブビューが任意で
     登録するフック」に一般化（Editor は未登録で可）。
4. **汎用機能の取り込み**: foreignKey 強化、`devFsPlugin`、eslint/tsconfig/scripts、単発バグ修正。
5. App.tsx の `EditorView` 抽出リファクタ。

**完了条件**: master 上で Editor が従来どおり動作する（型チェック・lint・既存 E2E が green）。
ノードグラフは未統合。

### Phase 2 — `@mooreseditor/plugin-sdk` 抽出 + ノードエディタ依存解消

- `packages/plugin-sdk/` 新設: schema types / TableView / FormView / createInitialValue /
  `Column` 型 / プラグイン契約型（`PluginManifest`・`HostAPI`・`PluginViewProps`）。
- ホスト本体を SDK 参照に切り替え。
- `nodeEditor/` を `plugins/node-graph/` へ移管し、本体への相対 import
  （`../../components/...` 等）を全て `@mooreseditor/plugin-sdk` 参照へ置換。
- この時点ではまだ静的 import（`React.lazy`）で動作 = **機能不変のリファクタとして検証可能**。

### Phase 3 — ランタイムローダ

- `plugins/node-graph/` を external 指定で単体 ESM バンドル化し、`plugin.json` を生成。
- ホストに `pluginHost/`（`config.yaml` 読込・動的 import・import map 解決・ViewRegistry へ登録）
  を実装。
- `React.lazy` 直 import を撤廃しランタイムロードへ切り替え。

## 6. プラグイン契約（最小）

Phase 2 で `@mooreseditor/plugin-sdk` に定義する型の骨子:

```ts
// プラグイン成果物が default export するオブジェクト
interface PluginManifest {
  id: string; // 一意 ID
  name: string; // タブ表示名
  version: string;
  createView(host: HostAPI): PluginView;
}

// ホストがプラグインへ提供する API
interface HostAPI {
  getColumns(): Column[];
  setColumns(updater: (c: Column[]) => Column[]): void;
  schemas: Record<string, Schema>;
  loadSchema(name: string): Promise<Schema | null>;
  projectDir: string | null;
  masterDir: string | null;
  markDirty(): void;
  saveExtraFile(relativePath: string, content: string): Promise<void>;
}

// プラグインがホストへ公開するビュー
interface PluginView {
  render(): React.ReactNode;
  save?(): Promise<void>;
  isDirty?(): boolean;
  focusSearchMatch?(element: HTMLElement): void;
}
```

注: TS 型はコンパイル時のみで実行時コストはない。実行時に共有が必要なのは
React / Mantine / xyflow / SDK の値モジュールであり、これらは import map で 1 インスタンス化する。

## 7. リスクと留意点

- **React 二重インスタンス**: プラグインが自前で React をバンドルするとフックが壊れる。
  external 指定 + import map で必ず単一インスタンス化する。
- **TableView / FormView の SDK 移管**: 本体の他コードからの参照経路が変わるため、Phase 2 では
  参照置換の漏れに注意。型チェックで検出する。
- **Tauri FS スコープ**: プラグインディレクトリの読み取りを Tauri の FS スコープに追加する必要が
  ある（node-graph ブランチに `.mooreseditor` をスコープ追加した前例あり）。
- **dev/prod ローディング差分**: 環境判定 if は使わず try-catch フォールバックで実装する
  （CLAUDE.md 規約）。

## 8. 今回のスコープ

本ドキュメントは全体設計 + Phase 1 詳細を確定するもの。次ステップは Phase 1 の実装計画作成。
Phase 2 / Phase 3 はそれぞれ独立した spec → plan → 実装サイクルを持つ。
