import type { SchemaDefinitions, SchemaLoadOptions } from '../types';
import type { Schema } from '../../../libs/schema/types';

/**
 * スキーマローダーの抽象インターフェース
 */
export interface SchemaLoader {
  /**
   * すべての定義（ref含む）を読み込む
   */
  loadDefinitions(schemaDir: string): Promise<SchemaDefinitions>;

  /**
   * メインスキーマを読み込む
   */
  loadMainSchema(options: SchemaLoadOptions): Promise<Schema>;
}