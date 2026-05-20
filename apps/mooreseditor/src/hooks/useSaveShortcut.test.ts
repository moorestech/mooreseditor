import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useSaveShortcut } from "./useSaveShortcut";

function pressCtrlS() {
  window.dispatchEvent(
    new KeyboardEvent("keydown", { key: "s", ctrlKey: true }),
  );
}

describe("useSaveShortcut", () => {
  it("canSave が true のとき Ctrl+S で onSave を呼ぶ", () => {
    const onSave = vi.fn();
    renderHook(() => useSaveShortcut({ canSave: true, onSave }));

    pressCtrlS();

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("canSave が false のとき onSave を呼ばない", () => {
    const onSave = vi.fn();
    renderHook(() => useSaveShortcut({ canSave: false, onSave }));

    pressCtrlS();

    expect(onSave).not.toHaveBeenCalled();
  });
});
