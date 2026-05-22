# External Plugin SDK npm Publishing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `@mooreseditor/plugin-sdk` npm-publishable so mooreseditor plugins can be developed in a completely separate repository, and prove it works end-to-end via a local Verdaccio registry and a throwaway test repo.

**Architecture:** The SDK keeps shipping raw TS source to the monorepo (workspace `exports` unchanged → host build & hot-reload unaffected), but gains a `tsup`-produced `dist/` (JS + `.d.ts`) and a `publishConfig.exports` override that swaps to `dist/` **only at publish time**. Because `publishConfig` field-override is pnpm-specific, publishing MUST use `pnpm publish`, never `npm publish`. An `examples/external-plugin-starter/` template provides a self-contained plugin project. Verification publishes the SDK to a local Verdaccio registry, builds the starter from a separate repo, and confirms the bundle externalizes shared deps correctly and loads in the Tauri host.

**Tech Stack:** pnpm 10 / turbo monorepo, Vite 6 + `@vitejs/plugin-react`, tsup (new), Verdaccio (new, dev-only), TypeScript 5.6, Tauri 2.

---

## Background facts (do not re-discover)

- `packages/plugin-sdk/package.json` today: `"private": true`, `"version": "0.0.0"`, `"main": "./src/index.ts"`, `exports["."]` → `./src/index.ts`, `exports["./vite"]` → types `./src/vite/index.ts` / default `./src/vite/index.js`. Scripts: only `lint`, `type-check`, `test`. No `build`.
- The SDK has two faces:
  - `.` — React component library. Entry `src/index.ts` re-exports schema/components/hooks/utils/contract. Runtime deps: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `json-schema-ref-resolver`, `uuid`, `yaml`, `zod`.
  - `./vite` — Node-side build tooling. `src/vite/index.js` re-exports from `./sharedDeps.js` and `./mooresPlugin.js`. Parallel `.ts` files exist (`index.ts`, `mooresPlugin.ts`, `sharedDeps.ts`) used only for types.
- `mooresPlugin()` (in `src/vite/mooresPlugin.js`) hardcodes the plugin build entry as `src/plugin-entry.tsx`, externalizes `sharedDependencySpecs()`, outputs `dist/index.js` + `dist/index.css`, and writes `plugin.json` (`{ ...metadata, entry: "dist/index.js", styles: ["dist/index.css"] }`).
- `SHARED_DEPENDENCIES` (`src/vite/sharedDeps.js`): `react`, `react-dom`, `react/jsx-runtime`, `@mantine/core`, `@mantine/hooks`, `@mantine/notifications`, `@tabler/icons-react`, `@xyflow/react`, `@mooreseditor/plugin-sdk`.
- `scripts/check-plugin-contracts.ts` imports `SHARED_DEPENDENCIES` / `sharedDependencySpecs` from `@mooreseditor/plugin-sdk/vite` and asserts host/sdk/node-graph dependency versions match.
- Host (`apps/mooreseditor`) imports `@mooreseditor/plugin-sdk` in `App.tsx`, `pluginHost/loader.ts`, `pluginHost/hostApi.ts`, `pluginHost/usePlugins.ts`, `utils/dataValidator.ts`.
- pnpm workspace globs: `apps/*`, `packages/*`, `plugins/*` (NOT `examples/*` — intentional; the starter must stay out of the workspace).
- node-graph is the reference plugin. Its `vite.config.ts` is just `mergeConfig({ plugins: [react()] }, mooresPlugin(pluginMetadata))`.

---

## File Structure

**Modified in monorepo:**

- `packages/plugin-sdk/package.json` — un-private, version, `publishConfig`, `files`, `scripts`, `tsup` devDep.
- `packages/plugin-sdk/.gitignore` — create, ignore `dist/`.
- `.gitignore` (root) — confirm `dist/` patterns (likely already covered).

**Created in monorepo:**

- `packages/plugin-sdk/tsup.config.ts` — builds the `.` entry to `dist/`.
- `packages/plugin-sdk/tsconfig.build.json` — emits `dist/vite/*.d.ts` for the `./vite` subpath.
- `packages/plugin-sdk/scripts/build-vite-subpath.mjs` — copies `src/vite/*.js` → `dist/vite/*.js` and runs the declaration build.
- `examples/external-plugin-starter/` — `package.json`, `vite.config.ts`, `tsconfig.json`, `.npmrc.example`, `src/pluginMetadata.ts`, `src/plugin-entry.tsx`, `src/HelloPluginView.tsx`, `README.md`.

