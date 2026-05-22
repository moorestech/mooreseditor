# mooreseditor External Plugin Starter

A self-contained template for building a mooreseditor plugin in a repository
**separate from the mooreseditor monorepo**.

Full guide: https://github.com/moorestech/mooreseditor/blob/master/docs/plugin-development.md

## Prerequisites

- Node.js 20+ and a package manager (npm or pnpm)
- `@moorestech/mooreseditor-plugin-sdk` available from npm

## Version contract (IMPORTANT)

`@moorestech/mooreseditor-plugin-sdk` is **exact-pinned** in `package.json` (no `^`).
At runtime the SDK, React, and Mantine are supplied by the mooreseditor host,
not bundled into your plugin. Your plugin therefore MUST be built against the
SDK version that matches the mooreseditor build you target. Using a newer SDK
than the host ships will break at load time. When upgrading, bump the pin to
the version that matches your target mooreseditor release.

## Setup

1. Copy this directory into a new repository and `git init`.
2. Install dependencies: `npm install`

## Build

    npm run build

Produces:

- `dist/index.js` - your plugin bundle (host-shared deps externalized)
- `dist/index.css` - plugin styles (if any)
- `plugin.json` - runtime manifest

## Deploy

Copy `plugin.json` and `dist/` into the project a user opens in mooreseditor:

    <project>/plugins/hello/
    ├── plugin.json
    └── dist/index.js, index.css

Then declare it in `<project>/mooreseditor.config.yml`:

    plugins:
      - dir: ./plugins/hello

Open the project in mooreseditor - a "Hello Plugin" tab appears.

## Customizing

- `src/pluginMetadata.ts` - id / name / version
- `src/plugin-entry.tsx` - the `PluginManifest` (default export, build entry)
- `src/HelloPluginView.tsx` - your React view
- Plugin-only deps (e.g. `@tauri-apps/*`) go in `dependencies` - they are
  bundled. Do NOT add host-shared deps there; keep them in `peerDependencies`.

## Legacy notes

Do not copy old migration-plan snippets that manually configure Vite library
mode or use static plugin loading. New external plugins should use
`mooresPlugin(pluginMetadata)` from `@moorestech/mooreseditor-plugin-sdk/vite`.
