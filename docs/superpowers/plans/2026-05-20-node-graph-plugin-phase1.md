# ノードグラフのプラグイン化 Phase 1 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `feature/node-graph-system` ブランチのノード非依存な汎用機能を master に取り込み、`mode` 固定切替を「ビューホスト」へ一般化する。完了時点でノードグラフは未統合だが、Editor が従来どおり動作する。

**Architecture:** ビルド/開発基盤・汎用バグ修正・foreignKey 強化を `feature/node-graph-system` から `git checkout` でファイル単位ポートする。`App.tsx` の `mode: "editor" | "node"` 固定を `ViewDescriptor[]` + `activeViewId` のビューレジストリへ一般化し、`saveProjectData` / `useSaveShortcut` からノード固有引数を除去する。検索オーバーレイを取り込み、ノードジャンプ部分は「アクティブビューが任意で公開する `focusSearchMatch` 能力」へ一般化する。

**Tech Stack:** React 19 / TypeScript / Mantine / Vite / Tauri / Vitest / Playwright / mark.js

設計ドキュメント: `docs/superpowers/specs/2026-05-20-node-graph-plugin-design.md`

---

## 前提と共通ルール

- 作業ブランチ: master から新ブランチ `feature/view-host-phase1` を切って作業する。
- ポート元ブランチ: `feature/node-graph-system`（以後「ソースブランチ」）。
- **ノード依存をmasterへ持ち込まない**: 各タスク末尾で
  `git grep -l -E "nodeEditor|NodeGraphFile" apps/mooreseditor/src` を実行し、
  意図しない `nodeEditor` 参照が残っていないことを確認する。
- 各タスクの検証コマンド（プロジェクトルートから実行）:
  - 型チェック: `pnpm run type-check`
  - リント: `pnpm run lint`
  - ユニットテスト: `pnpm run test`
- コミットはタスクごと。コミットメッセージ末尾に
  `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>` を付ける。

## File Structure

| ファイル                                             | 責務                               | 操作           |
| ---------------------------------------------------- | ---------------------------------- | -------------- |
| `apps/mooreseditor/vite-plugins/devFsPlugin.ts`      | dev サーバの FS API                | ポート（新規） |
| `apps/mooreseditor/vite.config.ts`                   | Vite 設定                          | ポート（更新） |
| `apps/mooreseditor/tsconfig.json`                    | TS 設定                            | ポート（更新） |
| `packages/eslint-config/src/*.mjs`                   | 共有 eslint 設定                   | ポート（更新） |
| `packages/typescript-config/base.json`               | 共有 tsconfig                      | ポート（更新） |
| `package.json`（ルート）                             | スクリプト追加                     | 更新           |
| `apps/mooreseditor/package.json`                     | 依存追加                           | 更新           |
| `apps/mooreseditor/src/utils/*` 各種                 | 汎用バグ修正                       | ポート（更新） |
| `apps/mooreseditor/src/libs/schema/types.ts`         | スキーマ型・foreignKey 判定        | ポート（更新） |
| `apps/mooreseditor/src/components/FormView/*`        | foreignKey 入力                    | ポート（更新） |
| `apps/mooreseditor/src/components/TableView/*`       | foreignKey セル                    | ポート（更新） |
| `apps/mooreseditor/src/components/EditorView.tsx`    | 編集ビュー本体（App から抽出）     | ポート（新規） |
| `apps/mooreseditor/src/viewHost/types.ts`            | ビューホスト契約型                 | 新規作成       |
| `apps/mooreseditor/src/utils/saveProjectData.ts`     | プロジェクト保存（ノード非依存版） | 新規作成       |
| `apps/mooreseditor/src/hooks/useSaveShortcut.ts`     | Ctrl+S（一般化版）                 | 新規作成       |
| `apps/mooreseditor/src/components/SearchOverlay.tsx` | アプリ内検索                       | ポート（新規） |
| `apps/mooreseditor/src/types/markjs.d.ts`            | mark.js 型定義                     | ポート（新規） |
| `apps/mooreseditor/src/App.tsx`                      | ビューホスト統合                   | 全面書き換え   |

---

## Task 1: ビルド/開発基盤の取り込み

ノード非依存のビルド・開発基盤をソースブランチからポートする。

**Files:**