**Created outside monorepo (verification, throwaway):**

- `~/WebstormProjects/mooreseditor-plugin-test/` — copy of the starter, own `git init`.
- A Verdaccio config + storage dir under `/tmp` or the verification repo.

---

### Task 1: Add the SDK component-library build (`tsup`)

**Files:**

- Modify: `packages/plugin-sdk/package.json`
- Create: `packages/plugin-sdk/tsup.config.ts`
- Create: `packages/plugin-sdk/.gitignore`

- [ ] **Step 1: Add `tsup` as a devDependency**

Run:

```bash
pnpm --filter @mooreseditor/plugin-sdk add -D tsup@^8
```

Expected: `tsup` appears in `packages/plugin-sdk/package.json` `devDependencies`.

- [ ] **Step 2: Create the tsup config**

Create `packages/plugin-sdk/tsup.config.ts`:

```ts
import { defineConfig } from "tsup";

// Builds the `.` (component-library) entry only.
// The `./vite` subpath is built separately by scripts/build-vite-subpath.mjs
// because those files are hand-written Node ESM that must ship byte-identical.
export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true, // wipes dist/ — vite-subpath build runs AFTER this
  outDir: "dist",
  // Every dependency + peerDependency stays external; the SDK is consumed by
  // bundlers (the host, and plugin builds) that resolve these themselves.
  external: [
    /^@dnd-kit\//,
    "json-schema-ref-resolver",
    "uuid",
    "yaml",
    "zod",
    /^react/,
    /^react-dom/,
    /^@mantine\//,
    "@tabler/icons-react",
  ],
});
```

- [ ] **Step 3: Create `packages/plugin-sdk/.gitignore`**

Create `packages/plugin-sdk/.gitignore`:

```
dist/
*.tgz
```

- [ ] **Step 4: Run the tsup build and verify output**

Run:

```bash
cd packages/plugin-sdk && pnpm exec tsup && ls -la dist
```

Expected: `dist/index.js`, `dist/index.d.ts`, `dist/index.js.map` exist. No errors. (CSS file may or may not appear depending on component imports — both are fine.)

- [ ] **Step 5: Spot-check the built output**

Run:

```bash
cd packages/plugin-sdk && node -e "import('./dist/index.js').then(m => console.log(Object.keys(m).sort().join(',')))"
```

Expected: prints a comma-separated list including `FormView`, `TableView`, `createColumnDispatch`. No `ERR_MODULE_NOT_FOUND` (would mean a dep was wrongly bundled-out or a path is wrong).

- [ ] **Step 6: Commit**

```bash
git add packages/plugin-sdk/tsup.config.ts packages/plugin-sdk/.gitignore packages/plugin-sdk/package.json pnpm-lock.yaml
git commit -m "build: add tsup component-library build to plugin-sdk"
```

---

### Task 2: Build the `./vite` subpath (JS copy + `.d.ts`)

**Files:**

- Create: `packages/plugin-sdk/tsconfig.build.json`
- Create: `packages/plugin-sdk/scripts/build-vite-subpath.mjs`

- [ ] **Step 1: Create the declaration-only tsconfig**

Create `packages/plugin-sdk/tsconfig.build.json`:

```json
{
  "extends": "@mooreseditor/typescript-config/base.json",
  "compilerOptions": {
    "allowJs": false,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "noEmit": false,
    "emitDeclarationOnly": true,
    "declaration": true,
    "declarationMap": false,
    "outDir": "dist/vite",
    "rootDir": "src/vite",
    "baseUrl": "."
  },
  "include": [
    "src/vite/index.ts",
    "src/vite/mooresPlugin.ts",
    "src/vite/sharedDeps.ts"
  ]
}
```

- [ ] **Step 2: Create the vite-subpath build script**

Create `packages/plugin-sdk/scripts/build-vite-subpath.mjs`:

```js
// Builds the `./vite` subpath for the npm package.
// The runtime `.js` files are hand-written Node ESM build tooling; they ship
// byte-identical (no transpile). Only `.d.ts` files are generated, from the
// parallel `.ts` sources, so the `./vite` `types` condition resolves.
import { cpSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";

mkdirSync("dist/vite", { recursive: true });

// 1. Copy the runtime JS verbatim.
for (const f of ["index.js", "mooresPlugin.js", "sharedDeps.js"]) {
  cpSync(`src/vite/${f}`, `dist/vite/${f}`);
}

// 2. Emit declarations from the parallel .ts sources.
execFileSync("pnpm", ["exec", "tsc", "-p", "tsconfig.build.json"], {
  stdio: "inherit",
});

console.log(
  "vite subpath built: dist/vite/{index,mooresPlugin,sharedDeps}.{js,d.ts}",
);
```

