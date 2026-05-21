# Plugin Regression Fixes TDD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** プラグイン機能追加後に見つかった既存機能回帰を、失敗するテストを先に作ってから修正する。

**Architecture:** Ctrl+S は active view だけでなく保存責務を持つ dirty view を取りこぼさないようにする。node-graph の保存 API は Promise を正しく返し、保存失敗をホストへ伝播させる。node-graph 内の recipe と schema 解決は、既存の動的 SchemaMeta 方針に寄せる。

**Tech Stack:** React 19, Vitest, Testing Library, Tauri v2, Vite, @mooreseditor/plugin-sdk, @xyflow/react.

---

## Scope

対象:

- node-graph plugin `save()` が内部 save Promise を返さない問題
- active view だけ保存することで dirty な master / plugin file を取りこぼす問題
- production plugin asset scope と `plugins[].dir` の仕様不一致
- recipe 作成キャンセル時に orphan master record が残る問題
- node-graph の schema ID 固定マップを動的解決へ寄せる問題

非対象:

- プロジェクト全体の再ロード / プロジェクト切替時の旧 plugin manifest や `activeViewId` 残留。運用上は全体再読み込みする前提なのでこの計画では扱わない。
- E2E テスト弱体化の補強。今回の不具合修正後に別計画で扱う。

## File Map

- Modify: `apps/mooreseditor/src/App.tsx`
  - グローバル保存の集約。Editor dirty と plugin dirty を保存時に両方見られるようにする。
- Modify: `apps/mooreseditor/src/App.test.tsx`
  - active view が Editor / plugin のどちらでも保存漏れしないことをテストする。
- Modify: `plugins/node-graph/src/NodeEditorInner.tsx`
  - `NodeEditorHandle.save` を `Promise<void>` にし、`exportAndSave()` を return/await する。
- Modify: `plugins/node-graph/src/plugin-entry.tsx`
  - plugin view の `save()` が inner handle の Promise を返す。
- Test: `plugins/node-graph/src/plugin-entry.test.tsx`
  - plugin `save()` が host save の reject を reject として返すことを確認する。
- Modify: `apps/mooreseditor/src/pluginHost/loader.ts`
  - production asset scope で許可されない plugin dir を明示的に拒否する、または scope 仕様と一致する path validation を追加する。
- Test: `apps/mooreseditor/src/pluginHost/loader.test.ts`
  - plugin dir の許容/拒否仕様を固定する。
- Modify: `plugins/node-graph/src/components/dialogs/edgeTypeDialog/useEdgeTypeDialogState.ts`
  - 新規 recipe record を edge confirm 前は draft として扱う、または cancel 時に cleanup する。
- Test: `plugins/node-graph/src/components/dialogs/edgeTypeDialog/useEdgeTypeDialogState.test.tsx`
  - recipe 作成後 cancel しても master record が残らないことを確認する。
- Modify: `plugins/node-graph/src/components/panels/PropertiesPanel.tsx`
- Modify: `plugins/node-graph/src/hooks/useNodeGraph.ts`
- Modify: `plugins/node-graph/src/utils/importFromMaster.ts`
- Modify: `plugins/node-graph/src/utils/masterRecordCreation.ts`
  - `items` / `blocks` / `research` 固定を `findSchemaIdForNodeType()` と `SchemaMeta` 由来の解決へ置き換える。
- Test: `plugins/node-graph/src/utils/nodeTypeSchema.test.ts`
  - singular/plural と任意 schema ID 解決の期待を固定する。

---

### Task 1: node-graph save Promise を伝播する

**Files:**
- Create: `plugins/node-graph/src/plugin-entry.test.tsx`
- Modify: `plugins/node-graph/src/plugin-entry.tsx:60`
- Modify: `plugins/node-graph/src/NodeEditorInner.tsx:13-31`

- [ ] **Step 1: Write the failing test**

