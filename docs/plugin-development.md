# mooreseditor プラグイン開発ガイド

mooreseditor のプラグインは、ユーザーが開いたプロジェクトから実行時に読み込まれる Vite/React 製の外部 bundle です。新規プラグインは npm 公開済みの SDK を使って作ります。

```sh
npm install @moorestech/mooreseditor-plugin-sdk
```

npm: https://www.npmjs.com/package/@moorestech/mooreseditor-plugin-sdk

SDK はホストアプリとプラグインの実行時契約です。対象にする mooreseditor が同梱している SDK と同じバージョンを exact pin してください。例: `"@moorestech/mooreseditor-plugin-sdk": "1.0.0"`。固定リリース向けのプラグインでは `^1.0.0` のような範囲指定は避けます。

## まず starter から作る

対応 starter は [examples/external-plugin-starter](../examples/external-plugin-starter) です。

```sh
cp -R examples/external-plugin-starter ../my-mooreseditor-plugin
cd ../my-mooreseditor-plugin
npm install
npm run build
```

ビルド成果物:

- `dist/index.js`: プラグイン本体の ESM bundle
- `dist/index.css`: Vite が CSS を出力した場合のスタイル
- `plugin.json`: mooreseditor が読む実行時 manifest

## 基本ファイル構成

外部プラグインの最小構成は次の形です。

```text
my-mooreseditor-plugin/
├── package.json
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── pluginMetadata.ts
    ├── plugin-entry.tsx
    └── MyPluginView.tsx
```

`src/pluginMetadata.ts` に id/name/version を集約します。

```ts
export const pluginMetadata = {
  id: "my-plugin",
  name: "My Plugin",
  version: "0.1.0",
} as const;
```

`src/plugin-entry.tsx` は `PluginManifest` を default export します。

```tsx
import { MyPluginView } from "./MyPluginView";
import { pluginMetadata } from "./pluginMetadata";

import type {
  HostAPI,
  PluginManifest,
  PluginView,
} from "@moorestech/mooreseditor-plugin-sdk";

const manifest: PluginManifest = {
  ...pluginMetadata,
  createView(host: HostAPI): PluginView {
    return {
      render: () => <MyPluginView projectDir={host.projectDir} />,
      save: async () => {
        await host.saveProject(host.getColumns());
      },
      isDirty: () => false,
    };
  },
};

export default manifest;
```

`vite.config.ts` では SDK の Vite helper を使います。

```ts
import react from "@vitejs/plugin-react";
import { mooresPlugin } from "@moorestech/mooreseditor-plugin-sdk/vite";
import { defineConfig, mergeConfig } from "vite";

import { pluginMetadata } from "./src/pluginMetadata";

export default defineConfig(
  mergeConfig({ plugins: [react()] }, mooresPlugin(pluginMetadata)),
);
```

`mooresPlugin(pluginMetadata)` は `src/plugin-entry.tsx` を entry にし、`dist/index.js` と `plugin.json` を出力します。React、Mantine、SDK などのホスト共有依存は bundle に含めず、mooreseditor 側の実行時インスタンスを使います。

## HostAPI

プラグインは `PluginManifest.createView(host)` で `HostAPI` を受け取ります。

主な用途:

- `getColumns()` / `setColumns()` で master カラムを読み書きする
- `schemas` / `loadSchema(name)` でロード済みスキーマを参照する
- `projectDir` / `masterDir` でプロジェクトパスを読む
- `markDirty()` でホストへ未保存変更を通知する
- `saveExtraFile(relativePath, content)` でプラグイン専用ファイルを保存する
- `readExtraFile(relativePath)` でプラグイン専用ファイルを読む
- `saveProject(columns, extraFiles)` で master データとプラグイン専用ファイルをまとめて保存する

`saveExtraFile`、`readExtraFile`、`saveProject(..., extraFiles)` に渡すパスはプロジェクト相対パスにしてください。絶対パスや `..` でプロジェクト外へ出る指定は使いません。

## プロジェクトへの配置

ビルドした `plugin.json` と `dist/` を、mooreseditor で開くプロジェクト配下へコピーします。

```text
<project>/
├── mooreseditor.config.yml
└── plugins/
    └── my-plugin/
        ├── plugin.json
        └── dist/
            ├── index.js
            └── index.css
```

`<project>/mooreseditor.config.yml` にプラグインを宣言します。

```yaml
plugins:
  - dir: ./plugins/my-plugin
```

現在の production loader は `plugins/<name>` 形式のディレクトリをサポートしています。配置先はこの形にしてください。

## 依存関係のルール

ホスト共有依存は bundle に含めず、`peerDependencies` と `devDependencies` に置きます。

- `react`
- `react-dom`
- `@mantine/core`
- `@mantine/hooks`
- `@mantine/notifications`
- `@tabler/icons-react`
- `@moorestech/mooreseditor-plugin-sdk`

プラグインだけが使う runtime package は通常の `dependencies` に置けます。SDK helper が共有依存として扱わない `@tauri-apps/*` などはプラグイン bundle に含まれます。

## レガシー手順との違い

古い移行メモには、モノレポ内 workspace 前提、静的 import による暫定ロード、Vite/Rollup の手動 external 設定などが残っています。これらは実装移行の履歴であり、新規プラグイン作成手順ではありません。

新規プラグインでは次を使います。

- npm の `@moorestech/mooreseditor-plugin-sdk`
- `@moorestech/mooreseditor-plugin-sdk/vite` の `mooresPlugin(pluginMetadata)`
- Vite helper が生成する `plugin.json`
- `<project>/plugins/<name>/` への配置と `mooreseditor.config.yml` の `plugins:` 宣言