- [ ] **Step 3: Run the vite-subpath build and verify**

Run:

```bash
cd packages/plugin-sdk && pnpm exec tsup && node scripts/build-vite-subpath.mjs && ls dist/vite
```

Expected: `dist/vite/` contains `index.js`, `mooresPlugin.js`, `sharedDeps.js`, `index.d.ts`, `mooresPlugin.d.ts`, `sharedDeps.d.ts`.

- [ ] **Step 4: Verify the copied JS is byte-identical**

Run:

```bash
cd packages/plugin-sdk && diff src/vite/index.js dist/vite/index.js && diff src/vite/mooresPlugin.js dist/vite/mooresPlugin.js && diff src/vite/sharedDeps.js dist/vite/sharedDeps.js && echo "IDENTICAL"
```

Expected: prints `IDENTICAL`, no diff output.

- [ ] **Step 5: Verify the built vite subpath is importable**

Run:

```bash
cd packages/plugin-sdk && node -e "import('./dist/vite/index.js').then(m => console.log(typeof m.mooresPlugin, Array.isArray(m.SHARED_DEPENDENCIES)))"
```

Expected: prints `function true`.

- [ ] **Step 6: Commit**

```bash
git add packages/plugin-sdk/tsconfig.build.json packages/plugin-sdk/scripts/build-vite-subpath.mjs
git commit -m "build: generate plugin-sdk ./vite subpath dist with .d.ts"
```

---

### Task 3: Make `plugin-sdk/package.json` npm-publishable

**Files:**

- Modify: `packages/plugin-sdk/package.json`

- [ ] **Step 1: Edit `package.json` metadata and scripts**

In `packages/plugin-sdk/package.json`:

- Remove the `"private": true` line.
- Change `"version": "0.0.0"` → `"version": "1.0.0"`.
- Leave `"main"`, `"types"`, and the top-level `"exports"` pointing at `./src/...` UNCHANGED (monorepo dev keeps using source).
- Add these top-level fields:

```json
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/sakastudio/mooreseditor.git",
    "directory": "packages/plugin-sdk"
  },
  "files": ["dist"],
  "publishConfig": {
    "access": "public",
    "main": "./dist/index.js",
    "types": "./dist/index.d.ts",
    "exports": {
      ".": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "./vite": {
        "types": "./dist/vite/index.d.ts",
        "default": "./dist/vite/index.js"
      }
    }
  }
```

- In `"scripts"`, add:

```json
    "build": "tsup && node scripts/build-vite-subpath.mjs",
    "prepack": "pnpm run build"
```

- [ ] **Step 2: Verify the manifest parses and license is correct**

Run:

```bash
node -e "const p=require('./packages/plugin-sdk/package.json'); if(p.private) throw new Error('still private'); console.log(p.version, p.publishConfig.access, p.publishConfig.exports['.'].default)"
```

Expected: prints `1.0.0 public ./dist/index.js`.

Note: confirm the repository URL and license match the actual repo before committing. If the repo's `LICENSE` file names a different license, use that SPDX id instead of `MIT`. Check with: `head -1 LICENSE 2>/dev/null || ls LICENSE*`.

- [ ] **Step 3: Build and inspect the publish tarball**

Run:

```bash
cd packages/plugin-sdk && pnpm run build && pnpm pack && tar -tzf mooreseditor-plugin-sdk-1.0.0.tgz
```

Expected: the tarball lists ONLY `package/package.json` and files under `package/dist/`. No `src/` files.

- [ ] **Step 4: Verify the tarball's package.json was rewritten by pnpm**

Run:

```bash
cd packages/plugin-sdk && mkdir -p /tmp/sdk-tarball-check && tar -xzf mooreseditor-plugin-sdk-1.0.0.tgz -C /tmp/sdk-tarball-check && node -e "const p=require('/tmp/sdk-tarball-check/package/package.json'); console.log('exports[.]:', JSON.stringify(p.exports['.'])); console.log('exports[./vite]:', JSON.stringify(p.exports['./vite']))"
```

Expected: BOTH exports point at `./dist/...` paths (this is the critical hybrid-swap check — pnpm applied `publishConfig.exports`). If they still point at `./src/...`, STOP: `pnpm publish` was not used or pnpm version is too old.

