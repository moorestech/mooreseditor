// AI Generated Test Code
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  afterAll,
} from "vitest";
import "@testing-library/jest-dom";

vi.mock("./hooks/useJson", () => ({
  useJson: vi.fn(),
}));

vi.mock("./hooks/useSchema", () => ({
  useSchema: vi.fn(),
}));

vi.mock("./hooks/useProject", () => ({
  useProject: vi.fn(),
}));

// The editor view is exercised by its own test suite. Here we only verify the
// view-host shell: that the active view renders and that the tab bar is hidden
// when there is a single view. The mock exposes a "mark dirty" trigger and the
// editing flag so we can drive the host's save capability.
vi.mock("./components/EditorView", () => ({
  default: ({ isEditing, onMarkDirty }: any) => (
    <div data-testid="editor-view">
      {isEditing && <span data-testid="editing-indicator">Editing</span>}
      <button data-testid="mark-dirty" onClick={() => onMarkDirty()}>
        Mark Dirty
      </button>
    </div>
  ),
}));

vi.mock("./components/SearchOverlay", () => ({
  SearchOverlay: () => <div data-testid="search-overlay" />,
}));

vi.mock("@tauri-apps/plugin-dialog", () => ({
  open: vi.fn(),
}));

vi.mock("@tauri-apps/plugin-fs", () => ({
  writeTextFile: vi.fn(),
  readTextFile: vi.fn(),
}));

vi.mock("@tauri-apps/api/path", () => ({
  join: vi.fn((dir: string, ...paths: string[]) =>
    Promise.resolve([dir, ...paths].join("/")),
  ),
}));

import App from "./App";
import { useJson } from "./hooks/useJson";
import { useProject } from "./hooks/useProject";
import { useSchema } from "./hooks/useSchema";

import { render, screen, fireEvent, waitFor } from "@/test/utils/test-utils";

describe("App (view host)", () => {
  const mockUseJson = {
    jsonData: [{ title: "items", data: { test: "data" } }],
    setJsonData: vi.fn(),
    loadJsonFile: vi.fn(),
    preloadAllData: vi.fn(),
    isPreloading: false,
    hasUnsavedChanges: false,
    setHasUnsavedChanges: vi.fn(),
    clearUnsavedChanges: vi.fn(),
  };

  const mockUseSchema = {
    schemas: {
      items: { type: "object" as const, properties: [] as any[] },
    },
    loadSchema: vi.fn(),
  };

  const mockUseProject = {
    projectDir: "/test/project",
    schemaDir: "/test/project/schema",
    masterDir: "/test/project/master",
    menuToFileMap: {
      items: "items.json",
      recipes: "recipes.json",
    },
    openProjectDir: vi.fn(),
  };

  beforeEach(() => {
    mockUseSchema.loadSchema.mockResolvedValue({
      type: "object" as const,
      properties: [] as any[],
    });
    vi.mocked(useJson).mockReturnValue(mockUseJson as any);
    vi.mocked(useSchema).mockReturnValue(mockUseSchema as any);
    vi.mocked(useProject).mockReturnValue(mockUseProject as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  // Mantine's AppShell useResizing hook schedules a ~200ms setTimeout that it
  // never clears on unmount. Keep the environment alive long enough for any
  // pending timers to settle.
  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
  });

  it("renders the editor view", () => {
    render(<App />);

    expect(screen.getByTestId("editor-view")).toBeInTheDocument();
  });

  it("renders the search overlay", () => {
    render(<App />);

    expect(screen.getByTestId("search-overlay")).toBeInTheDocument();
  });

  it("hides the tab bar when only one view is registered", () => {
    render(<App />);

    // SegmentedControl renders radio inputs; with a single view none exist.
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  });

  it("preloads data on mount", () => {
    render(<App />);

    expect(mockUseJson.preloadAllData).toHaveBeenCalledWith(
      mockUseSchema.loadSchema,
    );
  });

  it("prevents default on Ctrl+S when there is saveable data", () => {
    vi.mocked(useJson).mockReturnValue({
      ...mockUseJson,
      hasUnsavedChanges: true,
    } as any);

    render(<App />);

    const event = new KeyboardEvent("keydown", {
      key: "s",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");

    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("prevents default on Cmd+S (Mac)", () => {
    render(<App />);

    const event = new KeyboardEvent("keydown", {
      key: "s",
      metaKey: true,
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");

    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("marks the editor dirty and shows the editing indicator", async () => {
    render(<App />);

    expect(screen.queryByTestId("editing-indicator")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("mark-dirty"));

    await waitFor(() => {
      expect(screen.getByTestId("editing-indicator")).toBeInTheDocument();
    });
    expect(mockUseJson.setHasUnsavedChanges).toHaveBeenCalledWith(true);
  });

  it("saves loaded data to disk on Ctrl+S after editing", async () => {
    const { writeTextFile } = await import("@tauri-apps/plugin-fs");
    const mockWriteTextFile = vi.mocked(writeTextFile);

    render(<App />);

    // Mark the editor dirty so the save capability becomes enabled.
    fireEvent.click(screen.getByTestId("mark-dirty"));

    await waitFor(() => {
      expect(screen.getByTestId("editing-indicator")).toBeInTheDocument();
    });

    const event = new KeyboardEvent("keydown", {
      key: "s",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    await waitFor(() => {
      expect(mockWriteTextFile).toHaveBeenCalledWith(
        "/test/project/master/items.json",
        expect.any(String),
      );
    });
  });

  it("logs sample-project saves instead of writing files", async () => {
    const consoleSpy = vi.spyOn(console, "log");

    vi.mocked(useProject).mockReturnValue({
      ...mockUseProject,
      projectDir: "SampleProject",
    } as any);

    render(<App />);

    fireEvent.click(screen.getByTestId("mark-dirty"));

    await waitFor(() => {
      expect(screen.getByTestId("editing-indicator")).toBeInTheDocument();
    });

    const event = new KeyboardEvent("keydown", {
      key: "s",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "サンプルプロジェクトのため、保存はスキップされました",
      );
    });
  });

  it("does not save when there are no columns", () => {
    vi.mocked(useJson).mockReturnValue({
      ...mockUseJson,
      jsonData: [],
    } as any);

    const consoleSpy = vi.spyOn(console, "error");

    render(<App />);

    const event = new KeyboardEvent("keydown", {
      key: "s",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    // canSave is false (no columns), so save is never attempted.
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it("renders without a project open", () => {
    vi.mocked(useProject).mockReturnValue({
      ...mockUseProject,
      projectDir: null,
      menuToFileMap: {},
    } as any);

    render(<App />);

    expect(screen.getByTestId("editor-view")).toBeInTheDocument();
  });
});