- Create/Modify: `apps/mooreseditor/vite-plugins/devFsPlugin.ts`, `apps/mooreseditor/vite.config.ts`,
  `apps/mooreseditor/tsconfig.json`, `apps/mooreseditor/src/test/mocks/tauri-plugin-fs.ts`,
  `packages/eslint-config/src/library.mjs`, `packages/eslint-config/src/react-internal.mjs`,
  `packages/eslint-config/src/tauri.mjs`, `packages/eslint-config/package.json`,
  `packages/typescript-config/base.json`
- Modify: `package.json`（ルート）, `apps/mooreseditor/package.json`, `pnpm-lock.yaml`

- [ ] **Step 1: 作業ブランチを作成**

```bash
git checkout master && git checkout -b feature/view-host-phase1
```

- [ ] **Step 2: ビルド/開発基盤ファイルをソースブランチからポート**

```bash
git checkout feature/node-graph-system -- \
  apps/mooreseditor/vite-plugins/devFsPlugin.ts \
  apps/mooreseditor/vite.config.ts \
  apps/mooreseditor/tsconfig.json \
  apps/mooreseditor/src/test/mocks/tauri-plugin-fs.ts \
  packages/eslint-config/src/library.mjs \
  packages/eslint-config/src/react-internal.mjs \
  packages/eslint-config/src/tauri.mjs \
  packages/eslint-config/package.json \
  packages/typescript-config/base.json
```

- [ ] **Step 3: ルート `package.json` にスクリプトを追加**

`package.json`（リポジトリルート）の `scripts` に以下4行を追加する（既存の `format` 行の直後）:

```json
    "tauri:dev": "pnpm --filter @mooreseditor/mooreseditor run tauri-dev",
    "tauri:build": "pnpm --filter @mooreseditor/mooreseditor run tauri:build",
    "test": "pnpm --filter @mooreseditor/mooreseditor run test",
    "type-check": "pnpm --filter @mooreseditor/mooreseditor run type-check",
```

- [ ] **Step 4: `apps/mooreseditor/package.json` の devDependencies を更新**

`devDependencies` に以下を追加し、`typescript-eslint` を更新する:

```json
    "@eslint/js": "^9.23.0",
    "eslint-plugin-jsx-a11y": "^6.10.2",
    "typescript-eslint": "^8.28.0",
```

（`@xyflow/react` / `html-to-image` / `mark.js` はここでは追加しない。`mark.js` は Task 7 で追加する。）

- [ ] **Step 5: 依存をインストールしロックファイルを更新**

```bash
pnpm install
```

Expected: `pnpm-lock.yaml` が更新され、エラーなく完了する。

- [ ] **Step 6: 検証**

```bash
pnpm run type-check && pnpm run lint && pnpm run test
```

Expected: いずれも成功（既存テストが全て pass）。lint 設定刷新により新規 warning が出た場合は、
本タスクで触れたファイルに起因するもののみ修正する。

- [ ] **Step 7: ノード依存が混入していないことを確認**

```bash
git grep -l -E "nodeEditor|NodeGraphFile" apps/mooreseditor/src || echo "OK: no node refs"
```

Expected: `OK: no node refs`

- [ ] **Step 8: コミット**

```bash
git add -A
git commit -m "chore: ビルド/開発基盤を node-graph ブランチから取り込み"
```

---

## Task 2: 汎用ユーティリティのバグ修正取り込み

ノード非依存の汎用ユーティリティ修正をポートする。

**Files:**

- Modify: `apps/mooreseditor/src/utils/dataValidator.ts`, `dataInitializer.ts`, `deepMerge.ts`,
  `devFileSystem.ts`, `ensureUniqueAutoGeneratedUuids.ts`, `notifyFieldsAdded.ts`, `schemaToZod.ts`,
  `foreignKeyResolver.ts`
- Test: `apps/mooreseditor/src/utils/__tests__/dataValidator*.test.ts`,
  `apps/mooreseditor/src/utils/ensureUniqueAutoGeneratedUuids.test.ts`

- [ ] **Step 1: ユーティリティ修正とそのテストをポート**

