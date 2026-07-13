import { afterEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "../../../test/utils/test-utils";

import Field from "./Field";
import { defaultFieldProps, resetFieldMocks } from "./Field.testSupport";

import type { Schema } from "../../../schema";

vi.mock("../inputs", async () => {
  const { fieldInputMocks } = await import("./Field.testSupport");
  return fieldInputMocks;
});

describe("Field structured", () => {
  afterEach(resetFieldMocks);

  it("should render object fields for object schema", () => {
    const schema: Schema = {
      type: "object",
      properties: [
        { key: "name", type: "string" },
        { key: "age", type: "integer" },
      ],
    };
    const data = { name: "John", age: 30 };
    render(<Field {...defaultFieldProps} schema={schema} data={data} />);
    expect(screen.getByText("Test Field")).toBeInTheDocument();
  });

  it("should render array field for array schema", () => {
    const schema: Schema = { type: "array", items: { type: "string" } };
    const data = ["item1", "item2"];
    render(<Field {...defaultFieldProps} schema={schema} data={data} />);
    expect(screen.getByText("Test Field")).toBeInTheDocument();
  });

  it("keeps hook order stable when an object array schema changes to an object", () => {
    const objectArraySchema: Schema = {
      type: "array",
      items: {
        type: "object",
        properties: [{ key: "name", type: "string" }],
      },
    };
    const objectSchema: Schema = {
      type: "object",
      optional: true,
      properties: [],
    };
    const { rerender } = render(
      <Field
        {...defaultFieldProps}
        schema={objectArraySchema}
        data={[]}
        onObjectArrayClick={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Edit Test Field" }))
      .toBeInTheDocument();
    expect(() => {
      rerender(
        <Field {...defaultFieldProps} schema={objectSchema} data={{}} />,
      );
    }).not.toThrow();
  });

  it("adds a null fallback for an array item with an unknown runtime kind", () => {
    const onDataChange = vi.fn();
    const schema: any = {
      type: "array",
      items: { type: "futureKind" },
    };
    render(
      <Field
        {...defaultFieldProps}
        schema={schema}
        data={[]}
        onDataChange={onDataChange}
      />,
    );

    expect(() => fireEvent.click(screen.getByText("Add Item"))).not.toThrow();
    expect(onDataChange).toHaveBeenCalledWith([null]);
  });

  it("should handle complex nested schemas", () => {
    const schema: Schema = {
      type: "object",
      properties: [{ key: "name", type: "string" }],
    };
    const data = { name: "John" };
    render(<Field {...defaultFieldProps} schema={schema} data={data} />);
    expect(screen.getByText("Test Field")).toBeInTheDocument();
  });
});
