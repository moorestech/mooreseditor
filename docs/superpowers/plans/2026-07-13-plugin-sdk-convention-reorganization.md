# Plugin SDK Convention Reorganization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize the five confirmed `packages/plugin-sdk` file-length and directory-size violations without changing its public API or runtime behavior.

**Architecture:** Move runtime schema guards, initialization utilities, and FormView field dispatch into responsibility-based subdirectories. Preserve package-root and schema-barrel exports, split the two oversized tests by behavior, and update repository-internal imports directly rather than adding compatibility shims.

**Tech Stack:** TypeScript 5.6, React 19, Vitest 3, pnpm workspaces, ESLint 9

## Global Constraints

- 対象は `packages/plugin-sdk` の `Field.test.tsx`、`dataInitializer.test.ts`、`components/FormView`、`schema`、`utils` にある 5 件の規約違反だけとする。
- 変更対象の TypeScript/TSX ファイルはすべて 200 行以下、変更対象ディレクトリの直下はすべて 10 ファイル以下にする。
- パッケージルート `packages/plugin-sdk/src/index.ts` と `schema/index.ts` の公開シンボル名・型を維持する。
- スキーマ種別、初期値生成規則、フォーム描画、入力イベント、エラー表示を変更しない。
- スキーマは入力 YAML から動的に解釈し、サンプル固有の型名、フィールド名、構造を追加しない。
- 新しい barrel import、旧内部 deep import の互換 shim、例外の握りつぶし、環境判定分岐を追加しない。
- 既存テストケースを削除せず、振る舞い別のファイルへそのまま保持する。

---

### Task 1: Move Runtime Schema Boundaries

**Files:**
- Move: `packages/plugin-sdk/src/schema/schemaTypes.ts` → `packages/plugin-sdk/src/schema/runtime/schemaTypes.ts`
- Move: `packages/plugin-sdk/src/schema/schemaTypes.test.ts` → `packages/plugin-sdk/src/schema/runtime/schemaTypes.test.ts`
- Modify: `packages/plugin-sdk/src/schema/index.ts`

**Interfaces:**
- Consumes: `supportsForeignKey` from `packages/plugin-sdk/src/schema/types.ts`
- Produces: unchanged public exports `STRUCTURED_SCHEMA_TYPES`, `PRIMITIVE_SCHEMA_TYPES`, `VALUE_SCHEMA_TYPES`, `isValueSchemaType`, `isPrimitiveSchemaType`, `isRuntimeValueSchema`, `isRuntimeSwitchSchema`, and their runtime schema types through `packages/plugin-sdk/src/schema/index.ts`

- [ ] **Step 1: Run the characterization test before moving files**

Run:

```bash
pnpm --filter @moorestech/mooreseditor-plugin-sdk exec vitest run src/schema/schemaTypes.test.ts
```

Expected: the existing runtime schema tests pass.

- [ ] **Step 2: Move the runtime schema test and implementation with `apply_patch`**

Move both files without changing their test cases or implementation bodies. In the moved implementation, change only the relative type-module import:

```ts
import { supportsForeignKey } from "../types";
```

The moved test continues to import its sibling:

```ts
import {
  PRIMITIVE_SCHEMA_TYPES,
  STRUCTURED_SCHEMA_TYPES,
  VALUE_SCHEMA_TYPES,
  isPrimitiveSchemaType,
  isRuntimeSwitchSchema,
  isRuntimeValueSchema,
  isValueSchemaType,
} from "./schemaTypes";
```

- [ ] **Step 3: Run the old path to verify the structural change is RED**

Run:

```bash
pnpm --filter @moorestech/mooreseditor-plugin-sdk exec vitest run src/schema/schemaTypes.test.ts
```

Expected: FAIL because the old test path no longer exists. This proves the migration has taken effect before the public barrel is repaired.

- [ ] **Step 4: Update the schema barrel export**

Set `packages/plugin-sdk/src/schema/index.ts` to keep all existing public exports while pointing runtime schemas at the new location:

```ts
export * from "./types";
export * from "./runtime/schemaTypes";
export * from "./column";
```

- [ ] **Step 5: Run focused and package tests to verify GREEN**

Run:

```bash
pnpm --filter @moorestech/mooreseditor-plugin-sdk exec vitest run src/schema/runtime/schemaTypes.test.ts
pnpm --filter @moorestech/mooreseditor-plugin-sdk test
```

