import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useSaveShortcut } from "./useSaveShortcut";

function pressCtrlS() {
  window.dispatchEvent(
    new KeyboardEvent("keydown", { key: "s", ctrlKey: true }),
  );
}

/**
 * onSave は Promise チェーン経由で呼ばれるため、保留中の microtask を全て消化する。
 * マクロタスク境界（setTimeout 0）を 1 回挟むことで microtask キューを完全に排出する。
 */
function flushMicrotasks() {
  return new Promise<void>((resolve) => setTimeout(resolve, 0));
}

/** 解決を外部から制御できる Promise を作る。 */
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

/**
 * 呼び出し回数を数える実コールバック（モックではなく実関数）。
 * `impl` を渡すと各呼び出しでその戻り値（Promise 等）を返す。
 */
function countingCallback(impl?: () => void | Promise<void>) {
  const state = { calls: 0 };
  const fn = () => {
    state.calls += 1;
    return impl?.();
  };
  return { fn, state };
}

describe("useSaveShortcut", () => {
  it("canSave が true のとき Ctrl+S で onSave を呼ぶ", async () => {
    const onSave = countingCallback();
    renderHook(() => useSaveShortcut({ canSave: true, onSave: onSave.fn }));

    pressCtrlS();
    await flushMicrotasks();

    expect(onSave.state.calls).toBe(1);
  });

  it("canSave が false のとき onSave を呼ばない", async () => {
    const onSave = countingCallback();
    renderHook(() => useSaveShortcut({ canSave: false, onSave: onSave.fn }));

    pressCtrlS();
    await flushMicrotasks();

    expect(onSave.state.calls).toBe(0);
  });

  it("非同期保存の進行中は次の Ctrl+S を無視して多重実行を防ぐ", async () => {
    const gate = deferred();
    const onSave = countingCallback(() => gate.promise);
    renderHook(() => useSaveShortcut({ canSave: true, onSave: onSave.fn }));

    // 1 回目の保存を開始（gate 未解決なので進行中のまま）
    pressCtrlS();
    await flushMicrotasks();
    expect(onSave.state.calls).toBe(1);

    // 進行中に押しても呼ばれない
    pressCtrlS();
    await flushMicrotasks();
    expect(onSave.state.calls).toBe(1);

    // 保存完了後は再び呼べる
    gate.resolve();
    await flushMicrotasks();
    pressCtrlS();
    await flushMicrotasks();
    expect(onSave.state.calls).toBe(2);
  });

  it("onSave が reject しても例外を伝播せず、その後の保存を継続できる", async () => {
    const originalError = console.error;
    const loggedErrors: unknown[] = [];
    console.error = (...args: unknown[]) => {
      loggedErrors.push(args);
    };

    const onSave = countingCallback(function impl(this: void) {
      // 1 回目は失敗、2 回目以降は成功
      return onSave.state.calls === 1
        ? Promise.reject(new Error("save failed"))
        : Promise.resolve();
    });
    renderHook(() => useSaveShortcut({ canSave: true, onSave: onSave.fn }));

    pressCtrlS();
    await flushMicrotasks();
    expect(onSave.state.calls).toBe(1);
    expect(loggedErrors.length).toBeGreaterThan(0);

    // 失敗後もロックが解放され、次の保存が可能
    pressCtrlS();
    await flushMicrotasks();
    expect(onSave.state.calls).toBe(2);

    console.error = originalError;
  });
});