```bash
git checkout feature/node-graph-system -- \
  apps/mooreseditor/src/utils/dataValidator.ts \
  apps/mooreseditor/src/utils/dataInitializer.ts \
  apps/mooreseditor/src/utils/deepMerge.ts \
  apps/mooreseditor/src/utils/devFileSystem.ts \
  apps/mooreseditor/src/utils/ensureUniqueAutoGeneratedUuids.ts \
  apps/mooreseditor/src/utils/ensureUniqueAutoGeneratedUuids.test.ts \
  apps/mooreseditor/src/utils/notifyFieldsAdded.ts \
  apps/mooreseditor/src/utils/schemaToZod.ts \
  apps/mooreseditor/src/utils/foreignKeyResolver.ts \
  apps/mooreseditor/src/utils/__tests__/dataValidator.test.ts \
  apps/mooreseditor/src/utils/__tests__/dataValidator.optional.test.ts \
  apps/mooreseditor/src/utils/__tests__/dataValidator.primitiveArray.test.ts \
  apps/mooreseditor/src/utils/__tests__/dataValidator.real.test.ts
```

- [ ] **Step 2: 検証（テストが失敗→確認用にまず実行）**

```bash
pnpm run test
```

Expected: ここで型不整合が出る場合がある。`foreignKeyResolver.ts` は `libs/schema/types.ts` の
新しい型に依存する可能性があるため、その場合は **Step 3 を先に実施**して再実行する。

- [ ] **Step 3: 型エラーが出た場合のみ `libs/schema/types.ts` を先行ポート**

```bash
git checkout feature/node-graph-system -- apps/mooreseditor/src/libs/schema/types.ts
```

（`types.ts` は Task 3 で正式にポートするファイルだが、依存順の都合で先行ポートしてよい。
先行ポートした場合は Task 3 Step 1 のリストから `types.ts` を除く。）

- [ ] **Step 4: 検証**

```bash
pnpm run type-check && pnpm run lint && pnpm run test
```

Expected: 全て成功。

- [ ] **Step 5: ノード依存が混入していないことを確認**

```bash
git grep -l -E "nodeEditor|NodeGraphFile" apps/mooreseditor/src || echo "OK: no node refs"
```

Expected: `OK: no node refs`

- [ ] **Step 6: コミット**

```bash
git add -A
git commit -m "fix: 汎用ユーティリティのバグ修正を取り込み"
```

---

## Task 3: foreignKey 強化の取り込み

`type:string` フィールドの foreignKey ドロップダウン対応・TableView の foreignKey 強化を取り込む。
これらは完全に汎用で、スキーマ駆動である（特定スキーマのハードコードはない）。

**Files:**

- Modify: `apps/mooreseditor/src/libs/schema/types.ts`,
  `apps/mooreseditor/src/components/FormView/index.tsx`,
  `apps/mooreseditor/src/components/FormView/inputs/ForeignKeySelect.tsx`,
  `apps/mooreseditor/src/components/FormView/inputs/StringInput.tsx`,
  `apps/mooreseditor/src/components/TableView/cells/EditableCell.tsx`,
  `apps/mooreseditor/src/components/TableView/cells/ForeignKeyDisplayCell.tsx`,
  `apps/mooreseditor/src/components/TableView/cells/ForeignKeyEditCell.tsx`,
  `apps/mooreseditor/src/components/TableView/components/RowCopyPasteButtons.tsx`,
  `apps/mooreseditor/src/components/TableView/components/TableRow.tsx`,
  `apps/mooreseditor/src/components/TableView/hooks/useClipboardAppend.ts`,
  `apps/mooreseditor/src/hooks/useForeignKeyData.ts`,
  `apps/mooreseditor/src/hooks/useCopyPaste.ts`,
  `apps/mooreseditor/src/hooks/useJson.ts`

- [ ] **Step 1: foreignKey 関連ファイルをポート**

（Task 2 Step 3 で `types.ts` を先行ポート済みの場合は、下記から `libs/schema/types.ts` の行を除く。）

```bash
git checkout feature/node-graph-system -- \
  apps/mooreseditor/src/libs/schema/types.ts \
  apps/mooreseditor/src/components/FormView/index.tsx \
  apps/mooreseditor/src/components/FormView/inputs/ForeignKeySelect.tsx \
  apps/mooreseditor/src/components/FormView/inputs/StringInput.tsx \
  apps/mooreseditor/src/components/TableView/cells/EditableCell.tsx \
  apps/mooreseditor/src/components/TableView/cells/ForeignKeyDisplayCell.tsx \
  apps/mooreseditor/src/components/TableView/cells/ForeignKeyEditCell.tsx \
  apps/mooreseditor/src/components/TableView/components/RowCopyPasteButtons.tsx \
  apps/mooreseditor/src/components/TableView/components/TableRow.tsx \
  apps/mooreseditor/src/components/TableView/hooks/useClipboardAppend.ts \
  apps/mooreseditor/src/hooks/useForeignKeyData.ts \
  apps/mooreseditor/src/hooks/useCopyPaste.ts \
  apps/mooreseditor/src/hooks/useJson.ts
```

