// AI Generated Test Code
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { saveProjectData } from "./saveProjectData";

import type { Column } from "../hooks/useJson";

// @tauri-apps/api/path and @tauri-apps/plugin-fs are aliased to mock files
// via vitest.config.ts — the vi.fn() stubs defined there are used directly.

const makeColumns = (titles: string[]): Column[] =>
  titles.map((title) => ({ title, data: [{ id: 1 }] }));

describe("saveProjectData", () => {
  let onSuccess: ReturnType<typeof vi.fn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    onSuccess = vi.fn();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  // -----------------------------------------------------------------------
  // Early-return guards
  // -----------------------------------------------------------------------

  it("returns early and does NOT call onSuccess when columns is empty", async () => {
    await saveProjectData({
      columns: [],
      projectDir: "/some/project",
      masterDir: "/some/project/master",
      onSuccess,
    });

    expect(onSuccess).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "保存に必要な情報が不足しています",
    );
  });

  it("returns early and does NOT call onSuccess when projectDir is null", async () => {
    await saveProjectData({
      columns: makeColumns(["items"]),
      projectDir: null,
      masterDir: "/some/project/master",
      onSuccess,
    });

    expect(onSuccess).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "保存に必要な情報が不足しています",
    );
  });

  // -----------------------------------------------------------------------
  // SampleProject path
  // -----------------------------------------------------------------------

  it("does NOT call writeTextFile and calls onSuccess for SampleProject", async () => {
    const { writeTextFile } = await import("@tauri-apps/plugin-fs");
    const mockWrite = vi.mocked(writeTextFile);

    // Dev server fetch succeeds
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    await saveProjectData({
      columns: makeColumns(["items"]),
      projectDir: "SampleProject",
      masterDir: null,
      onSuccess,
    });

    expect(mockWrite).not.toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "サンプルプロジェクトのため、保存はスキップされました",
    );
  });

  it("calls onSuccess for SampleProject even when dev-server fetch rejects", async () => {
    // fetch throws — the inner try/catch must swallow the error
    global.fetch = vi.fn().mockRejectedValue(new Error("network error"));

    await saveProjectData({
      columns: makeColumns(["items"]),
      projectDir: "SampleProject",
      masterDir: null,
      onSuccess,
    });

    expect(onSuccess).toHaveBeenCalledOnce();
  });

  // -----------------------------------------------------------------------
  // Normal save path — happy path
  // -----------------------------------------------------------------------

  it("calls writeTextFile with the joined path per column and calls onSuccess", async () => {
    const { writeTextFile } = await import("@tauri-apps/plugin-fs");
    const mockWrite = vi.mocked(writeTextFile);
    mockWrite.mockResolvedValue(undefined);

    const columns: Column[] = [
      { title: "items", data: [{ id: 1 }] },
      { title: "blocks", data: [{ id: 2 }] },
    ];

    await saveProjectData({
      columns,
      projectDir: "/project",
      masterDir: "/project/master",
      onSuccess,
    });

    // path.join mock joins with "/"
    expect(mockWrite).toHaveBeenCalledTimes(2);
    expect(mockWrite).toHaveBeenCalledWith(
      "/project/master/items.json",
      JSON.stringify([{ id: 1 }], null, 2),
    );
    expect(mockWrite).toHaveBeenCalledWith(
      "/project/master/blocks.json",
      JSON.stringify([{ id: 2 }], null, 2),
    );
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  // -----------------------------------------------------------------------
  // Normal save path — error cases
  // -----------------------------------------------------------------------

  it("collects errors and does NOT call onSuccess when masterDir is null", async () => {
    const { writeTextFile } = await import("@tauri-apps/plugin-fs");
    const mockWrite = vi.mocked(writeTextFile);

    await saveProjectData({
      columns: makeColumns(["items", "blocks"]),
      projectDir: "/project",
      masterDir: null,
      onSuccess,
    });

    expect(mockWrite).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "保存中にエラー:",
      expect.objectContaining({
        message: expect.stringContaining("masterDir is not set"),
      }),
    );
  });

  it("collects errors and does NOT call onSuccess when writeTextFile throws", async () => {
    const { writeTextFile } = await import("@tauri-apps/plugin-fs");
    const mockWrite = vi.mocked(writeTextFile);
    mockWrite.mockRejectedValue(new Error("disk full"));

    await saveProjectData({
      columns: makeColumns(["items"]),
      projectDir: "/project",
      masterDir: "/project/master",
      onSuccess,
    });

    expect(onSuccess).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "保存中にエラー:",
      expect.objectContaining({
        message: expect.stringContaining("items.json"),
      }),
    );
  });
});