Create `plugins/node-graph/src/plugin-entry.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest";

import manifest from "./plugin-entry";

import type { HostAPI } from "@mooreseditor/plugin-sdk";

vi.mock("./index", () => ({
  default: ({ ref, onRequestSave }: any) => {
    ref({
      save: () =>
        onRequestSave([{ title: "items", data: { data: [] } }], {
          version: 1,
          nodes: [],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        }),
      focusSearchMatch: () => false,
    });
    return null;
  },
}));

describe("node-graph plugin save", () => {
  it("rejects when host.saveProject rejects", async () => {
    const saveError = new Error("disk full");
    const host = {
      getColumns: () => [{ title: "items", data: { data: [] } }],
      setColumns: vi.fn(),
      schemas: {},
      loadSchema: vi.fn(),
      projectDir: "/project",
      masterDir: "/project/master",
      markDirty: vi.fn(),
      saveExtraFile: vi.fn(),
      readExtraFile: vi.fn(),
      saveProject: vi.fn().mockRejectedValue(saveError),
    } as unknown as HostAPI;

    const view = manifest.createView(host);
    view.render();

    await expect(view.save?.()).rejects.toThrow("disk full");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm --filter @mooreseditor/plugin-node-graph test -- src/plugin-entry.test.tsx
```

Expected: FAIL because `view.save?.()` resolves instead of rejecting.

- [ ] **Step 3: Write minimal implementation**

Change `plugins/node-graph/src/NodeEditorInner.tsx`:

```ts
export interface NodeEditorHandle {
  save: () => Promise<void>;
  focusSearchMatch: (element: Element | null) => boolean;
}
```

```ts
const save = useCallback(async () => {
  if (!isDirty && state.nodes.length === 0) return;
  await exportAndSave();
}, [isDirty, state.nodes.length, exportAndSave]);
```

Change `plugins/node-graph/src/plugin-entry.tsx`:

```ts
save: async () => {
  await handleRef.current?.save();
},
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
pnpm --filter @mooreseditor/plugin-node-graph test -- src/plugin-entry.test.tsx
pnpm --filter @mooreseditor/plugin-node-graph run type-check
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add plugins/node-graph/src/plugin-entry.test.tsx plugins/node-graph/src/plugin-entry.tsx plugins/node-graph/src/NodeEditorInner.tsx
git commit -m "fix(node-graph): propagate plugin save failures"
```

---

### Task 2: Ctrl+S で dirty な Editor と plugin を取りこぼさない

**Files:**
- Modify: `apps/mooreseditor/src/App.test.tsx`
- Modify: `apps/mooreseditor/src/App.tsx`

- [ ] **Step 1: Write the failing test**

Add to `apps/mooreseditor/src/App.test.tsx` inside `describe("App (view host)", ...)`:

```tsx
it("saves dirty plugin data when Ctrl+S is pressed from the Editor view", async () => {
  const pluginSave = vi.fn().mockResolvedValue(undefined);
  vi.mocked(usePlugins).mockReturnValue({
    plugins: [
      {
        id: "node-graph",
        name: "Node Graph",
        version: "0.1.0",
        createView: () => ({
          render: () => <div data-testid="node-graph-view" />,
          isDirty: () => true,
          save: pluginSave,
        }),
      },
    ],
    loading: false,
  } as any);
  vi.mocked(useJson).mockReturnValue({
    ...mockUseJson,
    hasUnsavedChanges: true,
  } as any);

  render(<App />);

  const event = new KeyboardEvent("keydown", {
    key: "s",
    ctrlKey: true,
    bubbles: true,
    cancelable: true,
  });
  window.dispatchEvent(event);

  await waitFor(() => {
    expect(pluginSave).toHaveBeenCalledTimes(1);
  });
  expect(mockUseJson.clearUnsavedChanges).toHaveBeenCalled();
});

it("saves dirty editor data when Ctrl+S is pressed from a plugin view", async () => {
  const pluginSave = vi.fn().mockResolvedValue(undefined);
  vi.mocked(usePlugins).mockReturnValue({
    plugins: [
      {
        id: "node-graph",
        name: "Node Graph",
        version: "0.1.0",
        createView: () => ({
          render: () => <div data-testid="node-graph-view" />,
          isDirty: () => false,
          save: pluginSave,
        }),
      },
    ],
    loading: false,
  } as any);
  vi.mocked(useJson).mockReturnValue({
    ...mockUseJson,
    hasUnsavedChanges: true,
  } as any);

  render(<App />);
  fireEvent.click(screen.getByRole("radio", { name: "Node Graph" }));

  const event = new KeyboardEvent("keydown", {
    key: "s",
    ctrlKey: true,
    bubbles: true,
    cancelable: true,
  });
  window.dispatchEvent(event);

  await waitFor(() => {
    expect(mockUseJson.clearUnsavedChanges).toHaveBeenCalled();
  });
  expect(pluginSave).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm --filter @mooreseditor/mooreseditor test -- src/App.test.tsx
```

