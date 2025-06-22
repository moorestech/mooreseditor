# mooreseditor - Claude向け開発ガイド

## プロジェクト概要
mooreseditorは、JSONデータをスキーマに基づいて編集するためのTauriアプリケーションです。

## 主要なコマンド

### 開発環境の起動
```bash
pnpm run tauri dev
```

### リントとタイプチェック
```bash
pnpm run lint
pnpm run typecheck
```

### テストの実行
```bash
pnpm run test
```

## Playwrightを使ったデバッグ方法

### 基本的な手順

1. **ブラウザを開く**
```
mcp__playwright__browser_navigate でhttp://localhost:1420/にアクセス
```

2. **要素をクリック**
```
mcp__playwright__browser_click で要素を選択
- element: クリックする要素の説明
- ref: スナップショットからの要素参照
```

3. **テキスト入力**
```
mcp__playwright__browser_type でテキストボックスに入力
- element: 入力する要素の説明
- ref: 要素参照
- text: 入力するテキスト
```

4. **キーボードショートカット**
```
mcp__playwright__browser_press_key でキーを押す
例: Control+s（保存）
```

5. **コンソールログの確認**
```
mcp__playwright__browser_console_messages でブラウザコンソールのメッセージを取得
- エラーの確認
- console.logの出力確認
- 保存されたデータの確認
```

### よく使うデバッグパターン

#### データ保存のテスト
1. FileOpenボタンをクリック
2. メニュー項目（mapObjects等）を選択
3. フィールドに値を入力
4. Ctrl+Sで保存
5. コンソールログで保存されたJSONを確認

#### 複数フィールドの変更確認
1. 最初のフィールドを変更して保存
2. コンソールログで確認
3. 別のフィールドを変更して保存
4. 前回の変更が保持されているか確認

### 注意点
- 開発環境（http://localhost:1420/）で実行すること
- Tauriのinvokeエラーは開発環境では無視してよい
- サンプルプロジェクトでは実際のファイル保存はスキップされる

## アーキテクチャ

### ディレクトリ構造
- `/src/components/` - UIコンポーネント
- `/src/hooks/` - カスタムフック
- `/src/utils/` - ユーティリティ関数
- `/src/libs/schema/` - スキーマ関連の型定義

### 主要なコンポーネント
- `App.tsx` - メインアプリケーション、状態管理
- `FormView` - フォーム形式でのデータ編集
- `TableView` - テーブル形式でのデータ表示
- `EditView` - 個別アイテムの編集

### データフロー
1. JSONファイルの読み込み（useJson）
2. スキーマの読み込み（useSchema）
3. FormView/TableViewでの編集
4. onDataChangeによる状態更新
5. Ctrl+Sで全データを保存

## コーディング規約

### エラーハンドリング
- 環境判定のためのif文は避け、try-catchパターンを使用する
- 本番環境のコードを先に試し、失敗した場合に開発環境用のフォールバックを実行する
- 例：
  ```typescript
  // 良い例
  try {
    // 本番環境のファイル読み込みを試行
    const content = await readTextFile(filePath);
  } catch (error) {
    // 開発環境用のフォールバック
    const content = await getSampleData();
  }
  
  // 避けるべき例
  if (isDev) {
    const content = await getSampleData();
  } else {
    const content = await readTextFile(filePath);
  }
  ```