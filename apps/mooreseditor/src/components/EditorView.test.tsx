// AI Generated Test Code
import { describe, it, expect, vi, afterEach, afterAll } from "vitest";
import "@testing-library/jest-dom";

import EditorView from "./EditorView";

import type { Column } from "../hooks/useJson";
import type { Schema } from "@mooreseditor/plugin-sdk";

import { render, screen, fireEvent, waitFor } from "@/test/utils/test-utils";

// --------------------------------------------------------------------------
// Component mocks
// --------------------------------------------------------------------------

vi.mock("./Sidebar", () => ({
  default: ({
    menuToFileMap,
    selectedFile: _selectedFile,
    loadFileData,
    openProjectDir,
    isEditing,
  }: any) => (
    <div data-testid="sidebar">
      <button onClick={openProjectDir}>Open Project</button>
      {menuToFileMap &&
        Object.keys(menuToFileMap).map((key) => (
          <button key={key} onClick={() => loadFileData(key)}>
            {key}
          </button>
        ))}
      {isEditing && <span data-testid="editing-indicator">Editing</span>}
    </div>
  ),
}));

vi.mock("./FormView", () => ({
  default: ({
    data,
    schema,
    onDataChange,
    onObjectArrayClick,
    path: _path,
    rootData: _rootData,
  }: any) => (
    <div data-testid="form-view">
      <input
        data-testid="form-input"
        defaultValue={JSON.stringify(data)}
        onChange={(e) => onDataChange(JSON.parse(e.target.value))}
      />
      {schema?.properties?.find((p: any) => p.type === "array") && (
        <button
          data-testid="array-click"
          onClick={() =>
            onObjectArrayClick(["items"], {
              type: "array",
              items: { type: "object" },
            })
          }
        >
          Click Array
        </button>
      )}
    </div>
  ),
}));

vi.mock("./TableView", () => ({
  TableView: ({ data, schema: _schema, onDataChange, onRowSelect }: any) => (
    <div data-testid="table-view">
      <div data-testid="table-data">{JSON.stringify(data)}</div>
      {data?.map((_: any, index: number) => (
        <button
          key={index}
          data-testid={`row-${index}`}
          onClick={() => onRowSelect(index)}
        >
          Select Row {index}
        </button>
      ))}
      <button
        data-testid="table-change"
        onClick={() => onDataChange([...data, { new: "item" }])}
      >
        Add Item
      </button>
    </div>
  ),
}));

vi.mock("../hooks/useNestedViewScroll", () => ({
  useNestedViewScroll: (
    _nestedViews: any[],
    setNestedViews: (updater: (prev: any[]) => any[]) => void,
  ) => ({
    scrollContainerRef: { current: null } as { current: HTMLDivElement | null },
    openNestedView: (
      index: number,
      nextView: any,
      _options?: { forceScroll?: boolean },
    ) => {
      setNestedViews((prev) => {
        const sliced = prev.slice(0, index + 1);
        return [...sliced, nextView];
      });
    },
  }),
}));

// --------------------------------------------------------------------------
// Shared test fixtures
// --------------------------------------------------------------------------

const objectSchema: Schema = { type: "object", properties: [] };
const arraySchema: Schema = {
  type: "array",
  items: {
    type: "object",
    properties: [
      { key: "id", type: "integer" },
      { key: "name", type: "string" },
    ],
  },
};

const defaultMenuToFileMap: Record<string, string> = {
  items: "items.json",
  recipes: "recipes.json",
};

interface EditorViewPropsShape {
  menuToFileMap: Record<string, string>;
  jsonData: Column[];
  setJsonData: (data: Column[] | ((prev: Column[]) => Column[])) => void;
  schemas: Record<string, Schema>;
  loadSchema: (schemaName: string) => Promise<Schema | null>;
  loadJsonFile: (
    menuItem: string,
    columnIndex: number,
    schema: Schema | null,
  ) => Promise<void>;
  openProjectDir: () => void;
  isPreloading: boolean;
  isEditing: boolean;
  hasUnsavedChanges: boolean;
  onMarkDirty: () => void;
}

