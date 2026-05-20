import { useEffect } from "react";

interface UseSaveShortcutParams {
  canSave: boolean;
  onSave: () => void;
}

export function useSaveShortcut({ canSave, onSave }: UseSaveShortcutParams) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key !== "s") {
        return;
      }

      event.preventDefault();
      if (canSave) {
        onSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [canSave, onSave]);
}
