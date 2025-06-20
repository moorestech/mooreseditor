import { useState, useCallback } from "react";
import * as path from "@tauri-apps/api/path";
import { readTextFile } from "@tauri-apps/plugin-fs";
import YAML from "yaml";

import type { Schema } from "../libs/schema/types";
import { getSampleSchema } from "../utils/devFileSystem";

const isDev = import.meta.env.DEV;

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

      const refSchemaFiles = [
        { file: "blockConnectInfo", id: "blockConnectInfo" },
        { file: "inventoryConnects", id: "inventoryConnects" },
        { file: "gear", id: "gear" },  // Fixed: file should be "gear", not "gearConnects"
        { file: "mineSettings", id: "mineSettings" },
        { file: "mapObjectMineSettings", id: "mapObjectMineSettings" },
        { file: "fluidInventoryConnects", id: "fluidInventoryConnects" }
      ];

      for (const { file, id } of refSchemaFiles) {
        try {
          let content: string;
          if (isDev && schemaDir === "SampleProject/schema") {
            content = await getSampleSchema(`ref/${file}`);
          } else {
            const refDir = await path.join(schemaDir, "ref");
            const filePath = await path.join(refDir, `${file}.yml`);
            content = await readTextFile(filePath);
          }
          
          const schema = YAML.parse(content);
          // Store schema by its id
          definitions[schema.id || id] = schema;
        } catch (error) {
          console.warn(`Failed to load ref schema ${file}:`, error);
        }
      }

      // Load main schema
      let schemaContent: string;
      
      if (isDev && schemaDir === "SampleProject/schema") {
        schemaContent = await getSampleSchema(schemaName);
      } else {
        const schemaFilePath = await path.join(schemaDir, `${schemaName}.yml`);
        schemaContent = await readTextFile(schemaFilePath);
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