- [ ] **Step 2: 検証**

```bash
pnpm run type-check && pnpm run lint && pnpm run test
```

Expected: 全て成功。

- [ ] **Step 3: ノード依存が混入していないことを確認**

```bash
git grep -l -E "nodeEditor|NodeGraphFile" apps/mooreseditor/src || echo "OK: no node refs"
```

Expected: `OK: no node refs`

- [ ] **Step 4: 開発サーバでの動作確認（CLAUDE.md の Playwright フロー）**

`pnpm run dev` を起動し、`http://localhost:1420/` で:

1. FileOpen ボタンを押す
2. サイドバーの項目（例: `mapObjects`）を選択
3. foreignKey を持つフィールド/列がドロップダウンとして表示されることを確認
4. ブラウザコンソールにエラーが出ていないことを `browser_console_messages` で確認

Expected: foreignKey フィールドがドロップダウン表示され、コンソールに新規エラーがない。

- [ ] **Step 5: コミット**

```bash
git add -A
git commit -m "feat: foreignKey ドロップダウン強化を取り込み（string型FK・TableView対応）"
```

---

## Task 4: EditorView コンポーネントの抽出取り込み

現状 `App.tsx` にインラインで存在する編集ビューのロジックを、独立コンポーネント `EditorView.tsx`
としてポートする。`EditorView.tsx` はソースブランチ上で既にノード非依存に抽出済み。

**Files:**

- Create: `apps/mooreseditor/src/components/EditorView.tsx`

- [ ] **Step 1: `EditorView.tsx` をポート**

```bash
git checkout feature/node-graph-system -- apps/mooreseditor/src/components/EditorView.tsx
```

- [ ] **Step 2: EditorView がノード非依存であることを確認**

```bash
grep -nE "nodeEditor|NodeGraph" apps/mooreseditor/src/components/EditorView.tsx || echo "OK: no node refs"
```

Expected: `OK: no node refs`

- [ ] **Step 3: 型チェック（App.tsx はまだ EditorView を使っていないため未使用警告のみ想定）**

```bash
pnpm run type-check
```

Expected: 成功。`EditorView` 未使用に関する型エラーは出ない（コンポーネント定義のみのため）。
lint で未使用 export 警告が出ても本タスクでは無視してよい（Task 8 で App.tsx が使用する）。

- [ ] **Step 4: コミット**

```bash
git add apps/mooreseditor/src/components/EditorView.tsx
git commit -m "refactor: 編集ビューを EditorView コンポーネントへ抽出"
```

---

## Task 5: 保存ユーティリティ（ノード非依存版）の作成

`saveProjectData` を新規作成する。ソースブランチ版から `nodeGraphData` 引数・`NodeGraphFile` 型・
`.mooreseditor/nodeGraph.v1.json` 書き込みロジックを除去したノード非依存版を作る。

**Files:**

- Create: `apps/mooreseditor/src/utils/saveProjectData.ts`

- [ ] **Step 1: `saveProjectData.ts` を新規作成**

`apps/mooreseditor/src/utils/saveProjectData.ts` に以下の内容で作成する:

