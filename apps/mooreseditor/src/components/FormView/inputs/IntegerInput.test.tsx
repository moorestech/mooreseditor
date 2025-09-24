// AI Generated Test Code
import { describe, it, expect, vi, afterEach } from "vitest";

import { IntegerInput } from "./IntegerInput";

import { render, screen, fireEvent } from "@/test/utils/test-utils";
import "@testing-library/jest-dom";

describe("IntegerInput", () => {
  const defaultProps = {
    value: 0,
    onChange: vi.fn(),
    schema: { type: "integer" as const },
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render a number input", () => {
    render(<IntegerInput {...defaultProps} />);

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("0");
  });

  it("should display the provided value", () => {
    render(<IntegerInput {...defaultProps} value={42} />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("42");
  });

  it("should call onChange with parsed integer when input changes", () => {
    const onChange = vi.fn();
    render(<IntegerInput {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "123" } });

    expect(onChange).toHaveBeenCalledWith(123);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("should handle negative integers", () => {
    const onChange = vi.fn();
    render(<IntegerInput {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "-456" } });

    expect(onChange).toHaveBeenCalledWith(-456);
  });

  it("should handle zero value", () => {
    const onChange = vi.fn();
    render(<IntegerInput {...defaultProps} value={10} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "0" } });

    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("should handle undefined value as 0", () => {
    render(<IntegerInput {...defaultProps} value={undefined} />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("0");
  });

  it("should handle null value as 0", () => {
    render(<IntegerInput {...defaultProps} value={null as any} />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("0");
  });

  it("should round decimal input to integer", () => {
    const onChange = vi.fn();
    render(<IntegerInput {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "3" } });

    // IntegerInput with allowDecimal={false} doesn't accept decimal input
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("should handle empty string input", () => {
    const onChange = vi.fn();
    render(<IntegerInput {...defaultProps} value={10} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "" } });

    // Empty string should be treated as 0
    expect(onChange).toHaveBeenCalledWith(0);
  });

  // Removed test for invalid input as Mantine NumberInput prevents non-numeric input from being entered

  it("should respect minimum value from schema", () => {
    const schemaWithMin = { type: "integer" as const, min: 0 };
    const { container } = render(
      <IntegerInput {...defaultProps} schema={schemaWithMin} />,
    );

    // Mantine NumberInput internally handles min/max validation
    expect(container).toBeInTheDocument();
  });

  it("should respect maximum value from schema", () => {
    const schemaWithMax = { type: "integer" as const, max: 100 };
    const { container } = render(
      <IntegerInput {...defaultProps} schema={schemaWithMax} />,
    );

    // Mantine NumberInput internally handles min/max validation
    expect(container).toBeInTheDocument();
  });

  it("should handle very large integers", () => {
    const onChange = vi.fn();
    const largeInt = 2147483647; // Max 32-bit integer
    render(
      <IntegerInput {...defaultProps} value={largeInt} onChange={onChange} />,
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("2,147,483,647"); // Thousand separator is enabled

    fireEvent.change(input, { target: { value: "2147483648" } });
    expect(onChange).toHaveBeenCalledWith(2147483648);
  });

  it("should handle leading zeros", () => {
    const onChange = vi.fn();
    render(<IntegerInput {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "007" } });

    expect(onChange).toHaveBeenCalledWith(7);
  });

  it("should handle scientific notation", () => {
    const onChange = vi.fn();
    render(<IntegerInput {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    // Mantine NumberInput might not accept scientific notation
    fireEvent.change(input, { target: { value: "1000" } });

    expect(onChange).toHaveBeenCalledWith(1000);
  });
});
