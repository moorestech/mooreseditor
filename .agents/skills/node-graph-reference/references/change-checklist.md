# 変更手順チェックリスト

## 目次

- [新しいノードタイプを追加する](#新しいノードタイプを追加する)
- [新しいエッジタイプを追加する](#新しいエッジタイプを追加する)
- [保存パイプラインを変更する](#保存パイプラインを変更する)
- [レシピエッジ関連を変更する](#レシピエッジ関連を変更する)
- [削除ロジックを変更する](#削除ロジックを変更する)
- [PropertiesPanelを変更する](#propertiespanelを変更する)
- [コンテキストメニュー・ツールバーを変更する](#コンテキストメニューツールバーを変更する)

## 新しいノードタイプを追加する

### 必須手順

1. `types/nodeGraph.ts` — 新型を定義し`GraphNode`ユニオンに追加
2. `components/nodes/` — コンポーネント作成。`handleStyles.ts`のハンドルサイズ定数を共有
3. `NodeCanvas.tsx` — `nodeTypes`のモジュールスコープ定数に追加。**決してインラインで定義しない**（無限レンダリングの原因）
4. `utils/nodeFactory.ts` — ファクトリ関数追加
5. `utils/exportToMasterHelpers.ts` — `buildNodeGraphFile`のシリアライズに対応
6. `utils/graphMigration.ts` — バリデーション更新

### masterGuid有りの場合（追加手順）

7. `utils/nodeTypeSchema.ts` — `findSchemaIdForNodeType`にマッピング追加
8. `utils/nodeRenderResolvers.ts` — `resolveDisplayNames`で表示名解決の対応確認
9. `utils/masterRecordCreation.ts` — 必要なら新規レコード作成対応

### 確認事項

- [ ] ノードの表示名はSchemaMetaから動的に解決しているか（ハードコードしていないか）
- [ ] 削除時に正しくクリーンアップされるか（`useDeleteHandler`のフロー確認）
- [ ] 保存→再読み込みで正しく復元されるか
- [ ] 既存テスト（`nodeRenderResolvers.test.ts`等）が壊れていないか

## 新しいエッジタイプを追加する

### 必須手順

1. `types/nodeGraph.ts` — 新型を定義し`GraphEdge`ユニオンに追加
2. `components/edges/` — コンポーネント作成（またはDependencyEdgeを再利用）
3. `NodeCanvas.tsx` — `edgeTypes`のモジュールスコープ定数に追加
4. `types/connection.ts` — `ConnectionDecision`ユニオンに追加
5. `hooks/useNodeOperations.ts` — `confirmConnection`に分岐追加
6. `utils/exportToMasterHelpers.ts` — シリアライズ対応

### 確認事項

- [ ] 二重削除パス（`useDeleteHandler` + `onEdgesChange`）の両方で正しく処理されるか
- [ ] `recipeEdgeRefs.ts`の`normalizeRecipeRefsFromEdgeData`で無視されるか（レシピでない場合）
- [ ] `validateGraph`で孤立エッジとして正しく処理されるか

## 保存パイプラインを変更する

### 触るファイル

- `utils/exportToMaster.ts` — メインの統合関数
- `utils/exportToMasterHelpers.ts` — ヘルパー群
- `utils/exportToMasterResearchPatch.ts` — research patchロジック
- `hooks/useNodeExport.ts` — 保存の呼び出し側

### 絶対守ること

- [ ] `validateGraph()`は必ず最初に実行（孤立エッジ除去）
- [ ] `patchResearchColumn`より前に`calculateUnlockedItems`と`buildResearchDependencyMap`を実行
- [ ] `buildNodeGraphFile`にランタイム専用データ（displayName, recipeLabels）が混入しないこと
- [ ] 新しいステップ追加時は、他のステップの入力が変わらないか確認

### 注意

- `setJsonData`が`onRequestSave`の前に呼ばれる現状の順序に注意。保存失敗時の挙動を理解した上で変更する
- patchResearchColumnの`if (dependencies)`分岐は全削除時にstaleデータを残す既知の問題あり

## レシピエッジ関連を変更する

### 関連ファイル群（全て理解してから変更する）

- `utils/recipeEdgeConstants.ts` — 正規表現定数、RECIPE_SCHEMA_MAP
- `utils/recipeEdgeRefs.ts` — レシピ参照の抽出・正規化
- `utils/recipeEdgeLabels.ts` — ラベル生成
- `utils/recipeCleanup.ts` — 孤立レシピ削除
- `components/edges/RecipeEdge.tsx` — 描画・ダブルクリック
- `components/dialogs/edgeTypeDialog/` — ダイアログ内部実装群
- `hooks/useEdgeEditing.ts` — ダイアログ状態管理
- `context/EdgeEditContext.tsx` — 編集トリガーのContext

### レシピフォーマットの3形態

`normalizeRecipeRefsFromEdgeData`は以下の3形態を正規化する:

1. `{ recipeRefs: RecipeReference[] }` — 現在の標準形
2. `{ recipes: RecipeReference[] }` — 永続化形式
3. `{ edgeType: "craftRecipe"|"machineRecipe", masterGuid: string }` — レガシー単一レシピ

**新しいコードでは必ずnormalize関数を通す。** `edge.data.recipeRefs`を直接参照すると、レガシー形式のエッジで空になる。

### ラベル生成の動的判定

`recipeEdgeLabels.ts`はフィールド名を正規表現で分類する（OUTPUT_KEY_RE等）。新しいスキーマのフィールド名がこのパターンにマッチするか確認する。マッチしない場合、ラベルが「名前なし」になる。

## 削除ロジックを変更する

### 二重パスを理解する

1. **React Flow内蔵**: `deleteKeyCode="Delete"` → `onEdgesChange(remove)` → `useGraphChangeHandlers`
2. **カスタム**: `useDeleteHandler` → window keydownリスナー → `deleteSelected()`

両方がレシピクリーンアップを実行する。片方だけを変更すると不整合が生じる。**変更する場合は両方のパスを確認する。**

### ノード削除時のカスケード

- 接続エッジの特定 → レシピクリーンアップ → ノード・エッジ削除
- マスタレコード自体は削除しない（設計通り）
- researchノード削除時、clearedActionsとprevResearchNodeGuidsは保存時に再構築されるため、明示的クリーンアップは不要

## PropertiesPanelを変更する

- `RecordProperties`はFormViewに委譲。スキーマ駆動なので、スキーマ変更で自動反映
- ノードタイプ固有のUIは`PropertiesPanel.tsx`のタイプ分岐で追加
- `NoteProperties`はnote/placeholderのテキスト編集。`UPDATE_NODE_DATA` dispatchでnode.dataを更新
- `schemaAdapter.ts`の`createRecordUpdater`がPropertiesPanel用のレコード更新コールバックを生成

## コンテキストメニュー・ツールバーを変更する

### コンテキストメニュー（右クリック）

- `useContextMenu.ts` — 状態管理、ノード作成ロジック
- `CanvasContextMenu.tsx` — UI表示

### ツールバー（左上）

- `NodeToolbar.tsx` — メインツールバー
- `AddNodeMenu.tsx` — ノード追加メニュー（検索可能レコードリスト）

### 注意

- `useContextMenu`の`existingNodeGuids`はitem/researchのみ追跡。blockは重複チェックされない
- `masterRecordCreation.ts`の`canCreateMasterRecordForNode`でメニュー項目の表示制御
