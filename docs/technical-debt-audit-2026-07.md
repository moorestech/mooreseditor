# 技術的負債・設計欠陥・潜在バグ 監査記録（2026-07-07）

コードベース全体（apps/mooreseditor / packages/plugin-sdk / plugins/node-graph / src-tauri）を
5観点（アプリ本体・plugin-sdk・セキュリティ/プラグインホスト・node-graph・横断品質）で監査した記録。
全指摘はファイル実読で確証を得たもののみ。行番号は監査時点（master `c3f2586`）のもの。

## ステータス凡例

- **修正済み**: 対応コミットあり。
- **許容**: リスクを認識した上で、現時点では対応しないと決定したもの（理由を明記）。
- **未対応**: 既知の課題として記録。将来の対応候補。

---

## Critical

### C1. トップレベル配列のマスタが `{0:..., 1:...}` に化けて保存される — 修正済み（`8f1e97b`）

- 該当: `apps/mooreseditor/src/components/EditorView.tsx:195, 273`
- 内容: ネスト更新時、カラムのルートを無条件で `updatedItem.data = { ...updatedItem.data }` とオブジェクトスプレッドしていた。中間階層は `Array.isArray` 分岐で配列を保護しているのにルートだけ抜けており、トップレベルが配列スキーマのマスタ（items/blocks/mapObjects 等）を「テーブルの行 → フォームで編集 → Ctrl+S」の一般的フローで編集すると `[a,b,c]` が `{"0":a,"1":b,"2":c}` に変換されファイルが破損した。
- 対応: ルートのコピーを中間階層と同じく `Array.isArray(updatedItem.data) ? [...updatedItem.data] : { ...updatedItem.data }` に統一。回帰テスト（`EditorView.test.tsx`「keeps top-level array data as an array when editing via a nested FormView」）を追加。テスト140件全通過・type-check/lint クリーン・Playwright実機で配列保持を確認済み。
- 補足: サンプルプロジェクトのマスタは全て `{"data":[...]}` のオブジェクトルート形式だったため今まで顕在化していなかった。トップレベルが `type: array` のスキーマを持つ実プロジェクトで発火する潜在バグ。

### C2. 保存失敗がユーザーに一切通知されない — 未対応

- 該当: `apps/mooreseditor/src/utils/saveProjectData.ts:69-74`、あわせて `App.tsx:251` `saveAllDirtyViews`
- 内容: 本番保存パスの失敗は `console.error` のみで、トースト通知（`showNotification`）に接続されていない。書き込み権限エラーやディスクフルでも画面上は成功と区別がつかず、ユーザーが「保存した」と誤認できる。`saveAllDirtyViews` は Editor 保存成功後にプラグイン保存が失敗しても黙って続行する部分保存の不整合も同じ穴。
- 推奨: catch を `showNotification` によるエラー通知へ接続する。

### C3. 「プロジェクトを開く＝任意コード実行＋全FS読み書き＋外部送信」になり得るセキュリティ設計 — **許容**