- [ ] **Step 5: Clean up and commit**

```bash
cd packages/plugin-sdk && rm -f mooreseditor-plugin-sdk-1.0.0.tgz && rm -rf /tmp/sdk-tarball-check
cd ../.. && git add packages/plugin-sdk/package.json
git commit -m "build: make plugin-sdk npm-publishable with publishConfig hybrid exports"
```

---

### Task 4: Verify the monorepo host build is unaffected

**Files:** none (verification only)

- [ ] **Step 1: Run the plugin contract check**

Run:

```bash
pnpm check:plugin-contracts
```

Expected: exits 0, no error thrown. (This imports `@mooreseditor/plugin-sdk/vite` via the unchanged source `exports`.)

- [ ] **Step 2: Type-check the SDK and host**

Run:

```bash
pnpm --filter @mooreseditor/plugin-sdk run type-check && pnpm --filter @mooreseditor/mooreseditor run type-check
```

Expected: both exit 0.

- [ ] **Step 3: Build the host and node-graph plugin**

Run:

```bash
pnpm --filter @mooreseditor/mooreseditor run build && pnpm --filter @mooreseditor/plugin-node-graph run build
```

Expected: both exit 0. node-graph still produces `plugins/node-graph/dist/index.js`.

- [ ] **Step 4: Run the SDK unit tests**

Run:

```bash
pnpm --filter @mooreseditor/plugin-sdk run test
```

Expected: all tests pass.

- [ ] **Step 5: No commit** (verification task — nothing changed). If any step fails, the failure is a regression introduced by Tasks 1-3 and must be fixed before continuing.

---

### Task 5: Create the external plugin starter template

**Files:**

- Create: `examples/external-plugin-starter/package.json`
- Create: `examples/external-plugin-starter/vite.config.ts`
- Create: `examples/external-plugin-starter/tsconfig.json`
- Create: `examples/external-plugin-starter/.npmrc.example`
- Create: `examples/external-plugin-starter/.gitignore`
- Create: `examples/external-plugin-starter/src/pluginMetadata.ts`
- Create: `examples/external-plugin-starter/src/plugin-entry.tsx`
- Create: `examples/external-plugin-starter/src/HelloPluginView.tsx`
- Create: `examples/external-plugin-starter/README.md`

Note: `examples/` is NOT in the pnpm workspace globs, so this directory is inert to the monorepo — exactly what we want for a copy-out template.

- [ ] **Step 1: Create `package.json`**

Create `examples/external-plugin-starter/package.json`. The SDK is **exact-pinned** (no `^`) so a plugin can never be built against a newer SDK than its target host ships. Shared-dep versions mirror `SHARED_DEPENDENCIES`.

```json
{
  "name": "mooreseditor-plugin-hello",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "build": "vite build",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@tauri-apps/api": "^2"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@mantine/core": "^7.10.2",
    "@mantine/hooks": "^7.10.2",
    "@mantine/notifications": "^7.10.2",
    "@tabler/icons-react": "^3.31.0"
  },
  "devDependencies": {
    "@mooreseditor/plugin-sdk": "1.0.0",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "@vitejs/plugin-react": "^4.3.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@mantine/core": "^7.10.2",
    "@mantine/hooks": "^7.10.2",
    "@mantine/notifications": "^7.10.2",
    "@tabler/icons-react": "^3.31.0",
    "typescript": "~5.6.2",
    "vite": "^6.0.3"
  }
}
```

- [ ] **Step 2: Create `vite.config.ts`**

Create `examples/external-plugin-starter/vite.config.ts` (identical pattern to `plugins/node-graph/vite.config.ts`):

```ts
import react from "@vitejs/plugin-react";
import { mooresPlugin } from "@mooreseditor/plugin-sdk/vite";
import { defineConfig, mergeConfig } from "vite";

import { pluginMetadata } from "./src/pluginMetadata";

// mooresPlugin() externalizes the host-shared dependencies (react, @mantine/*,
// @mooreseditor/plugin-sdk, etc.) and emits dist/index.js + plugin.json.
// @tauri-apps/* is intentionally NOT external — it is bundled into dist/index.js.
export default defineConfig(
  mergeConfig({ plugins: [react()] }, mooresPlugin(pluginMetadata)),
);
```

- [ ] **Step 3: Create `tsconfig.json`**

