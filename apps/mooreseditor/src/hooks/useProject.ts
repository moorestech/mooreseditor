import { useState, useEffect } from "react";

import * as path from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile, readDir } from "@tauri-apps/plugin-fs";
import YAML from "yaml";
import { getSampleFileList } from "../utils/devFileSystem";

const isDev = import.meta.env.DEV;

export function useProject() {
  const [projectDir, setProjectDir] = useState<string | null>(null);
  const [schemaDir, setSchemaDir] = useState<string | null>(null);
  const [menuToFileMap, setMenuToFileMap] = useState<Record<string, string>>(
    {}
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

      const configPath = await path.join(
        openedDir as string,
        "mooreseditor.config.yml"
      );
      const configContents = await readTextFile(configPath);

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

      console.log("Menu to File Map:", yamlFiles);
      setMenuToFileMap(yamlFiles);
    } catch (error) {
      console.error("Error opening project directory:", error);
    } finally {
      setLoading(false);
    }
  }

  function loadSampleProjectData() {
    if (!isDev) return;
    
    setLoading(true);
    try {
      setProjectDir("SampleProject");
      
      const sampleFiles = getSampleFileList();
      const menuMap: Record<string, string> = {};
      
      sampleFiles.forEach(fileName => {
        menuMap[fileName] = fileName; // Use the key as both the menu item and identifier
      });
      
      setMenuToFileMap(menuMap);
      console.log("Sample project data loaded:", menuMap);
    } catch (error) {
      console.error("Error loading sample project data:", error);
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    if (isDev) {
      loadSampleProjectData();
    }
  }, []);

  function parseYaml(yamlText: string): any {
    try {
      return YAML.parse(yamlText);
    } catch (error) {
      console.error("Error parsing YAML:", error);
      return null;
    }
  }

  return {
    projectDir,
    schemaDir,
    menuToFileMap,
    loading,
    openProjectDir,
  };
}
