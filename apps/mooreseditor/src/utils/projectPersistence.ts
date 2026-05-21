import { invoke } from "@tauri-apps/api/core";
import * as path from "@tauri-apps/api/path";
import { exists, mkdir, writeTextFile } from "@tauri-apps/plugin-fs";

import type { Column } from "../hooks/useJson";

export interface ProjectExtraFile {
  path: string;
  content: string;
}

export interface SaveProjectFilesParams {
  projectDir: string | null;
  masterDir: string | null;
  columns: Column[];
  extraFiles?: ProjectExtraFile[];
}

function stringifyError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function validateRelativePath(relativePath: string): void {
  if (relativePath.startsWith("/")) {
    throw new Error(
      `Invalid relativePath (must not be absolute): ${relativePath}`,
    );
  }
  const segments = relativePath.split("/").filter((s) => s.length > 0);
  if (segments.length === 0) {
    throw new Error(`Invalid relativePath (empty): ${relativePath}`);
  }
  if (segments.includes("..")) {
    throw new Error(
      `Invalid relativePath (path traversal '..' not allowed): ${relativePath}`,
    );
  }
}

async function writeViaDevServer(
  relativePath: string,
  content: string,
): Promise<void> {
  const res = await fetch("/api/dev-fs/write", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: relativePath, content }),
  });
  if (!res.ok) {
    throw new Error(`Dev FS write failed: ${res.status}`);
  }
}

function deriveMasterRelativeDir(
  projectDir: string,
  masterDir: string | null,
): string {
  if (!masterDir) {
    return "master";
  }
  const normalizedProject = projectDir.replace(/[/\\]+$/, "");
  for (const sep of ["/", "\\"]) {
    const prefix = `${normalizedProject}${sep}`;
    if (masterDir.startsWith(prefix)) {
      return masterDir.slice(prefix.length).split("\\").join("/");
    }
  }
  return "master";
}

async function resolveAndPrepareDir(
  projectDir: string,
  relativePath: string,
): Promise<string> {
  const segments = relativePath.split("/").filter((s) => s.length > 0);
  const dirSegments = segments.slice(0, -1);
  let currentDir = projectDir;

  for (const segment of dirSegments) {
    currentDir = await path.join(currentDir, segment);
    if (segment.startsWith(".")) {
      try {
        await invoke("add_project_to_scope", { projectPath: currentDir });
      } catch {
        // dev/browser fallback path
      }
    }
    if (!(await exists(currentDir))) {
      await mkdir(currentDir, { recursive: true });
    }
  }

  return path.join(currentDir, ...segments.slice(-1));
}

async function writeProjectFile(
  absolutePath: string,
  devRelativePath: string,
  content: string,
): Promise<void> {
  try {
    await writeTextFile(absolutePath, content);
  } catch (error) {
    try {
      await writeViaDevServer(devRelativePath, content);
    } catch {
      throw error;
    }
  }
}

/**
 * Saves master columns and optional plugin files as one host-owned save request.
 *
 * The host validates every target before writing and rejects the whole request
 * before the first write if any target path is invalid. Files are then written
 * sequentially. This is not a filesystem-atomic transaction across multiple
 * files.
 */
export async function saveProjectFiles({
  projectDir,
  masterDir,
  columns,
  extraFiles = [],
}: SaveProjectFilesParams): Promise<void> {
  if (!projectDir) {
    throw new Error("saveProject: projectDir is not set");
  }
  if (!masterDir) {
    throw new Error("saveProject: masterDir is not set");
  }

  for (const file of extraFiles) {
    validateRelativePath(file.path);
  }

  const masterRelativeDir = deriveMasterRelativeDir(projectDir, masterDir);
  const writes: { absolutePath: string; relativePath: string; content: string }[] =
    [];

  for (const column of columns) {
    const fileName = `${column.title}.json`;
    writes.push({
      absolutePath: await path.join(masterDir, fileName),
      relativePath: `${masterRelativeDir}/${fileName}`,
      content: JSON.stringify(column.data, null, 2),
    });
  }

  for (const file of extraFiles) {
    writes.push({
      absolutePath: await resolveAndPrepareDir(projectDir, file.path),
      relativePath: file.path,
      content: file.content,
    });
  }

  const errors: string[] = [];
  for (const file of writes) {
    try {
      await writeProjectFile(file.absolutePath, file.relativePath, file.content);
    } catch (error) {
      errors.push(`${file.relativePath}: ${stringifyError(error)}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`saveProject failed: ${errors.join("; ")}`);
  }
}
