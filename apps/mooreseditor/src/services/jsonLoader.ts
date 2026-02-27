/**
 * JSON data loading service.
 *
 * Loads JSON master data files, validates against schema,
 * and fills missing required fields.
 */

import {
  readText,
  writeText,
  pathExists,
  ensureDir,
  joinPath,
} from "./fileSystem";
import { getSampleJson } from "./devFileSystem";
import { createInitialValue } from "../domain/data/initialValue";
import { validateAndFillMissingFields } from "../domain/data/dataValidator";

import type { JsonValue } from "../domain/data/types";
import type { Schema, SchemaContainer } from "../domain/schema/types";

export interface LoadJsonResult {
  data: JsonValue;
  addedFields: string[];
}

function generateDefaultJsonFromSchema(
  schema: Schema | SchemaContainer,
): JsonValue {
  if ("type" in schema) {
    if (schema.type === "array") {
      return [];
    } else if (schema.type === "object") {
      const obj: Record<string, JsonValue> = {};
      if (schema.properties) {
        schema.properties.forEach((prop) => {
          const { key, ...propSchema } = prop;
          obj[key] = createInitialValue(propSchema as Schema) as JsonValue;
        });
      }
      return obj;
    } else {
      return createInitialValue(schema as Schema) as JsonValue;
    }
  }
  return null;
}

/**
 * Load JSON data for a menu item.
 *
 * Production: reads from masterDir via Tauri FS.
 * Fallback: loads sample data via fetch.
 *
 * If the file doesn't exist and a schema is provided,
 * creates a default file from the schema.
 */
export async function loadJsonForMenuItem(
  menuItem: string,
  projectDir: string,
  masterDir: string | null,
  schema?: Schema | SchemaContainer | null,
): Promise<LoadJsonResult | null> {
  let parsedData: JsonValue;

  try {
    // Try production path first
    if (!masterDir) {
      throw new Error("Master directory is not set");
    }

    const jsonFilePath = await joinPath(masterDir, `${menuItem}.json`);
    const isFilePresent = await pathExists(jsonFilePath);

    if (!isFilePresent && schema) {
      // File doesn't exist — create from schema
      const dirExists = await pathExists(masterDir);
      if (!dirExists) {
        await ensureDir(masterDir);
      }

      parsedData = generateDefaultJsonFromSchema(schema);
      await writeText(jsonFilePath, JSON.stringify(parsedData, null, 2));
    } else {
      const fileContents = await readText(jsonFilePath);
      parsedData = JSON.parse(fileContents) as JsonValue;
    }
  } catch {
    // Dev fallback: load sample JSON
    try {
      parsedData = await getSampleJson(menuItem);
    } catch {
      console.error(`Failed to load JSON for ${menuItem}`);
      return null;
    }
  }

  if (parsedData === undefined || parsedData === null) {
    return null;
  }

  // Validate and fill missing required fields
  let addedFields: string[] = [];
  if (schema) {
    const result = validateAndFillMissingFields(parsedData, schema);
    parsedData = result.data as JsonValue;
    addedFields = result.addedFields;
  }

  return { data: parsedData, addedFields };
}
