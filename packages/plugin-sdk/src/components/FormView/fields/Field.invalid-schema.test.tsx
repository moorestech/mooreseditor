import { afterEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";

import { render, screen } from "../../../test/utils/test-utils";

import Field from "./Field";
import { defaultFieldProps, resetFieldMocks } from "./Field.testSupport";

vi.mock("../inputs", async () => {
  const { fieldInputMocks } = await import("./Field.testSupport");
  return fieldInputMocks;
});

describe("Field invalid schema", () => {
  afterEach(resetFieldMocks);

  it("should handle schema without explicit type", () => {
    const schema: any = { properties: { name: { type: "string" } } };
    render(<Field {...defaultFieldProps} schema={schema} />);
    expect(screen.getByText("Invalid schema")).toBeInTheDocument();
  });

  it("treats object properties with a non-array shape as invalid", () => {
    const schema: any = { type: "object", properties: {} };
    expect(() => render(<Field {...defaultFieldProps} schema={schema} />))
      .not.toThrow();
    expect(screen.getByText("Invalid schema")).toBeInTheDocument();
  });

  it("treats an array without an item schema as invalid", () => {
    const schema: any = { type: "array" };
    expect(() =>
      render(<Field {...defaultFieldProps} schema={schema} data={[]} />),
    ).not.toThrow();
    expect(screen.getByText("Invalid schema")).toBeInTheDocument();
  });

  it("treats enum options with a non-array shape as invalid", () => {
    const schema: any = { type: "enum", options: {} };
    expect(() => render(<Field {...defaultFieldProps} schema={schema} />))
      .not.toThrow();
    expect(screen.getByText("Invalid schema")).toBeInTheDocument();
  });

  it("treats a malformed foreign key configuration as invalid", () => {
    const schema: any = {
      type: "string",
      foreignKey: {
        schemaId: "items",
        foreignKeyIdPath: null,
        displayElementPath: "/data/[*]/name",
        hierarchyDisplayPaths: ["/data/[*]/group", null],
      },
    };
    expect(() => render(<Field {...defaultFieldProps} schema={schema} />))
      .not.toThrow();
    expect(screen.getByText("Invalid schema")).toBeInTheDocument();
  });

  it("treats an incomplete switch schema as invalid", () => {
    const schema: any = { switch: "./kind" };
    render(<Field {...defaultFieldProps} schema={schema} />);
    expect(screen.getByText("Invalid schema")).toBeInTheDocument();
  });

  it("treats a non-string switch path as invalid", () => {
    const schema: any = { switch: null, cases: [] };
    expect(() => render(<Field {...defaultFieldProps} schema={schema} />))
      .not.toThrow();
    expect(screen.getByText("Invalid schema")).toBeInTheDocument();
  });

  it("treats a switch with a non-string case type as invalid", () => {
    const schema: any = {
      switch: "./kind",
      cases: [
        { when: "known", type: "string" },
        { when: "malformed", type: null },
      ],
    };
    render(
      <Field
        {...defaultFieldProps}
        schema={schema}
        path={["value"]}
        rootData={{ kind: "known" }}
      />,
    );
    expect(screen.getByText("Invalid schema")).toBeInTheDocument();
  });

  it("treats a switch with a malformed known case payload as invalid", () => {
    const schema: any = {
      switch: "./kind",
      cases: [
        { when: "known", type: "string" },
        { when: "malformed", type: "enum", options: null },
      ],
    };
    expect(() =>
      render(
        <Field
          {...defaultFieldProps}
          schema={schema}
          path={["value"]}
          rootData={{ kind: "known" }}
        />,
      ),
    ).not.toThrow();
    expect(screen.getByText("Invalid schema")).toBeInTheDocument();
  });

  it("should handle unknown schema type", () => {
    const schema: any = { type: "unknown" };
    render(<Field {...defaultFieldProps} schema={schema} />);
    expect(screen.getByText("Unsupported type: unknown")).toBeInTheDocument();
  });

  it("does not let switch-like properties hide an unknown type", () => {
    const schema: any = {
      type: "unknown",
      switch: "./kind",
      cases: [],
    };
    render(<Field {...defaultFieldProps} schema={schema} />);
    expect(screen.getByText("Unsupported type: unknown")).toBeInTheDocument();
  });
});
