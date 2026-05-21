# Phase 2 着手メモ（次セッション用キックオフ）

新しいセッションでこのファイルを読ませて Phase 2 を開始する。

## 今やること

ノードグラフのプラグイン化 **Phase 2**: 編集エンジン（FormView / TableView とその依存）・
スキーマ層・プラグイン契約型を `@mooreseditor/plugin-sdk` パッケージへ切り出し、
`nodeEditor/` を `plugins/node-graph/` へ移動して本体への直接依存をゼロにする。
この段階はまだ `React.lazy` 静的 import で動かす「機能不変リファクタ」。

## 実行する計画書

`docs/superpowers/plans/2026-05-20-node-graph-plugin-phase2.md`（全8タスク・改訂済み）

実行方式: superpowers:subagent-driven-development（タスクごとにサブエージェント + 2段階レビュー）。
着手時に計画書冒頭の「⚠️ 実行前提」と各タスクのパスを再検証すること。

## 現在の状態（前提）

- Phase 1 は master にマージ済み（`mode` 固定切替 → ビューホスト一般化、EditorView 抽出、
  saveProjectData / useSaveShortcut / SearchOverlay 取り込み）。
- 外部監査（Codex）対応も master 反映済み（非同期保存契約 + Phase 2/3 計画改訂）。
- master の検証状態: ユニット 497 pass / E2E 8 pass / type-check / lint すべて green。
- Playwright 動作確認済み。既知の非ブロッカー: `element.ref` React 19 非推奨警告
  （Mantine 7.10 由来・機能影響なし）、`dnd-kit@0.0.2` ゴミ依存。Phase 2 とは独立。

## Phase 2 で特に注意する点

- **アプリ / SDK の境界ルール**: 「FormView/TableView が推移的に import するものは SDK へ移す」。
  計画書の境界定義テーブルに従う。
- **機能不変リファクタ**: 画面挙動を変えない。検証の本質は「Phase 1 完了時と挙動・テスト結果が同一」。
  Task 6・8 の E2E と開発サーバ動作確認を必ず実施。
- 監査指摘で計画に追加済みの項目（HostAPI の `saveProject` 原子保存 API、SDK 命名の
  editor-core 分離検討）は計画書本文に反映済み。そのまま従う。

## Phase 3 への申し送り（Phase 2 では対応不要・忘れないため）

Phase 3 計画書には監査対応で **Task 0（技術検証 PoC）** が追加済み。Phase 3 着手時は
import map / React 同一インスタンス / プラグイン CSS / 専用 dev 配信エンドポイントの
PoC を最初に通すこと。Phase 1 繰り越し設計負債（display:none 常時マウントと xyflow、
ViewDescriptor への capabilities 集約、useMemo churn）も Phase 3 計画に明記済み。

## 関連ドキュメント

- 全体設計: `docs/superpowers/specs/2026-05-20-node-graph-plugin-design.md`
- Phase 2 計画: `docs/superpowers/plans/2026-05-20-node-graph-plugin-phase2.md`
- Phase 3 計画: `docs/superpowers/plans/2026-05-20-node-graph-plugin-phase3.md`
