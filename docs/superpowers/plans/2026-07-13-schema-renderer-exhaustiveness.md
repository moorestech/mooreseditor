# Schema Renderer Exhaustiveness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新しいスキーマ種別追加時のUIと初期値生成への対応漏れをTypeScriptで検出し、schema kind切替時のhook安全性を構造化する。

**Architecture:** `ValueSchema["type"]` を網羅するschema kind正本と、`PrimitiveSchema["type"]` を網羅する初期値・UIレジストリを導入する。Fieldはschema categoryごとの専用Reactコンポーネントへ委譲し、動的schema切替でhook構成が変わらない境界を作る。

**Tech Stack:** TypeScript 5.6, React 19, Vitest, Testing Library, Mantine 7

## Global Constraints

- YAMLファイルからスキーマを動的にロードし、特定のサンプルスキーマ構造やフィールド名をランタイム実装へハードコードしない。
- 既存のYAML構文、plugin-sdk公開schema interface、JSON保存形式を変更しない。
- 外部入力の未知schema kindではクラッシュせず、`Unsupported type: <kind>` を表示する。
- React hooksは条件分岐内で呼び出さない。
- 実装完了後に `/Users/katsumi/WebstormProjects/mooreseditor/apps/mooreseditor` で `pnpm run lint` と `pnpm run build` を実行する。

---

### Task 1: Schema kind正本とprimitive初期値レジストリ

**Files:**
- Create: `packages/plugin-sdk/src/schema/schemaTypes.ts`
- Create: `packages/plugin-sdk/src/schema/schemaTypes.test.ts`
- Modify: `packages/plugin-sdk/src/schema/index.ts`
- Create: `packages/plugin-sdk/src/utils/primitiveDefaultValue.ts`
- Create: `packages/plugin-sdk/src/utils/primitiveDefaultValue.test.ts`
- Modify: `packages/plugin-sdk/src/utils/dataInitializer.ts`
- Modify: `packages/plugin-sdk/src/utils/createInitialValue.ts`
- Test: `packages/plugin-sdk/src/utils/dataInitializer.test.ts`

**Interfaces:**
- Produces: `VALUE_SCHEMA_TYPES`, `STRUCTURED_SCHEMA_TYPES`, `PRIMITIVE_SCHEMA_TYPES`, `isValueSchemaType(type: unknown): type is ValueSchema["type"]`, `isPrimitiveSchemaType(type: unknown): type is PrimitiveSchema["type"]`.
- Produces: `createPrimitiveDefaultValue(schema: PrimitiveSchema): unknown`.

- [ ] **Step 1: Write failing schema kind and primitive default tests**

Add tests which enumerate every current kind (`object`, `array`, `string`, `enum`, `uuid`, `integer`, `number`, `boolean`, `vector2`, `vector3`, `vector4`, `vector2Int`, `vector3Int`, `vector4Int`), reject unknown/non-string values, verify primitive fallbacks, explicit defaults, and auto-generated UUID behavior.

- [ ] **Step 2: Run tests and verify RED**

Run: `pnpm --filter @moorestech/mooreseditor-plugin-sdk exec vitest run src/schema/schemaTypes.test.ts src/utils/primitiveDefaultValue.test.ts`

Expected: FAIL because the new modules do not exist.

- [ ] **Step 3: Implement the schema kind source of truth**

Define object literals whose keys are checked with `satisfies Record<ValueSchema["type"], true>` and `satisfies Record<PrimitiveSchema["type"], true>`. Derive runtime predicates from own-property checks; do not duplicate a sample schema shape.

- [ ] **Step 4: Implement the exhaustive primitive default registry**

Define a mapped handler type keyed by `PrimitiveSchema["type"]`, implement all current primitive kinds, and dispatch through the registry. Keep UUID generation and existing fallback/default semantics.

- [ ] **Step 5: Reuse the registry in both initializer paths**

Narrow structured schemas before calling `createPrimitiveDefaultValue`. Remove duplicated primitive switches from `DataInitializer` and `createInitialValue`. A future primitive union member must make `primitiveDefaultValue.ts` fail type-check until handled.

- [ ] **Step 6: Verify GREEN and package checks**

Run:

```bash
pnpm --filter @moorestech/mooreseditor-plugin-sdk exec vitest run src/schema/schemaTypes.test.ts src/utils/primitiveDefaultValue.test.ts src/utils/dataInitializer.test.ts
pnpm --filter @moorestech/mooreseditor-plugin-sdk type-check
pnpm --filter @moorestech/mooreseditor-plugin-sdk lint
```

Expected: all commands exit 0.

- [ ] **Step 7: Commit**

