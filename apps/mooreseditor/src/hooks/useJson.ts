import { useState } from "react";

import * as path from "@tauri-apps/api/path";
import { readTextFile } from "@tauri-apps/plugin-fs";

const isTauri = Boolean((window as any).__TAURI_IPC__);

/**
 * Build a path within the public folder taking into account the configured
 * base URL. This ensures fetch paths work both in the browser and when
 * bundled with Tauri.
 */
function buildPublicPath(relativePath: string): string {
  let base = import.meta.env.BASE_URL || "/";
  if (!base.endsWith("/")) base += "/";
  return `${base}${relativePath}`.replace(/\/+/g, "/");
}

export function useJson() {
  const [jsonData, setJsonData] = useState<Column[]>([]);

  /**
   * Load a JSON data file and store it in the state. When running outside of
   * Tauri the file is fetched from the bundled public directory. When running in
   * Tauri it is read from the project directory on disk.
   */
  async function loadJsonFile(
    menuItem: string,
    projectDir: string | null,
    columnIndex: number = 0
  ) {
    if (!isTauri) {
      try {
        const response = await fetch(
          buildPublicPath(`test-data/master/${menuItem}.json`)
        );
        const parsedData = await response.json();

        if (!parsedData || !Array.isArray(parsedData.data)) {
          console.error(`Invalid JSON format in file: ${menuItem}.json`);
          return;
        }

        const newJsonData = [
          ...jsonData.slice(0, columnIndex + 1),
          { title: menuItem, data: parsedData.data },
        ];
        setJsonData(newJsonData);
      } catch (error) {
        console.error(`Error loading JSON file for ${menuItem}:`, error);
      }
      return;
    }

    if (!projectDir) {
      console.error("Project directory is not set.");
      return;
    }

    try {
      const jsonFilePath = await path.join(
        projectDir,
        "master",
        `${menuItem}.json`
      );
      const fileContents = await readTextFile(jsonFilePath);
      const parsedData = JSON.parse(fileContents);

      if (!parsedData || !Array.isArray(parsedData.data)) {
        console.error(`Invalid JSON format in file: ${menuItem}.json`);
        return;
      }

      const newJsonData = [
        ...jsonData.slice(0, columnIndex + 1),
        { title: menuItem, data: parsedData.data },
      ];
      setJsonData(newJsonData);
    } catch (error) {
      console.error(`Error loading JSON file for ${menuItem}:`, error);
    }
  }

  return {
    jsonData,
    setJsonData,
    loadJsonFile,
  };
}
