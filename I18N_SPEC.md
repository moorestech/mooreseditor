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
プロジェクトルート配下のi18nフォルダに、言語別のディレクトリを作成し、schemasディレクトリと同じ構造で翻訳ファイルを配置します。

```
project-root/
├── mooreseditor.config.yaml
├── i18n/
│   ├── en/                    # 英語（デフォルト言語）
│   │   ├── ui.json            # UI翻訳
│   │   └── schema/            # スキーマ翻訳（schemasと同じ構造）
│   │       ├── items.json
│   │       ├── blocks.json
│   │       └── ref/
│   │           ├── inventoryConnects.json
│   │           ├── blockConnectInfo.json
│   │           └── ...
│   ├── ja/                    # 日本語
│   │   ├── ui.json
│   │   └── schema/
│   │       ├── items.json
│   │       ├── blocks.json
│   │       └── ref/
│   │           └── ...
│   └── .../                   # その他の言語
└── schemas/
    ├── items.yml
    ├── blocks.yml
    └── ref/
        ├── inventoryConnects.yml
        ├── blockConnectInfo.yml
        └── ...

```

## JSONフォーマット

### UI翻訳ファイル (ui.json)
フラットなキーバリュー形式で管理します。
```json
{
  "menu.file": "File",
  "menu.open": "Open",
  "button.save": "Save",
  "message.saved": "Data saved successfully"
}
```

### スキーマ翻訳ファイル (schema/**/*.json)
スキーマの構造をそのまま反映した階層構造で管理します。

```json
{
  "title": "スキーマ全体のタイトル",
  "description": "スキーマ全体の説明",
  "properties": {
    "<propertyName>": {
      "title": "プロパティのタイトル",
      "description": "プロパティの説明",
      "placeholder": "プレースホルダー",
      "enum": {
        "<enumValue>": "列挙値の表示名"
      },
      "properties": {
        "<nestedProperty>": {
          "title": "ネストされたプロパティのタイトル"
        }
      },
      "items": {
        "properties": {
          "<itemProperty>": {
            "title": "配列アイテムのプロパティタイトル"
          }
        }
      }
    }
  }
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

#### スキーマキー（schema/**/*.json）
JSONの階層構造をドット記法でつないだパスがキーになります。

- `title` - スキーマ全体のタイトル
- `description` - スキーマ全体の説明
- `properties.<propertyName>.title` - プロパティのタイトル
- `properties.<propertyName>.description` - プロパティの説明
- `properties.<propertyName>.placeholder` - プレースホルダー
- `properties.<propertyName>.enum.<enumValue>` - 列挙値の表示名
- `properties.<propertyName>.properties.<nestedProperty>.title` - ネストされたプロパティ
- `properties.<propertyName>.items.properties.<itemProperty>.title` - 配列アイテムのプロパティ

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

#### en/schema/blocks.json
```json
{
  "title": "Blocks",
  "description": "Block definitions for the game",
  "properties": {
    "data": {
      "title": "Block Data",
      "items": {
        "properties": {
          "blockGuid": {
            "title": "Block ID",
            "description": "Unique identifier for the block"
          },
          "name": {
            "title": "Name",
            "placeholder": "Enter block name"
          },
          "blockType": {
            "title": "Block Type",
            "enum": {
              "Block": "Block",
              "BeltConveyor": "Belt Conveyor",
              "Chest": "Chest",
              "ElectricMachine": "Electric Machine"
            }
          },
          "blockSize": {
            "title": "Block Size",
            "description": "The size of the block in 3D space"
          }
        }
      }
    }
  }
}
```

#### en/schema/ref/blockConnectInfo.json
```json
{
  "title": "Block Connection Info",
  "items": {
    "properties": {
      "connectType": {
        "title": "Connection Type",
        "enum": {
          "Inventory": "Inventory",
          "Gear": "Gear",
          "Fluid": "Fluid"
        }
      },
      "offset": {
        "title": "Offset",
        "description": "Connection point offset"
      },
      "directions": {
        "title": "Directions",
        "description": "Available connection directions"
      }
    }
  }
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

#### ja/schema/blocks.json
```json
{
  "title": "ブロック",
  "description": "ゲーム用のブロック定義",
  "properties": {
    "data": {
      "title": "ブロックデータ",
      "items": {
        "properties": {
          "blockGuid": {
            "title": "ブロックID",
            "description": "ブロックの一意識別子"
          },
          "name": {
            "title": "名前",
            "placeholder": "ブロック名を入力"
          },
          "blockType": {
            "title": "ブロックタイプ",
            "enum": {
              "Block": "ブロック",
              "BeltConveyor": "ベルトコンベア",
              "Chest": "チェスト",
              "ElectricMachine": "電動機械"
            }
          },
          "blockSize": {
            "title": "ブロックサイズ",
            "description": "3D空間でのブロックのサイズ"
          }
        }
      }
    }
  }
}
```

#### ja/schema/ref/blockConnectInfo.json
```json
{
  "title": "ブロック接続情報",
  "items": {
    "properties": {
      "connectType": {
        "title": "接続タイプ",
        "enum": {
          "Inventory": "インベントリ",
          "Gear": "ギア",
          "Fluid": "流体"
        }
      },
      "offset": {
        "title": "オフセット",
        "description": "接続ポイントのオフセット"
      },
      "directions": {
        "title": "方向",
        "description": "使用可能な接続方向"
      }
    }
  }
}
```

## スキーマとの連携

### 翻訳キーの自動解決
スキーマファイルに特別なプロパティは不要です。アプリケーションがスキーマファイルパスとプロパティパスから翻訳ファイルと翻訳キーを特定します。

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

上記のスキーマは、`i18n/<言語>/schema/blocks.json`から翻訳を取得し、以下のキーパスで値を解決します：
- `properties.data.items.properties.name.title`
- `properties.data.items.properties.blockType.enum.Block`
- `properties.data.items.properties.blockType.enum.BeltConveyor`

### refの解決
refで参照されるスキーマは、参照先のスキーマファイルパスに対応する翻訳ファイルから取得します。

```yaml
# blocks.ymlでの参照
- key: inventoryConnectors
  ref: ref/inventoryConnects  # schemas/ref/inventoryConnects.ymlを参照
```

この場合、`i18n/<言語>/schema/ref/inventoryConnects.json`から翻訳を取得します。

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
3. 現在の言語と英語（デフォルト）のui.jsonを読み込み
4. スキーマファイルの読み込み時に、対応するschema/*/*.jsonファイルも読み込み
5. ユーザーが言語を切り替えた場合、対応するディレクトリのファイルを動的に読み込み

## キーの解決方法

### 階層構造の解決
翻訳関数`t(key)`は、ドット区切りのキーを受け取り、JSONオブジェクトを階層的にたどって値を取得します。

例：`t('properties.name.title')`の場合
1. JSONオブジェクトの`properties`プロパティを取得
2. その中の`name`プロパティを取得
3. その中の`title`プロパティの値を返す

### スキーマファイルとの対応
- `schemas/blocks.yml` → `i18n/<言語>/schema/blocks.json`
- `schemas/ref/blockConnectInfo.yml` → `i18n/<言語>/schema/ref/blockConnectInfo.json`
- `schemas/nested/dir/file.yml` → `i18n/<言語>/schema/nested/dir/file.json`