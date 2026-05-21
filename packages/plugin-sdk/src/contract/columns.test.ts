import { describe, expect, it, vi } from "vitest";

import { createColumnDispatch } from "./columns";

import type { Column } from "../schema";

describe("createColumnDispatch", () => {
  it("passes value actions through HostAPI.setColumns", () => {
    const setColumns = vi.fn();
    const dispatch = createColumnDispatch({ setColumns });
    const next: Column[] = [{ title: "items", data: [] }];

    dispatch(next);

    expect(setColumns).toHaveBeenCalledWith(next);
  });

  it("passes updater actions through HostAPI.setColumns", () => {
    const setColumns = vi.fn();
    const dispatch = createColumnDispatch({ setColumns });
    const updater = (columns: Column[]) => columns;

    dispatch(updater);

    expect(setColumns).toHaveBeenCalledWith(updater);
  });
});
