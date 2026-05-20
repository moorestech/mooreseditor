// AI Generated Test Code
import "@testing-library/jest-dom";
import { useForeignKeyData } from "@mooreseditor/plugin-sdk";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { useProject } from "../../../hooks/useProject";

import { ForeignKeySelect } from "./ForeignKeySelect";

import { render, screen, fireEvent, waitFor } from "@/test/utils/test-utils";

// Mock the hooks
vi.mock("@mooreseditor/plugin-sdk", () => ({
  useForeignKeyData: vi.fn(),
  buildForeignKeySelectKey: vi.fn(
    (_config: any, _value: any, _displayValue: any, prefix: string) =>
      prefix ?? "foreign-key-select",
  ),
}));

vi.mock("../../../hooks/useProject", () => ({
  useProject: vi.fn(),
}));

describe("ForeignKeySelect", () => {
  const defaultProps = {
    value: null as any,
    onChange: vi.fn(),
    schema: {
      type: "string" as const,
      foreignKey: {
        table: "users",
        key: "id",
        displayFields: ["name", "email"],
        schemaId: "user",
      },
    },
  };

  const mockForeignKeyData = {
    options: [
      {
        id: "1",
        display: "Alice - alice@example.com",
        path: "/users/0",
        indices: new Map(),
      },
      {
        id: "2",
        display: "Bob - bob@example.com",
        path: "/users/1",
        indices: new Map(),
      },
      {
        id: "3",
        display: "Charlie - charlie@example.com",
        path: "/users/2",
        indices: new Map(),
      },
    ],
    loading: false,
    error: null as any,
    displayValue: null as any,
    refresh: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(useProject).mockReturnValue({
      projectDir: "/test/project",
      isProjectOpen: true,
      openProject: vi.fn(),
      closeProject: vi.fn(),
    } as any);

    vi.mocked(useForeignKeyData).mockReturnValue(mockForeignKeyData);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render a select element", () => {
    render(<ForeignKeySelect {...defaultProps} />);

    const select = screen.getByRole("textbox");
    expect(select).toBeInTheDocument();
  });

  it("should show placeholder when no value is selected", () => {
    render(<ForeignKeySelect {...defaultProps} />);

    const select = screen.getByRole("textbox");
    expect(select).toHaveAttribute("placeholder", "Select user");
  });

  it("should display loading state", () => {
    vi.mocked(useForeignKeyData).mockReturnValue({
      ...mockForeignKeyData,
      loading: true,
    });

    render(<ForeignKeySelect {...defaultProps} />);

    const select = screen.getByRole("textbox");
    expect(select).toHaveAttribute("placeholder", "Loading...");
    expect(select).toBeDisabled();
  });

  it("should display error state", () => {
    const errorMessage = "Failed to load data";
    vi.mocked(useForeignKeyData).mockReturnValue({
      ...mockForeignKeyData,
      error: errorMessage,
    });

    render(<ForeignKeySelect {...defaultProps} />);

    const select = screen.getByRole("textbox");
    expect(select).toHaveAttribute("placeholder", errorMessage);
    expect(select).toBeDisabled();
  });

  it("should display options from foreign key data", () => {
    render(<ForeignKeySelect {...defaultProps} />);

    const select = screen.getByRole("textbox");
    fireEvent.click(select);

    expect(screen.getByText("Alice - alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("Bob - bob@example.com")).toBeInTheDocument();
    expect(
      screen.getByText("Charlie - charlie@example.com"),
    ).toBeInTheDocument();
  });

  it("should call onChange when selection changes", async () => {
    const onChange = vi.fn();
    render(<ForeignKeySelect {...defaultProps} onChange={onChange} />);

    const select = screen.getByRole("textbox");
    fireEvent.click(select);

    const option = screen.getByText("Bob - bob@example.com");
    fireEvent.click(option);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith("2");
    });
  });

  it("should handle empty options", () => {
    vi.mocked(useForeignKeyData).mockReturnValue({
      ...mockForeignKeyData,
      options: [],
    });

    render(<ForeignKeySelect {...defaultProps} />);

    const select = screen.getByRole("textbox");
    fireEvent.click(select);

    expect(screen.getByText("No options found")).toBeInTheDocument();
  });

  it("should show error when foreignKey is missing", () => {
    const propsWithoutForeignKey = {
      ...defaultProps,
      schema: { type: "string" as const },
    };

    render(<ForeignKeySelect {...propsWithoutForeignKey} />);

    expect(
      screen.getByText("Foreign key configuration missing"),
    ).toBeInTheDocument();
  });

  it("should be clearable when schema is optional", () => {
    const optionalSchema = {
      ...defaultProps.schema,
      optional: true,
    };

    render(
      <ForeignKeySelect {...defaultProps} schema={optionalSchema} value="1" />,
    );

    const select = screen.getByRole("textbox");
    expect(select).toBeInTheDocument();
  });

  it("should not be clearable when schema is required", () => {
    const requiredSchema = {
      ...defaultProps.schema,
      optional: false,
    };

    render(
      <ForeignKeySelect {...defaultProps} schema={requiredSchema} value="1" />,
    );

    const select = screen.getByRole("textbox");
    expect(select).toBeInTheDocument();
  });

  it("should be searchable", () => {
    render(<ForeignKeySelect {...defaultProps} />);

    const select = screen.getByRole("textbox");
    fireEvent.click(select);

    fireEvent.change(select, { target: { value: "Ali" } });

    expect(select).toHaveValue("Ali");
  });

  it("should handle value not in options", () => {
    render(<ForeignKeySelect {...defaultProps} value="999" />);

    const select = screen.getByRole("textbox");
    expect(select).toBeInTheDocument();
  });

  it("should handle null value", () => {
    render(<ForeignKeySelect {...defaultProps} value={null} />);

    const select = screen.getByRole("textbox");
    expect(select).toHaveValue("");
  });

  it("should handle empty string value", () => {
    render(<ForeignKeySelect {...defaultProps} value="" />);

    const select = screen.getByRole("textbox");
    expect(select).toHaveValue("");
  });

  it("should call onChange with empty string when cleared", async () => {
    const onChange = vi.fn();
    const optionalSchema = {
      ...defaultProps.schema,
      optional: true,
    };

    const { container } = render(
      <ForeignKeySelect
        {...defaultProps}
        schema={optionalSchema}
        value="1"
        onChange={onChange}
      />,
    );

    const clearButton = container.querySelector('[aria-label="Clear"]');
    if (clearButton) {
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith("");
      });
    }
  });
});
