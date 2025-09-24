import YAML from "yaml";

import {
  getSampleSchema,
  getAllSampleSchemaMap,
} from "../../../utils/devFileSystem";

import type { SchemaLoader } from "./SchemaLoader";
import type { Schema } from "../../../libs/schema/types";
import type { SchemaDefinitions, SchemaLoadOptions } from "../types";

/**
 * 開発環境用のスキーマローダー
 * devFileSystemを使用してサンプルスキーマを読み込む
 */
export class DevelopmentLoader implements SchemaLoader {
  async loadDefinitions(schemaDir: string): Promise<SchemaDefinitions> {
    console.debug("Loading sample schemas in dev mode");
    const definitions: SchemaDefinitions = {};
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

    return definitions;
  }

  async loadMainSchema(options: SchemaLoadOptions): Promise<Schema> {
    console.debug(
      `Loading sample schema for ${options.schemaName} in dev mode`,
    );
    const schemaContent = await getSampleSchema(options.schemaName);
    return YAML.parse(schemaContent) as Schema;
  }
}
