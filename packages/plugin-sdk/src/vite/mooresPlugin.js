import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { sharedDependencySpecs } from "./sharedDeps.js";

export function createPluginJson(metadata) {
  return {
    ...metadata,
    entry: "dist/index.js",
    styles: ["dist/index.css"],
  };
}

export function pluginManifestPlugin(metadata) {
  let root = process.cwd();

  return {
    name: "mooreseditor-plugin-manifest",
    configResolved(config) {
      root = config.root;
    },
    writeBundle() {
      const pluginJsonPath = resolve(root, "plugin.json");
      mkdirSync(dirname(pluginJsonPath), { recursive: true });
      writeFileSync(
        pluginJsonPath,
        `${JSON.stringify(createPluginJson(metadata), null, 2)}\n`,
        "utf8",
      );
    },
  };
}

export function mooresPlugin(metadata) {
  return {
    plugins: [pluginManifestPlugin(metadata)],
    build: {
      lib: {
        entry: "src/plugin-entry.tsx",
        formats: ["es"],
        fileName: () => "index.js",
      },
      rollupOptions: {
        external: sharedDependencySpecs(),
        output: {
          inlineDynamicImports: true,
          assetFileNames: "index[extname]",
        },
      },
      outDir: "dist",
      emptyOutDir: true,
    },
  };
}

export { sharedDependencySpecs };
