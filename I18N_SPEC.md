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

指摘：言語ごとのフォールバックはなく、英語がデフォルトにするようにしてください。

### 翻訳ファイル
プロジェクトルート配下のi18nフォルダに言語別のJSONファイルを配置します。

```
project-root/
├── mooreseditor.config.yaml
├── i18n/
│   ├── en.json    # 英語
│   ├── ja.json    # 日本語
│   └── ...        # その他の言語
└── schemas/
    └── ...
```

## JSONフォーマット

指摘　基本的には良さそうです。ですが、schemaはそれだけで大きな翻訳ファイルになるので、schemaごとに別ファイルで分けたいです。
jaディレクトリの中に、ui.json、schema_items.json、schema_blocks.jsonのように、schema_スキーマファイル名.jsonのようにしたいです。
また、refの考慮もして欲しいです。

### 基本構造
```json
{
  "locale": "言語コード",
  "name": "言語名",
  "ui": {
    "固定UI要素の翻訳"
  },
  "schema": {
    "スキーマ関連の翻訳"
  }
}
```

### 翻訳キー体系

#### UIキー（固定要素）
エディタの固定UI要素に使用します。

- `ui.menu.<menuId>` - メニュー項目
- `ui.button.<buttonId>` - ボタンラベル
- `ui.dialog.<dialogId>.<element>` - ダイアログ要素
- `ui.message.<messageId>` - システムメッセージ
- `ui.error.<errorId>` - エラーメッセージ

#### スキーマキー（動的要素）
YAMLスキーマから動的に生成される要素に使用します。

- `schema.<schemaName>.<fieldName>.label` - フィールドラベル
- `schema.<schemaName>.<fieldName>.description` - フィールド説明
- `schema.<schemaName>.<fieldName>.placeholder` - プレースホルダー
- `schema.<schemaName>.<fieldName>.enum.<enumValue>` - 列挙値

### 翻訳ファイル例

#### en.json
```json
{
  "locale": "en",
  "name": "English",
  "ui": {
    "menu": {
      "file": "File",
      "open": "Open",
      "save": "Save",
      "exit": "Exit"
    },
    "button": {
      "save": "Save",
      "cancel": "Cancel",
      "add": "Add",
      "delete": "Delete"
    },
    "message": {
      "saved": "Data saved successfully",
      "loading": "Loading..."
    }
  },
  "schema": {
    "items": {
      "name": {
        "label": "Name",
        "description": "Enter the item name",
        "placeholder": "Item name"
      },
      "type": {
        "label": "Type",
        "enum": {
          "weapon": "Weapon",
          "armor": "Armor",
          "consumable": "Consumable"
        }
      }
    }
  }
}
```

#### ja.json
```json
{
  "locale": "ja",
  "name": "日本語",
  "ui": {
    "menu": {
      "file": "ファイル",
      "open": "開く",
      "save": "保存",
      "exit": "終了"
    },
    "button": {
      "save": "保存",
      "cancel": "キャンセル",
      "add": "追加",
      "delete": "削除"
    },
    "message": {
      "saved": "データを保存しました",
      "loading": "読み込み中..."
    }
  },
  "schema": {
    "items": {
      "name": {
        "label": "名前",
        "description": "アイテム名を入力してください",
        "placeholder": "アイテム名"
      },
      "type": {
        "label": "タイプ",
        "enum": {
          "weapon": "武器",
          "armor": "防具",
          "consumable": "消耗品"
        }
      }
    }
  }
}
```

## スキーマとの連携

### x-i18n-keyプロパティ
YAMLスキーマ内で`x-i18n-key`プロパティを使用して翻訳キーを指定します。

```yaml
# schemas/items.yaml
type: object
properties:
  name:
    type: string
    x-i18n-key: "items.name"
    title: "Name"  # フォールバック用
    description: "The name of the item"
  type:
    type: string
    x-i18n-key: "items.type"
    title: "Type"
    enum:
      - weapon
      - armor
      - consumable
```

### 翻訳の解決順序

1. 現在の言語の翻訳ファイルから取得
2. 見つからない場合はフォールバック言語から取得
3. それでも見つからない場合はスキーマのtitle/descriptionを使用
4. 最終的にフィールド名をそのまま表示

## 言語切り替え

ユーザーは以下の方法で言語を切り替えることができます：

1. エディタのUIから言語選択
2. mooreseditor.config.yamlのdefaultLocale設定
3. システムの言語設定（自動検出）

優先順位：ユーザー選択 > 設定ファイル > システム言語

## 翻訳ファイルの読み込み

アプリケーション起動時に以下の処理を行います：

1. mooreseditor.config.yamlからi18n設定を読み込み
2. 指定されたパスから利用可能な言語ファイルを検出
3. デフォルト言語とフォールバック言語のファイルを読み込み
4. ユーザーが言語を切り替えた場合、対応するファイルを動的に読み込み