# 技術コンテキスト: MooresEditor

## 技術スタック

### フロントエンド
- **フレームワーク**: Remix.js（Reactベース）
- **言語**: TypeScript
- **スタイリング**: CSS（具体的なライブラリは未確認）
- **ビルドツール**: Vite

### 開発環境
- **パッケージマネージャー**: pnpm
- **モノレポ管理**: Turborepo
- **コード品質**: ESLint
- **型チェック**: TypeScript

### ファイル形式
- **データ形式**: JSON（主要形式）、YAML（参照用のみ、実際にはサポートされていない）
- **設定ファイル**: TypeScript, JavaScript

## 開発セットアップ

### 必要条件
- Node.js（バージョン16以上推奨）
- pnpm
- モダンブラウザ（Chrome, Firefox, Safari, Edge）

### 開発環境セットアップ
```bash
# リポジトリのクローン
git clone <repository-url>

# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm dev
```

### ビルドプロセス
```bash
# プロダクションビルド
pnpm build

# ビルド成果物のプレビュー
pnpm preview
```

## プロジェクト構造

```
mooreseditor/
├── apps/                    # アプリケーション
│   └── mooreseditor/        # メインアプリケーション
│       ├── app/             # Remixアプリケーションコード
│       │   ├── components/  # UIコンポーネント
│       │   ├── hooks/       # カスタムReactフック
│       │   ├── routes/      # アプリケーションルート
│       │   └── schema/      # スキーマ定義ファイル
│       ├── public/          # 静的アセット
│       └── ...              # 設定ファイル
├── packages/                # 共有パッケージ
│   ├── eslint-config-custom/ # ESLint設定
│   ├── tsconfig/            # TypeScript設定
│   └── ui/                  # 共有UIコンポーネント
├── SampleProject/           # サンプルプロジェクト
└── testMod/                 # テスト用モッドデータ
```

## 依存関係

### 主要な依存関係
- **Remix.js**: ルーティング、サーバーサイドレンダリング、クライアントサイドナビゲーション
- **React**: UIコンポーネントライブラリ
- **TypeScript**: 静的型付け
- **js-yaml**: YAMLパーサー/シリアライザー

### 開発依存関係
- **ESLint**: コード品質管理
- **Vite**: 高速な開発サーバーとビルドツール
- **Turborepo**: モノレポ管理

## 技術的制約

### ブラウザ互換性
- モダンブラウザ（Chrome, Firefox, Safari, Edge）の最新2バージョンをサポート
- Internet Explorerはサポート対象外

### パフォーマンス考慮事項
- 大規模なスキーマファイル（数千のエントリ）の処理
- 複雑な相互参照を持つデータの編集と検証
- ファイルシステムアクセスのブラウザ制限

### セキュリティ考慮事項
- ローカルファイルシステムへのアクセス（File System Access API）
- ユーザー提供のスキーマの安全な解析と検証

## ツール使用パターン

### データ変換
- JSON <-> JavaScript オブジェクト
- スキーマ定義 <-> エディタUI
- 注: YAMLファイルは参照用のみで、実際の変換処理はサポートされていない

### ファイルシステム操作
- File System Access APIを使用したファイル読み書き
- ディレクトリ構造の管理

### 状態管理
- React Contextを使用したアプリケーション状態の管理
- フォーム状態の管理（検証、ダーティチェックなど）

### 型システム
- TypeScriptインターフェースとタイプの広範な使用
- ジェネリック型を使用した再利用可能なコンポーネント