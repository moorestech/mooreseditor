# 外部リポジトリでのプラグイン開発を可能にする — SDK の npm 公開

作成日: 2026-05-22

## 背景と目的

現在 mooreseditor のプラグインは、このモノレポ内の `plugins/<name>/` でしか開発できない。
理由は `@mooreseditor/plugin-sdk` が `private: true` かつ workspace シンボリックリンク経由
（`main: ./src/index.ts` で生TSソース出荷）でしか参照できないため。

本タスクのゴール:

1. `@mooreseditor/plugin-sdk` を npm 公開可能なパッケージにする
2. 外部リポジトリでプラグインを開発するためのスターターテンプレートを用意する
3. モノレポの完全に外にテストリポジトリを作り、別リポジトリ製プラグインが
   実際に動作することを検証する

実 npm への publish 自体は検証成功後にユーザー承認を得てから行う（本タスクのスコープ外）。

## 重要な前提・制約

- `@mooreseditor/plugin-sdk` は `SHARED_DEPENDENCIES` に含まれており、**ランタイムでは
  ホストアプリから共有供給される**。外部プラグインの bundle には SDK は同梱されず、
  npm パッケージは「ビルド時の型・API 提供」用途。
- したがって外部プラグインがビルド対象とする SDK バージョンは、配布先 mooreseditor
  本体ビルドが同梱する SDK バージョンと export 互換でなければならない（バージョン契約）。
- `@tauri-apps/*` は EXTERNAL にせず、プラグイン bundle に同梱する。
- モノレポ内のホスト (`apps/mooreseditor`) は従来どおり workspace 経由で SDK の `src/`
  を参照し続ける。ビルド・開発体験は無変更。

## セクション 1 — SDK の npm パッケージ化

`packages/plugin-sdk` は2つの「顔」を持つため別扱いにする。

### `.`（メインエントリ） — React コンポーネント / 型 / フック

- `tsup` でビルド → `dist/index.js`（ESM）+ `dist/index.d.ts`
- 自身の依存（`@dnd-kit/*`, `uuid`, `yaml`, `zod`, `json-schema-ref-resolver`）は
  external のまま（npm が解決）

### `./vite`（ビルドツール） — `mooresPlugin()` / `SHARED_DEPENDENCIES` 等

- Node 向け。既にプレーン `.js` で書かれているため、そのまま `dist/vite/` へコピーして同梱

### `package.json` の変更

- `private: true` を削除
- `version` を `0.0.0` → `1.0.0`
- `publishConfig.exports` で publish 時のみ `dist/` を指す
  （モノレポ内の `exports` は `src/` のまま据え置き → 開発体験・ホットリロード維持）
- `publishConfig.access: "public"` を追加（スコープ付きパッケージのため必須）
- `files`, `repository`, `license` を追加
- `build` / `prepack` スクリプトを追加（publish 前に必ずビルド）
- `workspace:*` の内部 devDeps（`@mooreseditor/eslint-config`,
  `@mooreseditor/typescript-config`）は devDependencies のため公開 tarball に含まれず
  影響なし。確認のみ行う。

ホスト側 `apps/mooreseditor` は workspace 経由で従来どおり `src/` を参照するため、
ビルドは無変更で通る。

## セクション 2 — 外部プラグイン用スターターテンプレート

このリポジトリ内に `examples/external-plugin-starter/` を用意する。別リポジトリに
コピーすれば動く最小テンプレート。`node-graph` を元に workspace 依存を実バージョンに
置き換えたもの。

```
external-plugin-starter/
├── package.json          # workspace:* を排除、@mooreseditor/plugin-sdk は ^1.0.0
├── vite.config.ts        # mooresPlugin(pluginMetadata) を呼ぶだけ
├── tsconfig.json         # モノレポの共有 config に依存しない自己完結版
├── src/
│   ├── pluginMetadata.ts
│   ├── plugin-entry.tsx  # PluginManifest を default export
│   └── MyPluginView.tsx  # 最小の動作確認用ビュー
└── README.md             # ビルド → 対象プロジェクトへの配置手順
```

### バージョン契約の扱い

- モノレポ内の `scripts/check-plugin-contracts.ts` は host/sdk/node-graph しか
  検証しない。外部リポジトリには効かない。
- 対策: スターターの `package.json` の peerDependencies を SDK の
  `SHARED_DEPENDENCIES` と完全一致させる（`react ^19`, `@mantine/* ^7.10.2` 等）。
- `vite.config.ts` の `mooresPlugin()` が `sharedDependencySpecs()` を使って
  external 化するため、bundle 内容は SDK バージョンに自動追従する。
- README に「SDK のバージョンは配布先 mooreseditor 本体のリリースに対応させること」を明記。
- `@tauri-apps/*` はスターターでも通常 dependency（bundle 同梱、external にしない）。

## セクション 3 — 検証フロー（Verdaccio + テストリポジトリ）

1. **ローカルレジストリ起動**

   - `npx verdaccio` を `localhost:4873` で起動（バックグラウンド）
   - 認証ユーザーを作成（`npm adduser --registry http://localhost:4873`）

2. **SDK を Verdaccio へ publish**

   - `pnpm --filter @mooreseditor/plugin-sdk run build`
   - `npm publish --registry http://localhost:4873`
   - `publishConfig.exports` が dist に差し替わることを確認

3. **テストリポジトリ作成（モノレポの完全に外）**

   - 場所: `~/WebstormProjects/mooreseditor-plugin-test/`（独立 `git init`）
   - スターターテンプレートをコピーして配置
   - `.npmrc` で `@mooreseditor` スコープのみ Verdaccio に向ける
     （React 等は通常の npm から取得）
   - `npm install` → `npm run build` で `dist/index.js` / `index.css` /
     `plugin.json` が生成されること

4. **bundle 内容の検証**

   - `dist/index.js` で shared deps（react, @mantine/\*, @mooreseditor/plugin-sdk 等）が
     `import` 文として external 化され、bundle に同梱されていないこと
   - `@tauri-apps/*` は逆に同梱されていること
   - `plugin.json` の `id/name/version` が `pluginMetadata` と一致すること

5. **E2E 動作確認**
   - ビルド成果物をモノレポ内のサンプルプロジェクト（または対象プロジェクト）の
     `plugins/<name>/` に配置
   - `mooreseditor.config.yml` に `plugins: - dir:` を追加
   - `pnpm run tauri:dev` でホスト起動 → タブが増え、ビューが表示されることを確認

## 完了条件

- セクション1: `packages/plugin-sdk` が npm 公開対応になっている
- セクション2: `examples/external-plugin-starter/` が存在する
- セクション3: 上記検証フロー 1〜5 がすべて通り、別リポジトリ製プラグインが
  ホスト上で動作することが実証されている

## 成果物

- `packages/plugin-sdk` の npm 公開対応（セクション1）
- `examples/external-plugin-starter/`（セクション2）
- `~/WebstormProjects/mooreseditor-plugin-test/`（検証用、使い捨て・モノレポ外）
- 本設計ドキュメント

## スコープ外（フォローアップ）

- 実 npm レジストリへの `@mooreseditor/plugin-sdk` の publish
  （検証成功後にユーザー承認を得てから実施）
- 外部開発者向けの公開ドキュメント整備