Create `examples/external-plugin-starter/tsconfig.json` (self-contained — does NOT extend the monorepo's `@mooreseditor/typescript-config`):

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "baseUrl": "."
  },
  "include": ["src", "vite.config.ts"]
}
```

- [ ] **Step 4: Create `.npmrc.example`**

Create `examples/external-plugin-starter/.npmrc.example`:

```
# Copy to .npmrc when installing against a local Verdaccio registry.
# Only the @mooreseditor scope is redirected; everything else uses the
# public npm registry.
@mooreseditor:registry=http://localhost:4873
```

- [ ] **Step 5: Create `.gitignore`**

Create `examples/external-plugin-starter/.gitignore`:

```
node_modules/
dist/
plugin.json
.npmrc
*.tgz
```

- [ ] **Step 6: Create `src/pluginMetadata.ts`**

Create `examples/external-plugin-starter/src/pluginMetadata.ts`:

```ts
export const pluginMetadata = {
  id: "hello",
  name: "Hello Plugin",
  version: "0.1.0",
} as const;
```

- [ ] **Step 7: Create `src/HelloPluginView.tsx`**

Create `examples/external-plugin-starter/src/HelloPluginView.tsx`:

```tsx
import { Stack, Text, Title } from "@mantine/core";

interface HelloPluginViewProps {
  projectDir: string | null;
}

// Minimal view: proves the plugin renders inside the host and that
// host-shared Mantine components resolve to the host's single instance.
export function HelloPluginView({ projectDir }: HelloPluginViewProps) {
  return (
    <Stack p="md" gap="xs">
      <Title order={3}>Hello from an external plugin</Title>
      <Text>This plugin was built in a separate repository.</Text>
      <Text c="dimmed">projectDir: {projectDir ?? "(none)"}</Text>
    </Stack>
  );
}
```

- [ ] **Step 8: Create `src/plugin-entry.tsx`**

Create `examples/external-plugin-starter/src/plugin-entry.tsx` (`mooresPlugin()` requires this exact path). Returns a non-dirty, non-saving view:

```tsx
import { pluginMetadata } from "./pluginMetadata";
import { HelloPluginView } from "./HelloPluginView";

import type {
  HostAPI,
  PluginManifest,
  PluginView,
} from "@mooreseditor/plugin-sdk";

const manifest: PluginManifest = {
  ...pluginMetadata,
  createView(host: HostAPI): PluginView {
    return {
      render: () => <HelloPluginView projectDir={host.projectDir} />,
      // Read-only view: declare not-dirty so the host save button stays
      // inactive instead of defaulting to always-savable.
      isDirty: () => false,
    };
  },
};

export default manifest;
```

- [ ] **Step 9: Create `README.md`**

Create `examples/external-plugin-starter/README.md`:

```markdown
# mooreseditor External Plugin Starter

A self-contained template for building a mooreseditor plugin in a repository
**separate from the mooreseditor monorepo**.

## Prerequisites

- Node.js 20+ and a package manager (npm or pnpm)
- `@mooreseditor/plugin-sdk` available from npm (or a local registry)

## Version contract (IMPORTANT)

`@mooreseditor/plugin-sdk` is **exact-pinned** in `package.json` (no `^`).
At runtime the SDK, React, and Mantine are supplied by the mooreseditor host,
not bundled into your plugin. Your plugin therefore MUST be built against the
SDK version that matches the mooreseditor build you target. Using a newer SDK
than the host ships will break at load time. When upgrading, bump the pin to
the version that matches your target mooreseditor release.

## Setup

1. Copy this directory into a new repository and `git init`.
2. Install dependencies: `npm install`
   (For a local Verdaccio registry, copy `.npmrc.example` to `.npmrc` first.)

## Build

    npm run build

Produces:

- `dist/index.js` — your plugin bundle (host-shared deps externalized)
- `dist/index.css` — plugin styles (if any)
- `plugin.json` — runtime manifest

## Deploy

Copy `plugin.json` and `dist/` into the project a user opens in mooreseditor:

    <project>/plugins/hello/
    ├── plugin.json
    └── dist/index.js, index.css

Then declare it in `<project>/mooreseditor.config.yml`:

    plugins:
      - dir: ./plugins/hello

Open the project in mooreseditor — a "Hello Plugin" tab appears.

## Customizing

- `src/pluginMetadata.ts` — id / name / version
- `src/plugin-entry.tsx` — the `PluginManifest` (default export, build entry)
- `src/HelloPluginView.tsx` — your React view
- Plugin-only deps (e.g. `@tauri-apps/*`) go in `dependencies` — they are
  bundled. Do NOT add host-shared deps there; keep them in `peerDependencies`.