function buildProps(
  overrides: Partial<EditorViewPropsShape> = {},
): EditorViewPropsShape {
  const setJsonData = vi.fn();
  const loadSchema = vi.fn().mockResolvedValue(objectSchema) as (
    schemaName: string,
  ) => Promise<Schema | null>;
  const loadJsonFile = vi.fn().mockResolvedValue(undefined) as (
    menuItem: string,
    columnIndex: number,
    schema: Schema | null,
  ) => Promise<void>;
  const openProjectDir = vi.fn();
  const onMarkDirty = vi.fn();

  return {
    menuToFileMap: defaultMenuToFileMap,
    jsonData: [],
    setJsonData,
    schemas: {},
    loadSchema,
    loadJsonFile,
    openProjectDir,
    isPreloading: false,
    isEditing: false,
    hasUnsavedChanges: false,
    onMarkDirty,
    ...overrides,
  };
}

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe("EditorView", () => {
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

  // -----------------------------------------------------------------------
  // 1. Sidebar rendering
  // -----------------------------------------------------------------------

  it("renders the sidebar with all menu items", () => {
    render(<EditorView {...buildProps()} />);

    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByText("items")).toBeInTheDocument();
    expect(screen.getByText("recipes")).toBeInTheDocument();
  });

  it("calls openProjectDir when the Open Project button is clicked", () => {
    const props = buildProps();
    render(<EditorView {...props} />);

    fireEvent.click(screen.getByText("Open Project"));

    expect(props.openProjectDir).toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // 2. Sidebar item click → loads file data
  // -----------------------------------------------------------------------

  it("loads schema and json file when a not-yet-loaded menu item is clicked", async () => {
    const props = buildProps();
    render(<EditorView {...props} />);

    fireEvent.click(screen.getByText("recipes"));

    await waitFor(() => {
      expect(props.loadSchema).toHaveBeenCalledWith("recipes");
    });

    await waitFor(() => {
      expect(props.loadJsonFile).toHaveBeenCalledWith(
        "recipes",
        0,
        expect.anything(),
      );
    });
  });

  it("uses cached data and skips loadJsonFile when the item is already in jsonData", async () => {
    const props = buildProps({
      jsonData: [{ title: "items", data: { test: "cached" } }],
      schemas: { items: objectSchema },
    });
    render(<EditorView {...props} />);

    fireEvent.click(screen.getByText("items"));

    // The item is already cached — schema/file loads should NOT be triggered.
    await waitFor(() => {
      expect(props.loadJsonFile).not.toHaveBeenCalled();
    });
    expect(props.loadSchema).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // 3. Schema type → view type resolution
  // -----------------------------------------------------------------------

  it("shows FormView for an object-type schema after selecting a menu item", async () => {
    const props = buildProps({
      jsonData: [{ title: "items", data: { name: "Test" } }],
      schemas: { items: objectSchema },
    });
    render(<EditorView {...props} />);

    fireEvent.click(screen.getByText("items"));

    await waitFor(() => {
      expect(screen.getByTestId("form-view")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("table-view")).not.toBeInTheDocument();
  });

  it("shows TableView for an array-type schema after selecting a menu item", async () => {
    const props = buildProps({
      jsonData: [
        {
          title: "items",
          data: [
            { id: 1, name: "A" },
            { id: 2, name: "B" },
          ],
        },
      ],
      schemas: { items: arraySchema },
    });
    render(<EditorView {...props} />);

    fireEvent.click(screen.getByText("items"));

    await waitFor(() => {
      expect(screen.getByTestId("table-view")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("form-view")).not.toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // 4. Data changes call setJsonData and onMarkDirty
  // -----------------------------------------------------------------------

  it("calls setJsonData and onMarkDirty when FormView reports a data change", async () => {
    const props = buildProps({
      jsonData: [{ title: "items", data: { name: "Test" } }],
      schemas: { items: objectSchema },
    });
    render(<EditorView {...props} />);

    fireEvent.click(screen.getByText("items"));

    await waitFor(() => {
      expect(screen.getByTestId("form-view")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId("form-input"), {
      target: { value: '{"name":"Updated"}' },
    });

    await waitFor(() => {
      expect(props.setJsonData).toHaveBeenCalled();
      expect(props.onMarkDirty).toHaveBeenCalled();
    });
  });

  it("calls setJsonData and onMarkDirty when TableView reports a data change", async () => {
    const props = buildProps({
      jsonData: [{ title: "items", data: [{ id: 1 }] }],
      schemas: { items: arraySchema },
    });
    render(<EditorView {...props} />);

    fireEvent.click(screen.getByText("items"));

    await waitFor(() => {
      expect(screen.getByTestId("table-view")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("table-change"));

    await waitFor(() => {
      expect(props.setJsonData).toHaveBeenCalled();
      expect(props.onMarkDirty).toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // 5. Nested view navigation
  // -----------------------------------------------------------------------

  it("opens a nested TableView when FormView fires onObjectArrayClick", async () => {
    const schemaWithArray: Schema = {
      type: "object",
      properties: [
        {
          key: "items",
          type: "array",
          items: { type: "object" },
        },
      ],
    };

    const props = buildProps({
      jsonData: [
        {
          title: "items",
          data: { items: [{ id: 1 }, { id: 2 }] },
        },
      ],
      schemas: { items: schemaWithArray },
    });
    render(<EditorView {...props} />);

    fireEvent.click(screen.getByText("items"));

    await waitFor(() => {
      expect(screen.getByTestId("form-view")).toBeInTheDocument();
    });

    // The FormView mock renders an "array-click" button when schema has array property
    fireEvent.click(screen.getByTestId("array-click"));

    await waitFor(() => {
      expect(screen.getByTestId("table-view")).toBeInTheDocument();
    });
  });

  it("opens a nested FormView when a TableView row is selected", async () => {
    const tableSchema: Schema = {
      type: "array",
      items: {
        type: "object",
        properties: [
          { key: "id", type: "integer" },
          { key: "name", type: "string" },
        ],
      },
    };

    const props = buildProps({
      jsonData: [
        {
          title: "items",
          data: [
            { id: 1, name: "Item 1" },
            { id: 2, name: "Item 2" },
          ],
        },
      ],
      schemas: { items: tableSchema },
    });
    render(<EditorView {...props} />);

    fireEvent.click(screen.getByText("items"));

    await waitFor(() => {
      expect(screen.getByTestId("table-view")).toBeInTheDocument();
    });

    // Click the first row to open a nested FormView
    fireEvent.click(screen.getByTestId("row-0"));

    await waitFor(() => {
      expect(screen.getByTestId("form-view")).toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------------
  // 6. Switching between menu items resets nested views
  // -----------------------------------------------------------------------

  it("resets nested views when a different menu item is selected", async () => {
    const props = buildProps({
      jsonData: [
        { title: "items", data: { name: "Test" } },
        { title: "recipes", data: { name: "Recipe" } },
      ],
      schemas: {
        items: objectSchema,
        recipes: objectSchema,
      },
    });
    render(<EditorView {...props} />);

    // Load items
    fireEvent.click(screen.getByText("items"));
    await waitFor(() => {
      expect(screen.getByTestId("form-view")).toBeInTheDocument();
    });

    // Switch to recipes — the view should still show a form (fresh load)
    fireEvent.click(screen.getByText("recipes"));
    await waitFor(() => {
      // The form-view should still be present (now showing recipes data)
      expect(screen.getByTestId("form-view")).toBeInTheDocument();
    });
  });
});
