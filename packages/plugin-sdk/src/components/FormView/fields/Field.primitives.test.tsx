import { afterEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";

import { render, screen } from "../../../test/utils/test-utils";

import Field from "./Field";
import {
  defaultFieldProps,
  primitiveInputFamilies,
  resetFieldMocks,
} from "./Field.testSupport";
import * as primitiveRendering from "./renderers/renderPrimitiveInput";

import type { PrimitiveSchema, Schema } from "../../../schema";

vi.mock("../inputs", async () => {
  const { fieldInputMocks } = await import("./Field.testSupport");
  return fieldInputMocks;
});

describe("Field primitives", () => {
  afterEach(resetFieldMocks);

  it("should render a string input for string schema", () => {
    render(<Field {...defaultFieldProps} />);
    expect(screen.getByTestId("string-input")).toBeInTheDocument();
  });

  it.each(Object.entries(primitiveInputFamilies))(
    "dispatches %s schemas to the %s family",
    (type, testId) => {
      const schema =
        type === "enum"
          ? { type, options: ["first", "second"] }
          : { type };

      render(
        <Field
          {...defaultFieldProps}
          schema={schema as PrimitiveSchema}
          data={type.startsWith("vector") ? [] : undefined}
        />,
      );
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    },
  );

  it("registers a renderer for every primitive schema kind", () => {
    const rendererRegistry = (
      primitiveRendering as typeof primitiveRendering & {
        primitiveInputRenderers?: Record<string, unknown>;
      }
    ).primitiveInputRenderers;

    expect(rendererRegistry).toBeDefined();
    expect(Object.keys(rendererRegistry ?? {}).sort()).toEqual(
      Object.keys(primitiveInputFamilies).sort(),
    );
  });

  it("should render an integer input for integer schema", () => {
    const schema: Schema = { type: "integer" };
    render(<Field {...defaultFieldProps} schema={schema} data={0} />);
    expect(screen.getByTestId("integer-input")).toBeInTheDocument();
  });

  it("should render a number input for number schema", () => {
    const schema: Schema = { type: "number" };
    render(<Field {...defaultFieldProps} schema={schema} data={0} />);
    expect(screen.getByTestId("number-input")).toBeInTheDocument();
  });

  it("should render a boolean input for boolean schema", () => {
    const schema: Schema = { type: "boolean" };
    render(<Field {...defaultFieldProps} schema={schema} data={false} />);
    expect(screen.getByTestId("boolean-input")).toBeInTheDocument();
  });

  it("should render an enum input for schema with enum", () => {
    const schema: Schema = { type: "enum", options: ["option1", "option2"] };
    render(<Field {...defaultFieldProps} schema={schema} />);
    expect(screen.getByTestId("enum-input")).toBeInTheDocument();
  });

  it("should render a UUID input for string with uuid format", () => {
    const schema: Schema = { type: "uuid" };
    render(<Field {...defaultFieldProps} schema={schema} />);
    expect(screen.getByTestId("uuid-input")).toBeInTheDocument();
  });

  it("should render a foreign key select for schema with foreignKey", () => {
    const schema: Schema = {
      type: "uuid",
      foreignKey: {
        schemaId: "users",
        foreignKeyIdPath: "id",
        displayElementPath: "name",
      },
    };
    render(<Field {...defaultFieldProps} schema={schema} />);
    expect(screen.getByTestId("uuid-input")).toBeInTheDocument();
  });

  it("should render vector2 input for array with vector2 format", () => {
    const schema: Schema = { type: "vector2" };
    render(<Field {...defaultFieldProps} schema={schema} data={[0, 0]} />);
    expect(screen.getByTestId("vector2-input")).toBeInTheDocument();
  });

  it("should render vector3 input for array with vector3 format", () => {
    const schema: Schema = { type: "vector3" };
    render(<Field {...defaultFieldProps} schema={schema} data={[0, 0, 0]} />);
    expect(screen.getByTestId("vector3-input")).toBeInTheDocument();
  });

  it("should render vector4 input for array with vector4 format", () => {
    const schema: Schema = { type: "vector4" };
    render(<Field {...defaultFieldProps} schema={schema} data={[0, 0, 0, 0]} />);
    expect(screen.getByTestId("vector4-input")).toBeInTheDocument();
  });

  it("should call onChange with updated value", () => {
    const onDataChange = vi.fn();
    const { rerender } = render(
      <Field {...defaultFieldProps} onDataChange={onDataChange} />,
    );
    const input = screen.getByTestId("string-input");
    input.dispatchEvent(new Event("change", { bubbles: true }));
    rerender(
      <Field
        {...defaultFieldProps}
        data="updated"
        onDataChange={onDataChange}
      />,
    );
    expect(input).toHaveValue("updated");
  });

  it("should handle null value", () => {
    render(<Field {...defaultFieldProps} data={null} />);
    expect(screen.getByTestId("string-input")).toHaveValue("");
  });

  it("should handle undefined value", () => {
    render(<Field {...defaultFieldProps} data={undefined} />);
    expect(screen.getByTestId("string-input")).toHaveValue("");
  });

  it("should pass through foreignKeyData prop", () => {
    const schema: Schema = {
      type: "uuid",
      foreignKey: {
        schemaId: "users",
        foreignKeyIdPath: "id",
        displayElementPath: "name",
      },
    };
    render(<Field {...defaultFieldProps} schema={schema} />);
    expect(screen.getByTestId("uuid-input")).toBeInTheDocument();
  });
});
