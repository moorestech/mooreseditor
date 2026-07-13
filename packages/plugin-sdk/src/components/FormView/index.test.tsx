import { describe, it, expect, vi, afterEach } from "vitest";

import { render, screen, fireEvent } from "../../test/utils/test-utils";

import FormView from "./index";

import "@testing-library/jest-dom";
vi.mock("./fields/Field", () => ({
  default: ({ path, data, onDataChange }: any) => (
    <div data-testid={`field-${path.join("-")}`}>
      <input
        data-testid={`input-${path.join("-")}`}
        value={JSON.stringify(data)}
        onChange={(e) => onDataChange(JSON.parse(e.target.value))}
      />
    </div>
  ),
}));

vi.mock("./CollapsibleObject", () => ({
  default: ({ title, children }: any) => (
    <div data-testid="collapsible-object">
      <h3>{title}</h3>
      {children}
    </div>
  ),
}));

describe("FormView", () => {
  const defaultProps = {
    data: { name: "test", value: 42 },
    schema: {
      type: "object" as const,
      properties: [
        { key: "name", type: "string" as const },
        { key: "value", type: "integer" as const },
      ],
    },
    onDataChange: vi.fn(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render form fields", () => {
    render(<FormView {...defaultProps} />);

    expect(screen.getByTestId("field-name")).toBeInTheDocument();
    expect(screen.getByTestId("field-value")).toBeInTheDocument();
  });

  it("should render with title when schema has title", () => {
    const schemaWithTitle = {
      ...defaultProps.schema,
      title: "Test Form",
    };

    render(<FormView {...defaultProps} schema={schemaWithTitle} />);

    expect(screen.getByTestId("field-name")).toBeInTheDocument();
  });

  it("should handle null data", () => {
    render(<FormView {...defaultProps} data={null} />);

    expect(screen.getByTestId("field-name")).toBeInTheDocument();
  });

  it("should handle undefined data", () => {
    render(<FormView {...defaultProps} data={undefined} />);

    expect(screen.getByTestId("field-name")).toBeInTheDocument();
  });

  it("should handle empty object data", () => {
    render(<FormView {...defaultProps} data={{}} />);

    expect(screen.getByTestId("field-name")).toBeInTheDocument();
    expect(screen.getByTestId("field-value")).toBeInTheDocument();
  });

  it("should handle schema without properties", () => {
    const schemaWithoutProps = {
      type: "object" as const,
    };

    const { container } = render(
      <FormView {...defaultProps} schema={schemaWithoutProps} />,
    );

    expect(container).toBeInTheDocument();
  });

  it("should handle array schema", () => {
    const arraySchema = {
      type: "array" as const,
      items: { type: "string" as const },
    };

    render(
      <FormView
        {...defaultProps}
        schema={arraySchema}
        data={["item1", "item2"]}
      />,
    );

    expect(screen.getByTestId("field-")).toBeInTheDocument();
  });

  it("should handle nested object schema", () => {
    const nestedSchema = {
      type: "object" as const,
      properties: [
        {
          key: "user",
          type: "object" as const,
          properties: [
            { key: "name", type: "string" as const },
            { key: "age", type: "integer" as const },
          ],
        },
      ],
    };

    const nestedData = {
      user: { name: "John", age: 30 },
    };

    render(
      <FormView {...defaultProps} schema={nestedSchema} data={nestedData} />,
    );

    expect(screen.getByTestId("field-user")).toBeInTheDocument();
  });

  it("should call onDataChange when field changes", () => {
    const onDataChange = vi.fn();
    render(<FormView {...defaultProps} onDataChange={onDataChange} />);

    const input = screen.getByTestId("input-name");
    fireEvent.change(input, { target: { value: '"updated"' } });

    expect(onDataChange).toHaveBeenCalled();
  });

  it("should handle string schema (non-object)", () => {
    const stringSchema = {
      type: "string" as const,
    };

    render(
      <FormView {...defaultProps} schema={stringSchema} data="test string" />,
    );

    expect(screen.getByTestId("field-")).toBeInTheDocument();
  });

  it("should render with custom styles", () => {
    const { container } = render(<FormView {...defaultProps} />);

    const stackElement = container.querySelector(".mantine-Stack-root");
    expect(stackElement).toBeInTheDocument();
    expect(stackElement).toHaveStyle("--stack-gap: var(--mantine-spacing-sm)");
  });

  it("should handle schema with ui hints", () => {
    const schemaWithUi = {
      type: "object" as const,
      properties: [
        {
          key: "name",
          type: "string" as const,
          uiOptions: { hidden: true },
        },
      ],
    };

    render(<FormView {...defaultProps} schema={schemaWithUi} />);

    expect(screen.getByTestId("field-name")).toBeInTheDocument();
  });

  it("should maintain data consistency on updates", () => {
    const onDataChange = vi.fn();
    const { rerender } = render(
      <FormView {...defaultProps} onDataChange={onDataChange} />,
    );

    const newData = { name: "updated", value: 100 };
    rerender(
      <FormView {...defaultProps} data={newData} onDataChange={onDataChange} />,
    );

    const nameInput = screen.getByTestId("input-name");
    expect(nameInput).toHaveValue(JSON.stringify(newData.name));
  });
});
