import { describe, expect, it } from "vitest";

import { getReactFlowNodeIdFromSearchMatch } from "./searchFocus";

describe("getReactFlowNodeIdFromSearchMatch", () => {
  it("returns the closest React Flow node id for a search match", () => {
    document.body.innerHTML = `
      <div class="react-flow__node" data-id="node-1">
        <div><mark id="match">Target</mark></div>
      </div>
    `;

    const match = document.getElementById("match");

    expect(getReactFlowNodeIdFromSearchMatch(match)).toBe("node-1");
  });

  it("returns null when the match is outside React Flow nodes", () => {
    document.body.innerHTML = `<mark id="match">Target</mark>`;

    const match = document.getElementById("match");

    expect(getReactFlowNodeIdFromSearchMatch(match)).toBeNull();
  });
});
