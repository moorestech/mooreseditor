/**
 * Project store — project directory paths and schema file map.
 */

import { create } from "zustand";

import { openProject, loadSampleProject } from "../services/projectLoader";

import type { ProjectConfig } from "../services/projectLoader";

interface ProjectState {
  projectDir: string | null;
  schemaDir: string | null;
  masterDir: string | null;
  menuToFileMap: Record<string, string>;
  loading: boolean;
}

interface ProjectActions {
  openProjectDir: () => Promise<void>;
  setProjectConfig: (config: ProjectConfig) => void;
  reset: () => void;
}

const initialState: ProjectState = {
  projectDir: null,
  schemaDir: null,
  masterDir: null,
  menuToFileMap: {},
  loading: false,
};

export const useProjectStore = create<ProjectState & ProjectActions>((set) => ({
  ...initialState,

  openProjectDir: async () => {
    set({ loading: true });
    try {
      const config = await openProject();
      if (config) {
        set({
          projectDir: config.projectDir,
          schemaDir: config.schemaDir,
          masterDir: config.masterDir,
          menuToFileMap: config.menuToFileMap,
        });
      }
    } catch {
      // Fallback to sample project
      try {
        const sample = await loadSampleProject();
        set({
          projectDir: sample.projectDir,
          schemaDir: sample.schemaDir,
          masterDir: sample.masterDir,
          menuToFileMap: sample.menuToFileMap,
        });
      } catch (error) {
        console.error("Failed to load sample project:", error);
      }
    } finally {
      set({ loading: false });
    }
  },

  setProjectConfig: (config) => {
    set({
      projectDir: config.projectDir,
      schemaDir: config.schemaDir,
      masterDir: config.masterDir,
      menuToFileMap: config.menuToFileMap,
    });
  },

  reset: () => set(initialState),
}));
