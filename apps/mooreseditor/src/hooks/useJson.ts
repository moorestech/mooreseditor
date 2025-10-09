import { useState } from "react";

import * as path from "@tauri-apps/api/path";
import {
  readTextFile,
  writeTextFile,
  exists,
  create,
} from "@tauri-apps/plugin-fs";

import { createInitialValue } from "../utils/createInitialValue";
import { validateAndFillMissingFields } from "../utils/dataValidator";
import { getSampleJson } from "../utils/devFileSystem";
import { notifyFieldsAdded } from "../utils/notifyFieldsAdded";

import { useProject } from "./useProject";

import type { Schema, SchemaContainer } from "../libs/schema/types";

const isDev = import.meta.env.DEV;

export interface Column {
  title: string;
  data: any;
}

function generateDefaultJsonFromSchema(schema: Schema | SchemaContainer): any {
  if ("type" in schema) {
    if (schema.type === "array") {
      return [];
    } else if (schema.type === "object") {
      const obj: any = {};
      if (schema.properties) {
        schema.properties.forEach((prop) => {
          const { key, ...propSchema } = prop;
          obj[key] = createInitialValue(propSchema as any);
        });
      }
      return obj;
    } else {
      return createInitialValue(schema as any);
    }
  }
  return null;
}

export function useJson() {
  const { projectDir, masterDir, schemaDir, menuToFileMap } = useProject();
  const [jsonData, setJsonData] = useState<Column[]>([]);
  const [isPreloading, setIsPreloading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  async function loadJsonFile(
    menuItem: string,
    columnIndex: number = 0,
    schema?: Schema | SchemaContainer | null,
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
        if (!masterDir) {
          console.error("Master directory is not set.");
          return;
        }
        const jsonFilePath = await path.join(masterDir, `${menuItem}.json`);

        // Check if file exists
        const isFilePresent = await exists(jsonFilePath);

        if (!isFilePresent && schema) {
          console.log(
            `JSON file not found for ${menuItem}. Creating new file with default values.`,
          );

          // Check if master directory exists, create if not
          const isMasterDirPresent = await exists(masterDir);
          if (!isMasterDirPresent) {
            await create(masterDir);
            console.log(`Created master directory: ${masterDir}`);
          }

          // Generate default JSON from schema
          parsedData = generateDefaultJsonFromSchema(schema);

          // Write the default JSON to file
          await writeTextFile(jsonFilePath, JSON.stringify(parsedData, null, 2),);
          console.log(`Created new JSON file: ${jsonFilePath}`);
        } else {
          // Read existing file
          const fileContents = await readTextFile(jsonFilePath);
          parsedData = JSON.parse(fileContents);
        }
      }

      // Validate and fill missing required fields
      if (schema) {
        const { data, addedFields } = validateAndFillMissingFields(
          parsedData,
          schema,
        );

        if (addedFields.length > 0) {
          await notifyFieldsAdded(menuItem, addedFields);
          setHasUnsavedChanges(true);
        }

        parsedData = data;
      }

      if (!parsedData) {
        console.error(`Invalid JSON format in file: ${menuItem}.json`);
        return;
      }

      console.log("Loaded JSON data:", parsedData);

      setJsonData((prevJsonData) => {
        // Check if already exists
        const existingIndex = prevJsonData.findIndex(
          (item) => item.title === menuItem,
        );
        if (existingIndex !== -1) {
          // Update existing data
          const newData = [...prevJsonData];
          newData[existingIndex] = { title: menuItem, data: parsedData };
          return newData;
        } else {
          // Add new data
          return [
            ...prevJsonData.slice(0, columnIndex + 1),
            { title: menuItem, data: parsedData },
          ];
        }
      });
    } catch (error) {
      console.error(`Error loading JSON file for ${menuItem}:`, error);
    }
  }

  async function preloadAllData(
    loadSchema: (menuItem: string) => Promise<Schema | SchemaContainer | null>,
  ) {
    if (
      Object.keys(menuToFileMap).length === 0 ||
      isPreloading ||
      !projectDir ||
      !schemaDir
    ) {
      return;
    }

    setIsPreloading(true);
    console.log("Preloading all data...");

    // Priority order: items first (often referenced by foreign keys), then others
    const menuItems = Object.keys(menuToFileMap);
    const priorityItems = ["items"];
    const otherItems = menuItems.filter(
      (item) => !priorityItems.includes(item),
    );
    const orderedItems = [
      ...priorityItems.filter((item) => menuItems.includes(item)),
      ...otherItems,
    ];

    for (const menuItem of orderedItems) {
      try {
        console.log(`Preloading ${menuItem}...`);
        // Load schema first
        const loadedSchema = await loadSchema(menuItem);
        // Load JSON data (loadJsonFile will check if already exists)
        await loadJsonFile(menuItem, 999, loadedSchema); // Large index to append
      } catch (error) {
        console.error(`Failed to preload ${menuItem}:`, error);
      }
    }

    console.log("Preloading complete");
    setIsPreloading(false);
  }

  function clearUnsavedChanges() {
    setHasUnsavedChanges(false);
  }

  return {
    jsonData,
    setJsonData,
    loadJsonFile,
    preloadAllData,
    isPreloading,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    clearUnsavedChanges,
  };
}