Expected:

- First test FAILS because Editor active save only calls `saveProjectData`.
- Second test FAILS because plugin active save does not call Editor save.

- [ ] **Step 3: Write minimal implementation**

In `apps/mooreseditor/src/App.tsx`, replace active-only save capability with a global save callback:

```ts
const saveAllDirtyViews = useCallback(async () => {
  const shouldSaveEditor =
    (isEditing || hasUnsavedChanges) && jsonData.length > 0;

  if (shouldSaveEditor) {
    await saveAll(jsonData);
  }

  for (const { view } of pluginInstances) {
    if (view.isDirty?.() ?? false) {
      await view.save?.();
    }
  }
}, [
  isEditing,
  hasUnsavedChanges,
  jsonData,
  saveAll,
  pluginInstances,
]);
```

Then pass this to `useSaveShortcut`:

```ts
const canSaveAnyView =
  ((isEditing || hasUnsavedChanges) && jsonData.length > 0) ||
  pluginInstances.some(({ view }) => view.isDirty?.() ?? false);

useSaveShortcut({
  canSave: canSaveAnyView,
  onSave: saveAllDirtyViews,
});
```

Keep `capabilities` for active view search/focus and tab-local UI, but do not let Ctrl+S use active-only `capabilities.onSave`.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
pnpm --filter @mooreseditor/mooreseditor test -- src/App.test.tsx
pnpm --filter @mooreseditor/mooreseditor run type-check
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/mooreseditor/src/App.test.tsx apps/mooreseditor/src/App.tsx
git commit -m "fix(app): save all dirty views on shortcut"
```

---

### Task 3: Production plugin asset path の仕様を固定する

**Files:**
- Modify: `apps/mooreseditor/src/pluginHost/loader.ts`
- Modify: `apps/mooreseditor/src/pluginHost/loader.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `apps/mooreseditor/src/pluginHost/loader.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { assertPluginDirSupportedByAssetScope } from "./loader";

describe("assertPluginDirSupportedByAssetScope", () => {
  it("accepts a top-level plugins/<name> directory", () => {
    expect(() =>
      assertPluginDirSupportedByAssetScope("plugins/node-graph"),
    ).not.toThrow();
  });

  it("rejects nested plugin directories that production asset scope cannot serve", () => {
    expect(() =>
      assertPluginDirSupportedByAssetScope("extensions/plugins/node-graph"),
    ).toThrow(/plugins\/<name>/);
  });

  it("rejects dot-directory plugin paths that production asset scope cannot serve", () => {
    expect(() =>
      assertPluginDirSupportedByAssetScope(".mooreseditor/plugins/node-graph"),
    ).toThrow(/plugins\/<name>/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm --filter @mooreseditor/mooreseditor test -- src/pluginHost/loader.test.ts
```

Expected: FAIL because `assertPluginDirSupportedByAssetScope` does not exist.

- [ ] **Step 3: Write minimal implementation**

Export this helper from `apps/mooreseditor/src/pluginHost/loader.ts`:

```ts
export function assertPluginDirSupportedByAssetScope(pluginDir: string): void {
  const normalized = pluginDir.replace(/\\/g, "/").replace(/^\.\//, "");
  const segments = normalized.split("/").filter(Boolean);
  if (segments.length !== 2 || segments[0] !== "plugins") {
    throw new Error(
      `Unsupported plugin dir "${pluginDir}". Production asset scope currently supports only plugins/<name>.`,
    );
  }
}
```

Call it at the top of `loadPlugin()` before `resolvePluginDir()`:

```ts
export async function loadPlugin(
  projectDir: string,
  pluginDir: string,
): Promise<PluginManifest> {
  assertPluginDirSupportedByAssetScope(pluginDir);
  const resolvedDir = await resolvePluginDir(projectDir, pluginDir);
  // existing code...
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
pnpm --filter @mooreseditor/mooreseditor test -- src/pluginHost/loader.test.ts
pnpm --filter @mooreseditor/mooreseditor run type-check
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/mooreseditor/src/pluginHost/loader.ts apps/mooreseditor/src/pluginHost/loader.test.ts
git commit -m "fix(plugin-host): validate production plugin directory shape"
```

