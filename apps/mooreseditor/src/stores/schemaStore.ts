/**
 * Schema store — loaded schema definitions and metadata.
 */

import { create } from "zustand";

import { loadResolvedSchema } from "../services/schemaLoader";

import type { Schema } from "../domain/schema/types";

interface SchemaState {
  schemas: Record<string, Schema>;
  loading: boolean;
}

interface SchemaActions {
  loadSchema: (schemaName: string, schemaDir: string) => Promise<Schema | null>;
  setSchema: (schemaName: string, schema: Schema) => void;
  reset: () => void;
}

const initialState: SchemaState = {
  schemas: {},
  loading: false,
};

export const useSchemaStore = create<SchemaState & SchemaActions>((set) => ({
  ...initialState,

  loadSchema: async (schemaName, schemaDir) => {
    set({ loading: true });
    try {
      const resolvedSchema = await loadResolvedSchema(schemaName, schemaDir);

      set((state) => ({
        schemas: { ...state.schemas, [schemaName]: resolvedSchema },
      }));

      return resolvedSchema;
    } catch (error) {
      console.error(`Error loading schema for ${schemaName}:`, error);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  setSchema: (schemaName, schema) => {
    set((state) => ({
      schemas: { ...state.schemas, [schemaName]: schema },
    }));
  },

  reset: () => set(initialState),
}));