Expected: the focused test and the complete plugin-sdk suite pass with no new warnings.

- [ ] **Step 6: Verify layout and commit**

Run:

```bash
find packages/plugin-sdk/src/schema -maxdepth 1 -type f | wc -l
find packages/plugin-sdk/src/schema/runtime -maxdepth 1 -type f | wc -l
```

Expected: `schema` has 9 direct files and `schema/runtime` has 2 direct files.

Commit:

```bash
git add packages/plugin-sdk/src/schema
git commit -m "refactor(plugin-sdk): group runtime schema boundaries"
```

---

### Task 2: Group Initialization Utilities and Split DataInitializer Tests

**Files:**
- Move: `packages/plugin-sdk/src/utils/dataInitializer.ts` → `packages/plugin-sdk/src/utils/initialization/dataInitializer.ts`
- Move: `packages/plugin-sdk/src/utils/primitiveDefaultValue.ts` → `packages/plugin-sdk/src/utils/initialization/primitiveDefaultValue.ts`
- Move: `packages/plugin-sdk/src/utils/primitiveDefaultValue.test.ts` → `packages/plugin-sdk/src/utils/initialization/__tests__/primitiveDefaultValue.test.ts`
- Move: `packages/plugin-sdk/src/utils/deepMerge.ts` → `packages/plugin-sdk/src/utils/object/deepMerge.ts`
- Move: `packages/plugin-sdk/src/utils/deepMerge.test.ts` → `packages/plugin-sdk/src/utils/object/deepMerge.test.ts`
- Move: `packages/plugin-sdk/src/utils/schemaToZod.ts` → `packages/plugin-sdk/src/utils/validation/schemaToZod.ts`
- Move: `packages/plugin-sdk/src/utils/schemaToZod.test.ts` → `packages/plugin-sdk/src/utils/validation/schemaToZod.test.ts`
- Move: `packages/plugin-sdk/src/utils/ensureUniqueAutoGeneratedUuids.test.ts` → `packages/plugin-sdk/src/utils/__tests__/ensureUniqueAutoGeneratedUuids.test.ts`
- Move: `packages/plugin-sdk/src/utils/foreignKeyResolver.test.ts` → `packages/plugin-sdk/src/utils/__tests__/foreignKeyResolver.test.ts`
- Delete after split: `packages/plugin-sdk/src/utils/dataInitializer.test.ts`
- Create: `packages/plugin-sdk/src/utils/initialization/__tests__/dataInitializer.basic.test.ts`
- Create: `packages/plugin-sdk/src/utils/initialization/__tests__/dataInitializer.boundaries.test.ts`
- Keep in root: `packages/plugin-sdk/src/utils/createInitialValue.ts`
- Keep in root: `packages/plugin-sdk/src/utils/switchFieldProcessor.ts`
- Modify: `packages/plugin-sdk/src/index.ts`
- Modify: `packages/plugin-sdk/src/hooks/useSwitchFieldAutoGeneration.ts`
- Modify: `packages/plugin-sdk/src/hooks/useCopyPaste.ts`

**Interfaces:**
- Consumes: schema exports from `packages/plugin-sdk/src/schema/index.ts`, `calculateAutoIncrement` from `packages/plugin-sdk/src/utils/autoIncrement.ts`, and `generateUuid` from `packages/plugin-sdk/src/utils/generateUuid.ts`
- Produces: unchanged package-root exports `createInitialValue`, `DataInitializer`, `processSwitchFields`, `deepMerge`, and `schemaToZod`; existing root exports `AutoIncrementOptions`, `calculateAutoIncrement`, `ensureUniqueAutoGeneratedUuids`, and `generateUuid` remain unchanged
- Constraint: `useArrayDataManager.ts` and `TableRow.tsx` remain byte-for-byte unchanged because both exceed 200 lines; their referenced utilities stay at the original root paths

- [ ] **Step 1: Run characterization tests and the deterministic convention checker**

Run:

