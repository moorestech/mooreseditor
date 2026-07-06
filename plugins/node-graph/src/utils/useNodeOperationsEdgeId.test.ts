import { describe, expect, it, vi } from "vitest";

import { generateEdgeId } from "../hooks/useNodeOperations";

describe("generateEdgeId", () => {
  it("keeps edge ids unique within the same millisecond", () => {
    vi.spyOn(Date, "now").mockReturnValue(1234567890);

    const first = generateEdgeId();
    const second = generateEdgeId();

    expect(first).toMatch(/^edge-1234567890-\d+$/);
    expect(second).toMatch(/^edge-1234567890-\d+$/);
    expect(first).not.toBe(second);
  });
});
