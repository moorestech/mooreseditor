import "@testing-library/jest-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen } from "../../test/utils/test-utils";

import ArrayField from "./ArrayField";
import {
  defaultArrayFieldProps,
  resetArrayFieldMocks,
} from "./__tests__/ArrayField.testSupport";

import type { ArraySchema, Schema } from "../../schema";

vi.mock("../../utils/generateUuid", async () => {
  const { mockGenerateUuid } = await import(
    "./__tests__/ArrayField.testSupport"
  );
  return { generateUuid: () => mockGenerateUuid() };
});

vi.mock("../../utils/autoIncrement", async (importOriginal) => {
  const actual = await importOriginal();
  const { calculateAutoIncrementMock } = await import(
    "./__tests__/ArrayField.testSupport"
  );
  return { ...(actual as object), calculateAutoIncrement: calculateAutoIncrementMock };
});

vi.mock("./fields/Field", async () => {
  const { ArrayFieldMock } = await import("./__tests__/ArrayField.testSupport");
  return { default: ArrayFieldMock };
});

vi.mock("@tabler/icons-react", async () => {
  const { arrayFieldIconMocks } = await import(
    "./__tests__/ArrayField.testSupport"
  );
  return arrayFieldIconMocks;
});

describe("ArrayField", () => {
  afterEach(resetArrayFieldMocks);

  it("should render array items", () => {
    render(<ArrayField {...defaultArrayFieldProps} />);
    expect(screen.getByTestId("field-0")).toBeInTheDocument();
    expect(screen.getByTestId("field-1")).toBeInTheDocument();
    expect(screen.getByTestId("input-0")).toHaveValue("item1");
    expect(screen.getByTestId("input-1")).toHaveValue("item2");
  });

  it("should render add button", () => {
    render(<ArrayField {...defaultArrayFieldProps} />);
    expect(screen.getByText(/add/i)).toBeInTheDocument();
  });

  it("should add new item when add button is clicked", () => {
    const onDataChange = vi.fn();
    render(
      <ArrayField {...defaultArrayFieldProps} onDataChange={onDataChange} />,
    );
    fireEvent.click(screen.getByText(/add/i));
    expect(onDataChange).toHaveBeenCalledWith(["item1", "item2", ""]);
  });

  it("should remove item when delete button is clicked", () => {
    const onDataChange = vi.fn();
    render(
      <ArrayField {...defaultArrayFieldProps} onDataChange={onDataChange} />,
    );
    fireEvent.click(screen.getAllByText("×")[0]);
    expect(onDataChange).toHaveBeenCalledWith(["item2"]);
  });

  it("should update item value when field changes", () => {
    const onDataChange = vi.fn();
    render(
      <ArrayField {...defaultArrayFieldProps} onDataChange={onDataChange} />,
    );
    fireEvent.change(screen.getByTestId("input-0"), {
      target: { value: "updated" },
    });
    expect(onDataChange).toHaveBeenCalledWith(["updated", "item2"]);
  });

  it("should handle empty array", () => {
    render(<ArrayField {...defaultArrayFieldProps} data={[]} />);
    expect(screen.queryByTestId("field-0")).not.toBeInTheDocument();
    expect(screen.getByText(/add/i)).toBeInTheDocument();
  });

  it("should handle null value as empty array", () => {
    render(<ArrayField {...defaultArrayFieldProps} data={null as any} />);
    expect(screen.queryByTestId("field-0")).not.toBeInTheDocument();
  });

  it("should handle undefined value as empty array", () => {
    render(<ArrayField {...defaultArrayFieldProps} data={undefined} />);
    expect(screen.queryByTestId("field-0")).not.toBeInTheDocument();
  });

  it("should handle array of objects", () => {
    const schema: Schema = {
      type: "array",
      items: {
        type: "object",
        properties: [{ key: "name", type: "string" }],
      },
    };
    const data = [{ name: "John" }, { name: "Jane" }];
    render(
      <ArrayField {...defaultArrayFieldProps} schema={schema} data={data} />,
    );
    expect(screen.getByTestId("field-0")).toBeInTheDocument();
    expect(screen.getByTestId("field-1")).toBeInTheDocument();
  });

  it("should handle array of numbers", () => {
    const schema: Schema = { type: "array", items: { type: "integer" } };
    render(
      <ArrayField
        {...defaultArrayFieldProps}
        schema={schema}
        data={[1, 2, 3]}
      />,
    );
    expect(screen.getByTestId("input-0")).toHaveValue("1");
    expect(screen.getByTestId("input-1")).toHaveValue("2");
    expect(screen.getByTestId("input-2")).toHaveValue("3");
  });

  it("should respect minItems constraint", () => {
    const schema: ArraySchema = {
      type: "array",
      items: { type: "string" },
      minLength: 2,
    };
    render(
      <ArrayField
        {...defaultArrayFieldProps}
        schema={schema}
        data={["item1", "item2"]}
      />,
    );
    expect(screen.getAllByText("×")).toHaveLength(2);
  });
});