```bash
pnpm --filter @moorestech/mooreseditor-plugin-sdk exec vitest run src/utils/dataInitializer.test.ts src/utils/primitiveDefaultValue.test.ts src/utils/deepMerge.test.ts src/utils/schemaToZod.test.ts src/utils/ensureUniqueAutoGeneratedUuids.test.ts src/utils/foreignKeyResolver.test.ts
git diff 9b014ed..HEAD --output=/tmp/plugin-sdk-convention-reorganization.patch
python3 /Users/katsumi/.agents/skills/all-code-review/scripts/deterministic_checks.py /tmp/plugin-sdk-convention-reorganization.patch --repo-root "$(git rev-parse --show-toplevel)"
```

Expected: all characterization tests pass. Any intermediate `file-too-long` findings for `useArrayDataManager.ts` or `TableRow.tsx` must be removed by keeping their original imports unchanged in the final diff.

- [ ] **Step 2: Split `dataInitializer.test.ts` by behavior before removing the old file**

Create `dataInitializer.basic.test.ts` with the existing imports and these complete existing suites, unchanged:

```text
describe("Simple schemas")
describe("Nested objects")
describe("Arrays")
```

Its imports must be:

```ts
import { describe, expect, it } from "vitest";

import { DataInitializer } from "../dataInitializer";

import type { ArraySchema, ObjectSchema } from "../../../schema";
```

Create `dataInitializer.boundaries.test.ts` with these complete existing suites, unchanged:

```text
describe("AutoIncrement")
describe("Circular references")
describe("Runtime schema boundaries")
```

Its imports must be:

```ts
import { validate as validateUuid } from "uuid";
import { describe, expect, it } from "vitest";

import { createInitialValue } from "../../createInitialValue";
import { DataInitializer } from "../dataInitializer";

import type { ObjectSchema } from "../../../schema";
```

Wrap each file in `describe("DataInitializer", () => { ... })`. Delete the old combined test only after every original `it`/`it.each` case is present in one new file.

- [ ] **Step 3: Move the responsibility groups with `apply_patch`**

Move only the listed implementations and tests without changing behavior. Keep `createInitialValue.ts` and `switchFieldProcessor.ts` at their original root paths so over-limit consumers need no edits.

- [ ] **Step 4: Repair imports inside the moved responsibility groups**

Use these exact imports, preserving every implementation body below them:

```ts
// utils/createInitialValue.ts
import { isRuntimeValueSchema } from "../schema";
import { calculateAutoIncrement } from "./autoIncrement";
import { DataInitializer } from "./initialization/dataInitializer";
import { createPrimitiveDefaultValue } from "./initialization/primitiveDefaultValue";
import type { Schema, ValueSchema } from "../schema";

// initialization/dataInitializer.ts
import { isRuntimeValueSchema } from "../../schema";
import { calculateAutoIncrement } from "../autoIncrement";
import { createPrimitiveDefaultValue } from "./primitiveDefaultValue";
import type {
  ArraySchema,
  ObjectSchema,
  Schema,
  SwitchSchema,
  ValueSchema,
} from "../../schema";

// initialization/primitiveDefaultValue.ts
import { isPrimitiveSchemaType } from "../../schema";
import { generateUuid } from "../generateUuid";
import type { PrimitiveSchema } from "../../schema";

// utils/switchFieldProcessor.ts
import { DataInitializer } from "./initialization/dataInitializer";
import { deepMerge } from "./object/deepMerge";
import type { ObjectSchema, SwitchSchema } from "../schema";

// validation/schemaToZod.ts
import type {
  ArraySchema,
  ObjectSchema,
  Schema,
  ValueSchema,
} from "../../schema";
```

For the moved initialization test use:

```ts
// primitiveDefaultValue.test.ts
import { createPrimitiveDefaultValue } from "../primitiveDefaultValue";
import type { PrimitiveSchema } from "../../../schema";
```

The moved object and validation tests continue importing sibling implementations. Root tests moved into `utils/__tests__` import their implementations from `..` and schema types from `../../schema`:

```ts
// object/deepMerge.test.ts
import { deepMerge } from "./deepMerge";

// __tests__/ensureUniqueAutoGeneratedUuids.test.ts
import { ensureUniqueAutoGeneratedUuids } from "../ensureUniqueAutoGeneratedUuids";
import * as generateUuidModule from "../generateUuid";
import type { ObjectSchema } from "../../schema";

// __tests__/foreignKeyResolver.test.ts
import { ForeignKeyResolver, validateForeignKeyPath } from "../foreignKeyResolver";

// validation/schemaToZod.test.ts
import { schemaToZod } from "./schemaToZod";
import type { Schema } from "../../schema";
```

