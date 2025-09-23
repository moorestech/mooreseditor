import * as path from "@tauri-apps/api/path";
import { readTextFile, readDir } from "@tauri-apps/plugin-fs";
import YAML from "yaml";

import type { SchemaDefinitions } from '../types';

/**
 * ディレクトリを再帰的にスキャンしてスキーマファイルを読み込む
 */
export async function scanSchemaDirectory(dir: string): Promise<SchemaDefinitions> {
  const definitions: SchemaDefinitions = {};
  
  async function scanDirectory(currentDir: string): Promise<void> {
    try {
      const entries = await readDir(currentDir);
      
      for (const entry of entries) {
        if (!entry.name) continue;
        
        if (entry.isDirectory) {
          // Recursively scan subdirectories
          const subDir = await path.join(currentDir, entry.name);
          await scanDirectory(subDir);
        } else if (entry.name.endsWith('.yml')) {
          try {
            const filePath = await path.join(currentDir, entry.name);
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
      console.debug(`Failed to read directory ${currentDir}:`, error);
    }
  }

  await scanDirectory(dir);
  return definitions;
}

/**
 * 単一のスキーマファイルを読み込む
 */
export async function loadSchemaFile(filePath: string): Promise<any> {
  const content = await readTextFile(filePath);
  return YAML.parse(content);
}