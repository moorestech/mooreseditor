import { useState, useCallback } from "react";
import * as path from "@tauri-apps/api/path";
import { readTextFile, readDir, BaseDirectory } from "@tauri-apps/plugin-fs";
import YAML from "yaml";

import type { Schema } from "../libs/schema/types";
import { getSampleSchema, getAllSampleSchemaMap } from "../utils/devFileSystem";
import { RefResolver } from "./useSchemaWithRef/resolvers/RefResolver";
import { scanSchemaDirectory } from "./useSchemaWithRef/utils/schemaScanner";


export function useSchemaWithRef() {
  const [schemas, setSchemas] = useState<Record<string, Schema>>({});
  const [loading, setLoading] = useState(false);

  const loadSchema = useCallback(async (
    schemaName: string,
    schemaDir: string | null
  ): Promise<Schema | null> => {
    if (!schemaDir) {
      console.error("Schema directory is not set.");
      return null;
    }

    try {
      setLoading(true);
      
      // Load all ref schemas into a definitions object
      let definitions: Record<string, any> = {};


      try {
        // Try to load from the actual file system first
        definitions = await scanSchemaDirectory(schemaDir);
        
        // If no definitions were loaded and schemaDir is the sample project,
        // it might be running in dev mode where we can't access the file system
        if (Object.keys(definitions).length === 0 && schemaDir === "SampleProject/schema") {
          throw new Error("No schemas loaded from file system, falling back to dev mode");
        }
      } catch (error) {
        // Fallback to dev mode sample schemas
        console.debug("Loading sample schemas in dev mode");
        const schemaMap = getAllSampleSchemaMap();
        
        for (const [schemaPath, schemaId] of schemaMap) {
          try {
            const content = await getSampleSchema(schemaPath);
            const schema = YAML.parse(content);
            if (schema.id) {
              definitions[schema.id] = schema;
            }
          } catch (error) {
            console.debug(`Sample schema ${schemaPath} not found`);
          }
        }
      }

      // Load main schema
      let schemaContent: string;
      
      try {
        // Try to load from the actual file system first
        const schemaFilePath = await path.join(schemaDir, `${schemaName}.yml`);
        schemaContent = await readTextFile(schemaFilePath);
      } catch (error) {
        // Fallback to dev mode sample schema
        console.debug(`Loading sample schema for ${schemaName} in dev mode`);
        schemaContent = await getSampleSchema(schemaName);
      }
      
      const schemaData = YAML.parse(schemaContent) as Schema;
      
      // Manually resolve refs using RefResolver
      const resolver = new RefResolver(definitions);
      const resolvedSchema = resolver.resolve(schemaData);
      
      // Log for debugging
      resolver.debugBlocksSchema(resolvedSchema, schemaName);
      
      setSchemas(prev => ({
        ...prev,
        [schemaName]: resolvedSchema
      }));
      
      return resolvedSchema;
    } catch (error) {
      console.error(`Error loading schema for ${schemaName}:`, error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    schemas,
    loading,
    loadSchema,
  };
}