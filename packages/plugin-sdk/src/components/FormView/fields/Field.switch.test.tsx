import { afterEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";

import { render, screen, waitFor } from "../../../test/utils/test-utils";

import Field from "./Field";
import { defaultFieldProps, resetFieldMocks } from "./Field.testSupport";

import type { Schema } from "../../../schema";

vi.mock("../inputs", async () => {
  const { fieldInputMocks } = await import("./Field.testSupport");
  return fieldInputMocks;
});

describe("Field switch", () => {
  afterEach(resetFieldMocks);

  it("switches an object-array case to an object case without reusing branch hooks", () => {
    const schema: Schema = {
      switch: "./kind",
      cases: [
        {
          when: "loop",
          type: "array",
          items: {
            type: "object",
            properties: [{ key: "label", type: "string" }],
          },
        },
        {
          when: "oneshot",
          type: "object",
          optional: true,
          properties: [],
        },
      ],
    };
    const { rerender } = render(
      <Field
        {...defaultFieldProps}
        schema={schema}
        data={[]}
        path={["buttons"]}
        parentData={{ kind: "loop" }}
        rootData={{ kind: "loop" }}
        onObjectArrayClick={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Edit Test Field" }))
      .toBeInTheDocument();
    expect(() => {
      rerender(
        <Field
          {...defaultFieldProps}
          schema={schema}
          data={{}}
          path={["buttons"]}
          parentData={{ kind: "oneshot" }}
          rootData={{ kind: "oneshot" }}
        />,
      );
    }).not.toThrow();
    expect(
      screen.queryByRole("button", { name: "Edit Test Field" }),
    ).not.toBeInTheDocument();
    expect(() => {
      rerender(
        <Field
          {...defaultFieldProps}
          schema={schema}
          data={[]}
          path={["buttons"]}
          parentData={{ kind: "loop" }}
          rootData={{ kind: "loop" }}
          onObjectArrayClick={vi.fn()}
        />,
      );
    }).not.toThrow();
    expect(screen.getByRole("button", { name: "Edit Test Field" }))
      .toBeInTheDocument();
  });

  it("dispatches an unknown selected switch case without auto-generation", () => {
    const schema: any = {
      switch: "./kind",
      cases: [
        { when: "known", type: "string" },
        { when: "future", type: "futureKind" },
      ],
    };
    const onDataChange = vi.fn();
    const { rerender } = render(
      <Field
        {...defaultFieldProps}
        schema={schema}
        data=""
        path={["value"]}
        rootData={{ kind: "known" }}
        onDataChange={onDataChange}
      />,
    );
    expect(screen.getByTestId("string-input")).toBeInTheDocument();
    rerender(
      <Field
        {...defaultFieldProps}
        schema={schema}
        data=""
        path={["value"]}
        rootData={{ kind: "future" }}
        onDataChange={onDataChange}
      />,
    );
    expect(screen.getByText("Unsupported type: futureKind"))
      .toBeInTheDocument();
    expect(onDataChange).not.toHaveBeenCalled();
  });

  it("replaces data when a switch changes between object and array families", async () => {
    const schema: any = {
      switch: "./kind",
      cases: [
        { when: "loop", type: "array", items: { type: "string" } },
        { when: "oneshot", type: "object", properties: [] },
      ],
    };
    const onDataChange = vi.fn();
    const { rerender } = render(
      <Field
        {...defaultFieldProps}
        schema={schema}
        data={[]}
        path={["value"]}
        rootData={{ kind: "loop" }}
        onDataChange={onDataChange}
      />,
    );

    rerender(
      <Field
        {...defaultFieldProps}
        schema={schema}
        data={[]}
        path={["value"]}
        rootData={{ kind: "oneshot" }}
        onDataChange={onDataChange}
      />,
    );
    await waitFor(() => expect(onDataChange).toHaveBeenCalledWith({}));
    onDataChange.mockClear();
    rerender(
      <Field
        {...defaultFieldProps}
        schema={schema}
        data={{}}
        path={["value"]}
        rootData={{ kind: "loop" }}
        onDataChange={onDataChange}
      />,
    );
    await waitFor(() => expect(onDataChange).toHaveBeenCalledWith([]));
  });
});