```

- [ ] **Step 10: Commit**

```bash
git add examples/external-plugin-starter
git commit -m "feat: add external plugin starter template"
```

---

### Task 6: Stand up Verdaccio and publish the SDK to it

**Files:** none in the monorepo (Verdaccio runs from `/tmp`).

- [ ] **Step 1: Start Verdaccio in the background**

Run (background process):

```bash
mkdir -p /tmp/verdaccio-mooreseditor && cd /tmp/verdaccio-mooreseditor && npx verdaccio@^6 --listen 4873
```

Expected: log line `http address - http://localhost:4873/`. Leave it running.

- [ ] **Step 2: Wait for Verdaccio to be reachable**

Run:

```bash
until curl -fs http://localhost:4873/-/ping >/dev/null 2>&1; do sleep 1; done; echo "verdaccio up"
```

Expected: prints `verdaccio up`.

- [ ] **Step 3: Create a Verdaccio user / auth token**

Run:

```bash
npx npm-cli-login -u test -p test -e test@example.com -r http://localhost:4873
```

Expected: writes an auth token for `//localhost:4873/` into `~/.npmrc`. (If `npm-cli-login` is unavailable, run `npm adduser --registry http://localhost:4873` interactively with username `test`, password `test`, email `test@example.com`.)

- [ ] **Step 4: Build and publish the SDK to Verdaccio**

Run:

```bash
cd packages/plugin-sdk && pnpm run build && pnpm publish --registry http://localhost:4873 --no-git-checks
```

Expected: `+ @mooreseditor/plugin-sdk@1.0.0`. MUST use `pnpm publish` — `npm publish` ignores `publishConfig.exports` and would publish a broken package.

- [ ] **Step 5: Verify the published package resolves correctly**

Run:

```bash
curl -s http://localhost:4873/@mooreseditor%2fplugin-sdk | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);const v=j.versions['1.0.0'];console.log('exports[.]:',JSON.stringify(v.exports['.']));console.log('exports[./vite]:',JSON.stringify(v.exports['./vite']));})"
```

Expected: both exports point at `./dist/...`. If they point at `./src/...`, STOP — the hybrid swap failed.

- [ ] **Step 6: No commit** (no monorepo files changed). Record the Verdaccio URL and that v1.0.0 is published for later tasks.

---

### Task 7: Create the throwaway test repo and build the plugin

**Files:** all under `~/WebstormProjects/mooreseditor-plugin-test/` (outside the monorepo).

- [ ] **Step 1: Create the test repo from the starter**

Run:

```bash
rm -rf ~/WebstormProjects/mooreseditor-plugin-test
cp -r examples/external-plugin-starter ~/WebstormProjects/mooreseditor-plugin-test
cd ~/WebstormProjects/mooreseditor-plugin-test && git init -q && echo "test repo created"
```

Expected: prints `test repo created`. This directory is completely outside the mooreseditor monorepo and its pnpm workspace.

- [ ] **Step 2: Point the @mooreseditor scope at Verdaccio**

Run:

```bash
cd ~/WebstormProjects/mooreseditor-plugin-test && cp .npmrc.example .npmrc && cat .npmrc
```

Expected: `.npmrc` contains `@mooreseditor:registry=http://localhost:4873`.

- [ ] **Step 3: Install dependencies**

Run:

```bash
cd ~/WebstormProjects/mooreseditor-plugin-test && npm install
```

Expected: exits 0. `node_modules/@mooreseditor/plugin-sdk/package.json` exists with `version: 1.0.0` and `exports` pointing at `dist/`.

- [ ] **Step 4: Verify the installed SDK is the dist build, not source**

Run:

```bash
cd ~/WebstormProjects/mooreseditor-plugin-test && ls node_modules/@mooreseditor/plugin-sdk && test -f node_modules/@mooreseditor/plugin-sdk/dist/index.js && test ! -d node_modules/@mooreseditor/plugin-sdk/src && echo "DIST-ONLY OK"
```

Expected: prints `DIST-ONLY OK` (the installed package has `dist/` and NO `src/`).

- [ ] **Step 5: Type-check the plugin**

Run:

```bash
cd ~/WebstormProjects/mooreseditor-plugin-test && npm run type-check
```

Expected: exits 0. This proves the SDK's `.` and `./vite` `.d.ts` files resolve from the published package.

