// AI Generated Test Code
import { describe, it, expect, vi, afterEach } from "vitest";

import Sidebar from "./Sidebar";

import { render, screen, fireEvent } from "@/test/utils/test-utils";
import "@testing-library/jest-dom";

// Mock MoorestechIcon component
vi.mock("./MoorestechIcon", () => ({
  MoorestechIcon: () => <span data-testid="moorestech-icon">Icon</span>,
}));

describe("Sidebar", () => {
  const defaultProps = {
    menuToFileMap: {
      mapObjects: "map_objects.json",
      craftRecipes: "craft_recipes.json",
      items: "items.json",
    },
    selectedFile: "mapObjects",
    loadFileData: vi.fn(),
    openProjectDir: vi.fn(),
    isEditing: false,
    hasUnsavedChanges: false,
    schemas: {},
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render File Open button", () => {
    render(<Sidebar {...defaultProps} />);

    expect(
      screen.getByRole("button", { name: /file open/i }),
    ).toBeInTheDocument();
  });

  it("should display moorestech title", () => {
    render(<Sidebar {...defaultProps} />);

    expect(screen.getByText(/moorestech/i)).toBeInTheDocument();
  });

  it("should display edit indicator when isEditing is true", () => {
    render(<Sidebar {...defaultProps} isEditing={true} />);

    expect(screen.getByText(/moorestech \*/i)).toBeInTheDocument();
  });

  it("should display menu items", () => {
    render(<Sidebar {...defaultProps} />);

    expect(screen.getByText("mapObjects")).toBeInTheDocument();
    expect(screen.getByText("craftRecipes")).toBeInTheDocument();
    expect(screen.getByText("items")).toBeInTheDocument();
  });

  it("should highlight selected menu item", () => {
    render(<Sidebar {...defaultProps} />);

    const selectedItem = screen.getByText("mapObjects");
    const unselectedItem = screen.getByText("craftRecipes");

    // Check styles - selected has gradient background
    const selectedStyles = window.getComputedStyle(selectedItem);
    expect(selectedStyles.background).toContain("linear-gradient");

    const unselectedStyles = window.getComputedStyle(unselectedItem);
    expect(unselectedStyles.background).toBe("rgba(0, 0, 0, 0)");
  });

  it("should call loadFileData when menu item is clicked", () => {
    const loadFileData = vi.fn();
    render(<Sidebar {...defaultProps} loadFileData={loadFileData} />);

    fireEvent.click(screen.getByText("craftRecipes"));

    expect(loadFileData).toHaveBeenCalledWith("craftRecipes");
  });

  it("should call openProjectDir when File Open button is clicked", () => {
    const openProjectDir = vi.fn();
    render(<Sidebar {...defaultProps} openProjectDir={openProjectDir} />);

    fireEvent.click(screen.getByRole("button", { name: /file open/i }));

    expect(openProjectDir).toHaveBeenCalled();
  });

  it("should handle empty menuToFileMap", () => {
    render(<Sidebar {...defaultProps} menuToFileMap={{}} />);

    // Should still render button and title
    expect(
      screen.getByRole("button", { name: /file open/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/moorestech/i)).toBeInTheDocument();
  });

  it("should handle null selectedFile", () => {
    render(<Sidebar {...defaultProps} selectedFile={null} />);

    // All menu items should have default styling
    const menuItems = ["mapObjects", "craftRecipes", "items"];
    menuItems.forEach((item) => {
      const element = screen.getByText(item);
      expect(element).toHaveStyle({
        background: "none",
      });
    });
  });

  it("should render MoorestechIcon", () => {
    render(<Sidebar {...defaultProps} />);

    expect(screen.getByTestId("moorestech-icon")).toBeInTheDocument();
  });

  it("should maintain proper styling structure", () => {
    const { container } = render(<Sidebar {...defaultProps} />);

    // Verify the sidebar renders with proper structure
    expect(container.firstChild).toBeInTheDocument();
  });

  it("should handle long menu item names", () => {
    const longMenuMap = {
      veryLongMenuItemNameThatMightNeedTruncation: "long_file.json",
    };
    render(<Sidebar {...defaultProps} menuToFileMap={longMenuMap} />);

    expect(
      screen.getByText("veryLongMenuItemNameThatMightNeedTruncation"),
    ).toBeInTheDocument();
  });

  it("should handle menu items with special characters", () => {
    const specialMenuMap = {
      "item-with-dash": "file1.json",
      item_with_underscore: "file2.json",
      "item.with.dot": "file3.json",
    };
    render(<Sidebar {...defaultProps} menuToFileMap={specialMenuMap} />);

    expect(screen.getByText("item-with-dash")).toBeInTheDocument();
    expect(screen.getByText("item_with_underscore")).toBeInTheDocument();
    expect(screen.getByText("item.with.dot")).toBeInTheDocument();
  });

  it("should update selection when selectedFile prop changes", () => {
    const { rerender } = render(<Sidebar {...defaultProps} />);

    const mapObjectsStyles = window.getComputedStyle(
      screen.getByText("mapObjects"),
    );
    expect(mapObjectsStyles.background).toContain("linear-gradient");

    rerender(<Sidebar {...defaultProps} selectedFile="craftRecipes" />);

    const craftRecipesStyles = window.getComputedStyle(
      screen.getByText("craftRecipes"),
    );
    expect(craftRecipesStyles.background).toContain("linear-gradient");

    const mapObjectsStylesAfter = window.getComputedStyle(
      screen.getByText("mapObjects"),
    );
    expect(mapObjectsStylesAfter.background).toBe("rgba(0, 0, 0, 0)");
  });

  it("should handle rapid clicks on menu items", () => {
    const loadFileData = vi.fn();
    render(<Sidebar {...defaultProps} loadFileData={loadFileData} />);

    const menuItem = screen.getByText("items");
    fireEvent.click(menuItem);
    fireEvent.click(menuItem);
    fireEvent.click(menuItem);

    expect(loadFileData).toHaveBeenCalledTimes(3);
    expect(loadFileData).toHaveBeenCalledWith("items");
  });

  it("should render with correct text styles", () => {
    render(<Sidebar {...defaultProps} />);

    const title = screen.getByText(/moorestech/i);
    expect(title).toHaveStyle({
      fontWeight: "700",
      fontSize: "20px",
    });

    const menuItem = screen.getByText("mapObjects");
    expect(menuItem).toHaveStyle({
      fontWeight: "700",
      fontSize: "16px",
      cursor: "pointer",
    });
  });
});