```ts
import * as path from "@tauri-apps/api/path";
import { writeTextFile } from "@tauri-apps/plugin-fs";

import type { Column } from "../hooks/useJson";

async function writeViaDevServer(
  filePath: string,
  content: string,
): Promise<void> {
  const res = await fetch("/api/dev-fs/write", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: filePath, content }),
  });
  if (!res.ok) {
    throw new Error(`Dev FS write failed: ${res.status}`);
  }
}

interface SaveProjectDataParams {
  columns: Column[];
  projectDir: string | null;
  masterDir: string | null;
  onSuccess: () => void;
}

export async function saveProjectData({
  columns,
  projectDir,
  masterDir,
  onSuccess,
}: SaveProjectDataParams): Promise<void> {
  if (!columns.length || !projectDir) {
    console.error("保存に必要な情報が不足しています");
    return;
  }

  if (projectDir === "SampleProject") {
    console.log("サンプルプロジェクトのため、保存はスキップされました");
    columns.forEach((column) => {
      console.log(
        `${column.title}:`,
        JSON.stringify({ data: column.data }, null, 2),
      );
    });

    // Dev mode: also write files via dev server for E2E verification
    try {
      for (const column of columns) {
        await writeViaDevServer(
          `master/${column.title}.json`,
          JSON.stringify(column.data, null, 2),
        );
      }
    } catch {
      // Dev server API not available — ignore
    }

    onSuccess();
    return;
  }

  const errors: string[] = [];

  for (const column of columns) {
    try {
      if (!masterDir) {
        errors.push(`${column.title}.json: Master directory is not set.`);
        continue;
      }

      const jsonFilePath = await path.join(masterDir, `${column.title}.json`);
      await writeTextFile(jsonFilePath, JSON.stringify(column.data, null, 2));
      console.log(`データが保存されました: ${jsonFilePath}`);
    } catch (error) {
      errors.push(`${column.title}.json: ${error}`);
    }
  }

  if (errors.length === 0) {
    onSuccess();
    return;
  }

  console.error("保存中にエラー:", errors);
}
```

- [ ] **Step 2: 型チェック**

```bash
pnpm run type-check
```

Expected: 成功。`saveProjectData` 未使用に関するエラーは出ない（Task 8 で App.tsx が使用する）。

- [ ] **Step 3: コミット**

```bash
git add apps/mooreseditor/src/utils/saveProjectData.ts
git commit -m "feat: ノード非依存のプロジェクト保存ユーティリティを追加"
```

---

## Task 6: `useSaveShortcut`（一般化版）の作成

Ctrl+S ショートカットフックを、`mode: "editor" | "node"` 固定をやめて
「アクティブビューの保存能力（`canSave` / `onSave`）」を受け取る一般化版として新規作成する。

**Files:**

- Create: `apps/mooreseditor/src/hooks/useSaveShortcut.ts`
- Test: `apps/mooreseditor/src/hooks/useSaveShortcut.test.ts`

- [ ] **Step 1: 失敗するテストを書く**

`apps/mooreseditor/src/hooks/useSaveShortcut.test.ts` を新規作成:

```ts
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useSaveShortcut } from "./useSaveShortcut";

function pressCtrlS() {
  window.dispatchEvent(
    new KeyboardEvent("keydown", { key: "s", ctrlKey: true }),
  );
}

describe("useSaveShortcut", () => {
  it("canSave が true のとき Ctrl+S で onSave を呼ぶ", () => {
    const onSave = vi.fn();
    renderHook(() => useSaveShortcut({ canSave: true, onSave }));

    pressCtrlS();

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("canSave が false のとき onSave を呼ばない", () => {
    const onSave = vi.fn();
    renderHook(() => useSaveShortcut({ canSave: false, onSave }));

    pressCtrlS();

    expect(onSave).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
pnpm run test -- useSaveShortcut
```

Expected: FAIL（`useSaveShortcut` が存在しない、またはシグネチャ不一致）。

- [ ] **Step 3: `useSaveShortcut.ts` を新規作成**

`apps/mooreseditor/src/hooks/useSaveShortcut.ts` に以下の内容で作成:

```ts
import { useEffect } from "react";

interface UseSaveShortcutParams {
  canSave: boolean;
  onSave: () => void;
}

export function useSaveShortcut({ canSave, onSave }: UseSaveShortcutParams) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key !== "s") {
        return;
      }

      event.preventDefault();
      if (canSave) {
        onSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [canSave, onSave]);
}
```

- [ ] **Step 4: テストが通ることを確認**

```bash
pnpm run test -- useSaveShortcut
```

Expected: PASS（2 テストとも成功）。

- [ ] **Step 5: 検証**

```bash
pnpm run type-check && pnpm run lint
```

Expected: 成功。

- [ ] **Step 6: コミット**

```bash
git add apps/mooreseditor/src/hooks/useSaveShortcut.ts apps/mooreseditor/src/hooks/useSaveShortcut.test.ts
git commit -m "feat: 一般化した保存ショートカットフックを追加"
```

---

## Task 7: 検索オーバーレイの取り込み

`SearchOverlay`（`mark.js` ベースのアプリ内検索）を取り込む。コンポーネント自体はノード非依存。
ノードジャンプ用の `onActiveMatchChange` コールバックは Task 8 で「アクティブビューの能力」へ接続する。

