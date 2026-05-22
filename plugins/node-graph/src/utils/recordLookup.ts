import type { SchemaMeta } from "./schemaMeta";
import type { Column } from "@moorestech/mooreseditor-plugin-sdk";

export interface RecordEntry {
  guid: string;
  name: string;
}

/**
 * Get records for a given schema type from jsonData.
 */
export function getRecords(
  schemaId: string,
  jsonData: Column[],
  schemaMetas: Map<string, SchemaMeta>,
): RecordEntry[] {
  const meta = schemaMetas.get(schemaId);
  if (!meta?.guidField) return [];
  const col = jsonData.find((c) => c.title === schemaId);
  const arr = col?.data?.[meta.dataArrayPath];
  if (!Array.isArray(arr)) return [];
  return arr
    .map((r: any) => ({
      guid: r[meta.guidField!] as string,
      name: (meta.nameField ? r[meta.nameField] : r[meta.guidField!]) as string,
    }))
    .filter((r) => r.guid);
}