```bash
git add packages/plugin-sdk/src/schema packages/plugin-sdk/src/utils
git commit -m "refactor(plugin-sdk): centralize schema kinds and defaults"
```

### Task 2: Hook-safe Field renderer分離とprimitive UI網羅性

**Files:**
- Create: `packages/plugin-sdk/src/components/FormView/fieldTypes.ts`
- Create: `packages/plugin-sdk/src/components/FormView/SwitchField.tsx`
- Create: `packages/plugin-sdk/src/components/FormView/ObjectField.tsx`
- Create: `packages/plugin-sdk/src/components/FormView/SchemaArrayField.tsx`
- Create: `packages/plugin-sdk/src/components/FormView/PrimitiveField.tsx`
- Modify: `packages/plugin-sdk/src/components/FormView/Field.tsx`
- Modify: `packages/plugin-sdk/src/components/FormView/fieldHelpers.ts`
- Modify: `packages/plugin-sdk/src/components/FormView/renderPrimitiveInput.tsx`
- Modify: `packages/plugin-sdk/src/components/FormView/Field.test.tsx`

**Interfaces:**
- Consumes: Task 1の `isValueSchemaType` と `isPrimitiveSchemaType`。
- Produces: `Field` as a hook-free schema dispatcher; subtype components own their hooks.
- Produces: primitive renderer map checked with `satisfies` against every `PrimitiveSchema["type"]`.

- [ ] **Step 1: Add failing dispatch and schema-switch tests**

Extend `Field.test.tsx` to assert every primitive kind selects the expected input family, unknown kinds remain non-fatal, and switch cases can change array → object → array without a hook-order exception.

- [ ] **Step 2: Run tests and verify RED**

Run: `pnpm --filter @moorestech/mooreseditor-plugin-sdk exec vitest run src/components/FormView/Field.test.tsx`

Expected: at least the new structural/registry expectation fails before implementation; record the actual failure in the report.

- [ ] **Step 3: Extract hook-owning renderer components**

Move switch resolution/autogeneration, object rendering, array hover/click handling, and primitive hover/rendering into separate components. Keep `Field` responsible only for runtime schema discrimination. No hook may be called conditionally.

- [ ] **Step 4: Make primitive UI dispatch exhaustive**

Type `renderPrimitiveInput` with `PrimitiveSchema` and use a mapped renderer registry keyed by `PrimitiveSchema["type"]`. Vector float/int variants may share renderer functions, but every key must be present explicitly so a new union member causes a type error.

- [ ] **Step 5: Preserve runtime fallback behavior**

Use the Task 1 kind predicates for external input. Missing `type` renders `Invalid schema`; unknown `type` renders `Unsupported type: <kind>`.

- [ ] **Step 6: Verify GREEN and package checks**

Run:

```bash
pnpm --filter @moorestech/mooreseditor-plugin-sdk exec vitest run src/components/FormView/Field.test.tsx
pnpm --filter @moorestech/mooreseditor-plugin-sdk type-check
pnpm --filter @moorestech/mooreseditor-plugin-sdk lint
```

Expected: all commands exit 0, with no new warnings introduced by these tests.

- [ ] **Step 7: Commit**

```bash
git add packages/plugin-sdk/src/components/FormView
git commit -m "refactor(plugin-sdk): make field renderers exhaustive"
```

### Task 3: Integration verification

**Files:**
- Verify only; no production file changes are expected.

**Interfaces:**
- Consumes: Task 1 and Task 2 outputs.
- Produces: fresh automated and actual-app verification evidence.

- [ ] **Step 1: Run the full plugin-sdk suite**

Run:

```bash
pnpm --filter @moorestech/mooreseditor-plugin-sdk test
pnpm --filter @moorestech/mooreseditor-plugin-sdk type-check
pnpm --filter @moorestech/mooreseditor-plugin-sdk lint
```

Expected: all commands exit 0. Existing third-party React 19 `element.ref` warnings are recorded separately from failures.

- [ ] **Step 2: Run required app checks**

Run from `apps/mooreseditor`:

```bash
pnpm run lint
pnpm run build
```

Expected: both commands exit 0.

- [ ] **Step 3: Verify the original workflow in the real Tauri app**

Open `/Users/katsumi/WebstormProjects/tara-tari-novel-engine/masters/elevator-real`, enter States Node Editor, select a `loop` state, then an `oneshot` state, then another `loop` state. Confirm the properties UI changes kind and the app does not crash with `Rendered fewer hooks than expected`.

- [ ] **Step 4: Inspect the final diff**

Run `git diff --check` and review that runtime code contains no elevator-real-specific schema names or case values.
