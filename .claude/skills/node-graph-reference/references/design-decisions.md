# 設計判断と既知の問題

## 目次

- [なぜ三つのデータソースなのか](#なぜ三つのデータソースなのか)
- [なぜ「保存時全再構築」なのか](#なぜ保存時全再構築なのか)
- [レシピの所有権モデル](#レシピの所有権モデル)
- [既知の問題と許容されている制約](#既知の問題と許容されている制約)
- [型安全性の現状と課題](#型安全性の現状と課題)

## なぜ三つのデータソースなのか

ノードエディタは「マスタデータの**可視化レイヤー**」であり、マスタデータそのものではない。items.jsonの中身を直接編集するのではなく、ノードとして視覚的に配置し、エッジで関係性を表現する。この設計から必然的に:

- **マスタデータ（jsonData）** はApp.tsxが管理する「真のデータ」。FormViewでもTableViewでも編集可能
- **グラフファイル（nodeGraph.v1.json）** はノードの位置やエッジ接続という「可視化メタデータ」
- **React Flow状態** はUI操作中の一時的な状態

この分離により、ノードエディタを使わなくてもマスタデータの編集は可能。逆にノードエディタはマスタデータの**全て**を表示する必要はない（一部のアイテムだけグラフに配置してもよい）。

**帰結**: ノードを削除してもマスタレコードは残る。これは設計通り。ノードはビューであってデータではない。

## なぜ「保存時全再構築」なのか

research依存関係(`prevResearchNodeGuids`)やclearedActions（アイテムのアンロック情報）を**編集中にリアルタイム更新する**アプローチもありえた。しかし:

- エッジやノードの追加・削除が頻繁に起きる編集中に、毎回マスタデータを再計算するのは非効率
- 中間状態のマスタデータをjsonDataに書き込むと、FormViewとの整合性が崩れる
- 依存関係の全体像は、全エッジが確定してから計算する方が正確

そのため、保存時にvalidateGraph → calculateUnlockedItems → buildResearchDependencyMap → patchResearchColumnの順で一括再構築する。**保存すれば必ず正しい**という強い保証を提供する代わりに、保存前の画面では依存関係情報は古いまま。

## レシピの所有権モデル

レシピレコード（craftRecipes.json, machineRecipes.json内のレコード）は、エッジと一対多の関係にある:

- 1つのエッジ（RecipeCollectionGraphEdge）が複数のレシピを参照できる
- 同じレシピが複数のエッジから参照されることは想定していない（UIで既に他のエッジに使われているレシピは選択肢に出るが、実運用では通常ない）

**クリーンアップの仕組み**: エッジ削除時に`removeRecipesFromJsonData()`が走り、削除されたエッジのレシピGUIDのうち、残りのエッジで参照されていないものをマスタデータから削除する。

**既知の穴**: エッジ**編集**（EdgeTypeDialogでレシピ参照を差し替える）時には旧レシピのクリーンアップが走らない。差し替え前のレシピがマスタに残る。これを修正する場合、`handleEdgeEditConfirm`内で旧recipeRefsと新recipeRefsの差分を取り、不要になったレシピを削除するロジックを追加する。

## 既知の問題と許容されている制約

### 二重削除ハンドリング

- **現象**: Delete/Backspace押下でReact Flowの組み込みハンドラ（`deleteKeyCode="Delete"`）とカスタム`useDeleteHandler`が両方発火する
- **なぜ問題にならないか**: `setJsonData`のfunctional updater、React Flowの`applyEdgeChanges`の冪等性により実害なし
- **注意**: 片方だけにロジックを追加すると、もう片方を通るケースで不整合が起きる

### dependency全削除でprevResearchNodeGuidsが残る

- **現象**: researchノードの全dependencyエッジを削除→保存すると、`patchResearchColumn`の`if (dependencies)`分岐で`undefined`になり、古い値がクリアされない
- **影響**: マスタデータに不正な依存関係が残る
- **修正方針**: `if (dependencies)`を`if (dependencies !== undefined)`に変更し、空配列でも`prevResearchNodeGuids`を上書きする

### onMarkDirtyの過剰発火

- **現象**: ノード選択・ドラッグだけでApp側の「未保存変更あり」フラグが立つ
- **影響**: ユーザーがデータを変更していないのに「保存しますか？」と聞かれる
- **背景**: React Flowの`onNodesChange`はposition, selection, dimensions等あらゆる変更を含む。データ変更のみをフィルタするには変更タイプの判定が必要

### 保存失敗時の状態乖離

- **現象**: `useNodeExport`で`setJsonData`が`onRequestSave`の前に呼ばれるため、ディスク書き込み失敗時にReact状態だけが更新される
- **修正方針**: `setJsonData`を`onRequestSave`成功後に移動する。ただしUI上の表示が保存完了まで古いままになるトレードオフ

### 空間アンロックの境界条件

- **現象**: item/blockがresearchと完全に同じ座標にある場合、右ゾーンにも下ゾーンにも属さず割当されない
- **影響**: そのアイテムのアンロック情報が欠落する
- **頻度**: 実運用ではまず起きない（手動配置で完全に同じ位置にならない）

## 型安全性の現状と課題

### `Column.data: any`が全ての根源

`useJson.ts`の`Column`型で`data: any`と定義されている。全てのマスタデータアクセスが型なしで行われる。`meta.guidField`や`meta.dataArrayPath`経由でアクセスするため静的型付けが困難だが、ランタイムバリデーションを強化する余地はある。

### `node.data`のキャスト

React Flowの`Node`型は`data: Record<string, unknown>`。コード中で`node.data.masterGuid as string`等のキャストが散在する。ジェネリクス`Node<ItemNodeData>`を使えば安全になるが、現状は未対応。

### `(p as any).type`パターン

`schemaMeta.ts`でスキーマプロパティのtype判定に`as any`キャストを使用。`SwitchSchema`等のtype fieldを持たないスキーマ型との共用体が原因。discriminated unionの型ガードを導入すればas anyを排除できる。
