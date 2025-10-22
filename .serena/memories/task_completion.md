# Task Completion Checklist
- Run `pnpm run lint` (Turbo executes package-level lint scripts).
- Run `pnpm run build` to ensure TypeScript + Vite build succeeds.
- Execute targeted unit (`pnpm --filter @mooreseditor/mooreseditor test`) or E2E (`pnpm run test:e2e -- --reporter=list`) tests when changes affect relevant areas.
- If clipboard/UI behavior changes, validate via Playwright workflow against `http://localhost:1420` as documented.
- Review console logs for schema/JSON load errors after modifications.