- [ ] **Step 5: Repair all repository-internal consumers and public exports**

Update only the module specifiers, preserving imported names:

```ts
// packages/plugin-sdk/src/hooks/useSwitchFieldAutoGeneration.ts
import { DataInitializer } from "../utils/initialization/dataInitializer";
import { deepMerge } from "../utils/object/deepMerge";

// packages/plugin-sdk/src/hooks/useCopyPaste.ts
import { schemaToZod } from "../utils/validation/schemaToZod";
```

Replace only the moved utility lines in `packages/plugin-sdk/src/index.ts`:

```ts
export * from "./utils/switchFieldProcessor";
export * from "./utils/initialization/dataInitializer";
export * from "./utils/createInitialValue";
export * from "./utils/object/deepMerge";
export * from "./utils/validation/schemaToZod";
```

Keep every unrelated export in the file unchanged.

- [ ] **Step 6: Run focused tests and verify final layout**

Run:

```bash
pnpm --filter @moorestech/mooreseditor-plugin-sdk exec vitest run src/utils/initialization/__tests__ src/utils/__tests__ src/utils/object src/utils/validation
find packages/plugin-sdk/src/utils -maxdepth 1 -type f | wc -l
find packages/plugin-sdk/src/utils/initialization -maxdepth 1 -type f | wc -l
find packages/plugin-sdk/src/utils/initialization/__tests__ -maxdepth 1 -type f | wc -l
find packages/plugin-sdk/src/utils/object -maxdepth 1 -type f | wc -l
find packages/plugin-sdk/src/utils/validation -maxdepth 1 -type f | wc -l
find packages/plugin-sdk/src/utils/__tests__ -maxdepth 1 -type f | wc -l
```

Expected: focused tests pass; direct file counts are `utils: 10`, `initialization: 2`, `initialization/__tests__: 3`, `object: 2`, `validation: 2`, `utils/__tests__: 2`.

- [ ] **Step 7: Re-run the deterministic checker and all verification**

Run:

```bash
git diff 9b014ed..HEAD --output=/tmp/plugin-sdk-convention-reorganization.patch
python3 /Users/katsumi/.agents/skills/all-code-review/scripts/deterministic_checks.py /tmp/plugin-sdk-convention-reorganization.patch --repo-root "$(git rev-parse --show-toplevel)"
pnpm --filter @moorestech/mooreseditor-plugin-sdk test
pnpm run lint
pnpm run build
wc -l packages/plugin-sdk/src/utils/initialization/__tests__/dataInitializer.*.test.ts
```

Expected: the checker no longer reports `useArrayDataManager.ts` or `TableRow.tsx`; the package suite remains 483 passed and 5 skipped; lint and build exit 0; both split tests are at most 200 lines.

Commit:

```bash
git add packages/plugin-sdk/src docs/superpowers
git commit -m "fix(plugin-sdk): keep long consumers unchanged"
```

---

### Task 3: Reorganize FormView Field Dispatch and Split Field Tests

