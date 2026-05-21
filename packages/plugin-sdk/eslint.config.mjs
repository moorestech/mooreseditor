import * as path from "node:path";
import { fileURLToPath } from "node:url";

import tauriConfig from "@mooreseditor/eslint-config/tauri";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default tseslint.config(
  {
    ignores: [
      "node_modules",
      "dist",
      "build",
      ".cache",
      "coverage",
      "eslint.config.mjs",
      "vitest.config.ts",
      "src/vite/*.js",
    ],
  },
  {
    languageOptions: {
      parserOptions: {
        project: [path.resolve(__dirname, "tsconfig.json")],
        ecmaVersion: 2024,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  ...tauriConfig,
);
