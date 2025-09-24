import * as path from "@tauri-apps/api/path";

import { scanSchemaDirectory, loadSchemaFile } from '../utils/schemaScanner';

import type { SchemaLoader } from './SchemaLoader';
import type { Schema } from '../../../libs/schema/types';
import type { SchemaDefinitions, SchemaLoadOptions } from '../types';

/**
 * 本番環境用のスキーマローダー
 * ファイルシステムから実際にファイルを読み込む
 */
export class ProductionLoader implements SchemaLoader {
  async loadDefinitions(schemaDir: string): Promise<SchemaDefinitions> {
    return await scanSchemaDirectory(schemaDir);
  }

  async loadMainSchema(options: SchemaLoadOptions): Promise<Schema> {
    const schemaFilePath = await path.join(options.schemaDir, `${options.schemaName}.yml`);
    return await loadSchemaFile(schemaFilePath) as Schema;
  }
}