import { describe, expect, it } from "vitest";
import { parsePluginConfig } from "./config";

describe("parsePluginConfig", () => {
  it("plugins 配列の dir を抽出する", () => {
    const yaml = "plugins:\n  - dir: ./plugins/node-graph\n";
    const result = parsePluginConfig(yaml);
    expect(result).toEqual([{ dir: "./plugins/node-graph" }]);
  });

  it("plugins が無いとき空配列を返す", () => {
    expect(parsePluginConfig("other: 1\n")).toEqual([]);
  });

  it("不正な YAML のとき空配列を返す", () => {
    expect(parsePluginConfig(":::not yaml:::")).toEqual([]);
  });
});
