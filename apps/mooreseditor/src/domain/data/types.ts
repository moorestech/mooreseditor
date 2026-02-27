/**
 * Domain types for JSON data handling.
 * Replaces `any` with strict JSON-compatible types.
 */

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export interface JsonObject {
  [key: string]: JsonValue;
}
export type JsonArray = JsonValue[];

/**
 * A named data column (one loaded JSON file).
 * `data` is typed as `JsonValue` instead of `any`.
 */
export interface Column {
  title: string;
  data: JsonValue;
}

/**
 * Immutably update a column's nested data at the given path.
 *
 * Unifies the duplicate logic previously in EditorView's
 * TableView.onDataChange and FormView.onDataChange.
 *
 * @param columns  Current column array
 * @param schemaTitle  Title of the column to update
 * @param path  Key path to the nested value (empty = root)
 * @param newData  New value to set
 * @returns New column array with the update applied, or the original if target not found
 */
export function updateColumnAtPath(
  columns: Column[],
  schemaTitle: string,
  path: string[],
  newData: JsonValue,
): Column[] {
  const targetIndex = columns.findIndex((item) => item.title === schemaTitle);
  if (targetIndex === -1) return columns;

  const updatedColumns = [...columns];
  const updatedItem = { ...updatedColumns[targetIndex] };

  if (path.length === 0) {
    updatedItem.data = newData;
  } else {
    // Immutably copy each level along the path
    updatedItem.data = shallowCopyValue(updatedItem.data);
    let ref = updatedItem.data as JsonObject;

    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      ref[key] = shallowCopyValue(ref[key]);
      ref = ref[key] as JsonObject;
    }

    ref[path[path.length - 1]] = newData;
  }

  updatedColumns[targetIndex] = updatedItem;
  return updatedColumns;
}

/**
 * Shallow-copy a JsonValue, preserving arrays vs objects.
 */
function shallowCopyValue(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return [...value];
  if (value !== null && typeof value === "object") return { ...value };
  return value;
}

/**
 * Narrow a JsonValue to JsonObject, returning undefined for non-objects.
 */
export function asJsonObject(
  value: JsonValue | undefined,
): JsonObject | undefined {
  if (
    value !== null &&
    value !== undefined &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value;
  }
  return undefined;
}

/**
 * Navigate into a JsonValue by following the given key path.
 * Returns `undefined` if any segment is missing.
 */
export function getValueAtPath(
  data: JsonValue,
  path: string[],
): JsonValue | undefined {
  let ref: JsonValue = data;
  for (const key of path) {
    if (ref === null || typeof ref !== "object") return undefined;
    if (Array.isArray(ref)) {
      const index = Number(key);
      if (Number.isNaN(index) || index < 0 || index >= ref.length)
        return undefined;
      ref = ref[index];
    } else {
      if (!(key in ref)) return undefined;
      ref = ref[key];
    }
  }
  return ref;
}
