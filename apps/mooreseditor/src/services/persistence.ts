/**
 * Persistence service.
 *
 * Saves column data and node graph data to disk.
 * Production: Tauri FS. Fallback: dev server API + console output.
 */

import {
  writeText,
  pathExists,
  ensureDir,
  joinPath,
  addToScope,
} from "./fileSystem";
import { writeViaDevServer } from "./devFileSystem";

import type { Column, JsonValue } from "../domain/data/types";
import type { NodeGraphFile } from "../domain/nodeGraph/types";

export interface SaveParams {
  columns: Column[];
  nodeGraphData?: NodeGraphFile | null;
  projectDir: string | null;
  masterDir: string | null;
}

export interface SaveResult {
  success: boolean;
  errors: string[];
}

/**
 * Save all project data (columns + optional node graph).
 */
export async function saveProjectData(params: SaveParams): Promise<SaveResult> {
  const { columns, nodeGraphData, projectDir, masterDir } = params;

  if (!columns.length || !projectDir) {
    return { success: false, errors: ["保存に必要な情報が不足しています"] };
  }

  // Sample project: log to console + optionally write via dev server
  if (projectDir === "SampleProject") {
    return await saveSampleProject(columns, nodeGraphData);
  }

  return await saveToFileSystem(columns, nodeGraphData, projectDir, masterDir);
}

async function saveSampleProject(
  columns: Column[],
  nodeGraphData?: NodeGraphFile | null,
): Promise<SaveResult> {
  console.log("サンプルプロジェクトのため、保存はスキップされました");

  for (const column of columns) {
    console.log(
      `${column.title}:`,
      JSON.stringify({ data: column.data }, null, 2),
    );
  }
  if (nodeGraphData) {
    console.log("nodeGraph:", JSON.stringify(nodeGraphData, null, 2));
  }

  // Also write via dev server for E2E verification
  try {
    for (const column of columns) {
      await writeViaDevServer(
        `master/${column.title}.json`,
        JSON.stringify(column.data, null, 2),
      );
    }
    if (nodeGraphData) {
      await writeViaDevServer(
        ".mooreseditor/nodeGraph.v1.json",
        JSON.stringify(nodeGraphData, null, 2),
      );
    }
  } catch {
    // Dev server API not available — ignore
  }

  return { success: true, errors: [] };
}

async function saveToFileSystem(
  columns: Column[],
  nodeGraphData: NodeGraphFile | null | undefined,
  projectDir: string,
  masterDir: string | null,
): Promise<SaveResult> {
  const errors: string[] = [];

  // Save column data
  for (const column of columns) {
    try {
      if (!masterDir) {
        errors.push(`${column.title}.json: Master directory is not set.`);
        continue;
      }

      const jsonFilePath = await joinPath(masterDir, `${column.title}.json`);
      await writeText(
        jsonFilePath,
        JSON.stringify(column.data as JsonValue, null, 2),
      );
      console.log(`データが保存されました: ${jsonFilePath}`);
    } catch (error) {
      errors.push(`${column.title}.json: ${error}`);
    }
  }

  // Save node graph data
  if (nodeGraphData) {
    try {
      const mooreseditorDir = await joinPath(projectDir, ".mooreseditor");
      await addToScope(mooreseditorDir);

      const dirExists = await pathExists(mooreseditorDir);
      if (!dirExists) {
        await ensureDir(mooreseditorDir);
      }

      const nodeGraphPath = await joinPath(
        mooreseditorDir,
        "nodeGraph.v1.json",
      );
      await writeText(nodeGraphPath, JSON.stringify(nodeGraphData, null, 2));
      console.log(`nodeGraphが保存されました: ${nodeGraphPath}`);
    } catch (error) {
      errors.push(`nodeGraph: ${error}`);
    }
  }

  return { success: errors.length === 0, errors };
}
