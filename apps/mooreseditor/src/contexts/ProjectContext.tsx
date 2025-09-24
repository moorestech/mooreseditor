import type { ReactNode } from "react";
import React, { createContext, useContext, useState } from "react";

import { invoke } from "@tauri-apps/api/core";
import * as path from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile, readDir } from "@tauri-apps/plugin-fs";
import YAML from "yaml";

import { getSampleSchemaList, getSampleSchema } from "../utils/devFileSystem";

const isDev = import.meta.env.DEV;

interface ProjectContextType {
  projectDir: string | null;
  schemaDir: string | null;
  masterDir: string | null;
  menuToFileMap: Record<string, string>;
  loading: boolean;
  openProjectDir: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projectDir, setProjectDir] = useState<string | null>(null);
  const [schemaDir, setSchemaDir] = useState<string | null>(null);
  const [masterDir, setMasterDir] = useState<string | null>(null);
  const [menuToFileMap, setMenuToFileMap] = useState<Record<string, string>>(
    {},
  );
  const [loading, setLoading] = useState(false);

  async function openProjectDir() {
    setLoading(true);
    try {
      const openedDir = await open({ directory: true });
      if (!openedDir) {
        console.error("No directory selected.");
        setLoading(false);
        return;
      }

      setProjectDir(openedDir as string);

      // Add the opened directory to the file system scope
      try {
        await invoke("add_project_to_scope", { projectPath: openedDir });
      } catch (error) {
        console.warn("Failed to add project directory to scope:", error);
      }

      const configPath = await path.join(
        openedDir as string,
        "mooreseditor.config.yml",
      );
      const configContents = await readTextFile(configPath);

      const configData = parseYaml(configContents);
      if (!configData || !configData.schemaPath) {
        console.error(
          "Invalid or missing schemaPath in mooreseditor.config.yml",
        );
        setLoading(false);
        return;
      }

      const resolvedSchemaPath = await path.resolve(
        openedDir as string,
        configData.schemaPath,
      );

      setSchemaDir(resolvedSchemaPath);

      // Add the schema directory to the file system scope
      try {
        await invoke("add_project_to_scope", {
          projectPath: resolvedSchemaPath,
        });
      } catch (error) {
        console.warn("Failed to add schema directory to scope:", error);
      }

      // masterPathを読み込む（デフォルトは"master"）
      const masterPath = configData.masterPath || "master";
      const resolvedMasterPath = await path.resolve(
        openedDir as string,
        masterPath,
      );
      setMasterDir(resolvedMasterPath);

      // Add the master directory to the file system scope
      try {
        await invoke("add_project_to_scope", {
          projectPath: resolvedMasterPath,
        });
      } catch (error) {
        console.warn("Failed to add master directory to scope:", error);
      }

      const files = await readDir(resolvedSchemaPath);
      const yamlFiles: Record<string, string> = {};

      for (const file of files) {
        if (file.name && file.name.endsWith(".yml")) {
          yamlFiles[file.name.replace(".yml", "")] = await path.join(
            resolvedSchemaPath,
            file.name,
          );
        }
      }

      if (Object.keys(yamlFiles).length === 0) {
        console.error("No YAML files found in the schemaPath.");
        setLoading(false);
        return;
      }

      setMenuToFileMap(yamlFiles);
    } catch (error) {
      console.error("Error opening project directory:", error);
      loadSampleProjectData();
    } finally {
      setLoading(false);
    }
  }

  async function loadSampleProjectData() {
    if (!isDev) return;

    setLoading(true);
    try {
      setProjectDir("SampleProject");
      setSchemaDir("SampleProject/schema");
      setMasterDir("SampleProject/master");

      const schemaFiles = getSampleSchemaList();
      const menuMap: Record<string, string> = {};

      for (const schemaName of schemaFiles) {
        try {
          const schemaContent = await getSampleSchema(schemaName);
          const schemaData = parseYaml(schemaContent);
          if (schemaData && schemaData.id) {
            menuMap[schemaData.id] = schemaData.id;
          }
        } catch (error) {
          console.error(`Failed to load schema ${schemaName}:`, error);
        }
      }

      setMenuToFileMap(menuMap);
    } catch (error) {
      console.error("Error loading sample project data:", error);
    } finally {
      setLoading(false);
    }
  }

  function parseYaml(yamlText: string): any {
    try {
      return YAML.parse(yamlText);
    } catch (error) {
      console.error("Error parsing YAML:", error);
      return null;
    }
  }

  return (
    <ProjectContext.Provider
      value={{
        projectDir,
        schemaDir,
        masterDir,
        menuToFileMap,
        loading,
        openProjectDir,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
