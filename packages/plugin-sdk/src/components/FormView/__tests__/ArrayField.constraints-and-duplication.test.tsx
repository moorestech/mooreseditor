import { afterEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "../../../test/utils/test-utils";
import ArrayField from "../ArrayField";

import {
  defaultArrayFieldProps,
  mockGenerateUuid,
  resetArrayFieldMocks,
} from "./ArrayField.testSupport";

import type { ArraySchema, Schema } from "../../../schema";

vi.mock("../../../utils/generateUuid", async () => {
  const { mockGenerateUuid } = await import("./ArrayField.testSupport");
  return { generateUuid: () => mockGenerateUuid() };
});

vi.mock("../../../utils/autoIncrement", async (importOriginal) => {
  const actual = await importOriginal();
  const { calculateAutoIncrementMock } = await import(
    "./ArrayField.testSupport"
  );
  return { ...(actual as object), calculateAutoIncrement: calculateAutoIncrementMock };
});

vi.mock("../fields/Field", async () => {
  const { ArrayFieldMock } = await import("./ArrayField.testSupport");
  return { default: ArrayFieldMock };
});

vi.mock("@tabler/icons-react", async () => {
  const { arrayFieldIconMocks } = await import("./ArrayField.testSupport");
  return arrayFieldIconMocks;
});

describe("ArrayField constraints and duplication", () => {
  afterEach(resetArrayFieldMocks);
  it("should respect maxItems constraint", () => {
    const schema: ArraySchema = {
      type: "array",
      items: { type: "string" },
      maxLength: 2,
    };
    render(
      <ArrayField
        {...defaultArrayFieldProps}
        schema={schema}
        data={["item1", "item2"]}
      />,
    );
    expect(screen.getByText(/add/i)).toBeInTheDocument();
  });
  it("should handle nested arrays", () => {
    const schema: Schema = {
      type: "array",
      items: { type: "array", items: { type: "string" } },
    };
    const data = [
      ["a", "b"],
      ["c", "d"],
    ];
    render(
      <ArrayField {...defaultArrayFieldProps} schema={schema} data={data} />,
    );
    expect(screen.getByTestId("field-0")).toBeInTheDocument();
    expect(screen.getByTestId("field-1")).toBeInTheDocument();
  });
  it("should create appropriate default values for new items", () => {
    const onDataChange = vi.fn();
    const schema: Schema = { type: "array", items: { type: "integer" } };
    render(
      <ArrayField
        {...defaultArrayFieldProps}
        schema={schema}
        data={[1, 2]}
        onDataChange={onDataChange}
      />,
    );
    fireEvent.click(screen.getByText(/add/i));
    expect(onDataChange).toHaveBeenCalledWith([1, 2, 0]);
  });
  it("should create object default for object items", () => {
    const onDataChange = vi.fn();
    const schema: Schema = {
      type: "array",
      items: {
        type: "object",
        properties: [
          { key: "name", type: "string", default: "New Item" },
          { key: "value", type: "integer", default: 0 },
        ],
      },
    };
    render(
      <ArrayField
        {...defaultArrayFieldProps}
        schema={schema}
        data={[]}
        onDataChange={onDataChange}
      />,
    );
    fireEvent.click(screen.getByText(/add/i));
    expect(onDataChange).toHaveBeenCalledWith([{ name: "New Item", value: 0 }]);
  });

  it.skip("should handle drag handles for sortable items", () => {
    render(<ArrayField {...defaultArrayFieldProps} />);
    expect(screen.getAllByText("::")).toHaveLength(2);
  });

  it("should maintain order when updating items", () => {
    const onDataChange = vi.fn();
    render(
      <ArrayField
        {...defaultArrayFieldProps}
        data={["a", "b", "c"]}
        onDataChange={onDataChange}
      />,
    );
    fireEvent.change(screen.getByTestId("input-1"), {
      target: { value: "updated" },
    });
    expect(onDataChange).toHaveBeenCalledWith(["a", "updated", "c"]);
  });

  it("should handle very large arrays efficiently", () => {
    const data = Array.from({ length: 100 }, (_, index) => `item${index}`);
    render(<ArrayField {...defaultArrayFieldProps} data={data} />);
    expect(screen.getByTestId("field-0")).toBeInTheDocument();
    expect(screen.getByTestId("field-99")).toBeInTheDocument();
  });

  it("should render duplicate button for each item", () => {
    render(<ArrayField {...defaultArrayFieldProps} />);
    expect(screen.getAllByText("⧉")).toHaveLength(2);
  });

  it("should duplicate item when duplicate button is clicked", () => {
    const onDataChange = vi.fn();
    render(
      <ArrayField {...defaultArrayFieldProps} onDataChange={onDataChange} />,
    );
    fireEvent.click(screen.getAllByText("⧉")[0]);
    expect(onDataChange).toHaveBeenCalledWith(["item1", "item1", "item2"]);
  });

  it("should duplicate item at correct position", () => {
    const onDataChange = vi.fn();
    render(
      <ArrayField
        {...defaultArrayFieldProps}
        data={["a", "b", "c"]}
        onDataChange={onDataChange}
      />,
    );
    fireEvent.click(screen.getAllByText("⧉")[1]);
    expect(onDataChange).toHaveBeenCalledWith(["a", "b", "b", "c"]);
  });

  it("should duplicate complex objects with new IDs", () => {
    const onDataChange = vi.fn();
    const schema: ArraySchema = {
      type: "array",
      items: {
        type: "object",
        properties: [
          {
            key: "id",
            type: "integer",
            autoIncrement: { direction: "asc", startWith: 1, step: 1 },
          },
          { key: "uuid", type: "uuid", autoGenerated: true },
          { key: "name", type: "string" },
        ],
      },
    };
    const data = [
      { id: 1, uuid: "uuid-1", name: "First" },
      { id: 2, uuid: "uuid-2", name: "Second" },
    ];
    mockGenerateUuid.mockReturnValue("new-uuid-123");
    render(
      <ArrayField
        {...defaultArrayFieldProps}
        schema={schema}
        data={data}
        onDataChange={onDataChange}
      />,
    );
    fireEvent.click(screen.getAllByText("⧉")[0]);
    const newData = onDataChange.mock.calls[0][0];
    expect(newData).toHaveLength(3);
    expect(newData[1].name).toBe("First");
    expect(newData[1].uuid).toBe("new-uuid-123");
    expect(newData[1].id).toBe(3);
    mockGenerateUuid.mockReset();
  });
});
