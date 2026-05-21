import { beforeEach, describe, expect, it, vi } from "vitest";

import { saveProjectFiles } from "./projectPersistence";

vi.mock("@tauri-apps/plugin-fs", () => ({
  exists: vi.fn(),
  mkdir: vi.fn(),
  writeTextFile: vi.fn(),
}));

describe("saveProjectFiles", () => {
  beforeEach(async () => {
    const fs = await import("@tauri-apps/plugin-fs");
    vi.mocked(fs.writeTextFile).mockReset();
    vi.mocked(fs.exists).mockReset();
    vi.mocked(fs.mkdir).mockReset();
    vi.mocked(fs.writeTextFile).mockResolvedValue(undefined);
    vi.mocked(fs.exists).mockResolvedValue(true);
  });

  it("validates all extra file paths before writing any master file", async () => {
    const { writeTextFile } = await import("@tauri-apps/plugin-fs");

    await expect(
      saveProjectFiles({
        projectDir: "/project",
        masterDir: "/project/master",
        columns: [{ title: "items", data: [{ id: "a" }] }],
        extraFiles: [{ path: "../escape.json", content: "{}" }],
      }),
    ).rejects.toThrow("path traversal");

    expect(writeTextFile).not.toHaveBeenCalled();
  });

  it("writes master and extra files through one host-owned path", async () => {
    const { writeTextFile } = await import("@tauri-apps/plugin-fs");

    await saveProjectFiles({
      projectDir: "/project",
      masterDir: "/project/master",
      columns: [{ title: "items", data: [{ id: "a" }] }],
      extraFiles: [{ path: ".mooreseditor/nodeGraph.v1.json", content: "{}" }],
    });

    expect(writeTextFile).toHaveBeenCalledWith(
      "/project/master/items.json",
      JSON.stringify([{ id: "a" }], null, 2),
    );
    expect(writeTextFile).toHaveBeenCalledWith(
      "/project/.mooreseditor/nodeGraph.v1.json",
      "{}",
    );
  });
});