---

### Task 4: Recipe 作成キャンセルで orphan record を残さない

**Files:**
- Create: `plugins/node-graph/src/components/dialogs/edgeTypeDialog/useEdgeTypeDialogState.test.tsx`
- Modify: `plugins/node-graph/src/components/dialogs/edgeTypeDialog/useEdgeTypeDialogState.ts`

- [ ] **Step 1: Write the failing test**

Create `plugins/node-graph/src/components/dialogs/edgeTypeDialog/useEdgeTypeDialogState.test.tsx`:

```tsx
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useEdgeTypeDialogState } from "./useEdgeTypeDialogState";

import type { SchemaMeta } from "../../../utils/schemaMeta";

function createCraftRecipeMeta(): SchemaMeta {
  return {
    schemaId: "craftRecipes",
    guidField: "craftRecipeGuid",
    nameField: "craftRecipeName",
    dataArrayPath: "data",
    elementSchema: {
      type: "object",
      properties: [
        { key: "craftRecipeGuid", type: "uuid", autoGenerated: true },
        { key: "craftRecipeName", type: "string", default: "Recipe" },
      ],
    },
  };
}

describe("useEdgeTypeDialogState", () => {
  it("removes a newly created draft recipe when the dialog is cancelled", () => {
    let columns = [{ title: "craftRecipes", data: { data: [] } }];
    const setJsonData = vi.fn((updater) => {
      columns = typeof updater === "function" ? updater(columns) : updater;
    });

    const { result } = renderHook(() =>
      useEdgeTypeDialogState({
        opened: true,
        onConfirm: vi.fn(),
        onCancel: vi.fn(),
        jsonData: columns,
        setJsonData,
        schemaMetas: new Map([["craftRecipes", createCraftRecipeMeta()]]),
        sourceNode: { id: "source", type: "item", data: { masterGuid: "item-a" } } as any,
        targetNode: { id: "target", type: "item", data: { masterGuid: "item-b" } } as any,
        onMarkDirty: vi.fn(),
      }),
    );

    act(() => {
      result.current.handleCreateRecipe("craftRecipe");
    });
    expect(columns[0].data.data).toHaveLength(1);

    act(() => {
      result.current.handleCancel();
    });

    expect(columns[0].data.data).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm --filter @mooreseditor/plugin-node-graph test -- src/components/dialogs/edgeTypeDialog/useEdgeTypeDialogState.test.tsx
```

Expected: FAIL because cancel only resets local state and does not remove the created record.

- [ ] **Step 3: Write minimal implementation**

In `useEdgeTypeDialogState.ts`, track created draft recipe refs:

```ts
const [createdDraftRecipes, setCreatedDraftRecipes] = useState<
  { schemaId: string; recipeGuid: string }[]
>([]);
```

After `upsertCreatedRecipe(...)`, record the draft:

```ts
setCreatedDraftRecipes((prev) => [...prev, { schemaId, recipeGuid }]);
```

Add helper inside the hook:

```ts
const cleanupCreatedDraftRecipes = () => {
  if (createdDraftRecipes.length === 0) return;
  setJsonData((prev) =>
    createdDraftRecipes.reduce((columns, draft) => {
      const meta = schemaMetas.get(draft.schemaId);
      if (!meta?.guidField) return columns;
      const colIndex = columns.findIndex((c) => c.title === draft.schemaId);
      if (colIndex === -1) return columns;
      const col = columns[colIndex];
      const rows = col.data?.[meta.dataArrayPath];
      if (!Array.isArray(rows)) return columns;

      const nextColumns = [...columns];
      nextColumns[colIndex] = {
        ...col,
        data: {
          ...col.data,
          [meta.dataArrayPath]: rows.filter(
            (row: any) => row?.[meta.guidField!] !== draft.recipeGuid,
          ),
        },
      };
      return nextColumns;
    }, prev),
  );
};
```

Call it from `handleCancel()` before `resetState()`:

```ts
const handleCancel = () => {
  cleanupCreatedDraftRecipes();
  onCancel();
  resetState();
};
```

