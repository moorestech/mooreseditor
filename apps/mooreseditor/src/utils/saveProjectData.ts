import * as path from "@tauri-apps/api/path";
import { exists, mkdir, writeTextFile } from "@tauri-apps/plugin-fs";

import type { Column } from "../hooks/useJson";
import type { NodeGraphFile } from "../nodeEditor/types/nodeGraph";

interface SaveProjectDataParams {
  columns: Column[];
  nodeGraphData?: NodeGraphFile | null;
  projectDir: string | null;
  masterDir: string | null;
  onSuccess: () => void;
}

export async function saveProjectData({
  columns,
  nodeGraphData,
  projectDir,
  masterDir,
  onSuccess,
}: SaveProjectDataParams): Promise<void> {
  if (!columns.length || !projectDir) {
    console.error("保存に必要な情報が不足しています");
    return;
  }

  if (projectDir === "SampleProject") {
    console.log("サンプルプロジェクトのため、保存はスキップされました");
    columns.forEach((column) => {
      console.log(`${column.title}:`, JSON.stringify({ data: column.data }, null, 2));
    });
    if (nodeGraphData) {
      console.log("nodeGraph:", JSON.stringify(nodeGraphData, null, 2));
    }
    onSuccess();
    return;
  }

  const errors: string[] = [];

  for (const column of columns) {
    try {
      if (!masterDir) {
        errors.push(`${column.title}.json: Master directory is not set.`);
        continue;
      }

      const jsonFilePath = await path.join(masterDir, `${column.title}.json`);
      await writeTextFile(jsonFilePath, JSON.stringify(column.data, null, 2));
      console.log(`データが保存されました: ${jsonFilePath}`);
    } catch (error) {
      errors.push(`${column.title}.json: ${error}`);
    }
  }

  if (nodeGraphData) {
    try {
      const mooreseditorDir = await path.join(projectDir, ".mooreseditor");
      const isDirExists = await exists(mooreseditorDir);
      if (!isDirExists) {
        await mkdir(mooreseditorDir, { recursive: true });
      }

      const nodeGraphPath = await path.join(mooreseditorDir, "nodeGraph.v1.json");
      await writeTextFile(nodeGraphPath, JSON.stringify(nodeGraphData, null, 2));
      console.log(`nodeGraphが保存されました: ${nodeGraphPath}`);
    } catch (error) {
      errors.push(`nodeGraph: ${error}`);
    }
  }

  if (errors.length === 0) {
    onSuccess();
    return;
  }

  console.error("保存中にエラー:", errors);
}
