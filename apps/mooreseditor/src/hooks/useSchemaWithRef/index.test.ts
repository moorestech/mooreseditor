import { useState, useCallback } from "react";
import type { Schema } from "../../libs/schema/types";

export function useSchemaWithRef() {
  const [schemas, setSchemas] = useState<Record<string, Schema>>({});
  const [loading, setLoading] = useState(false);

  const loadSchema = useCallback(async (
    schemaName: string,
    schemaDir: string | null
  ): Promise<Schema | null> => {
    console.log('Test useSchemaWithRef called');
    return null;
  }, []);

  return {
    schemas,
    loading,
    loadSchema,
  };
}