**Files:**
- Move: `packages/plugin-sdk/src/components/FormView/Field.tsx` → `packages/plugin-sdk/src/components/FormView/fields/Field.tsx`
- Move: `packages/plugin-sdk/src/components/FormView/fieldHelpers.ts` → `packages/plugin-sdk/src/components/FormView/fields/fieldHelpers.ts`
- Move: `packages/plugin-sdk/src/components/FormView/fieldTypes.ts` → `packages/plugin-sdk/src/components/FormView/fields/fieldTypes.ts`
- Move: `packages/plugin-sdk/src/components/FormView/ObjectField.tsx` → `packages/plugin-sdk/src/components/FormView/fields/renderers/ObjectField.tsx`
- Move: `packages/plugin-sdk/src/components/FormView/PrimitiveField.tsx` → `packages/plugin-sdk/src/components/FormView/fields/renderers/PrimitiveField.tsx`
- Move: `packages/plugin-sdk/src/components/FormView/SchemaArrayField.tsx` → `packages/plugin-sdk/src/components/FormView/fields/renderers/SchemaArrayField.tsx`
- Move: `packages/plugin-sdk/src/components/FormView/SwitchField.tsx` → `packages/plugin-sdk/src/components/FormView/fields/renderers/SwitchField.tsx`
- Move: `packages/plugin-sdk/src/components/FormView/renderPrimitiveInput.tsx` → `packages/plugin-sdk/src/components/FormView/fields/renderers/renderPrimitiveInput.tsx`
- Delete after split: `packages/plugin-sdk/src/components/FormView/Field.test.tsx`
- Create: `packages/plugin-sdk/src/components/FormView/fields/Field.testSupport.tsx`
- Create: `packages/plugin-sdk/src/components/FormView/fields/Field.primitives.test.tsx`
- Create: `packages/plugin-sdk/src/components/FormView/fields/Field.structured.test.tsx`
- Create: `packages/plugin-sdk/src/components/FormView/fields/Field.switch.test.tsx`
- Create: `packages/plugin-sdk/src/components/FormView/fields/Field.invalid-schema.test.tsx`
- Modify and split: `packages/plugin-sdk/src/components/FormView/ArrayField.test.tsx`
- Create: `packages/plugin-sdk/src/components/FormView/__tests__/ArrayField.constraints-and-duplication.test.tsx`
- Create: `packages/plugin-sdk/src/components/FormView/__tests__/ArrayField.testSupport.tsx`
- Modify: `packages/plugin-sdk/src/components/FormView/index.tsx`
- Modify: `packages/plugin-sdk/src/components/FormView/ArrayField.tsx`

**Interfaces:**
- Consumes: schema guards through `packages/plugin-sdk/src/schema/index.ts`, existing `FormView/inputs`, hooks, initialization utilities, `ArrayField`, and `FieldWithCopyPaste`
- Produces: unchanged default `Field` behavior for FormView internals and unchanged public `FormView` export from the package root

- [ ] **Step 1: Run the oversized Field test as characterization coverage**

Run:

```bash
pnpm --filter @moorestech/mooreseditor-plugin-sdk exec vitest run src/components/FormView/Field.test.tsx
```

Expected: all existing Field cases pass before the split.

- [ ] **Step 2: Create the shared test support module**

Move the existing `primitiveInputFamilies`, every component returned by the existing `vi.mock("./inputs", ...)` factory, and `defaultProps` into `fields/Field.testSupport.tsx`. Export the component map as `fieldInputMocks`; the support file itself must not call `vi.mock`, because mocks must be declared in each test module. Use these exports:

```ts
export const primitiveInputFamilies = {
  string: "string-input",
  enum: "enum-input",
  uuid: "uuid-input",
  integer: "integer-input",
  number: "number-input",
  boolean: "boolean-input",
  vector2: "vector2-input",
  vector3: "vector3-input",
  vector4: "vector4-input",
  vector2Int: "vector2-input",
  vector3Int: "vector3-input",
  vector4Int: "vector4-input",
} as const satisfies Record<PrimitiveSchema["type"], string>;

export const fieldInputMocks = {
  StringInput: ({ value, onChange }: any) => (
    <input
      data-testid="string-input"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
  IntegerInput: ({ value, onChange }: any) => (
    <input
      data-testid="integer-input"
      type="number"
      value={value}
      onChange={(event) => onChange(parseInt(event.target.value))}
    />
  ),
  NumberInput: ({ value, onChange }: any) => (
    <input
      data-testid="number-input"
      type="number"
      value={value}
      onChange={(event) => onChange(parseFloat(event.target.value))}
    />
  ),
  BooleanInput: ({ value, onChange }: any) => (
    <input
      data-testid="boolean-input"
      type="checkbox"
      checked={value}
      onChange={(event) => onChange(event.target.checked)}
    />
  ),
  EnumInput: ({ value, onChange, schema }: any) => (
    <select
      data-testid="enum-input"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {schema.enum?.map((option: any) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  ),
  UuidInput: ({ value, onChange }: any) => (
    <input
      data-testid="uuid-input"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
  Vector2Input: ({ value }: any) => (
    <div data-testid="vector2-input">{JSON.stringify(value)}</div>
  ),
  Vector3Input: ({ value }: any) => (
    <div data-testid="vector3-input">{JSON.stringify(value)}</div>
  ),
  Vector4Input: ({ value }: any) => (
    <div data-testid="vector4-input">{JSON.stringify(value)}</div>
  ),
  ForeignKeySelect: ({ value, onChange }: any) => (
    <select
      data-testid="foreignkey-input"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">Select...</option>
    </select>
  ),
};

export const defaultFieldProps = {
  label: "Test Field",
  schema: { type: "string" } as Schema,
  data: "",
  onDataChange: vi.fn(),
  path: ["root", "testField"],
};

export const resetFieldMocks = (): void => {
  vi.clearAllMocks();
};
```

