import React, { useRef } from "react";

import { describe, expect, it } from "vitest";

import { SearchOverlay } from "./SearchOverlay";

import { fireEvent, render, screen, waitFor } from "@/test/utils/test-utils";

function SearchOverlayHarness() {
  const targetRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div ref={targetRef}>
        <span data-testid="visible-text">Visible Alpha</span>
        <div style={{ display: "none" }}>Hidden Alpha</div>
      </div>
      <SearchOverlay targetRef={targetRef} />
    </>
  );
}

describe("SearchOverlay", () => {
  it("opens with Cmd+F and searches visible text only", async () => {
    render(<SearchOverlayHarness />);

    fireEvent.keyDown(window, { key: "f", metaKey: true });
    const searchInput = screen.getByRole("textbox", { name: "検索" });

    fireEvent.change(searchInput, { target: { value: "Alpha" } });

    await waitFor(() => {
      expect(screen.getByText("1 / 1")).toBeInTheDocument();
    });

    expect(screen.getByText("Alpha")).toHaveClass(
      "mooreseditor-search-match-active",
    );
  });
});
