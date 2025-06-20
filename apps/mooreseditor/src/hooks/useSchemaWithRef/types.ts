import type { Schema } from "../../libs/schema/types";

/**
 * スキーマ定義のマップ
 * キーはスキーマID、値はスキーマ定義
 */
export type SchemaDefinitions = Record<string, any>;

/**
 * スキーマ読み込みのオプション
 */
export interface SchemaLoadOptions {
  schemaName: string;
  schemaDir: string;
}

/**
 * スキーマ読み込みエラー
 */
export class SchemaLoadError extends Error {
  constructor(
    message: string,
    public readonly schemaName: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'SchemaLoadError';
  }
}

/**
 * useSchemaWithRefフックの戻り値
 */
export interface UseSchemaWithRefReturn {
  schemas: Record<string, Schema>;
  loading: boolean;
  loadSchema: (schemaName: string, schemaDir: string | null) => Promise<Schema | null>;
}

/**
 * ディレクトリエントリ情報
 */
export interface DirectoryEntry {
  name: string;
  isDirectory: boolean;
}