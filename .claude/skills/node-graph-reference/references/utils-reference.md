# ユーティリティ関数リファレンス

`src/nodeEditor/utils/`内の全ユーティリティ関数のクイックリファレンス。

## 目次

- [スキーマ関連](#スキーマ関連)
- [ノードファクトリ](#ノードファクトリ)
- [レコード操作](#レコード操作)
- [レンダリング解決](#レンダリング解決)
- [保存パイプライン](#保存パイプライン)
- [バリデーション](#バリデーション)
- [レシピ関連](#レシピ関連)
- [空間アルゴリズム](#空間アルゴリズム)
- [マスタレコード作成](#マスタレコード作成)

## スキーマ関連

### schemaMeta.ts

| 関数                 | 引数                 | 返値                      | 用途                       |
| -------------------- | -------------------- | ------------------------- | -------------------------- |
| `extractSchemaMeta`  | `(schemaId, schema)` | `SchemaMeta`              | 1スキーマからメタ情報抽出  |
| `buildSchemaMetaMap` | `(schemas)`          | `Map<string, SchemaMeta>` | 全スキーマのメタマップ構築 |

### nodeTypeSchema.ts

| 関数                      | 引数                | 返値             | 用途                          |
| ------------------------- | ------------------- | ---------------- | ----------------------------- |
| `findSchemaIdForNodeType` | `(nodeType, metas)` | `string \| null` | ノードtype→schemaIdマッピング |

## ノードファクトリ

### nodeFactory.ts

| 関数                    | 引数                     | 返値            | 用途                  |
| ----------------------- | ------------------------ | --------------- | --------------------- |
| `createItemNode`        | `(guid, position, name)` | `ReactFlowNode` | itemノード生成        |
| `createBlockNode`       | `(guid, position, name)` | `ReactFlowNode` | blockノード生成       |
| `createResearchNode`    | `(guid, position, name)` | `ReactFlowNode` | researchノード生成    |
| `createNoteNode`        | `(position, text?)`      | `ReactFlowNode` | noteノード生成        |
| `createPlaceholderNode` | `(position, text?)`      | `ReactFlowNode` | placeholderノード生成 |

## レコード操作

### recordLookup.ts

| 関数         | 引数                          | 返値             | 用途                                             |
| ------------ | ----------------------------- | ---------------- | ------------------------------------------------ |
| `getRecords` | `(schemaId, jsonData, metas)` | `{guid, name}[]` | スキーマIDからレコード一覧取得（メニュー表示用） |

### schemaAdapter.ts

| 関数                  | 引数                          | 返値                     | 用途                                      |
| --------------------- | ----------------------------- | ------------------------ | ----------------------------------------- |
| `createRecordUpdater` | `(meta, guid, setter, dirty)` | `(field, value) => void` | PropertiesPanel用レコード更新コールバック |

## レンダリング解決

### nodeRenderResolvers.ts

| 関数                      | 引数                       | 返値              | 用途                                      |
| ------------------------- | -------------------------- | ----------------- | ----------------------------------------- |
| `resolveDisplayNames`     | `(nodes, jsonData, metas)` | `ReactFlowNode[]` | 全ノードの表示名解決（consumeLabels含む） |
| `resolveEdgeRecipeLabels` | `(edges, jsonData, metas)` | `ReactFlowEdge[]` | 全エッジのレシピラベル解決                |

## 保存パイプライン

### exportToMaster.ts

| 関数             | 引数                                        | 返値                              | 用途                       |
| ---------------- | ------------------------------------------- | --------------------------------- | -------------------------- |
| `exportToMaster` | `(nodes, edges, viewport, jsonData, metas)` | `{updatedColumns, nodeGraphFile}` | 保存パイプライン全体を統合 |

### exportToMasterHelpers.ts

| 関数                   | 用途                                             |
| ---------------------- | ------------------------------------------------ |
| `buildNodeGraphFile`   | ReactFlowノード/エッジ→NodeGraphFileシリアライズ |
| `updateClearedActions` | clearedActionsの更新                             |

### exportToMasterResearchPatch.ts

| 関数                         | 用途                                                                  |
| ---------------------------- | --------------------------------------------------------------------- |
| `buildResearchDependencyMap` | dependencyエッジからresearch間の依存関係マップ構築                    |
| `patchResearchColumn`        | research masterデータにprevResearchNodeGuids + clearedActions書き込み |

### importFromMaster.ts

| 関数                       | 用途                                             |
| -------------------------- | ------------------------------------------------ |
| `importResearchFromMaster` | researchマスタデータからグラフをブートストラップ |

## バリデーション

### graphMigration.ts

| 関数                 | 引数     | 返値                    | 用途                            |
| -------------------- | -------- | ----------------------- | ------------------------------- |
| `validateAndMigrate` | `(data)` | `NodeGraphFile \| null` | raw JSONのパース+バリデーション |

### graphValidator.ts

| 関数            | 引数             | 返値             | 用途             |
| --------------- | ---------------- | ---------------- | ---------------- |
| `validateGraph` | `(nodes, edges)` | `{nodes, edges}` | 孤立エッジの除去 |

## レシピ関連

### recipeEdgeConstants.ts

| 定数                | 用途                              |
| ------------------- | --------------------------------- |
| `RECIPE_SCHEMA_MAP` | レシピタイプ→スキーマIDマッピング |
| `OUTPUT_KEY_RE`     | 出力フィールド判定正規表現        |
| `INPUT_KEY_RE`      | 入力フィールド判定正規表現        |
| `BLOCK_KEY_RE`      | ブロック参照判定正規表現          |
| `COUNT_KEY_RE`      | 数量フィールド判定正規表現        |

### recipeEdgeRefs.ts

| 関数                              | 用途                                       |
| --------------------------------- | ------------------------------------------ |
| `extractRecipeRefsFromGraphEdge`  | GraphEdgeからRecipeReference[]を抽出       |
| `normalizeRecipeRefsFromEdgeData` | React FlowエッジdataからrecipeRefsを正規化 |

### recipeEdgeLabels.ts

| 関数                       | 用途                        |
| -------------------------- | --------------------------- |
| `buildRecipeEdgeLabels`    | 1エッジの全レシピラベル生成 |
| `buildSingleRecipeSummary` | 1レシピの要約テキスト生成   |
| `buildForeignNameResolver` | GUID→名前リゾルバー構築     |

### recipeCleanup.ts

| 関数                        | 用途                                 |
| --------------------------- | ------------------------------------ |
| `removeRecipesFromJsonData` | 孤立レシピレコードのマスタデータ削除 |

## 空間アルゴリズム

### spatialUnlock.ts

| 関数                     | 引数                       | 返値                             | 用途                                      |
| ------------------------ | -------------------------- | -------------------------------- | ----------------------------------------- |
| `calculateUnlockedItems` | `(nodes, jsonData, metas)` | `Map<researchGuid, itemGuids[]>` | キャンバス位置からresearch→itemの空間割当 |

ゾーン判定ルール:

- **右ゾーン**: `item.x > research.x AND item.y >= research.y`
- **下ゾーン**: `item.y > research.y AND item.x <= research.x`
- マンハッタン距離が最も近いresearchノードに割当

## マスタレコード作成

### masterRecordCreation.ts

| 関数                           | 用途                                                   |
| ------------------------------ | ------------------------------------------------------ |
| `canCreateMasterRecordForNode` | ノードタイプに対してマスタレコード新規作成が可能か判定 |
| `createMasterRecordForNode`    | 新規item/researchレコードを生成しjsonDataに追加        |
