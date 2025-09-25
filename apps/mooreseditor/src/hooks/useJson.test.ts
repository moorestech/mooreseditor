import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { useJson } from "./useJson";

// Mock dependencies
vi.mock("@tauri-apps/api/path", () => ({
  join: vi.fn((...paths: string[]) => Promise.resolve(paths.join("/"))),
}));

vi.mock("@tauri-apps/plugin-fs", () => ({
  readTextFile: vi.fn(),
  writeTextFile: vi.fn(),
  exists: vi.fn(),
  create: vi.fn(),
}));

vi.mock("../utils/devFileSystem", () => ({
  getSampleJson: vi.fn(),
}));

vi.mock("./useProject", () => ({
  useProject: vi.fn(() => ({
    projectDir: "/test/project",
    masterDir: "/test/project/master",
    schemaDir: "/test/project/schema",
    menuToFileMap: {},
    loading: false,
    openProjectDir: vi.fn(),
  })),
}));

// Mock import.meta.env
vi.stubGlobal("import.meta.env", {
  DEV: false,
});

describe("useJson", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize with empty jsonData", () => {
    const { result } = renderHook(() => useJson());

    expect(result.current.jsonData).toEqual([]);
  });

  it("should load JSON file successfully", async () => {
    const { readTextFile } = await import("@tauri-apps/plugin-fs");
    const mockReadTextFile = vi.mocked(readTextFile);

    const mockData = { items: [{ id: 1, name: "Item 1" }] };
    mockReadTextFile.mockResolvedValueOnce(JSON.stringify(mockData));

    const { result } = renderHook(() => useJson());

    await act(async () => {
      await result.current.loadJsonFile("items");
    });

    expect(result.current.jsonData).toHaveLength(1);
    expect(result.current.jsonData[0]).toEqual({
      title: "items",
      data: mockData,
    });
    expect(mockReadTextFile).toHaveBeenCalledWith(
      "/test/project/master/items.json",
    );
  });

  it("should handle project directory not set", async () => {
    const { useProject } = await import("./useProject");
    const mockUseProject = vi.mocked(useProject);
    mockUseProject.mockReturnValueOnce({
      projectDir: null,
      masterDir: null,
      schemaDir: null,
      menuToFileMap: {},
      loading: false,
      openProjectDir: vi.fn(),
    });

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useJson());

    await act(async () => {
      await result.current.loadJsonFile("items");
    });

    expect(consoleSpy).toHaveBeenCalledWith("Project directory is not set.");
    expect(result.current.jsonData).toEqual([]);
  });

  it("should handle JSON parse error", async () => {
    const { readTextFile } = await import("@tauri-apps/plugin-fs");
    const mockReadTextFile = vi.mocked(readTextFile);

    mockReadTextFile.mockResolvedValueOnce("invalid json");

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useJson());

    await act(async () => {
      await result.current.loadJsonFile("items");
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error loading JSON file for items:",
      expect.any(Error),
    );
    expect(result.current.jsonData).toEqual([]);
  });

  it("should handle file read error", async () => {
    const { readTextFile } = await import("@tauri-apps/plugin-fs");
    const mockReadTextFile = vi.mocked(readTextFile);

    mockReadTextFile.mockRejectedValueOnce(new Error("File not found"));

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useJson());

    await act(async () => {
      await result.current.loadJsonFile("items");
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error loading JSON file for items:",
      expect.any(Error),
    );
    expect(result.current.jsonData).toEqual([]);
  });

  it("should replace data at specific column index", async () => {
    const { readTextFile } = await import("@tauri-apps/plugin-fs");
    const mockReadTextFile = vi.mocked(readTextFile);

    const data1 = { items: [{ id: 1 }] };
    const data2 = { recipes: [{ id: 2 }] };
    const data3 = { materials: [{ id: 3 }] };

    mockReadTextFile
      .mockResolvedValueOnce(JSON.stringify(data1))
      .mockResolvedValueOnce(JSON.stringify(data2))
      .mockResolvedValueOnce(JSON.stringify(data3));

    const { result } = renderHook(() => useJson());

    // Load first data
    await act(async () => {
      await result.current.loadJsonFile("items");
    });

    // Load second data
    await act(async () => {
      await result.current.loadJsonFile("recipes", 1);
    });

    expect(result.current.jsonData).toHaveLength(2);

    // Load at columnIndex 0
    // This will keep data up to index 0 (slice(0, 1) = first element only)
    // Then add the new data
    // Result: [items (kept), materials (new)]
    await act(async () => {
      await result.current.loadJsonFile("materials", 0);
    });

    expect(result.current.jsonData).toHaveLength(2);
    expect(result.current.jsonData[0].title).toBe("items");
    expect(result.current.jsonData[1].title).toBe("materials");
  });

  it("should set json data directly", () => {
    const { result } = renderHook(() => useJson());

    const newData = [{ title: "test", data: [{ id: 1 }] }];

    act(() => {
      result.current.setJsonData(newData);
    });

    expect(result.current.jsonData).toEqual(newData);
  });

  it("should handle sample project in dev mode", async () => {
    // Mock dev mode
    vi.stubGlobal("import.meta.env", {
      DEV: true,
    });

    const { useProject } = await import("./useProject");
    const mockUseProject = vi.mocked(useProject);
    mockUseProject.mockReturnValueOnce({
      projectDir: "SampleProject",
      masterDir: "SampleProject/master",
      schemaDir: "SampleProject/schema",
      menuToFileMap: {},
      loading: false,
      openProjectDir: vi.fn(),
    });

    const { getSampleJson } = await import("../utils/devFileSystem");
    const mockGetSampleJson = vi.mocked(getSampleJson);

    const sampleData = { sample: [{ id: 1 }] };
    mockGetSampleJson.mockResolvedValueOnce(sampleData);

    const { result } = renderHook(() => useJson());

    await act(async () => {
      await result.current.loadJsonFile("items");
    });

    expect(mockGetSampleJson).toHaveBeenCalledWith("items");
    expect(result.current.jsonData[0]).toEqual({
      title: "items",
      data: sampleData,
    });
  });

  it("should handle missing sample json in dev mode", async () => {
    vi.stubGlobal("import.meta.env", {
      DEV: true,
    });

    const { useProject } = await import("./useProject");
    const mockUseProject = vi.mocked(useProject);
    mockUseProject.mockReturnValueOnce({
      projectDir: "SampleProject",
      masterDir: "SampleProject/master",
      schemaDir: "SampleProject/schema",
      menuToFileMap: {},
      loading: false,
      openProjectDir: vi.fn(),
    });

    const { getSampleJson } = await import("../utils/devFileSystem");
    const mockGetSampleJson = vi.mocked(getSampleJson);

    mockGetSampleJson.mockResolvedValueOnce(null);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useJson());

    await act(async () => {
      await result.current.loadJsonFile("items");
    });

    expect(consoleSpy).toHaveBeenCalledWith("Sample JSON not found for: items");
    expect(result.current.jsonData).toEqual([]);
  });

  it("should handle null parsed data", async () => {
    const { readTextFile } = await import("@tauri-apps/plugin-fs");
    const mockReadTextFile = vi.mocked(readTextFile);

    mockReadTextFile.mockResolvedValueOnce("null");

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useJson());

    await act(async () => {
      await result.current.loadJsonFile("items");
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Invalid JSON format in file: items.json",
    );
    expect(result.current.jsonData).toEqual([]);
  });

  it("should log loaded JSON data", async () => {
    const { readTextFile } = await import("@tauri-apps/plugin-fs");
    const mockReadTextFile = vi.mocked(readTextFile);

    const mockData = { test: "data" };
    mockReadTextFile.mockResolvedValueOnce(JSON.stringify(mockData));

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const { result } = renderHook(() => useJson());

    await act(async () => {
      await result.current.loadJsonFile("items");
    });

    expect(consoleSpy).toHaveBeenCalledWith("Loaded JSON data:", mockData);
  });
});