Clear the draft list on confirm:

```ts
const handleConfirm = () => {
  if (mode === "recipe") {
    if (selectedRecipeRefs.length === 0) return;
    onConfirm({ edgeType: "recipe", recipeRefs: selectedRecipeRefs });
  } else {
    cleanupCreatedDraftRecipes();
    onConfirm({ edgeType: mode });
  }
  setCreatedDraftRecipes([]);
  resetState();
};
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
pnpm --filter @mooreseditor/plugin-node-graph test -- src/components/dialogs/edgeTypeDialog/useEdgeTypeDialogState.test.tsx
pnpm --filter @mooreseditor/plugin-node-graph run type-check
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add plugins/node-graph/src/components/dialogs/edgeTypeDialog/useEdgeTypeDialogState.test.tsx plugins/node-graph/src/components/dialogs/edgeTypeDialog/useEdgeTypeDialogState.ts
git commit -m "fix(node-graph): cleanup cancelled draft recipes"
```

---

### Task 5: node-graph schema ID 固定を動的解決へ寄せる

**Files:**
- Modify: `plugins/node-graph/src/utils/nodeTypeSchema.test.ts`
- Modify: `plugins/node-graph/src/utils/nodeTypeSchema.ts`
- Modify: `plugins/node-graph/src/components/panels/PropertiesPanel.tsx`
- Modify: `plugins/node-graph/src/hooks/useNodeGraph.ts`
- Modify: `plugins/node-graph/src/utils/importFromMaster.ts`
- Modify: `plugins/node-graph/src/utils/masterRecordCreation.ts`

- [ ] **Step 1: Write the failing test**

Create or extend `plugins/node-graph/src/utils/nodeTypeSchema.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { findSchemaIdForNodeType } from "./nodeTypeSchema";

import type { SchemaMeta } from "./schemaMeta";

function meta(schemaId: string): SchemaMeta {
  return {
    schemaId,
    guidField: `${schemaId}Guid`,
    nameField: `${schemaId}Name`,
    dataArrayPath: "data",
    elementSchema: null,
  };
}

describe("findSchemaIdForNodeType", () => {
  it("uses an exact schema id before plural fallback", () => {
    const metas = new Map([
      ["item", meta("item")],
      ["items", meta("items")],
    ]);

    expect(findSchemaIdForNodeType("item", metas)).toBe("item");
  });

  it("falls back to plural schema id", () => {
    const metas = new Map([["items", meta("items")]]);

    expect(findSchemaIdForNodeType("item", metas)).toBe("items");
  });

  it("supports arbitrary node types when a matching schema exists", () => {
    const metas = new Map([["quests", meta("quests")]]);

    expect(findSchemaIdForNodeType("quest", metas)).toBe("quests");
  });
});
```

This test may already pass for the utility. The RED for the integration comes from adding focused tests in the call sites in the next step.

Add a call-site test to the most direct fixed-map location. Create `plugins/node-graph/src/utils/masterRecordCreation.dynamic.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  canCreateMasterRecordForNode,
  createMasterRecordForNode,
} from "./masterRecordCreation";

import type { SchemaMeta } from "./schemaMeta";

const questMeta: SchemaMeta = {
  schemaId: "quests",
  guidField: "questGuid",
  nameField: "questName",
  dataArrayPath: "data",
  elementSchema: {
    type: "object",
    properties: [
      { key: "questGuid", type: "uuid", autoGenerated: true },
      { key: "questName", type: "string", default: "New Quest" },
    ],
  },
};

describe("masterRecordCreation dynamic schema ids", () => {
  it("creates records for arbitrary node types resolved from SchemaMeta", () => {
    const columns = [{ title: "quests", data: { data: [] } }];
    const metas = new Map([["quests", questMeta]]);

    expect(canCreateMasterRecordForNode("quest" as any, columns, metas)).toBe(
      true,
    );

    const result = createMasterRecordForNode("quest" as any, columns, metas);

    expect(result?.updatedColumns[0].data.data).toHaveLength(1);
    expect(result?.displayName).toBe("New Quest");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm --filter @mooreseditor/plugin-node-graph test -- src/utils/nodeTypeSchema.test.ts src/utils/masterRecordCreation.dynamic.test.ts
```