**Files:**

- Create: `apps/mooreseditor/src/components/SearchOverlay.tsx`,
  `apps/mooreseditor/src/components/SearchOverlay.test.tsx`,
  `apps/mooreseditor/src/types/markjs.d.ts`
- Modify: `apps/mooreseditor/package.json`, `pnpm-lock.yaml`

- [ ] **Step 1: `mark.js` を依存に追加**

`apps/mooreseditor/package.json` の `dependencies` に追加:

```json
    "mark.js": "^8.11.1",
```

- [ ] **Step 2: 依存をインストール**

```bash
pnpm install
```

Expected: `pnpm-lock.yaml` 更新、エラーなし。

- [ ] **Step 3: SearchOverlay と mark.js 型定義をポート**

```bash
git checkout feature/node-graph-system -- \
  apps/mooreseditor/src/components/SearchOverlay.tsx \
  apps/mooreseditor/src/components/SearchOverlay.test.tsx \
  apps/mooreseditor/src/types/markjs.d.ts
```

- [ ] **Step 4: SearchOverlay がノード非依存であることを確認**

```bash
grep -nE "nodeEditor|NodeGraph" apps/mooreseditor/src/components/SearchOverlay.tsx || echo "OK: no node refs"
```

Expected: `OK: no node refs`

- [ ] **Step 5: 検証**

```bash
pnpm run type-check && pnpm run lint && pnpm run test -- SearchOverlay
```

Expected: 全て成功（`SearchOverlay.test.tsx` が pass）。

- [ ] **Step 6: コミット**

```bash
git add -A
git commit -m "feat: アプリ内検索オーバーレイを取り込み"
```

---

## Task 8: ビューホスト統合と App.tsx の全面リファクタ

`mode: "editor" | "node"` 固定切替を `ViewDescriptor[]` + `activeViewId` のビューレジストリへ
一般化する。アクティブビューの保存能力・検索ジャンプ能力を `ViewCapabilities` として解決し、
`useSaveShortcut` と `SearchOverlay` に接続する。Phase 1 ではビューは Editor 1 個のみ。

**Files:**

- Create: `apps/mooreseditor/src/viewHost/types.ts`
- Modify (全面書き換え): `apps/mooreseditor/src/App.tsx`

- [ ] **Step 1: ビューホスト契約型を作成**

`apps/mooreseditor/src/viewHost/types.ts` を新規作成:

```ts
import type { ReactNode } from "react";

/**
 * ホストに登録される 1 ビュー（タブ）の記述子。
 * Phase 1 では組み込みの Editor のみ。Phase 3 でプラグインビューが追加される。
 */
export interface ViewDescriptor {
  /** 一意なビュー ID。タブの value に使う。 */
  id: string;
  /** タブに表示するラベル。 */
  label: string;
  /** ビュー本体をレンダリングする。 */
  render: () => ReactNode;
  /** タブを無効化するか（例: データ未ロード時）。 */
  disabled?: boolean;
}

/**
 * アクティブなビューがホストへ公開する能力。
 * ホストはこれを使って Ctrl+S 保存・検索ジャンプを駆動する。
 */
export interface ViewCapabilities {
  /** 現在保存可能か。 */
  canSave: boolean;
  /** 保存を実行する。 */
  onSave: () => void;
  /** 検索でアクティブになった一致要素へフォーカスする（任意）。 */
  focusSearchMatch?: (element: HTMLElement | null) => void;
}
```

- [ ] **Step 2: `App.tsx` を全面書き換え**

`apps/mooreseditor/src/App.tsx` を以下の内容で全面的に置き換える:

```tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  AppShell,
  MantineProvider,
  SegmentedControl,
  createTheme,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import EditorView from "./components/EditorView";
import { SearchOverlay } from "./components/SearchOverlay";
import { useJson } from "./hooks/useJson";
import { useProject } from "./hooks/useProject";
import { useSaveShortcut } from "./hooks/useSaveShortcut";
import { useSchema } from "./hooks/useSchema";
import { saveProjectData } from "./utils/saveProjectData";

import type { Column } from "./hooks/useJson";
import type { ViewCapabilities, ViewDescriptor } from "./viewHost/types";

const theme = createTheme({
  primaryColor: "orange",
});

function App() {
  const { projectDir, schemaDir, masterDir, menuToFileMap, openProjectDir } =
    useProject();
  const {
    jsonData,
    setJsonData,
    loadJsonFile,
    preloadAllData,
    isPreloading,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    clearUnsavedChanges,
  } = useJson();
  const { schemas, loadSchema } = useSchema();

  const [isEditing, setIsEditing] = useState(false);
  const [activeViewId, setActiveViewId] = useState("editor");
  const searchTargetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    preloadAllData(loadSchema);
  }, [menuToFileMap, projectDir, masterDir, schemaDir]);

  const saveAll = useCallback(
    async (columns: Column[]) => {
      await saveProjectData({
        columns,
        projectDir,
        masterDir,
        onSuccess: () => {
          setIsEditing(false);
          clearUnsavedChanges();
        },
      });
    },
    [projectDir, masterDir, clearUnsavedChanges],
  );

  const markDirty = useCallback(() => {
    setIsEditing(true);
    setHasUnsavedChanges(true);
  }, [setHasUnsavedChanges]);

  // ビューレジストリ。Phase 1 は組み込みの Editor のみ。
  // Phase 3 でプラグインビューがこの配列に追加される。
  const views: ViewDescriptor[] = useMemo(
    () => [
      {
        id: "editor",
        label: "Editor",
        render: () => (
          <EditorView
            menuToFileMap={menuToFileMap}
            jsonData={jsonData}
            setJsonData={setJsonData}
            schemas={schemas}
            loadSchema={loadSchema}
            loadJsonFile={loadJsonFile}
            openProjectDir={openProjectDir}
            isPreloading={isPreloading}
            isEditing={isEditing}
            hasUnsavedChanges={hasUnsavedChanges}
            onMarkDirty={markDirty}
          />
        ),
      },
    ],
    [
      menuToFileMap,
      jsonData,
      setJsonData,
      schemas,
      loadSchema,
      loadJsonFile,
      openProjectDir,
      isPreloading,
      isEditing,
      hasUnsavedChanges,
      markDirty,
    ],
  );

  // アクティブビューがホストへ公開する能力を解決する。
  // Phase 1 は editor のみ。Phase 3 ではプラグインが登録した能力を引く。
  const capabilities: ViewCapabilities = useMemo(() => {
    if (activeViewId === "editor") {
      return {
        canSave: (isEditing || hasUnsavedChanges) && jsonData.length > 0,
        onSave: () => {
          void saveAll(jsonData);
        },
      };
    }
    return { canSave: false, onSave: () => {} };
  }, [activeViewId, isEditing, hasUnsavedChanges, jsonData, saveAll]);

  useSaveShortcut({
    canSave: capabilities.canSave,
    onSave: capabilities.onSave,
  });

  const handleActiveSearchMatchChange = useCallback(
    (element: HTMLElement | null) => {
      capabilities.focusSearchMatch?.(element);
    },
    [capabilities],
  );

  return (
    <MantineProvider theme={theme}>
      <Notifications
        position="bottom-left"
        zIndex={2000}
        autoClose={4000}
        limit={5}
      />
      <AppShell header={{ height: 48 }} padding={0}>
        <AppShell.Header>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: 48,
              padding: "0 16px",
              gap: 16,
            }}
          >
            {views.length > 1 && (
              <SegmentedControl
                size="sm"
                value={activeViewId}
                onChange={setActiveViewId}
                data={views.map((view) => ({
                  label: view.label,
                  value: view.id,
                  disabled: view.disabled,
                }))}
              />
            )}
          </div>
        </AppShell.Header>
        <AppShell.Main ref={searchTargetRef}>
          {views.map((view) => (
            <div
              key={view.id}
              style={{
                display: view.id === activeViewId ? "block" : "none",
              }}
            >
              {view.render()}
            </div>
          ))}
          <SearchOverlay
            targetRef={searchTargetRef}
            onActiveMatchChange={handleActiveSearchMatchChange}
          />
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}

export default App;
```

- [ ] **Step 3: 旧ファイルの掃除確認**

`App.tsx` の旧実装で使われていた `useNestedViewScroll` は `EditorView.tsx` 側へ移動済み。
`App.tsx` から参照が消えたことを確認:

```bash
grep -nE "useNestedViewScroll|NestedView" apps/mooreseditor/src/App.tsx || echo "OK: App.tsx clean"
```

Expected: `OK: App.tsx clean`

- [ ] **Step 4: 検証（型・lint・全テスト）**

