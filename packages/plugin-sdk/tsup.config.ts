import { defineConfig } from "tsup";

// Builds the `.` (component-library) entry only.
// The `./vite` subpath is built separately by scripts/build-vite-subpath.mjs
// because those files are hand-written Node ESM that must ship byte-identical.
export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: "dist",
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
