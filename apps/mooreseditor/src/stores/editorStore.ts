/**
 * Editor store — selected schema, nested views stack.
 */

import { create } from "zustand";

import type { JsonValue } from "../domain/data/types";
import type { Schema } from "../domain/schema/types";

export interface NestedView {
  type: "form" | "table";
  schema: Schema;
  data: JsonValue;
  path: string[];
}

interface EditorState {
  selectedSchema: string | null;
  nestedViews: NestedView[];
}

interface EditorActions {
  selectSchema: (schemaName: string | null) => void;
  pushNestedView: (view: NestedView) => void;
  popNestedView: () => void;
  setNestedViews: (
    viewsOrUpdater: NestedView[] | ((prev: NestedView[]) => NestedView[]),
  ) => void;
  reset: () => void;
}

const initialState: EditorState = {
  selectedSchema: null,
  nestedViews: [],
};

export const useEditorStore = create<EditorState & EditorActions>((set) => ({
  ...initialState,

  selectSchema: (schemaName) => set({ selectedSchema: schemaName }),

  pushNestedView: (view) => {
    set((state) => ({
      nestedViews: [...state.nestedViews, view],
    }));
  },

  popNestedView: () => {
    set((state) => ({
      nestedViews: state.nestedViews.slice(0, -1),
    }));
  },

  setNestedViews: (viewsOrUpdater) => {
    set((state) => ({
      nestedViews:
        typeof viewsOrUpdater === "function"
          ? viewsOrUpdater(state.nestedViews)
          : viewsOrUpdater,
    }));
  },

  reset: () => set(initialState),
}));
