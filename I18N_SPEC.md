# mooreseditor i18n仕様書

## 概要
mooreseditorは動的スキーマベースのエディタであり、エディタUIと動的に生成されるフィールドの両方を多言語対応します。

## ファイル構成

### 設定ファイル
`mooreseditor.config.yaml`にi18n設定を記述します。

```yaml
i18n:
  path: "i18n"             # i18nフォルダのパス（プロジェクトルートからの相対パス）
```

### 翻訳ファイル
プロジェクトルート配下のi18nフォルダに、言語別のディレクトリを作成し、その中にUIとスキーマごとに分割したJSONファイルを配置します。

```
project-root/
├── mooreseditor.config.yaml
├── i18n/
│   ├── en/                    # 英語（デフォルト言語）
│   │   ├── ui.json            # UI翻訳
│   │   ├── schema_items.json  # itemsスキーマ翻訳
│   │   ├── schema_blocks.json # blocksスキーマ翻訳
│   │   └── schema_*.json      # その他のスキーマ翻訳
│   ├── ja/                    # 日本語
│   │   ├── ui.json
│   │   ├── schema_items.json
│   │   ├── schema_blocks.json
│   │   └── schema_*.json
│   └── .../                   # その他の言語
└── schemas/
    ├── items.yml
    ├── blocks.yml
    ├── ref/                    # refで参照されるスキーマ
    │   ├── inventoryConnects.yml
    │   ├── blockConnectInfo.yml
    │   └── ...
    └── ...

```

## JSONフォーマット

### UI翻訳ファイル (ui.json)
```json
{
  "menu.file": "File",
  "menu.open": "Open",
  "button.save": "Save",
  "message.saved": "Data saved successfully"
}
```

### スキーマ翻訳ファイル (schema_*.json)
スキーマのプロパティパスをキーとして使用します。refで参照されるスキーマも同様の形式で別ファイルとして管理します。

```json
{
  "properties.<propertyName>.title": "プロパティ名",
  "properties.<propertyName>.description": "プロパティの説明",
  "properties.<propertyName>.placeholder": "プレースホルダー",
  "properties.<propertyName>.enum.<enumValue>": "列挙値の表示名"
}
```

### 翻訳キー体系

#### UIキー（ui.json）
エディタの固定UI要素に使用します。フラットなキー構造を採用します。

- `menu.<menuId>` - メニュー項目
- `button.<buttonId>` - ボタンラベル
- `dialog.<dialogId>.<element>` - ダイアログ要素
- `message.<messageId>` - システムメッセージ
- `error.<errorId>` - エラーメッセージ

#### スキーマキー（schema_*.json）
スキーマのプロパティパスをそのままキーとして使用します。

- `properties.<propertyName>.title` - プロパティのタイトル
- `properties.<propertyName>.description` - プロパティの説明
- `properties.<propertyName>.placeholder` - プレースホルダー
- `properties.<propertyName>.enum.<enumValue>` - 列挙値の表示名
- `properties.<propertyName>.properties.<nestedProperty>.title` - ネストされたプロパティ
- `properties.<propertyName>.items.properties.<itemProperty>.title` - 配列アイテムのプロパティ

#### refスキーマ（schema_ref_*.json）
refで参照されるスキーマも同様の形式で管理します。

例：`schema_ref_blockConnectInfo.json`
- `items.properties.connectType.enum.Inventory` - 接続タイプの列挙値
- `items.properties.offset.title` - オフセットのタイトル

### 翻訳ファイル例

#### en/ui.json
```json
{
  "menu.file": "File",
  "menu.open": "Open",
  "menu.save": "Save",
  "menu.exit": "Exit",
  "button.save": "Save",
  "button.cancel": "Cancel",
  "button.add": "Add",
  "button.delete": "Delete",
  "message.saved": "Data saved successfully",
  "message.loading": "Loading..."
}
```

#### en/schema_blocks.json
```json
{
  "properties.data.items.properties.blockGuid.title": "Block ID",
  "properties.data.items.properties.name.title": "Name",
  "properties.data.items.properties.blockType.title": "Block Type",
  "properties.data.items.properties.blockType.enum.Block": "Block",
  "properties.data.items.properties.blockType.enum.BeltConveyor": "Belt Conveyor",
  "properties.data.items.properties.blockType.enum.Chest": "Chest",
  "properties.data.items.properties.blockType.enum.ElectricMachine": "Electric Machine",
  "properties.data.items.properties.blockSize.title": "Block Size",
  "properties.data.items.properties.blockSize.description": "The size of the block in 3D space"
}
```

