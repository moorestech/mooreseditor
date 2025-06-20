import { useState, useCallback } from "react";
import * as path from "@tauri-apps/api/path";
import { readTextFile, readDir, BaseDirectory } from "@tauri-apps/plugin-fs";
import YAML from "yaml";

import type { Schema } from "../libs/schema/types";
import { getSampleSchema, getAllSampleSchemaMap } from "../utils/devFileSystem";

// Manually resolve refs in our schema format
function resolveRefs(obj: any, definitions: Record<string, any>): any {
  if (Array.isArray(obj)) {
    return obj.map(item => resolveRefs(item, definitions));
  } else if (obj && typeof obj === 'object') {
    // Check if this object has a ref property
    if (obj.ref && typeof obj.ref === 'string') {
      const refSchema = definitions[obj.ref];
      if (refSchema) {
        // Merge the ref schema with any other properties in the object
        const { ref, ...otherProps } = obj;
        const resolvedRef = resolveRefs(refSchema, definitions);
        return { ...otherProps, ...resolvedRef };
      } else {
        console.warn(`Reference not found: ${obj.ref}`);
        return obj;
      }
    } else {
      // Recursively resolve refs in nested objects
      const resolved: any = {};
      for (const [key, value] of Object.entries(obj)) {
        resolved[key] = resolveRefs(value, definitions);
      }
      return resolved;
    }
  }
  return obj;
}

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
      const definitions: Record<string, any> = {};

      // Helper function to recursively scan directory for schema files
      async function scanDirectory(dir: string): Promise<void> {
        try {
          const entries = await readDir(dir);
          
          for (const entry of entries) {
            if (!entry.name) continue;
            
            if (entry.isDirectory) {
              // Recursively scan subdirectories
              const subDir = await path.join(dir, entry.name);
              await scanDirectory(subDir);
            } else if (entry.name.endsWith('.yml')) {
              try {
                const filePath = await path.join(dir, entry.name);
                const content = await readTextFile(filePath);
                const schema = YAML.parse(content);
                
                // Use the id from the schema if available
                if (schema.id) {
                  definitions[schema.id] = schema;
                  console.debug(`Loaded schema: ${schema.id} from ${filePath}`);
                }
              } catch (error) {
                console.debug(`Failed to load schema ${entry.name}:`, error);
              }
            }
          }
        } catch (error) {
          console.debug(`Failed to read directory ${dir}:`, error);
        }
      }

      try {
        // Try to load from the actual file system first
        await scanDirectory(schemaDir);
        
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
      
      // Manually resolve refs
      const resolvedSchema = resolveRefs(schemaData, definitions);
      
      // Log for debugging
      if (schemaName === 'blocks') {
        console.log('Blocks schema after ref resolution:', resolvedSchema);
        // Log specific block type
        const dataProperty = (resolvedSchema as any).properties?.find((p: any) => p.key === 'data');
        const blockParamProperty = dataProperty?.items?.properties?.find((p: any) => p.key === 'blockParam');
        const gearCase = blockParamProperty?.cases?.find((c: any) => c.when === 'Gear');
        
        console.log('Gear case:', gearCase);
        console.log('Gear case properties:', gearCase?.properties);
        
        if (gearCase?.properties) {
          gearCase.properties.forEach((prop: any, index: number) => {
            console.log(`Property ${index}:`, prop.key, prop);
          });
        }
      }
      
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