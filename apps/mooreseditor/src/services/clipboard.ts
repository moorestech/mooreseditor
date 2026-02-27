/**
 * Clipboard service.
 *
 * Provides raw clipboard read/write and JSON validation.
 * The React hooks (useCopyPaste, useClipboardAppend) remain in features layer.
 */

import { schemaToZod } from "../domain/schema/schemaToZod";

import type { Schema } from "../domain/schema/types";

export interface ClipboardData {
  value: unknown;
  schema?: { type: Schema };
}

/**
 * Write a value to the clipboard as JSON.
 */
export async function writeToClipboard(
  value: unknown,
  schema: Schema,
): Promise<void> {
  const json = JSON.stringify({ value, schema: { type: schema } }, null, 2);
  await navigator.clipboard.writeText(json);
}

/**
 * Read and parse JSON from the clipboard.
 * Returns null if clipboard is empty.
 * Throws if content is not valid JSON.
 */
export async function readFromClipboard(): Promise<ClipboardData | null> {
  const text = await navigator.clipboard.readText();
  if (!text) return null;

  const parsed = JSON.parse(text) as Record<string, unknown>;
  const value = parsed.value !== undefined ? parsed.value : parsed;

  return { value, schema: parsed.schema as ClipboardData["schema"] };
}

/**
 * Validate clipboard data against a schema.
 */
export function validateClipboardData(
  data: unknown,
  schema: Schema,
): { success: true; data: unknown } | { success: false; error: string } {
  const zodSchema = schemaToZod(schema);
  const result = zodSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const firstError = result.error.errors[0];
  const errorMessage = firstError?.message || "不明なエラー";
  const errorPath = firstError?.path?.join(".") || "";
  const fullMessage = errorPath
    ? `${errorPath}: ${errorMessage}`
    : errorMessage;

  return { success: false, error: fullMessage };
}
