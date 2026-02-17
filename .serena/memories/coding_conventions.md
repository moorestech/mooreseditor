# Coding Conventions

- Treat schemas as fully dynamic; never hard-code shape assumptions outside their definitions.
- Prefer descriptive, type-safe utilities; extend existing hooks/libs for schema-aware logic.
- Error handling: attempt production path first (e.g., filesystem reads), catch errors for dev fallbacks instead of environment conditionals.
- UI code leans on Mantine components; keep styling consistent with existing patterns and minimal inline CSS.
- Add brief comments only when logic is non-obvious; otherwise keep code self-explanatory.
- TypeScript strictness via workspace tsconfig—ensure new code satisfies project lint and type rules.
