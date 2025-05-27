import { useState } from "react";

import * as path from "@tauri-apps/api/path";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { getSampleJson } from "../utils/devFileSystem";

const isDev = import.meta.env.DEV;

interface Column {
  title: string;
  data: any[];
}

export function useJson() {
  const [jsonData, setJsonData] = useState<Column[]>([]);

  async function loadJsonFile(
    menuItem: string,
    projectDir: string | null,
    columnIndex: number = 0
  ) {
    if (!projectDir) {
      console.error("Project directory is not set.");
      return;
    }

    try {
      let parsedData;
      
      if (isDev && projectDir === "SampleProject") {
        parsedData = await getSampleJson(menuItem);
        if (!parsedData) {
          console.error(`Sample JSON not found for: ${menuItem}`);
          return;
        }
      } else {
        const jsonFilePath = await path.join(
          projectDir,
          "master",
          `${menuItem}.json`
        );
        const fileContents = await readTextFile(jsonFilePath);
        parsedData = JSON.parse(fileContents);
      }

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
