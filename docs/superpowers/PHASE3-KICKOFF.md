# Phase 3 着手メモ（次セッション用キックオフ）

新しいセッションでこのファイルを読ませて Phase 3 を開始する。

## 今やること

ノードグラフのプラグイン化 **Phase 3**: `plugins/node-graph` を `react`/Mantine/
`@xyflow/react`/SDK を external にした単体 ESM バンドルとして出力し、
`mooreseditor.config.yaml` で指定したディレクトリから起動時に動的ロードする。
`App.tsx` の `React.lazy` 静的 import を撤廃する。

## 実行する計画書

`docs/superpowers/plans/2026-05-20-node-graph-plugin-phase3.md`

実行方式: superpowers:subagent-driven-development（タスクごとにサブエージェント + 2段階レビュー）。
着手時に計画書冒頭の「⚠️ 実行前提」と各タスクのパスを再検証すること。
計画書には監査対応で **Task 0（技術検証 PoC）** が追加済み。Phase 3 着手時は
import map / React 同一インスタンス / プラグイン CSS / 専用 dev 配信エンドポイントの
PoC を最初に通すこと。

## 現在の状態（前提）

- Phase 1・Phase 2 はともに master にマージ済み。Phase 2 マージコミット: `979004f`
  （`Merge: Phase 2 ノードグラフのプラグイン化`）。
- master の検証状態: type-check 3/3・lint 3/3・ユニットテスト 545 pass / 5 skip
  （3パッケージ合算）・E2E 8 pass・Node Graph タブのライブ動作確認済み。すべて green。
- パッケージ構成（Phase 2 完了時点）:
  - `packages/plugin-sdk/`（`@mooreseditor/plugin-sdk`）— 編集エンジン全体
    （スキーマ層・編集ユーティリティ・編集フック・FormView・TableView・契約型）。
  - `plugins/node-graph/`（`@mooreseditor/plugin-node-graph`）— ノードグラフ本体。
    `@mooreseditor/plugin-sdk` のみに依存。
  - `apps/mooreseditor/` — `App.tsx` が `React.lazy(() => import("@mooreseditor/plugin-node-graph"))`
    でノードビューを静的 import し、Phase 1 の ViewRegistry に2ビュー（Editor / Node Graph）を登録。
- 依存方向は app → plugin → SDK の一方向、循環なし。SDK・プラグインともに本体（apps/mooreseditor）への
  直接 import はゼロ。
- ワークスペース横断検証は turbo 配線済み（`pnpm run type-check` / `lint` / `test` が全パッケージを実行）。
  各パッケージが自前の vitest 環境を持つ。

## Phase 2 で計画から逸脱した点（Phase 3 で前提とすること）

1. **Task 2.5 を追加**: Phase 2 計画にはなかった「workspace 横断検証の整備」を挿入した。
   root の `test`/`type-check` が app 限定だったため turbo 配線へ変更し、各新パッケージに
   vitest 環境を追加した（コミット `41fe663`）。
2. **Task 7 の前提変更**: `nodeEditor/` は master に存在せず `feature/node-graph-system`
   ブランチ（79コミット乖離）にしかなかったため、ユーザー判断によりそのブランチから
   `nodeEditor/` ツリーのみを取り込んでプラグイン化した（ブランチ全体のマージはしていない）。
3. **通知の DI 化**: `useCopyPaste` が tauri 通知（`utils/notification`）に依存していたため、
   SDK に `NotificationContext`（`packages/plugin-sdk/src/contexts/NotificationContext.tsx`）を
   新設し、ホストが `App.tsx` で `NotificationProvider` に実 `showNotification` を注入する形にした。
   SDK を host-free に保つための唯一の意図的リファクタ。挙動は不変。

## Phase 3 で対応すべき繰り越し負債（Phase 2 最終レビュー指摘）

優先度順:

1. **`plugin-node-graph` が `@tauri-apps/*` を本番コードで直接 import している**
   （`hooks/useNodeGraph.ts`・`hooks/useGraphImageExport.ts`）。`peerDependencies` 宣言は
   追加済み（`d34d44e`）だが、本来は `HostAPI` 経由でファイル I/O を注入する設計に移すべき。
   ランタイムロード化（Phase 3 の主目的）には host-agnostic 化が必須。
2. **`PluginManifest` / `createView(HostAPI)` 契約が未配線**。`contract/types.ts` に型は
   定義済みだが、`plugins/node-graph/src/index.tsx` は素の `forwardRef` コンポーネントを
   default export しており、`App.tsx` は `React.lazy` + 命令的 `nodeEditorRef` で配線している。
   Phase 3 で `PluginManifest` を実装し I/O を `HostAPI` 経由に通す（= ランタイムロードの前提）。
3. **`NodeEditorHandle.save()` が同期**（`NodeEditorInner.tsx:14` で `() => void`）。
   `App.tsx` は `?? Promise.resolve()` で包んでいるため、ホストの非同期保存ガード
   （`useSaveShortcut`）が実際の保存完了を await できていない。`Promise<void>` 化する。
4. **ノードビューの `canSave` が常時 `true`**（`App.tsx`）。ノードグラフの実 dirty 状態を
   ホストへ反映させる。
5. **`useForeignKeyData` の Rules of Hooks 違反**（`packages/plugin-sdk/src/hooks/useForeignKeyData.ts`、
   `if (isJsonData)` ブロック内に `useMemo` 2箇所）。Phase 2 以前からの既存債務で、移行時は
   そのまま維持した。Phase 3 で `useMemo` を無条件呼び出しへ修正する。
6. **設計負債（Phase 1 繰り越し）**: ビューを `display:none` で常時マウントし xyflow も
   隠れマウントされる点、`ViewDescriptor` への capabilities 集約、useMemo churn。
   Phase 3 計画に明記済み。

## 軽微な後始末（Phase 3 のいずれかのタスクで拾う）

- `@mooreseditor/plugin-sdk` の version が `0.0.0`（他は `0.1.0`）。`0.1.0` へ揃える。
- E2E が repo ルートに生成するスクリーンショット（`after-duplication.png` 等）と
  `apps/mooreseditor/tmp/` を root `.gitignore` へ追加（`apps/mooreseditor/.gitignore` には
  `tmp/` を追加済み。ルートの png は未対応）。
- SDK `index.ts` の `export *`（モジュール選択はキュレート済みだが各行はワイルドカード）。
  公開 API 表面を明示的な named export へ絞ることを検討。

## 既知の非ブロッカー（Phase 3 でも無視してよい）

- IDE/LSP の type 診断がファイル大量移動後にしばらく古い状態を表示する（実 `tsc` は green）。
  検証は必ず `pnpm run type-check`（turbo の `tsc`）で行う。
- `element.ref` React 19 非推奨警告（Mantine 7.10 由来・機能影響なし）。
- `EditForeignKeySync.test.tsx` が高並列負荷下で稀にタイムアウトする既知のフレーク
  （単体実行では pass）。

## 関連ドキュメント

- 全体設計: `docs/superpowers/specs/2026-05-20-node-graph-plugin-design.md`
- Phase 3 計画: `docs/superpowers/plans/2026-05-20-node-graph-plugin-phase3.md`
- Phase 2 計画（完了済み・参考）: `docs/superpowers/plans/2026-05-20-node-graph-plugin-phase2.md`