Expected: `nodeTypeSchema.test.ts` may pass; `masterRecordCreation.dynamic.test.ts` FAILS because `CreatableNodeType` and fixed maps only allow `item` / `research`.

- [ ] **Step 3: Write minimal implementation**

In `plugins/node-graph/src/utils/masterRecordCreation.ts`, remove fixed schema map and use `findSchemaIdForNodeType()`:

```ts
import { findSchemaIdForNodeType } from "./nodeTypeSchema";
```

```ts
type CreatableNodeType = string;

function getDefaultName(nodeType: string): string {
  return `New ${nodeType.charAt(0).toUpperCase()}${nodeType.slice(1)}`;
}

function resolveSchemaMeta(
  nodeType: CreatableNodeType,
  schemaMetas: Map<string, SchemaMeta>,
): SchemaMeta | null {
  const schemaId = findSchemaIdForNodeType(nodeType, schemaMetas);
  if (!schemaId) return null;
  const schemaMeta = schemaMetas.get(schemaId);
  if (!schemaMeta?.elementSchema || !schemaMeta.guidField) {
    return null;
  }
  return schemaMeta;
}
```

Replace fixed `getSchemaIdForNodeType(nodeType)` calls with:

```ts
const schemaId = findSchemaIdForNodeType(nodeType, schemaMetas);
if (!schemaId) return false;
```

or:

```ts
const schemaId = findSchemaIdForNodeType(nodeType, schemaMetas);
if (!schemaId) return null;
```

Replace default name lookup with:

```ts
const displayFallback = getDefaultName(nodeType);
```

Then update the other fixed-map call sites:

- `PropertiesPanel.tsx`: replace `nodeTypeToSchemaId[nodeType]` with `findSchemaIdForNodeType(nodeType, schemaMetas)`.
- `useNodeGraph.ts`: replace ternary `item ? items : block ? blocks : research` with `findSchemaIdForNodeType(gn.type, schemaMetas)`.
- `importFromMaster.ts`: keep research import if node-graph intentionally imports only research from master, but resolve the schema id with `findSchemaIdForNodeType("research", schemaMetas)` instead of hardcoded `"research"`.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
pnpm --filter @mooreseditor/plugin-node-graph test -- src/utils/nodeTypeSchema.test.ts src/utils/masterRecordCreation.dynamic.test.ts
pnpm --filter @mooreseditor/plugin-node-graph run type-check
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add plugins/node-graph/src/utils/nodeTypeSchema.test.ts plugins/node-graph/src/utils/masterRecordCreation.dynamic.test.ts plugins/node-graph/src/utils/nodeTypeSchema.ts plugins/node-graph/src/components/panels/PropertiesPanel.tsx plugins/node-graph/src/hooks/useNodeGraph.ts plugins/node-graph/src/utils/importFromMaster.ts plugins/node-graph/src/utils/masterRecordCreation.ts
git commit -m "fix(node-graph): resolve node schemas dynamically"
```

---

## Final Verification

- [ ] Run focused tests:

```bash
pnpm --filter @mooreseditor/plugin-node-graph test -- src/plugin-entry.test.tsx src/components/dialogs/edgeTypeDialog/useEdgeTypeDialogState.test.tsx src/utils/nodeTypeSchema.test.ts src/utils/masterRecordCreation.dynamic.test.ts
pnpm --filter @mooreseditor/mooreseditor test -- src/App.test.tsx src/pluginHost/loader.test.ts
```

- [ ] Run project checks:

```bash
pnpm run lint
pnpm run type-check
pnpm run build
pnpm run test
```

- [ ] Run E2E with the currently valid command form:

```bash
pnpm run test:e2e --reporter=list
```

Note: the current root script is `type-check`, not `typecheck`. The AGENTS.md command name is stale.

## Self-Review

- Spec coverage: all remaining Critical/Warning items after excluding full project reload lifecycle are mapped to tasks.
- Placeholder scan: no `TBD` / generic test placeholders remain; each task includes concrete test code and expected RED failure.
- Type consistency: `NodeEditorHandle.save` becomes `Promise<void>` consistently across plugin entry and inner handle. Dynamic schema resolution uses existing `findSchemaIdForNodeType()` and `SchemaMeta`.
