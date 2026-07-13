# Schema Renderer Exhaustiveness Design

## Goal

新しいスキーマ種別を `ValueSchema` に追加したとき、フォームUIまたは初期値生成への対応漏れを TypeScript のコンパイルエラーとして検出する。既存のYAMLスキーマ、plugin-sdkの公開API、保存データ形式は変更しない。

## Scope

- plugin-sdk にスキーマ種別の正本を追加する。
- primitive schema の初期値生成を1つの網羅的なレジストリへ集約し、`DataInitializer` と `createInitialValue` から共用する。
- FormView のフィールド描画を switch/object/array/primitive の専用コンポーネントへ分離し、schema kind が変わっても同一コンポーネントの hook 構成が変わらないようにする。
- primitive input renderer を `PrimitiveSchema["type"]` に対する網羅的なレジストリにする。
- `loop`、`oneshot`、`buttons` など特定マスタの名前はランタイム実装へ追加しない。

validator、schemaToZod、UUID走査など全スキーマ処理レイヤーの再編は今回の対象外とする。これらは別の大規模リファクタとして扱う。

## Architecture

`schema/schemaTypes.ts` を schema kind の正本とする。`VALUE_SCHEMA_TYPES` は `ValueSchema["type"]` をキーとする `Record` を `satisfies` し、unionへkindを追加したのに正本を更新しなかった場合をコンパイルエラーにする。同ファイルから structured/primitive のkind判定も提供する。

初期値生成は `utils/primitiveDefaultValue.ts` に集約する。各primitive kindのfactoryを mapped typeで定義し、新しいprimitive kindにfactoryがない場合をコンパイルエラーにする。必須フィールドのみを作る経路と全フィールドを作る互換経路の両方がこの関数を利用する。

FormViewの `Field` はschema categoryを判別するだけにし、hookを持つ処理は専用コンポーネントへ移す。schema kindが array から object へ変わるとReactが別コンポーネントとして扱うため、hook順序の事故を構造的に防げる。primitive rendererはkind別のmapped registryにし、union追加時のUI対応漏れをコンパイルエラーにする。

## Data Flow

1. YAMLから読み込まれた `Schema` を `Field` が受け取る。
2. switch schemaは参照値からcaseを動的に解決し、caseの `ValueSchema` を再度 `Field` へ渡す。
3. value schemaは object/array/primitive の専用rendererへ委譲される。
4. primitive rendererはschema kindをキーに入力コンポーネントを選ぶ。
5. 初期値が必要な場合はstructured schemaを再帰し、primitive leafは共通factoryから値を作る。

## Error Handling

型付けされた未対応kindはコンパイル時に失敗させる。外部入力として未知のkindが到達した場合は既存と同様、フォーム上に `Unsupported type: <kind>` を表示し、アプリ全体はクラッシュさせない。

## Testing

- schema kind判定は既知kindと未知kindをテストする。
- primitive default factoryは全kind、明示default、UUID自動生成をテストする。
- `DataInitializer` と `createInitialValue` の既存テストで互換性を確認する。
- FormViewは全primitive inputのdispatchと、object-array caseからobject caseへの切替をテストする。
- plugin-sdkのtest/lint/type-check、mooreseditorのlint/buildを実行する。
- `elevator-real` を実アプリで開き、States Node Editorで loop → oneshot → loop を操作してクラッシュしないことを確認する。

## Compatibility

YAML構文、schema interface、JSONデータ、Tauri command、plugin APIに変更はない。既存スキーマは同じ入力UIと初期値を得る。
