/**
 * Schema loading service.
 *
 * Loads YAML schema files and resolves $ref references.
 * Production: reads from Tauri FS. Fallback: sample schemas via fetch.
 */

import YAML from "yaml";

import { readText, listDir, joinPath } from "./fileSystem";
import { getSampleSchema, getAllSampleSchemaMap } from "./devFileSystem";
import { resolveRefs } from "../domain/schema/refResolver";

import type { Schema } from "../domain/schema/types";

export type SchemaDefinitions = Record<string, unknown>;

/**
 * Load all schema definitions from a directory (including subdirectories).
 * Production: Tauri FS recursive scan. Fallback: sample schemas.
 */
export async function loadDefinitions(
  schemaDir: string,
): Promise<SchemaDefinitions> {
  try {
    const definitions = await scanSchemaDirectory(schemaDir);

    // If nothing loaded and looks like a sample project, fall back
    if (
      Object.keys(definitions).length === 0 &&
      schemaDir === "SampleProject/schema"
    ) {
      throw new Error(
        "No schemas loaded from file system, falling back to dev mode",
      );
    }

    return definitions;
  } catch {
    return await loadSampleDefinitions();
  }
}

/**
 * Load a single main schema by name.
 * Production: Tauri FS read. Fallback: sample schema via fetch.
 */
export async function loadMainSchema(
  schemaName: string,
  schemaDir: string,
): Promise<Schema> {
  try {
    const schemaFilePath = await joinPath(schemaDir, `${schemaName}.yml`);
    const content = await readText(schemaFilePath);
    return YAML.parse(content) as Schema;
  } catch {
    const content = await getSampleSchema(schemaName);
    return YAML.parse(content) as Schema;
  }
}

/**
 * Load and resolve a schema with all its $ref references.
 */
export async function loadResolvedSchema(
  schemaName: string,
  schemaDir: string,
): Promise<Schema> {
  const definitions = await loadDefinitions(schemaDir);
  const schema = await loadMainSchema(schemaName, schemaDir);
  return resolveRefs(schema, definitions) as Schema;
}

async function scanSchemaDirectory(dir: string): Promise<SchemaDefinitions> {
  const definitions: SchemaDefinitions = {};

  async function scan(currentDir: string): Promise<void> {
    const entries = await listDir(currentDir);

    for (const entry of entries) {
      if (entry.isDirectory) {
        const subDir = await joinPath(currentDir, entry.name);
        await scan(subDir);
      } else if (entry.name.endsWith(".yml")) {
        try {
          const filePath = await joinPath(currentDir, entry.name);
          const content = await readText(filePath);
          const schema = YAML.parse(content);
          if (schema?.id) {
            definitions[schema.id] = schema;
          }
        } catch (error) {
          console.debug(`Failed to load schema ${entry.name}:`, error);
        }
      }
    }
  }

  await scan(dir);
  return definitions;
}

async function loadSampleDefinitions(): Promise<SchemaDefinitions> {
  const definitions: SchemaDefinitions = {};
  const schemaMap = getAllSampleSchemaMap();

  for (const [schemaPath] of schemaMap) {
    try {
      const content = await getSampleSchema(schemaPath);
      const schema = YAML.parse(content);
      if (schema?.id) {
        definitions[schema.id] = schema;
      }
    } catch {
      // Sample schema not available — skip
    }
  }

  return definitions;
}