- 該当:
  - `src-tauri/src/lib.rs:9-19` — `add_project_to_scope` が引数無検証で `fs.allow_directory(path, true)` に渡す（webview 内の任意コードが `"/"` を渡せば FS スコープが全ディスクに拡大）
  - `src/pluginHost/loader.ts:209` — プラグインは同一オリジン・同一 realm で動的 import され、HostAPI を迂回して `invoke()` で全 Tauri IPC を直接呼べる（サンドボックス・署名・整合性検証なし）
  - `src-tauri/tauri.conf.json:22` — `"csp": null` で外部への fetch/WebSocket が無制限
  - 関連: Windows パストラバーサル（`hostApi.ts:55-70` / `projectPersistence.ts:23-38` が `\` を正規化しない）、FS capability の広い `**/plugins/**` グロブ、devtools 同梱、`greet` デバッグ IPC 残置
- **許容の判断と理由**: 本ツールは「オーナー自身が自分のプロジェクトを編集する」ローカルのマスタデータ編集ソフトであり、信頼できない第三者からプロジェクト（`mooreseditor.config.yml` に `plugins:` を含む）を受け取って開く運用は現時点で想定しない。この前提のもとでは上記の連鎖は現実的な脅威にならないため、対応しないと決定した。
- **許容の前提と再評価トリガー**: 以下のいずれかに該当する運用へ移行する場合、本項目は「許容」を取り消して対応を要する。
  - プロジェクトやプラグインを他者と共有・配布・ダウンロードして開く運用を始めるとき
  - プラグインを外部（サードパーティ）が提供できるエコシステムにするとき
  - アプリがリモートコンテンツ（外部URL・ネットワーク経由のデータ）を読み込むようになるとき
- 対応する場合の最小セット: `add_project_to_scope` の引数検証（projectDir 配下限定）、CSP の `connect-src`/`script-src` 設定、プラグインロード時のユーザー確認または署名/ハッシュ検証、書き込み系パス検証の `\` 正規化。

---

## High（未対応 / 既知の課題）

### データ喪失系

- **debounce 入力の未確定編集が消える** — plugin-sdk の NumberInput/StringInput/Vector系。debounce(300ms) 中にアンマウントや Ctrl+S が起きると最後の編集を捨てる（`useDebounce.ts:24-30` がタイマーをクリア）。flush-on-unmount が必要。
- **Vector 入力で別軸の編集が上書き消失** — `Vector2Input.tsx:21-51`（Vector3/4 も同型）。X→Y を素早く編集すると単一 debounce タイマーの clear により X が古い値へ巻き戻る。
- **node-graph: 依存エッジを全削除しても master の `prevResearchNodeGuids` が残留** — **修正済み**（`fix/node-graph-audit-fixes`）。常時上書き＋重複/自己ループ除去に変更。ただし「research ノード自体を削除した場合の孤児データ凍結」は設計判断が必要なため未対応（[node-graph 申し送り](./node-graph-audit-handover-2026-07.md) 参照）。
- **node-graph: レシピエッジ編集中に選択がリセット** — **修正済み**（`fix/node-graph-audit-fixes`）。useMemo 化＋初期化ガードで解消。あわせて編集確定の非対称性（型変更不可・旧レシピ孤立・ドラフト孤立）も修正。

### クラッシュ系（Rules of Hooks 違反）

- **TableView のフック順序違反** — `TableView/index.tsx:97-106`。早期 return がフックより前にあり、データが不正⇔正常に遷移すると "Rendered fewer hooks" でクラッシュ。同種が `FormView/Field.tsx:68,156`・`useForeignKeyData.ts:27` にも存在。
- **RefResolver に循環参照ガードなし** — `RefResolver.ts:24-30`。自己参照/相互参照する YAML スキーマで無限再帰→スタックオーバーフロー。「様々なスキーマが入力される」前提のソフトとして要対応。
- **プロジェクトオープン途中失敗で半開き状態** — `ProjectContext.tsx:50,131-140`。先に `setProjectDir` してから例外が飛ぶと、本番では projectDir だけセットされた壊れた状態が通知なしに残る。

### 基盤・方針系

- **`strictNullChecks: false`** — `packages/typescript-config/base.json`。`"strict": true` と同居して全ワークスペースの null 安全を無効化。C1/C2 のような穴を型で防げない根本原因。段階的に有効化を推奨。
- **node-graph のスキーマ名・フィールド名ハードコード** — `exportToMasterResearchPatch.ts` / `spatialUnlock.ts` / `recipeEdgeConstants.ts` が `"research"` `prevResearchNodeGuids` `craftRecipes` を直書き、入出力判定は `/(output|to|...)/i` の正規表現ヒューリスティック。CLAUDE.md「スキーマ構造をハードコードしない」に違反。→ `"research"` の schemaId 解決のみ `fix/node-graph-audit-fixes` で動的化済み。フィールド名群は SchemaMeta の構造的限界のため設計判断待ち（[node-graph 申し送り](./node-graph-audit-handover-2026-07.md) 参照）。
- **Windows パストラバーサル** — `hostApi.ts:55-70` と `projectPersistence.ts:23-38` の `validateRelativePath` が `\` を正規化せず `"..\\..\\x"` が検証を通過。読み込み系（`pluginPaths.ts`）は正規化済みで書き込み系だけ抜けている不整合。（C3 の一部として許容範囲だが、修正コストは低い）
- **偽依存 `dnd-kit: ^0.0.2`** — `apps/mooreseditor/package.json`。正規の `@dnd-kit/*` とは別物の無関係パッケージで未使用。タイポスクワットリスクのため削除推奨。
- **FS capability の `**/plugins/**` グロブが広すぎ** — `capabilities/default.json`。パスのどこかに `plugins` を含む全ファイルが静的に許可される。（C3 の一部）

---

## Medium（未対応 / 既知の課題）

- **数値型の外部キーが破綻** — Mantine Select が文字列前提のため数値 id の FK は表示名が出ず、保存で文字列に型ドリフト（`ForeignKeySelect.tsx:40` 他）。
- **schemaToZod の検証が型ごとに非一貫** — integer/number/boolean/array は必須でも無条件 `.optional()`（`schemaToZod.ts:83-148`）。ペースト検証をすり抜ける。
- **switch 初回選択で必須フィールドが自動生成されない** — `useSwitchFieldAutoGeneration.ts:30-33` の undefined センチネル誤用。また `./` 相対パスしか対応せず `../` は黙って無視（`switchFieldProcessor.ts` / `dataInitializer.ts`）。
- **node-graph: ノード座標だけから unlock 対象を毎保存時に再計算** — `spatialUnlock.ts`。ノードを動かして保存しただけでゲームロジックデータが静かに書き換わる設計。※孤児ドラフトレシピ・レシピ全削除・種別変更不可は `fix/node-graph-audit-fixes` で修正済み。空間アンロック設計自体は未対応。
- **useSchema が二重実装** — `hooks/useSchema.ts`（実使用）と `hooks/useSchema/index.ts`＋loaders 群（完全デッドコード・引数非互換）。誤って切り替えるとスキーマロード全滅。整理推奨。
- **SearchOverlay の mark.js が React 管理 DOM を直接改変** — 検索中に編集すると切り離された DOM 参照・reconcile 不整合（`SearchOverlay.tsx:126-180`）。
- **パフォーマンス** — node-graph でノードドラッグ毎に全ノード×全マスタ走査（`NodeEditorApp.tsx:39-46`）、エッジ選択だけで全ラベル再構築。
- **any 濫用が lint で免罪** — `no-explicit-any: off`（`eslint-config/src/tauri.mjs:80`）。本番コードの `: any`/`as any` 約80件が永続化パス（EditorView, dataValidator, ProjectContext.parseYaml, graphMigration）に集中。CLAUDE.md の型安全規約と実質矛盾。
- **共有依存ブリッジのバージョン照合なし** — `sharedDeps.js` の `versionRange` が実行時まで検証されず、プラグインの依存不整合が実行時エラーで初露見。
- **asset scope とローダ許容パスの乖離** — `$HOME/**/plugins/*/dist/**` 限定なのにローダは `..` 越えパスを許可し、prod でのみロード失敗。
- **ドキュメント腐敗** — CLAUDE.md/AGENTS.md/GEMINI.md が実在しない `src/libs/schema/`・`src/nodeEditor/` を案内。memory-bank/ もプラグインアーキテクチャ移行前の記述のまま。
- **リリースビルドに devtools 同梱** — `tauri.conf.json:18`。（C3 の一部）

---

## Low（未対応 / 既知の課題・要約）

- 本番コードに `console.log` 19件（保存前のマスタデータ丸ごと出力を含む）。
- React key に配列 index を使用（Sidebar/EditorView/DataSidebar）。
- エッジ ID が `Date.now()` のみで同一 ms 衝突 — **修正済み**（`fix/node-graph-audit-fixes`、カウンタ併用の `generateEdgeId()` に統一）。
- Delete キーの二重ハンドリング — **修正済み**（`fix/node-graph-audit-fixes`、React Flow の `deleteKeyCode` に一本化。Backspace 対応・ダイアログ表示中は無効化）。
- デバッグ用 `greet` IPC コマンド残置（`lib.rs:4-7`）。（C3 の一部）
- `RefResolver.debugBlocksSchema` が `"blocks"` スキーマ構造をハードコード（CLAUDE.md 違反のデバッグ残骸）。
- `EnumInput` が default を表示するのにデータへ書き戻さない乖離（`EnumInput.tsx:18`）。
- 初期値生成が `createInitialValue` と `DataInitializer` の2系統で挙動差。
- `useJson.ts:169` の `priorityItems = ["items"]` ハードコード、`loadJsonFile` の columnIndex 既定値0 が将来のカラム切り捨て地雷。
- `projectDir === "SampleProject"` の環境分岐＋dev サーバ書き込みの空 catch。

---

## 健全だった点（誤検知の否定）

- TODO/FIXME 残置ゼロ、`as unknown as` 二重キャストゼロ、`@ts-ignore`/`@ts-nocheck` ゼロ。
- テストは本番33ファイルに対しユニット20＋App 統合＋E2E が正しく配線済み。保存処理・プラグインロード・App 統合いずれもテストが存在する。
- `projectPersistence.ts:writeProjectFile` のフォールバックは CLAUDE.md 推奨パターン（本番→dev→元エラー再throw）に準拠。空 catch に見えるのは意図的な再throw。
- pluginローダの manifest 形状検証・dev サーバの allow-list 検証・`recipeCleanup` の参照カウント判定・`graphValidator`（孤児エッジ除去）は堅牢。

---

## 対応方針まとめ

- **C1**: 修正済み（`8f1e97b`、master マージ済み）。
- **C3（セキュリティ設計一式）**: ローカル・自己所有プロジェクト前提のため **許容**。上記「再評価トリガー」のいずれかに該当したら取り消して対応する。
- **その他（C2 / High / Medium / Low）**: 本ドキュメントに既知の課題として記録。優先度が高いのは C2（保存失敗の黙殺）と High のデータ喪失系（debounce/Vector/node-graph）。