Import `PrimitiveSchema` and `Schema` from `../../../schema`. Preserve every mock renderer body from the original file; do not weaken assertions or replace rendered components with empty stubs.

- [ ] **Step 3: Split all Field cases into four behavior files**

Each new file imports `@testing-library/jest-dom`, `Field` from `./Field`, the needed Testing Library helpers from `../../../test/utils/test-utils`, and the shared support exports. Each wraps its cases in `describe("Field ...", () => { afterEach(resetFieldMocks); ... })`.

Each test module registers the shared component map before importing behavior under test:

```ts
vi.mock("../inputs", async () => {
  const { fieldInputMocks } = await import("./Field.testSupport");
  return fieldInputMocks;
});
```

Move the existing tests exactly once according to this mapping:

```text
Field.primitives.test.tsx
- should render a string input for string schema
- dispatches %s schemas to the %s family
- registers a renderer for every primitive schema kind
- should render an integer input for integer schema
- should render a number input for number schema
- should render a boolean input for boolean schema
- should render an enum input for schema with enum
- should render a UUID input for string with uuid format
- should render a foreign key select for schema with foreignKey
- should render vector2 input for array with vector2 format
- should render vector3 input for array with vector3 format
- should render vector4 input for array with vector4 format
- should call onChange with updated value
- should handle null value
- should handle undefined value
- should pass through foreignKeyData prop

Field.structured.test.tsx
- should render object fields for object schema
- should render array field for array schema
- keeps hook order stable when an object array schema changes to an object
- adds a null fallback for an array item with an unknown runtime kind
- should handle complex nested schemas

Field.switch.test.tsx
- switches an object-array case to an object case without reusing branch hooks
- dispatches an unknown selected switch case without auto-generation
- replaces data when a switch changes between object and array families

Field.invalid-schema.test.tsx
- should handle schema without explicit type
- treats object properties with a non-array shape as invalid
- treats an array without an item schema as invalid
- treats enum options with a non-array shape as invalid
- treats a malformed foreign key configuration as invalid
- treats an incomplete switch schema as invalid
- treats a non-string switch path as invalid
- treats a switch with a non-string case type as invalid
- treats a switch with a malformed known case payload as invalid
- should handle unknown schema type
- does not let switch-like properties hide an unknown type
```

In `Field.primitives.test.tsx`, import the renderer registry as:

```ts
import * as primitiveRendering from "./renderers/renderPrimitiveInput";
```

Delete the original `Field.test.tsx` after all 35 test definitions are present. Every new `.test.tsx` and `Field.testSupport.tsx` must remain at or below 200 lines.

Because repairing the moved `Field` mock path also changes the pre-existing 200-line-plus `ArrayField.test.tsx`, split that test in the same task. Keep basic array operations in the root test, move constraint and duplication cases to `FormView/__tests__/ArrayField.constraints-and-duplication.test.tsx`, and share mocks through `ArrayField.testSupport.tsx`. Preserve all 22 test titles and all 34 `expect` calls from the original file.

- [ ] **Step 4: Move production files with `apply_patch` and verify RED**

Move the listed dispatch and renderer files without changing their bodies. Run before repairing imports:

```bash
pnpm --filter @moorestech/mooreseditor-plugin-sdk exec vitest run src/components/FormView/fields/Field.*.test.tsx
```

Expected: FAIL with unresolved imports created by the directory move.

- [ ] **Step 5: Repair FormView imports using direct implementation paths**

Use these exact paths while preserving all imported names:

