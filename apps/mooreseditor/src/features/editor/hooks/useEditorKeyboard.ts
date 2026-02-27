/**
 * Keyboard shortcut handler for editor mode (Ctrl+S / Cmd+S).
 */

import { useEffect } from "react";

import { useAppStore } from "../../../stores/appStore";
import { useDataStore } from "../../../stores/dataStore";
import { useProjectStore } from "../../../stores/projectStore";

import type { NodeEditorHandle } from "../../../nodeEditor";

/**
 * Registers a global keydown listener for Ctrl/Cmd+S.
 * In editor mode, saves column data.
 * In node mode, delegates to NodeEditorHandle.save().
 */
export function useEditorKeyboard(
  nodeEditorRef: React.RefObject<NodeEditorHandle | null>,
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key !== "s") {
        return;
      }

      event.preventDefault();

      const mode = useAppStore.getState().mode;

      if (mode === "editor") {
        const { columns, hasUnsavedChanges } = useDataStore.getState();
        if (!hasUnsavedChanges || columns.length === 0) return;

        const { projectDir, masterDir } = useProjectStore.getState();
        void useAppStore.getState().saveAll({
          columns,
          projectDir,
          masterDir,
        });
        useDataStore.getState().clearUnsavedChanges();
        return;
      }

      // Node mode — delegate to the node editor
      nodeEditorRef.current?.save();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [nodeEditorRef]);
}
