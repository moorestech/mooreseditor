# Suggested Commands

- `pnpm install` – install workspace dependencies.
- `pnpm run dev` – run Turbo dev pipeline (delegates to package dev scripts).
- `pnpm run tauri dev` or `pnpm --filter @mooreseditor/mooreseditor tauri dev` – launch Tauri app at http://localhost:1420.
- `pnpm run lint` / `pnpm --filter @mooreseditor/mooreseditor lint` – lint code with ESLint.
- `pnpm run build` / `pnpm --filter @mooreseditor/mooreseditor build` – type-check and bundle via Vite.
- `pnpm --filter @mooreseditor/mooreseditor test` – run Vitest suite.
- `pnpm run test:e2e -- --reporter=list` – execute Playwright E2E tests (UI mode: `test:e2e:ui`).
- `rg <pattern>` – fast code search within workspace.
- `pnpm dlx playwright` commands for debugging (see project Playwright instructions).
