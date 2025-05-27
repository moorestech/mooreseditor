import { useState } from "react";

import * as path from "@tauri-apps/api/path";
import { readTextFile } from "@tauri-apps/plugin-fs";

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
      let jsonFilePath: string;
      let fileContents: string;
      
      if (isDev && projectDir === "SampleProject") {
        jsonFilePath = `/home/ubuntu/repos/mooreseditor/SampleProject/master/${menuItem}.json`;
        fileContents = await readTextFile(jsonFilePath);
      } else {
        jsonFilePath = await path.join(
          projectDir,
          "master",
          `${menuItem}.json`
        );
        fileContents = await readTextFile(jsonFilePath);
      }
      
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