```bash
pnpm run type-check && pnpm run lint && pnpm run test
```

Expected: 全て成功。`App.test.tsx` が存在する場合、ビューホスト化で旧 `mode` 前提の
アサーションが壊れる可能性がある。壊れた場合は新しいビューレジストリ構造に合わせて
`App.test.tsx` を修正する（Editor が描画されること・タブが 1 個のとき非表示であることを検証）。

- [ ] **Step 5: ノード依存が混入していないことを最終確認**

```bash
git grep -l -E "nodeEditor|NodeGraphFile" apps/mooreseditor/src || echo "OK: no node refs"
```

Expected: `OK: no node refs`

- [ ] **Step 6: 開発サーバでの動作確認（CLAUDE.md の Playwright フロー）**

`pnpm run dev` を起動し、`http://localhost:1420/` で:

1. ヘッダにタブ（SegmentedControl）が表示されていないこと（ビューが 1 個のため）を確認
2. FileOpen ボタンを押す
3. サイドバーの項目（例: `mapObjects`）を選択しデータが表示されることを確認
4. フィールドを編集し `Ctrl+S` を押す → コンソールに保存ログ（`SampleProject` のため
   `master/<name>.json` 形式のログ）が出ることを `browser_console_messages` で確認
5. 検索を起動（`SearchOverlay` の起動キー）し、文字列がハイライトされることを確認
6. コンソールに新規エラーがないことを確認

Expected: タブ非表示・編集・Ctrl+S 保存・検索ハイライトが従来どおり動作し、新規エラーなし。

- [ ] **Step 7: E2E テスト**

```bash
pnpm run test:e2e -- --reporter=list
```

Expected: 既存 E2E が pass。ノードグラフ専用 E2E（`node-graph-*.spec.ts`）は master には
存在しないため対象外。`nested-data-loss*.spec.ts` 等の既存テストが green であること。

- [ ] **Step 8: コミット**

```bash
git add apps/mooreseditor/src/viewHost/types.ts apps/mooreseditor/src/App.tsx
git add apps/mooreseditor/src/App.test.tsx 2>/dev/null || true
git commit -m "refactor: mode 固定切替をビューホストへ一般化"
```

---

## 完了条件（Phase 1 全体）

- [ ] master 由来の機能（FileOpen → 編集 → Ctrl+S 保存）が従来どおり動作する
- [ ] foreignKey ドロップダウンが FormView / TableView 双方で機能する
- [ ] アプリ内検索オーバーレイが動作する
- [ ] `App.tsx` が `ViewDescriptor[]` + `activeViewId` ベースに一般化され、ビューが 1 個のとき
      タブが非表示になる
- [ ] `git grep -E "nodeEditor|NodeGraphFile" apps/mooreseditor/src` が空（ノード依存なし）
- [ ] `pnpm run type-check` / `pnpm run lint` / `pnpm run test` / `pnpm run test:e2e` が全て成功
- [ ] 作業ブランチ `feature/view-host-phase1` を master へマージ（または PR）

Phase 1 完了後、Phase 2（`@mooreseditor/plugin-sdk` 抽出 + ノードエディタ依存解消）の
spec → plan サイクルへ進む。

## Self-Review メモ

- **Spec coverage**: 設計ドキュメント §4-A（汎用機能）→ Task 1-3, 7。§4-B（要一般化）→ Task 5, 6, 8。
  §5 Phase 1 の 5 項目（ビューホスト基盤・保存一般化・検索取り込み・汎用機能・EditorView 抽出）
  → それぞれ Task 8 / Task 5-6 / Task 7 / Task 1-3 / Task 4 でカバー。
- **依存順**: types.ts は foreignKeyResolver より先に必要なため Task 2 Step 3 に先行ポートの逃げ道を明記。
  EditorView は foreignKey 強化済みの FormView/TableView に依存するため Task 3 の後（Task 4）。
  App.tsx は EditorView / saveProjectData / useSaveShortcut / SearchOverlay / viewHost 型に依存する
  ため最後（Task 8）。
- **型整合**: `ViewDescriptor` / `ViewCapabilities` は Task 8 Step 1 で定義し同 Step 2 で使用。
  `useSaveShortcut` のシグネチャ `{ canSave, onSave }` は Task 6 と Task 8 で一致。
  `saveProjectData` のシグネチャ（`nodeGraphData` なし）は Task 5 と Task 8 で一致。