- [ ] **Step 6: Build the plugin**

Run:

```bash
cd ~/WebstormProjects/mooreseditor-plugin-test && npm run build && ls -la dist plugin.json
```

Expected: `dist/index.js` and `plugin.json` exist. (`dist/index.css` may or may not exist depending on whether components pull in CSS.)

- [ ] **Step 7: No monorepo commit.** Commit inside the test repo for tidiness:

```bash
cd ~/WebstormProjects/mooreseditor-plugin-test && git add -A && git commit -q -m "external plugin built against published SDK"
```

---

### Task 8: Verify the built plugin bundle is correct

**Files:** none (verification only, against `~/WebstormProjects/mooreseditor-plugin-test/dist/`).

- [ ] **Step 1: Verify host-shared deps are externalized (NOT bundled)**

Run:

```bash
cd ~/WebstormProjects/mooreseditor-plugin-test && node -e "
const fs=require('fs');
const src=fs.readFileSync('dist/index.js','utf8');
const shared=['react','react-dom','react/jsx-runtime','@mantine/core','@mantine/hooks','@mantine/notifications','@tabler/icons-react','@xyflow/react','@mooreseditor/plugin-sdk'];
const m=[...src.matchAll(/from\s*[\"']([^\"']+)[\"']/g)].map(x=>x[1]);
const externalized=shared.filter(s=>m.includes(s));
console.log('externalized import specifiers found:', externalized.join(', '));
if(!m.includes('@mooreseditor/plugin-sdk')) throw new Error('plugin-sdk was bundled, expected external');
if(!m.includes('react')) throw new Error('react was bundled, expected external');
console.log('SHARED-DEPS EXTERNALIZED OK');
"
```

Expected: prints `SHARED-DEPS EXTERNALIZED OK`. The bundle must `import` shared deps by bare specifier (the host's import map resolves them at runtime), not inline their source.

- [ ] **Step 2: Verify `@tauri-apps/*` IS bundled (not externalized)**

Run:

```bash
cd ~/WebstormProjects/mooreseditor-plugin-test && node -e "
const src=require('fs').readFileSync('dist/index.js','utf8');
const m=[...src.matchAll(/from\s*[\"']([^\"']+)[\"']/g)].map(x=>x[1]);
if(m.some(s=>s.startsWith('@tauri-apps/'))) throw new Error('@tauri-apps left external, expected bundled');
console.log('TAURI BUNDLED OK');
"
```

Expected: prints `TAURI BUNDLED OK`. (Note: this starter view does not import `@tauri-apps`, so the dep simply will not appear at all — that also satisfies the check. The check only fails if a bare `@tauri-apps/*` import survives.)

- [ ] **Step 3: Verify `plugin.json` matches the metadata**

Run:

```bash
cd ~/WebstormProjects/mooreseditor-plugin-test && node -e "
const p=require('./plugin.json');
if(p.id!=='hello'||p.name!=='Hello Plugin'||p.version!=='0.1.0') throw new Error('plugin.json metadata mismatch: '+JSON.stringify(p));
if(p.entry!=='dist/index.js') throw new Error('bad entry: '+p.entry);
console.log('PLUGIN.JSON OK', JSON.stringify(p));
"
```

Expected: prints `PLUGIN.JSON OK` followed by the manifest.

- [ ] **Step 4: No commit** (verification only). If any check fails, the defect is in `mooresPlugin()` externalization or the starter config — fix the relevant earlier task before continuing.

---

### Task 9: End-to-end load in the Tauri host

**Files:**

- Create: a scratch project directory the host opens, e.g. `/tmp/mooreseditor-e2e-project/`.

This task needs the Tauri runtime (`pnpm run tauri:dev`); a pure-browser `pnpm run dev` cannot load plugins.

- [ ] **Step 1: Build a scratch project the host can open**

Run:

```bash
mkdir -p /tmp/mooreseditor-e2e-project/plugins/hello/dist
cp ~/WebstormProjects/mooreseditor-plugin-test/plugin.json /tmp/mooreseditor-e2e-project/plugins/hello/
cp ~/WebstormProjects/mooreseditor-plugin-test/dist/index.js /tmp/mooreseditor-e2e-project/plugins/hello/dist/
cp ~/WebstormProjects/mooreseditor-plugin-test/dist/index.css /tmp/mooreseditor-e2e-project/plugins/hello/dist/ 2>/dev/null || true
```

Expected: files copied. `plugins/hello/plugin.json` + `plugins/hello/dist/index.js` exist under the scratch project.

- [ ] **Step 2: Write the project's `mooreseditor.config.yml`**

Create `/tmp/mooreseditor-e2e-project/mooreseditor.config.yml`:

```yaml
plugins:
  - dir: ./plugins/hello
```

Note: a real project also needs schema/master data. If the host refuses to open a project with no schema, copy a minimal existing sample project's schema files alongside this config (inspect the monorepo's sample/e2e fixtures for the minimal set) and place the `plugins/hello/` dir + config into that copy instead.

