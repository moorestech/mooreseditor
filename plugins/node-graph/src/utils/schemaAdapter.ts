import type { SchemaMeta } from "./schemaMeta";
import type { Column } from "@moorestech/mooreseditor-plugin-sdk";

/**
 * Create a record updater function for a specific record in jsonData.
 * Works generically with any data array schema (items, blocks, craftRecipes, etc.)
 */
export function createRecordUpdater(
  meta: SchemaMeta,
  guidValue: string,
  setJsonData: React.Dispatch<React.SetStateAction<Column[]>>,
  onMarkDirty: () => void,
): (newRecordData: any) => void {
  return (newRecordData: any) => {
    setJsonData((prev) => {
      const colIdx = prev.findIndex((c) => c.title === meta.schemaId);
      if (colIdx === -1 || !meta.guidField) return prev;
      const newColumns = [...prev];
      const col = { ...newColumns[colIdx] };
      const dataArray = [...(col.data?.[meta.dataArrayPath] || [])];
      const recordIdx = dataArray.findIndex(
        (r: any) => r[meta.guidField!] === guidValue,
      );
      if (recordIdx === -1) return prev;
      dataArray[recordIdx] = newRecordData;
      col.data = { ...col.data, [meta.dataArrayPath]: dataArray };
      newColumns[colIdx] = col;
      return newColumns;
    });
    onMarkDirty();
  };
}
