import { useState, useCallback } from "react";

import { DevelopmentLoader } from "./loaders/DevelopmentLoader";
import { ProductionLoader } from "./loaders/ProductionLoader";
import { RefResolver } from "./resolvers/RefResolver";

import type { SchemaLoader } from "./loaders/SchemaLoader";
import type { UseSchemaReturn, SchemaDefinitions } from "./types";
import type { Schema } from "../../libs/schema/types";

/**
 * refをサポートしたスキーマ読み込みフック
 */
export function useSchema(): UseSchemaReturn {
  const [schemas, setSchemas] = useState<Record<string, Schema>>({});
  const [isLoading, setIsLoading] = useState(false);

  const loadSchema = useCallback(
    async (
      schemaName: string,
      schemaDir: string | null,
    ): Promise<Schema | null> => {
      if (!schemaDir) {
        console.error("Schema directory is not set.");
        return null;
      }

      try {
        setIsLoading(true);

        // ローダーの選択: try-catchパターンで本番環境を先に試す
        let loader: SchemaLoader;
        let definitions: SchemaDefinitions = {};

        try {
          // 本番環境のローダーを試す
          loader = new ProductionLoader();
          definitions = await loader.loadDefinitions(schemaDir);

          // 定義が読み込めなかった場合は開発環境の可能性
          if (
            Object.keys(definitions).length === 0 &&
            schemaDir === "SampleProject/schema"
          ) {
            throw new Error(
              "No schemas loaded from file system, falling back to dev mode",
            );
          }
        } catch (_error) {
          // 開発環境のローダーにフォールバック
          loader = new DevelopmentLoader();
          definitions = await loader.loadDefinitions(schemaDir);
        }

        // メインスキーマの読み込み
        let schema: Schema;
        try {
          // 本番環境での読み込みを試す
          const productionLoader = new ProductionLoader();
          schema = await productionLoader.loadMainSchema({
            schemaName,
            schemaDir,
          });
        } catch (_error) {
          // 開発環境での読み込みにフォールバック
          const developmentLoader = new DevelopmentLoader();
          schema = await developmentLoader.loadMainSchema({
            schemaName,
            schemaDir,
          });
        }

        // RefResolverを使用してref参照を解決
        const resolver = new RefResolver(definitions);
        const resolvedSchema = resolver.resolve(schema);

        // デバッグログ（blocksスキーマの詳細）
        resolver.debugBlocksSchema(resolvedSchema, schemaName);

        // 状態を更新
        setSchemas((prev) => ({
          ...prev,
          [schemaName]: resolvedSchema,
        }));

        return resolvedSchema;
      } catch (error) {
        console.error(`Error loading schema for ${schemaName}:`, error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    schemas,
    loading: isLoading,
    loadSchema,
  };
}
