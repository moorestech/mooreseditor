import React, { createContext, useContext, useState, ReactNode } from "react";
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
  i18nDir: string | null;
  availableLanguages: string[];
  menuToFileMap: Record<string, string>;
  loading: boolean;
  openProjectDir: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projectDir, setProjectDir] = useState<string | null>(null);
  const [schemaDir, setSchemaDir] = useState<string | null>(null);
  const [masterDir, setMasterDir] = useState<string | null>(null);
  const [i18nDir, setI18nDir] = useState<string | null>(null);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [menuToFileMap, setMenuToFileMap] = useState<Record<string, string>>({});
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

      // Try .yml then .yaml for config file
      let configContents: string | null = null;
      const configYmlPath = await path.join(
        openedDir as string,
        "mooreseditor.config.yml"
      );
      try {
        configContents = await readTextFile(configYmlPath);
      } catch (_) {
        const configYamlPath = await path.join(
          openedDir as string,
          "mooreseditor.config.yaml"
        );
        try {
          configContents = await readTextFile(configYamlPath);
        } catch (err) {
          console.error("Failed to read mooreseditor.config.(yml|yaml)", err);
          setLoading(false);
          return;
        }
      }

      const configData = parseYaml(configContents);
      if (!configData || !configData.schemaPath) {
        console.error(
          "Invalid or missing schemaPath in mooreseditor.config.yml"
        );
        setLoading(false);
        return;
      }

      const resolvedSchemaPath = await path.resolve(
        openedDir as string,
        configData.schemaPath
      );

      setSchemaDir(resolvedSchemaPath);

      // masterPathを読み込む（デフォルトは"master"）
      const masterPath = configData.masterPath || "master";
      const resolvedMasterPath = await path.resolve(
        openedDir as string,
        masterPath
      );
      setMasterDir(resolvedMasterPath);

      // Resolve i18n directory (default: "i18n") and detect languages
      const i18nPath = (configData.i18n && configData.i18n.path) ? configData.i18n.path : "i18n";
      const resolvedI18nPath = await path.resolve(
        openedDir as string,
        i18nPath
      );
      setI18nDir(resolvedI18nPath);

      try {
        const langEntries = await readDir(resolvedI18nPath);
        const langs = langEntries
          .filter((e) => e.isDirectory && !!e.name)
          .map((e) => e.name!)
          .sort();
        setAvailableLanguages(langs);
      } catch (e) {
        console.warn("Failed to read i18n directory; continuing without languages", e);
        setAvailableLanguages([]);
      }

      const files = await readDir(resolvedSchemaPath);
      const yamlFiles: Record<string, string> = {};

      for (const file of files) {
        if (file.name && file.name.endsWith(".yml")) {
          yamlFiles[file.name.replace(".yml", "")] = await path.join(
            resolvedSchemaPath,
            file.name
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
      setI18nDir("SampleProject/i18n");
      // Provide a default set of languages for dev sample
      setAvailableLanguages(["en", "ja"]);
      
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
        i18nDir,
        availableLanguages,
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
