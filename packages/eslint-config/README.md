# `@repo/eslint-config`

## 使用方法

1. 既存のmonorepoプロジェクトにおいて、`packages/`配下にサブモジュールとしてこのリポジトリを追加してください。
2. `package.json`の`lint`スクリプトに`eslint --cache --cache-location ./node_modules/.cache/eslint ./**/*.ts`を登録してください。

以降、`pnpm run lint`でESLintが実行されます。
