import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { render, screen, within } from "../../../test/utils/test-utils";

import { EnumEditCell } from "./EnumEditCell";

import "@testing-library/jest-dom";

describe("EnumEditCell", () => {
  it("allows searching enum options while editing a table cell", async () => {
    const user = userEvent.setup();

    render(
      <EnumEditCell
        column={{
          type: "enum",
          options: ["Assembler", "Conveyor", "Mining drill"],
        }}
        value=""
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    const input = screen.getByRole("textbox");
    await user.type(input, "con");

    expect(input).toHaveValue("con");

    const listbox = screen.getByRole("listbox");
    expect(within(listbox).getByText("Conveyor")).toBeInTheDocument();
    expect(within(listbox).queryByText("Assembler")).not.toBeInTheDocument();
    expect(within(listbox).queryByText("Mining drill")).not.toBeInTheDocument();
  });
});
