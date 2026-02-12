import { useEffect } from "react";

interface UseSaveShortcutParams {
  mode: "editor" | "node";
  canSaveEditor: boolean;
  onSaveEditor: () => void;
  onSaveNode: () => void;
}

export function useSaveShortcut({
  mode,
  canSaveEditor,
  onSaveEditor,
  onSaveNode,
}: UseSaveShortcutParams) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key !== "s") {
        return;
      }

      event.preventDefault();
      if (mode === "editor") {
        if (canSaveEditor) {
          onSaveEditor();
        }
        return;
      }

      onSaveNode();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mode, canSaveEditor, onSaveEditor, onSaveNode]);
}