- [ ] **Step 3: Launch the Tauri host**

Run (background):

```bash
cd /Users/katsumi/WebstormProjects/mooreseditor && pnpm run tauri:dev
```

Expected: the Tauri desktop window opens.

- [ ] **Step 4: Open the scratch project and verify the plugin tab**

In the running app: use the File-open control to open `/tmp/mooreseditor-e2e-project/`. Then confirm:

- A **"Hello Plugin"** tab appears alongside the built-in tabs.
- Clicking it renders the view: title "Hello from an external plugin" and a `projectDir:` line showing the opened path.
- The dev console shows NO `プラグインのロードに失敗` error and NO `does not provide an export named` error for this plugin.

Expected: the tab is present and renders. This is the end-to-end proof that a plugin built in a separate repository, against the npm-published SDK, loads and runs in the host.

- [ ] **Step 5: Capture evidence**

Take a screenshot of the rendered "Hello Plugin" tab and save it to `docs/superpowers/plans/evidence/2026-05-22-external-plugin-e2e.png` (create the dir). Note the console output state in the commit message.

- [ ] **Step 6: Commit the evidence**

```bash
git add docs/superpowers/plans/evidence/2026-05-22-external-plugin-e2e.png
git commit -m "test: capture external-plugin end-to-end load evidence"
```

---

### Task 10: Wrap up

**Files:** none

- [ ] **Step 1: Stop Verdaccio**

Stop the background Verdaccio process. Optionally `rm -rf /tmp/verdaccio-mooreseditor`.

- [ ] **Step 2: Summarize for the user**

Report:

- `@mooreseditor/plugin-sdk` is now npm-publishable (verified via Verdaccio).
- `examples/external-plugin-starter/` exists and was proven to build + load from a separate repo.
- The throwaway test repo (`~/WebstormProjects/mooreseditor-plugin-test/`) and `/tmp` scratch dirs can be deleted.
- **Follow-up requiring user approval (out of scope):** publishing `@mooreseditor/plugin-sdk@1.0.0` to the real npm registry (`pnpm --filter @mooreseditor/plugin-sdk publish`). Do NOT publish to real npm without explicit approval.

- [ ] **Step 3: No commit.**

---

## Self-Review

**Spec coverage:**

- Spec §1 (SDK npm packaging) → Tasks 1, 2, 3 (tsup `.` build, `./vite` subpath build, `package.json` `publishConfig`/`files`/`pnpm publish`).
- Spec §1 host-unaffected requirement → Task 4.
- Spec §2 (starter template, version contract, exact pin, `@tauri-apps` bundled) → Task 5.
- Spec §3 (Verdaccio, `pnpm publish`, test repo, `.npmrc` scoped, bundle checks, E2E) → Tasks 6, 7, 8, 9.
- Spec "out of scope: real npm publish" → Task 10 Step 2.
- Audit fix #1 (`pnpm publish` not `npm publish`) → Task 3 Step 4 + Task 6 Step 4 (explicit). Audit fix #3 (`./vite` `.d.ts`) → Task 2. Audit fix #2 (exact pin) → Task 5 Step 1 + README.

**Placeholder scan:** No TBD/TODO. Task 9 Step 2 contains a conditional ("if the host refuses…") — this is a genuine runtime branch, not a placeholder, and gives a concrete fallback action.

**Type consistency:** `pluginMetadata` shape (`id`/`name`/`version`) is consistent across `pluginMetadata.ts`, `plugin-entry.tsx`, and the `plugin.json` check in Task 8 Step 3. `PluginManifest`/`HostAPI`/`PluginView` imported from `@mooreseditor/plugin-sdk` match the contract used by `node-graph/src/plugin-entry.tsx`. `mooresPlugin(pluginMetadata)` usage matches `node-graph/vite.config.ts`. Build entry path `src/plugin-entry.tsx` matches the hardcoded entry in `mooresPlugin.js`.
