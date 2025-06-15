import { useState } from "react";

import * as path from "@tauri-apps/api/path";
import { readTextFile } from "@tauri-apps/plugin-fs";
import YAML from "yaml";

import type { Schema } from "../libs/schema/types";
import { getSampleSchema } from "../utils/devFileSystem";

const isDev = import.meta.env.DEV;

export function useSchema() {
  const [schemas, setSchemas] = useState<Record<string, Schema>>({});
  const [loading, setLoading] = useState(false);

  async function loadSchema(
    schemaName: string,
    schemaDir: string | null
  ): Promise<Schema | null> {
    if (!schemaDir) {
      console.error("Schema directory is not set.");
      return null;
    }

    try {
      setLoading(true);
      
      let schemaContent: string;
      
      if (isDev && schemaDir === "SampleProject/schema") {
        schemaContent = await getSampleSchema(schemaName);
      } else {
        const schemaFilePath = await path.join(schemaDir, `${schemaName}.yml`);
        schemaContent = await readTextFile(schemaFilePath);
      }
      
      const schemaData = YAML.parse(schemaContent) as Schema;
      
      setSchemas(prev => ({
        ...prev,
        [schemaName]: schemaData
      }));
      
      return schemaData;
    } catch (error) {
      console.error(`Error loading schema for ${schemaName}:`, error);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    schemas,
    loading,
    loadSchema,
  };
}