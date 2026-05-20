# Tech Stack & Structure

- **Frontend**: React 19, TypeScript, Vite, Mantine UI, DnD Kit, TanStack Table, Zod.
- **Desktop Shell**: Tauri 2 with plugins (dialog, fs, notification, opener).
- **Testing**: Vitest (unit), Playwright (E2E via `e2e-tests` workspace).
- **Monorepo**: pnpm + Turbo; main app under `apps/mooreseditor`, shared configs under `packages/*`.
- **Source Layout**: `src/components` (TableView/FormView, Sidebar, drag helpers); `src/hooks` (schema/json/project state, clipboard, GUID handling); `src/libs/schema` (schema parsing/validation/types); `src/utils`, `src/contexts`, `src/types`.
- **Configs**: `eslint.config.mjs` extends custom workspace config with project-aware parsing; `vite.config.ts`, `tsconfig.json` for React + Tauri setup.
