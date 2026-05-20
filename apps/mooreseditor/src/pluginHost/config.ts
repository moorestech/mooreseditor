import { parse } from "yaml";

export interface PluginConfigEntry {
  dir: string;
}

/** mooreseditor.config.yaml の文字列から plugins[].dir を抽出する。 */
export function parsePluginConfig(yamlText: string): PluginConfigEntry[] {
  try {
    const doc = parse(yamlText) as { plugins?: { dir?: string }[] } | null;
    const plugins = doc?.plugins;
    if (!Array.isArray(plugins)) {
      return [];
    }
    return plugins
      .filter((p): p is { dir: string } => typeof p?.dir === "string")
      .map((p) => ({ dir: p.dir }));
  } catch {
    return [];
  }
}