```ts
// FormView/index.tsx and FormView/ArrayField.tsx
import Field from "./fields/Field";

// fields/Field.tsx
import { isValueSchemaType } from "../../../schema";
import ObjectField from "./renderers/ObjectField";
import PrimitiveField from "./renderers/PrimitiveField";
import SchemaArrayField from "./renderers/SchemaArrayField";
import SwitchField from "./renderers/SwitchField";

// fields/fieldHelpers.ts and fields/fieldTypes.ts
// change existing schema imports to "../../../schema"

// fields/renderers/ObjectField.tsx
import { FieldWithCopyPaste } from "../../FieldWithCopyPaste";
import type { ObjectFieldProps } from "../fieldTypes";

// fields/renderers/PrimitiveField.tsx
import { renderPrimitiveInput } from "./renderPrimitiveInput";
import type { PrimitiveFieldProps } from "../fieldTypes";

// fields/renderers/SchemaArrayField.tsx
import ArrayField from "../../ArrayField";
import { FieldWithCopyPaste } from "../../FieldWithCopyPaste";
import { isObjectArraySchema } from "../fieldHelpers";
import type { SchemaArrayFieldProps } from "../fieldTypes";

// fields/renderers/SwitchField.tsx
import { useSwitchFieldAutoGeneration } from "../../../../hooks/useSwitchFieldAutoGeneration";
import { resolvePath } from "../../../../utils/pathResolver";
import Field from "../Field";
import type { SwitchFieldProps } from "../fieldTypes";

// fields/renderers/renderPrimitiveInput.tsx
import { FieldWithCopyPaste } from "../../FieldWithCopyPaste";
// change the existing inputs import to "../../inputs"
// change schema imports to "../../../../schema"
```

Do not introduce a `fields/index.ts` or `renderers/index.ts` barrel.

- [ ] **Step 6: Run focused tests and verify every old Field test moved once**

Run:

```bash
pnpm --filter @moorestech/mooreseditor-plugin-sdk exec vitest run src/components/FormView/fields/Field.primitives.test.tsx src/components/FormView/fields/Field.structured.test.tsx src/components/FormView/fields/Field.switch.test.tsx src/components/FormView/fields/Field.invalid-schema.test.tsx src/components/FormView/ArrayField.test.tsx src/components/FormView/__tests__/ArrayField.constraints-and-duplication.test.tsx src/components/FormView/index.test.tsx src/components/FormView/FormView.test.tsx
rg -n 'from "\./(Field|ObjectField|PrimitiveField|SchemaArrayField|SwitchField|fieldHelpers|fieldTypes|renderPrimitiveInput)"' packages/plugin-sdk/src/components/FormView --glob '*.ts' --glob '*.tsx'
```

Expected: all focused tests pass. The `rg` command finds no stale import that targets a removed FormView-root module.

- [ ] **Step 7: Run the plugin-sdk suite, verify constraints, and commit**

Run:

```bash
pnpm --filter @moorestech/mooreseditor-plugin-sdk test
find packages/plugin-sdk/src/components/FormView -maxdepth 1 -type f | wc -l
find packages/plugin-sdk/src/components/FormView/fields -maxdepth 1 -type f | wc -l
find packages/plugin-sdk/src/components/FormView/fields/renderers -maxdepth 1 -type f | wc -l
wc -l packages/plugin-sdk/src/components/FormView/fields/Field*.tsx
wc -l packages/plugin-sdk/src/components/FormView/ArrayField.test.tsx packages/plugin-sdk/src/components/FormView/__tests__/ArrayField*.tsx
```

Expected: the package suite passes; direct file counts are `FormView: 9`, `fields: 8`, `renderers: 5`; every listed Field and ArrayField test/support file is at most 200 lines. The split ArrayField tests retain all 22 original test titles and 34 `expect` calls.

Commit:

```bash
git add packages/plugin-sdk/src/components/FormView
git commit -m "refactor(plugin-sdk): organize form field dispatch"
```

---

## Final Verification

After all three reviewed tasks are complete, run from the repository root:

```bash
pnpm --filter @moorestech/mooreseditor-plugin-sdk test
pnpm run lint
pnpm run build
git diff --check HEAD~3..HEAD
```

Generate a branch diff and run the deterministic convention checker:

```bash
git diff --binary 2756607..HEAD > /tmp/plugin-sdk-convention-reorganization.patch
python3 /Users/katsumi/.agents/skills/all-code-review/scripts/deterministic_checks.py /tmp/plugin-sdk-convention-reorganization.patch --repo-root "$(git rev-parse --show-toplevel)"
```

Expected: plugin-sdk tests, lint, and build exit 0. The deterministic output contains none of the original five findings for `Field.test.tsx`, `dataInitializer.test.ts`, `components/FormView`, `schema`, or `utils`.
