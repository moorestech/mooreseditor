import { useEffect, useRef } from "react";

interface UseSaveShortcutParams {
  canSave: boolean;
  /** 保存を実行する。同期・非同期どちらでもよい。 */
  onSave: () => void | Promise<void>;
}

/**
 * Ctrl+S / Cmd+S でアクティブビューの保存を起動するフック。
 * 保存が非同期の場合、完了するまで次の保存起動を抑止して多重実行を防ぐ。
 */
export function useSaveShortcut({ canSave, onSave }: UseSaveShortcutParams) {
  const isSavingRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key !== "s") {
        return;
      }

      event.preventDefault();
      if (!canSave || isSavingRef.current) {
        return;
      }

      isSavingRef.current = true;
      void Promise.resolve()
        .then(() => onSave())
        .catch((error) => {
          console.error("保存中にエラーが発生しました:", error);
        })
        .finally(() => {
          isSavingRef.current = false;
        });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [canSave, onSave]);
}