#### en/schema_ref_blockConnectInfo.json
```json
{
  "items.properties.connectType.title": "Connection Type",
  "items.properties.connectType.enum.Inventory": "Inventory",
  "items.properties.connectType.enum.Gear": "Gear",
  "items.properties.connectType.enum.Fluid": "Fluid",
  "items.properties.offset.title": "Offset",
  "items.properties.directions.title": "Directions"
}
```

#### ja/ui.json
```json
{
  "menu.file": "ファイル",
  "menu.open": "開く",
  "menu.save": "保存",
  "menu.exit": "終了",
  "button.save": "保存",
  "button.cancel": "キャンセル",
  "button.add": "追加",
  "button.delete": "削除",
  "message.saved": "データを保存しました",
  "message.loading": "読み込み中..."
}
```

#### ja/schema_blocks.json
```json
{
  "properties.data.items.properties.blockGuid.title": "ブロックID",
  "properties.data.items.properties.name.title": "名前",
  "properties.data.items.properties.blockType.title": "ブロックタイプ",
  "properties.data.items.properties.blockType.enum.Block": "ブロック",
  "properties.data.items.properties.blockType.enum.BeltConveyor": "ベルトコンベア",
  "properties.data.items.properties.blockType.enum.Chest": "チェスト",
  "properties.data.items.properties.blockType.enum.ElectricMachine": "電動機械",
  "properties.data.items.properties.blockSize.title": "ブロックサイズ",
  "properties.data.items.properties.blockSize.description": "3D空間でのブロックのサイズ"
}
```

#### ja/schema_ref_blockConnectInfo.json
```json
{
  "items.properties.connectType.title": "接続タイプ",
  "items.properties.connectType.enum.Inventory": "インベントリ",
  "items.properties.connectType.enum.Gear": "ギア",
  "items.properties.connectType.enum.Fluid": "流体",
  "items.properties.offset.title": "オフセット",
  "items.properties.directions.title": "方向"
}
```

## スキーマとの連携

### 翻訳キーの自動解決
スキーマファイルに特別なプロパティは不要です。アプリケーションがスキーマのプロパティパスから自動的に翻訳キーを生成します。

```yaml
# schemas/blocks.yml
properties:
- key: data
  type: array
  items:
    type: object
    properties:
    - key: name
      type: string
      title: "Name"  # フォールバック用
    - key: blockType
      type: enum
      options:
      - Block
      - BeltConveyor
```

上記のスキーマから、以下の翻訳キーが自動生成されます：
- `properties.data.items.properties.name.title`
- `properties.data.items.properties.blockType.enum.Block`
- `properties.data.items.properties.blockType.enum.BeltConveyor`

### refの解決
refで参照されるスキーマは、`schema_ref_<ref名>.json`という命名規則で翻訳ファイルを作成します。

```yaml
# blocks.ymlでの参照
- key: inventoryConnectors
  ref: inventoryConnects
```

この場合、`schema_ref_inventoryConnects.json`から翻訳を取得します。

### 翻訳の解決順序

1. 現在の言語の翻訳ファイルから取得
2. 見つからない場合は英語（デフォルト言語）の翻訳ファイルから取得
3. それでも見つからない場合はスキーマのtitle/descriptionを使用
4. 最終的にプロパティのkey名をそのまま表示

## 言語切り替え

ユーザーは以下の方法で言語を切り替えることができます：

1. エディタのUIから言語選択
2. システムの言語設定（自動検出）

優先順位：ユーザー選択 > システム言語 > 英語（デフォルト）

## 翻訳ファイルの読み込み

アプリケーション起動時に以下の処理を行います：

1. mooreseditor.config.yamlからi18nパス設定を読み込み
2. 指定されたパスから利用可能な言語ディレクトリを検出
3. 現在の言語と英語（デフォルト）の翻訳ファイルを読み込み
4. スキーマファイルの読み込み時に、対応するschema_*.jsonファイルも読み込み
5. ユーザーが言語を切り替えた場合、対応するディレクトリのファイルを動的に読み込み

## 命名規則

### スキーマ翻訳ファイル名
- 通常のスキーマ: `schema_<スキーマファイル名>.json`
  - 例: `blocks.yml` → `schema_blocks.json`
- refスキーマ: `schema_ref_<ref名>.json`
  - 例: `ref: inventoryConnects` → `schema_ref_inventoryConnects.json`
  - 例: `ref: blockConnectInfo` → `schema_ref_blockConnectInfo.json`