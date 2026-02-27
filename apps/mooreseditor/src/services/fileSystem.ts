/**
 * Tauri file system abstraction with try-catch dev fallback.
 *
 * Production code runs first; on failure the dev fallback is invoked.
 * No `isDev` flag — follows CLAUDE.md try-catch convention.
 */

import type { JsonValue } from "../domain/data/types";

export interface DirectoryEntry {
  name: string;
  isDirectory: boolean;
}

/**
 * Read a text file by absolute path.
 * Production: Tauri readTextFile. Fallback: fetch from Vite dev server.
 */
export async function readText(absolutePath: string): Promise<string> {
  try {
    const { readTextFile } = await import("@tauri-apps/plugin-fs");
    return await readTextFile(absolutePath);
  } catch {
    // Dev fallback: serve via Vite dev server
    const response = await fetch(absolutePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${absolutePath}: ${response.status}`);
    }
    return response.text();
  }
}

/**
 * Write a text file by absolute path.
 * Production: Tauri writeTextFile. Fallback: dev server API.
 */
export async function writeText(
  absolutePath: string,
  content: string,
): Promise<void> {
  try {
    const { writeTextFile } = await import("@tauri-apps/plugin-fs");
    await writeTextFile(absolutePath, content);
  } catch {
    const res = await fetch("/api/dev-fs/write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: absolutePath, content }),
    });
    if (!res.ok) {
      throw new Error(`Dev FS write failed: ${res.status}`);
    }
  }
}

/**
 * Check if a file or directory exists.
 * Production: Tauri exists(). Fallback: always returns false in dev.
 */
export async function pathExists(absolutePath: string): Promise<boolean> {
  try {
    const { exists } = await import("@tauri-apps/plugin-fs");
    return await exists(absolutePath);
  } catch {
    return false;
  }
}

/**
 * Create a directory (recursive).
 * Production: Tauri mkdir. Fallback: no-op in dev.
 */
export async function ensureDir(absolutePath: string): Promise<void> {
  try {
    const { mkdir } = await import("@tauri-apps/plugin-fs");
    await mkdir(absolutePath, { recursive: true });
  } catch {
    // Dev environment: no-op
  }
}

/**
 * List entries in a directory.
 * Production: Tauri readDir. Fallback: empty array in dev.
 */
export async function listDir(absolutePath: string): Promise<DirectoryEntry[]> {
  try {
    const { readDir } = await import("@tauri-apps/plugin-fs");
    const entries = await readDir(absolutePath);
    return entries
      .filter((e) => !!e.name)
      .map((e) => ({
        name: e.name!,
        isDirectory: e.isDirectory,
      }));
  } catch {
    return [];
  }
}

/**
 * Join path segments using Tauri path API.
 * Fallback: simple "/" join for dev.
 */
export async function joinPath(...segments: string[]): Promise<string> {
  try {
    const pathApi = await import("@tauri-apps/api/path");
    return await pathApi.join(...segments);
  } catch {
    return segments.join("/");
  }
}

/**
 * Resolve a path relative to a base directory.
 * Fallback: simple concatenation for dev.
 */
export async function resolvePath(
  base: string,
  relative: string,
): Promise<string> {
  try {
    const pathApi = await import("@tauri-apps/api/path");
    return await pathApi.resolve(base, relative);
  } catch {
    return `${base}/${relative}`;
  }
}

/**
 * Read and parse a JSON file.
 */
export async function readJson(absolutePath: string): Promise<JsonValue> {
  const content = await readText(absolutePath);
  return JSON.parse(content) as JsonValue;
}

/**
 * Write an object as formatted JSON.
 */
export async function writeJson(
  absolutePath: string,
  data: JsonValue,
): Promise<void> {
  await writeText(absolutePath, JSON.stringify(data, null, 2));
}

/**
 * Add a directory to Tauri FS scope.
 * No-op in dev environment.
 */
export async function addToScope(dirPath: string): Promise<void> {
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    await invoke("add_project_to_scope", { projectPath: dirPath });
  } catch {
    // Dev environment or scope addition not available
  }
}

/**
 * Open a directory picker dialog.
 * Returns the selected path, or null if cancelled.
 */
export async function openDirectoryDialog(): Promise<string | null> {
  try {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const result = await open({ directory: true });
    return result as string | null;
  } catch {
    return null;
  }
}
