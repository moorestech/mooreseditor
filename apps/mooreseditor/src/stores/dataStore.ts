/**
 * Data store — JSON column data, dirty tracking, and preloading.
 */

import { create } from "zustand";

import { loadJsonForMenuItem } from "../services/jsonLoader";
import { notifyFieldsAdded } from "../services/notification";

import type { Column, JsonValue } from "../domain/data/types";
import type { Schema, SchemaContainer } from "../domain/schema/types";

interface DataState {
  columns: Column[];
  isPreloading: boolean;
  hasUnsavedChanges: boolean;
}

interface DataActions {
  loadJsonFile: (
    menuItem: string,
    columnIndex: number,
    projectDir: string,
    masterDir: string | null,
    schema?: Schema | SchemaContainer | null,
  ) => Promise<void>;
  preloadAllData: (
    menuToFileMap: Record<string, string>,
    projectDir: string,
    masterDir: string | null,
    schemaDir: string | null,
    loadSchema: (name: string, dir: string) => Promise<Schema | null>,
  ) => Promise<void>;
  setColumns: (columns: Column[]) => void;
  updateColumn: (title: string, data: JsonValue) => void;
  markDirty: () => void;
  clearUnsavedChanges: () => void;
  reset: () => void;
}

const initialState: DataState = {
  columns: [],
  isPreloading: false,
  hasUnsavedChanges: false,
};

export const useDataStore = create<DataState & DataActions>((set, get) => ({
  ...initialState,

  loadJsonFile: async (
    menuItem,
    columnIndex,
    projectDir,
    masterDir,
    schema,
  ) => {
    const result = await loadJsonForMenuItem(
      menuItem,
      projectDir,
      masterDir,
      schema,
    );

    if (!result) return;

    if (result.addedFields.length > 0) {
      await notifyFieldsAdded(menuItem, result.addedFields);
      set({ hasUnsavedChanges: true });
    }

    set((state) => {
      const existingIndex = state.columns.findIndex(
        (item) => item.title === menuItem,
      );
      if (existingIndex !== -1) {
        const newColumns = [...state.columns];
        newColumns[existingIndex] = { title: menuItem, data: result.data };
        return { columns: newColumns };
      }
      return {
        columns: [
          ...state.columns.slice(0, columnIndex + 1),
          { title: menuItem, data: result.data },
        ],
      };
    });
  },

  preloadAllData: async (
    menuToFileMap,
    projectDir,
    masterDir,
    schemaDir,
    loadSchema,
  ) => {
    const { isPreloading } = get();
    if (
      Object.keys(menuToFileMap).length === 0 ||
      isPreloading ||
      !projectDir ||
      !schemaDir
    ) {
      return;
    }

    set({ isPreloading: true });

    // Priority order: items first (often referenced by foreign keys)
    const menuItems = Object.keys(menuToFileMap);
    const priorityItems = ["items"];
    const otherItems = menuItems.filter(
      (item) => !priorityItems.includes(item),
    );
    const orderedItems = [
      ...priorityItems.filter((item) => menuItems.includes(item)),
      ...otherItems,
    ];

    const { loadJsonFile } = get();

    for (const menuItem of orderedItems) {
      try {
        const loadedSchema = await loadSchema(menuItem, schemaDir);
        await loadJsonFile(menuItem, 999, projectDir, masterDir, loadedSchema);
      } catch (error) {
        console.error(`Failed to preload ${menuItem}:`, error);
      }
    }

    set({ isPreloading: false });
  },

  setColumns: (columns) => set({ columns }),

  updateColumn: (title, data) => {
    set((state) => ({
      columns: state.columns.map((col) =>
        col.title === title ? { ...col, data } : col,
      ),
      hasUnsavedChanges: true,
    }));
  },

  markDirty: () => set({ hasUnsavedChanges: true }),

  clearUnsavedChanges: () => set({ hasUnsavedChanges: false }),

  reset: () => set(initialState),
}));
