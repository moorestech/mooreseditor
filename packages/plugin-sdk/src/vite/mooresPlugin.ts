import {
  createPluginJson as createPluginJsonValue,
  mooresPlugin as mooresPluginValue,
  pluginManifestPlugin as pluginManifestPluginValue,
} from "./mooresPlugin.js";
import { sharedDependencySpecs } from "./sharedDeps.js";

interface ViteResolvedConfig {
  root: string;
}

interface VitePlugin {
  name: string;
  configResolved?(config: ViteResolvedConfig): void;
  writeBundle?(): void;
}

export interface MooresPluginUserConfig {
  plugins: VitePlugin[];
  build: {
    lib: {
      entry: string;
      formats: ["es"];
      fileName: () => string;
    };
    rollupOptions: {
      external: string[];
      output: {
        inlineDynamicImports: true;
        assetFileNames: string;
      };
    };
    outDir: string;
    emptyOutDir: true;
  };
}

export interface MooresPluginMetadata {
  id: string;
  name: string;
  version: string;
}

export interface PluginJson extends MooresPluginMetadata {
  entry: "dist/index.js";
  styles: ["dist/index.css"];
}

export const createPluginJson = createPluginJsonValue as (
  metadata: MooresPluginMetadata,
) => PluginJson;

export const pluginManifestPlugin = pluginManifestPluginValue as (
  metadata: MooresPluginMetadata,
) => VitePlugin;

export const mooresPlugin = mooresPluginValue as (
  metadata: MooresPluginMetadata,
) => MooresPluginUserConfig;

export { sharedDependencySpecs };
