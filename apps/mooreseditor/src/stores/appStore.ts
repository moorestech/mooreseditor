/**
 * App store — application mode and save orchestration.
 */

import { create } from "zustand";

import { saveProjectData } from "../services/persistence";
import { showNotification } from "../services/notification";

import type { Column } from "../domain/data/types";
import type { NodeGraphFile } from "../domain/nodeGraph/types";

type AppMode = "editor" | "node";

interface AppState {
  mode: AppMode;
  isNodeEditorMounted: boolean;
  isSaving: boolean;
}

interface AppActions {
  setMode: (mode: AppMode) => void;
  mountNodeEditor: () => void;
  saveAll: (params: {
    columns: Column[];
    nodeGraphData?: NodeGraphFile | null;
    projectDir: string | null;
    masterDir: string | null;
  }) => Promise<boolean>;
  reset: () => void;
}

const initialState: AppState = {
  mode: "editor",
  isNodeEditorMounted: false,
  isSaving: false,
};

export const useAppStore = create<AppState & AppActions>((set) => ({
  ...initialState,

  setMode: (mode) => {
    set({ mode });
    // Lazy-mount: once node editor is shown, keep it mounted
    if (mode === "node") {
      set({ isNodeEditorMounted: true });
    }
  },

  mountNodeEditor: () => set({ isNodeEditorMounted: true }),

  saveAll: async ({ columns, nodeGraphData, projectDir, masterDir }) => {
    set({ isSaving: true });
    try {
      const result = await saveProjectData({
        columns,
        nodeGraphData,
        projectDir,
        masterDir,
      });

      if (result.success) {
        await showNotification("保存完了", "データを保存しました", "success");
        return true;
      } else {
        console.error("保存中にエラー:", result.errors);
        await showNotification("保存エラー", result.errors.join("\n"), "error");
        return false;
      }
    } catch (error) {
      console.error("保存に失敗:", error);
      await showNotification(
        "保存エラー",
        "保存処理中に予期しないエラーが発生しました",
        "error",
      );
      return false;
    } finally {
      set({ isSaving: false });
    }
  },

  reset: () => set(initialState),
}));
